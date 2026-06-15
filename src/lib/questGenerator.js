// ============================================================
// QUEST GENERATOR v4 — Etappe 5 (Signal-Aware)
// Scoring-basiertes System mit Signal-Integration:
//   Active Goals:        35%
//   Recent Behavior:     30%
//   Explicit Interests:  20%
//   Signal/Path Level:   10%
//   Balance Need:         5%
//
// Sichtbare Menge begrenzt:
//   Daily personalized:  3–5
//   Weekly personalized: 2–3
//   Recovery:            max 2
//   Schwache Signale:    nur neutrale Quests
//   Starke Signale:      spezifische Quests + Gates
//
// Keine externe KI/API. Alles lokal, regelbasiert.
// ============================================================
import { QUEST_TEMPLATES }            from "../data/questTemplates.js";
import { INTERESTS, normalizeInterests } from "../data/interests.js";
import { PATHS }                       from "../data/paths.js";
import { catToDomain }                 from "../data/domains.js";
import { calculatePathSignal, calculatePathSpecializationLevel, getTopSignalPaths } from "./signals.js";

// ── XP-Multiplikatoren ─────────────────────────────────────
const LENGTH_SCALE = { short: 0.7, medium: 1.0, long: 1.35 };
const DIFF_SCALE   = { easy: 0.75, normal: 1.0, hard: 1.3 };

// ── Domain-Gruppe → Template-Variable ──────────────────────
// Mappt Interest-Gruppen auf die Variable, die QUEST_TEMPLATES nutzen.
// Gruppen ohne eigenen Eintrag werden über generische Templates abgedeckt.
const GROUP_TO_VAR = {
  mind:        "interest_mind",
  tech:        "interest_tech",
  creative:    "interest_creative",
  craft:       "interest_kitchen",
  body:        "interest_fitness",
  // Alle anderen Gruppen: generisches Fallback über domain-Matching
  // (social, career, discipline, recovery, adventure, service, leadership,
  //  finance, home, appearance — werden über topic-freie Templates abgedeckt)
};

// ── Gewichtungen (Summe = 1.0) ──────────────────────────────
const W = {
  goal:     0.34,  // Active goal match — highest priority
  behavior: 0.29,  // Recent behavior — stronger than manual selection
  interest: 0.19,  // Explicit interest selection
  signal:   0.10,  // Signal/path level (from signal system)
  balance:  0.08,  // Balance need for neglected domains (Breite-Nudge, < signal)
};

// Signal level → quest specificity threshold
// 0: no personalized quests (only starters)
// 1: light personalization (generic templates)
// 2: specific quests for this path/interest
// 3: specific quests + gate/trial hints
const SIGNAL_SPECIFICITY = { 0: 0, 1: 0.3, 2: 0.6, 3: 1.0 };

// Max visible personalized quests per signal level
// Etappe 6 — Sichtbarkeits-Limits nach Signal-Level (Sprint: Daily 3–5, Weekly 2–3).
// WICHTIG: Level 0 = neuer Nutzer → bekommt 3 neutrale Dailies + 2 Weeklies.
// (Vorher 0/0 — neuer Nutzer sah gar keine Quests.)
const MAX_DAILY_BY_SIGNAL        = { 0: 3, 1: 4, 2: 4, 3: 5 };
const MAX_WEEKLY_BY_SIGNAL       = { 0: 2, 1: 2, 2: 3, 3: 3 };
const MAX_PERSONALIZED_BY_SIGNAL = { 0: 0, 1: 2, 2: 3, 3: 5 };

// ══════════════════════════════════════════════════════════
// Hilfsfunktionen
// ══════════════════════════════════════════════════════════

function resolveVars(template, topicLabel, preferredLength) {
  const vars = template.variables || {};
  const resolved = {};
  const idx = preferredLength === "short" ? 0 : preferredLength === "long" ? 2 : 1;
  if (vars.duration) resolved.duration = vars.duration[Math.min(idx, vars.duration.length - 1)];
  if (vars.count)    resolved.count    = vars.count[Math.min(idx, vars.count.length - 1)];
  if (vars.distance) resolved.distance = vars.distance[Math.min(idx, vars.distance.length - 1)];
  if (vars.topic)    resolved.topic    = topicLabel || "Thema";
  return resolved;
}

function applyTemplate(tmpl, vars) {
  return tmpl.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : `{${key}}`
  );
}

function calcXp(baseXp, preferredLength, difficulty = "normal") {
  return Math.round(baseXp * (LENGTH_SCALE[preferredLength] || 1.0) * (DIFF_SCALE[difficulty] || 1.0));
}

/**
 * Baut ein Quest-Objekt aus Template + Context.
 */
function buildQuest({ template, topicLabel, interestId, domain, interestPaths, pathSet, preferredLength, difficulty, reason, goalId }) {
  const vars  = resolveVars(template, topicLabel, preferredLength);
  const title = applyTemplate(template.titleTemplate, vars);
  const desc  = applyTemplate(template.descTemplate,  vars);
  const xp    = calcXp(template.baseXp, preferredLength, difficulty);
  const path  = interestPaths?.find(p => pathSet?.has(p)) || template.paths[0] || null;
  const interest = interestId ? INTERESTS[interestId] : null;
  const stat  = interest?.relatedStats?.[0] || "END";

  return {
    id:           `pq_${template.id}${interestId ? "_" + interestId : ""}_${preferredLength}`,
    title, desc, xp,
    stat, statPts: 0,
    type:         template.type || "daily",
    actionType:   template.actionType || "action",
    cat:          template.domain,
    domain:       domain || template.domain,
    path,
    topic:        topicLabel || null,
    interestId:   interestId || null,
    goalId:       goalId || null,
    personalized: true,
    source:       "generated",
    recommended:  false,
    reason,
    track:        template.track || null,
  };
}

/**
 * Analysiert die letzten N Tage der Quest-History und gibt
 * Verhaltensdaten zurück (häufige Domains, Interests, actionTypes).
 */
function analyzeHistory(questHistory, days = 14) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recent = (questHistory || []).filter(h =>
    h.completedAt && new Date(h.completedAt) >= cutoff
  );

  const domainCounts   = {};
  const interestCounts = {};
  const actionTypeCounts = {};

  for (const q of recent) {
    const d = q.domain || catToDomain(q.cat) || "misc";
    domainCounts[d] = (domainCounts[d] || 0) + 1;
    if (q.interestId) interestCounts[q.interestId] = (interestCounts[q.interestId] || 0) + 1;
    if (q.actionType) actionTypeCounts[q.actionType] = (actionTypeCounts[q.actionType] || 0) + 1;
  }

  // Top domains the user actually completes
  const topDomains = Object.entries(domainCounts)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 5)
    .map(([k]) => k);

  // Top interests actually completed
  const topInterests = Object.entries(interestCounts)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 5)
    .map(([k]) => k);

  return { domainCounts, interestCounts, actionTypeCounts, topDomains, topInterests, recentCount: recent.length };
}

/**
 * Berechnet einen Score für einen Quest-Kandidaten basierend auf dem Kontext.
 * Score 0.0–1.0, höher = besser.
 * Integriert Signal-Level für Spezifizitäts-Schwelle.
 */
function scoreQuestCandidate(candidate, context) {
  const {
    activeGoals        = [],
    selectedInterests  = [],
    activePaths        = new Set(),
    affinities         = {},
    behavior           = {},
    neglectedDomains   = [],
    recentlyDoneIds    = new Set(),
    signalScores       = {},  // pathId → signal score (from signal system)
  } = context;

  // Don't re-score already selected quests
  if (recentlyDoneIds.has(candidate.id)) return -1;

  let score = 0;

  const { domain, interestId, path, goalId, template } = candidate;

  // ── 1. Goal match (35%) ──────────────────────────────────
  if (activeGoals.length > 0) {
    const goalMatchCount = activeGoals.filter(g =>
      g.domain === domain ||
      (g.path && path && g.path === path) ||
      (goalId && g.id === goalId)
    ).length;
    score += W.goal * Math.min(goalMatchCount / activeGoals.length, 1.0);
  }

  // ── 2. Behavior match (30%) ─────────────────────────────
  const { domainCounts = {}, interestCounts = {}, recentCount = 0 } = behavior;
  if (recentCount > 0) {
    const domainFreq   = (domainCounts[domain]     || 0) / Math.max(recentCount, 1);
    const interestFreq = interestId
      ? (interestCounts[interestId] || 0) / Math.max(recentCount, 1)
      : 0;
    score += W.behavior * Math.max(domainFreq, interestFreq);
  }

  // ── 3. Interest match (20%) ─────────────────────────────
  if (selectedInterests.length > 0) {
    const interestIdx = selectedInterests.indexOf(interestId);
    if (interestIdx !== -1) {
      const positionalBoost = 1 - (interestIdx / selectedInterests.length) * 0.3;
      score += W.interest * positionalBoost;
    } else if (domain && selectedInterests.some(id => INTERESTS[id]?.domain === domain)) {
      score += W.interest * 0.5;
    }
  }

  // ── 4. Signal-Level boost (10%) ────────────────────────
  // Uses real signal scores instead of affinity points alone
  if (path) {
    const rawSignal  = signalScores[path] || 0;
    const normalized = Math.min(rawSignal / 20, 1.0);  // normalize to 0-1
    if (activePaths.has(path)) {
      score += W.signal * (0.5 + normalized * 0.5);
    } else if (normalized > 0) {
      // Path has signal even if not explicitly active
      score += W.signal * normalized * 0.6;
    }
  } else if (template?.paths) {
    // Template's possible paths — use best signal
    const bestSignal = Math.max(...(template.paths.map(p => signalScores[p] || 0)));
    if (bestSignal > 0) score += W.signal * Math.min(bestSignal / 20, 1.0) * 0.4;
  }

  // ── 5. Balance need (5%) ────────────────────────────────
  if (neglectedDomains.includes(domain)) {
    score += W.balance;
  }

  return Math.min(score, 1.0);
}

// ══════════════════════════════════════════════════════════
// MAIN: generatePersonalizedQuests
// ══════════════════════════════════════════════════════════

/**
 * Generiert 3–8 personalisierte Quests via Scoring-System.
 *
 * @param {object} preferences  - state.player.preferences
 * @param {object} [context]    - { goals, questHistory, affinities, currentStreak, neglectedDomains }
 * @param {number} [maxQuests]  - max total quests (default 8)
 */
export function generatePersonalizedQuests(preferences, context = {}, maxQuests = 8) {
  const {
    goals            = [],
    questHistory     = [],
    affinities       = {},
    currentStreak    = 0,
    neglectedDomains = [],
    // Full state for signal system (optional — graceful fallback)
    progressLogs     = [],
    stats            = {},
    gateProgress     = {},
  } = context;

  // Build minimal state object for signal calculation
  const _stateForSignal = {
    questHistory,
    progressLogs,
    goals,
    player: {
      preferences,
      affinities: affinities || {},
    },
    stats,
    gateProgress,
  };

  const rawInterests    = preferences?.interests            || [];
  const activePaths     = preferences?.activePaths          || [];
  const preferredLength = preferences?.preferredQuestLength || "medium";
  const difficulty      = preferences?.difficulty           || "normal";
  const balanceAreas    = preferences?.balanceAreas         || [];
  const mainPath        = preferences?.mainPath             || null;
  const secondaryPath   = preferences?.secondaryPath        || null;

  const interests = normalizeInterests(rawInterests);

  if (interests.length === 0 && activePaths.length === 0) return [];

  // Build context objects
  const pathSet     = new Set([...activePaths, mainPath, secondaryPath].filter(Boolean));
  const activeGoals = goals.filter(g => g?.status === "active");

  // Analyze user behavior from history
  const behavior = analyzeHistory(questHistory, 14);
  const hasHistory = behavior.recentCount >= 5;

  // ── Signal computation ───────────────────────────────────
  // Calculate signal scores for all paths (0 = no signal)
  let signalScores = {};
  let dominantSignalLevel = 0;
  let topSignalPath = null;
  try {
    const topPaths = getTopSignalPaths(_stateForSignal, 5);
    for (const sp of topPaths) {
      signalScores[sp.pathId] = sp.score;
    }
    if (topPaths.length > 0) {
      dominantSignalLevel = topPaths[0].level;   // 0-3
      topSignalPath       = topPaths[0].pathId;
    }
  } catch(_) {}

  // Limit personalized quests based on signal level
  const effectiveMaxDaily  = Math.min(maxQuests, MAX_DAILY_BY_SIGNAL[dominantSignalLevel]  ?? 5);
  const effectiveMaxWeekly = Math.min(maxQuests, MAX_WEEKLY_BY_SIGNAL[dominantSignalLevel] ?? 3);
  const effectiveMax = effectiveMaxDaily + effectiveMaxWeekly;

  // If no signals at all, generate starters instead
  if (dominantSignalLevel === 0 && interests.length === 0 && activePaths.length === 0) {
    return generateStarterQuests(preferredLength);
  }

  // Determine effective neglected domains
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentDomains = new Set(
    (questHistory || [])
      .filter(h => h.completedAt && new Date(h.completedAt) > sevenDaysAgo)
      .map(h => h.domain || catToDomain(h.cat))
      .filter(Boolean)
  );

  const effectiveNeglected = neglectedDomains.length > 0 ? neglectedDomains :
    balanceAreas.filter(d => !recentDomains.has(d));

  // Build topic map from interests
  const topicMap = {};
  for (const interestId of interests) {
    const info = INTERESTS[interestId];
    if (!info) continue;
    const group = GROUP_TO_VAR[info.group] || `interest_${info.group}`;
    if (!topicMap[group]) topicMap[group] = [];
    topicMap[group].push({
      label:      info.questTopic || info.label,
      interestId,
      domain:     info.domain,
      paths:      info.relatedPaths,
    });
  }

  // ── Generate all candidates ─────────────────────────────
  const candidates = [];
  const usedKeys   = new Set();

  // If user has behavior, weight it higher — interests become secondary
  const interestWeight = hasHistory ? 0.6 : 1.0;
  const behaviorWeight = hasHistory ? 1.0 : 0.3;

  for (const template of QUEST_TEMPLATES) {
    const hasTopicVar = Object.values(template.variables || {})
      .some(v => typeof v === "string" && v.startsWith("interest_"));

    const templateGroups = hasTopicVar
      ? Object.entries(template.variables || {})
          .filter(([, v]) => typeof v === "string" && v.startsWith("interest_"))
          .map(([, v]) => v)
      : [];

    if (!hasTopicVar) {
      // Template doesn't need a topic (e.g. running, training)
      // Score it for each active goal + default
      const key = template.id + "_notopic";
      if (usedKeys.has(key)) continue;

      for (const goal of activeGoals.slice(0, 3)) {
        const domainMatch = template.domain === goal.domain || goal.path && template.paths.includes(goal.path);
        if (!domainMatch) continue;
        const q = buildQuest({
          template, topicLabel: null, interestId: null,
          domain: template.domain, interestPaths: [], pathSet,
          preferredLength, difficulty,
          reason: `wegen Ziel: ${goal.title}`,
          goalId: goal.id,
        });
        q._templateRef = template;
        candidates.push({ quest: q, goalLinked: true });
      }

      // Also add as standalone — generisch oder wenn Signal/Interest/Neglect passt
      const interestMatchesDomain = interests.some(id => {
        const info = INTERESTS[id];
        return info && (info.domain === template.domain || info.relatedPaths?.some(p => template.paths.includes(p)));
      });
      const signalMatchesDomain = Object.keys(signalScores).some(p =>
        signalScores[p] > 0 && template.paths.includes(p)
      );
      const shouldAddStandalone =
        !activeGoals.length ||
        template.paths.some(p => pathSet.has(p)) ||
        effectiveNeglected.includes(template.domain) ||
        interestMatchesDomain ||
        signalMatchesDomain;

      if (shouldAddStandalone) {
        const matchedPath = template.paths.find(p => pathSet.has(p) || signalScores[p] > 0);
        const pathName = matchedPath ? (PATHS[matchedPath]?.name || matchedPath) : null;
        const q = buildQuest({
          template, topicLabel: null, interestId: null,
          domain: template.domain, interestPaths: [], pathSet,
          preferredLength, difficulty,
          reason: pathSet.has(matchedPath) ? `dein ${pathName} Path wächst`
               : signalMatchesDomain       ? `${pathName || "System"} Signal aktiv`
               : effectiveNeglected.includes(template.domain) ? `Balance empfohlen: ${template.domain}`
               : "System Balance",
        });
        q._templateRef = template;
        candidates.push({ quest: q, goalLinked: false });
      }

      usedKeys.add(key);
      continue;
    }

    // Template needs a topic variable
    for (const group of templateGroups) {
      const topics = topicMap[group] || [];

      for (const { label, interestId, domain, paths } of topics) {
        const key = `${template.id}_${interestId}`;
        if (usedKeys.has(key)) continue;

        // Goal-linked version
        for (const goal of activeGoals.slice(0, 3)) {
          if (goal.domain !== domain && !(goal.path && paths.includes(goal.path))) continue;
          const q = buildQuest({
            template, topicLabel: label, interestId, domain,
            interestPaths: paths, pathSet, preferredLength, difficulty,
            reason: `wegen Ziel: ${goal.title}`,
            goalId: goal.id,
          });
          q._templateRef = template;
          candidates.push({ quest: q, goalLinked: true });
        }

        // Interest-driven version
        const interest = INTERESTS[interestId];
        let behaviorReason = `wegen Interesse: ${interest?.label || label}`;
        if (hasHistory && behavior.topInterests.includes(interestId)) {
          behaviorReason = `häufig erledigt: ${interest?.label || label}`;
        } else if (hasHistory && behavior.topDomains.includes(domain)) {
          behaviorReason = `aktiver Bereich: ${domain}`;
        }
        // Signal-aware reason override
        if (topSignalPath && paths?.includes(topSignalPath) && dominantSignalLevel >= 2) {
          const pathName = PATHS[topSignalPath]?.name || topSignalPath;
          behaviorReason = `dein ${pathName} Signal wächst · ${interest?.label || label}`;
        }

        const q = buildQuest({
          template, topicLabel: label, interestId, domain,
          interestPaths: paths, pathSet, preferredLength, difficulty,
          reason: behaviorReason,
        });
        q._templateRef = template;
        candidates.push({ quest: q, goalLinked: false });

        usedKeys.add(key);
      }
    }
  }

  // ── Score all candidates ────────────────────────────────
  const scoringContext = {
    activeGoals,
    selectedInterests:  interests,
    activePaths:        pathSet,
    affinities,
    signalScores,       // signal system scores
    behavior:           {
      ...behavior,
      domainCounts:   Object.fromEntries(
        Object.entries(behavior.domainCounts).map(([k,v]) => [k, v * behaviorWeight])
      ),
      interestCounts: Object.fromEntries(
        Object.entries(behavior.interestCounts).map(([k,v]) => [k, v * interestWeight])
      ),
    },
    neglectedDomains:   effectiveNeglected,
    recentlyDoneIds:    new Set(),
  };

  for (const c of candidates) {
    c.score = scoreQuestCandidate({ ...c.quest, template: c.quest._templateRef }, scoringContext);
    // Goal-linked quests get an inherent boost
    if (c.goalLinked && c.quest.goalId) c.score = Math.min(c.score + 0.35, 1.0);
  }

  // ── Select best candidates ──────────────────────────────
  candidates.sort((a, b) => b.score - a.score);

  const selected   = [];
  const usedIds    = new Set();
  const domainUsed = {};
  const goalUsed   = {};

  // Limits per category
  const MAX_PER_DOMAIN = 3;
  const MAX_PER_GOAL   = 2;
  const MAX_GOAL_TOTAL = Math.ceil(maxQuests * 0.4);   // max 40% goal-linked
  const MAX_NEGLECT    = 2;   // bis zu 2 Balance-Quests pro Set (Breite-Nudge)

  let goalLinkedCount = 0;
  let neglectCount    = 0;

  // Separate daily and weekly selection with signal-adjusted limits
  let dailyCount  = 0;
  let weeklyCount = 0;

  for (const { quest, goalLinked } of candidates) {
    const isWeekly = quest.type === "weekly";
    if (isWeekly  && weeklyCount  >= effectiveMaxWeekly) continue;
    if (!isWeekly && dailyCount   >= effectiveMaxDaily)  continue;
    if (selected.length >= Math.max(effectiveMax, 3)) break;
    if (usedIds.has(quest.id)) continue;
    if (quest.score < 0) continue;

    const dom = quest.domain || "misc";

    // Limit goal-linked per total
    if (goalLinked && goalLinkedCount >= MAX_GOAL_TOTAL) continue;
    // Limit per goal
    if (quest.goalId) {
      if ((goalUsed[quest.goalId] || 0) >= MAX_PER_GOAL) continue;
    }
    // Limit per domain
    if ((domainUsed[dom] || 0) >= MAX_PER_DOMAIN) continue;
    // Limit neglected domain quests
    if (effectiveNeglected.includes(dom)) {
      if (neglectCount >= MAX_NEGLECT) continue;
      quest.recommended = true;
      quest.reason = `Balance empfohlen: ${dom}`;
      neglectCount++;
    }

    // Clean up internal ref
    delete quest._templateRef;

    selected.push(quest);
    usedIds.add(quest.id);
    domainUsed[dom] = (domainUsed[dom] || 0) + 1;
    if (quest.goalId) goalUsed[quest.goalId] = (goalUsed[quest.goalId] || 0) + 1;
    if (goalLinked) goalLinkedCount++;
    if (quest.type === "weekly") weeklyCount++; else dailyCount++;
  }

  // ── Recovery Quest bei niedrigem Streak ────────────────
  if (currentStreak === 0 && selected.length < maxQuests) {
    const recoveryTemplate = QUEST_TEMPLATES.find(t =>
      t.domain === "recovery" && !usedIds.has(`pq_${t.id}_${preferredLength}`)
    );
    if (recoveryTemplate) {
      const q = buildQuest({
        template: recoveryTemplate, topicLabel: null, interestId: null,
        domain: "recovery", interestPaths: [], pathSet, preferredLength, difficulty,
        reason: "Recovery Protocol",
      });
      q.recommended = true;
      selected.push(q);
    }
  }

  return selected;
}

// ══════════════════════════════════════════════════════════
// getVisibleContent
// Trennt availableContent / recommendedContent / visibleContent.
// Sichtbare Menge bleibt immer machbar.
// ══════════════════════════════════════════════════════════

/**
 * Begrenzt die sichtbare Quest-Menge basierend auf Signal-Level.
 *
 * @param {object} pools         - { daily, weekly, personalized, recovery }
 * @param {object} state         - vollständiger State für Signal-Berechnung
 * @param {object} [opts]        - Optionen
 * @returns {object}             - { visibleDaily, visibleWeekly, visiblePersonalized, visibleRecovery, signalLevel, reason }
 */
export function getVisibleContent(pools, state = {}, opts = {}) {
  const {
    maxDaily        = 5,
    maxWeekly       = 3,
    maxPersonalized = 5,
    maxRecovery     = 2,
  } = opts;

  // Calculate dominant signal level
  let signalLevel = 0;
  let reason = "Kein Signal — allgemeine Quests";
  try {
    const topPaths = getTopSignalPaths(state, 3);
    if (topPaths.length > 0) {
      signalLevel = topPaths[0].level;
      const pathName = PATHS[topPaths[0].pathId]?.name || topPaths[0].pathId;
      const levelLabel = ["—", "schwach", "aktiv", "stark"][signalLevel] || "—";
      reason = `${pathName} Signal ${levelLabel} · ${topPaths[0].reason || ""}`;
    }
  } catch(_) {}

  // Adjust limits per signal level
  const visMaxDaily  = Math.min(maxDaily,        MAX_DAILY_BY_SIGNAL[signalLevel]  ?? maxDaily);
  const visMaxWeekly = Math.min(maxWeekly,       MAX_WEEKLY_BY_SIGNAL[signalLevel] ?? maxWeekly);
  const visMaxPers   = Math.min(maxPersonalized, MAX_PERSONALIZED_BY_SIGNAL[signalLevel] ?? maxPersonalized);

  return {
    visibleDaily:        (pools.daily        || []).slice(0, visMaxDaily),
    visibleWeekly:       (pools.weekly       || []).slice(0, visMaxWeekly),
    visiblePersonalized: (pools.personalized || []).slice(0, visMaxPers),
    visibleRecovery:     (pools.recovery     || []).slice(0, maxRecovery),
    signalLevel,
    reason,
    // Meta
    totalVisible:
      Math.min((pools.daily  || []).length, visMaxDaily)  +
      Math.min((pools.weekly || []).length, visMaxWeekly) +
      Math.min((pools.personalized || []).length, visMaxPers) +
      Math.min((pools.recovery || []).length, maxRecovery),
  };
}

// ═══════════════════════════════════════════════════════════
// selectNextMilestones — Etappe 6
// "Milestones: nur nächste relevante anzeigen."
// Wählt aus dem Katalog die nächsten offenen Milestones:
// niedrigster Rank zuerst, bevorzugt passend zu den stärksten
// Signal-Paths (Stats/Domains), max. `max` sichtbar.
// ═══════════════════════════════════════════════════════════
export function selectNextMilestones(allMilestones, state = {}, completedIds = new Set(), max = 3) {
  const open = (allMilestones || []).filter(m => !completedIds.has(m.id));
  if (open.length <= max) return open;

  // Relevanz: Stats/Domains der Top-Signal-Paths
  let prefStats = new Set();
  let prefDomains = new Set();
  try {
    for (const sp of getTopSignalPaths(state, 3)) {
      const p = PATHS[sp.pathId];
      for (const s of p?.stats   || []) prefStats.add(s);
      for (const d of p?.domains || []) prefDomains.add(d);
    }
  } catch (_) {}

  const scored = open.map((m, idx) => {
    let s = 0;
    if (prefStats.has(m.subStat || m.stat)) s += 2;
    if (prefDomains.has(m.domain) || prefDomains.has(m.cat)) s += 1;
    return { m, s, idx }; // idx erhält Rank-Reihenfolge (Katalog ist rank-sortiert)
  });
  // Erst Relevanz, dann Katalog-Reihenfolge (≈ niedrigster Rank zuerst)
  scored.sort((a, b) => (b.s - a.s) || (a.idx - b.idx));
  return scored.slice(0, max).map(e => e.m);
}

// ══════════════════════════════════════════════════════════
// Starter Quests — für Nutzer ohne Interessen
// Neutral, kein Thema bevorzugt. Alle Richtungen offen.
// ══════════════════════════════════════════════════════════
export function generateStarterQuests(preferredLength = "medium") {
  const xpScale = LENGTH_SCALE[preferredLength] || 1.0;

  const dailyPool = [
    {
      id: "starter_focus",
      title: "System Focus",
      desc:  "Arbeite 15 Minuten konzentriert an etwas Wichtigem — kein Handy, keine Ablenkung.",
      xp: Math.round(25 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "action",
      cat: "discipline", domain: "discipline",
      path: "strategist", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_move",
      title: "Body Activation",
      desc:  "Bewege dich 20 Minuten bewusst — Spazieren, Dehnen, Sport, Tanzen. Was auch immer du wählst.",
      xp: Math.round(22 * xpScale), stat: "VIT", statPts: 0,
      type: "daily", actionType: "action",
      cat: "cardio", domain: "body",
      path: "runner", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_env",
      title: "Environment Reset",
      desc:  "Bringe einen Bereich 10 Minuten in Ordnung — Schreibtisch, Zimmer oder digitale Ablage.",
      xp: Math.round(18 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "action",
      cat: "discipline", domain: "home",
      path: "guardian", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_skill",
      title: "Skill Spark",
      desc:  "Übe 10 Minuten eine Fähigkeit die dir wichtig ist — irgendetwas, das dich weiterbringt.",
      xp: Math.round(22 * xpScale), stat: "INT", statPts: 0,
      type: "daily", actionType: "action",
      cat: "mind", domain: "mind",
      path: "scholar", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_objective",
      title: "Objective Step",
      desc:  "Mache einen kleinen, konkreten Fortschritt an einem deiner Ziele.",
      xp: Math.round(20 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "action",
      cat: "discipline", domain: "discipline",
      path: "strategist", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_recovery",
      title: "Recovery Protocol",
      desc:  "Plane oder mache 10 Minuten Regeneration — Schlaf, Pause, Atemübung oder Spaziergang.",
      xp: Math.round(15 * xpScale), stat: "VIT", statPts: 0,
      type: "daily", actionType: "action",
      cat: "recovery", domain: "recovery",
      path: "monk", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_reflect",
      title: "Reflection Log",
      desc:  "Notiere kurz was du heute verbessert hast oder morgen besser machen willst.",
      xp: Math.round(15 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "reflection",
      cat: "discipline", domain: "discipline",
      path: "monk", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_discipline",
      title: "Discipline Check",
      desc:  "Schließe eine bewusst aufgeschobene Kleinaufgabe heute noch ab.",
      xp: Math.round(20 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "action",
      cat: "discipline", domain: "discipline",
      path: "guardian", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
  ];

  // Wähle 5 der täglichen Starter-Quests — tagesbasierte Rotation für Variety
  // Rotiert täglich, bleibt aber den ganzen Tag stabil (dayKey-gebunden)
  const _dayOffset = Math.floor(Date.now() / 86400000) % dailyPool.length;
  const _rotatedPool = [...dailyPool.slice(_dayOffset), ...dailyPool.slice(0, _dayOffset)];
  // Immer: Focus + Move als Ankerpunkte (Index 0+1), dann 3 rotierende
  const _anchors  = [dailyPool[0], dailyPool[1]];           // System Focus, Body Activation
  const _rotating = _rotatedPool.filter(q => q.id !== "starter_focus" && q.id !== "starter_move");
  const selectedDaily = [..._anchors, ..._rotating.slice(0, 3)];

  const weeklyPool = [
    {
      id: "starter_w_focus",
      title: "Weekly Focus Order",
      desc:  "Schließe diese Woche 3 Fokus-Sessions ab — je 15 Minuten ohne Ablenkung.",
      xp: Math.round(110 * xpScale), stat: "END", statPts: 0,
      type: "weekly", actionType: "action",
      cat: "discipline", domain: "discipline",
      path: "strategist", personalized: false, source: "starter",
      reason: "System Starter Weekly",
    },
    {
      id: "starter_w_body",
      title: "Body Foundation",
      desc:  "Schließe diese Woche 2 Bewegungs-Sessions ab — Spazieren, Sport, Dehnen oder aktive Bewegung.",
      xp: Math.round(120 * xpScale), stat: "VIT", statPts: 0,
      type: "weekly", actionType: "action",
      cat: "body", domain: "body",
      path: "runner", personalized: false, source: "starter",
      reason: "System Starter Weekly",
    },
    {
      id: "starter_w_skill",
      title: "Skill Foundation",
      desc:  "Übe eine Fähigkeit an mindestens 2 Tagen diese Woche — was auch immer dich interessiert.",
      xp: Math.round(130 * xpScale), stat: "INT", statPts: 0,
      type: "weekly", actionType: "action",
      cat: "mind", domain: "mind",
      path: "scholar", personalized: false, source: "starter",
      reason: "System Starter Weekly",
    },
    {
      id: "starter_w_review",
      title: "System Review",
      desc:  "Führe ein kurzes Wochenreview durch — was lief gut, was möchte ich verbessern?",
      xp: Math.round(90 * xpScale), stat: "END", statPts: 0,
      type: "weekly", actionType: "reflection",
      cat: "discipline", domain: "discipline",
      path: "monk", personalized: false, source: "starter",
      reason: "System Starter Weekly",
    },
  ];

  // Zeige 3 wöchentliche Starter-Quests — alle 4 rotieren wochenweise
  const _weekOffset = Math.floor(Date.now() / (86400000 * 7)) % weeklyPool.length;
  const _weekRotated = [...weeklyPool.slice(_weekOffset), ...weeklyPool.slice(0, _weekOffset)];
  const selectedWeekly = _weekRotated.slice(0, 3);

  return [...selectedDaily, ...selectedWeekly];
}

// ══════════════════════════════════════════════════════════
// Next Best Quest — System Analysis Empfehlung
// ══════════════════════════════════════════════════════════
export function getNextBestQuests(preferences, context = {}) {
  const { goals = [], neglectedDomains = [], currentStreak = 0 } = context;

  const topGoal = goals
    .filter(g => g.status === "active")
    .sort((a, b) => (b.currentValue / b.targetValue) - (a.currentValue / a.targetValue))[0];

  if (topGoal) {
    const quests = generatePersonalizedQuests(
      { ...preferences, activePaths: topGoal.path ? [topGoal.path] : (preferences?.activePaths || []) },
      { goals: [topGoal], questHistory: context.questHistory || [], currentStreak, neglectedDomains },
      2
    );
    if (quests.length > 0) return quests.slice(0, 1); // Etappe 6: Next Best Quest max. 1
  }

  return generatePersonalizedQuests(preferences, context, 1).slice(0, 1);
}

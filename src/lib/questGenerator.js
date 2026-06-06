// ============================================================
// QUEST GENERATOR v3 — Prompt 3 (Smarter, Behavior-Aware)
// Scoring-basiertes System mit gewichteter Entscheidung:
//   Active Goals:       35%
//   Recent Behavior:    25%
//   Selected Interests: 20%
//   Path Affinity:      10%
//   Neglected Domains:  10%
//
// Keine externe KI/API. Alles lokal, regelbasiert.
// ============================================================
import { QUEST_TEMPLATES }            from "../data/questTemplates.js";
import { INTERESTS, normalizeInterests } from "../data/interests.js";
import { PATHS }                       from "../data/paths.js";
import { catToDomain }                 from "../data/domains.js";

// ── XP-Multiplikatoren ─────────────────────────────────────
const LENGTH_SCALE = { short: 0.7, medium: 1.0, long: 1.35 };
const DIFF_SCALE   = { easy: 0.75, normal: 1.0, hard: 1.3 };

// ── Domain-Gruppe → Template-Variable ──────────────────────
const GROUP_TO_VAR = {
  mind:        "interest_mind",
  tech:        "interest_tech",
  creative:    "interest_creative",
  craft:       "interest_kitchen",
  body:        "interest_fitness",
};

// ── Gewichtungen (Summe = 1.0) ──────────────────────────────
const W = {
  goal:      0.35,
  behavior:  0.25,
  interest:  0.20,
  affinity:  0.10,
  neglect:   0.10,
};

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

  // ── 2. Behavior match (25%) ─────────────────────────────
  const { domainCounts = {}, interestCounts = {}, recentCount = 0 } = behavior;
  if (recentCount > 0) {
    // Domain behavior: reward domains the user actually completes
    const domainFreq = (domainCounts[domain] || 0) / Math.max(recentCount, 1);
    // Interest behavior: reward interests the user completes
    const interestFreq = interestId ? (interestCounts[interestId] || 0) / Math.max(recentCount, 1) : 0;
    score += W.behavior * Math.max(domainFreq, interestFreq);
  }

  // ── 3. Interest match (20%) ─────────────────────────────
  if (selectedInterests.length > 0) {
    const interestIdx = selectedInterests.indexOf(interestId);
    if (interestIdx !== -1) {
      // Earlier in list = more recently chosen = slightly higher weight
      const positionalBoost = 1 - (interestIdx / selectedInterests.length) * 0.3;
      score += W.interest * positionalBoost;
    } else if (domain && selectedInterests.some(id => INTERESTS[id]?.domain === domain)) {
      // Domain match via interest, even if not exact template match
      score += W.interest * 0.5;
    }
  }

  // ── 4. Path affinity (10%) ─────────────────────────────
  if (path && activePaths.has(path)) {
    const affinityScore = Math.min((affinities[path] || 0) / 30, 1.0);
    score += W.affinity * (0.5 + affinityScore * 0.5);
  } else if (path) {
    // Template has a path that matches at least partially
    const tmplPaths = template?.paths || [];
    const anyMatch = tmplPaths.some(p => activePaths.has(p));
    if (anyMatch) score += W.affinity * 0.3;
  }

  // ── 5. Neglected domain boost (10%) ────────────────────
  if (neglectedDomains.includes(domain)) {
    score += W.neglect;
  }

  // ── Deductions ─────────────────────────────────────────
  // Don't repeat the same template+interest too often
  // (handled by usedTemplates Set, not score)

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
  } = context;

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

      // Also add as standalone
      if (!activeGoals.length || template.paths.some(p => pathSet.has(p)) || effectiveNeglected.includes(template.domain)) {
        const q = buildQuest({
          template, topicLabel: null, interestId: null,
          domain: template.domain, interestPaths: [], pathSet,
          preferredLength, difficulty,
          reason: template.paths.some(p => pathSet.has(p)) ? `dein ${PATHS[template.paths[0]]?.name || ""} Path wächst` : "System Balance",
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
  const MAX_NEGLECT    = 1;

  let goalLinkedCount = 0;
  let neglectCount    = 0;

  for (const { quest, goalLinked } of candidates) {
    if (selected.length >= maxQuests) break;
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
// Starter Quests — für Nutzer ohne Interessen
// ══════════════════════════════════════════════════════════
export function generateStarterQuests(preferredLength = "medium") {
  const xpScale = LENGTH_SCALE[preferredLength] || 1.0;
  return [
    {
      id: "starter_focus",
      title: "25 Min. Fokus-Session",
      desc:  "Setze dich hin und arbeite 25 Minuten ohne Ablenkung an etwas Wichtigem.",
      xp: Math.round(25 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "action",
      cat: "discipline", domain: "discipline",
      path: "strategist", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_move",
      title: "20 Min. Körper aktivieren",
      desc:  "Laufen, Dehnen, Gym oder Spaziergang — irgendetwas Aktives.",
      xp: Math.round(22 * xpScale), stat: "VIT", statPts: 0,
      type: "daily", actionType: "action",
      cat: "cardio", domain: "body",
      path: "runner", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_learn",
      title: "20 Min. Knowledge Intake",
      desc:  "Ein Thema das dich interessiert — Podcast, Buch, Artikel oder Tutorial.",
      xp: Math.round(22 * xpScale), stat: "INT", statPts: 0,
      type: "daily", actionType: "action",
      cat: "uni", domain: "mind",
      path: "scholar", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_order",
      title: "5 Min. Environment Clear",
      desc:  "Schreibtisch, Zimmer, digitale Ablage — einen Bereich aufräumen.",
      xp: Math.round(15 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "action",
      cat: "discipline", domain: "home",
      path: "guardian", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_social",
      title: "Social Link pflegen",
      desc:  "Eine Freundschaft oder Beziehung aktiv pflegen — nicht warten.",
      xp: Math.round(18 * xpScale), stat: "CHA", statPts: 0,
      type: "daily", actionType: "action",
      cat: "social", domain: "social",
      path: "charmer", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
    {
      id: "starter_reflect",
      title: "5 Min. System Reflection",
      desc:  "Was lief heute gut? Was möchte ich morgen anders machen?",
      xp: Math.round(15 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "reflection",
      cat: "discipline", domain: "discipline",
      path: "monk", personalized: false, source: "starter",
      reason: "System Starter Quest",
    },
  ];
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
    if (quests.length > 0) return quests.slice(0, 2);
  }

  return generatePersonalizedQuests(preferences, context, 2);
}

// ============================================================
// QUEST GENERATOR v2 — Prompt 8
// Generiert Quests anhand von:
//   1. ausgewählten Interessen
//   2. aktiven Zielen (Goal-Priorisierung)
//   3. Main/Secondary Path + Path Affinities
//   4. vernachlässigten Domains (Balance)
//   5. Quest History
//   6. bevorzugter Quest-Länge + Schwierigkeit
//   7. Streak-/Recovery-Situation
// Keine externe KI/API. Alles lokal, regelbasiert.
// ============================================================
import { QUEST_TEMPLATES }            from "../data/questTemplates.js";
import { INTERESTS, normalizeInterests } from "../data/interests.js";
import { PATHS }                       from "../data/paths.js";
import { catToDomain }                 from "../data/domains.js";
import { getDayKey }                   from "./dates.js";

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

// ── Hilfsfunktionen ────────────────────────────────────────

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
  const lm = LENGTH_SCALE[preferredLength] || 1.0;
  const dm = DIFF_SCALE[difficulty]        || 1.0;
  return Math.round(baseXp * lm * dm);
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
    cat:          template.domain,           // legacy compat
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

// ══════════════════════════════════════════════════════════
// MAIN: generatePersonalizedQuests
// ══════════════════════════════════════════════════════════

/**
 * Generiert 3–8 personalisierte Quests.
 *
 * @param {object} preferences  - state.player.preferences
 * @param {object} [context]    - { goals, questHistory, affinities, currentStreak, neglectedDomains }
 * @param {number} [maxQuests]  - max total quests (default 8)
 */
export function generatePersonalizedQuests(preferences, context = {}, maxQuests = 8) {
  const {
    goals           = [],
    questHistory    = [],
    affinities      = {},
    currentStreak   = 0,
    neglectedDomains = [],
  } = context;

  const rawInterests    = preferences?.interests            || [];
  const activePaths     = preferences?.activePaths          || [];
  const preferredLength = preferences?.preferredQuestLength || "medium";
  const difficulty      = preferences?.difficulty           || "normal";
  const balanceAreas    = preferences?.balanceAreas         || [];
  const mainPath        = preferences?.mainPath             || null;
  const secondaryPath   = preferences?.secondaryPath        || null;

  // Normalisiere alte Interest-IDs
  const interests = normalizeInterests(rawInterests);

  if (interests.length === 0 && activePaths.length === 0) return [];

  // Build sets for fast lookup
  const pathSet     = new Set([...activePaths, mainPath, secondaryPath].filter(Boolean));
  const activeGoals = goals.filter(g => g?.status === "active");

  // Recent history: which domains were active in last 7 days?
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentDomains = new Set(
    questHistory
      .filter(h => h.completedAt && new Date(h.completedAt) > sevenDaysAgo)
      .map(h => h.domain || catToDomain(h.cat))
      .filter(Boolean)
  );

  // Topic map from interests: group → [{ label, interestId, domain, paths }]
  const topicMap = {};
  for (const interestId of interests) {
    const info = INTERESTS[interestId];
    if (!info) continue;
    const group = GROUP_TO_VAR[info.group] || `interest_${info.group}`;
    if (!topicMap[group]) topicMap[group] = [];
    topicMap[group].push({
      label:  info.questTopic || info.label,
      interestId,
      domain: info.domain,
      paths:  info.relatedPaths,
    });
  }

  const results       = [];
  const usedTemplates = new Set();
  const groupCounts   = {};

  // ── Helper: add quest if not duplicate ──
  const addQuest = (q, priority = 0) => {
    if (!q) return;
    if (results.some(r => r.id === q.id)) return;
    q._priority = priority;
    results.push(q);
  };

  // ══════════════════════════════════════
  // PASS 1: Goal-linked Quests (highest priority)
  // ══════════════════════════════════════
  for (const goal of activeGoals.slice(0, 3)) {
    const goalDomain = goal.domain;
    const goalPath   = goal.path;

    for (const template of QUEST_TEMPLATES) {
      if (usedTemplates.has(template.id + "_goal_" + goal.id)) continue;
      if (results.filter(r => r.goalId === goal.id).length >= 2) break;

      const domainMatch = template.domain === goalDomain;
      const pathMatch   = goalPath && template.paths.includes(goalPath);
      if (!domainMatch && !pathMatch) continue;

      // Prefer templates with matching topic variable
      const hasTopicVar = Object.values(template.variables || {}).some(v => typeof v === "string" && v.startsWith("interest_"));

      if (!hasTopicVar) {
        // No topic needed
        const q = buildQuest({ template, topicLabel: null, interestId: null, domain: goalDomain,
          interestPaths: [], pathSet, preferredLength, difficulty,
          reason: `Ziel: ${goal.title}`, goalId: goal.id });
        addQuest(q, 10);
        usedTemplates.add(template.id + "_goal_" + goal.id);
      } else {
        // Find matching interest topic
        const templateGroups = Object.entries(template.variables || {})
          .filter(([, v]) => typeof v === "string" && v.startsWith("interest_"))
          .map(([, v]) => v);

        for (const group of templateGroups) {
          const topics = topicMap[group] || [];
          for (const { label, interestId, domain, paths } of topics) {
            const key = template.id + "_goal_" + goal.id + "_" + interestId;
            if (usedTemplates.has(key)) continue;
            const q = buildQuest({ template, topicLabel: label, interestId, domain,
              interestPaths: paths, pathSet, preferredLength, difficulty,
              reason: `Ziel: ${goal.title}`, goalId: goal.id });
            addQuest(q, 10);
            usedTemplates.add(key);
          }
        }
      }
    }
  }

  // ══════════════════════════════════════
  // PASS 2: Interest-based Quests (normal priority)
  // ══════════════════════════════════════
  for (const template of QUEST_TEMPLATES) {
    if (results.length >= maxQuests) break;

    const pathMatch = pathSet.size === 0 || template.paths.some(p => pathSet.has(p));
    if (!pathMatch) continue;

    const hasTopicVar = Object.values(template.variables || {}).some(v => typeof v === "string" && v.startsWith("interest_"));

    if (!hasTopicVar) {
      // Direkt generieren (Training, Laufen, etc.)
      const tKey = template.id;
      if (usedTemplates.has(tKey)) continue;
      const gKey = template.domain;
      if ((groupCounts[gKey] || 0) >= 2) continue;

      const q = buildQuest({ template, topicLabel: null, interestId: null,
        domain: template.domain, interestPaths: [], pathSet,
        preferredLength, difficulty, reason: "Passend zum aktiven Pfad" });
      addQuest(q, 5);
      usedTemplates.add(tKey);
      groupCounts[gKey] = (groupCounts[gKey] || 0) + 1;
      continue;
    }

    // Mit Topic-Variable: pro passendem Interesse
    const templateGroups = Object.entries(template.variables || {})
      .filter(([, v]) => typeof v === "string" && v.startsWith("interest_"))
      .map(([, v]) => v);

    for (const group of templateGroups) {
      const topics = topicMap[group] || [];
      for (const { label, interestId, domain, paths } of topics) {
        if (results.length >= maxQuests) break;
        const key = `${template.id}_${interestId}`;
        if (usedTemplates.has(key)) continue;
        const gKey = `${template.domain}_${group}`;
        if ((groupCounts[gKey] || 0) >= 2) continue;

        const interest = INTERESTS[interestId];
        const q = buildQuest({ template, topicLabel: label, interestId, domain,
          interestPaths: paths, pathSet, preferredLength, difficulty,
          reason: `Interesse: ${interest?.label || label}` });
        addQuest(q, 5);
        usedTemplates.add(key);
        groupCounts[gKey] = (groupCounts[gKey] || 0) + 1;
      }
    }
  }

  // ══════════════════════════════════════
  // PASS 3: Neglected Domain Quests (balance)
  // ══════════════════════════════════════
  const neglected = neglectedDomains.length > 0 ? neglectedDomains :
    (balanceAreas.length > 0 ? balanceAreas.filter(d => !recentDomains.has(d)) : []);

  for (const domain of neglected.slice(0, 2)) {
    if (results.length >= maxQuests) break;
    const balanceTemplate = QUEST_TEMPLATES.find(t =>
      (t.domain === domain || catToDomain(t.domain) === domain) &&
      !usedTemplates.has(t.id)
    );
    if (!balanceTemplate) continue;
    const q = buildQuest({ template: balanceTemplate, topicLabel: null, interestId: null,
      domain, interestPaths: [], pathSet, preferredLength, difficulty,
      reason: `Bereich vernachlässigt: ${domain}` });
    if (q) {
      q.recommended = true;
      addQuest(q, 3);
      usedTemplates.add(balanceTemplate.id);
    }
  }

  // ══════════════════════════════════════
  // PASS 4: Recovery Quest bei niedrigem Streak oder hohem Stress
  // ══════════════════════════════════════
  if (currentStreak === 0 && results.length < maxQuests) {
    const recoveryTemplate = QUEST_TEMPLATES.find(t =>
      t.domain === "recovery" && !usedTemplates.has(t.id)
    );
    if (recoveryTemplate) {
      const q = buildQuest({ template: recoveryTemplate, topicLabel: null, interestId: null,
        domain: "recovery", interestPaths: [], pathSet, preferredLength, difficulty,
        reason: "Recovery empfohlen" });
      if (q) {
        q.recommended = true;
        addQuest(q, 2);
      }
    }
  }

  // Sortiere nach Priorität und trimme auf maxQuests
  return results
    .sort((a, b) => (b._priority || 0) - (a._priority || 0))
    .slice(0, maxQuests)
    .map(q => { delete q._priority; return q; });
}

// ══════════════════════════════════════════════════════════
// Starter Quests — für Nutzer ohne Interessen
// ══════════════════════════════════════════════════════════

/**
 * Allgemeine Starter-Quests die alle wichtigen Domains abdecken.
 * Wird verwendet wenn keine Interessen/Pfade gesetzt sind.
 */
export function generateStarterQuests(preferredLength = "medium") {
  const xpScale = LENGTH_SCALE[preferredLength] || 1.0;
  return [
    {
      id: "starter_focus",
      title: "25 Min. Fokus-Block",
      desc:  "Setz dich hin und arbeite 25 Minuten ohne Ablenkung an etwas Wichtigem.",
      xp: Math.round(25 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "action",
      cat: "discipline", domain: "discipline",
      path: "strategist", personalized: false, source: "starter",
      reason: "Allgemeiner Starter",
    },
    {
      id: "starter_move",
      title: "20 Min. Bewegung",
      desc:  "Laufen, Dehnen, Gym oder Spaziergang — irgendetwas Aktives.",
      xp: Math.round(22 * xpScale), stat: "VIT", statPts: 0,
      type: "daily", actionType: "action",
      cat: "cardio", domain: "body",
      path: "runner", personalized: false, source: "starter",
      reason: "Allgemeiner Starter",
    },
    {
      id: "starter_learn",
      title: "20 Min. Etwas Neues lernen",
      desc:  "Ein Thema das dich interessiert — Podcast, Buch, Artikel oder Tutorial.",
      xp: Math.round(22 * xpScale), stat: "INT", statPts: 0,
      type: "daily", actionType: "action",
      cat: "uni", domain: "mind",
      path: "scholar", personalized: false, source: "starter",
      reason: "Allgemeiner Starter",
    },
    {
      id: "starter_order",
      title: "5 Min. Ordnung schaffen",
      desc:  "Schreibtisch, Zimmer, digitale Ablage — einen Bereich aufräumen.",
      xp: Math.round(15 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "action",
      cat: "discipline", domain: "home",
      path: "guardian", personalized: false, source: "starter",
      reason: "Allgemeiner Starter",
    },
    {
      id: "starter_social",
      title: "Aktiv jemanden schreiben",
      desc:  "Eine Freundschaft oder Beziehung pflegen — nicht warten bis jemand schreibt.",
      xp: Math.round(18 * xpScale), stat: "CHA", statPts: 0,
      type: "daily", actionType: "action",
      cat: "social", domain: "social",
      path: "charmer", personalized: false, source: "starter",
      reason: "Allgemeiner Starter",
    },
    {
      id: "starter_reflect",
      title: "5 Min. Tagesreflexion",
      desc:  "Was lief heute gut? Was möchte ich morgen anders machen?",
      xp: Math.round(15 * xpScale), stat: "END", statPts: 0,
      type: "daily", actionType: "reflection",
      cat: "discipline", domain: "discipline",
      path: "monk", personalized: false, source: "starter",
      reason: "Allgemeiner Starter",
    },
  ];
}

// ══════════════════════════════════════════════════════════
// Next Best Quest — System Analysis Empfehlung
// ══════════════════════════════════════════════════════════

/**
 * Gibt die 1–2 "nächst besten" Quests basierend auf dem aktuellen Kontext zurück.
 * Für SystemAnalysis / "Was soll ich als nächstes tun?"-Feature.
 */
export function getNextBestQuests(preferences, context = {}) {
  const { goals = [], neglectedDomains = [], currentStreak = 0 } = context;

  // Aktives Ziel mit höchstem Fortschritt
  const topGoal = goals
    .filter(g => g.status === "active")
    .sort((a, b) => (b.currentValue / b.targetValue) - (a.currentValue / a.targetValue))[0];

  if (topGoal) {
    // Goal-linked Quest
    const quests = generatePersonalizedQuests(
      { ...preferences, activePaths: topGoal.path ? [topGoal.path] : (preferences?.activePaths || []) },
      { goals: [topGoal], questHistory: context.questHistory || [], currentStreak, neglectedDomains },
      2
    );
    if (quests.length > 0) return quests.slice(0, 2);
  }

  // Fallback: erste personalisierte Quest
  return generatePersonalizedQuests(preferences, context, 2);
}

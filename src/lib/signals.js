// ============================================================
// SIGNAL SYSTEM — Etappe 4
// Spezialisierung entsteht nur durch echte Signale.
// Kein Thema wird defaultmäßig bevorzugt.
//
// Signal-Quellen (gewichtet):
//   1. Quest-History (Verhalten zählt am stärksten)
//   2. Progress Logs zu einem Thema
//   3. Explizit gewählte Interessen
//   4. Aktive Goals mit passendem Thema
//   5. Abgeschlossene Gates / Trials
//   6. Stats-Wachstum in passender Richtung
//   7. Wiederholung über Zeit (Consistency Bonus)
//
// Signal-Level:
//   0     → Kein Signal. Thema ist neutrale Option.
//   1–2   → Schwaches Signal. Gelegentlich leichte Quests.
//   3–5   → Aktive Spezialisierung. Spezifischere Quests.
//   6+    → Starkes Signal. Gates, Trials, Milestones verfügbar.
// ============================================================

import { INTERESTS } from "../data/interests.js";
import { PATHS }     from "../data/paths.js";

// ── Domain → Paths (Multi-Map) ─────────────────────────────
const DOMAIN_PATH_MAP = {
  body:        ["fighter", "runner"],
  mind:        ["scholar", "strategist"],
  craft:       ["engineer", "artisan"],
  creativity:  ["artisan", "creator"],
  social:      ["charmer", "leader"],
  appearance:  ["charmer"],
  discipline:  ["strategist", "guardian"],
  career:      ["merchant", "strategist"],
  finance:     ["merchant"],
  home:        ["guardian", "healer"],
  recovery:    ["monk", "healer"],
  adventure:   ["explorer"],
  leadership:  ["leader"],
  service:     ["healer"],
  // Legacy
  strength:    ["fighter"],
  cardio:      ["runner"],
  uni:         ["scholar"],
  skill_tech:  ["engineer"],
  skill_practical: ["engineer", "artisan"],
  skill_creative:  ["artisan", "creator"],
  health:      ["monk", "healer"],
};

// ── Interest → Paths (for fast lookup) ────────────────────
function getPathsForInterest(interestId) {
  const interest = INTERESTS[interestId];
  return interest?.relatedPaths || [];
}

// ── Weight constants ───────────────────────────────────────
const W_BEHAVIOR   = 3.0;  // Quest completed → strongest signal
const W_LOG        = 2.5;  // Progress log written
const W_GOAL       = 2.0;  // Active/completed goal in domain
const W_INTEREST   = 1.5;  // Explicit interest selected
const W_GATE       = 2.0;  // Gate completed in path
const W_STAT       = 1.0;  // Stat points accumulated
const W_CONSISTENCY= 1.5;  // Repeated activity over time (bonus)

// Days window for "recent" behavior
const RECENT_DAYS = 21;

// ── Helpers ────────────────────────────────────────────────

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

function recentHistory(questHistory, days = RECENT_DAYS) {
  const cutoff = Date.now() - days * 86400000;
  return (questHistory || []).filter(h =>
    h.completedAt && new Date(h.completedAt) >= cutoff
  );
}

// Spread of days on which path was active (consistency measure)
function activeDaySpread(entries) {
  const days = new Set(entries.map(e => {
    const d = new Date(e.completedAt || 0);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  return days.size;
}

// ══════════════════════════════════════════════════════════
// calculateInterestSignal
// Returns a numeric signal score for a specific interest.
// ══════════════════════════════════════════════════════════
export function calculateInterestSignal(state, interestId) {
  const {
    questHistory   = [],
    progressLogs   = [],
    goals          = [],
    player         = {},
    stats          = {},
    gateProgress   = {},
  } = state;

  const interest = INTERESTS[interestId];
  if (!interest) return 0;

  const prefs       = player?.preferences || {};
  const interestIds = prefs.interests || [];
  const affinities  = player?.affinities || {};

  let score = 0;

  // 1. Quest History — matching domain or interestId
  const recent = recentHistory(questHistory);
  const matchingQuests = recent.filter(h =>
    h.interestId === interestId ||
    h.domain === interest.domain ||
    (interest.tags || []).some(t => (h.cat || "").includes(t))
  );
  if (matchingQuests.length > 0) {
    score += Math.min(matchingQuests.length * W_BEHAVIOR, 12);
    // Consistency bonus: active on 3+ different days
    const spread = activeDaySpread(matchingQuests);
    if (spread >= 3) score += W_CONSISTENCY;
    if (spread >= 7) score += W_CONSISTENCY;
  }

  // 2. Progress Logs mentioning this interest/domain
  const matchingLogs = (progressLogs || []).filter(l =>
    l.interestId === interestId || l.domain === interest.domain
  );
  score += Math.min(matchingLogs.length * W_LOG, 8);

  // 3. Active/completed Goals in this domain
  const matchingGoals = (goals || []).filter(g =>
    g.domain === interest.domain ||
    g.interestId === interestId ||
    (g.path && interest.relatedPaths?.includes(g.path))
  );
  const activeGoals    = matchingGoals.filter(g => g.status === "active").length;
  const completedGoals = matchingGoals.filter(g => g.status === "completed").length;
  score += activeGoals    * W_GOAL;
  score += completedGoals * W_GOAL * 1.5;

  // 4. Explicit interest selection
  if (interestIds.includes(interestId)) score += W_INTEREST;

  // 5. Related path affinity (indirect signal)
  const relatedPaths = interest.relatedPaths || [];
  const maxAff = Math.max(...relatedPaths.map(p => affinities[p] || 0), 0);
  score += Math.min(maxAff / 10, W_STAT);

  // 6. Gates completed for related paths
  const completedGates = Object.entries(gateProgress || {}).filter(([, g]) => g?.completed);
  for (const [gateId] of completedGates) {
    for (const pathId of relatedPaths) {
      if (gateId.includes(pathId)) score += W_GATE * 0.5;
    }
  }

  return Math.round(score * 10) / 10;
}

// ══════════════════════════════════════════════════════════
// calculatePathSignal
// Returns a numeric signal score for a specific path.
// ══════════════════════════════════════════════════════════
export function calculatePathSignal(state, pathId) {
  const {
    questHistory   = [],
    progressLogs   = [],
    goals          = [],
    player         = {},
    stats          = {},
    gateProgress   = {},
  } = state;

  const path = PATHS[pathId];
  if (!path || path.special) return 0;

  const prefs      = player?.preferences || {};
  const interests  = prefs.interests || [];
  const affinities = player?.affinities || {};

  let score = 0;

  // 1. Quest History — matching domain or path
  const recent = recentHistory(questHistory);
  const pathDomains = path.domains || [];
  const pathCats    = path.cats    || [];

  const matchingQuests = recent.filter(h =>
    h.path === pathId ||
    pathDomains.includes(h.domain) ||
    pathCats.includes(h.cat)
  );
  if (matchingQuests.length > 0) {
    score += Math.min(matchingQuests.length * W_BEHAVIOR, 15);
    const spread = activeDaySpread(matchingQuests);
    if (spread >= 3) score += W_CONSISTENCY;
    if (spread >= 7) score += W_CONSISTENCY * 1.5;
  }

  // 2. Progress Logs in path domains
  const matchingLogs = (progressLogs || []).filter(l =>
    l.path === pathId || pathDomains.includes(l.domain)
  );
  score += Math.min(matchingLogs.length * W_LOG, 10);

  // 3. Goals matching this path
  const matchingGoals = (goals || []).filter(g =>
    g.path === pathId || pathDomains.includes(g.domain)
  );
  const activeGoals    = matchingGoals.filter(g => g.status === "active").length;
  const completedGoals = matchingGoals.filter(g => g.status === "completed").length;
  score += activeGoals    * W_GOAL;
  score += completedGoals * W_GOAL * 1.5;

  // 4. Interests pointing to this path
  const matchingInterests = interests.filter(id => {
    const interest = INTERESTS[id];
    return interest?.relatedPaths?.includes(pathId);
  });
  score += Math.min(matchingInterests.length * W_INTEREST, 6);

  // 5. Existing affinity (normalized)
  const aff = affinities[pathId] || 0;
  score += Math.min(aff / 8, W_STAT * 2);

  // 6. Completed Gates for this path
  const completedGates = Object.entries(gateProgress || {}).filter(([id, g]) =>
    g?.completed && id.includes(pathId)
  );
  score += completedGates.length * W_GATE;

  // 7. Relevant stats growing
  const pathStats = path.stats || [];
  const statSum   = pathStats.reduce((s, k) => s + (stats[k] || 0), 0);
  score += Math.min(statSum / 5, W_STAT * 2);

  return Math.round(score * 10) / 10;
}

// ══════════════════════════════════════════════════════════
// calculateSpecializationLevel
// Returns 0–3 based on signal strength for an interest.
//   0 = no signal
//   1 = weak (occasional personalized quests)
//   2 = active (specific quests generated)
//   3 = strong (gates, trials, milestones unlocked)
// ══════════════════════════════════════════════════════════
export function calculateSpecializationLevel(state, interestId) {
  const signal = calculateInterestSignal(state, interestId);
  if (signal >= 6)  return 3; // strong
  if (signal >= 3)  return 2; // active
  if (signal >= 1)  return 1; // weak
  return 0;                   // none
}

// Path specialization level (same scale)
export function calculatePathSpecializationLevel(state, pathId) {
  const signal = calculatePathSignal(state, pathId);
  if (signal >= 8)  return 3; // strong — gates/trials
  if (signal >= 4)  return 2; // active — specific quests
  if (signal >= 1)  return 1; // weak — light personalization
  return 0;                   // none
}

// ══════════════════════════════════════════════════════════
// derivePathAffinityFromProgress
// Returns a map of { pathId: signalScore } for all paths.
// Used by questGenerator and gates to determine which
// paths have enough signal to show specialized content.
// ══════════════════════════════════════════════════════════
export function derivePathAffinityFromProgress(state) {
  const result = {};
  const pathIds = Object.keys(PATHS).filter(id => !PATHS[id].special);

  for (const pathId of pathIds) {
    result[pathId] = calculatePathSignal(state, pathId);
  }

  return result;
}

// ══════════════════════════════════════════════════════════
// getTopSignalPaths
// Returns paths sorted by signal strength, with level tags.
// Used by systemAnalysis and questGenerator.
// ══════════════════════════════════════════════════════════
export function getTopSignalPaths(state, topN = 5) {
  const scores = derivePathAffinityFromProgress(state);

  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([pathId, score]) => ({
      pathId,
      score,
      level: calculatePathSpecializationLevel(state, pathId),
      reason: buildPathSignalReason(state, pathId, score),
    }));
}

// ══════════════════════════════════════════════════════════
// getTopSignalInterests
// Returns interests sorted by signal strength.
// ══════════════════════════════════════════════════════════
export function getTopSignalInterests(state, topN = 6) {
  const interestIds = Object.keys(INTERESTS);
  const scored = interestIds
    .map(id => ({ id, score: calculateInterestSignal(state, id) }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scored.map(e => ({
    interestId: e.id,
    score:      e.score,
    level:      calculateSpecializationLevel(state, e.id),
  }));
}

// ── Reason builder (for UI "why this path?") ──────────────
function buildPathSignalReason(state, pathId, score) {
  const {
    questHistory = [],
    progressLogs = [],
    goals        = [],
    player       = {},
    gateProgress = {},
  } = state;

  const path    = PATHS[pathId];
  const prefs   = player?.preferences || {};
  const domains = path?.domains || [];
  const recent  = recentHistory(questHistory);

  const reasons = [];

  // Behavior
  const behaviorCount = recent.filter(h =>
    h.path === pathId || domains.includes(h.domain)
  ).length;
  if (behaviorCount >= 5)
    reasons.push(`${behaviorCount} Quests in ${path?.name || pathId} abgeschlossen`);
  else if (behaviorCount > 0)
    reasons.push(`${behaviorCount} passende Quest${behaviorCount > 1 ? "s" : ""} diese Woche`);

  // Goals
  const goalCount = (goals || []).filter(g =>
    g.path === pathId || domains.includes(g.domain)
  ).length;
  if (goalCount > 0)
    reasons.push(`${goalCount} Ziel${goalCount > 1 ? "e" : ""} in diesem Bereich`);

  // Interests
  const matchInts = (prefs.interests || []).filter(id => {
    const interest = INTERESTS[id];
    return interest?.relatedPaths?.includes(pathId);
  });
  if (matchInts.length > 0)
    reasons.push(`Interesse: ${matchInts.slice(0,2).map(id => INTERESTS[id]?.label || id).join(", ")}`);

  // Gates
  const gateCount = Object.entries(gateProgress || {}).filter(([id, g]) =>
    g?.completed && id.includes(pathId)
  ).length;
  if (gateCount > 0)
    reasons.push(`${gateCount} Gate${gateCount > 1 ? "s" : ""} abgeschlossen`);

  // Logs
  const logCount = (progressLogs || []).filter(l =>
    l.path === pathId || domains.includes(l.domain)
  ).length;
  if (logCount >= 3)
    reasons.push(`${logCount} Progress Logs`);

  if (reasons.length === 0) return "Aktivität in verwandten Bereichen";
  return reasons.slice(0, 2).join(" · ");
}

// ══════════════════════════════════════════════════════════
// getSignalSummary
// Returns a full signal summary for the SystemAnalysisCard.
// Exported so App.jsx can pass it to the card.
// ══════════════════════════════════════════════════════════
export function getSignalSummary(state) {
  const topPaths     = getTopSignalPaths(state, 5);
  const topInterests = getTopSignalInterests(state, 6);

  const hasAnySignal = topPaths.some(p => p.score > 0);
  const strongPaths  = topPaths.filter(p => p.level >= 2);
  const dominantPath = topPaths[0] || null;

  let statusMessage = "";
  if (!hasAnySignal) {
    statusMessage = "System wartet auf Signale. Schließe Quests ab um deinen Pfad zu formen.";
  } else if (dominantPath?.level === 1) {
    statusMessage = `Schwaches Signal erkannt: ${PATHS[dominantPath.pathId]?.name || dominantPath.pathId}. Mehr Aktivität um Gates freizuschalten.`;
  } else if (dominantPath?.level === 2) {
    statusMessage = `Aktive Spezialisierung: ${PATHS[dominantPath.pathId]?.name || dominantPath.pathId}. ${dominantPath.reason}.`;
  } else if (dominantPath?.level === 3) {
    statusMessage = `Starkes Signal: ${PATHS[dominantPath.pathId]?.name || dominantPath.pathId}. Gates und Trials verfügbar.`;
  }

  return {
    topPaths,
    topInterests,
    dominantPath,
    hasAnySignal,
    strongPaths,
    statusMessage,
  };
}

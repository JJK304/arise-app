// ============================================================
// BALANCING — Prompt 19
// Zentrale XP-Richtwerte und Anti-Exploit-Grenzen.
// Alle anderen Module referenzieren diese Konstanten.
// ============================================================

// ── XP-Richtwerte je Quest-Typ ─────────────────────────────
// Quelle: Prompt 19 Specification

export const XP_BOUNDS = {
  // Daily Quests: nach Schwierigkeit
  daily: {
    easy:   { min: 8,   max: 60  },
    normal: { min: 10,  max: 80  },
    hard:   { min: 20,  max: 104 },
    micro:  { min: 10,  max: 20  },  // Kurze tägliche Habits
  },
  // Weekly Quests
  weekly: {
    easy:   { min: 40,  max: 188 },
    normal: { min: 50,  max: 250 },
    hard:   { min: 65,  max: 325 },
  },
  // Milestones
  milestone: {
    easy:   { min: 112, max: 450 },
    normal: { min: 150, max: 800 },
    hard:   { min: 195, max: 1000},
  },
  // Custom Quests (freie Typ-Wahl durch Nutzer)
  custom: {
    easy:   { min: 4,   max: 75  },
    normal: { min: 5,   max: 100 },
    hard:   { min: 7,   max: 130 },
  },
  // Recovery Quests
  recovery: {
    easy:   { min: 10,  max: 40  },
    normal: { min: 15,  max: 60  },
    hard:   { min: 20,  max: 80  },
  },
  // Gates
  gate: {
    tier1: { min: 300, max: 500  },
    tier2: { min: 600, max: 900  },
    tier3: { min: 900, max: 1200 },
    shadow:{ min: 500, max: 800  },  // Shadow Tier-1 Spezial
    discovery: { min: 150, max: 300 }, // Leichte Einstiegs-Gates (Signal-Erkundung)
  },
  // Trials — prüfen echte Anwendung, daher höher als Gates
  trial: {
    tier1: { min: 400,  max: 600  },
    tier2: { min: 700,  max: 1000 },
    tier3: { min: 1200, max: 1600 },
  },
  // Goals
  goal: {
    small:  { min: 200, max: 400  },
    normal: { min: 300, max: 600  },
    large:  { min: 500, max: 1000 },
  },
  // Bonus XP (additive, nie farmbar)
  bonus: {
    progressLog:   { min: 5,  max: 20  },  // 1x pro Quest/Tag
    weeklyReview:  { min: 50, max: 100 },  // 1x pro Woche
    goalCompletion:{ min: 200,max: 1000},  // 1x pro Goal
    streak7:       { min: 0,  max: 0   },  // Nur Titel (kein XP-Bonus)
  },
};

// ── Affinity-Gains ─────────────────────────────────────────
export const AFFINITY_GAINS = {
  daily:     1,
  weekly:    2,
  milestone: 5,
  gate:      { tier1: 10, tier2: 15, tier3: 20 },
  goal:      { small: 5,  normal: 10, large: 15  },
};

// ── Difficulty-Multiplikatoren ─────────────────────────────
export const DIFF_SCALE = {
  easy:   0.75,
  normal: 1.0,
  hard:   1.3,
};

// ── Quest-Längen-Multiplikatoren ───────────────────────────
export const LENGTH_SCALE = {
  short:  0.7,
  medium: 1.0,
  long:   1.35,
};

// ── Anti-Exploit-Regeln (Dokumentation) ───────────────────
export const ANTI_EXPLOIT_RULES = {
  daily_duplicate:      "completionStatus.daily[dayKey] — einmal pro Tag",
  weekly_duplicate:     "completionStatus.weekly[weekKey] — einmal pro Woche",
  milestone_duplicate:  "questHistory-Check — nie wiederholbar",
  gate_duplicate:       "gateProgress.rewardClaimed — nie doppelt",
  goal_duplicate:       "completionStatus.goals[id].rewardClaimed — nie doppelt",
  progress_log_spam:    "canLogWithBonus: max 1 Bonus-Log pro Quest/Tag",
  weekly_review_spam:   "hasReviewThisWeek: max 1 Review pro Woche",
  custom_quest_abuse:   "clampCustomQuestXp: XP innerhalb Typ-Grenzen geklemmt",
};

// ── Streak-System ──────────────────────────────────────────
export const STREAK_SYSTEM = {
  // Keine direkten XP-Boni für Streak — nur Titel
  titles: {
    7:  "consistent_hunter",
    30: "iron_discipline",
    50: "maschine",  // Achievement
  },
};

// ── Shadow Freischalt-Voraussetzungen ──────────────────────
export const SHADOW_UNLOCK_REQUIREMENTS = {
  minPathsWithHighAffinity: 3,
  minAffinityPerPath:       20,
  minGatesCompleted:        3,
  minGoalsCompleted:        2,
  minRank:                  "A",   // Mindest-Rank
};

/**
 * Klemmt einen XP-Wert auf den erlaubten Bereich für einen Quest-Typ.
 * Einheitliche Funktion für Rewards und Custom Quests.
 *
 * @param {number} xp         - Roher XP-Wert
 * @param {string} questType  - "daily" | "weekly" | "milestone" | "custom" | "recovery" | "gate"
 * @param {string} difficulty - "easy" | "normal" | "hard"
 * @returns {number}          - Geklemmter XP-Wert
 */
export function clampXp(xp, questType = "daily", difficulty = "normal") {
  const typeBounds = XP_BOUNDS[questType];
  if (!typeBounds) return Math.max(1, Math.round(xp));

  const bounds = typeBounds[difficulty] || typeBounds.normal || typeBounds;
  if (!bounds.min && !bounds.max) return Math.max(1, Math.round(xp));

  return Math.max(bounds.min, Math.min(bounds.max, Math.round(xp)));
}

/**
 * Berechnet vorgeschlagene XP für eine Quest basierend auf Typ und Schwierigkeit.
 */
export function suggestXp(questType = "daily", difficulty = "normal") {
  const typeBounds = XP_BOUNDS[questType];
  if (!typeBounds) return 25;

  const bounds = typeBounds[difficulty] || typeBounds.normal;
  if (!bounds) return 25;

  // Vorschlag: etwas über dem Minimum
  return Math.round((bounds.min + bounds.max * 0.4));
}

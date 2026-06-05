// ============================================================
// QUEST ROTATION v1
// Erzeugt eine stabile, deterministisch-zufällige Auswahl
// aus dem Quest-Pool. Dieselben dayKey/weekKey → dieselbe Auswahl.
// Limits: 3–6 Daily, 2–4 Weekly, max 1–2 Recovery.
// ============================================================
import { getDayKey, getWeekKey } from "./dates.js";
import { clampXp, XP_BOUNDS } from "../data/balancing.js";

// ── Limiten ────────────────────────────────────────────────
const MAX_DAILY      = 5;   // aus CHALLENGES_DB.daily
const MAX_WEEKLY     = 3;   // aus CHALLENGES_DB.weekly
const MAX_PERSONALIZED = 5; // personalisierte/starter Quests
const MAX_RECOVERY   = 2;   // Recovery-Quests

// ── Deterministischer Hash (dayKey/weekKey als Seed) ───────
/**
 * Einfacher deterministischer Pseudo-Zufallsgenerator (xorshift32).
 * Gibt Werte zwischen 0 und 1 zurück.
 * Seed basiert auf einem String (dayKey oder weekKey).
 */
function createRng(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  let state = h || 1;
  return () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return ((state >>> 0) / 4294967296);
  };
}

/**
 * Shuffle mit deterministischem RNG (Fisher-Yates).
 */
function deterministicShuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Prioritätsscore für einen Quest basierend auf Kontext.
 * Höherer Score → wird bevorzugt gewählt.
 */
function questScore(quest, context) {
  let score = 0;
  const { interests = [], activePaths = [], activeGoals = [], neglectedDomains = [] } = context;

  // Goal-Bezug: höchste Priorität
  if (quest.goalId && activeGoals.some(g => g.id === quest.goalId)) score += 15;

  // Interest-Match
  if (quest.interestId && interests.includes(quest.interestId)) score += 8;

  // Path-Match
  if (quest.path && activePaths.includes(quest.path)) score += 5;

  // Vernachlässigte Domain
  if (quest.domain && neglectedDomains.includes(quest.domain)) score += 6;
  if (quest.cat   && neglectedDomains.includes(quest.cat))    score += 4;

  // Empfohlen
  if (quest.recommended) score += 3;

  return score;
}

// ══════════════════════════════════════════════════════════
// MAIN: rotateQuestPool
// ══════════════════════════════════════════════════════════

/**
 * Gibt eine stabile, dayKey-gebundene Auswahl aus dem Pool zurück.
 *
 * @param {object} pools
 *   pools.daily         - alle verfügbaren Daily-Quests (aus CHALLENGES_DB)
 *   pools.weekly        - alle verfügbaren Weekly-Quests
 *   pools.personalized  - generierte personalisierte/starter Quests
 *   pools.recovery      - Recovery-Quests
 * @param {object} context
 *   context.interests, activePaths, activeGoals, neglectedDomains
 * @param {string} [dayKeyOverride]   - für Tests
 * @param {string} [weekKeyOverride]  - für Tests
 * @returns {{ daily, weekly, personalized, recovery }}
 */
export function rotateQuestPool(pools, context = {}, dayKeyOverride, weekKeyOverride) {
  const dayKey  = dayKeyOverride  || getDayKey();
  const weekKey = weekKeyOverride || getWeekKey();

  const rngDay  = createRng(dayKey);
  const rngWeek = createRng(weekKey);

  // ── Daily Pool ──
  const dailyPool = (pools.daily || []).slice();
  // Sortiere nach Score + shuffle für Variation
  const scoredDaily = dailyPool.map(q => ({ q, score: questScore(q, context) + rngDay() }));
  scoredDaily.sort((a, b) => b.score - a.score);
  const selectedDaily = scoredDaily.slice(0, MAX_DAILY).map(s => s.q);

  // ── Weekly Pool ──
  const weeklyPool = (pools.weekly || []).slice();
  const scoredWeekly = weeklyPool.map(q => ({ q, score: questScore(q, context) + rngWeek() * 0.5 }));
  scoredWeekly.sort((a, b) => b.score - a.score);
  const selectedWeekly = scoredWeekly.slice(0, MAX_WEEKLY).map(s => s.q);

  // ── Personalized / Starter Quests ──
  // Diese kommen schon vorsortiert vom Generator
  const selectedPersonalized = (pools.personalized || []).slice(0, MAX_PERSONALIZED);

  // ── Recovery Quests ──
  const recoveryPool = (pools.recovery || []).slice();
  // Leichte RNG-Variation für Recovery
  const shuffledRecovery = deterministicShuffle(recoveryPool, createRng(dayKey + "_rec"));
  const selectedRecovery = shuffledRecovery.slice(0, MAX_RECOVERY);

  return {
    daily:        selectedDaily,
    weekly:       selectedWeekly,
    personalized: selectedPersonalized,
    recovery:     selectedRecovery,
    // Rotation-Meta
    _dayKey:      dayKey,
    _weekKey:     weekKey,
  };
}

/**
 * Prüft ob eine Custom Quest die Daily/Weekly-Limits respektiert.
 * Custom Quests werden wie "daily" behandelt (einmal pro Tag).
 */
export function canCompleteCustomQuest(completionStatus, quest) {
  const today = getDayKey();
  const doneToday = completionStatus?.daily?.[today] || [];
  return !doneToday.includes(quest.id);
}

/**
 * Berechnet sichere XP-Grenzen für Custom Quests (anti-exploit).
 * Nutzer darf XP nur in diesem Bereich setzen.
 */
export function calculateCustomQuestXpBounds(quest) {
  const type = quest.type || "daily";
  const diff = quest.difficulty || "normal";
  const typeBounds = XP_BOUNDS[type] || XP_BOUNDS.custom;
  const bounds = typeBounds[diff] || typeBounds.normal || { min: 5, max: 100 };
  const suggested = Math.round((bounds.min + bounds.max * 0.4));
  return {
    min:       bounds.min,
    max:       bounds.max,
    suggested: Math.min(Math.max(suggested, bounds.min), bounds.max),
  };
}

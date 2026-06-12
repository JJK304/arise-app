// ============================================================
// QUEST ROTATION v1
// Erzeugt eine stabile, deterministisch-zufällige Auswahl
// aus dem Quest-Pool. Dieselben dayKey/weekKey → dieselbe Auswahl.
// Limits: 3–6 Daily, 2–4 Weekly, max 1–2 Recovery.
// ============================================================
import { getDayKey, getWeekKey } from "./dates.js";
import { clampXp, XP_BOUNDS } from "../data/balancing.js";
import { buildThemeContext, questThemeMatches } from "../data/questThemes.js";
import { INTERESTS } from "../data/interests.js";
import { PATHS } from "../data/paths.js";

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
// ═══════════════════════════════════════════════════════════
// scoreQuestCandidate — Etappe 6: Sprint-Scoring-Formel
//   Active Goal Match:        35%
//   Recent Behavior Match:    30%
//   Explicit Interest Match:  20%
//   Stat / Path Signal:       10%
//   Balance Need:              5%
// Jede Komponente wird auf 0..1 normalisiert und gewichtet.
// Rückgabe: Score 0..100.
// ═══════════════════════════════════════════════════════════
export function scoreQuestCandidate(quest, context = {}) {
  const {
    interests        = [],
    activePaths      = [],
    activeGoals      = [],
    neglectedDomains = [],
    signalInterests  = [],
    signalPaths      = [],
    recentDomains    = {},   // { domain: count } der letzten 14 Tage
  } = context;

  // 1) Active Goal Match (35)
  let goal = 0;
  if (quest.goalId && activeGoals.some(g => g.id === quest.goalId)) goal = 1;
  else if (quest.domain && activeGoals.some(g => g.domain === quest.domain)) goal = 0.6;
  else if (quest.path   && activeGoals.some(g => g.path   === quest.path))   goal = 0.6;

  // 2) Recent Behavior Match (30) — Anteil der Domain am jüngsten Verhalten
  let behavior = 0;
  const totalRecent = Object.values(recentDomains).reduce((s, n) => s + n, 0);
  if (totalRecent > 0 && quest.domain && recentDomains[quest.domain]) {
    behavior = Math.min(1, (recentDomains[quest.domain] / totalRecent) * 2.5);
  }

  // 3) Explicit Interest Match (20)
  let interest = 0;
  if (quest.interestId && interests.includes(quest.interestId)) interest = 1;
  else if (quest.path && activePaths.includes(quest.path)) interest = 0.7;

  // 4) Stat / Path Signal (10) — Verhaltens-Signale (Level 0..3)
  let signal = 0;
  const siMatch = quest.interestId &&
    signalInterests.find(si => (si.interestId || si) === quest.interestId);
  const spMatch = quest.path &&
    signalPaths.find(sp => (sp.pathId || sp) === quest.path);
  if (siMatch) signal = Math.max(signal, (siMatch.level ?? 1) / 3);
  if (spMatch) signal = Math.max(signal, (spMatch.level ?? 1) / 3);

  // 5) Balance Need (5)
  let balance = 0;
  if (quest.domain && neglectedDomains.includes(quest.domain)) balance = 1;
  else if (quest.cat && neglectedDomains.includes(quest.cat))  balance = 0.7;

  return goal * 35 + behavior * 30 + interest * 20 + signal * 10 + balance * 5;
}

// ── Quest-Grund (Etappe 6): nachvollziehbar, sprint-konform ──
export function buildQuestReason(quest, context = {}) {
  const {
    interests = [], activeGoals = [], neglectedDomains = [],
    signalInterests = [], signalPaths = [], recentDomains = {},
  } = context;

  if (quest.goalId) {
    const g = activeGoals.find(g => g.id === quest.goalId);
    if (g) return `wegen Ziel: ${g.title}`;
  }
  if (quest.domain) {
    const g = activeGoals.find(g => g.domain === quest.domain);
    if (g) return `wegen Ziel: ${g.title}`;
  }
  if (quest.interestId && interests.includes(quest.interestId)) {
    const label = INTERESTS[quest.interestId]?.label || quest.interestId;
    return `wegen Interesse: ${label}`;
  }
  if (quest.interestId && signalInterests.some(si => (si.interestId || si) === quest.interestId)) {
    const label = INTERESTS[quest.interestId]?.label || quest.interestId;
    return `deine letzten Quests zeigen ${label}`;
  }
  if (quest.path && signalPaths.some(sp => (sp.pathId || sp) === quest.path)) {
    const name = PATHS[quest.path]?.name || quest.path;
    return `dein ${name}-Signal wächst`;
  }
  const totalRecent = Object.values(recentDomains).reduce((s, n) => s + n, 0);
  if (totalRecent > 0 && quest.domain && recentDomains[quest.domain] >= 2) {
    return `deine letzten Quests zeigen Aktivität in diesem Bereich`;
  }
  if (quest.domain && neglectedDomains.includes(quest.domain)) {
    return `Balance empfohlen: ${quest.domain}`;
  }
  return "allgemeine Starter-Quest";
}

function questScore(quest, context) {
  // Etappe 6: delegiert an die Sprint-Scoring-Formel
  return scoreQuestCandidate(quest, context);
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

  // ── Theme-Gating (Etappe 2: Equal Start) ──
  // Spezifische Quests (Gym, Instrument, Kochen, Finanzen, …) sind nur
  // wählbar, wenn Interesse, Path, Goal oder Verhaltens-Signal passt.
  // Neutrale Quests sind immer wählbar.
  const themeCtx = buildThemeContext(context);

  // ── Daily Pool ──
  const dailyPool = (pools.daily || []).filter(q => questThemeMatches(q, themeCtx));
  // Sortiere nach Score + shuffle für Variation
  const scoredDaily = dailyPool.map(q => ({ q, score: questScore(q, context) + rngDay() * 8 }));
  scoredDaily.sort((a, b) => b.score - a.score);
  const selectedDaily = scoredDaily.slice(0, MAX_DAILY).map(s => ({ ...s.q, reason: buildQuestReason(s.q, context) }));

  // ── Weekly Pool ──
  const weeklyPool = (pools.weekly || []).filter(q => questThemeMatches(q, themeCtx));
  const scoredWeekly = weeklyPool.map(q => ({ q, score: questScore(q, context) + rngWeek() * 8 }));
  scoredWeekly.sort((a, b) => b.score - a.score);
  const selectedWeekly = scoredWeekly.slice(0, MAX_WEEKLY).map(s => ({ ...s.q, reason: buildQuestReason(s.q, context) }));

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

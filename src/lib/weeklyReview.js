// ============================================================
// WEEKLY REVIEW — Prompt 14
// Wöchentliche Reflexion mit automatischer Daten-Aggregation.
// XP-Bonus: max 100 XP, nur einmal pro Woche (anti-farmbar).
// ============================================================
import { getWeekKey, getTodayKey, isSameWeek } from "./dates.js";

const REVIEW_XP = 80;           // Basis-Bonus für Wochenreview
const REVIEW_XP_REFLECTION = 20;// Extra-Bonus wenn Reflexion ausgefüllt

/**
 * Erstellt ein neues Weekly-Review-Objekt.
 * @param {object} state       - vollständiger App-State
 * @param {object} reflection  - { wentWell, wasHard, learned, nextFocus }
 */
export function createWeeklyReview(state, reflection = {}) {
  const weekKey = getWeekKey();
  const today   = getTodayKey();

  const qh = Array.isArray(state.questHistory) ? state.questHistory : [];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6); // letzte 7 Tage

  // Filter: Quests dieser Woche
  const weekQuests = qh.filter(h => {
    if (!h.completedAt) return false;
    const d = new Date(h.completedAt);
    return d >= weekStart && d <= now;
  });

  // Domains dieser Woche
  const domainCounts = {};
  const pathCounts   = {};
  for (const q of weekQuests) {
    if (q.domain) domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
    if (q.path)   pathCounts[q.path]     = (pathCounts[q.path]     || 0) + 1;
  }
  const topDomains = Object.entries(domainCounts).sort(([,a],[,b]) => b-a).slice(0,3).map(([k]) => k);
  const topPaths   = Object.entries(pathCounts).sort(([,a],[,b]) => b-a).slice(0,3).map(([k]) => k);

  // Vernachlässigte Domains (in Balance Areas gesetzt aber nicht aktiv)
  const balanceAreas = state.player?.preferences?.balanceAreas || [];
  const activeDomains = new Set(topDomains);
  const neglectedDomains = balanceAreas.filter(d => !activeDomains.has(d));

  // Goals die diese Woche Fortschritt bekamen
  const completedGoalsThisWeek = (state.goals || []).filter(g =>
    g.status === "completed" && g.completedAt && isSameWeek(g.completedAt, today)
  );

  // Progress Logs dieser Woche
  const logsThisWeek = (state.progressLogs || []).filter(l =>
    l.createdAt && new Date(l.createdAt) >= weekStart
  );

  // XP diese Woche
  const xpThisWeek = (state.xpHistory || []).find(h => h.w === weekKey)?.v || 0;

  const hasReflection = !!(
    reflection.wentWell?.trim() ||
    reflection.wasHard?.trim()  ||
    reflection.learned?.trim()  ||
    reflection.nextFocus?.trim()
  );

  const xpBonus = REVIEW_XP + (hasReflection ? REVIEW_XP_REFLECTION : 0);

  return {
    id:               `review_${weekKey}`,
    weekKey,
    createdAt:        new Date().toISOString(),
    // Automatisch gesammelte Daten
    completedQuestsCount: weekQuests.length,
    xpThisWeek,
    topDomains,
    topPaths,
    completedGoals:   completedGoalsThisWeek.map(g => ({ id: g.id, title: g.title })),
    progressLogsCount: logsThisWeek.length,
    neglectedDomains,
    // Nutzer-Reflexion
    reflection: {
      wentWell:   (reflection.wentWell   || "").trim(),
      wasHard:    (reflection.wasHard    || "").trim(),
      learned:    (reflection.learned    || "").trim(),
      nextFocus:  (reflection.nextFocus  || "").trim(),
    },
    xpBonus,
    rewardClaimed: false,
  };
}

/**
 * Prüft ob für diese Woche schon ein Review existiert.
 */
export function hasReviewThisWeek(weeklyReviews) {
  const wk = getWeekKey();
  return (weeklyReviews || []).some(r => r.weekKey === wk);
}

/**
 * Gibt das aktuelle Wochenreview zurück (wenn vorhanden).
 */
export function getCurrentWeekReview(weeklyReviews) {
  const wk = getWeekKey();
  return (weeklyReviews || []).find(r => r.weekKey === wk) || null;
}

/**
 * Gibt Quests der aktuellen (oder letzten) Woche aus History zurück.
 * Für Preview im Review-UI.
 */
export function getWeekQuestStats(questHistory) {
  // Defensive: handle undefined/null/non-array input
  const safeHistory = Array.isArray(questHistory) ? questHistory : [];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);

  const weekQuests = safeHistory.filter(h => {
    if (!h.completedAt) return false;
    const d = new Date(h.completedAt);
    return d >= weekStart && d <= now;
  });

  const domainCounts = {};
  const pathCounts   = {};
  let totalXp = 0;

  for (const q of weekQuests) {
    if (q.domain) domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
    if (q.path)   pathCounts[q.path]     = (pathCounts[q.path]     || 0) + 1;
    totalXp += (q.xp || 0);
  }

  return {
    count:       weekQuests.length,
    totalXp,
    topDomains:  Object.entries(domainCounts).sort(([,a],[,b]) => b-a).slice(0, 4).map(([k,v]) => ({ domain: k, count: v })),
    topPaths:    Object.entries(pathCounts).sort(([,a],[,b]) => b-a).slice(0, 3).map(([k,v]) => ({ path: k, count: v })),
  };
}

/**
 * Maximale Reviews die gespeichert werden.
 */
const MAX_REVIEWS = 52; // Ein Jahr

/**
 * Fügt Review zur Liste hinzu (immutable).
 */
export function addWeeklyReview(weeklyReviews, review) {
  const existing = (weeklyReviews || []).filter(r => r.weekKey !== review.weekKey);
  return [...existing, review].slice(-MAX_REVIEWS);
}

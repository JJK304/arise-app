// ============================================================
// HISTORY — Quest-History Verwaltung
// Trennt Completion Lockout (täglicher/wöchentlicher Reset)
// von der dauerhaften Quest History (Analyse / Progress).
// ============================================================
import { getDayKey, getWeekKey } from "./dates.js";

// ── Completion Status ──────────────────────────────────────
// Struktur:
// completionStatus: {
//   daily:   { "2025-06-05": ["e_d1", "e_d2", ...] }
//   weekly:  { "2025-W23":   ["e_w1", ...] }
//   gates:   { "gate_scholar_1": { completed: true, rewardClaimed: true } }
//   goals:   { "goal_xyz": { completed: true, rewardClaimed: true } }
// }

/**
 * Prüft ob eine tägliche Quest heute bereits abgeschlossen wurde.
 */
export function isDailyDone(completionStatus, questId) {
  const today = getDayKey();
  return (completionStatus?.daily?.[today] || []).includes(questId);
}

/**
 * Prüft ob eine wöchentliche Quest diese Woche bereits abgeschlossen wurde.
 */
export function isWeeklyDone(completionStatus, questId) {
  const week = getWeekKey();
  return (completionStatus?.weekly?.[week] || []).includes(questId);
}

/**
 * Prüft ob eine Quest abgeschlossen werden kann (Lockout-Check).
 * Milestones: einmalig (completedForever).
 * Daily: einmal pro Tag.
 * Weekly: einmal pro Woche.
 * Custom/Recovery: wie daily.
 */
export function canComplete(completionStatus, questHistory, quest) {
  if (!quest) return false;

  // Milestone: einmalig für immer
  if (quest.type === "milestone") {
    return !(questHistory || []).some(h => h.id === quest.id);
  }

  // Weekly
  if (quest.type === "weekly") {
    return !isWeeklyDone(completionStatus, quest.id);
  }

  // Daily / Custom / Recovery / Personalized
  return !isDailyDone(completionStatus, quest.id);
}

/**
 * Markiert eine Quest als heute/diese Woche abgeschlossen.
 * Gibt ein neues completionStatus-Objekt zurück (immutable).
 */
export function markCompleted(completionStatus, quest) {
  const cs = {
    daily:  { ...(completionStatus?.daily  || {}) },
    weekly: { ...(completionStatus?.weekly || {}) },
    gates:  { ...(completionStatus?.gates  || {}) },
    goals:  { ...(completionStatus?.goals  || {}) },
  };

  if (quest.type === "weekly") {
    const week = getWeekKey();
    cs.weekly[week] = [...(cs.weekly[week] || []), quest.id];
  } else if (quest.type !== "milestone") {
    // Daily / Custom / Recovery / Personalized
    const today = getDayKey();
    cs.daily[today] = [...(cs.daily[today] || []), quest.id];
  }
  // Milestones werden über questHistory getrackt, nicht über completionStatus

  return cs;
}

/**
 * Bereinigt alten Completion-Status.
 * Daily: behalte nur die letzten 3 Tage (robuster bei Zeitzonenproblemen).
 * Weekly: behalte nur die letzten 3 Wochen.
 * Gates/Goals: nie löschen (permanent).
 */
export function pruneCompletionStatus(completionStatus) {
  if (!completionStatus) return { daily: {}, weekly: {}, gates: {}, goals: {} };

  const cs = {
    daily:  {},
    weekly: {},
    gates:  { ...(completionStatus.gates  || {}) },
    goals:  { ...(completionStatus.goals  || {}) },
  };

  const today = new Date();

  // Daily: behalte die letzten 3 Tage (Puffer für Zeitzonen)
  for (const [key, ids] of Object.entries(completionStatus.daily || {})) {
    const d = new Date(key + "T12:00:00"); // Noon to avoid TZ issues
    const diffDays = (today - d) / (1000 * 60 * 60 * 24);
    if (diffDays <= 3) cs.daily[key] = ids;
  }

  // Weekly: behalte die letzten 4 Wochen (ca. 28 Tage)
  // Einfaches Heuristic: "YYYY-WNN" → wir behalten alles der letzten 4 Wochen
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(today.getDate() - 28);
  for (const [key, ids] of Object.entries(completionStatus.weekly || {})) {
    // Parse "2025-W23" → approximate date (first day of that week)
    const match = key.match(/(\d{4})-W(\d{2})/);
    if (match) {
      const year = parseInt(match[1]);
      const week = parseInt(match[2]);
      // Jan 4 is always in ISO week 1
      const jan4 = new Date(year, 0, 4);
      const dayOfWeek = jan4.getDay() || 7;
      const weekStart = new Date(jan4);
      weekStart.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
      if (weekStart >= fourWeeksAgo) {
        cs.weekly[key] = ids;
      }
    } else {
      // Unknown format — keep it
      cs.weekly[key] = ids;
    }
  }

  return cs;
}

/**
 * Baut einen completionStatus aus dem alten completedChallenges-Array auf.
 * Wird für die Migration von sehr alten States genutzt.
 * Da wir nicht wissen welche IDs Daily vs Weekly vs Milestone waren,
 * können wir nur Milestones sicher zuordnen (nie in daily/weekly).
 */
export function buildCompletionStatusFromLegacy(completedChallenges, challenges_db, gateProgress) {
  const cs = { daily: {}, weekly: {}, gates: {}, goals: {} };

  // Gates aus gateProgress migrieren
  if (gateProgress && typeof gateProgress === "object") {
    for (const [gateId, progress] of Object.entries(gateProgress)) {
      if (progress?.completed) {
        cs.gates[gateId] = {
          completed:     true,
          rewardClaimed: progress.rewardClaimed || false,
        };
      }
    }
  }

  // Für legacy completedChallenges können wir Daily/Weekly nicht sicher rekonstruieren.
  // Wir lassen daily/weekly leer — der Reset-Mechanismus wird beim nächsten App-Start
  // korrekt initialisiert. Milestones werden über questHistory getrackt.

  return cs;
}

// ── Quest History ──────────────────────────────────────────

/** Maximale Anzahl History-Einträge */
const MAX_HISTORY = 500;

/**
 * Fügt einen Eintrag zur Quest History hinzu.
 * Hält die History auf maximal MAX_HISTORY Einträge.
 */
export function addHistoryEntry(questHistory, entry) {
  const history = [...(questHistory || []), entry];
  return history.slice(-MAX_HISTORY);
}

/**
 * Gibt History-Einträge der letzten N Tage zurück.
 */
export function getRecentHistory(questHistory, days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return (questHistory || []).filter(h => new Date(h.completedAt) >= cutoff);
}

/**
 * Zählt Abschlüsse pro Domain in der History.
 */
export function countByDomain(questHistory) {
  const counts = {};
  for (const entry of questHistory || []) {
    const d = entry.domain || "discipline";
    counts[d] = (counts[d] || 0) + 1;
  }
  return counts;
}

/**
 * Gibt die Domains zurück, die in den letzten N Tagen nicht aktiv waren.
 */
export function getNeglectedDomains(questHistory, domains, days = 5) {
  const recent = getRecentHistory(questHistory, days);
  const activeDomains = new Set(recent.map(h => h.domain).filter(Boolean));
  return domains.filter(d => !activeDomains.has(d));
}

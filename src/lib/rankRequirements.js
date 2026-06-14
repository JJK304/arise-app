// ============================================================
// RANK-UP REQUIREMENTS — Etappe 8
// "Leveln darf nicht nur durch einfache Daily-Spam-Quests
//  möglich sein." Ab D-Rank verlangen Rank-Ups zusätzlich zu
// XP echte Leistungen: Gates, Trials, Logs, Goals, Reviews,
// Konsistenz und (für SS/SSS) Mastery.
//
// XP wird bei gesperrtem Rank-Up NICHT verworfen — es staut
// sich an der Rank-Grenze und wird beim nächsten XP-Gewinn
// nach Erfüllung der Anforderungen eingelöst.
// Bestehende Ranks werden NIE zurückgestuft (nur künftige
// Aufstiege werden geprüft).
// ============================================================
import { GATES, isGateCompleted } from "../data/gates.js";
import { getTopSignalPaths } from "./signals.js";
import { countMasteredPaths } from "./mastery.js";
import { catToDomain } from "../data/domains.js";

const RANK_ORDER = ["E", "D", "C", "B", "A", "S", "SS", "SSS"];

// ── Metriken einmalig aus dem State ableiten ────────────────
function deriveMetrics(state = {}) {
  const questHistory  = Array.isArray(state.questHistory)  ? state.questHistory  : [];
  const progressLogs  = Array.isArray(state.progressLogs)  ? state.progressLogs  : [];
  const goals         = Array.isArray(state.goals)         ? state.goals         : [];
  const weeklyReviews = Array.isArray(state.weeklyReviews) ? state.weeklyReviews : [];
  const gateProgress  = state.gateProgress || {};
  const prefs         = state.player?.preferences || {};

  // Gate-/Trial-Zählung nach Typ und Tier
  let discoveryDone = 0, pathGatesT1 = 0, gatesT2 = 0, gatesT3 = 0;
  let trialsT1 = 0, trialsT2 = 0, trialsT3 = 0;
  for (const g of GATES) {
    if (g.special) continue;
    if (!isGateCompleted(g.id, gateProgress)) continue;
    const isTrial = String(g.id).startsWith("trial_");
    if (g.discovery)            discoveryDone++;
    else if (isTrial) {
      if (g.tier === 1) trialsT1++;
      if (g.tier === 2) trialsT2++;
      if (g.tier === 3) trialsT3++;
    } else {
      if (g.tier === 1) pathGatesT1++;
      if (g.tier === 2) gatesT2++;
      if (g.tier === 3) gatesT3++;
    }
  }
  const trialsTotal = trialsT1 + trialsT2 + trialsT3;

  // Konsistenz: aktive Tage in den letzten 30 Tagen
  const cutoff30 = Date.now() - 30 * 86400000;
  const recent30 = questHistory.filter(h => h.completedAt && new Date(h.completedAt) >= cutoff30);
  const activeDays30 = new Set(
    recent30.map(h => String(h.completedAt).slice(0, 10))
  ).size;

  // Breite: unterschiedliche aktive Domains in den letzten 30 Tagen.
  // Verhindert Tunnelblick — ab C verlangt der Aufstieg Aktivität in
  // mehreren Lebensbereichen (Körper UND Geist …), ohne Balance zu erzwingen.
  const domainsActive30 = new Set(
    recent30.map(h => h.domain || catToDomain(h.cat)).filter(Boolean)
  ).size;

  // Vitalitäts-Floor: Körper oder Recovery in den letzten 14 Tagen aktiv.
  // Man darf den eigenen Körper/Schlaf nicht komplett fürs Grinden opfern.
  const cutoff14 = Date.now() - 14 * 86400000;
  const bodyRecovery14 = questHistory.some(h => {
    if (!h.completedAt || new Date(h.completedAt) < cutoff14) return false;
    const d = h.domain || catToDomain(h.cat);
    return d === "body" || d === "recovery";
  }) ? 1 : 0;

  // Stärkstes Path-Signal (nur berechnet wenn benötigt — hier einmalig)
  let topSignalLevel = 0;
  try {
    const tops = getTopSignalPaths(state, 1);
    topSignalLevel = tops[0]?.level || 0;
  } catch (_) {}

  let mastered = 0;
  try { mastered = countMasteredPaths(state); } catch (_) {}

  return {
    totalQuests:    questHistory.length,
    weeklyClears:   questHistory.filter(h => h.type === "weekly").length,
    discoveryDone,
    pathGatesT1, gatesT2, gatesT3,
    trialsT1, trialsT2, trialsT3, trialsTotal,
    logs:           progressLogs.length,
    reviews:        weeklyReviews.length,
    completedGoals: goals.filter(g => g.status === "completed").length,
    goalProgress:   goals.filter(g => g.status === "completed" || (g.currentValue || 0) > 0).length,
    activeDays30,
    domainsActive30,
    bodyRecovery14,
    topSignalLevel,
    pathActive:     (prefs.activePaths || []).length > 0,
    mastered,
  };
}

// ── Anforderungen je Ziel-Rank (Sprint-Spezifikation) ───────
// check(M) → { done, have, need }
const req = (id, label, fn) => ({ id, label, fn });

export const RANK_UP_REQUIREMENTS = {
  D: [
    req("quests",    "10 Quests abgeschlossen",            M => ({ have: M.totalQuests,   need: 10 })),
    req("discovery", "1 Discovery Gate gecleart",          M => ({ have: M.discoveryDone, need: 1 })),
  ],
  C: [
    req("signal",    "1 Path-Signal entwickelt",           M => ({ have: M.topSignalLevel, need: 1 })),
    req("gate1",     "1 Path Gate I oder Trial I",         M => ({ have: M.pathGatesT1 + M.trialsT1, need: 1 })),
    req("weeklies",  "3 Weekly Quests abgeschlossen",      M => ({ have: M.weeklyClears,  need: 3 })),
    req("breadth",   "Aktiv in ≥3 Domains (30 Tage)",      M => ({ have: M.domainsActive30, need: 3 })),
  ],
  B: [
    req("path",      "1 Path aktiv (gewählt oder Signal stark)", M => ({ have: (M.pathActive || M.topSignalLevel >= 2) ? 1 : 0, need: 1 })),
    req("trial",     "1 Trial abgeschlossen",              M => ({ have: M.trialsTotal,   need: 1 })),
    req("logs",      "3 Progress Logs",                    M => ({ have: M.logs,          need: 3 })),
    req("goal",      "1 Goal mit Fortschritt",             M => ({ have: M.goalProgress,  need: 1 })),
    req("vitality",  "Körper oder Recovery aktiv (14 Tage)", M => ({ have: M.bodyRecovery14, need: 1 })),
  ],
  A: [
    req("tier2",     "Gate II oder Trial II gecleart",     M => ({ have: M.gatesT2 + M.trialsT2, need: 1 })),
    req("result",    "1 Goal abgeschlossen (messbares Ergebnis)", M => ({ have: M.completedGoals, need: 1 })),
    req("archive",   "Weekly Review oder 5 Progress Logs", M => ({ have: (M.reviews >= 1 || M.logs >= 5) ? 1 : 0, need: 1 })),
  ],
  S: [
    req("tier3",     "Gate III oder Trial III gecleart",   M => ({ have: M.gatesT3 + M.trialsT3, need: 1 })),
    req("goals",     "2 Goals abgeschlossen",              M => ({ have: M.completedGoals, need: 2 })),
    req("consistency","18 aktive Tage in den letzten 30",  M => ({ have: M.activeDays30,  need: 18 })),
    req("logs",      "8 Progress Logs",                    M => ({ have: M.logs,          need: 8 })),
    req("reviews",   "2 Weekly Reviews",                   M => ({ have: M.reviews,       need: 2 })),
    req("breadth",   "Aktiv in ≥4 Domains (30 Tage)",      M => ({ have: M.domainsActive30, need: 4 })),
  ],
  SS: [
    req("goals",     "3 Goals abgeschlossen",              M => ({ have: M.completedGoals, need: 3 })),
    req("trials",    "4 Trials abgeschlossen",             M => ({ have: M.trialsTotal,   need: 4 })),
    req("signal",    "Starkes Path-Signal (Level 3)",      M => ({ have: M.topSignalLevel, need: 3 })),
    req("history",   "250 Quests Langzeit-History",        M => ({ have: M.totalQuests,   need: 250 })),
    req("reviews",   "4 Weekly Reviews",                   M => ({ have: M.reviews,       need: 4 })),
  ],
  SSS: [
    req("mastery",   "2 Paths gemeistert",                 M => ({ have: M.mastered,      need: 2 })),
    req("goals",     "5 Goals abgeschlossen",              M => ({ have: M.completedGoals, need: 5 })),
    req("trials",    "6 Trials abgeschlossen",             M => ({ have: M.trialsTotal,   need: 6 })),
    req("reviews",   "6 Weekly Reviews",                   M => ({ have: M.reviews,       need: 6 })),
  ],
};

/**
 * Prüft die Nicht-XP-Anforderungen für den Aufstieg AUF targetRank.
 * @returns {{ met:boolean, targetRank:string, checks:[{id,label,done,have,need}] }}
 */
export function checkRankUpRequirements(state, targetRank) {
  const defs = RANK_UP_REQUIREMENTS[targetRank];
  if (!defs) return { met: true, targetRank, checks: [] }; // E / unbekannt: frei

  const M = deriveMetrics(state);
  const checks = defs.map(d => {
    const r = d.fn(M);
    return { id: d.id, label: d.label, have: r.have, need: r.need, done: r.have >= r.need };
  });
  return { met: checks.every(c => c.done), targetRank, checks };
}

/** Boolean-Shortcut für die Level-Up-Loops. */
export function canRankUpTo(state, targetRank) {
  return checkRankUpRequirements(state, targetRank).met;
}

/**
 * Status für die UI: Anforderungen des NÄCHSTEN Ranks.
 * @returns {{ nextRank, met, checks } | null} null wenn bereits SSS.
 */
export function getRankUpStatus(state) {
  const idx = RANK_ORDER.indexOf(state?.rank || "E");
  if (idx < 0 || idx >= RANK_ORDER.length - 1) return null;
  const nextRank = RANK_ORDER[idx + 1];
  const res = checkRankUpRequirements(state, nextRank);
  return { nextRank, met: res.met, checks: res.checks };
}

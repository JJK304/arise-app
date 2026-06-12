// ============================================================
// MASTERY SYSTEM — Etappe 7
// "Mastery bedeutet langfristigen echten Fortschritt."
//
// Sprint-Kriterien pro Path:
//   - 25 Quests in einem Path
//   - 3 Gates gecleart
//   - Trial II abgeschlossen
//   - Trial III abgeschlossen
//   - 10 Progress Logs
//   - 1 echtes Goal abgeschlossen
// (Messbares Ergebnis ist über Trial III + Logs abgedeckt —
//  Trials verlangen dokumentierte Anwendung.)
//
// Keine doppelten Rewards: Mastery-Status wird aus State
// ABGELEITET (deterministisch), nicht separat vergeben.
// Eine spätere Reward-Vergabe (Etappe 8/11) muss über
// state.masteryClaimed[pathId] einmalig geguarded werden.
// ============================================================
import { PATHS } from "../data/paths.js";
import { GATES, isGateCompleted } from "../data/gates.js";

export const MASTERY_REQUIREMENTS = {
  quests:  25,
  gates:   3,
  logs:    10,
  goals:   1,
  // + Trial II und Trial III des Paths
};

/**
 * Berechnet den Mastery-Fortschritt eines Paths.
 * @returns {{
 *   pathId: string,
 *   quests:  { have:number, need:number, done:boolean },
 *   gates:   { have:number, need:number, done:boolean },
 *   trialII: boolean,
 *   trialIII:boolean,
 *   logs:    { have:number, need:number, done:boolean },
 *   goals:   { have:number, need:number, done:boolean },
 *   achieved:boolean,
 *   pct:     number   // 0..100 Gesamtfortschritt
 * }}
 */
export function getPathMastery(state = {}, pathId) {
  const path = PATHS[pathId];
  const questHistory = Array.isArray(state.questHistory) ? state.questHistory : [];
  const progressLogs = Array.isArray(state.progressLogs) ? state.progressLogs : [];
  const goals        = Array.isArray(state.goals)        ? state.goals        : [];
  const gateProgress = state.gateProgress || {};

  if (!path) {
    return {
      pathId, quests: { have: 0, need: MASTERY_REQUIREMENTS.quests, done: false },
      gates: { have: 0, need: MASTERY_REQUIREMENTS.gates, done: false },
      trialII: false, trialIII: false,
      logs: { have: 0, need: MASTERY_REQUIREMENTS.logs, done: false },
      goals: { have: 0, need: MASTERY_REQUIREMENTS.goals, done: false },
      achieved: false, pct: 0,
    };
  }

  const primaryDomain = (path.domains || [])[0] || null;

  // 1) Quests im Path (direkter Path-Match oder Primär-Domain)
  const questCount = questHistory.filter(h =>
    h.path === pathId || (primaryDomain && (h.domain === primaryDomain || h.cat === primaryDomain))
  ).length;

  // 2) Gates des Paths gecleart (ohne Trials)
  const pathGateIds = GATES
    .filter(g => g.path === pathId && !String(g.id).startsWith("trial_") && !g.special)
    .map(g => g.id);
  const gateCount = pathGateIds.filter(id => isGateCompleted(id, gateProgress)).length;

  // 3) Trials II + III
  const trialII  = isGateCompleted(`trial_${pathId}_2`, gateProgress);
  const trialIII = isGateCompleted(`trial_${pathId}_3`, gateProgress);

  // 4) Progress Logs (Path oder Primär-Domain)
  const logCount = progressLogs.filter(l =>
    l.path === pathId || (primaryDomain && l.domain === primaryDomain)
  ).length;

  // 5) Abgeschlossene Goals (Path oder Primär-Domain)
  const goalCount = goals.filter(g =>
    g.status === "completed" &&
    (g.path === pathId || (primaryDomain && g.domain === primaryDomain))
  ).length;

  const R = MASTERY_REQUIREMENTS;
  const result = {
    pathId,
    quests:   { have: questCount, need: R.quests, done: questCount >= R.quests },
    gates:    { have: gateCount,  need: R.gates,  done: gateCount  >= R.gates },
    trialII,
    trialIII,
    logs:     { have: logCount,   need: R.logs,   done: logCount   >= R.logs },
    goals:    { have: goalCount,  need: R.goals,  done: goalCount  >= R.goals },
  };

  const checks = [
    result.quests.done, result.gates.done, result.trialII,
    result.trialIII, result.logs.done, result.goals.done,
  ];
  result.achieved = checks.every(Boolean);

  // Gesamtfortschritt: Teilfortschritte gemittelt (Trials binär)
  const partial = [
    Math.min(1, questCount / R.quests),
    Math.min(1, gateCount  / R.gates),
    trialII  ? 1 : 0,
    trialIII ? 1 : 0,
    Math.min(1, logCount   / R.logs),
    Math.min(1, goalCount  / R.goals),
  ];
  result.pct = Math.round((partial.reduce((s, v) => s + v, 0) / partial.length) * 100);

  return result;
}

/**
 * Mastery-Übersicht über alle spielbaren Paths.
 * @returns {{ pathId, achieved, pct }[]} sortiert nach Fortschritt
 */
export function getMasteryOverview(state = {}) {
  return Object.values(PATHS)
    .filter(p => !p.special)
    .map(p => {
      const m = getPathMastery(state, p.id);
      return { pathId: p.id, achieved: m.achieved, pct: m.pct };
    })
    .sort((a, b) => b.pct - a.pct);
}

/**
 * Anzahl gemeisterter Paths (für Shadow-Ascendant-Progression / Etappe 8).
 */
export function countMasteredPaths(state = {}) {
  return getMasteryOverview(state).filter(m => m.achieved).length;
}

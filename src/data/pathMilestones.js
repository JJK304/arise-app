// ============================================================
// PATH MILESTONES — Etappe 9: Content-Parität
// 10 Milestones je Path (Sprint-Liste), programmatisch
// generiert — exakt gleich für alle 14 Paths, kein Path
// bevorzugt. Sie existieren im Hintergrund und werden wie
// Achievements automatisch freigeschaltet (Toast); die
// Visualisierung folgt im Level Tree (Etappe 11).
//
// Sprint-Kriterien je Path:
//   5 / 10 / 25 Quests · Gate I · Gate II · Trial I · Trial II
//   · erstes Goal · 5 Progress Logs · Stat-Schwelle
// ============================================================
import { PATHS } from "./paths.js";
import { isGateCompleted } from "./gates.js";

const STAT_THRESHOLD = 15;

// ── Zähl-Helfer (defensiv) ─────────────────────────────────
function pathQuestCount(state, pathId, primaryDomain) {
  return (state.questHistory || []).filter(h =>
    h.path === pathId || (primaryDomain && (h.domain === primaryDomain || h.cat === primaryDomain))
  ).length;
}
function pathLogCount(state, pathId, primaryDomain) {
  return (state.progressLogs || []).filter(l =>
    l.path === pathId || (primaryDomain && l.domain === primaryDomain)
  ).length;
}
function pathGoalDone(state, pathId, primaryDomain) {
  return (state.goals || []).some(g =>
    g.status === "completed" &&
    (g.path === pathId || (primaryDomain && g.domain === primaryDomain))
  );
}

// ── Generator: 10 Milestones je Path ───────────────────────
function buildMilestonesFor(path) {
  const p = path.id;
  const d = (path.domains || [])[0] || null;
  const name = path.name;
  const icon = path.icon;
  const stat = (path.stats || [])[0] || "END";

  return [
    { id: `pm_${p}_q5`,   pathId: p, icon, title: `${name} — Erste Schritte`,  desc: `5 Quests auf dem ${name}-Pfad abgeschlossen`,
      check: s => pathQuestCount(s, p, d) >= 5 },
    { id: `pm_${p}_q10`,  pathId: p, icon, title: `${name} — In Bewegung`,     desc: `10 Quests auf dem ${name}-Pfad abgeschlossen`,
      check: s => pathQuestCount(s, p, d) >= 10 },
    { id: `pm_${p}_q25`,  pathId: p, icon, title: `${name} — Verankert`,       desc: `25 Quests auf dem ${name}-Pfad abgeschlossen`,
      check: s => pathQuestCount(s, p, d) >= 25 },
    { id: `pm_${p}_g1`,   pathId: p, icon, title: `${name} — Gate I bezwungen`,  desc: `${name} Gate I gecleart`,
      check: s => isGateCompleted(`gate_${p}_1`, s.gateProgress || {}) },
    { id: `pm_${p}_g2`,   pathId: p, icon, title: `${name} — Gate II bezwungen`, desc: `${name} Gate II gecleart`,
      check: s => isGateCompleted(`gate_${p}_2`, s.gateProgress || {}) },
    { id: `pm_${p}_t1`,   pathId: p, icon, title: `${name} — Erste Prüfung`,     desc: `${name} Trial I bestanden`,
      check: s => isGateCompleted(`trial_${p}_1`, s.gateProgress || {}) },
    { id: `pm_${p}_t2`,   pathId: p, icon, title: `${name} — Bewährt`,           desc: `${name} Trial II bestanden`,
      check: s => isGateCompleted(`trial_${p}_2`, s.gateProgress || {}) },
    { id: `pm_${p}_goal`, pathId: p, icon, title: `${name} — Zielstrebig`,       desc: `Erstes Goal auf diesem Pfad abgeschlossen`,
      check: s => pathGoalDone(s, p, d) },
    { id: `pm_${p}_logs`, pathId: p, icon, title: `${name} — Dokumentiert`,      desc: `5 Progress Logs auf diesem Pfad`,
      check: s => pathLogCount(s, p, d) >= 5 },
    { id: `pm_${p}_stat`, pathId: p, icon, title: `${name} — Spürbar stärker`,   desc: `${stat} hat die Schwelle ${STAT_THRESHOLD} erreicht`,
      check: s => ((s.stats || {})[stat] || 0) >= STAT_THRESHOLD },
  ];
}

export const PATH_MILESTONES = {};
for (const path of Object.values(PATHS)) {
  if (path.special) continue; // Shadow Ascendant: Mastery-System statt Standard-Milestones
  PATH_MILESTONES[path.id] = buildMilestonesFor(path);
}

export const ALL_PATH_MILESTONES = Object.values(PATH_MILESTONES).flat();

/**
 * Fortschritt aller Milestones eines Paths.
 * @returns {{ milestones:[{...m, done}], doneCount, total }}
 */
export function getPathMilestoneProgress(state = {}, pathId) {
  const list = PATH_MILESTONES[pathId] || [];
  const milestones = list.map(m => {
    let done = false;
    try { done = !!m.check(state); } catch (_) {}
    return { ...m, done };
  });
  return {
    milestones,
    doneCount: milestones.filter(m => m.done).length,
    total: milestones.length,
  };
}

/**
 * Neu erfüllte (noch nicht freigeschaltete) Path-Milestones.
 * @param {Set|string[]} unlockedIds - bereits freigeschaltete IDs
 */
export function findNewPathMilestones(state = {}, unlockedIds = []) {
  const unlocked = unlockedIds instanceof Set ? unlockedIds : new Set(unlockedIds);
  const out = [];
  for (const m of ALL_PATH_MILESTONES) {
    if (unlocked.has(m.id)) continue;
    try { if (m.check(state)) out.push(m); } catch (_) {}
  }
  return out;
}

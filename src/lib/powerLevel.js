// ============================================================
// POWER LEVEL — eine einzige, nicht-grindbare Fortschrittszahl.
//
// Steigt NUR durch echte Verbesserung:
//   • Stat-Punkte  — jeder Punkt = eine echte Leistung (Milestone,
//                    Quest-Rekord oder Körper-PR). XP-Farmen gibt keine.
//   • Quest-Rekorde — Breite gemessener Selbst-Verbesserung (PBs).
//   • Meilensteine  — geschlagene Gates.
//   • Level         — nur schwach gewichtet (XP ist semi-grindbar).
//
// Ein BREITE-Multiplikator (Körper × Geist) deckelt eindimensionales
// Hochziehen: wer nur den Körper ODER nur den Geist trainiert, lässt
// einen Großteil seines Power Levels gesperrt. Balance gibt einen Bonus.
// → erzwingt genau die Breite "Körper und Geist".
// ============================================================

// Die zwei Achsen, auf denen Balance zählt (vom Nutzer benannt: Körper & Geist).
export const BODY_STATS = ["STR", "AGI", "VIT"]; // Kraft, Ausdauer, Vitalität
export const MIND_STATS = ["INT", "CRE", "END"]; // Wissen, Kreativität, Disziplin
// CRA (Handwerk) + CHA/SOC/REL/APP (Sozial) zählen zum Gesamt-Pool,
// aber nicht zur Körper/Geist-Balance.

// Gewichte — ein Stat-Punkt soll sich spürbar bewegen.
export const PWR_WEIGHTS = {
  stat:      12, // pro Stat-Punkt (PR/Milestone)
  record:     4, // pro getracktem Personal Best
  milestone:  8, // pro abgeschlossenem Meilenstein
  level:      2, // pro Global-Level (niedrig: XP ist grindbar)
};

const numVal = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

/** Summe ausgewählter Stat-Keys (fehlende/ungültige → 0). */
export function sumStats(stats = {}, keys) {
  return (keys || []).reduce((s, k) => s + numVal(stats?.[k]), 0);
}

/** Körper- und Geist-Teilscore (reine Stat-Summen der jeweiligen Achse). */
export function getAxisScores(stats = {}) {
  return { body: sumStats(stats, BODY_STATS), mind: sumStats(stats, MIND_STATS) };
}

/**
 * Breite-Multiplikator aus Körper/Geist-Verhältnis.
 *   • beide 0            → 1.00  (noch kein Fortschritt, neutral)
 *   • eine Achse leer    → 0.70  (einseitig → Bonus gesperrt)
 *   • perfekt balanciert → 1.15  (Breite belohnt)
 * Dazwischen linear nach dem Verhältnis schwächere/stärkere Achse.
 */
export function breadthMultiplier(body = 0, mind = 0) {
  const b = numVal(body), m = numVal(mind);
  if (b <= 0 && m <= 0) return 1.0;
  const lo = Math.min(b, m), hi = Math.max(b, m);
  if (lo <= 0) return 0.7;
  return 0.7 + (lo / hi) * 0.45; // 0.70 (einseitig) .. 1.15 (balanciert)
}

/**
 * Berechnet das Power Level aus dem State.
 * @param {object} state  - { stats, questRecords, completedMilestones, level }
 * @param {object} [opts] - { globalLevel, milestonesDone } für exakte Werte aus App
 * @returns {{ value, raw, mult, body, mind, statTotal, recordCount, milestones, level, balancePct, weakAxis }}
 */
export function computePowerLevel(state = {}, opts = {}) {
  const stats = state.stats || {};
  // Jeder Stat-Punkt liegt in genau einem Bucket → simple Gesamtsumme, kein Doppelzählen.
  const statTotal   = Object.values(stats).reduce((s, v) => s + numVal(v), 0);
  const { body, mind } = getAxisScores(stats);

  const recordCount = Object.keys(state.questRecords || {}).length;
  const milestones  = opts.milestonesDone ?? (state.completedMilestones || []).length;
  const level       = opts.globalLevel ?? state.level ?? 1;

  const raw =
      statTotal   * PWR_WEIGHTS.stat +
      recordCount * PWR_WEIGHTS.record +
      milestones  * PWR_WEIGHTS.milestone +
      level       * PWR_WEIGHTS.level;

  const mult  = breadthMultiplier(body, mind);
  const value = Math.round(raw * mult);

  // Balance 0..100 (0 = komplett einseitig, 100 = perfekt ausgeglichen)
  const lo = Math.min(body, mind), hi = Math.max(body, mind);
  const balancePct = hi > 0 ? Math.round((lo / hi) * 100) : (body === 0 && mind === 0 ? 100 : 0);
  const weakAxis = body === mind ? null : (body < mind ? "body" : "mind");

  return { value, raw, mult, body, mind, statTotal, recordCount, milestones, level, balancePct, weakAxis };
}

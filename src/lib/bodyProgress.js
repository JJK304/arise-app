// ============================================================
// BODY PROGRESS — messbare Körper-Progression.
// Koppelt ECHTE Lifts/Werte an Fortschritt: Personal Records,
// Kraft-Score (Powerlifting-Total), Fortschritt-vs-früher.
// PRs vergeben Stat-Punkte — anti-grind, weil ein PR einen echten
// neuen Bestwert verlangt (nicht farmbar durch Wiederholen).
// ============================================================

export const BODY_METRICS = {
  weight:   { label: "Gewicht",    unit: "kg",  stat: "VIT", lowerBetter: true  },
  bf:       { label: "Körperfett", unit: "%",   stat: "VIT", lowerBetter: true  },
  bench:    { label: "Bench",      unit: "kg",  stat: "STR", lowerBetter: false },
  squat:    { label: "Squat",      unit: "kg",  stat: "STR", lowerBetter: false },
  deadlift: { label: "Deadlift",   unit: "kg",  stat: "STR", lowerBetter: false },
  pullups:  { label: "Pull-ups",   unit: "",    stat: "STR", lowerBetter: false },
  run5k:    { label: "5 km",       unit: "min", stat: "AGI", lowerBetter: true  },
};

const STRENGTH_KEYS = ["squat", "bench", "deadlift"]; // Powerlifting-Total (kg)

const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

/** Bestwert je Metrik über alle Einträge (Richtung beachtet). */
export function getPersonalBests(entries = []) {
  const best = {};
  for (const e of entries || []) {
    for (const k of Object.keys(BODY_METRICS)) {
      const v = num(e?.[k]);
      if (v === null) continue;
      best[k] = !(k in best) ? v
        : (BODY_METRICS[k].lowerBetter ? Math.min(best[k], v) : Math.max(best[k], v));
    }
  }
  return best;
}

/**
 * Neue Rekorde im neuesten Eintrag (entries[0]) gegenüber allen vorherigen.
 * Erster Eintrag → keine Rekorde (nichts zu schlagen).
 * @returns {Array<{metric,value,prev,delta,stat,label,unit}>}
 */
export function detectNewRecords(entries = []) {
  const list = entries || [];
  if (list.length < 2) return [];
  const latest    = list[0];
  const priorBest = getPersonalBests(list.slice(1));
  const records = [];
  for (const k of Object.keys(BODY_METRICS)) {
    const v = num(latest?.[k]);
    if (v === null || !(k in priorBest)) continue;
    const m    = BODY_METRICS[k];
    const isPR = m.lowerBetter ? v < priorBest[k] : v > priorBest[k];
    if (!isPR) continue;
    records.push({
      metric: k, value: v, prev: priorBest[k],
      delta: Math.round((v - priorBest[k]) * 10) / 10,
      stat: m.stat, label: m.label, unit: m.unit,
    });
  }
  return records;
}

/** Kraft-Score (Powerlifting-Total in kg) eines Eintrags. */
export function strengthScore(entry = {}) {
  let total = 0;
  for (const k of STRENGTH_KEYS) { const v = num(entry?.[k]); if (v !== null) total += v; }
  return Math.round(total);
}

/** Kraft-Fortschritt: aktuell vs. erster Eintrag (+ Bestwert). */
export function getStrengthProgress(entries = []) {
  const withS = (entries || []).filter(e => STRENGTH_KEYS.some(k => num(e?.[k]) !== null));
  if (withS.length === 0) return { current: 0, start: 0, delta: 0, best: 0, hasData: false };
  const current = strengthScore(withS[0]);
  const start   = strengthScore(withS[withS.length - 1]);
  const best    = Math.max(...withS.map(strengthScore));
  return { current, start, delta: current - start, best, hasData: true };
}

/** PRs → aggregierte Stat-Punkte ({ STR:2, AGI:1, … }). */
export function recordStatGains(records = []) {
  const gains = {};
  for (const r of records || []) gains[r.stat] = (gains[r.stat] || 0) + 1;
  return gains;
}

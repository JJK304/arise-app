// ============================================================
// QUEST RECORDS — Progressive Overload auf trackbaren Quests.
// "Schlag deinen letzten Wert": pro Quest-id wird der Bestwert
// gespeichert. Ein NEUER Rekord (höher als bisher) gibt einen
// Stat-Punkt — anti-grind & konsistent mit den Körper-PRs.
// Der erste geloggte Wert ist die Baseline (kein Rekord).
//   records = { [questId]: bestValue }
// ============================================================

export function getQuestBest(records = {}, id) {
  const v = records?.[id];
  return Number.isFinite(v) ? v : null;
}

/** Neuer Rekord? Erster Wert = Baseline (kein Rekord), danach: höher als bisher. */
export function isQuestRecord(records = {}, id, value) {
  const v = parseFloat(value);
  if (!Number.isFinite(v)) return false;
  const best = getQuestBest(records, id);
  return best !== null && v > best;
}

/** Speichert den Wert als neuen Bestwert (Baseline beim ersten Mal, sonst nur wenn höher). */
export function applyQuestRecord(records = {}, id, value) {
  const v = parseFloat(value);
  if (!Number.isFinite(v)) return records;
  const best = getQuestBest(records, id);
  if (best === null) return { ...records, [id]: v }; // Baseline
  if (v <= best)     return records;                 // kein neuer Bestwert
  return { ...records, [id]: v };
}

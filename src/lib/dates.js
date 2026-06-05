// ============================================================
// DATES — Sichere Datums- und Wochenschlüssel-Funktionen
// Bugfix: getWeekStr() verwendete Math.ceil(date/7) was bei
// Monatswechsel fehlerhafte Wochennummern lieferte.
// Neu: ISO-Wochennummer (ISO 8601) für stabilen Weekly-Reset.
//
// Edge-cases getestet:
//   - Monatswechsel (z.B. 31.01 → 01.02)
//   - Jahreswechsel (z.B. 31.12.2024 → 01.01.2025)
//   - ISO-Woche über Jahreswechsel (z.B. 30.12.2024 → ISO 2025-W01)
//   - Jahresanfang wenn KW1 im Vorjahr beginnt
// ============================================================

/**
 * Gibt einen stabilen Tages-Key zurück: "YYYY-MM-DD"
 * Sicher über Monatswechsel und Jahreswechsel.
 */
export function getDayKey(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Berechnet die ISO-Wochennummer (ISO 8601) eines Datums.
 * Woche 1 = die Woche mit dem ersten Donnerstag des Jahres.
 * Stabil über Monatswechsel und Jahreswechsel.
 *
 * Beispiel: 30.12.2024 → 2025-W01 (weil der Donnerstag dieser Woche im Jan 2025 liegt)
 */
export function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Donnerstag dieser Woche (ISO: Woche beginnt Montag)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

/**
 * Gibt einen stabilen Wochen-Key zurück: "YYYY-WNN"
 * Sicher über Monatswechsel (z.B. 31.12 und 1.1 können
 * zur selben ISO-Woche gehören → gleicher Key).
 */
export function getWeekKey(date = new Date()) {
  const { year, week } = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Prüft ob zwei Daten am selben Kalendertag liegen.
 */
export function isSameDay(a, b) {
  return getDayKey(new Date(a)) === getDayKey(new Date(b));
}

/**
 * Prüft ob zwei Daten in derselben ISO-Woche liegen.
 */
export function isSameWeek(a, b) {
  return getWeekKey(new Date(a)) === getWeekKey(new Date(b));
}

/**
 * Gibt den heutigen Tages-Key zurück (Shortcut für App.jsx).
 * Ersetzt getTodayStr() aus helpers.js (war nicht ISO-konform).
 */
export function getTodayKey() {
  return getDayKey(new Date());
}

/**
 * Gibt den aktuellen Wochen-Key zurück (Shortcut für App.jsx).
 * Ersetzt getWeekStr() aus helpers.js (hatte Monatswechsel-Bug).
 */
export function getTodayWeekKey() {
  return getWeekKey(new Date());
}

/**
 * Gibt den Tages-Key für gestern zurück.
 * Sicher über Monatswechsel und Jahreswechsel.
 */
export function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDayKey(d);
}

/**
 * Gibt den Tages-Key für N Tage in der Zukunft/Vergangenheit zurück.
 * offset < 0 = Vergangenheit, offset > 0 = Zukunft.
 */
export function getOffsetDayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return getDayKey(d);
}

/**
 * Prüft ob ein Tages-Key heute ist.
 */
export function isToday(dayKey) {
  return dayKey === getTodayKey();
}

/**
 * Prüft ob ein Wochen-Key diese Woche ist.
 */
export function isThisWeek(weekKey) {
  return weekKey === getTodayWeekKey();
}

/**
 * Gibt alle Tages-Keys der aktuellen ISO-Woche zurück (Mo–So).
 * Nützlich für Weekly-Reset-Überprüfungen.
 */
export function getCurrentWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // 1=Mo, 7=So
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek - 1));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(getDayKey(d));
  }
  return days;
}

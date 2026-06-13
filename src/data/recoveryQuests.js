// ============================================================
// RECOVERY & BALANCE QUESTS
// Fördern Regeneration, Ordnung und mentale Stabilität.
// Werden vorgeschlagen wenn Bereiche vernachlässigt wurden,
// der Streak gefährdet ist oder wenig erledigt wurde.
// ============================================================

// Feste Recovery-Quests (keine Template-Variablen nötig)
export const RECOVERY_QUESTS = [
  // ── Bewegung / Regeneration ──
  {
    id:       "rec_spaziergang",
    title:    "20 Min. Spaziergang ohne Handy",
    desc:     "Raus. Keine Ablenkung. Gedanken setzen lassen.",
    xp:       22,
    stat:     "VIT", statPts: 0,
    type:     "daily", cat: "health",
    path:     "runner",
    recovery: true,
    balanceArea: "recovery",
  },
  {
    id:       "rec_stretching",
    title:    "10 Min. Stretching",
    desc:     "Hüfte, Schultern, Oberschenkel — Körper entspannen.",
    xp:       18,
    stat:     "AGI", statPts: 0,
    type:     "daily", cat: "cardio",
    path:     "runner",
    recovery: true,
    balanceArea: "mobility",
  },
  {
    id:       "rec_mobility",
    title:    "Mobility Session (15 Min.)",
    desc:     "Gelenke mobilisieren, Faszien lockern.",
    xp:       20,
    stat:     "AGI", statPts: 0,
    type:     "daily", cat: "cardio",
    path:     "runner",
    recovery: true,
    balanceArea: "mobility",
  },

  // ── Schlaf / Erholung ──
  {
    id:       "rec_fruehschlafen",
    title:    "Vor 23 Uhr schlafen",
    desc:     "Regeneration beginnt im Schlaf.",
    xp:       18,
    stat:     "VIT", statPts: 0,
    type:     "daily", cat: "health",
    path:     "fighter",
    recovery: true,
    balanceArea: "schlaf",
  },
  {
    id:       "rec_atemübung",
    title:    "5 Min. Atemübung",
    desc:     "4–7–8 Technik oder Box Breathing. Nervensystem beruhigen.",
    xp:       15,
    stat:     "END", statPts: 0,
    type:     "daily", cat: "health",
    path:     null,
    recovery: true,
    balanceArea: "recovery",
  },

  // ── Ordnung / Reset ──
  {
    id:       "rec_zimmer_reset",
    title:    "Zimmer resetten",
    desc:     "Aufräumen, Schreibtisch freimachen, Umgebung in Ordnung bringen.",
    xp:       20,
    stat:     "END", statPts: 0,
    type:     "daily", cat: "discipline",
    path:     null,
    recovery: true,
    balanceArea: "ordnung",
  },
  {
    id:       "rec_digitales_aufräumen",
    title:    "Digitales Aufräumen (10 Min.)",
    desc:     "Notifications leeren, Tabs schließen, kurz defragmentieren.",
    xp:       15,
    stat:     "END", statPts: 0,
    type:     "daily", cat: "discipline",
    path:     null,
    recovery: true,
    balanceArea: "ordnung",
  },

  // ── Ernährung / Wasser ──
  {
    id:       "rec_wasser",
    title:    "2L Wasser trinken",
    desc:     "Hydration ist unterschätzt. Heute konsequent.",
    xp:       15,
    stat:     "VIT", statPts: 0,
    type:     "daily", cat: "health",
    path:     null,
    recovery: true,
    balanceArea: "ernaehrung",
  },
  {
    id:       "rec_mahlzeit",
    title:    "Ausgewogene Mahlzeit zubereiten",
    desc:     "Protein, Gemüse, kein Junk. Selbst gemacht zählt doppelt.",
    xp:       22,
    stat:     "VIT", statPts: 0,
    type:     "daily", cat: "health",
    path:     "artisan",
    recovery: true,
    balanceArea: "ernaehrung",
  },

  // ── Social ──
  {
    id:       "rec_social_offline",
    title:    "30 Min. ohne Social Media",
    desc:     "Handy weglegen. Etwas Echtes tun oder nur dasein.",
    xp:       18,
    stat:     "END", statPts: 0,
    type:     "daily", cat: "discipline",
    path:     null,
    recovery: true,
    balanceArea: "social",
  },
  {
    id:       "rec_freund_kontakt",
    title:    "Echten Kontakt aufnehmen",
    desc:     "Einem Freund oder Familienmitglied schreiben oder anrufen.",
    xp:       20,
    stat:     "CHA", statPts: 0,
    type:     "daily", cat: "social",
    path:     "charmer",
    recovery: true,
    balanceArea: "social",
  },

  // ── Reflexion ──
  {
    id:       "rec_reflexion",
    title:    "Kurzes Tages-Log schreiben",
    desc:     "Was lief heute gut? Was nimmst du mit?",
    xp:       18,
    stat:     "END", statPts: 0,
    type:     "daily", cat: "discipline",
    path:     "scholar",
    recovery: true,
    balanceArea: "recovery",
  },
];

// Mindest-Tage ohne Aktivität, bevor Recovery vorgeschlagen wird
const STREAK_DANGER_DAYS = 1;  // Heute noch nichts erledigt
const NEGLECT_DAYS       = 4;  // Bereich X Tage nicht gemacht

/**
 * Entscheidet welche Recovery-Quests vorgeschlagen werden.
 * Gibt max. 4 zurück, priorisiert nach Relevanz.
 *
 * @param {object} sysAnalysis   - Ergebnis von analyzeSystem()
 * @param {string[]} completedToday - IDs heute erledigter Quests
 * @param {number}  currentStreak
 * @param {string[]} balanceAreas  - preferences.balanceAreas
 * @returns {Quest[]}
 */
export function getRecoveryQuests(sysAnalysis, completedToday = [], currentStreak = 0, balanceAreas = []) {
  const selected = new Set();
  const result   = [];

  const push = (id) => {
    if (selected.has(id)) return;
    const q = RECOVERY_QUESTS.find(r => r.id === id);
    if (q && !completedToday.includes(id)) { selected.add(id); result.push(q); }
  };

  // 1. Streak in Gefahr (heute noch nichts erledigt)
  if (completedToday.length === 0 && currentStreak > 0) {
    push("rec_spaziergang");
    push("rec_atemübung");
  }

  // 2. Vernachlässigte Bereiche aus System-Analyse
  for (const { domain } of (sysAnalysis?.neglectedDomains || [])) {
    if (domain === "health")   { push("rec_wasser"); push("rec_mahlzeit"); }
    if (domain === "social")   { push("rec_social_offline"); push("rec_freund_kontakt"); }
    if (domain === "cardio")   { push("rec_stretching"); push("rec_spaziergang"); }
  }

  // 3. Nutzer-definierte Balance-Bereiche (aus Preferences)
  for (const area of balanceAreas) {
    if (area === "schlaf")      push("rec_fruehschlafen");
    if (area === "ernaehrung")  { push("rec_wasser"); push("rec_mahlzeit"); }
    if (area === "recovery")    { push("rec_atemübung"); push("rec_reflexion"); }
    if (area === "social")      push("rec_freund_kontakt");
    if (area === "ordnung")     push("rec_zimmer_reset");
    if (area === "mobility")    push("rec_mobility");
  }

  // 4. Fallback: immer ein paar Basics
  if (result.length === 0) {
    push("rec_spaziergang");
    push("rec_wasser");
    push("rec_reflexion");
  }

  return result.slice(0, 4);
}

/**
 * Prüft ob aktuell Recovery-Quests besonders empfohlen werden sollten.
 * Gibt einen Hinweistext zurück oder null.
 */
export function getRecoveryHint(sysAnalysis, completedToday, currentStreak) {
  if (completedToday.length === 0 && currentStreak > 2) {
    return { text: "System Recovery empfohlen — Streak aktiv halten", icon: "🔄", urgent: true };
  }
  if ((sysAnalysis?.neglectedDomains?.length || 0) >= 2) {
    return { text: "Balance Quest verfügbar — mehrere Bereiche vernachlässigt", icon: "⚖️", urgent: false };
  }
  if (sysAnalysis?.balanceHints?.length > 0) {
    return { text: "Dein Körper benötigt Regeneration", icon: "💚", urgent: false };
  }
  return null;
}

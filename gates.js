// ============================================================
// GATE QUESTS
// Mehrstufige Prüfungs-Quests mit XP, Affinity und Titeln.
// Progress wird in state.gateProgress gespeichert.
// Rewards werden einmalig vergeben (kein doppelter Reward).
// ============================================================

export const GATES = [
  // ── Scholar ──
  {
    id:     "gate_scholar_1",
    title:  "Scholar Gate I — Theory Breaker",
    path:   "scholar",
    domain: "uni",
    icon:   "🧠",
    color:  "#3b82f6",
    steps: [
      "45 Minuten Physik oder Mathe Deep Work",
      "10 Aufgaben eigenständig lösen",
      "Ein Konzept schriftlich in eigenen Worten erklären",
      "Kurze Reflexion schreiben: Was habe ich heute gelernt?",
    ],
    reward: {
      xp:       300,
      affinity: { scholar: 10 },
      title:    "Apprentice Scholar",
    },
  },
  {
    id:     "gate_scholar_2",
    title:  "Scholar Gate II — Deep Thinker",
    path:   "scholar",
    domain: "uni",
    icon:   "🧠",
    color:  "#3b82f6",
    steps: [
      "3 Stunden Fokus-Session (kein Handy, keine Unterbrechungen)",
      "Komplexes Thema von Grund auf verstehen",
      "Fehleranalyse: Wo hast du noch Lücken?",
      "Plan für die nächste Lerneinheit erstellen",
      "Ergebnis mit jemandem besprechen oder erklären",
    ],
    reward: {
      xp:       550,
      affinity: { scholar: 15 },
      title:    "Theory Breaker",
    },
  },

  // ── Engineer ──
  {
    id:     "gate_engineer_1",
    title:  "Engineer Gate I — Circuit Initiate",
    path:   "engineer",
    domain: "skill_practical",
    icon:   "🔧",
    color:  "#f97316",
    steps: [
      "Bauteil oder Sensor auswählen und recherchieren",
      "Datenblatt lesen und Kerninfos notieren",
      "Schaltplan zeichnen (auf Papier oder Software)",
      "Mini-Test oder Simulation durchführen",
      "Ergebnis dokumentieren",
    ],
    reward: {
      xp:       350,
      affinity: { engineer: 10 },
      title:    "Circuit Initiate",
    },
  },
  {
    id:     "gate_engineer_2",
    title:  "Engineer Gate II — Prototype Builder",
    path:   "engineer",
    domain: "skill_tech",
    icon:   "🔧",
    color:  "#f97316",
    steps: [
      "Projektidee definieren (Ziel, Input, Output)",
      "Technische Umsetzung planen",
      "Ersten funktionierenden Prototyp bauen",
      "Bugs identifizieren und beheben",
      "Ergebnis testen und dokumentieren",
    ],
    reward: {
      xp:       600,
      affinity: { engineer: 15 },
      title:    "Prototype Builder",
    },
  },

  // ── Fighter ──
  {
    id:     "gate_fighter_1",
    title:  "Fighter Gate I — Iron Will",
    path:   "fighter",
    domain: "strength",
    icon:   "⚔️",
    color:  "#ef4444",
    steps: [
      "Vollständige Gym-Session absolvieren",
      "20 Klimmzüge insgesamt (aufgeteilt erlaubt)",
      "50 Liegestütze insgesamt",
      "1 Minute Plank halten",
      "Cold Shower danach",
    ],
    reward: {
      xp:       350,
      affinity: { fighter: 10 },
      title:    "Iron Will",
    },
  },

  // ── Runner ──
  {
    id:     "gate_runner_1",
    title:  "Runner Gate I — First Mile",
    path:   "runner",
    domain: "cardio",
    icon:   "⚡",
    color:  "#f59e0b",
    steps: [
      "5km ohne Stopp laufen",
      "10 Minuten Stretching danach",
      "Laufzeit und Befinden notieren",
    ],
    reward: {
      xp:       280,
      affinity: { runner: 10 },
      title:    "First Mile",
    },
  },

  // ── Artisan ──
  {
    id:     "gate_artisan_1",
    title:  "Artisan Gate I — Creative Spark",
    path:   "artisan",
    domain: "skill_creative",
    icon:   "🎨",
    color:  "#a78bfa",
    steps: [
      "30 Minuten konzentriertes Üben (Instrument, Zeichnen oder Komposition)",
      "Etwas Neues ausprobieren das du noch nie versucht hast",
      "Ergebnis festhalten (Foto, Aufnahme oder Skizze)",
      "Reflexion: Was hat geklappt, was noch nicht?",
    ],
    reward: {
      xp:       300,
      affinity: { artisan: 10 },
      title:    "Creative Spark",
    },
  },

  // ── Charmer ──
  {
    id:     "gate_charmer_1",
    title:  "Charmer Gate I — Social Initiate",
    path:   "charmer",
    domain: "social",
    icon:   "👑",
    color:  "#ec4899",
    steps: [
      "Ein echtes Gespräch mit jemandem Unbekannten starten",
      "Aktiv zuhören ohne das Handy zu benutzen",
      "Jemandem ehrliches Feedback geben",
    ],
    reward: {
      xp:       260,
      affinity: { charmer: 10 },
      title:    "Social Initiate",
    },
  },
];

// Alle Gate-IDs für schnellen Lookup
export const GATE_IDS = GATES.map(g => g.id);

/**
 * Gibt zurück ob ein Gate bereits completed ist.
 */
export function isGateCompleted(gateId, gateProgress = {}) {
  return gateProgress[gateId]?.completed === true;
}

/**
 * Gibt den aktuellen Schritt-Index zurück (0-basiert).
 * -1 wenn noch kein Fortschritt.
 */
export function getGateStepsDone(gateId, gateProgress = {}) {
  return gateProgress[gateId]?.stepsDone || [];
}

/**
 * Gibt empfohlene Gates basierend auf System-Analyse zurück.
 */
export function getRecommendedGates(sysAnalysis, gateProgress = {}) {
  const dominated = sysAnalysis?.dominantPaths || [];
  const suggested = sysAnalysis?.suggestedMainPath;

  const candidates = GATES.filter(g => {
    if (isGateCompleted(g.id, gateProgress)) return false;
    // Empfehle Gates für dominante Pfade oder vorgeschlagenen Pfad
    return dominated.includes(g.path) || g.path === suggested;
  });

  // Max 3 empfohlene Gates
  return candidates.slice(0, 3);
}

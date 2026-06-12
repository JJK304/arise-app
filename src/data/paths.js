// ============================================================
// PATH SYSTEM — 15 Pfade (inkl. Shadow Ascendant als Sonderklasse)
// Etappe 3: geschärfte Abgrenzung.
//
// domains: GEORDNET — Index 0 = Primär-Domain (volles Gewicht
// im Signal-System), weitere = Sekundär (reduziertes Gewicht).
// Domains: body | mind | craft | creativity | social |
//          appearance | discipline | career | finance |
//          home | recovery | adventure
//
// stats:  3 Hauptstats je Path (Mapping: DISC/FOCUS→END,
//         REC→VIT, CRAFT→CRA — keine neuen Stats eingeführt).
// cats:   Legacy-Matching, bewusst minimal um Bleed zu vermeiden.
// questTypes: typische Daily-/Weekly-Arten (Generator/Doku).
// mastery: langfristige Anforderung des Pfads.
// ============================================================

export const PATHS = {
  fighter: {
    id:      "fighter",
    name:    "Fighter",
    icon:    "⚔",
    color:   "#ef4444",
    focus:   "Kraft, körperliche Belastbarkeit, Disziplin, Training",
    domains: ["body", "discipline"],
    stats:   ["STR", "END", "VIT"],
    cats:    ["strength"],
    desc:    "Du formst deinen Körper zur Waffe. Stärke wächst nur unter Last — und du suchst die Last.",
    questTypes: {
      daily:  ["Trainingseinheit", "Kraft-Selbsttest", "Disziplin-Protokoll"],
      weekly: ["Trainingsplan durchziehen", "Progressive Overload nachweisen"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Messbare Kraftsteigerung über Monate — dokumentiert, nicht behauptet." },
    progression: {
      "E/D": "Bewegung, Technik, Routine aufbauen",
      C:     "Strukturierter Trainingsblock",
      B:     "Messbare Leistungssteigerung",
      A:     "Mehrwöchiger Trainingsplan durchgezogen",
      S:     "Hohe Konsistenz + Performance-Ziel erreicht",
    },
  },
  runner: {
    id:      "runner",
    name:    "Runner",
    icon:    "⚡",
    color:   "#f59e0b",
    focus:   "Ausdauer, Bewegung, Schnelligkeit, Kondition, Mobilität",
    domains: ["body", "recovery"],
    stats:   ["AGI", "VIT", "END"],
    cats:    ["cardio"],
    desc:    "Bewegung ist deine Meditation. Distanz und Tempo sind ehrliche Zahlen — sie lügen nie.",
    questTypes: {
      daily:  ["Lauf-/Cardio-Session", "Mobility-Block", "Aktive Erholung"],
      weekly: ["Wochenkilometer", "Tempo- oder Distanz-Steigerung"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ausdauerleistung, die vor Monaten unmöglich war — gemessen und wiederholbar." },
    progression: {
      "E/D": "Bewegung, Spaziergang, leichte Ausdauer",
      C:     "Regelmäßige Lauf-/Ausdauersessions",
      B:     "Messbare Distanz-/Zeit-Verbesserung",
      A:     "Mehrwöchiger Plan oder Event-Vorbereitung",
      S:     "Langfristige Ausdauerleistung, dokumentiert",
    },
  },
  scholar: {
    id:      "scholar",
    name:    "Scholar",
    icon:    "◈",
    color:   "#3b82f6",
    focus:   "Wissen, Lernen, Verstehen, Erklären, Theorie anwenden",
    domains: ["mind", "career"],
    stats:   ["INT", "END"],
    cats:    ["uni"],
    desc:    "Wissen ist deine Rüstung. Du verstehst, was andere nur auswendig lernen — und kannst es erklären.",
    questTypes: {
      daily:  ["Fokussierte Lernsession", "Konzept durcharbeiten", "Erklären/Zusammenfassen"],
      weekly: ["Thema vollständig verstehen", "Prüfungs-/Anwendungsnachweis"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Komplexes Wissen so beherrschen, dass du es anderen beibringen kannst." },
    progression: {
      "E/D": "Lernen, Notizen, Verstehen",
      C:     "Erklären und anwenden",
      B:     "Problem lösen / Konzept übertragen",
      A:     "Eigenes Lernprojekt / Prüfung / Zusammenfassung",
      S:     "Tiefes Verständnis + Output + Review",
    },
  },
  engineer: {
    id:      "engineer",
    name:    "Engineer",
    icon:    "⌬",
    color:   "#f97316",
    focus:   "Bauen, Debugging, Systeme, Technik, Projekte, Problemlösung",
    domains: ["craft", "mind"],
    stats:   ["INT", "CRA", "END"],
    cats:    ["skill_tech"],
    desc:    "Du baust, was andere nur denken. Systeme, Code, Schaltungen — ein Engineer liefert Funktionierendes.",
    questTypes: {
      daily:  ["Projekt-Session", "Debugging/Problemlösung", "Technik-Deep-Dive"],
      weekly: ["Feature/Modul fertigstellen", "System dokumentieren"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ein eigenes technisches System, das real läuft und benutzt wird." },
    progression: {
      "E/D": "Lesen, ausprobieren, debuggen",
      C:     "Kleines funktionierendes Modul",
      B:     "Projekt verbessern / Fehleranalyse",
      A:     "Reales System bauen",
      S:     "Robustes Projekt / Doku / Release",
    },
  },
  artisan: {
    id:      "artisan",
    name:    "Artisan",
    icon:    "⌖",
    color:   "#a78bfa",
    focus:   "Handwerk, Kochen, Reparieren, praktische Fähigkeiten — Dinge mit den Händen erschaffen",
    domains: ["craft", "creativity"],
    stats:   ["CRA", "CRE", "END"],
    cats:    ["skill_practical"],
    desc:    "Deine Hände erschaffen Reales. Was du baust, kochst oder reparierst, kann man anfassen.",
    questTypes: {
      daily:  ["Handwerks-Session", "Gericht/Werkstück", "Reparatur/Verbesserung"],
      weekly: ["Werkstück fertigstellen", "Neue Technik praktisch meistern"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ein Handwerk so beherrschen, dass andere deine Arbeit haben wollen." },
    progression: {
      "E/D": "Praktische Kleinaufgabe, Rezept, Reparatur",
      C:     "Fertiges kleines Werk / nutzbares Ergebnis",
      B:     "Technik verbessern, Qualität steigern",
      A:     "Komplexeres handwerkliches Projekt",
      S:     "Wiederholbar gutes Ergebnis + Dokumentation",
    },
  },
  creator: {
    id:      "creator",
    name:    "Creator",
    icon:    "✦",
    color:   "#e879f9",
    focus:   "Content, Musik, Schreiben, Design, Video, Storytelling, Portfolio, kreative Veröffentlichung",
    domains: ["creativity", "social"],
    stats:   ["CRE", "CHA", "END"],
    cats:    ["skill_creative"],
    desc:    "Deine Stimme ist dein Werkzeug. Du erschaffst Werke — und du zeigst sie der Welt.",
    questTypes: {
      daily:  ["Kreativ-Session", "Werk weiterentwickeln", "Skizze/Entwurf/Draft"],
      weekly: ["Werk abschließen", "Etwas veröffentlichen/zeigen"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ein Portfolio veröffentlichter Werke, das deine Handschrift trägt." },
    progression: {
      "E/D": "Üben, Skizzen, Ideen",
      C:     "Kleines Werk fertigstellen",
      B:     "Feedback einholen und verbessern",
      A:     "Portfolio-Stück / Veröffentlichung",
      S:     "Serie / größeres Projekt / öffentlicher Output",
    },
  },
  charmer: {
    id:      "charmer",
    name:    "Charmer",
    icon:    "✧",
    color:   "#ec4899",
    focus:   "Auftreten, Social Skills, Kommunikation, Selbstbewusstsein, Style",
    domains: ["social", "appearance"],
    stats:   ["CHA", "SOC", "APP"],
    cats:    ["appearance"],
    desc:    "Menschen folgen dir, weil du weißt, wer du bist. Präsenz ist trainierbar — und du trainierst sie.",
    questTypes: {
      daily:  ["Soziale Initiative", "Auftreten/Style bewusst", "Gespräch führen"],
      weekly: ["Soziale Challenge", "Style-/Auftritts-Upgrade"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "In jedem Raum souverän auftreten und echte Verbindungen aufbauen." },
    progression: {
      "E/D": "Kleine soziale Schritte, bewusstes Auftreten",
      C:     "Gespräche aktiv führen, Style entwickeln",
      B:     "Anspruchsvolle soziale Situationen meistern",
      A:     "Souverän präsentieren / Netzwerk aufbauen",
      S:     "Natürliche Präsenz in jedem Umfeld",
    },
  },
  strategist: {
    id:      "strategist",
    name:    "Strategist",
    icon:    "⟁",
    color:   "#0ea5e9",
    focus:   "Planung, Systeme, Prioritäten, Ziele, Zeitmanagement, langfristige Strategie",
    domains: ["discipline", "career"],
    stats:   ["INT", "END"],
    cats:    ["discipline"],
    desc:    "Du siehst das große Bild. Während andere reagieren, hast du längst geplant.",
    questTypes: {
      daily:  ["Tagesplanung/Prioritäten", "Review-Protokoll", "System verbessern"],
      weekly: ["Wochenstrategie umsetzen", "Ziel-Meilenstein erreichen"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ein persönliches System, das Ziele zuverlässig in Ergebnisse übersetzt." },
    progression: {
      "E/D": "Tagesplanung, kleine Prioritäten",
      C:     "Wochenpläne konsequent umsetzen",
      B:     "System für Ziele etabliert + gemessen",
      A:     "Mehrwöchige Strategie mit Meilensteinen",
      S:     "Persönliches System liefert verlässlich Ergebnisse",
    },
  },
  guardian: {
    id:      "guardian",
    name:    "Guardian",
    icon:    "⬢",
    color:   "#84cc16",
    focus:   "Ordnung, Haushalt, Stabilität, Verantwortung, Lebensstruktur, Verlässlichkeit",
    domains: ["home", "discipline"],
    stats:   ["END", "VIT"],
    cats:    [],
    desc:    "Stabilität ist deine Stärke. Du baust die Struktur, auf der alles andere steht.",
    questTypes: {
      daily:  ["Haushalts-Task", "Ordnung halten", "Verlässlichkeits-Protokoll"],
      weekly: ["Bereich dauerhaft verbessern", "Verantwortung übernehmen"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ein Lebensumfeld, das dauerhaft funktioniert — ohne Chaos-Rückfälle." },
    progression: {
      "E/D": "Kleine Ordnung, einzelne Aufgaben",
      C:     "Routinen im Haushalt etabliert",
      B:     "Bereich dauerhaft stabil verbessert",
      A:     "Volle Verantwortung für Lebensstruktur",
      S:     "Stabiles Umfeld ohne Chaos-Rückfälle, langfristig",
    },
  },
  merchant: {
    id:      "merchant",
    name:    "Merchant",
    icon:    "◆",
    color:   "#22c55e",
    focus:   "Finanzen, Business, Karriere, Verhandeln, Ressourcen, Chancen",
    domains: ["finance", "career"],
    stats:   ["INT", "CHA", "END"],
    cats:    [],
    desc:    "Ressourcen, Netzwerke, Chancen — du weißt, wie das Spiel gespielt wird, und spielst es fair und klug.",
    questTypes: {
      daily:  ["Finanz-Tracking", "Karriere-Schritt", "Chance prüfen"],
      weekly: ["Budget-Analyse", "Verhandlung/Bewerbung/Deal"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ein funktionierendes Finanz- und Karrieresystem mit messbarem Wachstum." },
    progression: {
      "E/D": "Budget, Recherche, kleine Schritte",
      C:     "Finanzplan ausführen",
      B:     "Messbares finanzielles Ergebnis",
      A:     "Projekt / Nebenverdienst / Portfolio",
      S:     "Langfristige Finanz-/Business-Strategie",
    },
  },
  monk: {
    id:      "monk",
    name:    "Monk",
    icon:    "◎",
    color:   "#10b981",
    focus:   "Achtsamkeit, Fokus, Selbstkontrolle, Recovery, innere Stabilität",
    domains: ["recovery", "discipline"],
    stats:   ["VIT", "END"],
    cats:    [],
    desc:    "Klarheit entsteht in der Stille. Du beherrschst dich selbst — das ist die höchste Stärke.",
    questTypes: {
      daily:  ["Meditation/Atemübung", "Fokus-Protokoll", "Bewusste Erholung"],
      weekly: ["Achtsamkeits-Routine halten", "Digital-Detox-Block"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Innere Ruhe, die auch unter Druck trägt — über Monate kultiviert." },
    progression: {
      "E/D": "Ruhe, Atem, Schlaf, kleine Recovery-Routine",
      C:     "Konsistente Stabilität",
      B:     "Stressmanagement in schwieriger Phase",
      A:     "Mehrwöchige mentale Stabilitätsroutine",
      S:     "Langfristige innere Stabilität + Reflexion",
    },
  },
  explorer: {
    id:      "explorer",
    name:    "Explorer",
    icon:    "⟡",
    color:   "#f59e0b",
    focus:   "Abenteuer, neue Orte, Komfortzone, Outdoor, neue Erfahrungen",
    domains: ["adventure", "body"],
    stats:   ["AGI", "CHA", "END"],
    cats:    [],
    desc:    "Die Welt ist deine Lehrerin. Jede Grenze, die du überschreitest, gehört danach dir.",
    questTypes: {
      daily:  ["Komfortzonen-Schritt", "Neues ausprobieren", "Draußen unterwegs"],
      weekly: ["Neuer Ort/neue Erfahrung", "Mikro-Abenteuer planen und durchziehen"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ein Leben, in dem Neues Normalzustand ist — nicht Ausnahme." },
    progression: {
      "E/D": "Kleine Komfortzonen-Schritte",
      C:     "Regelmäßig Neues ausprobieren",
      B:     "Echte Herausforderung außerhalb der Zone",
      A:     "Mikro-Abenteuer / Reise geplant und erlebt",
      S:     "Neues als Normalzustand, dokumentiert",
    },
  },
  leader: {
    id:      "leader",
    name:    "Leader",
    icon:    "◉",
    color:   "#d97706",
    focus:   "Führung, Entscheidungen, Verantwortung für andere, Einfluss, Organisation",
    domains: ["social", "career", "discipline"],
    stats:   ["CHA", "END", "SOC"],
    cats:    [],
    desc:    "Du führst nicht durch Macht, sondern durch Beispiel. Andere wachsen in deiner Nähe.",
    questTypes: {
      daily:  ["Entscheidung treffen", "Für andere koordinieren", "Vorbild-Protokoll"],
      weekly: ["Verantwortung übernehmen", "Gruppe/Projekt führen"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Menschen folgen dir freiwillig — weil du Verantwortung wirklich trägst." },
    progression: {
      "E/D": "Verantwortung übernehmen",
      C:     "Kleine Organisation leiten",
      B:     "Entscheidung + Ergebnis verantworten",
      A:     "Team/Projekt führen",
      S:     "Langfristiger Einfluss / Mentoring",
    },
  },
  healer: {
    id:      "healer",
    name:    "Healer",
    icon:    "⌁",
    color:   "#34d399",
    focus:   "Unterstützung, Empathie, mentale Gesundheit, Fürsorge, Regeneration",
    domains: ["social", "recovery"],
    stats:   ["VIT", "SOC", "CHA"],
    cats:    [],
    desc:    "Du regenerierst dich und andere. Fürsorge ist keine Schwäche — sie ist eine seltene Stärke.",
    questTypes: {
      daily:  ["Jemanden unterstützen", "Aktiv zuhören", "Eigene Regeneration"],
      weekly: ["Für jemanden da sein", "Care-Routine halten"],
    },
    mastery: { gatesRequired: 3, trialsRequired: 2, affinity: 60, desc: "Ein verlässlicher Anker für andere sein — ohne dich selbst zu verlieren." },
    progression: {
      "E/D": "Unterstützung, Empathie, Reflexion",
      C:     "Konkrete Hilfe leisten",
      B:     "Emotional anspruchsvolle Situation begleiten",
      A:     "Verantwortung für Support/Regeneration",
      S:     "Langfristiger positiver Einfluss auf sich/andere",
    },
  },

  // ── Shadow Ascendant: Sonderklasse — nicht als Startklasse wählbar ─
  shadow: {
    id:              "shadow",
    name:            "Shadow Ascendant",
    icon:            "⧫",
    color:           "#00ffff",
    focus:           "Ascendant Path — meistert alle Pfade",
    domains:         ["body","mind","craft","creativity","social","discipline","career","finance","home","recovery","adventure"],
    stats:           ["STR","AGI","INT","CRE","CRA","VIT","END","CHA"],
    cats:            [],
    desc:            "Du bist nicht spezialisiert — du bist vollständig. Der Pfad derer, die viele Wege gemeistert haben.",
    unlockCondition: "3+ Pfade mit hoher Affinity · 3+ Gates · 2+ Goals · Rank A+",
    special:         true,
    questTypes: {
      daily:  ["Multi-Path-Protokoll"],
      weekly: ["Pfadübergreifende Meisterprüfung"],
    },
    mastery: { gatesRequired: 9, trialsRequired: 6, affinity: 0, desc: "Mastery in mehreren Pfaden gleichzeitig — über lange Zeit bewiesen." },
  },
};

export const PATH_LIST = Object.values(PATHS);

/** Alle wählbaren (nicht-Special) Pfade */
export const SELECTABLE_PATHS = PATH_LIST.filter(p => !p.special);

// ── Affinity-Gain ─────────────────────────────────────────

/**
 * Gibt zurück wie viel Affinity eine Quest für jeden Pfad gibt.
 * Nutzt sowohl domain (neu) als auch cat (Legacy) für Matching.
 * Etappe 3: Primär-Domain (Index 0) zählt voll, Sekundär-Domains
 * reduziert — schärft die Abgrenzung ähnlicher Pfade.
 * Rückgabe: { pathId: points, ... }
 */
export function getAffinityGain(challenge) {
  const gains = {};
  if (!challenge) return gains;

  const domain = challenge.domain || null;
  const cat    = challenge.cat    || null;

  for (const [id, path] of Object.entries(PATHS)) {
    if (path.special) continue;

    const domains = path.domains || [];
    const primaryMatch   = domain && domains[0] === domain;
    const secondaryMatch = domain && !primaryMatch && domains.slice(1).includes(domain);
    const catMatch       = cat && path.cats?.includes(cat);

    if (primaryMatch || secondaryMatch || catMatch) {
      const base = challenge.type === "milestone" ? 5
                 : challenge.type === "weekly"    ? 2
                 : 1;
      // Sekundär-Domain ohne Cat-Match: halbes Gewicht (aufgerundet)
      gains[id] = (primaryMatch || catMatch) ? base : Math.ceil(base / 2);
    }
  }
  return gains;
}

// ── Shadow Unlock ─────────────────────────────────────────

/**
 * Prüft ob der Shadow Ascendant Path freigeschaltet werden kann.
 * Volle Voraussetzungen (aus balancing.js SHADOW_UNLOCK_REQUIREMENTS):
 *   - 3+ Paths mit Affinity >= 20
 *   - 3+ Gates abgeschlossen
 *   - 2+ Goals abgeschlossen
 *   - Rank mindestens A
 * @param {object} affinities    - player.affinities
 * @param {object} gateProgress  - state.gateProgress
 * @param {object[]} goals       - state.goals
 * @param {string}  rank         - state.rank
 * @returns {boolean}
 */
export function canUnlockShadow(affinities = {}, gateProgress = {}, goals = [], rank = "E") {
  const RANKS_ORDER = ["E","D","C","B","A","S","SS","SSS"];
  const rankIdx = RANKS_ORDER.indexOf(rank);

  const strongPaths  = Object.entries(affinities).filter(([k,v]) => k !== "shadow" && v >= 20).length;
  const completedGates = Object.values(gateProgress).filter(g => g.completed).length;
  const completedGoals = (goals || []).filter(g => g.status === "completed").length;
  const highEnoughRank = rankIdx >= 4; // A-Rank = index 4

  return strongPaths >= 3 && completedGates >= 3 && completedGoals >= 2 && highEnoughRank;
}

// ── Path-Empfehlung ───────────────────────────────────────

/**
 * Gibt Pfad-Empfehlung basierend auf Affinitäten zurück.
 */
export function suggestPaths(affinities = {}) {
  const entries = Object.entries(affinities)
    .filter(([k]) => k !== "shadow")
    .sort(([, a], [, b]) => b - a);

  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total < 3) return null;

  const [first, second] = entries;
  if (!first || first[1] === 0) return null;

  return {
    mainPath:      first[0],
    secondaryPath: second?.[1] > 0 ? second[0] : null,
  };
}

// ============================================================
// GATE SYSTEM — Prompt 11
// 12 Paths × 3 Tiers = 36 Gates
// Gate II braucht Gate I, Gate III braucht Gate II.
// Rewards: XP, Affinity, Titel (nie doppelt).
// Progress: state.gateProgress[gateId].stepsDone / completed / rewardClaimed
// ============================================================

// ── XP-Richtwerte je Tier ─────────────────────────────────
// Gate I:  300–500 XP
// Gate II: 600–900 XP
// Gate III: 900–1200 XP

export const GATES = [

  // ════════════════════════════════════════════════════════
  // SCHOLAR
  // ════════════════════════════════════════════════════════
  {
    id: "gate_scholar_1", tier: 1,
    title: "Scholar Gate I — Theory Breaker",
    path: "scholar", domain: "mind", icon: "🧠", color: "#3b82f6",
    unlockCondition: null,
    steps: [
      "45 Min. Deep Work ohne Ablenkung absolvieren",
      "10 Aufgaben eigenständig und vollständig lösen",
      "Ein Konzept in eigenen Worten schriftlich erklären",
      "Reflexion: Was habe ich heute verstanden? Was ist noch unklar?",
    ],
    reward: { xp: 400, affinity: { scholar: 10 }, title: "apprentice_scholar", titleLabel: "Apprentice Scholar" },
  },
  {
    id: "gate_scholar_2", tier: 2,
    title: "Scholar Gate II — Deep Thinker",
    path: "scholar", domain: "mind", icon: "🧠", color: "#3b82f6",
    unlockCondition: "gate_scholar_1",
    steps: [
      "3-Stunden-Fokus-Session: kein Handy, keine Unterbrechungen",
      "Komplexes Thema von Grund auf verstehen (nicht nur auswendig)",
      "Lückenanalyse: Wo fehlt noch Verständnis? Aufschreiben.",
      "Fehler aus vergangenen Aufgaben analysieren und korrigieren",
      "Lernstoff jemandem erklären oder in ein Dokument schreiben",
    ],
    reward: { xp: 700, affinity: { scholar: 15 }, title: "deep_thinker", titleLabel: "Deep Thinker" },
  },
  {
    id: "gate_scholar_3", tier: 3,
    title: "Scholar Gate III — Knowledge Sovereign",
    path: "scholar", domain: "mind", icon: "🧠", color: "#3b82f6",
    unlockCondition: "gate_scholar_2",
    steps: [
      "Vollständige Prüfungssimulation unter echten Bedingungen",
      "Eigene Zusammenfassung des gesamten Lernstoffs erstellen",
      "3 Schwachstellen identifizieren und gezielt trainieren",
      "Lernstoff anwenden: reales Problem mit dem Wissen lösen",
      "Ergebnis bewerten: Bist du bereit? Begründung aufschreiben.",
    ],
    reward: { xp: 1100, affinity: { scholar: 20 }, title: "knowledge_sovereign", titleLabel: "Knowledge Sovereign" },
  },

  // ════════════════════════════════════════════════════════
  // ENGINEER
  // ════════════════════════════════════════════════════════
  {
    id: "gate_engineer_1", tier: 1,
    title: "Engineer Gate I — Circuit Initiate",
    path: "engineer", domain: "craft", icon: "🔧", color: "#f97316",
    unlockCondition: null,
    steps: [
      "Bauteil oder Technologie auswählen und recherchieren",
      "Datenblatt oder Dokumentation lesen und Kerninfos notieren",
      "Schaltplan oder Systemdiagramm zeichnen (Papier oder Software)",
      "Mini-Test oder Simulation durchführen",
      "Ergebnis dokumentieren: was funktioniert, was nicht",
    ],
    reward: { xp: 450, affinity: { engineer: 10 }, title: "circuit_initiate", titleLabel: "Circuit Initiate" },
  },
  {
    id: "gate_engineer_2", tier: 2,
    title: "Engineer Gate II — Prototype Builder",
    path: "engineer", domain: "craft", icon: "🔧", color: "#f97316",
    unlockCondition: "gate_engineer_1",
    steps: [
      "Projektidee definieren: Ziel, Input, Output, Constraints",
      "Technische Umsetzung planen: Schritte, Tools, Materialien",
      "Ersten funktionierenden Prototyp bauen",
      "Bugs systematisch identifizieren und mindestens einen beheben",
      "Prototyp testen und Ergebnis dokumentieren",
    ],
    reward: { xp: 750, affinity: { engineer: 15 }, title: "prototype_builder", titleLabel: "Prototype Builder" },
  },
  {
    id: "gate_engineer_3", tier: 3,
    title: "Engineer Gate III — System Architect",
    path: "engineer", domain: "craft", icon: "🔧", color: "#f97316",
    unlockCondition: "gate_engineer_2",
    steps: [
      "Vollständiges Projekt von Idee bis fertigem Ergebnis abschließen",
      "Code oder System refaktorieren: sauber, lesbar, wartbar",
      "README oder Dokumentation schreiben (jemand anderes könnte es nutzen)",
      "Projekt jemanden zeigen oder öffentlich zugänglich machen",
      "Review: Was würdest du beim nächsten Mal anders machen?",
    ],
    reward: { xp: 1050, affinity: { engineer: 20 }, title: "system_architect", titleLabel: "System Architect" },
  },

  // ════════════════════════════════════════════════════════
  // FIGHTER
  // ════════════════════════════════════════════════════════
  {
    id: "gate_fighter_1", tier: 1,
    title: "Fighter Gate I — Iron Will",
    path: "fighter", domain: "body", icon: "⚔️", color: "#ef4444",
    unlockCondition: null,
    steps: [
      "Vollständige Gym-Session: Push, Pull oder Legs",
      "20 Liegestütze ohne Pause (sauber, Brust zum Boden)",
      "50 Kniebeugen bis zur tiefen Hocke",
      "1 Minute Plank halten",
      "Trainingseinheit in Progress Log dokumentieren",
    ],
    reward: { xp: 400, affinity: { fighter: 10 }, title: "iron_will", titleLabel: "Iron Will" },
  },
  {
    id: "gate_fighter_2", tier: 2,
    title: "Fighter Gate II — Strength Protocol",
    path: "fighter", domain: "body", icon: "⚔️", color: "#ef4444",
    unlockCondition: "gate_fighter_1",
    steps: [
      "3 Trainingstage in einer Woche absolvieren (Push/Pull/Legs)",
      "Erster Klimmzug aus eigener Kraft oder 10 negative Klimmzüge",
      "Maximale Liegestütze am Stück testen und notieren",
      "Ernährung 3 Tage tracken: mind. 130g Protein/Tag",
      "Recovery-Tag mit Dehnen und Mobilisation einhalten",
    ],
    reward: { xp: 800, affinity: { fighter: 15 }, title: "strength_protocol", titleLabel: "Strength Protocol" },
  },
  {
    id: "gate_fighter_3", tier: 3,
    title: "Fighter Gate III — Body of the Warrior",
    path: "fighter", domain: "body", icon: "⚔️", color: "#ef4444",
    unlockCondition: "gate_fighter_2",
    steps: [
      "4-Wochen-Trainingsroutine vollständig einhalten (min. 3x/Woche)",
      "Maximalkraft-Test: Bench, Squat oder Deadlift notieren",
      "Körper-Foto oder Körpermessung als Fortschrittsnachweis",
      "5km in unter 30 Minuten laufen",
      "Ernährungs- und Schlafqualität eine Woche konsequent tracken",
    ],
    reward: { xp: 1200, affinity: { fighter: 20 }, title: "warrior_body", titleLabel: "Body of the Warrior" },
  },

  // ════════════════════════════════════════════════════════
  // RUNNER
  // ════════════════════════════════════════════════════════
  {
    id: "gate_runner_1", tier: 1,
    title: "Runner Gate I — First Mile",
    path: "runner", domain: "body", icon: "⚡", color: "#f59e0b",
    unlockCondition: null,
    steps: [
      "5 km ohne Stopp laufen",
      "10 Min. Stretching oder Mobility danach",
      "Laufzeit, Distanz und Befinden notieren",
    ],
    reward: { xp: 320, affinity: { runner: 10 }, title: "first_mile", titleLabel: "First Mile" },
  },
  {
    id: "gate_runner_2", tier: 2,
    title: "Runner Gate II — Endurance Block",
    path: "runner", domain: "body", icon: "⚡", color: "#f59e0b",
    unlockCondition: "gate_runner_1",
    steps: [
      "3 Laufeinheiten in einer Woche absolvieren",
      "10 km in einer Einheit schaffen",
      "Lauftempovariation üben: 1 Sprint-Einheit",
      "15 Min. Yoga oder tiefes Stretching",
      "Wochenzusammenfassung schreiben: Distanz, Zeiten, Fortschritt",
    ],
    reward: { xp: 650, affinity: { runner: 15 }, title: "endurance_block", titleLabel: "Endurance Block" },
  },
  {
    id: "gate_runner_3", tier: 3,
    title: "Runner Gate III — The Long Run",
    path: "runner", domain: "body", icon: "⚡", color: "#f59e0b",
    unlockCondition: "gate_runner_2",
    steps: [
      "Halbmarathon-Distanz (21 km) in einem Monat aufgebaut",
      "15 km in einer Einheit laufen",
      "Regelmäßige Mobility-Routine etabliert (3x/Woche, je 10 Min.)",
      "Persönliche Bestzeit über 5 km verbessern",
      "Lauftagebuch der letzten 4 Wochen: Reflexion und nächste Ziele",
    ],
    reward: { xp: 1000, affinity: { runner: 20 }, title: "long_run", titleLabel: "The Long Run" },
  },

  // ════════════════════════════════════════════════════════
  // ARTISAN
  // ════════════════════════════════════════════════════════
  {
    id: "gate_artisan_1", tier: 1,
    title: "Artisan Gate I — Creative Spark",
    path: "artisan", domain: "creativity", icon: "🎨", color: "#a78bfa",
    unlockCondition: null,
    steps: [
      "30 Min. konzentriertes Üben (Instrument, Zeichnen, Komposition oder Kochen)",
      "Etwas Neues ausprobieren das du noch nie versucht hast",
      "Ergebnis festhalten (Foto, Aufnahme oder Skizze)",
      "Reflexion: Was hat geklappt, was noch nicht?",
    ],
    reward: { xp: 350, affinity: { artisan: 10 }, title: "creative_spark", titleLabel: "Creative Spark" },
  },
  {
    id: "gate_artisan_2", tier: 2,
    title: "Artisan Gate II — Craft Ritual",
    path: "artisan", domain: "creativity", icon: "🎨", color: "#a78bfa",
    unlockCondition: "gate_artisan_1",
    steps: [
      "5 aufeinanderfolgende Tage täglich 20+ Min. üben",
      "Kleines abgeschlossenes Werk erstellen (Lied, Zeichnung, Gericht, Design)",
      "Feedback von einer anderen Person einholen",
      "Überarbeiten auf Basis des Feedbacks",
      "Finales Werk dokumentieren und aufbewahren",
    ],
    reward: { xp: 700, affinity: { artisan: 15 }, title: "craft_ritual", titleLabel: "Craft Ritual" },
  },
  {
    id: "gate_artisan_3", tier: 3,
    title: "Artisan Gate III — Master of the Craft",
    path: "artisan", domain: "creativity", icon: "🎨", color: "#a78bfa",
    unlockCondition: "gate_artisan_2",
    steps: [
      "3 fertige kreative Werke in verschiedenen Techniken erstellen",
      "Eines davon öffentlich zeigen oder teilen",
      "30-Tage-Übungsstreak dokumentieren",
      "Technik tief analysieren: was macht gutes Handwerk aus?",
      "Eigenen Stil oder Erkennungszeichen entwickeln und beschreiben",
    ],
    reward: { xp: 1100, affinity: { artisan: 20 }, title: "master_craft", titleLabel: "Master of the Craft" },
  },

  // ════════════════════════════════════════════════════════
  // CHARMER
  // ════════════════════════════════════════════════════════
  {
    id: "gate_charmer_1", tier: 1,
    title: "Charmer Gate I — Social Initiate",
    path: "charmer", domain: "social", icon: "👑", color: "#ec4899",
    unlockCondition: null,
    steps: [
      "Echtes Gespräch mit einer unbekannten Person starten",
      "In einem Gespräch aktiv zuhören ohne Handy zu nutzen",
      "Jemandem ein ehrliches, spezifisches Kompliment machen",
    ],
    reward: { xp: 300, affinity: { charmer: 10 }, title: "social_initiate", titleLabel: "Social Initiate" },
  },
  {
    id: "gate_charmer_2", tier: 2,
    title: "Charmer Gate II — The Presence",
    path: "charmer", domain: "social", icon: "👑", color: "#ec4899",
    unlockCondition: "gate_charmer_1",
    steps: [
      "5 Social Challenges in einer Woche abschließen",
      "Vor einer kleinen Gruppe sprechen (mind. 3 Zuhörer)",
      "Vollständige Pflege- und Style-Routine 5 Tage einhalten",
      "Bewusst auf Körpersprache achten und reflektieren",
      "Reflexion: In welchen Situationen fühle ich mich unsicher?",
    ],
    reward: { xp: 650, affinity: { charmer: 15 }, title: "the_presence", titleLabel: "The Presence" },
  },
  {
    id: "gate_charmer_3", tier: 3,
    title: "Charmer Gate III — Social Sovereign",
    path: "charmer", domain: "social", icon: "👑", color: "#ec4899",
    unlockCondition: "gate_charmer_2",
    steps: [
      "Öffentliche Präsentation oder Rede halten (min. 5 Min.)",
      "Networking-Event besuchen oder neues Netzwerk aufbauen",
      "Eigene Marke / Auftreten definieren: was soll dein erster Eindruck sein?",
      "10 bedeutungsvolle neue Verbindungen in einem Monat aufgebaut",
      "Feedback zur eigenen Wirkung einholen und auswerten",
    ],
    reward: { xp: 1000, affinity: { charmer: 20 }, title: "social_sovereign", titleLabel: "Social Sovereign" },
  },

  // ════════════════════════════════════════════════════════
  // STRATEGIST
  // ════════════════════════════════════════════════════════
  {
    id: "gate_strategist_1", tier: 1,
    title: "Strategist Gate I — The First Plan",
    path: "strategist", domain: "discipline", icon: "♟️", color: "#0ea5e9",
    unlockCondition: null,
    steps: [
      "Detaillierten Wochenplan erstellen (alle Bereiche: Lernen, Sport, Soziales)",
      "3 Tage nach Plan leben — nichts weglassen",
      "Abend-Review täglich machen: Was lief, was nicht?",
      "Reflektion: Welche Aufgaben fallen schwerer als erwartet?",
    ],
    reward: { xp: 370, affinity: { strategist: 10 }, title: "first_plan", titleLabel: "The First Plan" },
  },
  {
    id: "gate_strategist_2", tier: 2,
    title: "Strategist Gate II — System Thinker",
    path: "strategist", domain: "discipline", icon: "♟️", color: "#0ea5e9",
    unlockCondition: "gate_strategist_1",
    steps: [
      "Persönliches Produktivitätssystem entwickeln und dokumentieren",
      "Eine Woche komplett nach System leben",
      "Zeitdiebstähle identifizieren und 3 eliminieren",
      "Monatsziele setzen und auf Wochenebene herunterbrechen",
      "Weekly Review für 2 aufeinanderfolgende Wochen",
    ],
    reward: { xp: 680, affinity: { strategist: 15 }, title: "system_thinker", titleLabel: "System Thinker" },
  },
  {
    id: "gate_strategist_3", tier: 3,
    title: "Strategist Gate III — Architect of Progress",
    path: "strategist", domain: "discipline", icon: "♟️", color: "#0ea5e9",
    unlockCondition: "gate_strategist_2",
    steps: [
      "3-Monats-Roadmap für ein persönliches Lebensziel erstellen",
      "System nach 30 Tagen auswerten und optimieren",
      "Alle wichtigen Lebensbereiche gleichzeitig im Griff haben (keine deutliche Vernachlässigung)",
      "Mentoring: jemandem dein System erklären",
      "Jahresreview oder Halbjahresreview durchführen",
    ],
    reward: { xp: 1050, affinity: { strategist: 20 }, title: "architect_progress", titleLabel: "Architect of Progress" },
  },

  // ════════════════════════════════════════════════════════
  // GUARDIAN
  // ════════════════════════════════════════════════════════
  {
    id: "gate_guardian_1", tier: 1,
    title: "Guardian Gate I — Order Reset",
    path: "guardian", domain: "home", icon: "🏠", color: "#84cc16",
    unlockCondition: null,
    steps: [
      "Gesamte Wohnung oder Zimmer vollständig aufräumen und organisieren",
      "Wäsche waschen, aufhängen, einräumen",
      "Küche sauber machen und Vorräte kontrollieren",
      "To-Do-Liste für den nächsten Tag schreiben",
    ],
    reward: { xp: 320, affinity: { guardian: 10 }, title: "order_reset", titleLabel: "Order Reset" },
  },
  {
    id: "gate_guardian_2", tier: 2,
    title: "Guardian Gate II — Weekly Structure",
    path: "guardian", domain: "home", icon: "🏠", color: "#84cc16",
    unlockCondition: "gate_guardian_1",
    steps: [
      "5 aufeinanderfolgende Tage täglich aufräumen (< 10 Min. reichen)",
      "Wochenplan mit Haushaltsaufgaben erstellen und einhalten",
      "Einkaufsliste und Mahlzeitenplanung für eine Woche",
      "Digitales Aufräumen: Ordner, Desktop, Nachrichten",
      "Wochenreview: Was lief gut im Haushalt, was muss besser werden?",
    ],
    reward: { xp: 600, affinity: { guardian: 15 }, title: "weekly_structure", titleLabel: "Weekly Structure" },
  },
  {
    id: "gate_guardian_3", tier: 3,
    title: "Guardian Gate III — Stable Foundation",
    path: "guardian", domain: "home", icon: "🏠", color: "#84cc16",
    unlockCondition: "gate_guardian_2",
    steps: [
      "30-Tage-Ordnungsroutine einhalten (täglich aufräumen)",
      "Alle Lebensbereiche organisiert: Finanzen, Haushalt, Termine",
      "Emergency-Puffer angelegt: Vorräte, Budget-Puffer, Backup-Plan",
      "Jemanden in deiner Ordnungsstrategie unterstützen",
      "Wohnraum gestalten: bewusste Entscheidung über Umgebung",
    ],
    reward: { xp: 950, affinity: { guardian: 20 }, title: "stable_foundation", titleLabel: "Stable Foundation" },
  },

  // ════════════════════════════════════════════════════════
  // MERCHANT
  // ════════════════════════════════════════════════════════
  {
    id: "gate_merchant_1", tier: 1,
    title: "Merchant Gate I — First Ledger",
    path: "merchant", domain: "finance", icon: "💰", color: "#22c55e",
    unlockCondition: null,
    steps: [
      "Alle Ausgaben des letzten Monats aufschreiben",
      "Einnahmen vs. Ausgaben gegenüberstellen",
      "3 Bereiche identifizieren wo du zu viel ausgibst",
      "Budget für nächsten Monat aufstellen",
    ],
    reward: { xp: 350, affinity: { merchant: 10 }, title: "first_ledger", titleLabel: "First Ledger" },
  },
  {
    id: "gate_merchant_2", tier: 2,
    title: "Merchant Gate II — Financial Strategist",
    path: "merchant", domain: "finance", icon: "💰", color: "#22c55e",
    unlockCondition: "gate_merchant_1",
    steps: [
      "4 Wochen Budget konsequent tracken",
      "Sparziel definieren und ersten Betrag zurücklegen",
      "Karriereziel definieren: nächster Schritt (Bewerbung, Skill, Netzwerk)",
      "Finanzartikel oder Buch lesen und 3 Erkenntnisse aufschreiben",
      "Einnahmen-Optimierung: eine Idee entwickeln und ersten Schritt tun",
    ],
    reward: { xp: 700, affinity: { merchant: 15 }, title: "financial_strategist", titleLabel: "Financial Strategist" },
  },
  {
    id: "gate_merchant_3", tier: 3,
    title: "Merchant Gate III — The Deal",
    path: "merchant", domain: "finance", icon: "💰", color: "#22c55e",
    unlockCondition: "gate_merchant_2",
    steps: [
      "3-Monats-Finanzplan mit konkreten Spar- und Investmentzielen",
      "Erste Investition oder Nebenprojekt gestartet",
      "Bewerbungsprozess oder Karriereschritt aktiv durchgezogen",
      "Netzwerk-Event oder Business-Gespräch geführt",
      "Jahresinkommensziel definiert und Plan erstellt wie du dahin kommst",
    ],
    reward: { xp: 1050, affinity: { merchant: 20 }, title: "the_deal", titleLabel: "The Deal" },
  },

  // ════════════════════════════════════════════════════════
  // CREATOR
  // ════════════════════════════════════════════════════════
  {
    id: "gate_creator_1", tier: 1,
    title: "Creator Gate I — First Post",
    path: "creator", domain: "creativity", icon: "🎬", color: "#e879f9",
    unlockCondition: null,
    steps: [
      "Content-Idee entwickeln (Post, Video, Design, Text)",
      "Ersten Entwurf erstellen",
      "Entwurf überarbeiten (mind. einmal)",
      "Ergebnis veröffentlichen oder zeigen",
    ],
    reward: { xp: 350, affinity: { creator: 10 }, title: "first_post", titleLabel: "First Post" },
  },
  {
    id: "gate_creator_2", tier: 2,
    title: "Creator Gate II — Content Streak",
    path: "creator", domain: "creativity", icon: "🎬", color: "#e879f9",
    unlockCondition: "gate_creator_1",
    steps: [
      "7 Tage in Folge täglichen Content erstellen (auch kleine Formate)",
      "Feedback von Zuschauern oder Lesern einholen",
      "Content-Serie oder Thema definieren",
      "Reichweite oder Engagement analysieren",
      "Nächste Inhaltsstrategie planen",
    ],
    reward: { xp: 680, affinity: { creator: 15 }, title: "content_streak", titleLabel: "Content Streak" },
  },
  {
    id: "gate_creator_3", tier: 3,
    title: "Creator Gate III — The Voice",
    path: "creator", domain: "creativity", icon: "🎬", color: "#e879f9",
    unlockCondition: "gate_creator_2",
    steps: [
      "30-Tage Content Challenge: täglich etwas produzieren",
      "Eine Content-Reihe mit mind. 5 Teilen fertigstellen",
      "Eigene Marke / Stimme definieren: was unterscheidet mich?",
      "Community oder Audience aufgebaut (mind. 10 echte Follower/Leser)",
      "Einnahmen oder echte Zusammenarbeit aus dem Content entstanden",
    ],
    reward: { xp: 1100, affinity: { creator: 20 }, title: "the_voice", titleLabel: "The Voice" },
  },

  // ════════════════════════════════════════════════════════
  // MONK
  // ════════════════════════════════════════════════════════
  {
    id: "gate_monk_1", tier: 1,
    title: "Monk Gate I — Still Mind",
    path: "monk", domain: "recovery", icon: "🧘", color: "#10b981",
    unlockCondition: null,
    steps: [
      "7 aufeinanderfolgende Tage meditieren (je mind. 5 Min.)",
      "3 Tage Journaling: Morgen oder Abend",
      "Ein Atemübungs-Protokoll durchführen (4-7-8 oder Box Breathing)",
    ],
    reward: { xp: 330, affinity: { monk: 10 }, title: "still_mind", titleLabel: "Still Mind" },
  },
  {
    id: "gate_monk_2", tier: 2,
    title: "Monk Gate II — Recovery Ritual",
    path: "monk", domain: "recovery", icon: "🧘", color: "#10b981",
    unlockCondition: "gate_monk_1",
    steps: [
      "14 Tage Schlafroutine: gleiche Zeit, kein Handy im Bett",
      "Stressoren identifizieren und mind. einen aktiv reduzieren",
      "Wöchentliche Recovery-Session (1h bewusstes Nichts-tun)",
      "Ernährung 5 Tage tracken: entzündungsarm, ausgewogen",
      "Reflexion: Was raubt dir Energie? Was gibt dir Energie?",
    ],
    reward: { xp: 680, affinity: { monk: 15 }, title: "recovery_ritual", titleLabel: "Recovery Ritual" },
  },
  {
    id: "gate_monk_3", tier: 3,
    title: "Monk Gate III — Inner Fortress",
    path: "monk", domain: "recovery", icon: "🧘", color: "#10b981",
    unlockCondition: "gate_monk_2",
    steps: [
      "30-Tage Meditation Streak (kein Aussetzer)",
      "Persönliche Philosophie oder Lebensregeln aufschreiben",
      "Digitales Detox-Wochenende: 48h ohne Social Media",
      "Resilienz-Test: bewusst einer schwierigen Situation standhalten",
      "Meditationserfahrungen und Erkenntnisse dokumentieren",
    ],
    reward: { xp: 1000, affinity: { monk: 20 }, title: "inner_fortress", titleLabel: "Inner Fortress" },
  },

  // ════════════════════════════════════════════════════════
  // EXPLORER
  // ════════════════════════════════════════════════════════
  {
    id: "gate_explorer_1", tier: 1,
    title: "Explorer Gate I — New Horizon",
    path: "explorer", domain: "adventure", icon: "🌍", color: "#f59e0b",
    unlockCondition: null,
    steps: [
      "Einen neuen Ort oder eine neue Aktivität ausprobieren",
      "Mit einer unbekannten Person ein echtes Gespräch führen",
      "Etwas tun das dir Unbehagen bereitet — bewusst",
    ],
    reward: { xp: 310, affinity: { explorer: 10 }, title: "new_horizon", titleLabel: "New Horizon" },
  },
  {
    id: "gate_explorer_2", tier: 2,
    title: "Explorer Gate II — Comfort Zone Breaker",
    path: "explorer", domain: "adventure", icon: "🌍", color: "#f59e0b",
    unlockCondition: "gate_explorer_1",
    steps: [
      "5 neue Orte oder Aktivitäten in einem Monat erleben",
      "Solo-Aktivität: alleine etwas unternehmen das du sonst nicht tätest",
      "Kulturelles Event oder Veranstaltung besuchen",
      "Spontane Reise oder Ausflug organisieren",
      "Reisetagebuch oder Erlebnislog führen",
    ],
    reward: { xp: 630, affinity: { explorer: 15 }, title: "comfort_breaker", titleLabel: "Comfort Zone Breaker" },
  },
  {
    id: "gate_explorer_3", tier: 3,
    title: "Explorer Gate III — World Walker",
    path: "explorer", domain: "adventure", icon: "🌍", color: "#f59e0b",
    unlockCondition: "gate_explorer_2",
    steps: [
      "Mehrtägige Reise oder Abenteuer-Erfahrung (Wandern, Reise, Kurs)",
      "Neue Sprache oder Kultur aktiv kennenlernen",
      "Bucket-List erstellen und ersten Punkt abhaken",
      "Erfahrungen dokumentieren und mit anderen teilen",
      "Zukünftige Abenteuer planen: Roadmap für nächste 12 Monate",
    ],
    reward: { xp: 980, affinity: { explorer: 20 }, title: "world_walker", titleLabel: "World Walker" },
  },

  // ════════════════════════════════════════════════════════
  // SHADOW — Nur nach Spezialvoraussetzungen freigeschaltet
  // ════════════════════════════════════════════════════════
  {
    id: "gate_shadow_1", tier: 1,
    title: "Shadow Gate I — The Allrounder",
    path: "shadow", domain: "discipline", icon: "🌑", color: "#00ffff",
    unlockCondition: "shadow_unlock",  // Sonderregel: braucht Shadow-Unlock
    special: true,
    steps: [
      "In einer Woche aus 5 verschiedenen Domains je eine Quest abschließen",
      "Wochenreview mit Reflexion über alle aktiven Pfade",
      "Schwächsten Bereich identifizieren und gezielte Übung starten",
    ],
    reward: { xp: 600, affinity: { shadow: 10 }, title: "the_allrounder", titleLabel: "The Allrounder" },
  },
];

// ── Export Helpers ────────────────────────────────────────

export const GATE_IDS = GATES.map(g => g.id);

/**
 * Gibt zurück ob ein Gate bereits completed ist.
 */
export function isGateCompleted(gateId, gateProgress = {}) {
  return gateProgress[gateId]?.completed === true;
}

/**
 * Gibt die abgeschlossenen Steps für ein Gate zurück.
 */
export function getGateStepsDone(gateId, gateProgress = {}) {
  return gateProgress[gateId]?.stepsDone || [];
}

/**
 * Prüft ob ein Gate freigeschaltet werden kann (Tier-Abhängigkeit).
 */
export function isGateUnlocked(gate, gateProgress = {}, completionStatus = {}) {
  if (!gate) return false;
  if (gate.special) return false;           // Shadow Gates separat gehandhabt
  if (!gate.unlockCondition) return true;   // Tier 1: immer verfügbar
  return isGateCompleted(gate.unlockCondition, gateProgress);
}

/**
 * Gibt empfohlene Gates zurück:
 *   - Noch nicht abgeschlossen
 *   - Für dominante/suggested Paths
 *   - Niedrigster verfügbarer Tier zuerst
 */
export function getRecommendedGates(sysAnalysis, gateProgress = {}) {
  const dominated = sysAnalysis?.dominantPaths || [];
  const suggested = sysAnalysis?.suggestedMainPath;
  const targetPaths = new Set([...dominated, suggested].filter(Boolean));

  const candidates = GATES.filter(g => {
    if (g.special) return false;
    if (isGateCompleted(g.id, gateProgress)) return false;
    if (!isGateUnlocked(g, gateProgress)) return false;
    return targetPaths.size === 0 || targetPaths.has(g.path);
  });

  // Sortiere nach Tier (aufsteigend) → niedrigster Tier zuerst
  candidates.sort((a, b) => a.tier - b.tier);
  return candidates.slice(0, 3);
}

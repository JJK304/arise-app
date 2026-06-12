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
    path: "scholar", domain: "mind", icon: "◈", color: "#3b82f6",
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
    path: "scholar", domain: "mind", icon: "◈", color: "#3b82f6",
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
    path: "scholar", domain: "mind", icon: "◈", color: "#3b82f6",
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
    path: "engineer", domain: "craft", icon: "⌬", color: "#f97316",
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
    path: "engineer", domain: "craft", icon: "⌬", color: "#f97316",
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
    path: "engineer", domain: "craft", icon: "⌬", color: "#f97316",
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
    path: "fighter", domain: "body", icon: "◈", color: "#ef4444",
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
    path: "fighter", domain: "body", icon: "◈", color: "#ef4444",
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
    path: "fighter", domain: "body", icon: "◈", color: "#ef4444",
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
    path: "runner", domain: "body", icon: "◈", color: "#f59e0b",
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
    path: "runner", domain: "body", icon: "◈", color: "#f59e0b",
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
    path: "runner", domain: "body", icon: "◈", color: "#f59e0b",
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
    path: "artisan", domain: "creativity", icon: "✦", color: "#a78bfa",
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
    path: "artisan", domain: "creativity", icon: "✦", color: "#a78bfa",
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
    path: "artisan", domain: "creativity", icon: "✦", color: "#a78bfa",
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
    path: "charmer", domain: "social", icon: "✧", color: "#ec4899",
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
    path: "charmer", domain: "social", icon: "✧", color: "#ec4899",
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
    path: "charmer", domain: "social", icon: "✧", color: "#ec4899",
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
    path: "strategist", domain: "discipline", icon: "⟁", color: "#0ea5e9",
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
    path: "strategist", domain: "discipline", icon: "⟁", color: "#0ea5e9",
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
    path: "strategist", domain: "discipline", icon: "⟁", color: "#0ea5e9",
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
    path: "guardian", domain: "home", icon: "⬢", color: "#84cc16",
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
    path: "guardian", domain: "home", icon: "⬢", color: "#84cc16",
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
    path: "guardian", domain: "home", icon: "⬢", color: "#84cc16",
    unlockCondition: "gate_guardian_2",
    steps: [
      "30-Tage-Ordnungsroutine einhalten (täglich aufräumen)",
      "Alle Lebensbereiche organisiert: Finanzen, Haushalt, Termine",
      "Emergency-Puffer angelegt: Vorräte, Budget-Puffer, Backup-Plan",
      "Jemanden in deiner Ordnungsstrategie unterstützen",
      "Wohnraum gestalten: bewusste Entscheidung über Umgebung",
    ],
    reward: { xp: 900, affinity: { guardian: 20 }, title: "stable_foundation", titleLabel: "Stable Foundation" },
  },

  // ════════════════════════════════════════════════════════
  // MERCHANT
  // ════════════════════════════════════════════════════════
  {
    id: "gate_merchant_1", tier: 1,
    title: "Merchant Gate I — First Ledger",
    path: "merchant", domain: "finance", icon: "◆", color: "#22c55e",
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
    path: "merchant", domain: "finance", icon: "◆", color: "#22c55e",
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
    path: "merchant", domain: "finance", icon: "◆", color: "#22c55e",
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
    path: "creator", domain: "creativity", icon: "✦", color: "#e879f9",
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
    path: "creator", domain: "creativity", icon: "✦", color: "#e879f9",
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
    path: "creator", domain: "creativity", icon: "✦", color: "#e879f9",
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
    path: "monk", domain: "recovery", icon: "◎", color: "#10b981",
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
    path: "monk", domain: "recovery", icon: "◎", color: "#10b981",
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
    path: "monk", domain: "recovery", icon: "◎", color: "#10b981",
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
    path: "explorer", domain: "adventure", icon: "⟡", color: "#f59e0b",
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
    path: "explorer", domain: "adventure", icon: "⟡", color: "#f59e0b",
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
    path: "explorer", domain: "adventure", icon: "⟡", color: "#f59e0b",
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
  // LEADER
  // ════════════════════════════════════════════════════════
  {
    id: "gate_leader_1", tier: 1,
    title: "Leader Gate I — First Decision",
    path: "leader", domain: "social", icon: "◉", color: "#d97706",
    unlockCondition: null,
    steps: [
      "Eine Entscheidung treffen die andere betrifft — und dazu stehen",
      "In einer Gruppe oder Situation Initiative ergreifen",
      "Jemandem helfen der eine Führung oder Richtung braucht",
      "Reflexion: Was macht gute Führung aus? (Notiz schreiben)",
    ],
    reward: { xp: 360, affinity: { leader: 10 }, title: "first_decision", titleLabel: "First Decision" },
  },
  {
    id: "gate_leader_2", tier: 2,
    title: "Leader Gate II — The Motivator",
    path: "leader", domain: "social", icon: "◉", color: "#d97706",
    unlockCondition: "gate_leader_1",
    steps: [
      "Ein Projekt oder eine Gruppe über 2+ Wochen aktiv leiten",
      "Jemanden in einer Fähigkeit oder Entscheidung unterstützen und coachen",
      "Konflikt in einer Gruppe ansprechen und lösen",
      "Eigene Führungsstärken und Schwächen ehrlich analysieren",
      "Feedback von anderen über deinen Führungsstil einholen",
    ],
    reward: { xp: 700, affinity: { leader: 15 }, title: "the_motivator", titleLabel: "The Motivator" },
  },
  {
    id: "gate_leader_3", tier: 3,
    title: "Leader Gate III — Architect of People",
    path: "leader", domain: "social", icon: "◉", color: "#d97706",
    unlockCondition: "gate_leader_2",
    steps: [
      "Langfristiges Projekt oder Vorhaben mit anderen erfolgreich abschließen",
      "Einen Mentee oder Person über mindestens 1 Monat begleiten",
      "Eigene Führungsphilosophie in 10 Sätzen formulieren",
      "Schwierige Entscheidung treffen und Verantwortung dafür übernehmen",
      "Wirkung dokumentieren: Was hat sich durch deine Führung verändert?",
    ],
    reward: { xp: 1100, affinity: { leader: 20 }, title: "architect_people", titleLabel: "Architect of People" },
  },

  // ════════════════════════════════════════════════════════
  // HEALER
  // ════════════════════════════════════════════════════════
  {
    id: "gate_healer_1", tier: 1,
    title: "Healer Gate I — First Aid",
    path: "healer", domain: "recovery", icon: "⌁", color: "#34d399",
    unlockCondition: null,
    steps: [
      "7 Tage eigene Schlafqualität tracken und einen Verbesserungsschritt umsetzen",
      "Jemandem aktiv zuhören ohne Ratschläge zu geben — nur präsent sein",
      "Eigenen Stresslevel analysieren und einen Auslöser identifizieren",
    ],
    reward: { xp: 330, affinity: { healer: 10 }, title: "first_aid", titleLabel: "First Aid" },
  },
  {
    id: "gate_healer_2", tier: 2,
    title: "Healer Gate II — Steady Support",
    path: "healer", domain: "recovery", icon: "⌁", color: "#34d399",
    unlockCondition: "gate_healer_1",
    steps: [
      "14 Tage tägliche Recovery-Routine einhalten (Schlaf, Atemübung oder Bewegung)",
      "Eine Person aktiv über längere Zeit emotional oder praktisch unterstützen",
      "Eigene Grenzen klar kommunizieren — in einem schwierigen Gespräch",
      "Erholung planen: bewusst Ruhezeit in Wochenstruktur integrieren",
      "Reflexion: Wie geht es dir wirklich? Ehrliche Bestandsaufnahme.",
    ],
    reward: { xp: 680, affinity: { healer: 15 }, title: "steady_support", titleLabel: "Steady Support" },
  },
  {
    id: "gate_healer_3", tier: 3,
    title: "Healer Gate III — The Resilient",
    path: "healer", domain: "recovery", icon: "⌁", color: "#34d399",
    unlockCondition: "gate_healer_2",
    steps: [
      "30-Tage Recovery-Protokoll: täglich mindestens eine bewusste Erholungseinheit",
      "Jemanden durch eine schwierige Phase begleiten und danach gemeinsam reflektieren",
      "Eigene mentale Stärken und Schwachstellen dokumentieren",
      "Resilienz-Skill entwickeln: Stressor über 2 Wochen aktiv anders bewältigen",
      "Persönliches Wohlbefindensystem aufbauen und schriftlich festhalten",
    ],
    reward: { xp: 1000, affinity: { healer: 20 }, title: "the_resilient", titleLabel: "The Resilient" },
  },

  // ════════════════════════════════════════════════════════
  // DISCOVERY GATES — Allgemeine Einstiegs-Gates
  // Erscheinen früh für jeden Nutzer.
  // Öffnen Branches und zeigen mögliche Spezialisierungen.
  // ════════════════════════════════════════════════════════
  {
    id: "gate_discovery_focus", tier: 1,
    title: "Focus Gate I — First Deep Work",
    path: "strategist", domain: "discipline", icon: "⌖", color: "#0ea5e9",
    unlockCondition: null,
    discovery: true,
    steps: [
      "3 Fokus-Sessions à 25 Minuten in einer Woche abschließen",
      "Ablenkungen für eine Session vollständig eliminieren",
      "Reflexion: Welche Themen ziehen deine Aufmerksamkeit am stärksten?",
    ],
    reward: { xp: 300, affinity: { strategist: 6, scholar: 4 }, title: "focused_mind", titleLabel: "Focused Mind" },
  },
  {
    id: "gate_discovery_body", tier: 1,
    title: "Body Gate I — Activation Protocol",
    path: "fighter", domain: "body", icon: "◈", color: "#ef4444",
    unlockCondition: null,
    discovery: true,
    steps: [
      "5 Tage in Folge mindestens 20 Minuten körperlich aktiv sein",
      "Einen Körperwert tracken (Gewicht, Liegestütze oder Laufstrecke)",
      "Reflexion: Welche Art von Bewegung macht dir wirklich Spaß?",
    ],
    reward: { xp: 270, affinity: { fighter: 5, runner: 5 }, title: "body_awakened", titleLabel: "Body Awakened" },
  },
  {
    id: "gate_discovery_creation", tier: 1,
    title: "Creation Gate I — First Output",
    path: "artisan", domain: "creativity", icon: "◇", color: "#a78bfa",
    unlockCondition: null,
    discovery: true,
    steps: [
      "Etwas fertig erstellen — egal wie klein (Skizze, Text, Song, Rezept, Code)",
      "Das Ergebnis jemandem zeigen oder archivieren",
      "Reflexion: Was möchtest du noch erschaffen?",
    ],
    reward: { xp: 260, affinity: { artisan: 5, creator: 5 }, title: "first_output", titleLabel: "First Output" },
  },
  {
    id: "gate_discovery_social", tier: 1,
    title: "Social Gate I — First Connection",
    path: "charmer", domain: "social", icon: "◉", color: "#ec4899",
    unlockCondition: null,
    discovery: true,
    steps: [
      "Mit einer Person ein echtes Gespräch führen (nicht nur Small Talk)",
      "Jemandem aktiv helfen ohne Gegenleistung",
      "Reflexion: Welche Arten von sozialer Energie liegen dir?",
    ],
    reward: { xp: 250, affinity: { charmer: 5, leader: 4 }, title: "first_connection", titleLabel: "First Connection" },
  },
  {
    id: "gate_discovery_discipline", tier: 1,
    title: "Discipline Gate I — System Start",
    path: "guardian", domain: "discipline", icon: "⬢", color: "#84cc16",
    unlockCondition: null,
    discovery: true,
    steps: [
      "7 Tage lang täglich eine kleine Routine einhalten",
      "Einen Lebensbereich aufräumen oder strukturieren",
      "Reflexion: Welche Gewohnheiten willst du aufbauen?",
    ],
    reward: { xp: 270, affinity: { guardian: 6, strategist: 4 }, title: "system_start", titleLabel: "System Start" },
  },
  {
    id: "gate_discovery_recovery", tier: 1,
    title: "Recovery Gate I — Rest Protocol",
    path: "monk", domain: "recovery", icon: "⌁", color: "#10b981",
    unlockCondition: null,
    discovery: true,
    steps: [
      "5 Tage bewusst auf Schlaf achten (feste Schlafenszeit)",
      "Eine Entspannungs- oder Atemübung 3 Mal durchführen",
      "Reflexion: Was raubt dir Energie? Was gibt dir Energie?",
    ],
    reward: { xp: 250, affinity: { monk: 6, healer: 4 }, title: "rest_protocol", titleLabel: "Rest Protocol" },
  },
  {
    id: "gate_discovery_skill", tier: 1,
    title: "Skill Gate I — First Dedication",
    path: "scholar", domain: "mind", icon: "⌖", color: "#3b82f6",
    unlockCondition: null,
    discovery: true,
    steps: [
      "Eine Fähigkeit 7 Tage lang täglich üben (mind. 10 Min.)",
      "Lernfortschritt notieren oder dokumentieren",
      "Reflexion: Welche Fähigkeiten möchtest du wirklich meistern?",
    ],
    reward: { xp: 260, affinity: { scholar: 5, engineer: 3, artisan: 2 }, title: "first_dedication", titleLabel: "First Dedication" },
  },

    // ════════════════════════════════════════════════════════
  // TRIALS — Echte Prüfungen mit Anwendungsnachweis
  // trial: true  →  prüfen echte Fähigkeit, nicht Wiederholung
  // Tier 1: Einstieg (1–3 Schritte, kurze Sessions)
  // Tier 2: Anwendung (mehrere Sessions, Dokumentation)
  // Tier 3: Ergebnis (messbarer Fortschritt, Reflexion)
  // ════════════════════════════════════════════════════════

  // ── Scholar Trials ───────────────────────────────────
  {
    id: "trial_scholar_1", tier: 1, trial: true,
    title: "Scholar Trial I — Explain & Apply",
    path: "scholar", domain: "mind", icon: "◈", color: "#3b82f6",
    unlockCondition: "gate_scholar_1",
    steps: [
      "Fokus-Session abschließen (min. 25 Min.) und Notizen erstellen",
      "Ein Konzept aus dieser Session einem anderen erklären oder aufschreiben",
      "Offene Fragen identifizieren und für nächste Session vormerken",
    ],
    reward: { xp: 500, affinity: { scholar: 8 }, title: "theory_applied", titleLabel: "Theory Applied" },
  },
  {
    id: "trial_scholar_2", tier: 2, trial: true,
    title: "Scholar Trial II — Deep Synthesis",
    path: "scholar", domain: "mind", icon: "◈", color: "#3b82f6",
    unlockCondition: "trial_scholar_1",
    steps: [
      "5 Deep-Work-Sessions zu einem Thema (je 45+ Min.) abschließen",
      "Gelerntes auf eine eigene Aufgabe oder Problem anwenden",
      "Fehleranalyse: Was hat nicht funktioniert? Warum?",
      "Zusammenfassung schreiben: Was kann ich jetzt, was ich vorher nicht konnte?",
    ],
    reward: { xp: 900, affinity: { scholar: 12 }, title: "deep_synthesis", titleLabel: "Deep Synthesis" },
  },
  {
    id: "trial_scholar_3", tier: 3, trial: true,
    title: "Scholar Trial III — Mastery Proof",
    path: "scholar", domain: "mind", icon: "◈", color: "#3b82f6",
    unlockCondition: "trial_scholar_2",
    steps: [
      "Komplexes Thema von Grund auf selbst erarbeiten und verstehen",
      "Erklärungsdokument erstellen (eigene Worte, keine Kopie)",
      "Prüfungssimulation oder anspruchsvolle Aufgabe meistern",
      "Reflexion: Was fehlt noch? Roadmap für nächste Stufe.",
    ],
    reward: { xp: 1200, affinity: { scholar: 18 }, title: "knowledge_proven", titleLabel: "Knowledge Proven" },
  },

  // ── Engineer Trials ───────────────────────────────────
  {
    id: "trial_engineer_1", tier: 1, trial: true,
    title: "Engineer Trial I — Build & Debug",
    path: "engineer", domain: "craft", icon: "⌬", color: "#f97316",
    unlockCondition: "gate_engineer_1",
    steps: [
      "Problem definieren und Lösungsansatz skizzieren",
      "Ersten funktionierenden Prototyp / Entwurf erstellen",
      "Fehler finden und beheben — dokumentieren was nicht funktioniert hat",
    ],
    reward: { xp: 520, affinity: { engineer: 8 }, title: "first_build", titleLabel: "First Build" },
  },
  {
    id: "trial_engineer_2", tier: 2, trial: true,
    title: "Engineer Trial II — Prototype & Improve",
    path: "engineer", domain: "craft", icon: "⌬", color: "#f97316",
    unlockCondition: "trial_engineer_1",
    steps: [
      "Prototyp iterativ verbessern (min. 3 Iterationen)",
      "Technisches Problem systematisch debuggen und lösen",
      "Verbesserung testen und Ergebnis dokumentieren",
      "Was würde ich beim nächsten Mal anders machen?",
    ],
    reward: { xp: 900, affinity: { engineer: 12 }, title: "iterative_builder", titleLabel: "Iterative Builder" },
  },
  {
    id: "trial_engineer_3", tier: 3, trial: true,
    title: "Engineer Trial III — Ship It",
    path: "engineer", domain: "craft", icon: "⌬", color: "#f97316",
    unlockCondition: "trial_engineer_2",
    steps: [
      "Funktionierendes Projekt vollständig abschließen",
      "Projekt dokumentieren (README, Notizen oder Protokoll)",
      "Anderen zeigen oder deployen — echter Output",
      "Retrospektive: Was hat dieses Projekt dich gelehrt?",
    ],
    reward: { xp: 1600, affinity: { engineer: 18 }, title: "shipped", titleLabel: "Shipped" },
  },

  // ── Fighter Trials ─────────────────────────────────────
  {
    id: "trial_fighter_1", tier: 1, trial: true,
    title: "Fighter Trial I — Form Check",
    path: "fighter", domain: "body", icon: "◈", color: "#ef4444",
    unlockCondition: "gate_fighter_1",
    steps: [
      "Training abschließen und Technik / Form dokumentieren",
      "Mindestens eine Übung mit bewusstem Fokus auf Ausführung",
      "Trainingslog: Gewicht, Wiederholungen, Energie-Level",
    ],
    reward: { xp: 480, affinity: { fighter: 8 }, title: "form_checked", titleLabel: "Form Checked" },
  },
  {
    id: "trial_fighter_2", tier: 2, trial: true,
    title: "Fighter Trial II — Performance Block",
    path: "fighter", domain: "body", icon: "◈", color: "#ef4444",
    unlockCondition: "trial_fighter_1",
    steps: [
      "3-Wochen Trainingsblock abschließen (min. 3 Einheiten/Woche)",
      "Leistungswert tracken: Verbesserung messbar nachweisen",
      "Recovery-Protokoll einhalten (Schlaf, Ernährung dokumentieren)",
      "Körper-Feedback dokumentieren: Energie, Schmerzen, Fortschritt",
    ],
    reward: { xp: 900, affinity: { fighter: 12 }, title: "performance_block", titleLabel: "Performance Block" },
  },
  {
    id: "trial_fighter_3", tier: 3, trial: true,
    title: "Fighter Trial III — Warrior Standard",
    path: "fighter", domain: "body", icon: "◈", color: "#ef4444",
    unlockCondition: "trial_fighter_2",
    steps: [
      "Messbarer Leistungsfortschritt über 6 Wochen dokumentieren",
      "Persönliche Bestleistung in einer Disziplin erreichen",
      "Routine nachweislich konsistent: kein Aussetzer über 2 Wochen",
      "Reflexion: Wie hat Training deinen Alltag verändert?",
    ],
    reward: { xp: 1600, affinity: { fighter: 18 }, title: "warrior_standard", titleLabel: "Warrior Standard" },
  },

  // ── Creator Trials ─────────────────────────────────────
  {
    id: "trial_creator_1", tier: 1, trial: true,
    title: "Creator Trial I — Finish Something",
    path: "creator", domain: "creativity", icon: "✦", color: "#e879f9",
    unlockCondition: "gate_creator_1",
    steps: [
      "Kleines Werk fertigstellen — ein Post, eine Skizze, ein Track, ein Video",
      "Ergebnis zeigen oder veröffentlichen",
      "Reflexion: Was würdest du beim nächsten Mal verbessern?",
    ],
    reward: { xp: 480, affinity: { creator: 8 }, title: "finished_creator", titleLabel: "Finished" },
  },
  {
    id: "trial_creator_2", tier: 2, trial: true,
    title: "Creator Trial II — Feedback Loop",
    path: "creator", domain: "creativity", icon: "✦", color: "#e879f9",
    unlockCondition: "trial_creator_1",
    steps: [
      "Werk erstellen und echtes Feedback von außen einholen",
      "Feedback einarbeiten und Werk verbessern",
      "Begründen warum du Feedback angenommen oder abgelehnt hast",
      "Zweites Werk fertigstellen und mit dem ersten vergleichen",
    ],
    reward: { xp: 900, affinity: { creator: 12 }, title: "feedback_loop", titleLabel: "Feedback Loop" },
  },
  {
    id: "trial_creator_3", tier: 3, trial: true,
    title: "Creator Trial III — Publish or Archive",
    path: "creator", domain: "creativity", icon: "✦", color: "#e879f9",
    unlockCondition: "trial_creator_2",
    steps: [
      "Fertiges Werk veröffentlichen oder bewusst archivieren",
      "Eigene kreative Stimme definieren: Was unterscheidet mich?",
      "3 Werke abschließen die einen nachvollziehbaren Fortschritt zeigen",
      "Portfolio-Eintrag oder Reflexion: Wer bin ich als Creator?",
    ],
    reward: { xp: 1600, affinity: { creator: 18 }, title: "published", titleLabel: "Published" },
  },

  // ── Merchant Trials ────────────────────────────────────
  {
    id: "trial_merchant_1", tier: 1, trial: true,
    title: "Merchant Trial I — Map Your Finances",
    path: "merchant", domain: "finance", icon: "◆", color: "#22c55e",
    unlockCondition: "gate_merchant_1",
    steps: [
      "Alle Einnahmen und Ausgaben des letzten Monats aufschlüsseln",
      "Karriere-Status ehrlich einschätzen: Wo stehe ich gerade?",
      "Einen konkreten nächsten Schritt definieren (Finanzen oder Karriere)",
    ],
    reward: { xp: 480, affinity: { merchant: 8 }, title: "mapped_finances", titleLabel: "Mapped" },
  },
  {
    id: "trial_merchant_2", tier: 2, trial: true,
    title: "Merchant Trial II — Execute a Plan",
    path: "merchant", domain: "finance", icon: "◆", color: "#22c55e",
    unlockCondition: "trial_merchant_1",
    steps: [
      "4 Wochen Budget konsequent tracken und auswerten",
      "Einen konkreten Karriere- oder Finanz-Schritt umsetzen",
      "Netzwerk-Gespräch oder Verhandlung durchführen",
      "Ergebnis dokumentieren und nächsten Schritt definieren",
    ],
    reward: { xp: 900, affinity: { merchant: 12 }, title: "plan_executed", titleLabel: "Plan Executed" },
  },
  {
    id: "trial_merchant_3", tier: 3, trial: true,
    title: "Merchant Trial III — Deal Closed",
    path: "merchant", domain: "finance", icon: "◆", color: "#22c55e",
    unlockCondition: "trial_merchant_2",
    steps: [
      "Großes Finanzziel erreicht oder Karriereschritt abgeschlossen",
      "Nebenprojekt oder Investment aktiv und laufend",
      "3-Monats-Rückblick: Was hat sich verändert?",
      "Nächstes Jahresziel formulieren und Plan erstellen",
    ],
    reward: { xp: 1600, affinity: { merchant: 18 }, title: "deal_closed", titleLabel: "Deal Closed" },
  },

  // ── Charmer Trials ─────────────────────────────────────
  {
    id: "trial_charmer_1", tier: 1, trial: true,
    title: "Charmer Trial I — Communicate & Reflect",
    path: "charmer", domain: "social", icon: "✧", color: "#ec4899",
    unlockCondition: "gate_charmer_1",
    steps: [
      "Drei echte Gespräche führen — bewusst mit Aufmerksamkeit",
      "Körpersprache und Stimme in einem Gespräch beobachten",
      "Reflexion: Was lief gut? Was wirkte unbequem?",
    ],
    reward: { xp: 460, affinity: { charmer: 8 }, title: "communicated", titleLabel: "Communicated" },
  },
  {
    id: "trial_charmer_2", tier: 2, trial: true,
    title: "Charmer Trial II — Presence Check",
    path: "charmer", domain: "social", icon: "✧", color: "#ec4899",
    unlockCondition: "trial_charmer_1",
    steps: [
      "5 soziale Situationen bewusst gestalten (nicht passiv mitmachen)",
      "Eigenen Style oder Auftreten überdenken und eine Änderung umsetzen",
      "Unbequeme soziale Situation gezielt angehen",
      "Feedback: Wie wirke ich auf andere? (direkt fragen)",
    ],
    reward: { xp: 850, affinity: { charmer: 12 }, title: "presence_check", titleLabel: "Presence" },
  },

  // ── Monk Trials ────────────────────────────────────────
  {
    id: "trial_monk_1", tier: 1, trial: true,
    title: "Monk Trial I — Recover & Stabilize",
    path: "monk", domain: "recovery", icon: "◎", color: "#10b981",
    unlockCondition: "gate_monk_1",
    steps: [
      "7 Tage Schlafroutine einhalten und dokumentieren",
      "Stressor identifizieren und einen gezielten Schritt dagegen unternehmen",
      "Wöchentliche Recovery-Reflexion: Was hat mir Energie gegeben?",
    ],
    reward: { xp: 460, affinity: { monk: 8 }, title: "stabilized", titleLabel: "Stabilized" },
  },
  {
    id: "trial_monk_2", tier: 2, trial: true,
    title: "Monk Trial II — The Still Point",
    path: "monk", domain: "recovery", icon: "◎", color: "#10b981",
    unlockCondition: "trial_monk_1",
    steps: [
      "14 Tage täglich meditieren oder Atemübung (min. 5 Min.)",
      "Belastende Gewohnheit identifizieren und 2 Wochen aktiv reduzieren",
      "Energie-Bilanz: Was kostet, was gibt? Konsequenz daraus ziehen.",
      "Persönliche Lebensregeln formulieren (3–5 Sätze)",
    ],
    reward: { xp: 850, affinity: { monk: 12 }, title: "still_point", titleLabel: "Still Point" },
  },

  // ── Explorer Trials ────────────────────────────────────
  {
    id: "trial_explorer_1", tier: 1, trial: true,
    title: "Explorer Trial I — Act Outside Comfort Zone",
    path: "explorer", domain: "adventure", icon: "⟡", color: "#f59e0b",
    unlockCondition: "gate_explorer_1",
    steps: [
      "Eine Aktivität tun die dir Unbehagen bereitet",
      "Neue Person kennenlernen und echtes Gespräch führen",
      "Erfahrung dokumentieren: Was hat sich nach dem Unbehagen verändert?",
    ],
    reward: { xp: 460, affinity: { explorer: 8 }, title: "comfort_broken", titleLabel: "Comfort Broken" },
  },
  {
    id: "trial_explorer_2", tier: 2, trial: true,
    title: "Explorer Trial II — The Expedition",
    path: "explorer", domain: "adventure", icon: "⟡", color: "#f59e0b",
    unlockCondition: "trial_explorer_1",
    steps: [
      "In einem Monat 3 neue Erfahrungen bewusst suchen",
      "Solo-Ausflug oder Aktivität ohne gewohnte Begleitung",
      "Erlebnislog führen: Was hat jede Erfahrung verändert?",
      "Nächste große Komfortzone definieren und ersten Schritt planen",
    ],
    reward: { xp: 850, affinity: { explorer: 12 }, title: "expedition", titleLabel: "Expedition" },
  },

  // ── Leader Trials ──────────────────────────────────────
  {
    id: "trial_leader_1", tier: 1, trial: true,
    title: "Leader Trial I — Decide & Guide",
    path: "leader", domain: "social", icon: "◉", color: "#d97706",
    unlockCondition: "gate_leader_1",
    steps: [
      "Eine wichtige Entscheidung für andere treffen und begründen",
      "Initiative ergreifen und Gruppe oder Situation aktiv gestalten",
      "Reflexion: Wie hat die Entscheidung gewirkt?",
    ],
    reward: { xp: 480, affinity: { leader: 8 }, title: "decided_guided", titleLabel: "Decided" },
  },
  {
    id: "trial_leader_2", tier: 2, trial: true,
    title: "Leader Trial II — The Long Game",
    path: "leader", domain: "social", icon: "◉", color: "#d97706",
    unlockCondition: "trial_leader_1",
    steps: [
      "Projekt oder Gruppe über 3+ Wochen aktiv führen",
      "Jemanden coachen — Fragen stellen statt Lösungen geben",
      "Schwieriges Gespräch führen (Feedback, Konflikt, Erwartung)",
      "Führungsreflexion: Was hat sich durch deine Führung verändert?",
    ],
    reward: { xp: 900, affinity: { leader: 12 }, title: "long_game", titleLabel: "Long Game" },
  },

  // ── Healer Trials ──────────────────────────────────────
  {
    id: "trial_healer_1", tier: 1, trial: true,
    title: "Healer Trial I — Support & Reflect",
    path: "healer", domain: "recovery", icon: "⌁", color: "#34d399",
    unlockCondition: "gate_healer_1",
    steps: [
      "Person aktiv unterstützen und danach reflektieren",
      "Eigene mentale Energie ehrlich einschätzen",
      "Recovery-Routine 7 Tage einhalten und dokumentieren",
    ],
    reward: { xp: 460, affinity: { healer: 8 }, title: "supported", titleLabel: "Supported" },
  },
  {
    id: "trial_healer_2", tier: 2, trial: true,
    title: "Healer Trial II — Resilience Built",
    path: "healer", domain: "recovery", icon: "⌁", color: "#34d399",
    unlockCondition: "trial_healer_1",
    steps: [
      "14 Tage tägliche Recovery-Routine ohne Aussetzer",
      "Jemanden durch schwierige Phase begleiten und Reflexion schreiben",
      "Eigene Belastungsgrenzen klar definieren und kommunizieren",
      "Persönliches Wohlbefindensystem in 5 Punkten formulieren",
    ],
    reward: { xp: 850, affinity: { healer: 12 }, title: "resilience_built", titleLabel: "Resilience Built" },
  },

  // ── Artisan Trials ─────────────────────────────────────
  {
    id: "trial_artisan_1", tier: 1, trial: true,
    title: "Artisan Trial I — First Craft",
    path: "artisan", domain: "creativity", icon: "✦", color: "#a78bfa",
    unlockCondition: "gate_artisan_1",
    steps: [
      "Kleines handwerkliches oder kreatives Werk vollständig fertigstellen",
      "Prozess dokumentieren (Fotos, Notizen oder kurze Beschreibung)",
      "Selbsteinschätzung: Was kann ich, was will ich noch lernen?",
    ],
    reward: { xp: 480, affinity: { artisan: 8 }, title: "first_craft", titleLabel: "First Craft" },
  },
  {
    id: "trial_artisan_2", tier: 2, trial: true,
    title: "Artisan Trial II — Mastery of Medium",
    path: "artisan", domain: "creativity", icon: "✦", color: "#a78bfa",
    unlockCondition: "trial_artisan_1",
    steps: [
      "Anspruchsvolleres Werk in gewähltem Medium fertigstellen",
      "Technik bewusst verbessern: eine Schwäche gezielt angehen",
      "Feedback einholen und reflektieren",
      "Zweites Werk — sichtbarer Fortschritt zum ersten",
    ],
    reward: { xp: 900, affinity: { artisan: 12 }, title: "mastery_medium", titleLabel: "Mastery of Medium" },
  },

  // ── Runner Trials ──────────────────────────────────────
  {
    id: "trial_runner_1", tier: 1, trial: true,
    title: "Runner Trial I — Distance Check",
    path: "runner", domain: "body", icon: "◈", color: "#f59e0b",
    unlockCondition: "gate_runner_1",
    steps: [
      "3 Lauf-Sessions in einer Woche abschließen",
      "Strecke oder Zeit dokumentieren",
      "Reflexion: Wo liegt mein Limit? Was muss ich verbessern?",
    ],
    reward: { xp: 460, affinity: { runner: 8 }, title: "distance_checked", titleLabel: "Distance Checked" },
  },

  // ── Strategist Trials ──────────────────────────────────
  {
    id: "trial_strategist_1", tier: 1, trial: true,
    title: "Strategist Trial I — Plan & Execute",
    path: "strategist", domain: "discipline", icon: "⟁", color: "#0ea5e9",
    unlockCondition: "gate_strategist_1",
    steps: [
      "Wochenplan erstellen und zu 80%+ einhalten",
      "Tages-Review täglich über eine Woche durchführen",
      "Eine Gewohnheit neu einführen und 7 Tage einhalten",
    ],
    reward: { xp: 480, affinity: { strategist: 8 }, title: "plan_executed_s", titleLabel: "Plan Executed" },
  },

  // ── Guardian Trials ────────────────────────────────────
  {
    id: "trial_guardian_1", tier: 1, trial: true,
    title: "Guardian Trial I — Hold the Structure",
    path: "guardian", domain: "home", icon: "⬢", color: "#84cc16",
    unlockCondition: "gate_guardian_1",
    steps: [
      "14 Tage täglich aufräumen (< 10 Min. reichen)",
      "Haushalt und Finanzen in einer Woche vollständig im Griff",
      "Reflexion: Was brauche ich damit mein Umfeld funktioniert?",
    ],
    reward: { xp: 480, affinity: { guardian: 8 }, title: "structure_held", titleLabel: "Structure Held" },
  },

  
  // ════════════════════════════════════════════════════════
  // DISCOVERY GATES — Etappe 6 Ergänzung
  // Adventure + Service Discovery
  // ════════════════════════════════════════════════════════
  {
    id: "gate_discovery_adventure", tier: 1,
    title: "Adventure Gate I — First Step Outside",
    path: "explorer", domain: "adventure", icon: "⟡", color: "#f59e0b",
    discovery: true,
    steps: [
      "Eine Aktivität außerhalb der gewohnten Routine ausprobieren",
      "Erfahrung kurz reflektieren: Was war neu? Was hat überrascht?",
    ],
    reward: { xp: 200, affinity: { explorer: 5 }, title: "first_step", titleLabel: "First Step" },
  },
  {
    id: "gate_discovery_service", tier: 1,
    title: "Service Gate I — First Support",
    path: "healer", domain: "social", icon: "⌁", color: "#22c55e",
    discovery: true,
    steps: [
      "Jemandem heute aktiv und ohne Erwartung helfen",
      "Kurz reflektieren: Wie hat es sich angefühlt?",
    ],
    reward: { xp: 180, affinity: { healer: 5, leader: 3 }, title: "first_support", titleLabel: "First Support" },
  },
  {
    id: "gate_discovery_focus", tier: 1,
    title: "Focus Gate I — Mind Lock Protocol",
    path: "strategist", domain: "discipline", icon: "◎", color: "#0ea5e9",
    unlockCondition: null,
    discovery: true,
    steps: [
      "3 Fokus-Sessions à 20+ Minuten ohne Unterbrechung abschließen",
      "Notieren, was dich am stärksten ablenkt — und einen Gegenzug festlegen",
      "Reflexion: Wann am Tag ist dein Fokus am stärksten?",
    ],
    reward: { xp: 220, affinity: { strategist: 4, scholar: 3, monk: 3 }, title: "mind_locked", titleLabel: "Mind Locked" },
  },
  {
    id: "gate_discovery_leadership", tier: 1,
    title: "Leadership Gate I — First Command",
    path: "leader", domain: "social", icon: "◉", color: "#d97706",
    unlockCondition: null,
    discovery: true,
    steps: [
      "Eine Entscheidung treffen, die du sonst aufgeschoben hättest — und umsetzen",
      "Einmal Verantwortung für etwas übernehmen, das andere betrifft",
      "Reflexion: Wo könntest du öfter vorangehen statt abzuwarten?",
    ],
    reward: { xp: 220, affinity: { leader: 5, charmer: 2 }, title: "first_command", titleLabel: "First Command" },
  },
  {
    id: "gate_discovery_craft", tier: 1,
    title: "Craft Gate I — Maker Protocol",
    path: "artisan", domain: "craft", icon: "⌖", color: "#a78bfa",
    unlockCondition: null,
    discovery: true,
    steps: [
      "Etwas mit den eigenen Händen erschaffen, reparieren oder kochen",
      "Das Ergebnis kurz festhalten (Foto oder Notiz)",
      "Reflexion: Was würdest du beim nächsten Mal besser machen?",
    ],
    reward: { xp: 230, affinity: { artisan: 4, engineer: 4 }, title: "maker_awakened", titleLabel: "Maker Awakened" },
  },
  {
    id: "gate_discovery_home", tier: 1,
    title: "Home Gate I — Foundation Protocol",
    path: "guardian", domain: "home", icon: "⬢", color: "#84cc16",
    unlockCondition: null,
    discovery: true,
    steps: [
      "Einen Bereich deines Umfelds vollständig in Ordnung bringen",
      "Eine kleine Routine festlegen, damit er so bleibt",
      "Reflexion: Welcher Bereich kostet dich am meisten Energie?",
    ],
    reward: { xp: 210, affinity: { guardian: 5, strategist: 2 }, title: "foundation_laid", titleLabel: "Foundation Laid" },
  },
  {
    id: "gate_discovery_resource", tier: 1,
    title: "Resource Gate I — Asset Protocol",
    path: "merchant", domain: "finance", icon: "◆", color: "#22c55e",
    unlockCondition: null,
    discovery: true,
    steps: [
      "Deine Ausgaben der letzten 7 Tage ehrlich erfassen",
      "Eine konkrete Verbesserung festlegen (sparen, kündigen, verhandeln)",
      "Reflexion: Wofür willst du deine Ressourcen wirklich einsetzen?",
    ],
    reward: { xp: 210, affinity: { merchant: 5, strategist: 2 }, title: "asset_awakened", titleLabel: "Asset Awakened" },
  },

  // ════════════════════════════════════════════════════════
  // TRIALS — Etappe 6: Fehlende Tier II + III ergänzen
  // Runner, Strategist, Guardian, Artisan, Charmer,
  // Explorer, Healer, Leader, Monk
  // ════════════════════════════════════════════════════════

  // ── Runner Trial II + III ──────────────────────────────
  {
    id: "trial_runner_2", tier: 2, trial: true,
    title: "Runner Trial II — Endurance Push",
    path: "runner", domain: "body", icon: "◈", color: "#f59e0b",
    unlockCondition: "trial_runner_1",
    steps: [
      "5 Lauf-Sessions in 2 Wochen abschließen",
      "Längste Strecke oder beste Zeit dokumentieren",
      "Pace oder Distanz gegenüber Trial I messbar verbessert",
      "Reflexion: Was limitiert mich noch — Technik, Ausdauer, Mental?",
    ],
    reward: { xp: 850, affinity: { runner: 12 }, title: "endurance_push", titleLabel: "Endurance Push" },
  },
  {
    id: "trial_runner_3", tier: 3, trial: true,
    title: "Runner Trial III — The Long Run",
    path: "runner", domain: "body", icon: "◈", color: "#f59e0b",
    unlockCondition: "trial_runner_2",
    steps: [
      "10km oder persönliche Bestdistanz am Stück abschließen",
      "Training über 4+ Wochen konsistent dokumentiert",
      "Recovery-Protokoll nach langen Einheiten etabliert",
      "Nächstes messbares Ziel definieren und Plan aufschreiben",
    ],
    reward: { xp: 1400, affinity: { runner: 18 }, title: "long_run_proven", titleLabel: "Long Run Proven" },
  },

  // ── Strategist Trial II + III ──────────────────────────
  {
    id: "trial_strategist_2", tier: 2, trial: true,
    title: "Strategist Trial II — Systems Thinking",
    path: "strategist", domain: "discipline", icon: "⟁", color: "#0ea5e9",
    unlockCondition: "trial_strategist_1",
    steps: [
      "Persönliches Produktivitätssystem aufbauen und 2 Wochen testen",
      "3 übergeordnete Ziele mit Meilensteinen definieren",
      "Wochenreviews für 4 Wochen konsequent durchführen",
      "Engpässe im eigenen System identifizieren und eliminieren",
    ],
    reward: { xp: 900, affinity: { strategist: 12 }, title: "systems_thinker", titleLabel: "Systems Thinker" },
  },
  {
    id: "trial_strategist_3", tier: 3, trial: true,
    title: "Strategist Trial III — Execute & Adapt",
    path: "strategist", domain: "discipline", icon: "⟁", color: "#0ea5e9",
    unlockCondition: "trial_strategist_2",
    steps: [
      "Langfristiges Ziel (4+ Wochen) vollständig abschließen",
      "Rückblick: Was lief nach Plan, was musste angepasst werden?",
      "Neues System oder Prozess für die nächste Phase definieren",
      "Anderen deinen Planungsansatz erklären oder dokumentieren",
    ],
    reward: { xp: 1450, affinity: { strategist: 18 }, title: "adaptive_executor", titleLabel: "Adaptive Executor" },
  },

  // ── Guardian Trial II + III ────────────────────────────
  {
    id: "trial_guardian_2", tier: 2, trial: true,
    title: "Guardian Trial II — Stable Foundation",
    path: "guardian", domain: "home", icon: "⬢", color: "#84cc16",
    unlockCondition: "trial_guardian_1",
    steps: [
      "30 Tage täglich minimale Ordnungsroutine eingehalten",
      "Finanzen und Haushalt gleichzeitig 4 Wochen im Griff",
      "Einen Bereich dauerhaft verbessert (Möbel, System, Gewohnheit)",
      "Reflexion: Was macht mein Umfeld stabiler und weniger stressig?",
    ],
    reward: { xp: 900, affinity: { guardian: 12 }, title: "stable_foundation", titleLabel: "Stable Foundation" },
  },
  {
    id: "trial_guardian_3", tier: 3, trial: true,
    title: "Guardian Trial III — The Guardian",
    path: "guardian", domain: "home", icon: "⬢", color: "#84cc16",
    unlockCondition: "trial_guardian_2",
    steps: [
      "Vollständiges Ordnungs- und Finanzsystem für 8 Wochen eingehalten",
      "Eine Person bei Haushalt, Bürokratie oder Planung aktiv unterstützt",
      "Notfall-Puffer und klare Routinen dokumentiert",
      "Rückblick: Was ist jetzt dauerhaft stabil in meinem Leben?",
    ],
    reward: { xp: 1400, affinity: { guardian: 18 }, title: "the_guardian", titleLabel: "The Guardian" },
  },

  // ── Artisan Trial III ──────────────────────────────────
  {
    id: "trial_artisan_3", tier: 3, trial: true,
    title: "Artisan Trial III — The Craftsman",
    path: "artisan", domain: "creativity", icon: "✦", color: "#a78bfa",
    unlockCondition: "trial_artisan_2",
    steps: [
      "Umfangreiches Werk oder Projekt vollständig abschließen",
      "Werk öffentlich zeigen oder einer echten Person präsentieren",
      "Ehrliches externes Feedback eingeholt und reflektiert",
      "Nächste Stufe: Was brauche ich um besser zu werden?",
    ],
    reward: { xp: 1450, affinity: { artisan: 18 }, title: "the_craftsman", titleLabel: "The Craftsman" },
  },

  // ── Charmer Trial III ──────────────────────────────────
  {
    id: "trial_charmer_3", tier: 3, trial: true,
    title: "Charmer Trial III — The Presence",
    path: "charmer", domain: "social", icon: "✧", color: "#ec4899",
    unlockCondition: "trial_charmer_2",
    steps: [
      "10 bewusste soziale Interaktionen über 4 Wochen dokumentiert",
      "Herausfordernde soziale Situation gemeistert — Reflexion schreiben",
      "Eigenes Auftreten und Style bewusst weiterentwickelt",
      "Feedback von einer Person eingeholt: Wie wirkst du auf andere?",
    ],
    reward: { xp: 1400, affinity: { charmer: 18 }, title: "social_sovereign", titleLabel: "Social Sovereign" },
  },

  // ── Explorer Trial III ─────────────────────────────────
  {
    id: "trial_explorer_3", tier: 3, trial: true,
    title: "Explorer Trial III — Beyond the Map",
    path: "explorer", domain: "adventure", icon: "⟡", color: "#10b981",
    unlockCondition: "trial_explorer_2",
    steps: [
      "Mehrtägiges Abenteuer oder neue Umgebung erlebt",
      "5+ neue Aktivitäten oder Orte in diesem Jahr ausprobiert",
      "Eine Komfortzone dauerhaft erweitert — dokumentiert was sich verändert hat",
      "Nächstes Abenteuerziel definieren",
    ],
    reward: { xp: 1350, affinity: { explorer: 18 }, title: "beyond_the_map", titleLabel: "Beyond the Map" },
  },

  // ── Healer Trial III ───────────────────────────────────
  {
    id: "trial_healer_3", tier: 3, trial: true,
    title: "Healer Trial III — Resilient Support",
    path: "healer", domain: "recovery", icon: "⌁", color: "#22c55e",
    unlockCondition: "trial_healer_2",
    steps: [
      "30-Tage Recovery-Protokoll vollständig eingehalten",
      "Eine Person aktiv durch schwierige Phase begleitet",
      "Eigenes Wohlbefindensystem aufgebaut und dokumentiert",
      "Reflexion: Wie halte ich mich selbst stabil während ich anderen helfe?",
    ],
    reward: { xp: 1400, affinity: { healer: 18 }, title: "resilient_support", titleLabel: "Resilient Support" },
  },

  // ── Leader Trial III ───────────────────────────────────
  {
    id: "trial_leader_3", tier: 3, trial: true,
    title: "Leader Trial III — The Leader",
    path: "leader", domain: "social", icon: "◉", color: "#6366f1",
    unlockCondition: "trial_leader_2",
    steps: [
      "Gruppe oder Projekt über 4+ Wochen aktiv geführt",
      "Gruppenkonflikt oder schwierige Entscheidung durchgestanden",
      "Jemanden über längere Zeit gecoacht oder begleitet",
      "Reflexion: Was macht mich als Leader aus — Stärken und Schwächen?",
    ],
    reward: { xp: 1200, affinity: { leader: 20 }, title: "the_leader", titleLabel: "The Leader" },
  },

  // ── Monk Trial III ─────────────────────────────────────
  {
    id: "trial_monk_3", tier: 3, trial: true,
    title: "Monk Trial III — Inner Stillness",
    path: "monk", domain: "recovery", icon: "◎", color: "#8b5cf6",
    unlockCondition: "trial_monk_2",
    steps: [
      "30-Tage Meditation oder Achtsamkeitsroutine eingehalten",
      "Digital-Detox-Woche vollständig abgeschlossen",
      "Persönliche Schlafroutine dauerhaft stabilisiert",
      "Reflexion: Was bedeutet innere Ruhe für mich konkret?",
    ],
    reward: { xp: 1350, affinity: { monk: 18 }, title: "inner_stillness", titleLabel: "Inner Stillness" },
  },

  // ════════════════════════════════════════════════════════
  // SHADOW — Nur nach Spezialvoraussetzungen freigeschaltet
  // ════════════════════════════════════════════════════════
  {
    id: "gate_shadow_1", tier: 1,
    title: "Shadow Gate I — The Allrounder",
    path: "shadow", domain: "discipline", icon: "⧫", color: "#00ffff",
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

// ══════════════════════════════════════════════════════════
// MASTERY MILESTONES
// Langfristige Progression — werden aus State berechnet.
// Jeder Path hat generische + spezifische Milestones.
// Spezifische Milestones erscheinen erst mit Signalen.
// ══════════════════════════════════════════════════════════

// Generic milestones apply to every path
const GENERIC_MILESTONES = [
  { id: "m_quests_5",   label: "5 Quests in diesem Path abgeschlossen",   threshold: 5,   type: "quest_count" },
  { id: "m_quests_10",  label: "10 Quests in diesem Path abgeschlossen",  threshold: 10,  type: "quest_count" },
  { id: "m_quests_25",  label: "25 Quests in diesem Path abgeschlossen",  threshold: 25,  type: "quest_count" },
  { id: "m_gate_1",     label: "Gate I abgeschlossen",                    threshold: 1,   type: "gate_tier",  tier: 1 },
  { id: "m_gate_2",     label: "Gate II abgeschlossen",                   threshold: 1,   type: "gate_tier",  tier: 2 },
  { id: "m_goal_1",     label: "Erstes Ziel in diesem Path abgeschlossen",threshold: 1,   type: "goal_count" },
  { id: "m_logs_5",     label: "5 Progress Logs in diesem Path",          threshold: 5,   type: "log_count" },
  { id: "m_logs_10",    label: "10 Progress Logs in diesem Path",         threshold: 10,  type: "log_count" },
];

// Path-specific milestones (appear after signal ≥ 2)
export const PATH_MILESTONES = {
  fighter: [
    { id: "m_fighter_10train", label: "10 Trainingseinheiten abgeschlossen", threshold: 10, type: "quest_count" },
    { id: "m_fighter_perf",    label: "Messbarer Leistungsfortschritt dokumentiert", threshold: 1, type: "log_with_metric" },
    { id: "m_fighter_streak",  label: "14-Tage Training Streak", threshold: 14, type: "streak_domain", domain: "body" },
  ],
  runner: [
    { id: "m_runner_10runs",   label: "10 Lauf-Sessions abgeschlossen", threshold: 10, type: "quest_count" },
    { id: "m_runner_distance", label: "Streckenfortschritt dokumentiert", threshold: 1, type: "log_with_metric" },
    { id: "m_runner_5km",      label: "5km ohne Stopp gelaufen", threshold: 1, type: "manual" },
  ],
  scholar: [
    { id: "m_scholar_sessions",label: "25 Lernsessions abgeschlossen", threshold: 25, type: "quest_count" },
    { id: "m_scholar_explain", label: "Konzept erklärt oder weitergegeben", threshold: 1, type: "manual" },
    { id: "m_scholar_book",    label: "Buch oder Kurs vollständig abgeschlossen", threshold: 1, type: "manual" },
  ],
  engineer: [
    { id: "m_eng_project",     label: "Erstes eigenes Projekt fertiggestellt", threshold: 1, type: "manual" },
    { id: "m_eng_debug",       label: "Komplexes Problem gefunden und gelöst", threshold: 1, type: "manual" },
    { id: "m_eng_docs",        label: "Projekt dokumentiert", threshold: 1, type: "log_count" },
  ],
  artisan: [
    { id: "m_art_work",        label: "Erstes Werk abgeschlossen", threshold: 1, type: "manual" },
    { id: "m_art_feedback",    label: "Feedback zu eigenem Werk eingeholt", threshold: 1, type: "manual" },
    { id: "m_art_3logs",       label: "3 kreative Fortschritte dokumentiert", threshold: 3, type: "log_count" },
  ],
  creator: [
    { id: "m_creator_post",    label: "Erstes Werk veröffentlicht oder geteilt", threshold: 1, type: "manual" },
    { id: "m_creator_series",  label: "Content-Serie mit 3+ Teilen fertig", threshold: 1, type: "manual" },
    { id: "m_creator_fb",      label: "Echtes Feedback von Außenstehenden", threshold: 1, type: "manual" },
  ],
  charmer: [
    { id: "m_charmer_events",  label: "5 echte soziale Events / Gespräche", threshold: 5, type: "quest_count" },
    { id: "m_charmer_comfort", label: "Sozial unbequeme Situation gemeistert", threshold: 1, type: "manual" },
    { id: "m_charmer_style",   label: "Bewusste Style-Entscheidung umgesetzt", threshold: 1, type: "manual" },
  ],
  strategist: [
    { id: "m_strat_plan",      label: "Wochenplan 4 Wochen eingehalten", threshold: 4, type: "streak_domain", domain: "discipline" },
    { id: "m_strat_goal",      label: "Ziel mit Plan und Review abgeschlossen", threshold: 1, type: "goal_count" },
    { id: "m_strat_review",    label: "4 Wochenreviews durchgeführt", threshold: 4, type: "log_count" },
  ],
  guardian: [
    { id: "m_guard_order",     label: "30-Tage Ordnungsroutine eingehalten", threshold: 30, type: "streak_domain", domain: "home" },
    { id: "m_guard_budget",    label: "Budget 4 Wochen getrackt", threshold: 4, type: "log_count" },
    { id: "m_guard_emergency", label: "Notfall-Puffer angelegt", threshold: 1, type: "manual" },
  ],
  merchant: [
    { id: "m_merch_budget",    label: "4 Wochen Budget konsequent geführt", threshold: 4, type: "log_count" },
    { id: "m_merch_invest",    label: "Erste Investition oder Nebenprojekt gestartet", threshold: 1, type: "manual" },
    { id: "m_merch_career",    label: "Karriereschritt aktiv umgesetzt", threshold: 1, type: "manual" },
  ],
  monk: [
    { id: "m_monk_7rec",       label: "7 Recovery-Einheiten abgeschlossen", threshold: 7, type: "quest_count" },
    { id: "m_monk_sleep",      label: "Schlafroutine 2 Wochen eingehalten", threshold: 14, type: "streak_domain", domain: "recovery" },
    { id: "m_monk_detox",      label: "Digital Detox Weekend abgeschlossen", threshold: 1, type: "manual" },
  ],
  explorer: [
    { id: "m_exp_5new",        label: "5 neue Orte oder Aktivitäten erlebt", threshold: 5, type: "quest_count" },
    { id: "m_exp_solo",        label: "Solo-Aktivität außerhalb der Komfortzone", threshold: 1, type: "manual" },
    { id: "m_exp_trip",        label: "Mehrtägige Reise oder Abenteuer absolviert", threshold: 1, type: "manual" },
  ],
  leader: [
    { id: "m_lead_decision",   label: "3 wichtige Entscheidungen für andere getroffen", threshold: 3, type: "quest_count" },
    { id: "m_lead_mentored",   label: "Jemanden über 1 Monat begleitet", threshold: 1, type: "manual" },
    { id: "m_lead_conflict",   label: "Gruppenkonflikt angesprochen und gelöst", threshold: 1, type: "manual" },
  ],
  healer: [
    { id: "m_heal_30routine",  label: "30-Tage Recovery-Protokoll abgeschlossen", threshold: 30, type: "streak_domain", domain: "recovery" },
    { id: "m_heal_support",    label: "Person aktiv durch schwierige Phase begleitet", threshold: 1, type: "manual" },
    { id: "m_heal_resilience", label: "Persönliches Wohlbefindensystem aufgebaut", threshold: 1, type: "manual" },
  ],
  shadow: [],
};

/**
 * Gibt den nächsten relevanten Milestone für einen Path zurück.
 * Nur wenn signal >= 2 werden path-spezifische Milestones gezeigt.
 *
 * @param {string} pathId
 * @param {object} state     - vollständiger State
 * @param {number} [signalLevel] - 0-3
 */
export function getNextPathMilestone(pathId, state, signalLevel = 0) {
  const {
    questHistory   = [],
    progressLogs   = [],
    goals          = [],
    gateProgress   = {},
    completedMilestones = [],
  } = state;

  const pathQuests = questHistory.filter(h =>
    h.path === pathId || h.domain === (PATH_DOMAINS[pathId] || "")
  );
  const pathLogs   = progressLogs.filter(l => l.path === pathId);
  const pathGoals  = goals.filter(g => g.status === "completed" && g.path === pathId);
  const pathGates  = Object.entries(gateProgress)
    .filter(([id, g]) => g?.completed && id.includes(pathId));

  const gatesByTier = {
    1: pathGates.filter(([id]) => GATES.find(g => g.id === id)?.tier === 1).length,
    2: pathGates.filter(([id]) => GATES.find(g => g.id === id)?.tier === 2).length,
  };

  // Check generic milestones
  for (const m of GENERIC_MILESTONES) {
    const doneId = `${pathId}_${m.id}`;
    if (completedMilestones.includes(doneId)) continue;

    let reached = false;
    if (m.type === "quest_count")  reached = pathQuests.length  >= m.threshold;
    if (m.type === "log_count")    reached = pathLogs.length    >= m.threshold;
    if (m.type === "goal_count")   reached = pathGoals.length   >= m.threshold;
    if (m.type === "gate_tier")    reached = (gatesByTier[m.tier] || 0) >= m.threshold;

    if (!reached) {
      return { ...m, id: doneId, pathId, reached: false, specific: false };
    }
  }

  // Check path-specific milestones (only if signal >= 2)
  if (signalLevel >= 2) {
    const specific = PATH_MILESTONES[pathId] || [];
    for (const m of specific) {
      const doneId = `${pathId}_${m.id}`;
      if (completedMilestones.includes(doneId)) continue;

      let reached = false;
      if (m.type === "quest_count") reached = pathQuests.length >= m.threshold;
      if (m.type === "log_count")   reached = pathLogs.length   >= m.threshold;
      if (m.type === "goal_count")  reached = pathGoals.length  >= m.threshold;
      if (m.type === "manual")      reached = false; // manual = user confirms

      if (!reached) {
        return { ...m, id: doneId, pathId, reached: false, specific: true };
      }
    }
  }

  return null; // all milestones done
}

// Domain lookup for milestone calculation
const PATH_DOMAINS = {
  fighter: "body", runner: "body", scholar: "mind", engineer: "craft",
  artisan: "creativity", creator: "creativity", charmer: "social",
  strategist: "discipline", guardian: "home", merchant: "finance",
  monk: "recovery", explorer: "adventure", leader: "social", healer: "recovery",
};


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
/**
 * Gibt empfohlene Gates zurück — Signal-aware:
 *   - Discovery Gates für neue Nutzer (keine komplettierten Gates)
 *   - Path Gates für Nutzer mit Signal ≥ 1
 *   - Höchstens 2 Gates gleichzeitig anzeigen
 *   - Niedrigster Tier zuerst innerhalb eines Paths
 *
 * @param {object} sysAnalysis    - von analyzeSystem()
 * @param {object} gateProgress   - state.gateProgress
 * @param {object} [state]        - vollständiger State für Signal-System (optional)
 */
export function getRecommendedGates(sysAnalysis, gateProgress = {}, state = null) {
  const completedCount = Object.values(gateProgress).filter(g => g?.completed).length;

  // For brand-new users: show discovery gates first
  const discoveryGates = GATES.filter(g =>
    g.discovery &&
    !g.special &&
    !isGateCompleted(g.id, gateProgress) &&
    isGateUnlocked(g, gateProgress)
  );

  // ── Signal-based path targeting ──────────────────────────
  let targetPaths = new Set();

  // From sysAnalysis (already includes signal data from analyzeSystem)
  const dominated = sysAnalysis?.dominantPaths || [];
  const suggested  = sysAnalysis?.suggestedMainPath;
  // Etappe 14 (Szenario B): nur Paths mit AKTIVER Spezialisierung (Level >= 2)
  // bekommen Path-Gate-Empfehlungen — schwache Streusignale (Level 1 über
  // Sekundär-Domains) reichen nicht. Leichte Signale → weiterhin Discovery.
  const topSignals = (sysAnalysis?.topSignalPaths || [])
    .filter(sp => (sp.level ?? 0) >= 2)
    .map(sp => sp.pathId);
  targetPaths = new Set([...dominated, ...topSignals, suggested].filter(Boolean));

  // Path Gates for user with some history.
  // Etappe 7: OHNE Signale keine Path Gates — neuer Nutzer sieht
  // maximal Discovery Gates. Spezifische Path Gates erst durch Signale.
  const pathGates = GATES.filter(g => {
    if (g.special || g.discovery) return false;
    if (isGateCompleted(g.id, gateProgress)) return false;
    if (!isGateUnlocked(g, gateProgress)) return false;
    return targetPaths.has(g.path);
  });

  // Sort: tier ascending, then by path signal strength
  pathGates.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    // Prefer paths with more history
    const aIdx = [...targetPaths].indexOf(a.path);
    const bIdx = [...targetPaths].indexOf(b.path);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  // Strategy: show discovery gates if < 2 completed gates, else path gates
  const MAX_SHOWN = 2;
  if (completedCount < 2) {
    // Mix: 1 discovery + 1 path gate (falls Signale existieren),
    // sonst 2 Discovery Gates
    const result = [];
    if (discoveryGates.length > 0) result.push(discoveryGates[0]);
    const pathCandidate = pathGates.find(g => g.path !== result[0]?.path);
    if (pathCandidate && result.length < MAX_SHOWN) result.push(pathCandidate);
    if (result.length < MAX_SHOWN && discoveryGates.length > 1) {
      result.push(discoveryGates.find(g => !result.includes(g)));
    }
    if (result.length === 0 && pathGates.length > 0) result.push(pathGates[0]);
    return result.filter(Boolean);
  }

  // After 2+ gates: only path-specific gates
  return pathGates.slice(0, MAX_SHOWN);
}

// ═══════════════════════════════════════════════════════════
// getVisibleGates — Etappe 7
// Katalog-Sichtbarkeit: "Neuer Nutzer sieht maximal Discovery
// Gates. Gates dürfen im Hintergrund existieren."
// Sichtbar sind:
//   - alle Discovery Gates
//   - Path-Gates/Trials nur für Paths mit Signal (signalPaths,
//     aktive Paths) ODER bereits begonnenem/abgeschlossenem
//     Fortschritt in diesem Path.
// ═══════════════════════════════════════════════════════════
export function getVisibleGates(gateProgress = {}, opts = {}) {
  const {
    signalPaths = [],   // [{pathId, level}] oder ["pathId"]
    activePaths = [],   // explizit gewählte Paths
  } = opts;

  const signalSet = new Set([
    ...signalPaths.map(sp => (typeof sp === "string" ? sp : sp?.pathId)).filter(Boolean),
    ...activePaths,
  ]);

  // Paths mit bereits begonnenem/abgeschlossenem Gate-Fortschritt bleiben sichtbar
  const startedPaths = new Set();
  for (const [gateId, prog] of Object.entries(gateProgress)) {
    const hasProgress = prog?.completed || (prog?.steps || []).some(Boolean);
    if (!hasProgress) continue;
    const gate = GATES.find(g => g.id === gateId);
    if (gate?.path) startedPaths.add(gate.path);
  }

  return GATES.filter(g => {
    if (g.special) return false;
    if (g.discovery) return true;
    return signalSet.has(g.path) || startedPaths.has(g.path);
  });
}

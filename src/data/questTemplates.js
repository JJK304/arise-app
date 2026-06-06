// ============================================================
// QUEST TEMPLATES — Erweitertes System für Prompt 8
// Deckt alle 12+ Domains ab: mind, body, craft, creativity,
// social, appearance, discipline, career, finance, home,
// recovery, adventure
// ============================================================

export const QUEST_TEMPLATES = [

  // ════════════════════════════════════════════════════════
  // MIND / LERNEN
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_deep_work",
    titleTemplate: "{duration} Min. {topic} Deep Work",
    descTemplate:  "Fokussierte Arbeitszeit – kein Handy, kein Multitasking.",
    type: "daily", domain: "mind",
    paths: ["scholar", "engineer", "strategist"],
    baseXp: 40, actionType: "action",
    variables: { duration: [25, 45, 60], topic: "interest_mind" },
  },
  {
    id: "tpl_aufgaben",
    titleTemplate: "{count} {topic}-Aufgaben lösen",
    descTemplate:  "Eigenständig lösen – kein Abschauen.",
    type: "daily", domain: "mind",
    paths: ["scholar"],
    baseXp: 35, actionType: "action",
    variables: { count: [3, 5, 8], topic: "interest_mind" },
  },
  {
    id: "tpl_notizen",
    titleTemplate: "{topic} Notizen nacharbeiten",
    descTemplate:  "Aktives Erinnern: Stoff in eigenen Worten aufschreiben.",
    type: "daily", domain: "mind",
    paths: ["scholar"],
    baseXp: 28, actionType: "reflection",
    variables: { topic: "interest_mind" },
  },
  {
    id: "tpl_lesen",
    titleTemplate: "{duration} Min. {topic} lesen",
    descTemplate:  "Nicht überfliegen – wirklich verstehen und notieren.",
    type: "daily", domain: "mind",
    paths: ["scholar", "monk"],
    baseXp: 30, actionType: "action",
    variables: { duration: [20, 30, 45], topic: "interest_mind" },
  },
  {
    id: "tpl_konzept_erklaeren",
    titleTemplate: "{topic}-Konzept in eigenen Worten erklären",
    descTemplate:  "Schreib auf was du verstanden hast – ohne Vorlage.",
    type: "daily", domain: "mind",
    paths: ["scholar"],
    baseXp: 32, actionType: "reflection",
    variables: { topic: "interest_mind" },
  },

  // ════════════════════════════════════════════════════════
  // CRAFT / TECHNIK
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_code_session",
    titleTemplate: "{duration} Min. {topic}-Projekt",
    descTemplate:  "Eigenes Projekt voranbringen – konkretes Ziel setzen.",
    type: "daily", domain: "craft",
    paths: ["engineer", "scholar"],
    baseXp: 38, actionType: "project",
    variables: { duration: [25, 45, 60], topic: "interest_tech" },
  },
  {
    id: "tpl_datenblatt",
    titleTemplate: "{topic}-Datenblatt lesen",
    descTemplate:  "Technische Dokumentation verstehen und Kerninfos notieren.",
    type: "daily", domain: "craft",
    paths: ["engineer"],
    baseXp: 30, actionType: "action",
    variables: { topic: "interest_tech" },
  },
  {
    id: "tpl_fehler_debuggen",
    titleTemplate: "{topic}-Fehler analysieren und lösen",
    descTemplate:  "Bug oder Problem systematisch eingrenzen und lösen.",
    type: "daily", domain: "craft",
    paths: ["engineer"],
    baseXp: 36, actionType: "project",
    variables: { topic: "interest_tech" },
  },
  {
    id: "tpl_projekt_schritt",
    titleTemplate: "{topic}-Projekt: nächsten Schritt abschließen",
    descTemplate:  "Einen konkreten Schritt im Projekt voranbringen.",
    type: "daily", domain: "craft",
    paths: ["engineer", "strategist"],
    baseXp: 35, actionType: "project",
    variables: { topic: "interest_tech" },
  },
  {
    id: "tpl_kochen",
    titleTemplate: "{topic} kochen",
    descTemplate:  "Selbst zubereitet, frische Zutaten.",
    type: "daily", domain: "craft",
    paths: ["artisan", "guardian"],
    baseXp: 25, actionType: "action",
    variables: { topic: "interest_kitchen" },
  },

  // ════════════════════════════════════════════════════════
  // CREATIVITY
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_creative_session",
    titleTemplate: "{duration} Min. {topic} üben",
    descTemplate:  "Konzentrierte Übungseinheit mit konkretem Fokus.",
    type: "daily", domain: "creativity",
    paths: ["artisan", "creator"],
    baseXp: 32, actionType: "action",
    variables: { duration: [15, 25, 40], topic: "interest_creative" },
  },
  {
    id: "tpl_sketch",
    titleTemplate: "Skizze: {topic}-Idee",
    descTemplate:  "Schnelle Skizze ohne Perfektionsanspruch – einfach machen.",
    type: "daily", domain: "creativity",
    paths: ["artisan"],
    baseXp: 22, actionType: "action",
    variables: { topic: "interest_creative" },
  },
  {
    id: "tpl_werk_starten",
    titleTemplate: "Neues {topic}-Werk beginnen",
    descTemplate:  "Ersten Entwurf, ersten Akkord oder ersten Strich setzen.",
    type: "daily", domain: "creativity",
    paths: ["creator", "artisan"],
    baseXp: 28, actionType: "project",
    variables: { topic: "interest_creative" },
  },
  {
    id: "tpl_content",
    titleTemplate: "{duration} Min. {topic}-Content erstellen",
    descTemplate:  "Skript, Design, Video, Post – irgendetwas produzieren.",
    type: "daily", domain: "creativity",
    paths: ["creator"],
    baseXp: 34, actionType: "project",
    variables: { duration: [20, 35, 50], topic: "interest_creative" },
  },

  // ════════════════════════════════════════════════════════
  // BODY / FITNESS
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_training",
    titleTemplate: "{duration} Min. Training",
    descTemplate:  "Gym, Calisthenics, Sport – Hauptsache bewegen.",
    type: "daily", domain: "body",
    paths: ["fighter"],
    baseXp: 35, actionType: "metric",
    variables: { duration: [30, 45, 60] },
  },
  {
    id: "tpl_laufen",
    titleTemplate: "{distance} km laufen",
    descTemplate:  "Konstantes Tempo, kein Stopp.",
    type: "daily", domain: "body",
    paths: ["runner"],
    baseXp: 30, actionType: "metric",
    variables: { distance: [3, 5, 8] },
  },
  {
    id: "tpl_mobility",
    titleTemplate: "{duration} Min. Mobility",
    descTemplate:  "Dehnen, Mobilisieren, Gelenke lockern.",
    type: "daily", domain: "body",
    paths: ["runner", "fighter"],
    baseXp: 22, actionType: "metric",
    variables: { duration: [10, 15, 20] },
  },
  {
    id: "tpl_ernaehrung",
    titleTemplate: "Proteinreiche Mahlzeit planen und essen",
    descTemplate:  "Mind. 30g Protein, selbst zubereitet.",
    type: "daily", domain: "recovery",
    paths: ["fighter", "guardian"],
    baseXp: 20, actionType: "action",
    variables: {},
  },

  // ════════════════════════════════════════════════════════
  // SOCIAL / APPEARANCE
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_social_gespraech",
    titleTemplate: "Bewusstes Gespräch führen",
    descTemplate:  "5 Min. echtes Gespräch – aktiv zuhören, nachfragen.",
    type: "daily", domain: "social",
    paths: ["charmer", "explorer"],
    baseXp: 22, actionType: "action",
    variables: {},
  },
  {
    id: "tpl_social_kontakt",
    titleTemplate: "Aktiv jemanden kontaktieren",
    descTemplate:  "Nicht warten bis jemand schreibt – selbst Initiative ergreifen.",
    type: "daily", domain: "social",
    paths: ["charmer"],
    baseXp: 18, actionType: "action",
    variables: {},
  },
  {
    id: "tpl_appearance",
    titleTemplate: "Pflege-Routine vollständig",
    descTemplate:  "Haut, Haare, Körper – alles bewusst und vollständig.",
    type: "daily", domain: "appearance",
    paths: ["charmer"],
    baseXp: 15, actionType: "action",
    variables: {},
  },
  {
    id: "tpl_kommunikation",
    titleTemplate: "{duration} Min. Kommunikation üben",
    descTemplate:  "Reden, Präsentieren, Small Talk – bewusst trainieren.",
    type: "daily", domain: "social",
    paths: ["charmer", "strategist"],
    baseXp: 25, actionType: "action",
    variables: { duration: [10, 15, 25] },
  },

  // ════════════════════════════════════════════════════════
  // DISCIPLINE / LIFE
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_wochenplanung",
    titleTemplate: "Wochenplan erstellen",
    descTemplate:  "Nächste Woche planen: Uni, Sport, Soziales, Kreatives.",
    type: "weekly", domain: "discipline",
    paths: ["strategist", "guardian"],
    baseXp: 50, actionType: "reflection",
    variables: {},
  },
  {
    id: "tpl_tagesplanung",
    titleTemplate: "Tagesplan für heute aufschreiben",
    descTemplate:  "3–5 konkrete Aufgaben. Prioritäten setzen.",
    type: "daily", domain: "discipline",
    paths: ["strategist"],
    baseXp: 15, actionType: "action",
    variables: {},
  },
  {
    id: "tpl_journaling",
    titleTemplate: "{duration} Min. Journaling",
    descTemplate:  "Was lief heute? Was lernst du? Was planst du?",
    type: "daily", domain: "discipline",
    paths: ["monk", "scholar"],
    baseXp: 20, actionType: "reflection",
    variables: { duration: [5, 10, 20] },
  },
  {
    id: "tpl_ordnung",
    titleTemplate: "Arbeitsplatz/Zimmer aufräumen",
    descTemplate:  "5 Minuten systematisch aufräumen und organisieren.",
    type: "daily", domain: "home",
    paths: ["guardian"],
    baseXp: 15, actionType: "action",
    variables: {},
  },

  // ════════════════════════════════════════════════════════
  // FINANCE / CAREER
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_budget",
    titleTemplate: "Budget aktualisieren",
    descTemplate:  "Einnahmen und Ausgaben eintragen – Überblick behalten.",
    type: "daily", domain: "finance",
    paths: ["merchant"],
    baseXp: 20, actionType: "metric",
    variables: {},
  },
  {
    id: "tpl_karriere",
    titleTemplate: "Karriere-Aufgabe erledigen",
    descTemplate:  "Bewerbung, LinkedIn, Netzwerk oder Skill-Aufbau.",
    type: "daily", domain: "career",
    paths: ["merchant", "strategist"],
    baseXp: 30, actionType: "project",
    variables: {},
  },
  {
    id: "tpl_finanzen_recherche",
    titleTemplate: "{duration} Min. Finanzen / Investitionen lesen",
    descTemplate:  "Verstehen wie Geld arbeitet.",
    type: "daily", domain: "finance",
    paths: ["merchant", "scholar"],
    baseXp: 25, actionType: "action",
    variables: { duration: [15, 20, 30] },
  },

  // ════════════════════════════════════════════════════════
  // RECOVERY / MINDFULNESS
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_spaziergang",
    titleTemplate: "{duration} Min. Spaziergang ohne Handy",
    descTemplate:  "Draußen, keine Ablenkung, Gedanken sacken lassen.",
    type: "daily", domain: "recovery",
    paths: ["runner", "monk", "explorer"],
    baseXp: 20, actionType: "recovery",
    variables: { duration: [20, 30, 45] },
  },
  {
    id: "tpl_meditation",
    titleTemplate: "{duration} Min. Meditation / Atemübung",
    descTemplate:  "Augen zu, atmen, Gedanken ziehen lassen.",
    type: "daily", domain: "recovery",
    paths: ["monk"],
    baseXp: 22, actionType: "recovery",
    variables: { duration: [5, 10, 20] },
  },
  {
    id: "tpl_schlaf_routine",
    titleTemplate: "Schlafroutine einhalten",
    descTemplate:  "Handy weg, entspannt ins Bett.",
    type: "daily", domain: "recovery",
    paths: ["monk", "guardian"],
    baseXp: 18, actionType: "recovery",
    variables: {},
  },

  // ════════════════════════════════════════════════════════
  // ADVENTURE / GROWTH
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_komfortzone",
    titleTemplate: "Komfortzone verlassen: neue Erfahrung machen",
    descTemplate:  "Etwas tun das dir Unbehagen bereitet – bewusst.",
    type: "daily", domain: "adventure",
    paths: ["explorer", "charmer"],
    baseXp: 35, actionType: "action",
    variables: {},
  },
  {
    id: "tpl_outdoor",
    titleTemplate: "{duration} Min. Draußen / Natur",
    descTemplate:  "Raus aus vier Wänden. Frische Luft, neuer Ort.",
    type: "daily", domain: "adventure",
    paths: ["explorer", "runner"],
    baseXp: 22, actionType: "action",
    variables: { duration: [30, 60, 90] },
  },

  // ════════════════════════════════════════════════════════
  // CAREER / FINANCE — Neue Templates Prompt 4
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_bewerbung_schreiben",
    titleTemplate: "Bewerbungsunterlagen {topic} aktualisieren",
    descTemplate:  "CV, Anschreiben oder Portfolio auf aktuellen Stand bringen.",
    type: "daily", domain: "career",
    paths: ["merchant", "guardian"],
    baseXp: 38, actionType: "project",
    variables: { topic: "interest_mind" },
  },
  {
    id: "tpl_nebenprojekt",
    titleTemplate: "{duration} Min. an {topic}-Projekt arbeiten",
    descTemplate:  "Eigenes Vorhaben voranbringen — ein konkreter Schritt heute.",
    type: "daily", domain: "career",
    paths: ["merchant", "creator", "engineer"],
    baseXp: 42, actionType: "project",
    variables: { duration: [30, 45, 60], topic: "interest_tech" },
  },
  {
    id: "tpl_investieren_lernen",
    titleTemplate: "{duration} Min. Investitionsthema recherchieren",
    descTemplate:  "ETF, Aktien, Immobilien — Wissen aufbauen, nicht blinden Tipps folgen.",
    type: "daily", domain: "finance",
    paths: ["merchant", "scholar"],
    baseXp: 28, actionType: "action",
    variables: { duration: [15, 25, 40] },
  },
  {
    id: "tpl_budget_review",
    titleTemplate: "Monatsausgaben überprüfen und kategorisieren",
    descTemplate:  "Was gibt man wofür aus? Wo lässt sich optimieren?",
    type: "weekly", domain: "finance",
    paths: ["merchant", "guardian"],
    baseXp: 35, actionType: "metric",
    variables: {},
  },
  {
    id: "tpl_portfolio_update",
    titleTemplate: "{topic} Portfolio-Eintrag erstellen oder aktualisieren",
    descTemplate:  "Arbeit dokumentieren und präsentierbar machen.",
    type: "daily", domain: "career",
    paths: ["creator", "merchant", "artisan"],
    baseXp: 32, actionType: "project",
    variables: { topic: "interest_creative" },
  },
  {
    id: "tpl_netzwerk_aufbauen",
    titleTemplate: "1 neue Person im {topic}-Bereich kontaktieren",
    descTemplate:  "Kalt-Kontakt oder Reaktivierung — echte Verbindung zählt mehr als Follower.",
    type: "weekly", domain: "social",
    paths: ["charmer", "merchant"],
    baseXp: 40, actionType: "action",
    variables: { topic: "interest_mind" },
  },

  // ════════════════════════════════════════════════════════
  // CREATIVITY — Neue Templates Prompt 4
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_beatmaking_session",
    titleTemplate: "{duration} Min. Beat produzieren",
    descTemplate:  "DAW öffnen, Loop starten — fertigstellen ist Bonus.",
    type: "daily", domain: "creativity",
    paths: ["artisan", "creator"],
    baseXp: 35, actionType: "creative",
    variables: { duration: [25, 45, 60] },
  },
  {
    id: "tpl_podcast_episode",
    titleTemplate: "Podcast-Skript oder Folge planen",
    descTemplate:  "Struktur, Thema, Talking Points für die nächste Folge.",
    type: "daily", domain: "creativity",
    paths: ["creator", "charmer"],
    baseXp: 30, actionType: "project",
    variables: {},
  },
  {
    id: "tpl_kreativ_schreiben",
    titleTemplate: "{duration} Min. kreativ schreiben",
    descTemplate:  "Story, Essay, Tagebuch oder Braindump — keine Zensur.",
    type: "daily", domain: "creativity",
    paths: ["artisan", "creator"],
    baseXp: 28, actionType: "creative",
    variables: { duration: [15, 25, 45] },
  },
  {
    id: "tpl_3d_design",
    titleTemplate: "{duration} Min. {topic} 3D-Modell bearbeiten",
    descTemplate:  "Ein Objekt modellieren, texturieren oder druckvorbereiten.",
    type: "daily", domain: "creativity",
    paths: ["artisan", "engineer"],
    baseXp: 38, actionType: "project",
    variables: { duration: [30, 45, 60], topic: "interest_tech" },
  },

  // ════════════════════════════════════════════════════════
  // BODY — Neue Templates Prompt 4
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_schwimmen",
    titleTemplate: "{duration} Min. schwimmen",
    descTemplate:  "Bahnen ziehen — Tempo und Technik zählen mehr als Distanz.",
    type: "daily", domain: "body",
    paths: ["runner", "fighter"],
    baseXp: 35, actionType: "cardio",
    variables: { duration: [20, 30, 45] },
  },
  {
    id: "tpl_radfahren",
    titleTemplate: "{distance} km Radfahren",
    descTemplate:  "Draußen oder auf dem Ergometer — Puls hoch, Kopf frei.",
    type: "daily", domain: "body",
    paths: ["runner", "explorer"],
    baseXp: 30, actionType: "cardio",
    variables: { distance: [10, 20, 35] },
  },
  {
    id: "tpl_meal_prep",
    titleTemplate: "Meal Prep: {count} Mahlzeiten vorbereiten",
    descTemplate:  "Essen vorkochen spart Zeit und verhindert schlechte Impuls-Entscheidungen.",
    type: "weekly", domain: "body",
    paths: ["guardian", "monk"],
    baseXp: 32, actionType: "action",
    variables: { count: [3, 5, 7] },
  },
  {
    id: "tpl_calisthenics",
    titleTemplate: "Calisthenics-Session: {duration} Min.",
    descTemplate:  "Körpergewicht-Training — Pull-ups, Dips, Hollow Hold, Planche-Progression.",
    type: "daily", domain: "body",
    paths: ["fighter", "explorer"],
    baseXp: 38, actionType: "training",
    variables: { duration: [20, 35, 50] },
  },

  // ════════════════════════════════════════════════════════
  // MIND — Neue Templates Prompt 4
  // ════════════════════════════════════════════════════════
  {
    id: "tpl_rhetorik_ueben",
    titleTemplate: "{duration} Min. Rede / Vortrag üben",
    descTemplate:  "Laut sprechen, aufnehmen, anhören, verbessern — Wiederholung macht Meister.",
    type: "daily", domain: "mind",
    paths: ["charmer", "scholar"],
    baseXp: 32, actionType: "action",
    variables: { duration: [10, 20, 30] },
  },
  {
    id: "tpl_statistik_aufgaben",
    titleTemplate: "{count} Statistik-Aufgaben lösen",
    descTemplate:  "Verteilungen, Tests, Bayes — mit Hand und dann mit Code.",
    type: "daily", domain: "mind",
    paths: ["scholar", "engineer"],
    baseXp: 38, actionType: "action",
    variables: { count: [3, 5, 8] },
  },
  {
    id: "tpl_ki_recherche",
    titleTemplate: "{duration} Min. KI/ML Paper oder Konzept studieren",
    descTemplate:  "Einen Algorithmus, ein Paper oder ein Konzept wirklich verstehen.",
    type: "daily", domain: "mind",
    paths: ["scholar", "engineer"],
    baseXp: 40, actionType: "action",
    variables: { duration: [20, 35, 50] },
  },
];

// ── Legacy-Compat: INTEREST_TOPICS wird noch von altem Code genutzt ──
export const INTEREST_TOPICS = {
  physik:        { group: "interest_mind",     label: "Physik" },
  mathe:         { group: "interest_mind",     label: "Mathe" },
  elektronik:    { group: "interest_tech",     label: "Elektronik" },
  programmieren: { group: "interest_tech",     label: "Programmieren" },
  zeichnen:      { group: "interest_creative", label: "Zeichnen" },
  musik:         { group: "interest_creative", label: "Musik" },
  kochen:        { group: "interest_kitchen",  label: "ein neues Gericht" },
  fitness:       { group: "interest_fitness",  label: "Fitness" },
  mobility:      { group: "interest_fitness",  label: "Mobility" },
};

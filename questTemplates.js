// ============================================================
// QUEST TEMPLATES
// Basis-Templates für personalisierte Quest-Generierung.
// Variablen werden zur Laufzeit durch Nutzer-Interessen ersetzt.
// ============================================================

// Jedes Template hat:
//   id           – eindeutig, beginnt mit "tpl_"
//   titleTemplate– "{duration} Min. {topic} Deep Work" etc.
//   descTemplate – kurze Beschreibung, optional {topic}
//   type         – "daily"
//   domain       – cat-Key (uni, skill_tech, …)
//   paths        – Pfade die davon profitieren
//   stats        – { statKey: pts } nur bei Milestones, sonst leer
//   variables    – { duration: [25,45,60], topic: "userInterest" }
//   baseXp       – XP bei "medium" Quest-Länge
//   lengthScale  – { short: 0.7, medium: 1.0, long: 1.35 }

export const QUEST_TEMPLATES = [

  // ── Mind / Lernen ──
  {
    id: "tpl_deep_work",
    titleTemplate: "{duration} Min. {topic} Deep Work",
    descTemplate: "Fokussierte Arbeitszeit – kein Handy, kein Multitasking.",
    type: "daily", domain: "uni",
    paths: ["scholar", "engineer"],
    stats: {}, baseXp: 40,
    variables: { duration: [25, 45, 60], topic: "interest_mind" },
  },
  {
    id: "tpl_aufgaben",
    titleTemplate: "{count} {topic}-Aufgaben lösen",
    descTemplate: "Eigenständig lösen – kein Abschauen.",
    type: "daily", domain: "uni",
    paths: ["scholar"],
    stats: {}, baseXp: 35,
    variables: { count: [3, 5, 8], topic: "interest_mind" },
  },
  {
    id: "tpl_notizen",
    titleTemplate: "{topic} Notizen nacharbeiten",
    descTemplate: "Aktives Erinnern: Stoff in eigenen Worten aufschreiben.",
    type: "daily", domain: "uni",
    paths: ["scholar"],
    stats: {}, baseXp: 28,
    variables: { topic: "interest_mind" },
  },

  // ── Tech / Programmieren ──
  {
    id: "tpl_code_session",
    titleTemplate: "{duration} Min. {topic} Projekt",
    descTemplate: "Eigenes Projekt voranbringen – konkretes Ziel setzen.",
    type: "daily", domain: "skill_tech",
    paths: ["engineer", "scholar"],
    stats: {}, baseXp: 38,
    variables: { duration: [25, 45, 60], topic: "interest_tech" },
  },
  {
    id: "tpl_datenblatt",
    titleTemplate: "{topic} Datenblatt lesen",
    descTemplate: "Technische Dokumentation verstehen und Kerninfos notieren.",
    type: "daily", domain: "skill_tech",
    paths: ["engineer"],
    stats: {}, baseXp: 30,
    variables: { topic: "interest_tech" },
  },

  // ── Kreativität ──
  {
    id: "tpl_creative_session",
    titleTemplate: "{duration} Min. {topic} üben",
    descTemplate: "Konzentrierte Übungseinheit mit konkretem Ziel.",
    type: "daily", domain: "skill_creative",
    paths: ["artisan"],
    stats: {}, baseXp: 32,
    variables: { duration: [15, 25, 40], topic: "interest_creative" },
  },
  {
    id: "tpl_sketch",
    titleTemplate: "Skizze: {topic}",
    descTemplate: "Schnelle Skizze ohne Perfektionsanspruch – einfach machen.",
    type: "daily", domain: "skill_creative",
    paths: ["artisan"],
    stats: {}, baseXp: 22,
    variables: { topic: "interest_creative" },
  },

  // ── Fitness / Bewegung ──
  {
    id: "tpl_training",
    titleTemplate: "{duration} Min. Training",
    descTemplate: "Gym, Calisthenics, Cardio – Hauptsache bewegen.",
    type: "daily", domain: "strength",
    paths: ["fighter"],
    stats: {}, baseXp: 35,
    variables: { duration: [30, 45, 60] },
  },
  {
    id: "tpl_laufen",
    titleTemplate: "{distance} km laufen",
    descTemplate: "Konstantes Tempo, kein Stopp.",
    type: "daily", domain: "cardio",
    paths: ["runner"],
    stats: {}, baseXp: 30,
    variables: { distance: [3, 5, 8] },
  },
  {
    id: "tpl_mobility",
    titleTemplate: "{duration} Min. Mobility",
    descTemplate: "Dehnen, Mobilisieren, Faszienarbeit.",
    type: "daily", domain: "cardio",
    paths: ["runner", "fighter"],
    stats: {}, baseXp: 22,
    variables: { duration: [10, 15, 20] },
  },

  // ── Gesundheit / Routine ──
  {
    id: "tpl_spaziergang",
    titleTemplate: "{duration} Min. Spaziergang ohne Handy",
    descTemplate: "Draußen, keine Ablenkung, Gedanken sacken lassen.",
    type: "daily", domain: "health",
    paths: ["runner"],
    stats: {}, baseXp: 20,
    variables: { duration: [20, 30, 45] },
  },
  {
    id: "tpl_kochen",
    titleTemplate: "{topic} kochen",
    descTemplate: "Selbst zubereitet, frische Zutaten.",
    type: "daily", domain: "skill_practical",
    paths: ["artisan"],
    stats: {}, baseXp: 25,
    variables: { topic: "interest_kitchen" },
  },
];

// Interessen-Mapping: interest-ID → Anzeige-Topic für Templates
export const INTEREST_TOPICS = {
  // mind
  physik:        { group: "interest_mind",     label: "Physik" },
  mathe:         { group: "interest_mind",     label: "Mathe" },
  // tech
  elektronik:    { group: "interest_tech",     label: "Elektronik" },
  programmieren: { group: "interest_tech",     label: "Programmieren" },
  // creative
  zeichnen:      { group: "interest_creative", label: "Zeichnen" },
  musik:         { group: "interest_creative", label: "Musik" },
  // kitchen
  kochen:        { group: "interest_kitchen",  label: "ein neues Gericht" },
  // fitness → keine topic-Variable nötig (fitness/mobility direkt)
  fitness:       { group: "interest_fitness",  label: "Fitness" },
  mobility:      { group: "interest_fitness",  label: "Mobility" },
};

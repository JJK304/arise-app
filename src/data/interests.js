// ============================================================
// INTERESTS — Strukturierte Interesse-Datenbank
// Jedes Interesse ist einer Domain und verwandten Paths zugeordnet.
// Wird vom Quest Generator, Goals und SystemAnalysis genutzt.
// ============================================================

export const INTERESTS = {

  // ════════════════════════════════════════════════════════
  // MIND / LERNEN
  // ════════════════════════════════════════════════════════
  physik: {
    id: "physik", label: "Physik", icon: "⚛️",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "engineer"],
    relatedStats: ["INT"],
    tags: ["lernen", "wissenschaft", "uni", "studium"],
    questTopic: "Physik",
  },
  mathe: {
    id: "mathe", label: "Mathe", icon: "📐",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "strategist"],
    relatedStats: ["INT"],
    tags: ["lernen", "wissenschaft", "uni", "logik"],
    questTopic: "Mathe",
  },
  chemie: {
    id: "chemie", label: "Chemie", icon: "🧪",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar"],
    relatedStats: ["INT"],
    tags: ["lernen", "wissenschaft", "uni"],
    questTopic: "Chemie",
  },
  biologie: {
    id: "biologie", label: "Biologie", icon: "🌿",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar"],
    relatedStats: ["INT"],
    tags: ["lernen", "wissenschaft", "natur"],
    questTopic: "Biologie",
  },
  informatik: {
    id: "informatik", label: "Informatik", icon: "💡",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "engineer"],
    relatedStats: ["INT"],
    tags: ["lernen", "tech", "logik"],
    questTopic: "Informatik",
  },
  programmieren: {
    id: "programmieren", label: "Programmieren", icon: "💻",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer", "scholar"],
    relatedStats: ["INT", "CRA"],
    tags: ["tech", "projekt", "coding"],
    questTopic: "Programmieren",
  },
  sprachen: {
    id: "sprachen", label: "Sprachen", icon: "🌐",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "charmer", "explorer"],
    relatedStats: ["INT", "CHA"],
    tags: ["lernen", "kommunikation", "kultur"],
    questTopic: "Sprachen",
  },
  lesen: {
    id: "lesen", label: "Lesen", icon: "📚",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "monk"],
    relatedStats: ["INT"],
    tags: ["lernen", "wissen", "konzentration"],
    questTopic: "ein Buch",
  },
  schreiben: {
    id: "schreiben", label: "Schreiben", icon: "✍️",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "creator"],
    relatedStats: ["INT", "CRE"],
    tags: ["kreativ", "lernen", "reflexion"],
    questTopic: "Schreiben",
  },
  geschichte: {
    id: "geschichte", label: "Geschichte", icon: "🏛️",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "explorer"],
    relatedStats: ["INT"],
    tags: ["lernen", "kultur", "wissen"],
    questTopic: "Geschichte",
  },
  philosophie: {
    id: "philosophie", label: "Philosophie", icon: "🤔",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "monk"],
    relatedStats: ["INT"],
    tags: ["reflexion", "denken", "tiefe"],
    questTopic: "Philosophie",
  },
  deepwork: {
    id: "deepwork", label: "Deep Work", icon: "🎯",
    domain: "discipline", group: "discipline",
    relatedPaths: ["scholar", "strategist", "monk"],
    relatedStats: ["INT", "END"],
    tags: ["fokus", "produktivität", "konzentration"],
    questTopic: "Deep Work",
  },
  pruefungsvorbereitung: {
    id: "pruefungsvorbereitung", label: "Prüfungsvorbereitung", icon: "📝",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar"],
    relatedStats: ["INT", "END"],
    tags: ["lernen", "uni", "vorbereitung"],
    questTopic: "Prüfungsstoff",
  },

  // ════════════════════════════════════════════════════════
  // BODY / HEALTH
  // ════════════════════════════════════════════════════════
  krafttraining: {
    id: "krafttraining", label: "Krafttraining", icon: "🏋️",
    domain: "body", group: "body",
    relatedPaths: ["fighter"],
    relatedStats: ["STR", "VIT"],
    tags: ["gym", "kraft", "muskeln"],
    questTopic: "Training",
  },
  laufen: {
    id: "laufen", label: "Laufen", icon: "🏃",
    domain: "body", group: "body",
    relatedPaths: ["runner", "explorer"],
    relatedStats: ["AGI", "END"],
    tags: ["cardio", "ausdauer", "outdoor"],
    questTopic: "Laufen",
  },
  ausdauer: {
    id: "ausdauer", label: "Ausdauer", icon: "⚡",
    domain: "body", group: "body",
    relatedPaths: ["runner", "fighter"],
    relatedStats: ["AGI", "END"],
    tags: ["cardio", "fitness", "sport"],
    questTopic: "Ausdauer",
  },
  mobility: {
    id: "mobility", label: "Mobility", icon: "🧘",
    domain: "body", group: "body",
    relatedPaths: ["runner", "monk"],
    relatedStats: ["AGI", "VIT"],
    tags: ["dehnen", "flexibilität", "körper"],
    questTopic: "Mobility",
  },
  ernaehrung: {
    id: "ernaehrung", label: "Ernährung", icon: "🥗",
    domain: "recovery", group: "recovery",
    relatedPaths: ["fighter", "guardian", "monk"],
    relatedStats: ["VIT"],
    tags: ["gesundheit", "essen", "makros"],
    questTopic: "Ernährung",
  },
  schlaf: {
    id: "schlaf", label: "Schlaf", icon: "😴",
    domain: "recovery", group: "recovery",
    relatedPaths: ["monk", "guardian"],
    relatedStats: ["VIT", "END"],
    tags: ["regeneration", "erholung", "gesundheit"],
    questTopic: "Schlaf",
  },
  sport: {
    id: "sport", label: "Sport allgemein", icon: "⚽",
    domain: "body", group: "body",
    relatedPaths: ["fighter", "runner", "explorer"],
    relatedStats: ["STR", "AGI"],
    tags: ["fitness", "bewegung", "gesundheit"],
    questTopic: "Sport",
  },
  yoga: {
    id: "yoga", label: "Yoga", icon: "🌸",
    domain: "recovery", group: "recovery",
    relatedPaths: ["monk", "runner"],
    relatedStats: ["AGI", "VIT"],
    tags: ["körper", "geist", "balance"],
    questTopic: "Yoga",
  },

  // ════════════════════════════════════════════════════════
  // CRAFT / TECHNIK / PROJEKTE
  // ════════════════════════════════════════════════════════
  elektronik: {
    id: "elektronik", label: "Elektronik", icon: "🔌",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer"],
    relatedStats: ["INT", "CRA"],
    tags: ["hardware", "löten", "schaltungen"],
    questTopic: "Elektronik",
  },
  robotik: {
    id: "robotik", label: "Robotik", icon: "🤖",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer"],
    relatedStats: ["INT", "CRA"],
    tags: ["tech", "projekt", "hardware"],
    questTopic: "Robotik",
  },
  "3ddruck": {
    id: "3ddruck", label: "3D-Druck", icon: "🖨️",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer", "artisan"],
    relatedStats: ["CRA"],
    tags: ["prototyping", "hardware", "druck"],
    questTopic: "3D-Druck",
  },
  reparieren: {
    id: "reparieren", label: "Reparieren", icon: "🔨",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer", "guardian"],
    relatedStats: ["CRA"],
    tags: ["handwerk", "technik", "praktisch"],
    questTopic: "Reparatur",
  },
  kochen: {
    id: "kochen", label: "Kochen", icon: "🍳",
    domain: "craft", group: "craft",
    relatedPaths: ["artisan", "guardian"],
    relatedStats: ["CRE", "CRA"],
    tags: ["kreativ", "haushalt", "ernährung"],
    questTopic: "ein neues Gericht",
  },
  projektmanagement: {
    id: "projektmanagement", label: "Projektmanagement", icon: "📋",
    domain: "discipline", group: "discipline",
    relatedPaths: ["strategist", "engineer"],
    relatedStats: ["INT", "END"],
    tags: ["planen", "organisieren", "systeme"],
    questTopic: "Projektplanung",
  },
  dokumentation: {
    id: "dokumentation", label: "Dokumentation", icon: "📄",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer", "scholar"],
    relatedStats: ["INT"],
    tags: ["schreiben", "technik", "wissen"],
    questTopic: "Dokumentation",
  },

  // ════════════════════════════════════════════════════════
  // CREATIVITY
  // ════════════════════════════════════════════════════════
  zeichnen: {
    id: "zeichnen", label: "Zeichnen", icon: "🎨",
    domain: "creativity", group: "creative",
    relatedPaths: ["artisan", "creator"],
    relatedStats: ["CRE"],
    tags: ["kunst", "kreativ", "üben"],
    questTopic: "Zeichnen",
  },
  musik: {
    id: "musik", label: "Musik", icon: "🎵",
    domain: "creativity", group: "creative",
    relatedPaths: ["artisan", "creator"],
    relatedStats: ["CRE"],
    tags: ["instrument", "kreativ", "üben"],
    questTopic: "Musik",
  },
  design: {
    id: "design", label: "Design", icon: "✏️",
    domain: "creativity", group: "creative",
    relatedPaths: ["creator", "artisan"],
    relatedStats: ["CRE"],
    tags: ["ui", "grafik", "kreativ"],
    questTopic: "Design",
  },
  fotografie: {
    id: "fotografie", label: "Fotografie", icon: "📷",
    domain: "creativity", group: "creative",
    relatedPaths: ["creator", "explorer"],
    relatedStats: ["CRE"],
    tags: ["kreativ", "visuell", "kunst"],
    questTopic: "Fotografie",
  },
  video: {
    id: "video", label: "Video", icon: "🎬",
    domain: "creativity", group: "creative",
    relatedPaths: ["creator"],
    relatedStats: ["CRE", "CHA"],
    tags: ["content", "kreativ", "schnitt"],
    questTopic: "Video",
  },
  contentcreation: {
    id: "contentcreation", label: "Content Creation", icon: "📱",
    domain: "creativity", group: "creative",
    relatedPaths: ["creator", "charmer"],
    relatedStats: ["CRE", "CHA"],
    tags: ["social media", "kreativ", "marke"],
    questTopic: "Content",
  },
  storytelling: {
    id: "storytelling", label: "Storytelling", icon: "📖",
    domain: "creativity", group: "creative",
    relatedPaths: ["creator", "charmer"],
    relatedStats: ["CRE", "CHA"],
    tags: ["erzählen", "kreativ", "kommunikation"],
    questTopic: "Storytelling",
  },

  // ════════════════════════════════════════════════════════
  // SOCIAL / APPEARANCE
  // ════════════════════════════════════════════════════════
  socialskills: {
    id: "socialskills", label: "Social Skills", icon: "🤝",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "explorer"],
    relatedStats: ["CHA", "SOC"],
    tags: ["kommunikation", "netzwerk", "beziehungen"],
    questTopic: "Social Skills",
  },
  kommunikation: {
    id: "kommunikation", label: "Kommunikation", icon: "💬",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "strategist"],
    relatedStats: ["CHA"],
    tags: ["sprechen", "präsentation", "überzeugung"],
    questTopic: "Kommunikation",
  },
  hautpflege: {
    id: "hautpflege", label: "Hautpflege", icon: "✨",
    domain: "appearance", group: "appearance",
    relatedPaths: ["charmer"],
    relatedStats: ["APP"],
    tags: ["pflege", "routine", "aussehen"],
    questTopic: "Hautpflege",
  },
  style: {
    id: "style", label: "Style & Kleidung", icon: "👔",
    domain: "appearance", group: "appearance",
    relatedPaths: ["charmer"],
    relatedStats: ["APP", "CHA"],
    tags: ["mode", "aussehen", "auftreten"],
    questTopic: "Style",
  },
  selbstbewusstsein: {
    id: "selbstbewusstsein", label: "Selbstbewusstsein", icon: "💪",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "fighter", "explorer"],
    relatedStats: ["CHA", "END"],
    tags: ["mental", "auftreten", "identität"],
    questTopic: "Selbstbewusstsein",
  },
  praesentieren: {
    id: "praesentieren", label: "Präsentieren", icon: "🎤",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "strategist"],
    relatedStats: ["CHA"],
    tags: ["reden", "öffentlich", "überzeugung"],
    questTopic: "Präsentation",
  },

  // ════════════════════════════════════════════════════════
  // DISCIPLINE / LIFE
  // ════════════════════════════════════════════════════════
  routinen: {
    id: "routinen", label: "Routinen", icon: "🔄",
    domain: "discipline", group: "discipline",
    relatedPaths: ["guardian", "monk", "fighter"],
    relatedStats: ["END"],
    tags: ["gewohnheit", "morgen", "abend"],
    questTopic: "Routinen",
  },
  ordnung: {
    id: "ordnung", label: "Ordnung", icon: "📦",
    domain: "home", group: "home",
    relatedPaths: ["guardian"],
    relatedStats: ["END"],
    tags: ["aufräumen", "organisieren", "haushalt"],
    questTopic: "Ordnung",
  },
  zeitmanagement: {
    id: "zeitmanagement", label: "Zeitmanagement", icon: "⏰",
    domain: "discipline", group: "discipline",
    relatedPaths: ["strategist", "merchant"],
    relatedStats: ["INT", "END"],
    tags: ["planen", "produktivität", "prioritäten"],
    questTopic: "Zeitmanagement",
  },
  finanzen: {
    id: "finanzen", label: "Finanzen", icon: "💰",
    domain: "finance", group: "finance",
    relatedPaths: ["merchant", "strategist"],
    relatedStats: ["INT"],
    tags: ["budget", "sparen", "investieren"],
    questTopic: "Finanzen",
  },
  karriere: {
    id: "karriere", label: "Karriere", icon: "📈",
    domain: "career", group: "career",
    relatedPaths: ["merchant", "strategist", "scholar"],
    relatedStats: ["INT", "CHA"],
    tags: ["beruf", "bewerbung", "netzwerk"],
    questTopic: "Karriere",
  },
  journaling: {
    id: "journaling", label: "Journaling", icon: "📓",
    domain: "discipline", group: "discipline",
    relatedPaths: ["monk", "scholar"],
    relatedStats: ["END", "INT"],
    tags: ["reflexion", "schreiben", "bewusstsein"],
    questTopic: "Journal",
  },

  // ════════════════════════════════════════════════════════
  // RECOVERY / MINDFULNESS
  // ════════════════════════════════════════════════════════
  meditation: {
    id: "meditation", label: "Meditation", icon: "🧘",
    domain: "recovery", group: "recovery",
    relatedPaths: ["monk"],
    relatedStats: ["VIT", "END"],
    tags: ["achtsamkeit", "ruhe", "fokus"],
    questTopic: "Meditation",
  },
  atemübungen: {
    id: "atemübungen", label: "Atemübungen", icon: "🌬️",
    domain: "recovery", group: "recovery",
    relatedPaths: ["monk", "runner"],
    relatedStats: ["VIT"],
    tags: ["entspannung", "stress", "fokus"],
    questTopic: "Atemübungen",
  },
  stressmanagement: {
    id: "stressmanagement", label: "Stressmanagement", icon: "🌊",
    domain: "recovery", group: "recovery",
    relatedPaths: ["monk", "guardian"],
    relatedStats: ["VIT", "END"],
    tags: ["mental", "balance", "erholung"],
    questTopic: "Stressabbau",
  },
  natur: {
    id: "natur", label: "Natur & Draußen", icon: "🌲",
    domain: "recovery", group: "recovery",
    relatedPaths: ["explorer", "monk", "runner"],
    relatedStats: ["VIT", "AGI"],
    tags: ["outdoor", "erholung", "bewegung"],
    questTopic: "Natur",
  },

  // ════════════════════════════════════════════════════════
  // ADVENTURE / GROWTH
  // ════════════════════════════════════════════════════════
  reisen: {
    id: "reisen", label: "Reisen", icon: "✈️",
    domain: "adventure", group: "adventure",
    relatedPaths: ["explorer"],
    relatedStats: ["AGI", "CHA"],
    tags: ["welt", "kultur", "erfahrung"],
    questTopic: "Reisen",
  },
  komfortzone: {
    id: "komfortzone", label: "Komfortzone", icon: "🚀",
    domain: "adventure", group: "adventure",
    relatedPaths: ["explorer", "charmer", "fighter"],
    relatedStats: ["END", "CHA"],
    tags: ["wachstum", "mut", "herausforderung"],
    questTopic: "neue Erfahrung",
  },
  outdoor: {
    id: "outdoor", label: "Outdoor", icon: "🏔️",
    domain: "adventure", group: "adventure",
    relatedPaths: ["explorer", "runner"],
    relatedStats: ["AGI", "VIT"],
    tags: ["natur", "aktivität", "abenteuer"],
    questTopic: "Outdoor-Aktivität",
  },

  // ════════════════════════════════════════════════════════
  // MIND / LEARNING — Ergänzungen Prompt 4
  // ════════════════════════════════════════════════════════
  statistik: {
    id: "statistik", label: "Statistik", icon: "📊",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "strategist"],
    relatedStats: ["INT"],
    tags: ["lernen", "wissenschaft", "data", "mathe"],
    questTopic: "Statistik",
  },
  maschinelles_lernen: {
    id: "maschinelles_lernen", label: "KI & Machine Learning", icon: "🤖",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "engineer"],
    relatedStats: ["INT"],
    tags: ["tech", "ki", "programmieren", "zukunft"],
    questTopic: "Machine Learning",
  },
  wirtschaft: {
    id: "wirtschaft", label: "Wirtschaft", icon: "📈",
    domain: "mind", group: "mind",
    relatedPaths: ["merchant", "strategist"],
    relatedStats: ["INT"],
    tags: ["lernen", "finanzen", "business", "wirtschaft"],
    questTopic: "Wirtschaft",
  },
  psychologie: {
    id: "psychologie", label: "Psychologie", icon: "🧠",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar", "charmer"],
    relatedStats: ["INT", "CHA"],
    tags: ["lernen", "mental", "selbst", "verhalten"],
    questTopic: "Psychologie",
  },
  rhetorik: {
    id: "rhetorik", label: "Rhetorik", icon: "🎤",
    domain: "mind", group: "mind",
    relatedPaths: ["charmer", "scholar"],
    relatedStats: ["CHA", "INT"],
    tags: ["kommunikation", "reden", "überzeugung"],
    questTopic: "Rhetorik",
  },
  gedaechtnistraining: {
    id: "gedaechtnistraining", label: "Gedächtnistraining", icon: "🗂️",
    domain: "mind", group: "mind",
    relatedPaths: ["scholar"],
    relatedStats: ["INT"],
    tags: ["lernen", "gedächtnis", "technik", "effizienz"],
    questTopic: "Gedächtnis",
  },

  // ════════════════════════════════════════════════════════
  // BODY / HEALTH — Ergänzungen Prompt 4
  // ════════════════════════════════════════════════════════
  calisthenics: {
    id: "calisthenics", label: "Calisthenics", icon: "🤸",
    domain: "body", group: "body",
    relatedPaths: ["fighter", "explorer"],
    relatedStats: ["STR", "AGI"],
    tags: ["training", "koerpergewicht", "kraft", "beweglichkeit"],
    questTopic: "Calisthenics",
  },
  kampfsport: {
    id: "kampfsport", label: "Kampfsport", icon: "🥊",
    domain: "body", group: "body",
    relatedPaths: ["fighter"],
    relatedStats: ["STR", "AGI", "END"],
    tags: ["training", "kampf", "disziplin", "ausdauer"],
    questTopic: "Kampfsport",
  },
  schwimmen: {
    id: "schwimmen", label: "Schwimmen", icon: "🏊",
    domain: "body", group: "body",
    relatedPaths: ["runner", "fighter"],
    relatedStats: ["AGI", "VIT", "END"],
    tags: ["ausdauer", "training", "wasser", "cardio"],
    questTopic: "Schwimmen",
  },
  radfahren: {
    id: "radfahren", label: "Radfahren", icon: "🚴",
    domain: "body", group: "body",
    relatedPaths: ["runner", "explorer"],
    relatedStats: ["AGI", "VIT"],
    tags: ["cardio", "ausdauer", "outdoor", "transport"],
    questTopic: "Radfahren",
  },
  mobility_routine: {
    id: "mobility_routine", label: "Mobility Routine", icon: "🧘",
    domain: "body", group: "body",
    relatedPaths: ["monk", "fighter"],
    relatedStats: ["AGI", "VIT"],
    tags: ["mobility", "dehnen", "gelenkpflege", "prävention"],
    questTopic: "Mobility",
  },
  meal_prep: {
    id: "meal_prep", label: "Meal Prep", icon: "🥗",
    domain: "body", group: "body",
    relatedPaths: ["guardian", "monk"],
    relatedStats: ["VIT", "END"],
    tags: ["ernährung", "kochen", "vorbereitung", "gesundheit"],
    questTopic: "Meal Prep",
  },

  // ════════════════════════════════════════════════════════
  // CRAFT / PROJECTS — Ergänzungen Prompt 4
  // ════════════════════════════════════════════════════════
  arduino: {
    id: "arduino", label: "Arduino", icon: "🔌",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer"],
    relatedStats: ["INT", "CRA"],
    tags: ["elektronik", "hardware", "prototyp", "coding"],
    questTopic: "Arduino",
  },
  raspberry_pi: {
    id: "raspberry_pi", label: "Raspberry Pi", icon: "🖥️",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer"],
    relatedStats: ["INT", "CRA"],
    tags: ["hardware", "linux", "projekt", "coding"],
    questTopic: "Raspberry Pi",
  },
  webentwicklung: {
    id: "webentwicklung", label: "Webentwicklung", icon: "🌐",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer", "creator"],
    relatedStats: ["INT", "CRA"],
    tags: ["coding", "frontend", "backend", "web"],
    questTopic: "Webentwicklung",
  },
  app_entwicklung: {
    id: "app_entwicklung", label: "App-Entwicklung", icon: "📱",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer", "creator"],
    relatedStats: ["INT", "CRA"],
    tags: ["coding", "mobile", "produkt", "software"],
    questTopic: "App-Entwicklung",
  },
  datenanalyse: {
    id: "datenanalyse", label: "Datenanalyse", icon: "📉",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer", "scholar", "strategist"],
    relatedStats: ["INT"],
    tags: ["data", "python", "excel", "statistik"],
    questTopic: "Datenanalyse",
  },
  automatisierung: {
    id: "automatisierung", label: "Automatisierung", icon: "⚙️",
    domain: "craft", group: "tech",
    relatedPaths: ["engineer", "strategist"],
    relatedStats: ["INT", "CRA"],
    tags: ["scripts", "effizienz", "tools", "workflow"],
    questTopic: "Automatisierung",
  },
  produktivitaetssysteme: {
    id: "produktivitaetssysteme", label: "Produktivitätssysteme", icon: "📋",
    domain: "craft", group: "tech",
    relatedPaths: ["strategist", "guardian"],
    relatedStats: ["END", "INT"],
    tags: ["produktivität", "organisation", "workflow", "systeme"],
    questTopic: "Produktivitätssystem",
  },

  // ════════════════════════════════════════════════════════
  // CREATIVITY — Ergänzungen Prompt 4
  // ════════════════════════════════════════════════════════
  kreatives_schreiben: {
    id: "kreatives_schreiben", label: "Kreatives Schreiben", icon: "✍️",
    domain: "creativity", group: "creative",
    relatedPaths: ["artisan", "creator"],
    relatedStats: ["CRE", "INT"],
    tags: ["schreiben", "kreativität", "storytelling", "texte"],
    questTopic: "Kreatives Schreiben",
  },
  beatmaking: {
    id: "beatmaking", label: "Beatmaking", icon: "🎹",
    domain: "creativity", group: "creative",
    relatedPaths: ["artisan", "creator"],
    relatedStats: ["CRE"],
    tags: ["musik", "produktion", "beats", "audio"],
    questTopic: "Beatmaking",
  },
  podcast: {
    id: "podcast", label: "Podcast", icon: "🎙️",
    domain: "creativity", group: "creative",
    relatedPaths: ["creator", "charmer"],
    relatedStats: ["CRE", "CHA"],
    tags: ["audio", "content", "kommunikation", "medium"],
    questTopic: "Podcast",
  },
  game_design: {
    id: "game_design", label: "Game Design", icon: "🎮",
    domain: "creativity", group: "creative",
    relatedPaths: ["artisan", "engineer"],
    relatedStats: ["CRE", "INT"],
    tags: ["games", "design", "storytelling", "mechanics"],
    questTopic: "Game Design",
  },
  dreiddruck: {
    id: "dreiddruck", label: "3D Design", icon: "🧱",
    domain: "creativity", group: "creative",
    relatedPaths: ["artisan", "engineer"],
    relatedStats: ["CRE", "CRA"],
    tags: ["3d", "design", "modellierung", "druck"],
    questTopic: "3D Design",
  },
  portfolio: {
    id: "portfolio", label: "Portfolio aufbauen", icon: "🗂️",
    domain: "creativity", group: "creative",
    relatedPaths: ["creator", "artisan", "merchant"],
    relatedStats: ["CRE"],
    tags: ["portfolio", "karriere", "zeigen", "profil"],
    questTopic: "Portfolio",
  },

  // ════════════════════════════════════════════════════════
  // SOCIAL / APPEARANCE — Ergänzungen Prompt 4
  // ════════════════════════════════════════════════════════
  praesentationen: {
    id: "praesentationen", label: "Präsentationen", icon: "🖥️",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "strategist"],
    relatedStats: ["CHA", "INT"],
    tags: ["vortrag", "kommunikation", "visualisierung", "überzeugung"],
    questTopic: "Präsentation",
  },
  networking: {
    id: "networking", label: "Networking", icon: "🤝",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "merchant"],
    relatedStats: ["CHA", "SOC"],
    tags: ["kontakte", "karriere", "netzwerk", "beziehungen"],
    questTopic: "Networking",
  },
  konfliktloesung: {
    id: "konfliktloesung", label: "Konfliktlösung", icon: "🕊️",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "strategist"],
    relatedStats: ["CHA", "SOC"],
    tags: ["kommunikation", "empathie", "konflikt", "lösung"],
    questTopic: "Konfliktlösung",
  },
  koerpersprache: {
    id: "koerpersprache", label: "Körpersprache", icon: "🧍",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "fighter"],
    relatedStats: ["CHA", "APP"],
    tags: ["kommunikation", "ausdruck", "präsenz", "wirkung"],
    questTopic: "Körpersprache",
  },
  grooming: {
    id: "grooming", label: "Grooming & Pflege", icon: "🪮",
    domain: "appearance", group: "social",
    relatedPaths: ["charmer"],
    relatedStats: ["APP"],
    tags: ["pflege", "style", "erscheinung", "selbstfürsorge"],
    questTopic: "Grooming",
  },
  profilfoto: {
    id: "profilfoto", label: "Fotografie (Portrait)", icon: "📸",
    domain: "social", group: "social",
    relatedPaths: ["charmer", "creator"],
    relatedStats: ["APP", "CRE"],
    tags: ["foto", "profil", "bild", "selbstdarstellung"],
    questTopic: "Portrait-Fotografie",
  },

  // ════════════════════════════════════════════════════════
  // CAREER / FINANCE / LIFE — Ergänzungen Prompt 4
  // ════════════════════════════════════════════════════════
  nebenprojekt: {
    id: "nebenprojekt", label: "Nebenprojekt", icon: "🚀",
    domain: "career", group: "career",
    relatedPaths: ["merchant", "creator", "engineer"],
    relatedStats: ["CRA", "INT"],
    tags: ["side-project", "startup", "eigenes", "business"],
    questTopic: "Nebenprojekt",
  },
  bewerbung: {
    id: "bewerbung", label: "Bewerbung", icon: "📄",
    domain: "career", group: "career",
    relatedPaths: ["merchant", "strategist"],
    relatedStats: ["INT"],
    tags: ["job", "karriere", "bewerbung", "anschreiben"],
    questTopic: "Bewerbung",
  },
  lebenslauf: {
    id: "lebenslauf", label: "Lebenslauf", icon: "📋",
    domain: "career", group: "career",
    relatedPaths: ["merchant", "guardian"],
    relatedStats: ["INT"],
    tags: ["cv", "job", "karriere", "profil"],
    questTopic: "Lebenslauf",
  },
  investieren: {
    id: "investieren", label: "Investieren", icon: "💹",
    domain: "finance", group: "career",
    relatedPaths: ["merchant", "strategist"],
    relatedStats: ["INT"],
    tags: ["geld", "finanzen", "etf", "aktien", "vermögen"],
    questTopic: "Investieren",
  },
  sparen: {
    id: "sparen", label: "Sparen & Budget", icon: "🏦",
    domain: "finance", group: "career",
    relatedPaths: ["merchant", "guardian"],
    relatedStats: ["INT", "END"],
    tags: ["budget", "geld", "haushalt", "planung"],
    questTopic: "Budget",
  },
  buerokratie: {
    id: "buerokratie", label: "Bürokratie & Docs", icon: "📑",
    domain: "home", group: "career",
    relatedPaths: ["guardian", "strategist"],
    relatedStats: ["END"],
    tags: ["formulare", "dokumente", "organisation", "amtlich"],
    questTopic: "Bürokratie",
  },
  versicherungen: {
    id: "versicherungen", label: "Versicherungen", icon: "🛡️",
    domain: "finance", group: "career",
    relatedPaths: ["merchant", "guardian"],
    relatedStats: ["INT", "END"],
    tags: ["sicherheit", "finanzen", "absicherung", "verträge"],
    questTopic: "Versicherungen",
  },
};

export const INTEREST_LIST = Object.values(INTERESTS);

// ── Interessen nach Gruppen ───────────────────────────────

export const INTEREST_GROUPS = {
  mind:        { label: "🧠 Lernen & Wissen",       ids: ["physik","mathe","chemie","biologie","informatik","programmieren","sprachen","lesen","schreiben","geschichte","philosophie","deepwork","pruefungsvorbereitung","statistik","maschinelles_lernen","wirtschaft","psychologie","rhetorik","gedaechtnistraining"] },
  tech:        { label: "🔧 Technik & Projekte",     ids: ["elektronik","robotik","3ddruck","reparieren","projektmanagement","dokumentation","arduino","raspberry_pi","webentwicklung","app_entwicklung","datenanalyse","automatisierung","produktivitaetssysteme"] },
  body:        { label: "💪 Körper & Fitness",       ids: ["krafttraining","laufen","ausdauer","mobility","ernaehrung","schlaf","sport","yoga","calisthenics","kampfsport","schwimmen","radfahren","mobility_routine","meal_prep"] },
  craft:       { label: "🍳 Handwerk & Kochen",      ids: ["kochen","meal_prep"] },
  creative:    { label: "🎨 Kreativität",            ids: ["zeichnen","musik","design","fotografie","video","contentcreation","storytelling","kreatives_schreiben","beatmaking","podcast","game_design","dreiddruck","portfolio"] },
  social:      { label: "🤝 Social & Auftreten",     ids: ["socialskills","kommunikation","hautpflege","style","selbstbewusstsein","praesentieren","praesentationen","networking","konfliktloesung","koerpersprache","grooming","profilfoto"] },
  discipline:  { label: "🛡️ Disziplin & Alltag",    ids: ["routinen","ordnung","zeitmanagement","finanzen","karriere","journaling","produktivitaetssysteme"] },
  career:      { label: "💼 Karriere & Finanzen",    ids: ["nebenprojekt","bewerbung","lebenslauf","investieren","sparen","buerokratie","versicherungen","portfolio"] },
  recovery:    { label: "💚 Erholung & Achtsamkeit", ids: ["meditation","atemübungen","stressmanagement","natur"] },
  adventure:   { label: "🌍 Abenteuer & Wachstum",  ids: ["reisen","komfortzone","outdoor"] },
};

/**
 * Migriert alte Interest-Strings auf neue Interest-IDs.
 * Sicher für alte Preference-Arrays aus dem State.
 */
export const LEGACY_INTEREST_MAP = {
  // Alte IDs direkt → neue IDs
  "physik":        "physik",
  "elektronik":    "elektronik",
  "programmieren": "programmieren",
  "mathe":         "mathe",
  "fitness":       "krafttraining",
  "kochen":        "kochen",
  "zeichnen":      "zeichnen",
  "musik":         "musik",
  "social":        "socialskills",
  "aussehen":      "hautpflege",
  "schlaf":        "schlaf",
  "ernaehrung":    "ernaehrung",
  "ordnung":       "ordnung",
  // Neue Interessen v4
  "statistik":             "statistik",
  "maschinelles_lernen":   "maschinelles_lernen",
  "wirtschaft":            "wirtschaft",
  "psychologie":           "psychologie",
  "rhetorik":              "rhetorik",
  "calisthenics":          "calisthenics",
  "kampfsport":            "kampfsport",
  "schwimmen":             "schwimmen",
  "radfahren":             "radfahren",
  "meal_prep":             "meal_prep",
  "arduino":               "arduino",
  "raspberry_pi":          "raspberry_pi",
  "webentwicklung":        "webentwicklung",
  "app_entwicklung":       "app_entwicklung",
  "datenanalyse":          "datenanalyse",
  "automatisierung":       "automatisierung",
  "beatmaking":            "beatmaking",
  "podcast":               "podcast",
  "game_design":           "game_design",
  "networking":            "networking",
  "konfliktloesung":       "konfliktloesung",
  "nebenprojekt":          "nebenprojekt",
  "investieren":           "investieren",
  "sparen":                "sparen",
  "mobility":      "mobility",
};

/**
 * Normalisiert ein altes Interest-Array auf neue IDs.
 */
export function normalizeInterests(interests = []) {
  return interests.map(id => LEGACY_INTEREST_MAP[id] || id)
    .filter(id => INTERESTS[id] != null);
}

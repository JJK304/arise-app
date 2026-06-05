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
};

export const INTEREST_LIST = Object.values(INTERESTS);

// ── Interessen nach Gruppen ───────────────────────────────

export const INTEREST_GROUPS = {
  mind:        { label: "🧠 Lernen & Wissen",       ids: ["physik","mathe","chemie","biologie","informatik","programmieren","sprachen","lesen","schreiben","geschichte","philosophie","deepwork","pruefungsvorbereitung"] },
  tech:        { label: "🔧 Technik & Projekte",     ids: ["elektronik","robotik","3ddruck","reparieren","projektmanagement","dokumentation"] },
  body:        { label: "💪 Körper & Fitness",       ids: ["krafttraining","laufen","ausdauer","mobility","ernaehrung","schlaf","sport","yoga"] },
  craft:       { label: "🍳 Handwerk & Kochen",      ids: ["kochen"] },
  creative:    { label: "🎨 Kreativität",            ids: ["zeichnen","musik","design","fotografie","video","contentcreation","storytelling"] },
  social:      { label: "🤝 Social & Auftreten",     ids: ["socialskills","kommunikation","hautpflege","style","selbstbewusstsein","praesentieren"] },
  discipline:  { label: "🛡️ Disziplin & Alltag",    ids: ["routinen","ordnung","zeitmanagement","finanzen","karriere","journaling"] },
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
  "mobility":      "mobility",
};

/**
 * Normalisiert ein altes Interest-Array auf neue IDs.
 */
export function normalizeInterests(interests = []) {
  return interests.map(id => LEGACY_INTEREST_MAP[id] || id)
    .filter(id => INTERESTS[id] != null);
}

// ============================================================
// PREFERENCES CONFIGURATION
// Alle auswählbaren Optionen für das Preferences-System.
// Interests: nun in interests.js als strukturierte Datenbank.
// Paths: alle 12 wählbaren Pfade (Shadow nicht wählbar).
// ============================================================

// Quest-Längen
export const QUEST_LENGTH_OPTIONS = [
  { id: "short",  label: "Kurz",   desc: "5–15 Min · weniger XP",  icon: "⚡" },
  { id: "medium", label: "Mittel", desc: "20–45 Min · normale XP", icon: "◈" },
  { id: "long",   label: "Lang",   desc: "60+ Min · mehr XP",      icon: "◉" },
];

// Alle wählbaren Pfade (Shadow ausgenommen)
export const ACTIVE_PATHS_OPTIONS = [
  { id: "fighter",    label: "Fighter",    icon: "⚔️",  color: "#ef4444" },
  { id: "runner",     label: "Runner",     icon: "⚡",  color: "#f59e0b" },
  { id: "scholar",    label: "Scholar",    icon: "🧠",  color: "#3b82f6" },
  { id: "engineer",   label: "Engineer",   icon: "🔧",  color: "#f97316" },
  { id: "artisan",    label: "Artisan",    icon: "🎨",  color: "#a78bfa" },
  { id: "charmer",    label: "Charmer",    icon: "👑",  color: "#ec4899" },
  { id: "strategist", label: "Strategist", icon: "♟️",  color: "#0ea5e9" },
  { id: "guardian",   label: "Guardian",   icon: "🏠",  color: "#84cc16" },
  { id: "merchant",   label: "Merchant",   icon: "💰",  color: "#22c55e" },
  { id: "creator",    label: "Creator",    icon: "🎬",  color: "#e879f9" },
  { id: "monk",       label: "Monk",       icon: "🧘",  color: "#10b981" },
  { id: "explorer",   label: "Explorer",   icon: "🌍",  color: "#f59e0b" },
];

// Balance-Bereiche
export const BALANCE_AREAS_OPTIONS = [
  { id: "schlaf",      label: "Schlaf",       icon: "😴" },
  { id: "ernaehrung",  label: "Ernährung",    icon: "🥗" },
  { id: "recovery",    label: "Recovery",     icon: "🔄" },
  { id: "social",      label: "Social",       icon: "🤝" },
  { id: "ordnung",     label: "Ordnung",      icon: "📦" },
  { id: "mobility",    label: "Mobility",     icon: "🧘" },
  { id: "finanzen",    label: "Finanzen",     icon: "💰" },
  { id: "kreativität", label: "Kreativität",  icon: "🎨" },
];

// Schwierigkeits-Optionen
export const DIFFICULTY_OPTIONS = [
  { id: "easy",   label: "Leicht",  desc: "Weniger Anforderung, einfacherer Einstieg", icon: "🌱" },
  { id: "normal", label: "Normal",  desc: "Standard-Balance",                          icon: "⚖️" },
  { id: "hard",   label: "Schwer",  desc: "Höhere Anforderungen, mehr XP",             icon: "🔥" },
];

// Legacy: INTERESTS_OPTIONS bleibt als flat-Array für Backward-Compat in App.jsx
// Wird in Prompt 4 durch das strukturierte System aus interests.js ersetzt.
export const INTERESTS_OPTIONS = [
  { id: "physik",          label: "Physik",          icon: "⚛️",  group: "mind"       },
  { id: "mathe",           label: "Mathe",            icon: "📐",  group: "mind"       },
  { id: "informatik",      label: "Informatik",       icon: "💡",  group: "mind"       },
  { id: "programmieren",   label: "Programmieren",    icon: "💻",  group: "tech"       },
  { id: "elektronik",      label: "Elektronik",       icon: "🔌",  group: "tech"       },
  { id: "robotik",         label: "Robotik",          icon: "🤖",  group: "tech"       },
  { id: "krafttraining",   label: "Krafttraining",    icon: "🏋️", group: "body"       },
  { id: "laufen",          label: "Laufen",           icon: "🏃",  group: "body"       },
  { id: "mobility",        label: "Mobility",         icon: "🧘",  group: "body"       },
  { id: "ernaehrung",      label: "Ernährung",        icon: "🥗",  group: "body"       },
  { id: "schlaf",          label: "Schlaf",           icon: "😴",  group: "recovery"   },
  { id: "kochen",          label: "Kochen",           icon: "🍳",  group: "craft"      },
  { id: "zeichnen",        label: "Zeichnen",         icon: "🎨",  group: "creative"   },
  { id: "musik",           label: "Musik",            icon: "🎵",  group: "creative"   },
  { id: "design",          label: "Design",           icon: "✏️",  group: "creative"   },
  { id: "fotografie",      label: "Fotografie",       icon: "📷",  group: "creative"   },
  { id: "contentcreation", label: "Content Creation", icon: "📱",  group: "creative"   },
  { id: "socialskills",    label: "Social Skills",    icon: "🤝",  group: "social"     },
  { id: "kommunikation",   label: "Kommunikation",    icon: "💬",  group: "social"     },
  { id: "hautpflege",      label: "Hautpflege",       icon: "✨",  group: "social"     },
  { id: "style",           label: "Style",            icon: "👔",  group: "social"     },
  { id: "zeitmanagement",  label: "Zeitmanagement",   icon: "⏰",  group: "discipline" },
  { id: "ordnung",         label: "Ordnung",          icon: "📦",  group: "discipline" },
  { id: "journaling",      label: "Journaling",       icon: "📓",  group: "discipline" },
  { id: "finanzen",        label: "Finanzen",         icon: "💰",  group: "discipline" },
  { id: "karriere",        label: "Karriere",         icon: "📈",  group: "discipline" },
  { id: "meditation",      label: "Meditation",       icon: "🧘",  group: "recovery"   },
  { id: "stressmanagement",label: "Stressmanagement", icon: "🌊",  group: "recovery"   },
  { id: "natur",           label: "Natur",            icon: "🌲",  group: "recovery"   },
  { id: "reisen",          label: "Reisen",           icon: "✈️",  group: "adventure"  },
  { id: "outdoor",         label: "Outdoor",          icon: "🏔️", group: "adventure"  },
  { id: "komfortzone",     label: "Komfortzone",      icon: "🚀",  group: "adventure"  },
  { id: "sprachen",        label: "Sprachen",         icon: "🌐",  group: "mind"       },
  { id: "lesen",           label: "Lesen",            icon: "📚",  group: "mind"       },
  { id: "philosophie",     label: "Philosophie",      icon: "🤔",  group: "mind"       },
  { id: "deepwork",        label: "Deep Work",        icon: "🎯",  group: "discipline" },
];

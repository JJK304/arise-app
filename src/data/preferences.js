// ============================================================
// PREFERENCES CONFIGURATION
// Nur noch UI-Optionen (Quest-Länge, Pfade, Balance, Schwierigkeit).
// Interessen sind AUSSCHLIESSLICH in interests.js:
//   INTERESTS · INTEREST_LIST · INTEREST_GROUPS · normalizeInterests
// preferences.js ist KEINE Interest-Quelle mehr.
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

// ============================================================
// DOMAINS — Breite Lebensbereiche
// Jede Quest, jedes Gate und jedes Goal ist einer Domain zugeordnet.
// Domains sind breiter als die alten cat-Keys (strength, uni, ...).
// Migration: alte cat-Keys werden in questNormalizer.js auf domains gemappt.
// ============================================================

export const DOMAINS = {
  body: {
    id:    "body",
    label: "Körper",
    icon:  "💪",
    color: "#ef4444",
    desc:  "Training, Kraft, Ausdauer, Körperzusammensetzung",
  },
  mind: {
    id:    "mind",
    label: "Geist",
    icon:  "🧠",
    color: "#3b82f6",
    desc:  "Lernen, Studium, Wissen, Deep Work, Wissenschaft",
  },
  craft: {
    id:    "craft",
    label: "Handwerk",
    icon:  "🔧",
    color: "#f97316",
    desc:  "Technik, Projekte, Elektronik, Programmieren, Bauen",
  },
  creativity: {
    id:    "creativity",
    label: "Kreativität",
    icon:  "🎨",
    color: "#a78bfa",
    desc:  "Kunst, Musik, Design, Zeichnen, Content Creation",
  },
  social: {
    id:    "social",
    label: "Soziales",
    icon:  "🤝",
    color: "#06b6d4",
    desc:  "Beziehungen, Kommunikation, Networking, Freundschaft",
  },
  appearance: {
    id:    "appearance",
    label: "Aussehen",
    icon:  "✨",
    color: "#ec4899",
    desc:  "Style, Pflege, Auftreten, Kleidung, Selbstbewusstsein",
  },
  discipline: {
    id:    "discipline",
    label: "Disziplin",
    icon:  "🛡️",
    color: "#64748b",
    desc:  "Routinen, Zeitmanagement, Planung, Willenskraft",
  },
  career: {
    id:    "career",
    label: "Karriere",
    icon:  "📈",
    color: "#0ea5e9",
    desc:  "Beruf, Bewerbung, Skills, Networking, Wachstum",
  },
  finance: {
    id:    "finance",
    label: "Finanzen",
    icon:  "💰",
    color: "#22c55e",
    desc:  "Budget, Sparen, Investieren, Finanzplanung",
  },
  home: {
    id:    "home",
    label: "Zuhause",
    icon:  "🏠",
    color: "#84cc16",
    desc:  "Haushalt, Ordnung, Organisation, Wohnumfeld",
  },
  recovery: {
    id:    "recovery",
    label: "Erholung",
    icon:  "💚",
    color: "#10b981",
    desc:  "Schlaf, Stressmanagement, Meditation, Regeneration",
  },
  adventure: {
    id:    "adventure",
    label: "Abenteuer",
    icon:  "🌍",
    color: "#f59e0b",
    desc:  "Reisen, neue Orte, Komfortzone, Outdoor, Natur",
  },
};

export const DOMAIN_LIST = Object.values(DOMAINS);

// ── Migration: alte cat-Strings → neue Domain-IDs ──
export const CAT_TO_DOMAIN = {
  // body
  strength:        "body",
  cardio:          "body",
  health:          "recovery",
  // mind
  uni:             "mind",
  skill_tech:      "craft",
  // craft
  skill_practical: "craft",
  // creativity
  skill_creative:  "creativity",
  // social / appearance
  social:          "social",
  appearance:      "appearance",
  // discipline
  discipline:      "discipline",
  // legacy → adventure (nur SSS-Rank Inhalte)
  legacy:          "adventure",
};

/**
 * Normalisiert einen alten cat-String auf eine Domain-ID.
 * Gibt den Originalwert zurück wenn kein Mapping gefunden.
 */
export function catToDomain(cat) {
  if (!cat) return null;
  return CAT_TO_DOMAIN[cat] || cat;
}

// ============================================================
// PATH SYSTEM — alle 13 Pfade (inkl. Shadow als Sonderklasse)
// Domains: body | mind | craft | creativity | social |
//          appearance | discipline | career | finance |
//          home | recovery | adventure
// ============================================================

export const PATHS = {
  // ── Existierende Pfade (erweitert) ──────────────────────
  fighter: {
    id:      "fighter",
    name:    "Fighter",
    icon:    "⚔️",
    color:   "#ef4444",
    focus:   "Kraft, Körper, Disziplin",
    domains: ["body", "discipline"],
    stats:   ["STR", "VIT", "END"],
    cats:    ["strength", "discipline"],
    desc:    "Du formst deinen Körper zur Waffe. Stärke, Ausdauer und eiserne Disziplin.",
  },
  runner: {
    id:      "runner",
    name:    "Runner",
    icon:    "⚡",
    color:   "#f59e0b",
    focus:   "Ausdauer, Beweglichkeit, Schnelligkeit",
    domains: ["body", "recovery"],
    stats:   ["AGI", "END", "VIT"],
    cats:    ["cardio"],
    desc:    "Bewegung ist deine Meditation. Grenzen verschieben sich mit jedem Schritt.",
  },
  scholar: {
    id:      "scholar",
    name:    "Scholar",
    icon:    "🧠",
    color:   "#3b82f6",
    focus:   "Lernen, Wissen, Theorie, Verständnis",
    domains: ["mind", "career"],
    stats:   ["INT"],
    cats:    ["uni", "skill_tech"],
    desc:    "Wissen ist deine Rüstung. Du verstehst, was andere nur auswendig lernen.",
  },
  engineer: {
    id:      "engineer",
    name:    "Engineer",
    icon:    "🔧",
    color:   "#f97316",
    focus:   "Technik, Systeme, Problemlösung, Projekte",
    domains: ["craft", "mind", "career"],
    stats:   ["INT", "CRA"],
    cats:    ["skill_tech", "skill_practical"],
    desc:    "Du baust was andere nur denken. Systeme, Code, Schaltungen — alles greifbar.",
  },
  artisan: {
    id:      "artisan",
    name:    "Artisan",
    icon:    "🎨",
    color:   "#a78bfa",
    focus:   "Kreativität, Kochen, Zeichnen, Musik, Handwerk",
    domains: ["creativity", "craft"],
    stats:   ["CRE", "CRA"],
    cats:    ["skill_creative", "skill_practical"],
    desc:    "Du erschaffst mit deinen Händen. Jedes Werk trägt deinen Geist.",
  },
  charmer: {
    id:      "charmer",
    name:    "Charmer",
    icon:    "👑",
    color:   "#ec4899",
    focus:   "Social Skills, Auftreten, Aussehen, Präsenz",
    domains: ["social", "appearance"],
    stats:   ["CHA", "SOC", "APP"],
    cats:    ["social", "appearance"],
    desc:    "Menschen folgen dir, weil du weißt wer du bist. Auftreten ist eine Kunst.",
  },

  // ── Neue Pfade ───────────────────────────────────────────
  strategist: {
    id:      "strategist",
    name:    "Strategist",
    icon:    "♟️",
    color:   "#0ea5e9",
    focus:   "Planung, Zeitmanagement, Ziele, Systeme",
    domains: ["discipline", "career", "mind"],
    stats:   ["INT", "END"],
    cats:    ["discipline", "uni"],
    desc:    "Du siehst das große Bild. Systeme, Pläne und Priorisierung sind deine Waffe.",
  },
  guardian: {
    id:      "guardian",
    name:    "Guardian",
    icon:    "🏠",
    color:   "#84cc16",
    focus:   "Haushalt, Ordnung, Verantwortung, Stabilität",
    domains: ["home", "discipline", "recovery"],
    stats:   ["END", "VIT"],
    cats:    ["discipline", "health"],
    desc:    "Stabilität ist deine Stärke. Du baust die Struktur auf der alles andere steht.",
  },
  merchant: {
    id:      "merchant",
    name:    "Merchant",
    icon:    "💰",
    color:   "#22c55e",
    focus:   "Finanzen, Business, Verhandeln, Karriere",
    domains: ["finance", "career", "social"],
    stats:   ["INT", "CHA"],
    cats:    ["discipline", "social"],
    desc:    "Ressourcen, Netzwerke, Chancen — du weißt wie das Spiel gespielt wird.",
  },
  creator: {
    id:      "creator",
    name:    "Creator",
    icon:    "🎬",
    color:   "#e879f9",
    focus:   "Content, Design, Video, Storytelling, Marke",
    domains: ["creativity", "social", "career"],
    stats:   ["CRE", "CHA"],
    cats:    ["skill_creative", "social"],
    desc:    "Deine Stimme ist dein Werkzeug. Du baust Welten aus Ideen und Bildern.",
  },
  monk: {
    id:      "monk",
    name:    "Monk",
    icon:    "🧘",
    color:   "#10b981",
    focus:   "Achtsamkeit, Ruhe, Reflexion, Selbstkontrolle",
    domains: ["recovery", "discipline", "mind"],
    stats:   ["VIT", "END"],
    cats:    ["health", "discipline"],
    desc:    "Klarheit entsteht in der Stille. Du beherrschst dich selbst — das ist die höchste Stärke.",
  },
  explorer: {
    id:      "explorer",
    name:    "Explorer",
    icon:    "🌍",
    color:   "#f59e0b",
    focus:   "Reisen, neue Orte, Komfortzone, Outdoor, Abenteuer",
    domains: ["adventure", "social", "body"],
    stats:   ["AGI", "CHA"],
    cats:    ["cardio", "social"],
    desc:    "Die Welt ist deine Lehrerin. Jede neue Erfahrung macht dich größer.",
  },

  leader: {
    id:      "leader",
    name:    "Leader",
    icon:    "🦁",
    color:   "#d97706",
    focus:   "Führung, Entscheidungen, Verantwortung, Einfluss",
    domains: ["social", "career", "discipline"],
    stats:   ["CHA", "END", "SOC"],
    cats:    ["social", "discipline"],
    desc:    "Du führst nicht durch Macht, sondern durch Beispiel. Andere wachsen in deiner Nähe.",
  },
  healer: {
    id:      "healer",
    name:    "Healer",
    icon:    "💚",
    color:   "#34d399",
    focus:   "Unterstützung, Empathie, mentale Gesundheit, Regeneration",
    domains: ["recovery", "social", "home"],
    stats:   ["VIT", "CHA", "SOC"],
    cats:    ["health", "social"],
    desc:    "Du regenerierst dich und andere. Stabilität, Fürsorge und emotionale Stärke sind deine Gaben.",
  },

  // ── Shadow: Sonderklasse — nicht als Startklasse wählbar ─
  shadow: {
    id:              "shadow",
    name:            "Shadow Monarch",
    icon:            "🌑",
    color:           "#00ffff",
    focus:           "Allrounder — meistert alle Pfade",
    domains:         ["body","mind","craft","creativity","social","discipline","career","finance","home","recovery","adventure"],
    stats:           ["STR","AGI","INT","CRE","CRA","VIT","END","CHA"],
    cats:            [],
    desc:            "Du bist nicht spezialisiert — du bist vollständig. Der Pfad der Meister.",
    unlockCondition: "3+ Pfade mit hoher Affinity · 3+ Gates · 2+ Goals · Rank A+",
    special:         true,
  },
};

export const PATH_LIST = Object.values(PATHS);

/** Alle wählbaren (nicht-Special) Pfade */
export const SELECTABLE_PATHS = PATH_LIST.filter(p => !p.special);

// ── Affinity-Gain ─────────────────────────────────────────

/**
 * Gibt zurück wie viel Affinity eine Quest für jeden Pfad gibt.
 * Nutzt sowohl domain (neu) als auch cat (Legacy) für Matching.
 * Rückgabe: { pathId: points, ... }
 */
export function getAffinityGain(challenge) {
  const gains = {};
  if (!challenge) return gains;

  const domain = challenge.domain || null;
  const cat    = challenge.cat    || null;

  for (const [id, path] of Object.entries(PATHS)) {
    if (path.special) continue;

    // Match über domain (neu) oder cat (legacy)
    const domainMatch = domain && path.domains?.includes(domain);
    const catMatch    = cat    && path.cats?.includes(cat);

    if (domainMatch || catMatch) {
      const base = challenge.type === "milestone" ? 5
                 : challenge.type === "weekly"    ? 2
                 : 1;
      gains[id] = base;
    }
  }
  return gains;
}

// ── Shadow Unlock ─────────────────────────────────────────

/**
 * Prüft ob Shadow Monarch freigeschaltet werden kann.
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

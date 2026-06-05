// ============================================================
// ROLE / PATH SYSTEM
// ============================================================

export const PATHS = {
  fighter: {
    id:       "fighter",
    name:     "Fighter",
    icon:     "⚔️",
    color:    "#ef4444",
    focus:    "Kraft, Körper, Disziplin",
    stats:    ["STR", "VIT", "END"],
    // Quest-Kategorien die Affinity erhöhen
    cats:     ["strength", "discipline"],
  },
  runner: {
    id:       "runner",
    name:     "Runner",
    icon:     "⚡",
    color:    "#f59e0b",
    focus:    "Ausdauer, Beweglichkeit, Schnelligkeit",
    stats:    ["AGI", "END", "VIT"],
    cats:     ["cardio"],
  },
  scholar: {
    id:       "scholar",
    name:     "Scholar",
    icon:     "🧠",
    color:    "#3b82f6",
    focus:    "Lernen, Theorie, Physik, Mathe",
    stats:    ["INT"],
    cats:     ["uni", "skill_tech"],
  },
  engineer: {
    id:       "engineer",
    name:     "Engineer",
    icon:     "🔧",
    color:    "#f97316",
    focus:    "Elektronik, Programmieren, Projekte",
    stats:    ["INT", "CRA"],
    cats:     ["skill_tech", "skill_practical"],
  },
  artisan: {
    id:       "artisan",
    name:     "Artisan",
    icon:     "🎨",
    color:    "#a78bfa",
    focus:    "Kreativität, Kochen, Zeichnen, Musik, Handwerk",
    stats:    ["CRE", "CRA"],
    cats:     ["skill_creative", "skill_practical"],
  },
  charmer: {
    id:       "charmer",
    name:     "Charmer",
    icon:     "👑",
    color:    "#ec4899",
    focus:    "Social Skills, Auftreten, Aussehen",
    stats:    ["CHA", "SOC", "APP"],
    cats:     ["social", "appearance"],
  },
  shadow: {
    id:             "shadow",
    name:           "Shadow Monarch",
    icon:           "🌑",
    color:          "#00ffff",
    focus:          "Allrounder — meistert alle Pfade",
    stats:          ["STR","AGI","INT","CRE","CRA","VIT","END","CHA"],
    cats:           [],
    unlockCondition: "Mehrere starke Pfade entwickelt",
    // Shadow wird nicht durch normale Quests, sondern durch
    // hohe Affinität auf mehreren Pfaden freigeschaltet
    special:        true,
  },
};

export const PATH_LIST = Object.values(PATHS);

/**
 * Gibt zurück wie viel Affinity eine Quest für einen Pfad gibt.
 * Rückgabe: { pathId: points, ... }
 */
export function getAffinityGain(challenge) {
  const gains = {};
  if (!challenge?.cat) return gains;

  for (const [id, path] of Object.entries(PATHS)) {
    if (path.special) continue; // Shadow nicht durch normale Quests
    if (path.cats.includes(challenge.cat)) {
      // Milestones geben mehr Affinity als Dailies
      const base = challenge.type === "milestone" ? 5
                 : challenge.type === "weekly"    ? 2
                 : 1;
      gains[id] = base;
    }
  }
  return gains;
}

/**
 * Prüft ob Shadow Monarch freigeschaltet werden kann:
 * Mindestens 3 Pfade müssen Affinity ≥ 20 haben.
 */
export function canUnlockShadow(affinities = {}) {
  const strong = Object.entries(affinities)
    .filter(([k, v]) => k !== "shadow" && v >= 20)
    .length;
  return strong >= 3;
}

/**
 * Gibt Pfad-Empfehlung basierend auf Affinitäten zurück.
 * Gibt null zurück wenn noch zu wenig Daten.
 */
export function suggestPaths(affinities = {}) {
  const entries = Object.entries(affinities)
    .filter(([k]) => k !== "shadow")
    .sort(([, a], [, b]) => b - a);

  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total < 3) return null; // Zu wenig Daten

  const [first, second] = entries;
  if (!first || first[1] === 0) return null;

  return {
    mainPath:      first[0],
    secondaryPath: second?.[1] > 0 ? second[0] : null,
  };
}

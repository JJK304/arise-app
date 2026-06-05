// ============================================================
// TITLE SYSTEM
// Titel werden einmalig vergeben, nie doppelt.
// Nutzer kann den aktiven Titel im Profil wählen.
// ============================================================

export const TITLES = [
  // ── Basis-Progression ──
  {
    id:    "deep_work_initiate",
    title: "Deep Work Initiate",
    desc:  "5 Mind-Quests abgeschlossen",
    icon:  "🧠",
    color: "#3b82f6",
  },
  {
    id:    "consistent_hunter",
    title: "Consistent Hunter",
    desc:  "7-Tage-Streak erreicht",
    icon:  "🔥",
    color: "#f59e0b",
  },
  {
    id:    "balance_restored",
    title: "Balance Restored",
    desc:  "5 Recovery-Quests abgeschlossen",
    icon:  "⚖️",
    color: "#22c55e",
  },
  {
    id:    "iron_discipline",
    title: "Iron Discipline",
    desc:  "30-Tage-Streak erreicht",
    icon:  "🛡️",
    color: "#64748b",
  },

  // ── Path-Titel (für 5+ Quests in einem Pfad) ──
  {
    id:    "apprentice_scholar",
    title: "Apprentice Scholar",
    desc:  "5 Scholar-Quests abgeschlossen",
    icon:  "📖",
    color: "#3b82f6",
  },
  {
    id:    "apprentice_engineer",
    title: "Apprentice Engineer",
    desc:  "5 Engineer-Quests abgeschlossen",
    icon:  "⚙️",
    color: "#f97316",
  },
  {
    id:    "apprentice_fighter",
    title: "Apprentice Fighter",
    desc:  "5 Fighter-Quests abgeschlossen",
    icon:  "⚔️",
    color: "#ef4444",
  },
  {
    id:    "apprentice_runner",
    title: "Apprentice Runner",
    desc:  "5 Runner-Quests abgeschlossen",
    icon:  "⚡",
    color: "#f59e0b",
  },
  {
    id:    "apprentice_artisan",
    title: "Apprentice Artisan",
    desc:  "5 Artisan-Quests abgeschlossen",
    icon:  "🎨",
    color: "#a78bfa",
  },
  {
    id:    "apprentice_charmer",
    title: "Apprentice Charmer",
    desc:  "5 Charmer-Quests abgeschlossen",
    icon:  "👑",
    color: "#ec4899",
  },

  // ── Meilenstein-Titel (Gate-Rewards bereits in gates.js) ──
  {
    id:    "theory_breaker",
    title: "Theory Breaker",
    desc:  "Scholar Gate II abgeschlossen",
    icon:  "💡",
    color: "#3b82f6",
  },
  {
    id:    "circuit_initiate",
    title: "Circuit Initiate",
    desc:  "Engineer Gate I abgeschlossen",
    icon:  "🔌",
    color: "#f97316",
  },
  {
    id:    "prototype_builder",
    title: "Prototype Builder",
    desc:  "Engineer Gate II abgeschlossen",
    icon:  "🔧",
    color: "#f97316",
  },
  {
    id:    "iron_will",
    title: "Iron Will",
    desc:  "Fighter Gate I abgeschlossen",
    icon:  "🔩",
    color: "#ef4444",
  },
  {
    id:    "first_mile",
    title: "First Mile",
    desc:  "Runner Gate I abgeschlossen",
    icon:  "🏅",
    color: "#f59e0b",
  },
  {
    id:    "creative_spark",
    title: "Creative Spark",
    desc:  "Artisan Gate I abgeschlossen",
    icon:  "✨",
    color: "#a78bfa",
  },
  {
    id:    "social_initiate",
    title: "Social Initiate",
    desc:  "Charmer Gate I abgeschlossen",
    icon:  "🌐",
    color: "#ec4899",
  },
];

// Domain → Pfad-Mapping für Titel-Check (wie in systemAnalysis)
const DOMAIN_TO_PATH = {
  strength: "fighter", discipline: "fighter",
  cardio: "runner",
  uni: "scholar", skill_tech: "engineer",
  skill_practical: "engineer",
  skill_creative: "artisan",
  social: "charmer", appearance: "charmer",
};

/**
 * Prüft welche Titel neu freigeschaltet werden.
 * Gibt Array neuer Titel-IDs zurück (noch nicht in player.titles).
 *
 * @param {object} state      - vollständiger App-State
 * @param {object[]} questHistory - state.questHistory
 * @returns {string[]}        - neu freigeschaltete Titel-IDs
 */
export function checkTitleUnlocks(state, questHistory = []) {
  const existingIds = (state.player?.titles || []).map(titleStr => {
    const found = TITLES.find(t => t.title === titleStr);
    return found ? found.id : titleStr; // fallback: raw string
  });
  const newTitles = [];

  const already = (id) => existingIds.includes(id) || newTitles.includes(id);
  const add      = (id) => { if (!already(id)) newTitles.push(id); };

  const streak = state.currentStreak || 0;
  const completedIds = state.completedChallenges || [];

  // ── Streak-Titel ──
  if (streak >= 7)  add("consistent_hunter");
  if (streak >= 30) add("iron_discipline");

  // ── Recovery-Titel: 5 Recovery-Quests abgeschlossen ──
  const recoveryDone = questHistory.filter(e => e.domain === "health" || e.domain === "discipline").length;
  if (recoveryDone >= 5) add("balance_restored");

  // ── Deep Work Initiate: 5 mind/tech Quests ──
  const mindDone = questHistory.filter(e => e.domain === "uni" || e.domain === "skill_tech").length;
  if (mindDone >= 5) add("deep_work_initiate");

  // ── Path-Apprentice-Titel: 5 Quests in einem Pfad ──
  const pathCounts = {};
  for (const entry of questHistory) {
    const pathId = entry.path || DOMAIN_TO_PATH[entry.domain];
    if (pathId) pathCounts[pathId] = (pathCounts[pathId] || 0) + 1;
  }
  if ((pathCounts.scholar  || 0) >= 5) add("apprentice_scholar");
  if ((pathCounts.engineer || 0) >= 5) add("apprentice_engineer");
  if ((pathCounts.fighter  || 0) >= 5) add("apprentice_fighter");
  if ((pathCounts.runner   || 0) >= 5) add("apprentice_runner");
  if ((pathCounts.artisan  || 0) >= 5) add("apprentice_artisan");
  if ((pathCounts.charmer  || 0) >= 5) add("apprentice_charmer");

  return newTitles;
}

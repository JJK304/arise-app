// ============================================================
// TITLE SYSTEM — Prompt 13
// Alle Titel an einem Ort. Intern: titleId (String).
// Gate-Reward-Titel matchen die `title`-Felder in gates.js.
// checkTitleUnlocks() prüft behaviour-basierte Unlocks.
// ============================================================

export const TITLES = [

  // ════════════════════════════════════════════════════════
  // BASIS-PROGRESSION (Streak, Recovery, Diversität)
  // ════════════════════════════════════════════════════════
  { id:"deep_work_initiate",    title:"Deep Work Initiate",    desc:"5 Lern-Quests abgeschlossen",         icon:"🧠", color:"#3b82f6",  category:"progression" },
  { id:"consistent_hunter",     title:"Consistent Hunter",     desc:"7-Tage-Streak erreicht",              icon:"🔥", color:"#f59e0b",  category:"progression" },
  { id:"iron_discipline",       title:"Iron Discipline",       desc:"30-Tage-Streak erreicht",             icon:"🛡️", color:"#64748b", category:"progression" },
  { id:"balance_restored",      title:"Balance Restored",      desc:"5 Recovery-Quests abgeschlossen",     icon:"⚖️", color:"#22c55e", category:"progression" },
  { id:"goal_breaker",          title:"Goal Breaker",          desc:"Erstes Ziel vollständig abgeschlossen", icon:"🎯", color:"#f59e0b", category:"progression" },
  { id:"chronicler",            title:"Chronicler",            desc:"10 Progress Logs gespeichert",        icon:"📓", color:"#8b5cf6",  category:"progression" },
  { id:"gatebreaker",           title:"Gatebreaker",           desc:"3 Gates abgeschlossen",               icon:"🔑", color:"#00ffff",  category:"progression" },
  { id:"shadow_candidate",      title:"Shadow Candidate",      desc:"Mehrere starke Pfade erkundet",        icon:"🌑", color:"#00ffff",  category:"special" },

  // ════════════════════════════════════════════════════════
  // PATH APPRENTICE (alle 12 Paths)
  // ════════════════════════════════════════════════════════
  { id:"apprentice_scholar",    title:"Apprentice Scholar",    desc:"5 Scholar-Quests abgeschlossen",      icon:"📖", color:"#3b82f6",  category:"path" },
  { id:"apprentice_engineer",   title:"Apprentice Engineer",   desc:"5 Engineer-Quests abgeschlossen",     icon:"⚙️", color:"#f97316",  category:"path" },
  { id:"apprentice_fighter",    title:"Apprentice Fighter",    desc:"5 Fighter-Quests abgeschlossen",      icon:"⚔️", color:"#ef4444",  category:"path" },
  { id:"apprentice_runner",     title:"Apprentice Runner",     desc:"5 Runner-Quests abgeschlossen",       icon:"⚡", color:"#f59e0b",  category:"path" },
  { id:"apprentice_artisan",    title:"Apprentice Artisan",    desc:"5 Artisan-Quests abgeschlossen",      icon:"🎨", color:"#a78bfa",  category:"path" },
  { id:"apprentice_charmer",    title:"Apprentice Charmer",    desc:"5 Charmer-Quests abgeschlossen",      icon:"👑", color:"#ec4899",  category:"path" },
  { id:"apprentice_strategist", title:"Apprentice Strategist", desc:"5 Strategist-Quests abgeschlossen",   icon:"♟️", color:"#0ea5e9",  category:"path" },
  { id:"apprentice_guardian",   title:"Apprentice Guardian",   desc:"5 Guardian-Quests abgeschlossen",     icon:"🏠", color:"#84cc16",  category:"path" },
  { id:"apprentice_merchant",   title:"Apprentice Merchant",   desc:"5 Merchant-Quests abgeschlossen",     icon:"💰", color:"#22c55e",  category:"path" },
  { id:"apprentice_creator",    title:"Apprentice Creator",    desc:"5 Creator-Quests abgeschlossen",      icon:"🎬", color:"#e879f9",  category:"path" },
  { id:"apprentice_monk",       title:"Apprentice Monk",       desc:"5 Monk-Quests abgeschlossen",         icon:"🧘", color:"#10b981",  category:"path" },
  { id:"apprentice_explorer",   title:"Apprentice Explorer",   desc:"5 Explorer-Quests abgeschlossen",     icon:"🌍", color:"#f59e0b",  category:"path" },

  // ════════════════════════════════════════════════════════
  // GATE TITLES — Scholar
  // ════════════════════════════════════════════════════════
  { id:"apprentice_scholar",    title:"Apprentice Scholar",    desc:"Scholar Gate I abgeschlossen",        icon:"📖", color:"#3b82f6",  category:"gate" },
  { id:"deep_thinker",          title:"Deep Thinker",          desc:"Scholar Gate II abgeschlossen",       icon:"💡", color:"#3b82f6",  category:"gate" },
  { id:"knowledge_sovereign",   title:"Knowledge Sovereign",   desc:"Scholar Gate III abgeschlossen",      icon:"📜", color:"#3b82f6",  category:"gate" },

  // Gate — Engineer
  { id:"circuit_initiate",      title:"Circuit Initiate",      desc:"Engineer Gate I abgeschlossen",       icon:"🔌", color:"#f97316",  category:"gate" },
  { id:"prototype_builder",     title:"Prototype Builder",     desc:"Engineer Gate II abgeschlossen",      icon:"🔧", color:"#f97316",  category:"gate" },
  { id:"system_architect",      title:"System Architect",      desc:"Engineer Gate III abgeschlossen",     icon:"🏗️", color:"#f97316",  category:"gate" },

  // Gate — Fighter
  { id:"iron_will",             title:"Iron Will",             desc:"Fighter Gate I abgeschlossen",        icon:"🔩", color:"#ef4444",  category:"gate" },
  { id:"strength_protocol",     title:"Strength Protocol",     desc:"Fighter Gate II abgeschlossen",       icon:"⚔️", color:"#ef4444",  category:"gate" },
  { id:"warrior_body",          title:"Body of the Warrior",   desc:"Fighter Gate III abgeschlossen",      icon:"🏆", color:"#ef4444",  category:"gate" },

  // Gate — Runner
  { id:"first_mile",            title:"First Mile",            desc:"Runner Gate I abgeschlossen",         icon:"🏅", color:"#f59e0b",  category:"gate" },
  { id:"endurance_block",       title:"Endurance Block",       desc:"Runner Gate II abgeschlossen",        icon:"🏃", color:"#f59e0b",  category:"gate" },
  { id:"long_run",              title:"The Long Run",          desc:"Runner Gate III abgeschlossen",       icon:"🌄", color:"#f59e0b",  category:"gate" },

  // Gate — Artisan
  { id:"creative_spark",        title:"Creative Spark",        desc:"Artisan Gate I abgeschlossen",        icon:"✨", color:"#a78bfa",  category:"gate" },
  { id:"craft_ritual",          title:"Craft Ritual",          desc:"Artisan Gate II abgeschlossen",       icon:"🎨", color:"#a78bfa",  category:"gate" },
  { id:"master_craft",          title:"Master of the Craft",   desc:"Artisan Gate III abgeschlossen",      icon:"🏺", color:"#a78bfa",  category:"gate" },

  // Gate — Charmer
  { id:"social_initiate",       title:"Social Initiate",       desc:"Charmer Gate I abgeschlossen",        icon:"🌐", color:"#ec4899",  category:"gate" },
  { id:"the_presence",          title:"The Presence",          desc:"Charmer Gate II abgeschlossen",       icon:"✦", color:"#ec4899",  category:"gate" },
  { id:"social_sovereign",      title:"Social Sovereign",      desc:"Charmer Gate III abgeschlossen",      icon:"👑", color:"#ec4899",  category:"gate" },

  // Gate — Strategist
  { id:"first_plan",            title:"The First Plan",        desc:"Strategist Gate I abgeschlossen",     icon:"📋", color:"#0ea5e9",  category:"gate" },
  { id:"system_thinker",        title:"System Thinker",        desc:"Strategist Gate II abgeschlossen",    icon:"♟️", color:"#0ea5e9",  category:"gate" },
  { id:"architect_progress",    title:"Architect of Progress", desc:"Strategist Gate III abgeschlossen",   icon:"🏛️", color:"#0ea5e9",  category:"gate" },

  // Gate — Guardian
  { id:"order_reset",           title:"Order Reset",           desc:"Guardian Gate I abgeschlossen",       icon:"🏠", color:"#84cc16",  category:"gate" },
  { id:"weekly_structure",      title:"Weekly Structure",      desc:"Guardian Gate II abgeschlossen",      icon:"📅", color:"#84cc16",  category:"gate" },
  { id:"stable_foundation",     title:"Stable Foundation",     desc:"Guardian Gate III abgeschlossen",     icon:"🏗️", color:"#84cc16",  category:"gate" },

  // Gate — Merchant
  { id:"first_ledger",          title:"First Ledger",          desc:"Merchant Gate I abgeschlossen",       icon:"📒", color:"#22c55e",  category:"gate" },
  { id:"financial_strategist",  title:"Financial Strategist",  desc:"Merchant Gate II abgeschlossen",      icon:"📊", color:"#22c55e",  category:"gate" },
  { id:"the_deal",              title:"The Deal",              desc:"Merchant Gate III abgeschlossen",     icon:"🤝", color:"#22c55e",  category:"gate" },

  // Gate — Creator
  { id:"first_post",            title:"First Post",            desc:"Creator Gate I abgeschlossen",        icon:"📱", color:"#e879f9",  category:"gate" },
  { id:"content_streak",        title:"Content Streak",        desc:"Creator Gate II abgeschlossen",       icon:"🎬", color:"#e879f9",  category:"gate" },
  { id:"the_voice",             title:"The Voice",             desc:"Creator Gate III abgeschlossen",      icon:"🎤", color:"#e879f9",  category:"gate" },

  // Gate — Monk
  { id:"still_mind",            title:"Still Mind",            desc:"Monk Gate I abgeschlossen",           icon:"🧘", color:"#10b981",  category:"gate" },
  { id:"recovery_ritual",       title:"Recovery Ritual",       desc:"Monk Gate II abgeschlossen",          icon:"💚", color:"#10b981",  category:"gate" },
  { id:"inner_fortress",        title:"Inner Fortress",        desc:"Monk Gate III abgeschlossen",         icon:"🏯", color:"#10b981",  category:"gate" },

  // Gate — Explorer
  { id:"new_horizon",           title:"New Horizon",           desc:"Explorer Gate I abgeschlossen",       icon:"🌅", color:"#f59e0b",  category:"gate" },
  { id:"comfort_breaker",       title:"Comfort Zone Breaker",  desc:"Explorer Gate II abgeschlossen",      icon:"🚀", color:"#f59e0b",  category:"gate" },
  { id:"world_walker",          title:"World Walker",          desc:"Explorer Gate III abgeschlossen",     icon:"🌍", color:"#f59e0b",  category:"gate" },

  // Gate — Shadow
  { id:"the_allrounder",        title:"The Allrounder",        desc:"Shadow Gate I abgeschlossen",         icon:"🌑", color:"#00ffff",  category:"gate" },
];

// Deduplizierte Map: id → Title (spätere Einträge überschreiben frühere)
export const TITLE_MAP = Object.fromEntries(TITLES.map(t => [t.id, t]));

// ── Domain → Path-Mapping (für checkTitleUnlocks) ─────────
const DOMAIN_TO_PATH = {
  // Body
  body: "fighter", strength: "fighter",
  cardio: "runner",
  // Mind
  mind: "scholar", uni: "scholar",
  craft: "engineer", skill_tech: "engineer", skill_practical: "engineer",
  creativity: "artisan", skill_creative: "artisan",
  social: "charmer", appearance: "charmer",
  discipline: "strategist",
  home: "guardian",
  finance: "merchant", career: "merchant",
  recovery: "monk", health: "monk",
  adventure: "explorer",
};

// ── Path Apprentice Threshold ──────────────────────────────
const APPRENTICE_THRESHOLD = 5;

const PATH_APPRENTICE_MAP = {
  scholar:    "apprentice_scholar",
  engineer:   "apprentice_engineer",
  fighter:    "apprentice_fighter",
  runner:     "apprentice_runner",
  artisan:    "apprentice_artisan",
  charmer:    "apprentice_charmer",
  strategist: "apprentice_strategist",
  guardian:   "apprentice_guardian",
  merchant:   "apprentice_merchant",
  creator:    "apprentice_creator",
  monk:       "apprentice_monk",
  explorer:   "apprentice_explorer",
};

/**
 * Prüft welche Titel neu freigeschaltet werden.
 * Gibt Array neuer Titel-IDs zurück (noch nicht in player.titles).
 *
 * Geprüft wird:
 *   - Streak-Titel
 *   - Recovery-Titel
 *   - Deep Work Initiate
 *   - Path-Apprentice (alle 12 Paths)
 *   - Goal Breaker
 *   - Chronicler (Progress Logs)
 *   - Gatebreaker (3 Gates)
 *   - Shadow Candidate (3+ starke Paths)
 *
 * Gate-spezifische Titel werden direkt in applyGateCompletion vergeben.
 *
 * @param {object}   state        - vollständiger App-State
 * @param {object[]} questHistory - state.questHistory
 * @returns {string[]}            - neu freigeschaltete Titel-IDs
 */
export function checkTitleUnlocks(state, questHistory = []) {
  // Bestehende Titel normalisieren (Legacy-Strings → IDs)
  const existingRaw = state.player?.titles || [];
  const existingIds = new Set(existingRaw.map(t => {
    // Wenn es bereits eine ID ist (lowercase+underscore), direkt verwenden
    if (TITLE_MAP[t]) return t;
    // Sonst: String-Match auf title-Feld
    const found = TITLES.find(ti => ti.title === t);
    return found ? found.id : t;
  }));

  const newTitles = [];
  const already = (id) => existingIds.has(id) || newTitles.includes(id);
  const add      = (id) => { if (id && TITLE_MAP[id] && !already(id)) newTitles.push(id); };

  const streak    = state.currentStreak || 0;
  const goals     = state.goals         || [];
  const logs      = state.progressLogs  || [];
  const gateProgress = state.gateProgress || {};
  const affinities   = state.player?.affinities || {};

  // ── Streak ──
  if (streak >= 7)  add("consistent_hunter");
  if (streak >= 30) add("iron_discipline");

  // ── Recovery: 5+ Recovery-Quests ──
  const recoveryCount = questHistory.filter(e =>
    e.domain === "recovery" || e.domain === "health" || e.type === "recovery"
  ).length;
  if (recoveryCount >= 5) add("balance_restored");

  // ── Deep Work Initiate: 5+ mind/scholar Quests ──
  const mindCount = questHistory.filter(e =>
    e.domain === "mind" || e.domain === "uni" || e.path === "scholar"
  ).length;
  if (mindCount >= 5) add("deep_work_initiate");

  // ── Path Apprentice (alle 12 Paths) ──
  const pathCounts = {};
  for (const entry of questHistory) {
    const pathId = entry.path || DOMAIN_TO_PATH[entry.domain] || DOMAIN_TO_PATH[entry.cat];
    if (pathId) pathCounts[pathId] = (pathCounts[pathId] || 0) + 1;
  }
  for (const [pathId, titleId] of Object.entries(PATH_APPRENTICE_MAP)) {
    if ((pathCounts[pathId] || 0) >= APPRENTICE_THRESHOLD) add(titleId);
  }

  // ── Goal Breaker: erstes Goal abgeschlossen ──
  const completedGoals = goals.filter(g => g.status === "completed").length;
  if (completedGoals >= 1) add("goal_breaker");

  // ── Chronicler: 10+ Progress Logs ──
  if (logs.length >= 10) add("chronicler");

  // ── Gatebreaker: 3+ Gates abgeschlossen ──
  const completedGates = Object.values(gateProgress).filter(g => g.completed).length;
  if (completedGates >= 3) add("gatebreaker");

  // ── Shadow Candidate: 3+ Paths mit Affinity >= 15 ──
  const strongPaths = Object.entries(affinities).filter(([k, v]) => k !== "shadow" && v >= 15).length;
  if (strongPaths >= 3) add("shadow_candidate");

  return newTitles;
}

/**
 * Migriert alte String-Titel auf IDs.
 * Gibt normalisiertes Array zurück.
 */
export function normalizeTitles(rawTitles = []) {
  return [...new Set(rawTitles.map(t => {
    if (TITLE_MAP[t]) return t; // Bereits ID
    const found = TITLES.find(ti => ti.title === t);
    return found ? found.id : t;
  }))];
}

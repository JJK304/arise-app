// ============================================================
// DEFAULT STATE
// ============================================================

export const defaultState = (name) => ({
  // ── Core (bestehend) ──
  name,
  rank: "E",
  level: 1,
  xp: 0,
  stats: { STR:0, AGI:0, INT:0, CRE:0, CRA:0, VIT:0, END:0, CHA:0, SOC:0, REL:0, APP:0 },
  completedChallenges: [],
  customQuests: [],
  lastDailyReset: null,
  lastWeeklyReset: null,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDay: null,
  xpHistory: [],
  unlockedAchievements: [],

  // ── Player Model v2 (neu) ──
  player: {
    name,
    mainPath: null,
    secondaryPath: null,
    titles: [],
    activeTitle: null,
    affinities: {
      fighter:  0,
      runner:   0,
      scholar:  0,
      engineer: 0,
      artisan:  0,
      charmer:  0,
      shadow:   0,
    },
    preferences: {
      interests:            [],
      goals:                [],
      weakAreas:            [],
      preferredQuestLength: "medium",
      activePaths:          [],
      balanceAreas:         [],
    },
  },

  // ── Quest History v2 (neu) ──
  questHistory: [],

  // ── Gate Progress (neu) ──
  // { [gateId]: { stepsDone: [0,1,2,...], completed: bool, rewardClaimed: bool } }
  gateProgress: {},
});

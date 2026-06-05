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

  // ── Player Model ──
  player: {
    name,
    mainPath: null,
    secondaryPath: null,
    titles: [],
    activeTitle: null,
    affinities: {
      fighter:    0,
      runner:     0,
      scholar:    0,
      engineer:   0,
      artisan:    0,
      charmer:    0,
      strategist: 0,
      guardian:   0,
      merchant:   0,
      creator:    0,
      monk:       0,
      explorer:   0,
      shadow:     0,
    },
    preferences: {
      interests:            [],
      goals:                [],
      weakAreas:            [],
      preferredQuestLength: "medium",
      activePaths:          [],
      balanceAreas:         [],
      difficulty:           "normal",
    },
  },

  // ── Quest History ──
  questHistory: [],

  // ── Completion Status (getrennt von History — Lockout-Tracking) ──
  // daily: { "YYYY-MM-DD": [questIds] }
  // weekly: { "YYYY-WNN": [questIds] }
  // gates: { gateId: { completed, rewardClaimed } }
  // goals: { goalId: { completed, rewardClaimed } }
  completionStatus: {
    daily:  {},
    weekly: {},
    gates:  {},
    goals:  {},
  },

  // ── Gate Progress ──
  // { [gateId]: { stepsDone: [0,1,2,...], completed: bool, rewardClaimed: bool } }
  gateProgress: {},

  // ── Progress Logs ──
  // Einträge werden beim Quest-Abschluss optional hinzugefügt.
  progressLogs: [],

  // ── Goals ──
  // Echte Ziele mit targetValue, currentValue etc. (Prompt 5)
  goals: [],

  // ── Weekly Reviews ──
  // Wöchentliche Reflexionen (Prompt 14)
  weeklyReviews: [],
});


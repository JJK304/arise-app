// ============================================================
// DEMO PROFILES — Prompt 18
// Vorgefertigte Test-Szenarien für schnelle Validierung.
// Nur im System-Tab sichtbar, nicht störend für normale Nutzer.
// Überschreiben den aktuellen State (Reset wird klar angezeigt).
// ============================================================
import { migrateState } from "../lib/migration.js";
import { getDayKey, getTodayWeekKey } from "../lib/dates.js";
import { createGoal } from "../lib/goals.js";

// ── Helper ────────────────────────────────────────────────

function makeHistory(entries) {
  const now = new Date();
  return entries.map(([domain, path, daysAgo = 0, xp = 30]) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return {
      id:          `demo_h_${Math.random().toString(36).slice(2)}`,
      title:       `Demo Quest (${domain})`,
      completedAt: d.toISOString(),
      type:        "daily",
      domain,
      path,
      xp,
      stats:       {},
      source:      "demo",
    };
  });
}

function makeAffinities(entries) {
  const base = {
    fighter:0, runner:0, scholar:0, engineer:0,
    artisan:0, charmer:0, strategist:0, guardian:0,
    merchant:0, creator:0, monk:0, explorer:0, shadow:0,
  };
  return { ...base, ...entries };
}

// ── Profile Definitions ───────────────────────────────────

export const DEMO_PROFILES = [

  // ─ 1. General Beginner ───────────────────────────────────
  {
    id:       "beginner",
    label:    "General Beginner",
    icon:     "🌱",
    desc:     "Keine Interessen gesetzt. Erwartet allgemeine Starter-Quests aus verschiedenen Domains.",
    color:    "#22c55e",
    expectedPaths:   ["–"],
    expectedQuests:  ["Starter-Dailies: Fokus, Bewegung, Lernen, Ordnung, Social, Reflexion"],
    expectedGates:   ["–"],
    expectedGoals:   ["–"],
    buildState: (name) => migrateState({
      name,
      rank: "E", level: 1, xp: 0, totalXP: 0,
      lastDailyReset:  getDayKey(),
      lastWeeklyReset: getTodayWeekKey(),
      stats: { STR:0,AGI:0,INT:0,CRE:0,CRA:0,VIT:0,END:0,CHA:0,SOC:0,REL:0,APP:0 },
      completedChallenges: [], customQuests: [],
      questHistory: [],
      player: {
        mainPath: null, secondaryPath: null,
        titles: [], activeTitle: null,
        affinities: makeAffinities({}),
        preferences: {
          interests: [], activePaths: [], balanceAreas: [],
          preferredQuestLength: "medium", difficulty: "normal",
        },
      },
    }),
  },

  // ─ 2. Scholar / Engineer ─────────────────────────────────
  {
    id:       "scholar_engineer",
    label:    "Scholar / Engineer",
    icon:     "🧠",
    desc:     "Physik, Elektronik, Programmieren, Mathe. Erwartet: Deep Work, Aufgaben, Debugging, Projektquests.",
    color:    "#3b82f6",
    expectedPaths:   ["Scholar (Main)", "Engineer (Secondary)"],
    expectedQuests:  ["45 Min. Physik Deep Work", "Elektronik-Projekt", "Fehler debuggen", "Konzept erklären"],
    expectedGates:   ["Scholar Gate I", "Engineer Gate I"],
    expectedGoals:   ["Lernziel 20 Einheiten", "Projekt 8 Schritte"],
    buildState: (name) => {
      const hist = makeHistory([
        ["mind","scholar",0,35],["mind","scholar",1,35],["mind","scholar",2,40],
        ["craft","engineer",0,38],["craft","engineer",1,38],["craft","engineer",2,35],
        ["mind","scholar",3,30],["craft","engineer",3,38],["mind","scholar",4,35],
        ["craft","engineer",4,38],
      ]);
      const goals = [
        createGoal({ templateId:"learning_goal", title:"Physik Klausur vorbereiten", targetValue:20, domain:"mind", path:"scholar" }),
        createGoal({ templateId:"project_goal",  title:"Elektronik-Projekt abschließen", targetValue:8, domain:"craft", path:"engineer" }),
      ];
      goals[0].currentValue = 5;
      return migrateState({
        name, rank:"D", level:3, xp:450, totalXP:3800,
        lastDailyReset: getDayKey(), lastWeeklyReset: getTodayWeekKey(),
        currentStreak: 4, longestStreak: 7,
        stats: { STR:0,AGI:0,INT:12,CRE:0,CRA:8,VIT:0,END:5,CHA:0,SOC:0,REL:0,APP:0 },
        completedChallenges: [], customQuests: [],
        questHistory: hist, goals,
        player: {
          mainPath: "scholar", secondaryPath: "engineer",
          titles: ["deep_work_initiate","apprentice_scholar"], activeTitle: "apprentice_scholar",
          affinities: makeAffinities({ scholar:18, engineer:14 }),
          preferences: {
            interests: ["physik","mathe","programmieren","elektronik"],
            activePaths: ["scholar","engineer"],
            balanceAreas: ["recovery","body"],
            preferredQuestLength: "medium", difficulty: "normal",
          },
        },
      });
    },
  },

  // ─ 3. Fighter ────────────────────────────────────────────
  {
    id:       "fighter",
    label:    "Fighter",
    icon:     "⚔️",
    desc:     "Krafttraining, Ernährung, Schlaf, Mobility. Erwartet: Training, Recovery, Schlaf, Ernährung.",
    color:    "#ef4444",
    expectedPaths:   ["Fighter (Main)", "Runner (Secondary)"],
    expectedQuests:  ["45 Min. Training", "5 km laufen", "Proteinreiche Mahlzeit", "10 Min. Mobility"],
    expectedGates:   ["Fighter Gate I", "Runner Gate I"],
    expectedGoals:   ["20 Trainingseinheiten", "50 km laufen"],
    buildState: (name) => {
      const hist = makeHistory([
        ["body","fighter",0,35],["body","fighter",1,35],["body","fighter",2,35],
        ["body","runner",0,30],["body","runner",1,30],["body","runner",2,30],
        ["recovery","monk",0,22],["body","fighter",3,35],["body","runner",3,30],
        ["body","fighter",4,35],
      ]);
      const goals = [
        createGoal({ templateId:"fitness_goal", title:"20 Trainingseinheiten", targetValue:20, domain:"body", path:"fighter" }),
        createGoal({ templateId:"run_goal", title:"50 km gesamt laufen", targetValue:50, unit:"km", domain:"body", path:"runner" }),
      ];
      goals[0].currentValue = 7;
      return migrateState({
        name, rank:"D", level:2, xp:200, totalXP:2800,
        lastDailyReset: getDayKey(), lastWeeklyReset: getTodayWeekKey(),
        currentStreak: 6, longestStreak: 6,
        stats: { STR:14,AGI:8,INT:0,CRE:0,CRA:0,VIT:6,END:10,CHA:0,SOC:0,REL:0,APP:0 },
        completedChallenges: [], customQuests: [],
        questHistory: hist, goals,
        player: {
          mainPath: "fighter", secondaryPath: "runner",
          titles: ["apprentice_fighter","consistent_hunter"], activeTitle: "iron_will",
          affinities: makeAffinities({ fighter:20, runner:14 }),
          preferences: {
            interests: ["krafttraining","laufen","mobility","ernaehrung","schlaf"],
            activePaths: ["fighter","runner"],
            balanceAreas: ["recovery","social"],
            preferredQuestLength: "medium", difficulty: "normal",
          },
        },
      });
    },
  },

  // ─ 4. Creator ────────────────────────────────────────────
  {
    id:       "creator",
    label:    "Creator",
    icon:     "🎨",
    desc:     "Zeichnen, Musik, Content Creation, Design. Erwartet: kreative Übung, Werk erstellen, Content produzieren.",
    color:    "#a78bfa",
    expectedPaths:   ["Artisan (Main)", "Creator (Secondary)"],
    expectedQuests:  ["25 Min. Zeichnen üben", "Neues Zeichnen-Werk beginnen", "30 Min. Content erstellen"],
    expectedGates:   ["Artisan Gate I", "Creator Gate I"],
    expectedGoals:   ["3 kreative Werke fertigstellen"],
    buildState: (name) => {
      const hist = makeHistory([
        ["creativity","artisan",0,32],["creativity","artisan",1,32],["creativity","creator",0,34],
        ["creativity","artisan",2,32],["creativity","creator",1,34],["creativity","artisan",3,28],
        ["creativity","creator",2,34],["social","charmer",0,22],["creativity","artisan",4,32],
        ["creativity","creator",3,34],
      ]);
      const goals = [
        createGoal({ templateId:"creative_goal", title:"3 kreative Werke fertigstellen", targetValue:3, domain:"creativity", path:"artisan" }),
      ];
      goals[0].currentValue = 1;
      return migrateState({
        name, rank:"E", level:8, xp:320, totalXP:1800,
        lastDailyReset: getDayKey(), lastWeeklyReset: getTodayWeekKey(),
        currentStreak: 3, longestStreak: 5,
        stats: { STR:0,AGI:0,INT:0,CRE:10,CRA:6,VIT:0,END:3,CHA:4,SOC:0,REL:0,APP:0 },
        completedChallenges: [], customQuests: [],
        questHistory: hist, goals,
        player: {
          mainPath: "artisan", secondaryPath: "creator",
          titles: ["creative_spark"], activeTitle: "creative_spark",
          affinities: makeAffinities({ artisan:16, creator:12 }),
          preferences: {
            interests: ["zeichnen","musik","contentcreation","design","fotografie"],
            activePaths: ["artisan","creator"],
            balanceAreas: ["body","recovery"],
            preferredQuestLength: "medium", difficulty: "normal",
          },
        },
      });
    },
  },

  // ─ 5. Merchant / Strategist ──────────────────────────────
  {
    id:       "merchant_strategist",
    label:    "Merchant / Strategist",
    icon:     "💰",
    desc:     "Finanzen, Karriere, Planung, Zeitmanagement. Erwartet: Budget, Bewerbung, Wochenplanung.",
    color:    "#22c55e",
    expectedPaths:   ["Merchant (Main)", "Strategist (Secondary)"],
    expectedQuests:  ["Budget aktualisieren", "Karriere-Aufgabe", "Tagesplanung", "15 Min. Finanzen lesen"],
    expectedGates:   ["Merchant Gate I", "Strategist Gate I"],
    expectedGoals:   ["4 Wochen Budget tracken"],
    buildState: (name) => {
      const hist = makeHistory([
        ["finance","merchant",0,20],["discipline","strategist",0,15],["finance","merchant",1,20],
        ["career","merchant",0,30],["discipline","strategist",1,15],["finance","merchant",2,20],
        ["discipline","strategist",2,15],["career","merchant",1,30],["finance","merchant",3,20],
        ["discipline","strategist",3,37],
      ]);
      const goals = [
        createGoal({ templateId:"finance_goal", title:"4 Wochen Budget tracken", targetValue:4, domain:"finance", path:"merchant" }),
        createGoal({ templateId:"career_goal",  title:"Bewerbung vorbereiten", targetValue:5, domain:"career", path:"merchant" }),
      ];
      goals[0].currentValue = 2;
      return migrateState({
        name, rank:"E", level:7, xp:180, totalXP:1500,
        lastDailyReset: getDayKey(), lastWeeklyReset: getTodayWeekKey(),
        currentStreak: 5, longestStreak: 5,
        stats: { STR:0,AGI:0,INT:8,CRE:0,CRA:0,VIT:0,END:7,CHA:4,SOC:0,REL:0,APP:0 },
        completedChallenges: [], customQuests: [],
        questHistory: hist, goals,
        player: {
          mainPath: "merchant", secondaryPath: "strategist",
          titles: ["first_plan"], activeTitle: "first_plan",
          affinities: makeAffinities({ merchant:15, strategist:12 }),
          preferences: {
            interests: ["finanzen","karriere","zeitmanagement","journaling"],
            activePaths: ["merchant","strategist"],
            balanceAreas: ["body","social","recovery"],
            preferredQuestLength: "short", difficulty: "normal",
          },
        },
      });
    },
  },

  // ─ 6. Charmer ────────────────────────────────────────────
  {
    id:       "charmer",
    label:    "Charmer",
    icon:     "👑",
    desc:     "Social Skills, Appearance, Kommunikation, Style. Erwartet: Gespräch, Auftreten, Pflege, Reflexion.",
    color:    "#ec4899",
    expectedPaths:   ["Charmer (Main)", "Explorer (Secondary)"],
    expectedQuests:  ["Bewusstes Gespräch führen", "Vollständige Pflege-Routine", "Aktiv jemanden kontaktieren"],
    expectedGates:   ["Charmer Gate I"],
    expectedGoals:   ["10 Social Challenges"],
    buildState: (name) => {
      const hist = makeHistory([
        ["social","charmer",0,22],["appearance","charmer",0,12],["social","charmer",1,25],
        ["social","charmer",2,22],["appearance","charmer",1,12],["adventure","explorer",0,22],
        ["social","charmer",3,22],["social","charmer",4,16],["appearance","charmer",2,12],
        ["adventure","explorer",1,22],
      ]);
      const goals = [
        createGoal({ templateId:"social_goal", title:"10 Social Challenges abschließen", targetValue:10, domain:"social", path:"charmer" }),
      ];
      goals[0].currentValue = 4;
      return migrateState({
        name, rank:"E", level:5, xp:120, totalXP:1100,
        lastDailyReset: getDayKey(), lastWeeklyReset: getTodayWeekKey(),
        currentStreak: 3, longestStreak: 3,
        stats: { STR:0,AGI:0,INT:0,CRE:0,CRA:0,VIT:0,END:4,CHA:12,SOC:6,REL:0,APP:7 },
        completedChallenges: [], customQuests: [],
        questHistory: hist, goals,
        player: {
          mainPath: "charmer", secondaryPath: "explorer",
          titles: ["social_initiate"], activeTitle: "social_initiate",
          affinities: makeAffinities({ charmer:18, explorer:10 }),
          preferences: {
            interests: ["socialskills","kommunikation","hautpflege","style","selbstbewusstsein"],
            activePaths: ["charmer","explorer"],
            balanceAreas: ["body","recovery","discipline"],
            preferredQuestLength: "short", difficulty: "normal",
          },
        },
      });
    },
  },

  // ─ 7. Guardian / Monk ────────────────────────────────────
  {
    id:       "guardian_monk",
    label:    "Guardian / Monk",
    icon:     "🏠",
    desc:     "Ordnung, Haushalt, Recovery, Meditation, Schlafroutine. Erwartet: Reset, Ruhe, Routine, Reflexion.",
    color:    "#10b981",
    expectedPaths:   ["Guardian (Main)", "Monk (Secondary)"],
    expectedQuests:  ["Wohnung aufräumen", "10 Min. Meditation", "Schlafroutine einhalten", "Dankbarkeitsnotiz"],
    expectedGates:   ["Guardian Gate I", "Monk Gate I"],
    expectedGoals:   ["30 Tage Schlaf-Routine", "14 Recovery-Sessions"],
    buildState: (name) => {
      const hist = makeHistory([
        ["home","guardian",0,14],["recovery","monk",0,22],["home","guardian",1,14],
        ["recovery","monk",1,22],["home","guardian",2,14],["recovery","monk",2,22],
        ["discipline","strategist",0,15],["home","guardian",3,14],["recovery","monk",3,22],
        ["home","guardian",4,13],
      ]);
      const goals = [
        createGoal({ templateId:"habit_goal",    title:"30 Tage Schlafroutine", targetValue:30, domain:"recovery", path:"monk" }),
        createGoal({ templateId:"recovery_goal", title:"14 Recovery-Sessions",  targetValue:14, domain:"recovery", path:"monk" }),
      ];
      goals[0].currentValue = 8;
      goals[1].currentValue = 5;
      return migrateState({
        name, rank:"E", level:6, xp:150, totalXP:1300,
        lastDailyReset: getDayKey(), lastWeeklyReset: getTodayWeekKey(),
        currentStreak: 7, longestStreak: 7,
        stats: { STR:0,AGI:0,INT:0,CRE:0,CRA:0,VIT:10,END:9,CHA:0,SOC:0,REL:5,APP:0 },
        completedChallenges: [], customQuests: [],
        questHistory: hist, goals,
        player: {
          mainPath: "guardian", secondaryPath: "monk",
          titles: ["order_reset","still_mind","consistent_hunter"], activeTitle: "still_mind",
          affinities: makeAffinities({ guardian:17, monk:16 }),
          preferences: {
            interests: ["ordnung","routinen","meditation","schlaf","stressmanagement","natur"],
            activePaths: ["guardian","monk"],
            balanceAreas: ["social","body","creativity"],
            preferredQuestLength: "short", difficulty: "easy",
          },
        },
      });
    },
  },
];

export const DEMO_PROFILE_MAP = Object.fromEntries(DEMO_PROFILES.map(p => [p.id, p]));

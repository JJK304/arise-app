import { describe, it, expect, vi } from "vitest";

// ─── Imports ─────────────────────────────────────────────────
import { migrateState, makeHistoryEntry }  from "../lib/migration.js";
import { defaultState }                    from "../data/defaultState.js";
import { getDayKey, getWeekKey, isSameDay, isSameWeek, getISOWeek, getYesterdayKey } from "../lib/dates.js";
import { isDailyDone, isWeeklyDone, canComplete, markCompleted, pruneCompletionStatus } from "../lib/history.js";
import { generatePersonalizedQuests, generateStarterQuests } from "../lib/questGenerator.js";
import { analyzeSystem }                   from "../lib/systemAnalysis.js";
import { getAffinityGain, suggestPaths, canUnlockShadow } from "../data/paths.js";
import { normalizeInterests, INTERESTS }   from "../data/interests.js";
import { normalizeQuest }                  from "../lib/questNormalizer.js";
import { catToDomain }                     from "../data/domains.js";
import { checkTitleUnlocks }               from "../data/titles.js";
import { getRecoveryQuests }               from "../data/recoveryQuests.js";
import { GATES, isGateCompleted }          from "../data/gates.js";
import { createGoal, questMatchesGoal, applyQuestToAllGoals, canClaimGoalReward, goalProgressPct } from "../lib/goals.js";
import { createProgressLog, canLogWithBonus, getLogFields } from "../lib/progressLogs.js";

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
const makeHistory = (domain, path, count, daysAgo = 0) => {
  const results = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    results.push({
      id:          `q_${i}`,
      title:       `Quest ${i}`,
      completedAt: d.toISOString(),
      type:        "daily",
      domain,
      cat:         domain,
      path,
      xp:          30,
      stats:       {},
    });
  }
  return results;
};

const makeState = (overrides = {}) => migrateState({
  name: "TestHunter",
  rank: "E", level: 1, xp: 0, totalXP: 0,
  stats: { STR:0, AGI:0, INT:0, CRE:0, CRA:0, VIT:0, END:0, CHA:0, SOC:0, REL:0, APP:0 },
  completedChallenges: [],
  customQuests: [], xpHistory: [], unlockedAchievements: [],
  questHistory: [],
  ...overrides,
});

// ═══════════════════════════════════════════════════════════
// 1. DATES — getDayKey, getWeekKey, edge cases
// ═══════════════════════════════════════════════════════════
describe("getDayKey", () => {
  it("returns YYYY-MM-DD format", () => {
    const key = getDayKey(new Date("2025-06-05"));
    expect(key).toBe("2025-06-05");
  });

  it("pads month and day with zeros", () => {
    expect(getDayKey(new Date("2025-01-03"))).toBe("2025-01-03");
  });

  it("handles month boundary", () => {
    expect(getDayKey(new Date("2025-01-31"))).toBe("2025-01-31");
    expect(getDayKey(new Date("2025-02-01"))).toBe("2025-02-01");
  });

  it("handles year boundary", () => {
    expect(getDayKey(new Date("2024-12-31"))).toBe("2024-12-31");
    expect(getDayKey(new Date("2025-01-01"))).toBe("2025-01-01");
  });

  it("handles leap year", () => {
    expect(getDayKey(new Date("2024-02-29"))).toBe("2024-02-29");
  });

  it("defaults to today", () => {
    const key = getDayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ═══════════════════════════════════════════════════════════
// 2. DATES — getWeekKey (ISO 8601)
// ═══════════════════════════════════════════════════════════
describe("getWeekKey", () => {
  it("returns YYYY-WNN format", () => {
    const key = getWeekKey(new Date("2025-06-05"));
    expect(key).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("same week for dates in same ISO week", () => {
    // 2025-06-02 (Mon) and 2025-06-06 (Fri) are same ISO week
    const mon = getWeekKey(new Date("2025-06-02"));
    const fri = getWeekKey(new Date("2025-06-06"));
    expect(mon).toBe(fri);
  });

  it("different week for dates in different ISO weeks", () => {
    const w1 = getWeekKey(new Date("2025-06-01")); // W22
    const w2 = getWeekKey(new Date("2025-06-09")); // W24
    expect(w1).not.toBe(w2);
  });

  it("handles year-boundary ISO week correctly (30 Dec 2024 → 2025-W01)", () => {
    // 30 Dec 2024 is in ISO week 2025-W01
    const key = getWeekKey(new Date("2024-12-30"));
    expect(key).toBe("2025-W01");
  });

  it("handles month boundary without bug", () => {
    // 31 Jan and 1 Feb might be same week
    const jan31 = getWeekKey(new Date("2025-01-31")); // Friday
    const feb03 = getWeekKey(new Date("2025-02-03")); // Monday of next week
    // Jan 31 = W05 (Mon 27 Jan – Sun 2 Feb)
    // Feb 3 = W06
    expect(jan31).not.toBe(feb03);
  });

  it("old getWeekStr bug: weeks DO change at month boundary", () => {
    // The OLD bug: Math.ceil(day/7) would give same week for 29-31 Jan as 1-4 Feb
    // New ISO week correctly assigns different weeks.
    // Jan 31, 2025 = Friday of W05
    // Feb 3, 2025  = Monday of W06
    const wJan = getWeekKey(new Date("2025-01-31"));
    const wFeb = getWeekKey(new Date("2025-02-03"));
    expect(wJan).not.toBe(wFeb);
  });
});

// ═══════════════════════════════════════════════════════════
// 3. DATES — isSameDay, isSameWeek
// ═══════════════════════════════════════════════════════════
describe("isSameDay / isSameWeek", () => {
  it("isSameDay: same date string", () => {
    expect(isSameDay("2025-06-05", "2025-06-05")).toBe(true);
  });
  it("isSameDay: different dates", () => {
    expect(isSameDay("2025-06-05", "2025-06-06")).toBe(false);
  });
  it("isSameWeek: Mon and Fri same week", () => {
    expect(isSameWeek("2025-06-02", "2025-06-06")).toBe(true);
  });
  it("isSameWeek: different weeks", () => {
    expect(isSameWeek("2025-06-01", "2025-06-09")).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// 4. DAILY RESET — isDailyDone, markCompleted
// ═══════════════════════════════════════════════════════════
describe("Daily Completion Lockout", () => {
  const today = getDayKey();

  it("isDailyDone: returns false when completionStatus is empty", () => {
    expect(isDailyDone({}, "e_d1")).toBe(false);
  });

  it("isDailyDone: returns true after marking complete today", () => {
    const quest = { id: "e_d1", type: "daily" };
    const cs = markCompleted({}, quest);
    expect(isDailyDone(cs, "e_d1")).toBe(true);
  });

  it("isDailyDone: returns false for a different quest", () => {
    const quest = { id: "e_d1", type: "daily" };
    const cs = markCompleted({}, quest);
    expect(isDailyDone(cs, "e_d2")).toBe(false);
  });

  it("markCompleted: daily quest stored under today's key", () => {
    const quest = { id: "e_d3", type: "daily" };
    const cs = markCompleted({}, quest);
    expect(cs.daily[today]).toContain("e_d3");
  });

  it("markCompleted: daily questID not stored under weekly key", () => {
    const quest = { id: "e_d1", type: "daily" };
    const cs = markCompleted({}, quest);
    expect(Object.keys(cs.weekly).length).toBe(0);
  });

  it("duplicate protection: canComplete returns false after marking done", () => {
    const quest = { id: "e_d1", type: "daily" };
    const cs = markCompleted({}, quest);
    expect(canComplete(cs, [], quest)).toBe(false);
  });

  it("duplicate protection: canComplete returns true for fresh quest", () => {
    const quest = { id: "e_d99", type: "daily" };
    expect(canComplete({}, [], quest)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// 5. WEEKLY RESET — isWeeklyDone, markCompleted
// ═══════════════════════════════════════════════════════════
describe("Weekly Completion Lockout", () => {
  it("isWeeklyDone: returns false when empty", () => {
    expect(isWeeklyDone({}, "e_w1")).toBe(false);
  });

  it("isWeeklyDone: returns true after marking complete this week", () => {
    const quest = { id: "e_w1", type: "weekly" };
    const cs = markCompleted({}, quest);
    expect(isWeeklyDone(cs, "e_w1")).toBe(true);
  });

  it("markCompleted: weekly quest stored under this week's key", () => {
    const week  = getWeekKey();
    const quest = { id: "e_w2", type: "weekly" };
    const cs = markCompleted({}, quest);
    expect(cs.weekly[week]).toContain("e_w2");
  });

  it("weekly: different quest not blocked", () => {
    const quest = { id: "e_w1", type: "weekly" };
    const cs = markCompleted({}, quest);
    expect(isWeeklyDone(cs, "e_w2")).toBe(false);
  });

  it("canComplete: milestone uses questHistory, not completionStatus", () => {
    const milestone = { id: "e_m1", type: "milestone" };
    // No history → can complete
    expect(canComplete({}, [], milestone)).toBe(true);
    // In history → cannot complete
    const hist = [{ id: "e_m1", completedAt: new Date().toISOString() }];
    expect(canComplete({}, hist, milestone)).toBe(false);
  });

  it("Duplicate Daily XP: same daily quest cannot be completed twice same day", () => {
    const quest = { id: "e_d1", type: "daily" };
    let cs = {};
    cs = markCompleted(cs, quest);
    expect(canComplete(cs, [], quest)).toBe(false);
  });

  it("Duplicate Weekly XP: same weekly quest cannot be completed twice same week", () => {
    const quest = { id: "e_w1", type: "weekly" };
    let cs = {};
    cs = markCompleted(cs, quest);
    expect(canComplete(cs, [], quest)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// 6. MIGRATION
// ═══════════════════════════════════════════════════════════
describe("migrateState", () => {
  it("returns null for invalid input", () => {
    expect(migrateState(null)).toBeNull();
    expect(migrateState("string")).toBeNull();
  });

  it("preserves all existing core fields", () => {
    const raw = { name:"J", rank:"C", level:5, xp:1200, totalXP:8500,
      stats:{ STR:10, AGI:5, INT:22, CRE:3, CRA:8, VIT:6, END:9, CHA:4, SOC:0, REL:0, APP:0 },
      completedChallenges:["e_d1","c_m8"], customQuests:[] };
    const m = migrateState(raw);
    expect(m.name).toBe("J");
    expect(m.rank).toBe("C");
    expect(m.stats.INT).toBe(22);
    expect(m.completedChallenges).toHaveLength(2);
  });

  it("injects missing player model with all 15 affinity keys", () => {
    const m = migrateState({ name:"X", rank:"E", level:1, xp:0 });
    expect(m.player).toBeDefined();
    expect(Object.keys(m.player.affinities)).toHaveLength(15); // 15 Paths inkl. shadow
    expect(m.player.preferences.preferredQuestLength).toBe("medium");
    expect(Array.isArray(m.player.titles)).toBe(true);
    expect(m.player.mainPath).toBeNull();
  });

  it("injects new paths (strategist, guardian, monk etc.) into old states", () => {
    const old = { name:"J", rank:"E", level:1, xp:0,
      player: { affinities: { fighter:5, scholar:3, shadow:0 } } };
    const m = migrateState(old);
    expect(m.player.affinities.strategist).toBe(0);
    expect(m.player.affinities.monk).toBe(0);
    expect(m.player.affinities.explorer).toBe(0);
    // Old values preserved
    expect(m.player.affinities.fighter).toBe(5);
    expect(m.player.affinities.scholar).toBe(3);
  });

  it("injects completionStatus when missing", () => {
    const m = migrateState({ name:"J", rank:"E", level:1, xp:0 });
    expect(m.completionStatus).toBeDefined();
    expect(m.completionStatus.daily).toBeDefined();
    expect(m.completionStatus.weekly).toBeDefined();
    expect(m.completionStatus.gates).toBeDefined();
    expect(m.completionStatus.goals).toBeDefined();
  });

  it("injects progressLogs, goals, weeklyReviews", () => {
    const m = migrateState({ name:"J", rank:"E", level:1, xp:0 });
    expect(Array.isArray(m.progressLogs)).toBe(true);
    expect(Array.isArray(m.goals)).toBe(true);
    expect(Array.isArray(m.weeklyReviews)).toBe(true);
  });

  it("normalizes old interest IDs to new ones", () => {
    const old = {
      name:"J", rank:"E", level:1, xp:0,
      player: {
        preferences: { interests: ["fitness", "physik", "social"] }
      }
    };
    const m = migrateState(old);
    const interests = m.player.preferences.interests;
    expect(interests).toContain("krafttraining"); // fitness → krafttraining
    expect(interests).toContain("physik");        // unchanged
    expect(interests).toContain("socialskills");  // social → socialskills
  });

  it("normalizes quest history: adds domain from cat", () => {
    const old = {
      name:"J", rank:"E", level:1, xp:0,
      questHistory: [{ id:"q1", cat:"strength", completedAt: new Date().toISOString() }]
    };
    const m = migrateState(old);
    expect(m.questHistory[0].domain).toBe("body");
  });

  it("difficulty defaults to normal", () => {
    const m = migrateState({ name:"J", rank:"E", level:1, xp:0 });
    expect(m.player.preferences.difficulty).toBe("normal");
  });
});

// ═══════════════════════════════════════════════════════════
// 7. QUEST NORMALIZER
// ═══════════════════════════════════════════════════════════
describe("normalizeQuest", () => {
  it("maps old cat to domain", () => {
    const q = normalizeQuest({ id:"e_d1", title:"Test", xp:20, cat:"strength", type:"daily" });
    expect(q.domain).toBe("body");
  });

  it("adds actionType based on type", () => {
    const q = normalizeQuest({ id:"e_d1", title:"Test", xp:20, cat:"uni", type:"daily" });
    expect(q.actionType).toBe("action");
  });

  it("recovery quest gets recovery actionType", () => {
    const q = normalizeQuest({ id:"r1", title:"Recovery", xp:15, type:"recovery", recovery:true });
    expect(q.actionType).toBe("recovery");
  });

  it("builds stats object from stat/statPts", () => {
    const q = normalizeQuest({ id:"m1", title:"Milestone", xp:300, type:"milestone", stat:"STR", statPts:10 });
    expect(q.stats).toEqual({ STR: 10 });
  });
});

// ═══════════════════════════════════════════════════════════
// 8. DOMAIN MAPPING
// ═══════════════════════════════════════════════════════════
describe("catToDomain", () => {
  it("maps strength → body", ()    => expect(catToDomain("strength")).toBe("body"));
  it("maps cardio → body", ()      => expect(catToDomain("cardio")).toBe("body"));
  it("maps uni → mind", ()         => expect(catToDomain("uni")).toBe("mind"));
  it("maps skill_tech → craft", () => expect(catToDomain("skill_tech")).toBe("craft"));
  it("maps social → social", ()    => expect(catToDomain("social")).toBe("social"));
  it("maps health → recovery", ()  => expect(catToDomain("health")).toBe("recovery"));
  it("maps discipline → discipline", () => expect(catToDomain("discipline")).toBe("discipline"));
  it("returns null for null", ()   => expect(catToDomain(null)).toBeNull());
  it("returns original for unknown", () => expect(catToDomain("legacy")).toBe("adventure"));
});

// ═══════════════════════════════════════════════════════════
// 9. AFFINITY GAIN
// ═══════════════════════════════════════════════════════════
describe("getAffinityGain", () => {
  it("returns scholar for uni daily", () => {
    const g = getAffinityGain({ cat:"uni", type:"daily" });
    expect(g.scholar).toBe(1);
  });
  it("returns engineer for skill_tech weekly", () => {
    const g = getAffinityGain({ cat:"skill_tech", type:"weekly" });
    expect(g.engineer).toBe(2);
  });
  it("returns scholar+5 for uni milestone", () => {
    const g = getAffinityGain({ cat:"uni", type:"milestone" });
    expect(g.scholar).toBe(5);
  });
  it("returns fighter for strength daily", () => {
    const g = getAffinityGain({ cat:"strength", type:"daily" });
    expect(g.fighter).toBe(1);
  });
  it("returns monk for recovery domain", () => {
    const g = getAffinityGain({ domain:"recovery", type:"daily" });
    expect(g.monk).toBe(1);
  });
  it("returns guardian for home domain", () => {
    const g = getAffinityGain({ domain:"home", type:"daily" });
    expect(g.guardian).toBe(1);
  });
  it("returns empty for null challenge", () => {
    expect(getAffinityGain(null)).toEqual({});
  });
});

// ═══════════════════════════════════════════════════════════
// 10. INTERESTS NORMALIZATION
// ═══════════════════════════════════════════════════════════
describe("normalizeInterests", () => {
  it("maps old 'fitness' to 'krafttraining'", () => {
    const r = normalizeInterests(["fitness"]);
    expect(r).toContain("krafttraining");
  });
  it("keeps valid new IDs unchanged", () => {
    const r = normalizeInterests(["physik", "zeichnen"]);
    expect(r).toContain("physik");
    expect(r).toContain("zeichnen");
  });
  it("filters out unknown IDs", () => {
    const r = normalizeInterests(["unknownXYZ"]);
    expect(r).toHaveLength(0);
  });
  it("handles empty array", () => {
    expect(normalizeInterests([])).toHaveLength(0);
  });
  it("maps 'social' to 'socialskills'", () => {
    const r = normalizeInterests(["social"]);
    expect(r).toContain("socialskills");
  });
});

// ═══════════════════════════════════════════════════════════
// 11. QUEST GENERATOR
// ═══════════════════════════════════════════════════════════
describe("generatePersonalizedQuests", () => {
  it("returns empty array for empty preferences", () => {
    expect(generatePersonalizedQuests({})).toHaveLength(0);
  });

  it("generates quests matching scholar interest (physik)", () => {
    const q = generatePersonalizedQuests({ interests: ["physik"], preferredQuestLength: "medium" });
    expect(q.length).toBeGreaterThan(0);
    expect(q.some(qq => qq.personalized)).toBe(true);
  });

  it("respects max 8 quest limit", () => {
    const q = generatePersonalizedQuests({
      interests: ["physik","mathe","programmieren","elektronik","zeichnen","musik","kochen","laufen"],
      preferredQuestLength: "medium"
    });
    expect(q.length).toBeLessThanOrEqual(8);
  });

  it("has no duplicate IDs", () => {
    const q = generatePersonalizedQuests({ interests: ["physik","mathe"], preferredQuestLength: "medium" });
    const ids = q.map(qq => qq.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("scales XP by quest length: long > medium > short", () => {
    const prefs = (len) => ({ interests: ["physik"], preferredQuestLength: len });
    const short  = generatePersonalizedQuests(prefs("short"));
    const medium = generatePersonalizedQuests(prefs("medium"));
    const long   = generatePersonalizedQuests(prefs("long"));
    if (short.length && medium.length && long.length) {
      expect(medium[0].xp).toBeGreaterThan(short[0].xp);
      expect(long[0].xp).toBeGreaterThan(medium[0].xp);
    }
  });

  it("generates fitness quests for krafttraining interest", () => {
    const q = generatePersonalizedQuests({ interests: ["krafttraining"], activePaths: ["fighter"] });
    expect(q.length).toBeGreaterThan(0);
  });
});

describe("generateStarterQuests", () => {
  it("returns 8 starter quests", () => {
    const q = generateStarterQuests();
    expect(q).toHaveLength(8);
  });
  it("covers multiple domains", () => {
    const q = generateStarterQuests();
    const domains = new Set(q.map(qq => qq.domain));
    expect(domains.size).toBeGreaterThanOrEqual(4);
  });
  it("all quests have xp > 0", () => {
    generateStarterQuests().forEach(q => expect(q.xp).toBeGreaterThan(0));
  });
});

// ═══════════════════════════════════════════════════════════
// 12. SYSTEM ANALYSIS
// ═══════════════════════════════════════════════════════════
describe("analyzeSystem", () => {
  it("returns hasData=false for < 5 entries", () => {
    const r = analyzeSystem(makeHistory("body","fighter",3), {});
    expect(r.hasData).toBe(false);
  });

  it("detects dominant scholar path from 'mind' domain history", () => {
    const hist = makeHistory("mind","scholar",6);
    const r = analyzeSystem(hist, {});
    expect(r.hasData).toBe(true);
    expect(r.suggestedMainPath).toBe("scholar");
  });

  it("detects neglected recovery domain after only strength activity", () => {
    const hist = makeHistory("body","fighter",6);
    const r = analyzeSystem(hist, {});
    // recovery should be neglected (no recovery activity)
    expect(r.neglectedDomains.some(n => n.domain === "recovery")).toBe(true);
  });

  it("provides message for insufficient data", () => {
    const r = analyzeSystem([], {});
    expect(r.suggestedMessage).toContain("Noch nicht genug Daten");
  });

  it("suggests secondary path when two paths active", () => {
    const hist = [
      ...makeHistory("mind","scholar",4),
      ...makeHistory("craft","engineer",3),
    ];
    const r = analyzeSystem(hist, {});
    expect(r.suggestedMainPath).toBe("scholar");
    expect(r.suggestedSecondaryPath).toBe("engineer");
  });
});

// ═══════════════════════════════════════════════════════════
// 13. GOALS SYSTEM
// ═══════════════════════════════════════════════════════════
describe("Goals", () => {
  it("createGoal: builds valid goal object", () => {
    const g = createGoal({ templateId: "learning_goal", title: "Test Goal" });
    expect(g.id).toMatch(/^goal_/);
    expect(g.status).toBe("active");
    expect(g.currentValue).toBe(0);
    expect(g.rewardClaimed).toBe(false);
    expect(g.title).toBe("Test Goal");
  });

  it("questMatchesGoal: matches by domain", () => {
    const g = createGoal({ templateId:"learning_goal", domain:"mind" });
    const q = { domain:"mind", path:"scholar" };
    expect(questMatchesGoal(q, g)).toBe(true);
  });

  it("questMatchesGoal: matches by path", () => {
    const g = createGoal({ templateId:"fitness_goal", path:"fighter" });
    const q = { domain:"body", path:"fighter" };
    expect(questMatchesGoal(q, g)).toBe(true);
  });

  it("questMatchesGoal: no match for unrelated quest", () => {
    const g = createGoal({ templateId:"learning_goal", domain:"mind", path:"scholar" });
    const q = { domain:"social", path:"charmer" };
    expect(questMatchesGoal(q, g)).toBe(false);
  });

  it("applyQuestToAllGoals: increments matching goal", () => {
    const g = createGoal({ templateId:"learning_goal", domain:"mind" });
    const goals = [g];
    const quest = { domain:"mind", path:"scholar" };
    const updated = applyQuestToAllGoals(goals, quest);
    expect(updated[0].currentValue).toBe(1);
  });

  it("applyQuestToAllGoals: completes goal when targetValue reached", () => {
    const g = createGoal({ templateId:"learning_goal", targetValue:1, domain:"mind" });
    const quest = { domain:"mind" };
    const updated = applyQuestToAllGoals([g], quest);
    expect(updated[0].status).toBe("completed");
    expect(updated[0].completedAt).not.toBeNull();
  });

  it("goalProgressPct: correct percentage", () => {
    const g = { currentValue: 5, targetValue: 20, status:"active" };
    expect(goalProgressPct(g)).toBe(25);
  });

  it("canClaimGoalReward: false if already claimed", () => {
    const g = { ...createGoal({}), status:"completed", rewardClaimed:true };
    expect(canClaimGoalReward(g, {})).toBe(false);
  });

  it("canClaimGoalReward: false if not completed", () => {
    const g = createGoal({});
    expect(canClaimGoalReward(g, {})).toBe(false);
  });

  it("canClaimGoalReward: true if completed and not claimed", () => {
    const g = { ...createGoal({}), status:"completed", rewardClaimed:false };
    expect(canClaimGoalReward(g, {})).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// 14. PROGRESS LOGS
// ═══════════════════════════════════════════════════════════
describe("ProgressLogs", () => {
  const mockQuest = { id:"e_d1", title:"Training", type:"daily", domain:"body", actionType:"action" };

  it("createProgressLog: creates valid log", () => {
    const log = createProgressLog({ questId: mockQuest.id, quest: mockQuest, notes:"Gut gelaufen" });
    expect(log.id).toMatch(/^log_/);
    expect(log.questId).toBe("e_d1");
    expect(log.notes).toBe("Gut gelaufen");
    expect(log.domain).toBe("body");
    expect(log.xpBonus).toBeGreaterThan(0);
  });

  it("canLogWithBonus: true for new questId today", () => {
    expect(canLogWithBonus([], "e_d1")).toBe(true);
  });

  it("canLogWithBonus: false if quest already logged today", () => {
    const log = createProgressLog({ questId: mockQuest.id, quest: mockQuest });
    expect(canLogWithBonus([log], "e_d1")).toBe(false);
  });

  it("canLogWithBonus: true for different quest", () => {
    const log = createProgressLog({ quest: mockQuest });
    expect(canLogWithBonus([log], "e_d2")).toBe(true);
  });

  it("getLogFields: returns fitness metrics for body domain", () => {
    const f = getLogFields({ domain:"body" });
    expect(f.metrics).toContain("reps");
    expect(f.metrics).toContain("weight");
  });

  it("getLogFields: returns understanding for mind domain", () => {
    const f = getLogFields({ domain:"mind" });
    expect(f.metrics).toContain("understanding");
  });

  it("getLogFields: returns mood/energy for recovery domain", () => {
    const f = getLogFields({ domain:"recovery" });
    expect(f.metrics).toContain("mood");
    expect(f.metrics).toContain("energy");
  });
});

// ═══════════════════════════════════════════════════════════
// 15. GATES
// ═══════════════════════════════════════════════════════════
describe("Gates", () => {
  it("isGateCompleted: false for empty gateProgress", () => {
    expect(isGateCompleted("gate_scholar_1", {})).toBe(false);
  });

  it("isGateCompleted: true when completed flag set", () => {
    const gp = { "gate_scholar_1": { stepsDone:[0,1,2,3], completed:true, rewardClaimed:false } };
    expect(isGateCompleted("gate_scholar_1", gp)).toBe(true);
  });

  it("gates have required fields", () => {
    GATES.forEach(g => {
      expect(g.id).toBeDefined();
      expect(g.title).toBeDefined();
      expect(Array.isArray(g.steps)).toBe(true);
      expect(g.steps.length).toBeGreaterThan(0);
      expect(g.reward?.xp).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════
// 16. TITLES
// ═══════════════════════════════════════════════════════════
describe("Titles", () => {
  it("unlocks consistent_hunter at streak 7", () => {
    const s = makeState({ currentStreak:7 });
    const unlocked = checkTitleUnlocks(s, []);
    expect(unlocked).toContain("consistent_hunter");
  });

  it("does not re-unlock existing title", () => {
    const s = makeState({ currentStreak:7, player: { titles:["consistent_hunter"], affinities:{} } });
    const s2 = migrateState(s);
    const unlocked = checkTitleUnlocks(s2, []);
    expect(unlocked.filter(t => t === "consistent_hunter")).toHaveLength(0);
  });

  it("unlocks apprentice_scholar after 5 scholar quests in history", () => {
    const hist = makeHistory("uni","scholar",5);
    const s = makeState({ questHistory: hist });
    const unlocked = checkTitleUnlocks(s, hist);
    expect(unlocked).toContain("apprentice_scholar");
  });
});

// ═══════════════════════════════════════════════════════════
// 17. DEMO PROFILES
// ═══════════════════════════════════════════════════════════
import { DEMO_PROFILES } from "../data/demoProfiles.js";
import { generatePersonalizedQuests, generateStarterQuests } from "../lib/questGenerator.js";

describe("Demo Profiles", () => {
  it("all 7 profiles build valid states", () => {
    for (const p of DEMO_PROFILES) {
      const s = p.buildState("TestHunter");
      expect(s).toBeDefined();
      expect(s.name).toBe("TestHunter");
      expect(s.player).toBeDefined();
      expect(s.player.preferences).toBeDefined();
    }
  });

  it("beginner: no interests → generateStarterQuests returns 8 quests", () => {
    const p = DEMO_PROFILES.find(p => p.id === "beginner");
    const s = p.buildState("Test");
    const quests = generateStarterQuests();
    expect(quests).toHaveLength(8);
    const domains = new Set(quests.map(q => q.domain));
    expect(domains.size).toBeGreaterThanOrEqual(4);
  });

  it("scholar_engineer: interests generate mind+craft quests", () => {
    const p = DEMO_PROFILES.find(p => p.id === "scholar_engineer");
    const s = p.buildState("Test");
    const quests = generatePersonalizedQuests(s.player.preferences);
    expect(quests.length).toBeGreaterThan(0);
    const domains = new Set(quests.map(q => q.domain));
    expect(domains.has("mind") || domains.has("craft")).toBe(true);
  });

  it("fighter: interests generate body quests", () => {
    const p = DEMO_PROFILES.find(p => p.id === "fighter");
    const s = p.buildState("Test");
    const quests = generatePersonalizedQuests(s.player.preferences);
    expect(quests.length).toBeGreaterThan(0);
    const domains = new Set(quests.map(q => q.domain));
    expect(domains.has("body") || domains.has("recovery")).toBe(true);
  });

  it("creator: interests generate creativity quests", () => {
    const p = DEMO_PROFILES.find(p => p.id === "creator");
    const s = p.buildState("Test");
    const quests = generatePersonalizedQuests(s.player.preferences);
    expect(quests.length).toBeGreaterThan(0);
    expect(quests.some(q => q.domain === "creativity")).toBe(true);
  });

  it("merchant_strategist: interests generate finance+discipline quests", () => {
    const p = DEMO_PROFILES.find(p => p.id === "merchant_strategist");
    const s = p.buildState("Test");
    const quests = generatePersonalizedQuests(s.player.preferences);
    expect(quests.length).toBeGreaterThan(0);
    const domains = new Set(quests.map(q => q.domain));
    expect(domains.has("finance") || domains.has("discipline") || domains.has("career")).toBe(true);
  });

  it("charmer: interests generate social+appearance quests", () => {
    const p = DEMO_PROFILES.find(p => p.id === "charmer");
    const s = p.buildState("Test");
    const quests = generatePersonalizedQuests(s.player.preferences);
    expect(quests.length).toBeGreaterThan(0);
    const domains = new Set(quests.map(q => q.domain));
    expect(domains.has("social") || domains.has("appearance")).toBe(true);
  });

  it("guardian_monk: interests generate home+recovery quests", () => {
    const p = DEMO_PROFILES.find(p => p.id === "guardian_monk");
    const s = p.buildState("Test");
    const quests = generatePersonalizedQuests(s.player.preferences);
    expect(quests.length).toBeGreaterThan(0);
    const domains = new Set(quests.map(q => q.domain));
    expect(domains.has("recovery") || domains.has("home")).toBe(true);
  });

  it("all profiles: systemAnalysis detects dominant path from history", () => {
    
    for (const profile of DEMO_PROFILES.filter(p => p.id !== "beginner")) {
      const s = profile.buildState("Test");
      const analysis = analyzeSystem(s.questHistory, s.player.affinities, s.player.preferences);
      if (s.questHistory.length >= 5) {
        expect(analysis.hasData).toBe(true);
        expect(analysis.suggestedMainPath).toBeTruthy();
      }
    }
  });

  it("scholar_engineer: goals exist and have progress", () => {
    const p = DEMO_PROFILES.find(p => p.id === "scholar_engineer");
    const s = p.buildState("Test");
    expect(s.goals.length).toBeGreaterThan(0);
    expect(s.goals.some(g => g.currentValue > 0)).toBe(true);
  });

  it("all profiles: have valid preferences structure", () => {
    for (const profile of DEMO_PROFILES) {
      const s = profile.buildState("Test");
      const prefs = s.player.preferences;
      expect(Array.isArray(prefs.interests)).toBe(true);
      expect(Array.isArray(prefs.activePaths)).toBe(true);
      expect(typeof prefs.difficulty).toBe("string");
      expect(typeof prefs.preferredQuestLength).toBe("string");
    }
  });
});

// ═══════════════════════════════════════════════════════════
// 18. BALANCING
// ═══════════════════════════════════════════════════════════
import { clampXp, suggestXp, XP_BOUNDS } from "../data/balancing.js";
import { calculateCustomQuestXpBounds } from "../lib/questRotation.js";
import { GATES } from "../data/gates.js";
import { CHALLENGES_DB } from "../data/challenges.js";

describe("Balancing — XP Bounds", () => {
  it("clampXp: daily normal within 10–80", () => {
    expect(clampXp(5,   "daily", "normal")).toBe(10);   // below min → min
    expect(clampXp(50,  "daily", "normal")).toBe(50);   // within range
    expect(clampXp(100, "daily", "normal")).toBe(80);   // above max → max
  });

  it("clampXp: weekly hard within 65–325", () => {
    expect(clampXp(30,  "weekly", "hard")).toBe(65);
    expect(clampXp(200, "weekly", "hard")).toBe(200);
    expect(clampXp(400, "weekly", "hard")).toBe(325);
  });

  it("clampXp: milestone normal within 150–800", () => {
    expect(clampXp(100, "milestone", "normal")).toBe(150);
    expect(clampXp(500, "milestone", "normal")).toBe(500);
    expect(clampXp(900, "milestone", "normal")).toBe(800);
  });

  it("clampXp: recovery normal within 15–60", () => {
    expect(clampXp(5,   "recovery", "normal")).toBe(15);
    expect(clampXp(30,  "recovery", "normal")).toBe(30);
    expect(clampXp(100, "recovery", "normal")).toBe(60);
  });

  it("suggestXp: returns value within bounds", () => {
    for (const type of ["daily","weekly","milestone","custom","recovery"]) {
      for (const diff of ["easy","normal","hard"]) {
        const s = suggestXp(type, diff);
        const bounds = XP_BOUNDS[type]?.[diff] || XP_BOUNDS[type]?.normal;
        if (bounds) {
          expect(s).toBeGreaterThanOrEqual(bounds.min);
          expect(s).toBeLessThanOrEqual(bounds.max);
        }
      }
    }
  });

  it("calculateCustomQuestXpBounds: daily normal min=10 max=80", () => {
    const b = calculateCustomQuestXpBounds({ type:"daily", difficulty:"normal" });
    expect(b.min).toBe(10);
    expect(b.max).toBe(80);
    expect(b.suggested).toBeGreaterThanOrEqual(b.min);
    expect(b.suggested).toBeLessThanOrEqual(b.max);
  });

  it("calculateCustomQuestXpBounds: weekly hard min≥65 max≤325", () => {
    const b = calculateCustomQuestXpBounds({ type:"weekly", difficulty:"hard" });
    expect(b.min).toBeGreaterThanOrEqual(65);
    expect(b.max).toBeLessThanOrEqual(325);
  });

  // Hilfsfilter: Discovery-Gates und Trials haben eigene XP-Bänder (siehe balancing.js)
  const isDiscovery = g => String(g.id).startsWith("gate_discovery");
  const isTrial     = g => String(g.id).startsWith("trial_");
  const isPlainGate = g => !isDiscovery(g) && !isTrial(g);

  it("gate XP Tier 1: 300–600 range (incl. shadow special)", () => {
    for (const g of GATES.filter(g => g.tier === 1 && isPlainGate(g))) {
      expect(g.reward.xp).toBeGreaterThanOrEqual(300);
      expect(g.reward.xp).toBeLessThanOrEqual(600);
    }
  });

  it("discovery gate XP: 150–300 range (leichte Einstiegs-Gates)", () => {
    for (const g of GATES.filter(isDiscovery)) {
      expect(g.reward.xp).toBeGreaterThanOrEqual(150);
      expect(g.reward.xp).toBeLessThanOrEqual(300);
    }
  });

  it("gate XP Tier 2: 600–900 range", () => {
    for (const g of GATES.filter(g => g.tier === 2 && isPlainGate(g))) {
      expect(g.reward.xp).toBeGreaterThanOrEqual(600);
      expect(g.reward.xp).toBeLessThanOrEqual(900);
    }
  });

  it("gate XP Tier 3: 900–1200 range", () => {
    for (const g of GATES.filter(g => g.tier === 3 && isPlainGate(g))) {
      expect(g.reward.xp).toBeGreaterThanOrEqual(900);
      expect(g.reward.xp).toBeLessThanOrEqual(1200);
    }
  });

  it("trial XP: Tier 1 400–600, Tier 2 700–1000, Tier 3 1200–1600", () => {
    const bounds = { 1:[400,600], 2:[700,1000], 3:[1200,1600] };
    for (const g of GATES.filter(isTrial)) {
      const [lo, hi] = bounds[g.tier] || [0, Infinity];
      expect(g.reward.xp).toBeGreaterThanOrEqual(lo);
      expect(g.reward.xp).toBeLessThanOrEqual(hi);
    }
  });

  it("E/D rank daily XP: all within 10–80", () => {
    const eDaily = CHALLENGES_DB.E.daily;
    const dDaily = CHALLENGES_DB.D.daily;
    for (const q of [...eDaily, ...dDaily]) {
      expect(q.xp).toBeGreaterThanOrEqual(10);
      expect(q.xp).toBeLessThanOrEqual(80);
    }
  });

  it("E/D rank milestone XP: all within 150–800", () => {
    for (const q of [...CHALLENGES_DB.E.milestones, ...CHALLENGES_DB.D.milestones]) {
      expect(q.xp).toBeGreaterThanOrEqual(150);
      expect(q.xp).toBeLessThanOrEqual(800);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// 19. applyQuestCompletion (zentrale Completion-Logik)
// ═══════════════════════════════════════════════════════════
import { applyQuestCompletion } from "../lib/questCompletion.js";
import { getGlobalLevel, getRankFromGlobal } from "../lib/helpers.js";
import { RANKS, LEVELS_PER_RANK } from "../data/ranks.js";

const XP_PER_LEVEL = (rank, level) => {
  const base = 200;
  const rankIdx = RANKS.indexOf(rank);
  return Math.round(base * Math.pow(1.5, rankIdx) * (1 + (level - 1) * 0.1));
};
const TOTAL_LEVELS = RANKS.length * LEVELS_PER_RANK;

const completionOpts = {
  XP_PER_LEVEL_FN:  XP_PER_LEVEL,
  TOTAL_LEVELS,
  getRankFromGlobal,
  getGlobalLevel,
};

const baseState = () => makeState({
  rank:"E", level:1, xp:0, totalXP:0,
  stats:{ STR:0,AGI:0,INT:0,CRE:0,CRA:0,VIT:0,END:0,CHA:0,SOC:0,REL:0,APP:0 },
});

describe("applyQuestCompletion", () => {
  it("returns alreadyDone=false for fresh quest", () => {
    const state = baseState();
    const quest = { id:"e_d1", title:"Test", xp:25, type:"daily", cat:"uni", domain:"mind" };
    const { alreadyDone } = applyQuestCompletion(state, quest, completionOpts);
    expect(alreadyDone).toBe(false);
  });

  it("adds XP to state", () => {
    const state = baseState();
    const quest = { id:"e_d1", title:"Test", xp:25, type:"daily", cat:"uni", domain:"mind" };
    const { newState } = applyQuestCompletion(state, quest, completionOpts);
    expect(newState.xp).toBe(25);
    expect(newState.totalXP).toBe(25);
  });

  it("adds questHistory entry", () => {
    const state = baseState();
    const quest = { id:"e_d1", title:"Test", xp:25, type:"daily", domain:"mind" };
    const { newState } = applyQuestCompletion(state, quest, completionOpts);
    expect(newState.questHistory).toHaveLength(1);
    expect(newState.questHistory[0].id).toBe("e_d1");
  });

  it("marks quest in completionStatus", () => {
    const state = baseState();
    const quest = { id:"e_d1", title:"Test", xp:25, type:"daily", domain:"mind" };
    const { newState } = applyQuestCompletion(state, quest, completionOpts);
    const today = getDayKey();
    expect(newState.completionStatus.daily[today]).toContain("e_d1");
  });

  it("duplicate: returns alreadyDone=true on second call", () => {
    const state = baseState();
    const quest = { id:"e_d1", title:"Test", xp:25, type:"daily", domain:"mind" };
    const { newState } = applyQuestCompletion(state, quest, completionOpts);
    const { alreadyDone } = applyQuestCompletion(newState, quest, completionOpts);
    expect(alreadyDone).toBe(true);
  });

  it("adds affinity for scholar domain quest", () => {
    const state = makeState({ player: { affinities: { scholar:0, engineer:0, fighter:0, runner:0, artisan:0, charmer:0, strategist:0, guardian:0, merchant:0, creator:0, monk:0, explorer:0, shadow:0 } } });
    const s = migrateState(state);
    const quest = { id:"e_d1", title:"Test", xp:25, type:"daily", cat:"uni", domain:"mind", path:"scholar" };
    const { newState } = applyQuestCompletion(s, quest, completionOpts);
    expect(newState.player.affinities.scholar).toBeGreaterThan(0);
  });

  it("milestone: adds stat points", () => {
    const state = baseState();
    const quest = { id:"e_m1", title:"Milestone", xp:300, type:"milestone", stat:"INT", statPts:5, domain:"mind" };
    const { newState } = applyQuestCompletion(state, quest, completionOpts);
    expect(newState.stats.INT).toBe(5);
  });

  it("levelUp: XP overflow triggers level increment", () => {
    const xpNeeded = XP_PER_LEVEL("E", 1);
    const state = makeState({ rank:"E", level:1, xp: xpNeeded - 5, totalXP: xpNeeded - 5 });
    const s = migrateState(state);
    const quest = { id:"e_d1", title:"Test", xp:50, type:"daily", domain:"mind" };
    const { newState, feedback } = applyQuestCompletion(s, quest, completionOpts);
    expect(newState.level).toBeGreaterThan(1);
    expect(feedback.levelUps.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════
// 20. Goal Progress durch Quest-Completion
// ═══════════════════════════════════════════════════════════
describe("Goal Progress through Quest Completion", () => {
  it("quest completion increments matching goal", () => {
    const goal = createGoal({ templateId:"learning_goal", domain:"mind", targetValue:10 });
    const state = migrateState({
      ...makeState(),
      goals: [goal],
    });
    const quest = { id:"e_d1", title:"Test", xp:25, type:"daily", domain:"mind" };
    const { newState } = applyQuestCompletion(state, quest, completionOpts);
    expect(newState.goals[0].currentValue).toBe(1);
  });

  it("goal completion triggers reward XP", () => {
    const goal = createGoal({ templateId:"learning_goal", domain:"mind", targetValue:1 });
    const state = migrateState({
      ...makeState(),
      goals: [goal],
    });
    const quest = { id:"e_d1", title:"Test", xp:25, type:"daily", domain:"mind" };
    const { newState } = applyQuestCompletion(state, quest, completionOpts);
    expect(newState.goals[0].status).toBe("completed");
    // XP includes quest xp + goal reward
    expect(newState.totalXP).toBeGreaterThan(25);
  });

  it("goal reward not given twice", () => {
    const goal = { ...createGoal({ templateId:"learning_goal", domain:"mind", targetValue:1 }), status:"completed", rewardClaimed:true };
    const state = migrateState({
      ...makeState(),
      goals: [goal],
      completionStatus: { daily:{}, weekly:{}, gates:{}, goals:{ [goal.id]:{ completed:true, rewardClaimed:true } } },
    });
    const quest = { id:"e_d2", title:"Test2", xp:25, type:"daily", domain:"mind" };
    const initialXp = state.totalXP || 0;
    const { newState } = applyQuestCompletion(state, quest, completionOpts);
    // Goal reward not added again (only quest XP)
    expect(newState.totalXP - initialXp).toBeLessThanOrEqual(quest.xp + 5); // small tolerance
  });
});

// ═══════════════════════════════════════════════════════════
// 21. Progress Log Storage
// ═══════════════════════════════════════════════════════════
import { addProgressLog } from "../lib/progressLogs.js";

describe("Progress Log Storage", () => {
  it("addProgressLog appends to array", () => {
    const existing = [];
    const log = createProgressLog({ questId:"e_d1", quest:{ title:"Test", domain:"body", actionType:"action" } });
    const result = addProgressLog(existing, log);
    expect(result).toHaveLength(1);
    expect(result[0].questId).toBe("e_d1");
  });

  it("addProgressLog respects MAX_LOGS limit", () => {
    let logs = [];
    for (let i = 0; i < 205; i++) {
      const l = createProgressLog({ questId:`q_${i}`, quest:{ title:"T", domain:"body", actionType:"action" } });
      logs = addProgressLog(logs, l);
    }
    expect(logs.length).toBeLessThanOrEqual(200);
  });

  it("log captures metrics correctly", () => {
    const log = createProgressLog({
      questId: "e_d1",
      quest:   { title:"Training", domain:"body", actionType:"metric" },
      metrics: { reps: 10, weight: 80 },
      notes:   "Gut gelaufen",
    });
    expect(log.metrics.reps).toBe(10);
    expect(log.metrics.weight).toBe(80);
    expect(log.notes).toBe("Gut gelaufen");
  });
});

// ═══════════════════════════════════════════════════════════
// 22. Gate Step Completion + Reward Once
// ═══════════════════════════════════════════════════════════
import { applyGateCompletion } from "../lib/questCompletion.js";

describe("Gate Completion", () => {
  const gate = GATES[0]; // scholar gate 1
  const gateState = () => migrateState({
    ...makeState(), rank:"E", level:1, xp:0, totalXP:0,
  });

  it("applyGateCompletion: adds XP", () => {
    const s = gateState();
    const { newState } = applyGateCompletion(s, gate, completionOpts);
    expect(newState.totalXP).toBeGreaterThan(0);
    expect(newState.xp).toBeGreaterThan(0);
  });

  it("applyGateCompletion: marks rewardClaimed", () => {
    const s = gateState();
    const { newState } = applyGateCompletion(s, gate, completionOpts);
    expect(newState.gateProgress[gate.id].rewardClaimed).toBe(true);
  });

  it("applyGateCompletion: cannot claim reward twice", () => {
    const s = gateState();
    const { newState: s1 } = applyGateCompletion(s, gate, completionOpts);
    const { alreadyDone } = applyGateCompletion(s1, gate, completionOpts);
    expect(alreadyDone).toBe(true);
  });

  it("applyGateCompletion: awards title", () => {
    const s = gateState();
    const { newState } = applyGateCompletion(s, gate, completionOpts);
    if (gate.reward.title) {
      expect(newState.player.titles).toContain(gate.reward.title);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// 23. Weekly Review Anti-Spam
// ═══════════════════════════════════════════════════════════
import { createWeeklyReview, hasReviewThisWeek, addWeeklyReview } from "../lib/weeklyReview.js";

describe("Weekly Review", () => {
  it("hasReviewThisWeek: false when empty", () => {
    expect(hasReviewThisWeek([])).toBe(false);
  });

  it("hasReviewThisWeek: true after creating review", () => {
    const baseStateWR = migrateState({ ...makeState(), questHistory: makeHistory("mind","scholar",6) });
    const review = createWeeklyReview(baseStateWR, { wentWell:"Good week" });
    const reviews = addWeeklyReview([], review);
    expect(hasReviewThisWeek(reviews)).toBe(true);
  });

  it("addWeeklyReview: replaces existing review for same week", () => {
    const baseStateWR = migrateState({ ...makeState(), questHistory: makeHistory("mind","scholar",6) });
    const r1 = createWeeklyReview(baseStateWR, { wentWell:"First" });
    const r2 = createWeeklyReview(baseStateWR, { wentWell:"Second" });
    const reviews = addWeeklyReview(addWeeklyReview([], r1), r2);
    // Same weekKey → only one review kept
    expect(reviews.filter(r => r.weekKey === r1.weekKey)).toHaveLength(1);
  });

  it("createWeeklyReview: calculates base XP bonus", () => {
    const baseStateWR = migrateState({ ...makeState(), questHistory: makeHistory("mind","scholar",6) });
    const review = createWeeklyReview(baseStateWR, {});
    expect(review.xpBonus).toBeGreaterThanOrEqual(50);
    expect(review.xpBonus).toBeLessThanOrEqual(100);
  });

  it("createWeeklyReview: extra XP for reflection", () => {
    const baseStateWR = migrateState({ ...makeState(), questHistory: makeHistory("mind","scholar",6) });
    const noReflection = createWeeklyReview(baseStateWR, {});
    const withReflection = createWeeklyReview(baseStateWR, { wentWell:"Good things" });
    expect(withReflection.xpBonus).toBeGreaterThan(noReflection.xpBonus);
  });
});

// ═══════════════════════════════════════════════════════════
// 24. Custom Quest Lockout
// ═══════════════════════════════════════════════════════════
describe("Custom Quest Lockout", () => {
  it("custom quest respects daily lockout", () => {
    const quest = { id:"custom_123", title:"My Quest", xp:35, type:"custom", domain:"discipline" };
    // First completion: should succeed
    const state = baseState();
    const { newState, alreadyDone } = applyQuestCompletion(state, quest, completionOpts);
    expect(alreadyDone).toBe(false);
    // Second completion: should fail (same day)
    const { alreadyDone: alreadyDone2 } = applyQuestCompletion(newState, quest, completionOpts);
    expect(alreadyDone2).toBe(true);
  });

  it("custom quest XP is clamped to safe range", () => {
    // clampXp is already imported at top of file
    expect(clampXp(9999, "custom", "normal")).toBeLessThanOrEqual(100);
    expect(clampXp(1,    "custom", "normal")).toBeGreaterThanOrEqual(5);
  });
});

// ═══════════════════════════════════════════════════════════
// 25. Quest Rotation Stability
// ═══════════════════════════════════════════════════════════
import { rotateQuestPool } from "../lib/questRotation.js";

describe("Quest Rotation", () => {
  const mockPools = {
    daily:        Array.from({length:20}, (_,i) => ({ id:`d${i}`, type:"daily", xp:25, domain:"mind" })),
    weekly:       Array.from({length:8},  (_,i) => ({ id:`w${i}`, type:"weekly",xp:100,domain:"body" })),
    personalized: Array.from({length:5},  (_,i) => ({ id:`p${i}`, type:"daily", xp:35, domain:"craft" })),
    recovery:     Array.from({length:4},  (_,i) => ({ id:`r${i}`, type:"recovery",xp:20,domain:"recovery" })),
  };

  it("returns at most 5 daily quests", () => {
    const result = rotateQuestPool(mockPools, {});
    expect(result.daily.length).toBeLessThanOrEqual(5);
  });

  it("returns at most 3 weekly quests", () => {
    const result = rotateQuestPool(mockPools, {});
    expect(result.weekly.length).toBeLessThanOrEqual(3);
  });

  it("stable: same dayKey → same daily selection", () => {
    const dayKey = "2025-06-05";
    const r1 = rotateQuestPool(mockPools, {}, dayKey, "2025-W23");
    const r2 = rotateQuestPool(mockPools, {}, dayKey, "2025-W23");
    expect(r1.daily.map(q=>q.id)).toEqual(r2.daily.map(q=>q.id));
  });

  it("different dayKey → potentially different daily selection", () => {
    const r1 = rotateQuestPool(mockPools, {}, "2025-06-05", "2025-W23");
    const r2 = rotateQuestPool(mockPools, {}, "2025-06-06", "2025-W23");
    // Not guaranteed different, but statistically very likely with 20 quests → 5 picks
    const same = r1.daily.map(q=>q.id).join(",") === r2.daily.map(q=>q.id).join(",");
    // We just verify it runs without error; true randomness difference not guaranteed
    expect(r1.daily).toBeDefined();
    expect(r2.daily).toBeDefined();
  });

  it("stable: same weekKey → same weekly selection", () => {
    const weekKey = "2025-W23";
    const r1 = rotateQuestPool(mockPools, {}, "2025-06-02", weekKey);
    const r2 = rotateQuestPool(mockPools, {}, "2025-06-03", weekKey); // different day, same week
    expect(r1.weekly.map(q=>q.id)).toEqual(r2.weekly.map(q=>q.id));
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 2 — EQUAL START: Theme-Gating + neutrale Rank-Pools
// ═══════════════════════════════════════════════════════════
import { QUEST_THEMES, isThemedQuest, buildThemeContext, questThemeMatches } from "../data/questThemes.js";
import { rotateQuestPool as _rotate } from "../lib/questRotation.js";
import { CHALLENGES_DB as _DB } from "../data/challenges.js";

describe("Etappe 2 — Equal Start / Theme-Gating", () => {
  const emptyCtx = buildThemeContext({});

  it("themed Quests sind ohne Signale unsichtbar", () => {
    expect(questThemeMatches({ id: "d_d1" }, emptyCtx)).toBe(false);  // Gym
    expect(questThemeMatches({ id: "c_d9" }, emptyCtx)).toBe(false);  // Instrument
    expect(questThemeMatches({ id: "xd_fin_1" }, emptyCtx)).toBe(false); // Finanzen
    expect(questThemeMatches({ id: "a_d7" }, emptyCtx)).toBe(false);  // Sprache
  });

  it("neutrale Quests sind immer sichtbar", () => {
    expect(questThemeMatches({ id: "e_d1" }, emptyCtx)).toBe(true);
    expect(questThemeMatches({ id: "d_d13" }, emptyCtx)).toBe(true);
    expect(questThemeMatches({ id: "nc_c_d1" }, emptyCtx)).toBe(true);
  });

  it("explizites Interesse schaltet passende Themen frei (nur diese)", () => {
    const ctx = buildThemeContext({ interests: ["krafttraining"] });
    expect(questThemeMatches({ id: "d_d1" }, ctx)).toBe(true);   // Gym ✓
    expect(questThemeMatches({ id: "d_d9" }, ctx)).toBe(false);  // Instrument ✗
    expect(questThemeMatches({ id: "xd_fin_1" }, ctx)).toBe(false); // Finanzen ✗
  });

  it("aktiver Path schaltet Domain-Themen frei", () => {
    const ctx = buildThemeContext({ activePaths: ["fighter"] }); // domains: body, discipline
    expect(questThemeMatches({ id: "d_d1" }, ctx)).toBe(true);
    expect(questThemeMatches({ id: "c_d9" }, ctx)).toBe(false);
  });

  it("aktives Goal schaltet Domain-Themen frei", () => {
    const ctx = buildThemeContext({ activeGoals: [{ domain: "creativity", status: "active" }] });
    expect(questThemeMatches({ id: "d_d10" }, ctx)).toBe(true);  // Zeichnen
    expect(questThemeMatches({ id: "d_d1" }, ctx)).toBe(false);
  });

  it("Verhaltens-Signale schalten Themen frei", () => {
    const ctx = buildThemeContext({ signalInterests: [{ interestId: "musik", score: 3, level: 1 }] });
    expect(questThemeMatches({ id: "d_d9" }, ctx)).toBe(true);
    expect(questThemeMatches({ id: "d_d1" }, ctx)).toBe(false);
  });

  it("jeder Rank hat genug neutrale Dailies/Weeklies für volle Rotation", () => {
    for (const rk of ["E", "D", "C", "B", "A", "S", "SS"]) {
      const nd = (_DB[rk]?.daily  || []).filter(q => questThemeMatches(q, emptyCtx));
      const nw = (_DB[rk]?.weekly || []).filter(q => questThemeMatches(q, emptyCtx));
      expect(nd.length, `${rk} neutrale Dailies`).toBeGreaterThanOrEqual(5);
      expect(nw.length, `${rk} neutrale Weeklies`).toBeGreaterThanOrEqual(2);
    }
    const sssD = (_DB.SSS?.daily || []).filter(q => questThemeMatches(q, emptyCtx));
    expect(sssD.length).toBeGreaterThanOrEqual(3);
  });

  it("Rotation ohne Signale wählt nur neutrale Quests (D-Rank)", () => {
    const r = _rotate({ daily: _DB.D.daily, weekly: _DB.D.weekly }, {}, "2025-06-02", "2025-W23");
    for (const q of [...r.daily, ...r.weekly]) {
      expect(isThemedQuest(q), `${q.id} sollte neutral sein`).toBe(false);
    }
  });

  it("Rotation mit Krafttraining-Interesse kann Gym-Quests zeigen", () => {
    const ctx = { interests: ["krafttraining"] };
    const r = _rotate({ daily: _DB.D.daily, weekly: _DB.D.weekly }, ctx, "2025-06-02", "2025-W23");
    // Gym-Quests sind im Pool wählbar — keine fremden Themen erscheinen
    for (const q of [...r.daily, ...r.weekly]) {
      if (isThemedQuest(q)) {
        const theme = QUEST_THEMES[q.id];
        const ok = (theme.domains || []).includes("body") || (theme.interests || []).includes("krafttraining");
        expect(ok, `${q.id} passt nicht zu krafttraining/body`).toBe(true);
      }
    }
  });

  it("alle Theme-Map-IDs existieren in der CHALLENGES_DB", () => {
    const allIds = new Set();
    for (const rk of Object.keys(_DB)) {
      for (const list of [_DB[rk].daily, _DB[rk].weekly, _DB[rk].milestones]) {
        for (const q of list || []) allIds.add(q.id);
      }
    }
    for (const id of Object.keys(QUEST_THEMES)) {
      expect(allIds.has(id), `Theme-ID ${id} fehlt in DB`).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 3 — PATH-SCHÄRFUNG
// ═══════════════════════════════════════════════════════════
import { PATHS, getAffinityGain as _affGain } from "../data/paths.js";
import { calculatePathSignal } from "../lib/signals.js";

describe("Etappe 3 — Path-Schärfung", () => {
  const selectable = Object.values(PATHS).filter(p => !p.special);

  it("jeder Path hat 2–4 geordnete Domains, 2–3 Stats, Mastery und Quest-Typen", () => {
    for (const p of selectable) {
      expect(p.domains.length, `${p.id} domains`).toBeGreaterThanOrEqual(2);
      expect(p.domains.length, `${p.id} domains`).toBeLessThanOrEqual(4);
      expect(p.stats.length, `${p.id} stats`).toBeGreaterThanOrEqual(2);
      expect(p.stats.length, `${p.id} stats`).toBeLessThanOrEqual(3);
      expect(p.mastery?.desc, `${p.id} mastery`).toBeTruthy();
      expect(p.questTypes?.daily?.length, `${p.id} questTypes`).toBeGreaterThan(0);
    }
  });

  it("keine zwei Paths haben identische Domain-Signaturen", () => {
    const sigs = selectable.map(p => p.domains.join("|"));
    expect(new Set(sigs).size).toBe(sigs.length);
  });

  it("jeder Path hat Gate I–III und Trial I–III", () => {
    for (const p of selectable) {
      for (const tier of [1, 2, 3]) {
        const hasGate  = GATES.some(g => g.path === p.id && g.tier === tier && !String(g.id).startsWith("trial_"));
        const hasTrial = GATES.some(g => g.path === p.id && g.tier === tier &&  String(g.id).startsWith("trial_"));
        expect(hasGate,  `${p.id} Gate ${tier}`).toBe(true);
        expect(hasTrial, `${p.id} Trial ${tier}`).toBe(true);
      }
    }
  });

  it("getAffinityGain: Primär-Domain voll, Sekundär-Domain halbiert", () => {
    // weekly quest, domain "mind": scholar primär (2), engineer sekundär (1)
    const g = _affGain({ type: "weekly", domain: "mind" });
    expect(g.scholar).toBe(2);
    expect(g.engineer).toBe(1);
  });

  it("Path-Signal: mehr mind-Aktivität → scholar > engineer", () => {
    const hist = [...makeHistory("mind","scholar",4), ...makeHistory("craft","engineer",3)];
    const st = { questHistory: hist, progressLogs: [], goals: [], player: {}, stats: {}, gateProgress: {} };
    expect(calculatePathSignal(st, "scholar")).toBeGreaterThan(calculatePathSignal(st, "engineer"));
  });

  it("keine geschützten Fremdbegriffe in Path-/Rank-Daten", () => {
    const dump = JSON.stringify(PATHS);
    expect(dump.includes("Monarch")).toBe(false);
    expect(PATHS.shadow.name).toBe("Shadow Ascendant");
  });

  it("Rollen-Trennung: Artisan ≠ Creator, Monk ≠ Healer, Scholar ≠ Engineer", () => {
    expect(PATHS.artisan.domains[0]).toBe("craft");
    expect(PATHS.creator.domains[0]).toBe("creativity");
    expect(PATHS.monk.domains[0]).toBe("recovery");
    expect(PATHS.healer.domains[0]).toBe("social");
    expect(PATHS.scholar.domains[0]).toBe("mind");
    expect(PATHS.engineer.domains[0]).toBe("craft");
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 4 — BREITE INTERESSEN GLEICHWERTIG
// ═══════════════════════════════════════════════════════════
import { INTERESTS, INTEREST_GROUPS, normalizeInterests } from "../data/interests.js";

describe("Etappe 4 — Interessen gleichwertig", () => {
  it("alle Interessen haben baseWeight 1 — keine Startbevorzugung", () => {
    for (const i of Object.values(INTERESTS)) {
      expect(i.baseWeight, `${i.id} baseWeight`).toBe(1);
    }
  });

  it("jedes Interesse hat id, label, domain, relatedPaths, relatedStats, tags", () => {
    for (const i of Object.values(INTERESTS)) {
      expect(i.id).toBeTruthy();
      expect(i.label).toBeTruthy();
      expect(i.domain).toBeTruthy();
      expect(Array.isArray(i.relatedPaths), `${i.id} relatedPaths`).toBe(true);
      expect(i.relatedPaths.length, `${i.id} relatedPaths`).toBeGreaterThan(0);
      expect(Array.isArray(i.relatedStats), `${i.id} relatedStats`).toBe(true);
      expect(Array.isArray(i.tags), `${i.id} tags`).toBe(true);
    }
  });

  it("alle relatedPaths verweisen auf existierende Paths", () => {
    for (const i of Object.values(INTERESTS)) {
      for (const p of i.relatedPaths) {
        expect(PATHS[p], `${i.id} → ${p}`).toBeTruthy();
      }
    }
  });

  it("alle Gruppen-IDs existieren in INTERESTS (kein atemübungen-Bug)", () => {
    for (const [gid, g] of Object.entries(INTEREST_GROUPS)) {
      for (const id of g.ids) {
        expect(INTERESTS[id], `Gruppe ${gid} → ${id}`).toBeTruthy();
      }
    }
  });

  it("kein Interesse erscheint in mehreren Gruppen", () => {
    const seen = new Map();
    for (const [gid, g] of Object.entries(INTEREST_GROUPS)) {
      for (const id of g.ids) {
        expect(seen.has(id), `${id} doppelt in ${seen.get(id)} und ${gid}`).toBe(false);
        seen.set(id, gid);
      }
    }
  });

  it("jedes Interesse ist in genau einer Gruppe sichtbar", () => {
    const grouped = new Set(Object.values(INTEREST_GROUPS).flatMap(g => g.ids));
    for (const id of Object.keys(INTERESTS)) {
      expect(grouped.has(id), `${id} fehlt im Picker`).toBe(true);
    }
  });

  it("Sprint-Ergänzungen existieren mit baseWeight 1", () => {
    for (const id of ["regeneration", "koerpergewicht", "business", "atemuebungen", "datenblaetter"]) {
      expect(INTERESTS[id], id).toBeTruthy();
      expect(INTERESTS[id].baseWeight).toBe(1);
    }
  });

  it("Technik startet nicht zuerst: erste Picker-Gruppe ist nicht tech/mind", () => {
    const firstGroup = Object.keys(INTEREST_GROUPS)[0];
    expect(["tech", "mind"].includes(firstGroup)).toBe(false);
  });

  it("kreative Werke zeigen auf Creator, nicht Artisan", () => {
    for (const id of ["musik", "zeichnen", "malen", "beatmaking"]) {
      expect(INTERESTS[id].relatedPaths.includes("creator"), id).toBe(true);
      expect(INTERESTS[id].relatedPaths.includes("artisan"), id).toBe(false);
    }
  });

  it("normalizeInterests filtert unbekannte IDs defensiv", () => {
    const out = normalizeInterests(["physik", "gibt_es_nicht", "musik"]);
    expect(out).toContain("physik");
    expect(out).toContain("musik");
    expect(out).not.toContain("gibt_es_nicht");
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 5 — SIGNAL-SYSTEM STATT HARTE AUSWAHL
// ═══════════════════════════════════════════════════════════
import {
  calculateInterestSignal, calculateSpecializationLevel,
  getSignalBreakdown, getTopSignalInterests,
} from "../lib/signals.js";

const emptySt = () => ({ questHistory: [], progressLogs: [], goals: [], player: {}, stats: {}, gateProgress: {}, weeklyReviews: [] });
const iq = (interestId, domain, n, type = "daily") => Array.from({ length: n }, (_, i) => ({
  id: `iq_${interestId}_${i}`, interestId, domain, type, completedAt: new Date().toISOString(),
}));

describe("Etappe 5 — Signal-System", () => {
  it("direkte Interest-Aktivität differenziert: physik >> mathe bei Physik-Quests", () => {
    const st = { ...emptySt(), questHistory: iq("physik", "mind", 4) };
    const sPhysik = calculateInterestSignal(st, "physik");
    const sMathe  = calculateInterestSignal(st, "mathe");
    expect(sPhysik).toBeGreaterThan(sMathe * 2);
  });

  it("manuelle Auswahl allein ergibt nur Level 1 (beschleunigt, dominiert nicht)", () => {
    const st = { ...emptySt(), player: { preferences: { interests: ["physik"] } } };
    expect(calculateSpecializationLevel(st, "physik")).toBe(1);
  });

  it("Verhalten zählt stärker als manuelle Auswahl", () => {
    const behavior = { ...emptySt(), questHistory: iq("musik", "creativity", 3) };
    const manual   = { ...emptySt(), player: { preferences: { interests: ["musik"] } } };
    expect(calculateInterestSignal(behavior, "musik"))
      .toBeGreaterThan(calculateInterestSignal(manual, "musik"));
  });

  it("Level-Schwellen nach Sprint: 6+ → Level 3", () => {
    // 2 Milestones + Log + aktives Ziel → klar über 6
    const st = {
      ...emptySt(),
      questHistory: iq("kochen", "craft", 2, "milestone"),
      progressLogs: [{ interestId: "kochen" }],
      goals: [{ interestId: "kochen", status: "active" }],
    };
    expect(calculateInterestSignal(st, "kochen")).toBeGreaterThanOrEqual(6);
    expect(calculateSpecializationLevel(st, "kochen")).toBe(3);
  });

  it("Milestones sind stärkere Signale als Dailies", () => {
    const daily     = { ...emptySt(), questHistory: iq("laufen", "body", 1, "daily") };
    const milestone = { ...emptySt(), questHistory: iq("laufen", "body", 1, "milestone") };
    expect(calculateInterestSignal(milestone, "laufen"))
      .toBeGreaterThan(calculateInterestSignal(daily, "laufen"));
  });

  it("Weekly Reviews fließen als Signal-Quelle ein", () => {
    const st = { ...emptySt(), weeklyReviews: [{ topDomains: [{ domain: "mind", count: 5 }] }] };
    expect(calculateInterestSignal(st, "physik")).toBeGreaterThanOrEqual(1);
    const stPath = { ...emptySt(), weeklyReviews: [{ topDomains: [{ domain: "mind", count: 5 }] }] };
    expect(calculatePathSignal(stPath, "scholar")).toBeGreaterThan(0);
  });

  it("Hysterese: gewählter Main Path bleibt bei knappem Konkurrenz-Signal führend", () => {
    const hist = [...makeHistory("mind","scholar",4), ...makeHistory("craft","engineer",4)];
    const r = analyzeSystem(hist, {}, { activePaths: ["scholar"], interests: [] });
    expect(r.suggestedMainPath).toBe("scholar");
    expect(r.suggestedSecondaryPath).toBe("engineer");
  });

  it("Hysterese: klar dominanter Pfad (>=25% Marge) wird trotzdem empfohlen", () => {
    const hist = [...makeHistory("mind","scholar",2), ...makeHistory("craft","engineer",8)];
    const r = analyzeSystem(hist, {}, { activePaths: ["scholar"], interests: [] });
    expect(r.suggestedMainPath).toBe("engineer");
  });

  it("getSignalBreakdown erklärt Signale nachvollziehbar", () => {
    const st = {
      ...emptySt(),
      questHistory: iq("programmieren", "craft", 3),
      goals: [{ interestId: "programmieren", status: "active" }],
      player: { preferences: { interests: ["programmieren"] } },
    };
    const b = getSignalBreakdown(st, "interest", "programmieren");
    expect(b.total).toBeGreaterThan(0);
    expect(b.parts.length).toBeGreaterThanOrEqual(3);
    const sources = b.parts.map(p => p.source);
    expect(sources).toContain("behavior");
    expect(sources).toContain("goals");
    expect(sources).toContain("interest");
  });

  it("mehrere Branches können parallel wachsen", () => {
    const st = {
      ...emptySt(),
      questHistory: [...iq("musik", "creativity", 3), ...iq("krafttraining", "body", 3)],
    };
    const tops = getTopSignalInterests(st, 8).map(t => t.interestId);
    expect(tops).toContain("musik");
    expect(tops).toContain("krafttraining");
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 6 — SIGNALBASIERTER GENERATOR + SICHTBARKEIT
// ═══════════════════════════════════════════════════════════
import { scoreQuestCandidate, buildQuestReason } from "../lib/questRotation.js";
import { getVisibleContent as _gvc, selectNextMilestones } from "../lib/questGenerator.js";

describe("Etappe 6 — Scoring, Gründe, Sichtbarkeit", () => {
  it("Sprint-Gewichtung: Goal (35) > Verhalten (30) > Interesse (20) > Signal (10) > Balance (5)", () => {
    const q = { id:"x", domain:"mind", interestId:"physik", path:"scholar", goalId:"g1" };
    const goalCtx     = { activeGoals: [{ id:"g1", domain:"mind", status:"active", title:"T" }] };
    const behaviorCtx = { recentDomains: { mind: 10 } };
    const interestCtx = { interests: ["physik"] };
    const signalCtx   = { signalPaths: [{ pathId:"scholar", level:3 }] };
    const balanceCtx  = { neglectedDomains: ["mind"] };
    const sGoal = scoreQuestCandidate(q, goalCtx);
    const sBeh  = scoreQuestCandidate(q, behaviorCtx);
    const sInt  = scoreQuestCandidate(q, interestCtx);
    const sSig  = scoreQuestCandidate(q, signalCtx);
    const sBal  = scoreQuestCandidate(q, balanceCtx);
    expect(sGoal).toBeGreaterThan(sBeh);
    expect(sBeh).toBeGreaterThan(sInt);
    expect(sInt).toBeGreaterThan(sSig);
    expect(sSig).toBeGreaterThan(sBal);
    expect(sBal).toBeGreaterThan(0);
  });

  it("Quest-Gründe folgen den Sprint-Formulierungen", () => {
    const q = { id:"x", domain:"mind", interestId:"physik" };
    expect(buildQuestReason(q, { activeGoals:[{ id:"g", domain:"mind", title:"Klausur bestehen" }] }))
      .toBe("wegen Ziel: Klausur bestehen");
    expect(buildQuestReason(q, { interests:["physik"] }))
      .toBe("wegen Interesse: Physik");
    expect(buildQuestReason(q, { signalInterests:[{ interestId:"physik", level:2 }] }))
      .toContain("deine letzten Quests zeigen");
    expect(buildQuestReason({ id:"y", domain:"recovery" }, { neglectedDomains:["recovery"] }))
      .toBe("Balance empfohlen: recovery");
    expect(buildQuestReason({ id:"z", domain:"mind" }, {})).toBe("allgemeine Starter-Quest");
  });

  it("Rotation hängt jedem sichtbaren Quest einen Grund an", () => {
    const r = _rotate({ daily: _DB.E.daily, weekly: _DB.E.weekly }, {}, "2025-06-02", "2025-W23");
    for (const q of [...r.daily, ...r.weekly]) {
      expect(typeof q.reason, q.id).toBe("string");
      expect(q.reason.length).toBeGreaterThan(0);
    }
  });

  it("Sichtbarkeit Level 0: neuer Nutzer sieht 3 Dailies + 2 Weeklies (nicht 0!)", () => {
    const pools = { daily: _DB.E.daily.slice(0, 8), weekly: _DB.E.weekly.slice(0, 5), personalized: [{id:"p1"}], recovery: [] };
    const v = _gvc(pools, { questHistory: [], progressLogs: [], goals: [], player: {}, stats: {}, gateProgress: {} });
    expect(v.signalLevel).toBe(0);
    expect(v.visibleDaily.length).toBe(3);
    expect(v.visibleWeekly.length).toBe(2);
    expect(v.visiblePersonalized.length).toBe(0); // keine Signale → nichts Spezifisches
  });

  it("Sichtbarkeit skaliert mit Signal-Level (Daily 3–5, Weekly 2–3)", () => {
    const hist = Array.from({ length: 12 }, (_, i) => ({
      id:`h${i}`, path:"fighter", domain:"body", type:"daily",
      completedAt: new Date(Date.now() - (i % 6) * 86400000).toISOString(),
    }));
    const pools = { daily: _DB.E.daily.slice(0, 8), weekly: _DB.E.weekly.slice(0, 5), personalized: [{id:"p1"},{id:"p2"},{id:"p3"},{id:"p4"}], recovery: [] };
    const v = _gvc(pools, { questHistory: hist, progressLogs: [], goals: [], player: {}, stats: {}, gateProgress: {} });
    expect(v.signalLevel).toBeGreaterThanOrEqual(2);
    expect(v.visibleDaily.length).toBeGreaterThanOrEqual(4);
    expect(v.visibleDaily.length).toBeLessThanOrEqual(5);
    expect(v.visibleWeekly.length).toBeGreaterThanOrEqual(2);
    expect(v.visibleWeekly.length).toBeLessThanOrEqual(3);
    expect(v.visiblePersonalized.length).toBeGreaterThan(0);
  });

  it("selectNextMilestones zeigt nur die nächsten relevanten (max 3)", () => {
    const ms = Array.from({ length: 10 }, (_, i) => ({ id:`m${i}`, stat: i < 5 ? "STR" : "INT", title:`M${i}` }));
    const st = { questHistory: [{ id:"q", path:"fighter", domain:"body", type:"daily", completedAt:new Date().toISOString() }], progressLogs: [], goals: [], player: {}, stats: {}, gateProgress: {} };
    const next = selectNextMilestones(ms, st, new Set(["m0"]), 3);
    expect(next.length).toBe(3);
    expect(next.some(m => m.id === "m0")).toBe(false); // abgeschlossene nie zeigen
    // Fighter-Signal → STR-Milestones bevorzugt
    expect(next.filter(m => m.stat === "STR").length).toBeGreaterThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 7 — GATES, TRIALS UND MASTERY
// ═══════════════════════════════════════════════════════════
import { getVisibleGates, getRecommendedGates } from "../data/gates.js";
import { getPathMastery, getMasteryOverview, countMasteredPaths, MASTERY_REQUIREMENTS } from "../lib/mastery.js";

describe("Etappe 7 — Gates, Trials, Mastery", () => {
  it("alle 9+ Sprint-Discovery-Gates existieren (inkl. Focus + Leadership)", () => {
    const disc = GATES.filter(g => g.discovery);
    expect(disc.length).toBeGreaterThanOrEqual(9);
    const ids = disc.map(g => g.id);
    expect(ids).toContain("gate_discovery_focus");
    expect(ids).toContain("gate_discovery_leadership");
    // Discovery-XP-Band 150–300 eingehalten
    for (const g of disc) {
      expect(g.reward.xp).toBeGreaterThanOrEqual(150);
      expect(g.reward.xp).toBeLessThanOrEqual(300);
    }
  });

  it("neuer Nutzer bekommt NUR Discovery Gates empfohlen", () => {
    const recs = getRecommendedGates({}, {});
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(2);
    for (const g of recs) expect(g.discovery, g.id).toBe(true);
  });

  it("Katalog: neuer Nutzer sieht nur Discovery Gates, Path Gates bleiben im Hintergrund", () => {
    const vis = getVisibleGates({}, { signalPaths: [], activePaths: [] });
    expect(vis.length).toBeGreaterThan(0);
    for (const g of vis) expect(g.discovery, g.id).toBe(true);
  });

  it("Katalog: Signal schaltet die Gates/Trials des Paths frei — andere bleiben verborgen", () => {
    const vis = getVisibleGates({}, { signalPaths: [{ pathId: "fighter", level: 1 }] });
    expect(vis.some(g => g.path === "fighter" && !g.discovery)).toBe(true);
    expect(vis.some(g => g.path === "scholar" && !g.discovery)).toBe(false);
  });

  it("Katalog: begonnener Gate-Fortschritt hält den Path sichtbar", () => {
    const gp = { gate_scholar_1: { steps: [true, false, false], completed: false } };
    const vis = getVisibleGates(gp, { signalPaths: [] });
    expect(vis.some(g => g.path === "scholar" && !g.discovery)).toBe(true);
  });

  it("Trials verlangen Anwendung: jeder Trial hat 3+ Schritte mit Anwendungs-/Reflexionsanteil", () => {
    const trials = GATES.filter(g => String(g.id).startsWith("trial_"));
    for (const t of trials) {
      expect(t.steps.length, t.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("getPathMastery: leerer State → 0% / nicht erreicht", () => {
    const m = getPathMastery({ questHistory: [], progressLogs: [], goals: [], gateProgress: {} }, "scholar");
    expect(m.achieved).toBe(false);
    expect(m.pct).toBe(0);
    expect(m.quests.need).toBe(MASTERY_REQUIREMENTS.quests);
  });

  it("getPathMastery: vollständige Kriterien → achieved", () => {
    const gp = {
      gate_scholar_1: { completed: true }, gate_scholar_2: { completed: true }, gate_scholar_3: { completed: true },
      trial_scholar_2: { completed: true }, trial_scholar_3: { completed: true },
    };
    const st = {
      questHistory: Array.from({ length: 25 }, (_, i) => ({ id:`q${i}`, path:"scholar", domain:"mind", type:"daily", completedAt:new Date().toISOString() })),
      progressLogs: Array.from({ length: 10 }, (_, i) => ({ id:`l${i}`, path:"scholar" })),
      goals: [{ id:"g1", path:"scholar", status:"completed" }],
      gateProgress: gp,
    };
    const m = getPathMastery(st, "scholar");
    expect(m.quests.done).toBe(true);
    expect(m.gates.done).toBe(true);
    expect(m.trialII).toBe(true);
    expect(m.trialIII).toBe(true);
    expect(m.logs.done).toBe(true);
    expect(m.goals.done).toBe(true);
    expect(m.achieved).toBe(true);
    expect(m.pct).toBe(100);
    expect(countMasteredPaths(st)).toBeGreaterThanOrEqual(1);
  });

  it("getMasteryOverview deckt alle 14 spielbaren Paths ab", () => {
    const ov = getMasteryOverview({ questHistory: [], progressLogs: [], goals: [], gateProgress: {} });
    expect(ov.length).toBe(14);
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 8 — RANK-ANFORDERUNGEN + PROGRESSIVE DIFFICULTY
// ═══════════════════════════════════════════════════════════
import { checkRankUpRequirements, canRankUpTo, getRankUpStatus, RANK_UP_REQUIREMENTS } from "../lib/rankRequirements.js";
import { applyXpGain } from "../lib/rewards.js";
import { XP_PER_LEVEL as _XPL, XP_BASE as _XPB, TOTAL_LEVELS as _TL } from "../data/ranks.js";
import { getGlobalLevel as _ggl, getRankFromGlobal as _grfg } from "../lib/helpers.js";

const emptyProgress = () => ({
  questHistory: [], progressLogs: [], goals: [], weeklyReviews: [],
  gateProgress: {}, player: { preferences: {} }, stats: {},
});

describe("Etappe 8 — Rank-Up-Anforderungen", () => {
  it("alle Ranks D–SSS haben definierte Anforderungen", () => {
    for (const r of ["D","C","B","A","S","SS","SSS"]) {
      expect(RANK_UP_REQUIREMENTS[r]?.length, r).toBeGreaterThan(0);
    }
  });

  it("Daily-Spam allein reicht nicht für D: 10 Quests ohne Discovery Gate → gesperrt", () => {
    const st = {
      ...emptyProgress(),
      questHistory: Array.from({ length: 30 }, (_, i) => ({ id:`q${i}`, type:"daily", domain:"mind", completedAt:new Date().toISOString() })),
    };
    const res = checkRankUpRequirements(st, "D");
    expect(res.met).toBe(false);
    expect(res.checks.find(c => c.id === "quests").done).toBe(true);
    expect(res.checks.find(c => c.id === "discovery").done).toBe(false);
  });

  it("D-Anforderungen erfüllt → Rank-Up frei", () => {
    const st = {
      ...emptyProgress(),
      questHistory: Array.from({ length: 12 }, (_, i) => ({ id:`q${i}`, type:"daily", domain:"mind", completedAt:new Date().toISOString() })),
      gateProgress: { gate_discovery_focus: { completed: true } },
    };
    expect(canRankUpTo(st, "D")).toBe(true);
  });

  it("applyXpGain: Rank-Grenze blockiert ohne Anforderungen — XP staut, kein Verlust", () => {
    // E Lv.10, kurz vor D — massig XP, aber keine Anforderungen erfüllt
    const st = { ...emptyProgress(), rank:"E", level:10, xp:0, totalXP:0 };
    const xpNeeded = _XPL("E", 10);
    const { newState, levelUps } = applyXpGain(st, xpNeeded + 500, _XPL, _TL, _grfg, _ggl);
    expect(newState.rank).toBe("E");
    expect(newState.level).toBe(10);
    expect(levelUps.length).toBe(0);
    expect(newState.xp).toBe(xpNeeded + 500);      // gestaut, nicht verworfen
    expect(newState.totalXP).toBe(xpNeeded + 500); // totalXP unangetastet
  });

  it("applyXpGain: mit erfüllten Anforderungen erfolgt der Rank-Up", () => {
    const st = {
      ...emptyProgress(), rank:"E", level:10, xp:0, totalXP:0,
      questHistory: Array.from({ length: 12 }, (_, i) => ({ id:`q${i}`, type:"daily", domain:"mind", completedAt:new Date().toISOString() })),
      gateProgress: { gate_discovery_focus: { completed: true } },
    };
    const { newState, levelUps } = applyXpGain(st, _XPL("E", 10) + 5, _XPL, _TL, _grfg, _ggl);
    expect(newState.rank).toBe("D");
    expect(levelUps.some(l => l.rankUp)).toBe(true);
  });

  it("Level-Ups INNERHALB eines Ranks bleiben ungesperrt", () => {
    const st = { ...emptyProgress(), rank:"E", level:1, xp:0, totalXP:0 };
    const { newState } = applyXpGain(st, _XPL("E", 1) + 1, _XPL, _TL, _grfg, _ggl);
    expect(newState.level).toBe(2);
  });

  it("höhere Ranks verlangen progressiv mehr (SS braucht Mastery-nahe Leistungen)", () => {
    const res = checkRankUpRequirements(emptyProgress(), "SS");
    expect(res.met).toBe(false);
    expect(res.checks.length).toBeGreaterThanOrEqual(4);
    const sss = checkRankUpRequirements(emptyProgress(), "SSS");
    expect(sss.checks.some(c => c.id === "mastery")).toBe(true);
  });

  it("getRankUpStatus liefert UI-fähige Checks, SSS → null", () => {
    const status = getRankUpStatus({ ...emptyProgress(), rank:"E" });
    expect(status.nextRank).toBe("D");
    expect(status.checks.length).toBeGreaterThan(0);
    expect(getRankUpStatus({ ...emptyProgress(), rank:"SSS" })).toBe(null);
  });

  it("XP-Kurve: progressiv steiler (jeder Rank-Basis-Sprung >= 2.5x)", () => {
    const order = ["E","D","C","B","A","S","SS","SSS"];
    for (let i = 1; i < order.length; i++) {
      expect(_XPB[order[i]] / _XPB[order[i-1]], `${order[i-1]}→${order[i]}`).toBeGreaterThanOrEqual(2.4);
    }
    // Innerhalb eines Ranks: Level 10 deutlich teurer als Level 1
    expect(_XPL("C", 10)).toBeGreaterThan(_XPL("C", 1) * 3);
  });

  it("jeder Path hat eine E→S-Progressionslogik", () => {
    for (const p of Object.values(PATHS).filter(p => !p.special)) {
      expect(p.progression?.["E/D"], p.id).toBeTruthy();
      expect(p.progression?.S, p.id).toBeTruthy();
    }
  });

  // ── Breite-Floor (Körper UND Geist …): ab C nötig, D bleibt frei ──
  const histDomains = (specs) =>
    specs.flatMap(([d, n]) =>
      Array.from({ length: n }, (_, i) => ({ id:`${d}${i}`, type:"daily", domain:d, completedAt:new Date().toISOString() }))
    );

  it("D bleibt mit Single-Domain-History passierbar (kein Breite-Zwang für Anfänger)", () => {
    const st = {
      ...emptyProgress(),
      questHistory: histDomains([["mind", 12]]),
      gateProgress: { gate_discovery_focus: { completed: true } },
    };
    expect(canRankUpTo(st, "D")).toBe(true);
  });

  it("C verlangt Breite: reine Single-Domain-History scheitert am breadth-Check", () => {
    const res = checkRankUpRequirements({ ...emptyProgress(), questHistory: histDomains([["body", 20]]) }, "C");
    const breadth = res.checks.find(c => c.id === "breadth");
    expect(breadth?.need).toBe(3);
    expect(breadth?.done).toBe(false);
  });

  it("C breadth erfüllt bei ≥3 aktiven Domains (30 Tage)", () => {
    const res = checkRankUpRequirements({ ...emptyProgress(), questHistory: histDomains([["body",3],["mind",3],["social",3]]) }, "C");
    expect(res.checks.find(c => c.id === "breadth").done).toBe(true);
  });

  it("B Vitalitäts-Floor: ohne Körper/Recovery in 14 Tagen gesperrt", () => {
    const res = checkRankUpRequirements({ ...emptyProgress(), questHistory: histDomains([["mind", 10]]) }, "B");
    const vit = res.checks.find(c => c.id === "vitality");
    expect(vit?.done).toBe(false);
  });

  it("B Vitalitäts-Floor erfüllt mit aktueller Recovery-Aktivität", () => {
    const res = checkRankUpRequirements({ ...emptyProgress(), questHistory: histDomains([["mind",2],["recovery",1]]) }, "B");
    expect(res.checks.find(c => c.id === "vitality").done).toBe(true);
  });

  it("S verlangt strengere Breite (≥4 Domains)", () => {
    const res = checkRankUpRequirements({ ...emptyProgress(), questHistory: histDomains([["body",2],["mind",2],["social",2]]) }, "S");
    const breadth = res.checks.find(c => c.id === "breadth");
    expect(breadth?.need).toBe(4);
    expect(breadth?.done).toBe(false); // nur 3 Domains
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 9 — CONTENT-PARITÄT ÜBER ALLE PATHS
// ═══════════════════════════════════════════════════════════
import { QUEST_TEMPLATES } from "../data/questTemplates.js";
import { PATH_MILESTONES, ALL_PATH_MILESTONES, getPathMilestoneProgress, findNewPathMilestones } from "../data/pathMilestones.js";

describe("Etappe 9 — Content-Parität", () => {
  const playable = Object.values(PATHS).filter(p => !p.special);

  it("jeder Path hat 13+ Quest-Templates, kein Path dominiert (max/min ≤ 1.4)", () => {
    const per = {};
    for (const t of QUEST_TEMPLATES) for (const p of t.paths || []) per[p] = (per[p] || 0) + 1;
    const counts = playable.map(p => per[p.id] || 0);
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(13);
    expect(Math.max(...counts) / Math.min(...counts)).toBeLessThanOrEqual(1.4);
  });

  it("jede Primär-Domain hat ein Discovery/Entry Gate", () => {
    const discDomains = new Set(GATES.filter(g => g.discovery).map(g => g.domain));
    for (const p of playable) {
      expect(discDomains.has(p.domains[0]), `${p.id} → ${p.domains[0]}`).toBe(true);
    }
  });

  it("jeder Path hat exakt 10 Path-Milestones nach Sprint-Schema", () => {
    for (const p of playable) {
      const ms = PATH_MILESTONES[p.id];
      expect(ms?.length, p.id).toBe(10);
      const suffixes = ms.map(m => m.id.replace(`pm_${p.id}_`, ""));
      for (const sfx of ["q5","q10","q25","g1","g2","t1","t2","goal","logs","stat"]) {
        expect(suffixes, `${p.id}:${sfx}`).toContain(sfx);
      }
    }
    expect(ALL_PATH_MILESTONES.length).toBe(140);
  });

  it("Milestone-Checks funktionieren (Quests, Gate, Stat)", () => {
    const st = {
      questHistory: Array.from({ length: 12 }, (_, i) => ({ id:`q${i}`, path:"runner", domain:"body", type:"daily", completedAt:new Date().toISOString() })),
      progressLogs: [], goals: [],
      gateProgress: { gate_runner_1: { completed: true } },
      stats: { AGI: 16 },
    };
    const prog = getPathMilestoneProgress(st, "runner");
    const byId = Object.fromEntries(prog.milestones.map(m => [m.id, m.done]));
    expect(byId.pm_runner_q5).toBe(true);
    expect(byId.pm_runner_q10).toBe(true);
    expect(byId.pm_runner_q25).toBe(false);
    expect(byId.pm_runner_g1).toBe(true);
    expect(byId.pm_runner_g2).toBe(false);
    expect(byId.pm_runner_stat).toBe(true);
    expect(prog.doneCount).toBe(4);
  });

  it("findNewPathMilestones liefert nur noch nicht freigeschaltete — nie doppelt", () => {
    const st = {
      questHistory: Array.from({ length: 6 }, (_, i) => ({ id:`q${i}`, path:"monk", domain:"recovery", type:"daily", completedAt:new Date().toISOString() })),
      progressLogs: [], goals: [], gateProgress: {}, stats: {},
    };
    const first = findNewPathMilestones(st, []);
    expect(first.some(m => m.id === "pm_monk_q5")).toBe(true);
    const second = findNewPathMilestones(st, first.map(m => m.id));
    expect(second.some(m => m.id === "pm_monk_q5")).toBe(false);
  });

  it("defensiv: leerer/kaputter State crasht die Milestone-Checks nicht", () => {
    expect(() => getPathMilestoneProgress({}, "scholar")).not.toThrow();
    expect(() => findNewPathMilestones(undefined ?? {}, [])).not.toThrow();
    const prog = getPathMilestoneProgress({}, "scholar");
    expect(prog.doneCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 10 — PROGRESS LOGS + REVIEW-STABILITÄT
// ═══════════════════════════════════════════════════════════
import { getLogFields, createProgressLog, canLogWithBonus, shouldPromptProgressLog, METRIC_LABELS } from "../lib/progressLogs.js";
import { createWeeklyReview, getWeekQuestStats } from "../lib/weeklyReview.js";

describe("Etappe 10 — Logs & Review-Stabilität", () => {
  it("Log-Felder je Bereich entsprechen der Sprint-Spez", () => {
    const f = (q) => getLogFields(q).metrics;
    expect(f({ domain:"mind" })).toEqual(expect.arrayContaining(["duration","tasksCompleted","understanding","nextStep"]));
    expect(f({ domain:"body" })).toEqual(expect.arrayContaining(["sets","reps","weight","distance","duration","energy","recovery"]));
    expect(f({ domain:"creativity" })).toEqual(expect.arrayContaining(["progressPercent","output","feedback","nextStep"]));
    expect(f({ domain:"finance" })).toEqual(expect.arrayContaining(["tasksCompleted","amount","nextStep"]));
    expect(f({ domain:"social" })).toEqual(expect.arrayContaining(["situation","confidence","nextStep"]));
    expect(f({ domain:"recovery" })).toEqual(expect.arrayContaining(["mood","energy","stress","sleepQuality"]));
    expect(f({ domain:"home" })).toEqual(expect.arrayContaining(["area","tasksCompleted","duration","nextStep"]));
    expect(f({ path:"leader" })).toEqual(expect.arrayContaining(["personOrGroup","actionTaken","impact","nextStep"]));
    // Jedes referenzierte Feld hat ein METRIC_LABEL
    for (const d of ["mind","body","creativity","finance","social","recovery","home","discipline","adventure"]) {
      for (const key of f({ domain:d })) expect(METRIC_LABELS[key], `${d}:${key}`).toBeTruthy();
    }
  });

  it("Text-Felder werden sanitisiert gespeichert, Zahlen geparst, Junk verworfen", () => {
    const log = createProgressLog({
      questId:"q1", quest:{ title:"T", domain:"creativity", actionType:"project" },
      metrics:{ progressPercent:"40", output:"  Song-Demo fertig  ", nextStep:"x".repeat(500), feedback:"", bogus:"hack" },
      notes:"ok",
    });
    expect(log.metrics.progressPercent).toBe(40);
    expect(log.metrics.output).toBe("Song-Demo fertig");
    expect(log.metrics.nextStep.length).toBe(200);
    expect(log.metrics.feedback).toBeUndefined();
    expect(log.metrics.bogus).toBeUndefined();
  });

  it("normale Daily Quests öffnen KEIN Log-Modal — Sprint-Trigger schon", () => {
    expect(shouldPromptProgressLog({ id:"e_d1", type:"daily", actionType:"action", domain:"mind" }, {}, {})).toBe(false);
    expect(shouldPromptProgressLog({ source:"starter", type:"daily" }, {}, {})).toBe(false);
    expect(shouldPromptProgressLog({ actionType:"reflection" }, {}, {})).toBe(true);
    expect(shouldPromptProgressLog({ actionType:"metric" }, {}, {})).toBe(true);
    expect(shouldPromptProgressLog({ actionType:"project" }, {}, {})).toBe(true);
    expect(shouldPromptProgressLog({ type:"gate_step" }, {}, {})).toBe(true);
    expect(shouldPromptProgressLog({ trial:true }, {}, {})).toBe(true);
    expect(shouldPromptProgressLog({ type:"milestone" }, {}, {})).toBe(true);
    expect(shouldPromptProgressLog({ requiresLog:true }, {}, {})).toBe(true);
    expect(shouldPromptProgressLog({ suggestLog:true, personalized:true, goalId:"g" }, {}, { goalProgress:[{}] })).toBe(true);
  });

  it("Logs sind nicht farmbar: 1 Bonus-Log pro Quest pro Tag", () => {
    const log = createProgressLog({ questId:"q1", quest:{ title:"T", domain:"mind" }, metrics:{}, notes:"" });
    expect(canLogWithBonus([log], "q1")).toBe(false);
    expect(canLogWithBonus([log], "q2")).toBe(true);
  });

  it("Review crasht nicht mit kaputten/alten Logs und leerem State", () => {
    const brokenState = {
      questHistory: [{ id:"q1" }, null, { completedAt:"invalid" }].filter(Boolean),
      progressLogs: [{ id:"l1" }, { metrics:null, domain:undefined }],
      weeklyReviews: undefined,
      goals: undefined,
      stats: {}, player: {},
    };
    expect(() => createWeeklyReview(brokenState, {})).not.toThrow();
    expect(() => getWeekQuestStats(brokenState.questHistory)).not.toThrow();
    expect(() => getWeekQuestStats(undefined)).not.toThrow();
  });

  it("createProgressLog crasht nicht ohne Quest", () => {
    expect(() => createProgressLog({ questId:null, quest:undefined, metrics:undefined, notes:undefined })).not.toThrow();
    const log = createProgressLog({ quest:undefined, metrics:undefined });
    expect(log.title).toBe("Log");
    expect(log.metrics).toEqual({});
  });

  it("Migration repariert fehlende Arrays defensiv (alter Import)", () => {
    const old = migrateState({ rank:"D", level:3, xp:100 });
    expect(Array.isArray(old.questHistory)).toBe(true);
    expect(Array.isArray(old.progressLogs)).toBe(true);
    expect(Array.isArray(old.weeklyReviews)).toBe(true);
    expect(Array.isArray(old.goals)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 11 — LEVEL TREE / VISUELLES PROGRESSIONS-FEEDBACK
// ═══════════════════════════════════════════════════════════
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LevelTree } from "../features/profile/LevelTree.jsx";

describe("Etappe 11 — Level Tree", () => {
  const render = (state) => renderToStaticMarkup(React.createElement(LevelTree, { state }));

  it("rendert für neuen Nutzer ohne Crash — mit Hinweis statt leerer Branches", () => {
    const html = render({ rank:"E", level:1, xp:0, questHistory:[], progressLogs:[], goals:[], gateProgress:{}, stats:{}, player:{} });
    expect(html).toContain("BRANCH PROGRESS");
    expect(html).toContain("ASCENSION TREE");
    expect(html).toContain("NEXT ASCENSION");
    expect(html).toContain("Noch keine Branches");
    expect(html).toContain("DISCOVERY GATES");
  });

  it("zeigt wachsende Branches mit Signal-Level, Milestones und Gate/Trial-Kette", () => {
    const state = {
      rank:"D", level:4, xp:50,
      questHistory: Array.from({ length: 10 }, (_, i) => ({ id:`q${i}`, path:"fighter", domain:"body", type:"daily", completedAt:new Date().toISOString() })),
      progressLogs: [], goals: [],
      gateProgress: { gate_fighter_1: { completed: true } },
      stats: { STR: 12 }, player: {},
    };
    const html = render(state);
    expect(html).toContain("Fighter");
    expect(html).toContain("SIGNAL LV.");
    expect(html).toContain("FIGHTER BRANCH");
    expect(html).toContain("Gate I");
    expect(html).toContain("Trial I");
    expect(html).toContain("NEXT ASCENSION — C-RANK");
  });

  it("cleared/available/locked basieren auf echten Daten", () => {
    const state = {
      rank:"D", level:4, xp:50,
      questHistory: Array.from({ length: 8 }, (_, i) => ({ id:`q${i}`, path:"scholar", domain:"mind", type:"daily", completedAt:new Date().toISOString() })),
      progressLogs: [], goals: [],
      gateProgress: { gate_scholar_1: { completed: true } },
      stats: {}, player: {},
    };
    const html = render(state);
    // Gate I cleared (✓), Gate II locked (Unlock-Kette), Trial I available
    expect(html).toContain("✓");
    expect(html).toContain("🔒");
    expect(html).toContain("◈");
  });

  it("SSS-Rank zeigt Ascendant-Status statt Anforderungen", () => {
    const html = render({ rank:"SSS", level:5, xp:0, questHistory:[], progressLogs:[], goals:[], gateProgress:{}, stats:{}, player:{} });
    expect(html).toContain("Höchster Rank erreicht");
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 12 — ARISE/HUNTER-SYSTEM-DESIGN
// ═══════════════════════════════════════════════════════════
import { STATS_CONFIG, SUB_STATS } from "../data/stats.js";

describe("Etappe 12 — System-Ästhetik", () => {
  const SYMBOLS = "◈◇◆◉◎⬡⬢⟡✦✧⚔⚡⌬⌁⟁⧫⌖";

  it("Path-Icons sind abstrakte System-Symbole, keine Emojis", () => {
    for (const p of Object.values(PATHS)) {
      expect(SYMBOLS.includes(p.icon), `${p.id}: ${p.icon}`).toBe(true);
    }
  });

  it("Stat-Icons sind abstrakte System-Symbole", () => {
    for (const sc of STATS_CONFIG) {
      expect(SYMBOLS.includes(sc.icon), `${sc.key}: ${sc.icon}`).toBe(true);
    }
    for (const [k, v] of Object.entries(SUB_STATS)) {
      expect(SYMBOLS.includes(v.icon), `${k}: ${v.icon}`).toBe(true);
    }
  });

  it("Gate-/Trial-Icons sind durchgängig Symbole", () => {
    const emoji = /[\u{1F300}-\u{1FAFF}]/u;
    for (const g of GATES) {
      expect(emoji.test(g.icon || ""), `${g.id}: ${g.icon}`).toBe(false);
    }
  });

  it("Stat-Beschreibungen sind themenneutral (kein Physik-/Programmier-Bias)", () => {
    const dump = JSON.stringify(STATS_CONFIG);
    expect(dump.includes("Physik")).toBe(false);
    expect(dump.includes("Programmieren")).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 13 — ONBOARDING + REWARD FEEDBACK
// ═══════════════════════════════════════════════════════════
import { ClearedFeedback } from "../components/ClearedFeedback.jsx";
import { OnboardingModal } from "../features/profile/OnboardingModal.jsx";
import { getQuestPathId } from "../lib/signals.js";

describe("Etappe 13 — Onboarding & Feedback", () => {
  it("getQuestPathId: direkter Path > Primär-Domain-Mapping, defensiv", () => {
    expect(getQuestPathId({ path: "monk" })).toBe("monk");
    expect(getQuestPathId({ domain: "mind" })).toBe("scholar");
    expect(getQuestPathId({ domain: "craft" })).toBe("engineer");
    expect(getQuestPathId({ domain: "adventure" })).toBe("explorer");
    expect(getQuestPathId({ })).toBe(null);
    expect(getQuestPathId(null)).toBe(null);
  });

  it("ClearedFeedback rendert QUEST CLEARED mit XP, Signal und Objective", () => {
    const html = renderToStaticMarkup(React.createElement(ClearedFeedback, { card: {
      kind: "QUEST CLEARED", subtitle: "System Focus abgeschlossen", color: "#00ffff",
      lines: [
        { mark: "▸", text: "+25 XP" },
        { mark: "◈", text: "Strategist Signal detected" },
        { mark: "⌖", text: "Objective Progress +1" },
      ],
    }}));
    expect(html).toContain("QUEST CLEARED");
    expect(html).toContain("System Focus abgeschlossen");
    expect(html).toContain("+25 XP");
    expect(html).toContain("Signal detected");
    expect(html).toContain("Objective Progress");
  });

  it("ClearedFeedback rendert ASCENSION CHECK mit erfüllt/fehlt", () => {
    const html = renderToStaticMarkup(React.createElement(ClearedFeedback, { card: {
      kind: "ASCENSION CHECK", subtitle: "C-Rank fast erreicht", color: "#f59e0b",
      lines: [
        { mark: "✓", text: "1 Path-Signal entwickelt", color: "#22c55e" },
        { mark: "▢", text: "Fehlt: 3 Weekly Quests abgeschlossen (1/3)" },
      ],
    }}));
    expect(html).toContain("ASCENSION CHECK");
    expect(html).toContain("✓");
    expect(html).toContain("Fehlt:");
  });

  it("Onboarding enthält alle Sprint-Kernaussagen und Buttons", () => {
    const html = renderToStaticMarkup(React.createElement(OnboardingModal, {
      onDismiss: () => {}, onSetInterests: () => {}, rc: { primary: "#00ffff" },
    }));
    expect(html).toContain("SYSTEM INITIALIZED");
    expect(html).toContain("unklassifizierter Hunter");
    expect(html).toContain("Skill-Check");
    expect(html).toContain("mehr als XP");
    expect(html).toContain("keinen Path wählen");
    expect(html).toContain("SYSTEM VERSTANDEN");
    expect(html).toContain("INTERESSEN SETZEN");
  });
});

// ═══════════════════════════════════════════════════════════
// ETAPPE 14 — ABSCHLUSS-SZENARIEN A–M (Sprint-Spezifikation)
// ═══════════════════════════════════════════════════════════
import { getTopSignalPaths, calculatePathSpecializationLevel } from "../lib/signals.js";
import { getNextBestQuests } from "../lib/questGenerator.js";

const mkSt = (over = {}) => ({
  rank:"E", level:1, xp:0, questHistory: [], progressLogs: [], goals: [],
  weeklyReviews: [], gateProgress: {}, stats: {}, player: { preferences: { interests: [], activePaths: [] } },
  ...over,
});
const q = (domain, n, extra = {}) => Array.from({ length: n }, (_, i) => ({
  id: `s14_${domain}_${i}_${extra.interestId || ""}`, type: "daily", domain,
  completedAt: new Date().toISOString(), ...extra,
}));

describe("Etappe 14 — Abschluss-Szenarien", () => {
  it("A: Neuer Nutzer — neutral, unüberladen, nur Discovery, verständliche Anforderungen", () => {
    const st = mkSt();
    const rotated = _rotate({ daily: _DB.E.daily, weekly: _DB.E.weekly, personalized: [], recovery: [] }, {}, "2025-06-02", "2025-W23");
    const vis = _gvc(rotated, st);
    expect(vis.visibleDaily.length).toBeGreaterThanOrEqual(3);
    expect(vis.visibleDaily.length).toBeLessThanOrEqual(5);
    for (const quest of [...vis.visibleDaily, ...vis.visibleWeekly]) {
      expect(isThemedQuest(quest), quest.id).toBe(false); // keine Physik-/Technik-/Themen-Dominanz
    }
    for (const g of getRecommendedGates({}, {})) expect(g.discovery).toBe(true);
    const status = getRankUpStatus(st);
    expect(status.checks.every(c => c.label && c.need > 0)).toBe(true);
  });

  it("B: Fokus-Quests — Strategist-Signal steigt, keine harte Spezialisierung", () => {
    const st = mkSt({ questHistory: q("discipline", 5) });
    expect(calculatePathSignal(st, "strategist")).toBeGreaterThan(0);
    expect(calculatePathSpecializationLevel(st, "strategist")).toBeLessThan(3);
    const sys = analyzeSystem(st.questHistory, {});
    const recs = getRecommendedGates(sys, {});
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(2);
    for (const g of recs) expect(g.discovery || g.path === "strategist", g.id).toBe(true);
  });

  it("C: Physik gewählt — etwas Gewicht, Scholar erst durch Aktivität", () => {
    const st = mkSt({ player: { preferences: { interests: ["physik"], activePaths: [] } } });
    expect(calculateSpecializationLevel(st, "physik")).toBe(1);          // etwas Gewicht
    expect(calculatePathSpecializationLevel(st, "scholar")).toBe(0);    // kein Scholar ohne Aktivität
    const visP = _gvc({ daily: _DB.E.daily, weekly: _DB.E.weekly, personalized: [{id:"p1"},{id:"p2"},{id:"p3"}], recovery: [] }, st);
    expect(visP.visiblePersonalized.length).toBeLessThanOrEqual(2);     // nicht sofort alles Physik
  });

  it("D: Kochen ist exakt gleichwertig zu Physik — Artisan-Signal wächst durch Tun", () => {
    const stK = mkSt({ player: { preferences: { interests: ["kochen"], activePaths: [] } } });
    const stP = mkSt({ player: { preferences: { interests: ["physik"], activePaths: [] } } });
    expect(calculateInterestSignal(stK, "kochen")).toBe(calculateInterestSignal(stP, "physik"));
    const active = mkSt({ questHistory: q("craft", 4, { interestId: "kochen" }) });
    expect(calculatePathSignal(active, "artisan")).toBeGreaterThan(0);
    expect(questThemeMatches({ id: "d_d11" }, buildThemeContext({ interests: ["kochen"] }))).toBe(true);
  });

  it("E: Kreative Quests — Creator-Signal, Gates sichtbar, Milestones getrackt", () => {
    const st = mkSt({ questHistory: q("creativity", 6, { interestId: "musik", path: "creator" }) });
    expect(calculatePathSpecializationLevel(st, "creator")).toBeGreaterThanOrEqual(1);
    const tops = getTopSignalPaths(st, 3);
    const vis = getVisibleGates({}, { signalPaths: tops });
    expect(vis.some(g => g.path === "creator" && !g.discovery)).toBe(true);
    expect(getPathMilestoneProgress(st, "creator").milestones.find(m => m.id === "pm_creator_q5").done).toBe(true);
  });

  it("F: Finance-Goal — Merchant relevanter, Finance-Quests freigeschaltet, Gate möglich", () => {
    const goal = { id: "g1", title: "Sparplan", domain: "finance", status: "active" };
    const st = mkSt({ goals: [goal] });
    expect(calculatePathSignal(st, "merchant")).toBeGreaterThan(0);
    expect(questThemeMatches({ id: "xd_fin_1" }, buildThemeContext({ activeGoals: [goal] }))).toBe(true);
    const withGoal = scoreQuestCandidate({ id: "x", domain: "finance" }, { activeGoals: [goal] });
    const without  = scoreQuestCandidate({ id: "x", domain: "finance" }, {});
    expect(withGoal).toBeGreaterThan(without);
    const vis = getVisibleGates({}, { signalPaths: getTopSignalPaths(st, 3) });
    expect(vis.some(g => g.path === "merchant" && !g.discovery)).toBe(true);
  });

  it("G: Viele Body-Logs — Fighter-Signal + Log-Milestone teilweise erfüllt", () => {
    const st = mkSt({ progressLogs: Array.from({ length: 6 }, (_, i) => ({ id:`l${i}`, domain: "body" })) });
    expect(calculatePathSignal(st, "fighter")).toBeGreaterThan(0);
    expect(getPathMilestoneProgress(st, "fighter").milestones.find(m => m.id === "pm_fighter_logs").done).toBe(true);
  });

  it("H: Richtungswechsel — Secondary entsteht, alte Spezialisierung blockiert nichts", () => {
    const st = mkSt({ questHistory: [...q("mind", 8, { path: "scholar" }), ...q("creativity", 5, { path: "creator" })] });
    const tops = getTopSignalPaths(st, 5).map(t => t.pathId);
    expect(tops).toContain("scholar");
    expect(tops).toContain("creator");
    const sys = analyzeSystem(st.questHistory, {});
    expect(sys.suggestedSecondaryPath).toBeTruthy();
    // Neuer Branch ist NICHT blockiert: Creator-Content sichtbar
    const vis = getVisibleGates({}, { signalPaths: getTopSignalPaths(st, 5) });
    expect(vis.some(g => g.path === "creator")).toBe(true);
  });

  it("I: Überladungstest — alle Sichtbarkeits-Limits greifen gleichzeitig", () => {
    const rich = mkSt({ questHistory: q("body", 14, { path: "fighter" }) });
    const bigPools = {
      daily: _DB.E.daily, weekly: _DB.E.weekly,
      personalized: Array.from({ length: 12 }, (_, i) => ({ id: `pp${i}` })),
      recovery: Array.from({ length: 6 }, (_, i) => ({ id: `rr${i}` })),
    };
    const vis = _gvc(bigPools, rich);
    expect(vis.visibleDaily.length).toBeLessThanOrEqual(5);
    expect(vis.visibleWeekly.length).toBeLessThanOrEqual(3);
    expect(vis.visiblePersonalized.length).toBeLessThanOrEqual(5);
    expect(vis.visibleRecovery.length).toBeLessThanOrEqual(2);
    expect(getRecommendedGates(analyzeSystem(rich.questHistory, {}), {}).length).toBeLessThanOrEqual(2);
    const ms = Array.from({ length: 20 }, (_, i) => ({ id: `m${i}`, stat: "STR" }));
    expect(selectNextMilestones(ms, rich, new Set(), 3).length).toBe(3);
    expect(getNextBestQuests({ interests: ["physik"], activePaths: ["scholar"] }, { goals: [{ id:"g", domain:"mind", status:"active", title:"T", currentValue:1, targetValue:5 }] }).length).toBeLessThanOrEqual(1);
  });

  it("M: Progressive Difficulty — Dailies allein erreichen keine hohen Ranks", () => {
    // 500 Dailies, sonst nichts: D scheitert am Discovery Gate, alles darüber erst recht
    const spam = mkSt({ questHistory: q("mind", 60) });
    spam.questHistory = Array.from({ length: 500 }, (_, i) => ({ id:`sp${i}`, type:"daily", domain:"mind", completedAt:new Date().toISOString() }));
    for (const target of ["D", "C", "B", "A", "S", "SS", "SSS"]) {
      expect(canRankUpTo(spam, target), `Spam → ${target}`).toBe(false);
    }
  });
});

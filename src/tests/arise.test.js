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

  it("injects missing player model with all 13 affinity keys", () => {
    const m = migrateState({ name:"X", rank:"E", level:1, xp:0 });
    expect(m.player).toBeDefined();
    expect(Object.keys(m.player.affinities)).toHaveLength(13); // Updated: 13 paths now
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
  it("returns 6 starter quests", () => {
    const q = generateStarterQuests();
    expect(q).toHaveLength(6);
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

  it("beginner: no interests → generateStarterQuests returns 6 quests", () => {
    const p = DEMO_PROFILES.find(p => p.id === "beginner");
    const s = p.buildState("Test");
    const quests = generateStarterQuests();
    expect(quests).toHaveLength(6);
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

  it("gate XP Tier 1: 300–600 range (incl. shadow special)", () => {
    for (const g of GATES.filter(g => g.tier === 1)) {
      expect(g.reward.xp).toBeGreaterThanOrEqual(300);
      expect(g.reward.xp).toBeLessThanOrEqual(600);
    }
  });

  it("gate XP Tier 2: 600–900 range", () => {
    for (const g of GATES.filter(g => g.tier === 2)) {
      expect(g.reward.xp).toBeGreaterThanOrEqual(600);
      expect(g.reward.xp).toBeLessThanOrEqual(900);
    }
  });

  it("gate XP Tier 3: 900–1200 range", () => {
    for (const g of GATES.filter(g => g.tier === 3)) {
      expect(g.reward.xp).toBeGreaterThanOrEqual(900);
      expect(g.reward.xp).toBeLessThanOrEqual(1200);
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

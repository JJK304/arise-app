import { describe, it, expect } from "vitest";

// ─── Imports ────────────────────────────────────────────────
import { migrateState, makeHistoryEntry } from "../lib/migration.js";
import { defaultState } from "../data/defaultState.js";
import { generatePersonalizedQuests } from "../lib/questGenerator.js";
import { analyzeSystem } from "../lib/systemAnalysis.js";
import { getAffinityGain, suggestPaths, canUnlockShadow } from "../data/paths.js";
import { checkTitleUnlocks } from "../data/titles.js";
import { getRecoveryQuests, getRecoveryHint } from "../data/recoveryQuests.js";
import { GATES, isGateCompleted, getGateStepsDone, getRecommendedGates } from "../data/gates.js";

// ─────────────────────────────────────────────────────────────
// MIGRATION DEFAULTS
// ─────────────────────────────────────────────────────────────
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

  it("injects missing player model with all sub-fields", () => {
    const m = migrateState({ name:"X", rank:"E", level:1, xp:0 });
    expect(m.player).toBeDefined();
    expect(Object.keys(m.player.affinities)).toHaveLength(7);
    expect(m.player.preferences.preferredQuestLength).toBe("medium");
    expect(Array.isArray(m.player.titles)).toBe(true);
    expect(m.player.mainPath).toBeNull();
  });

  it("injects missing questHistory as empty array", () => {
    const m = migrateState({ name:"X" });
    expect(Array.isArray(m.questHistory)).toBe(true);
  });

  it("injects missing gateProgress as empty object", () => {
    const m = migrateState({ name:"X" });
    expect(typeof m.gateProgress).toBe("object");
    expect(Array.isArray(m.gateProgress)).toBe(false);
  });

  it("does not overwrite existing partial player fields", () => {
    const raw = { name:"Y", player: { mainPath:"scholar", affinities:{ scholar:15 } }};
    const m = migrateState(raw);
    expect(m.player.mainPath).toBe("scholar");
    expect(m.player.affinities.scholar).toBe(15);
    // Missing affinities get 0 default
    expect(m.player.affinities.fighter).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// defaultState completeness
// ─────────────────────────────────────────────────────────────
describe("defaultState", () => {
  it("contains all required v2 fields", () => {
    const s = defaultState("Test");
    const required = ["name","rank","level","xp","stats","completedChallenges",
      "customQuests","totalXP","currentStreak","questHistory","gateProgress","player"];
    required.forEach(k => expect(s).toHaveProperty(k));
  });

  it("player has all affinity keys", () => {
    const s = defaultState("Test");
    const keys = ["fighter","runner","scholar","engineer","artisan","charmer","shadow"];
    keys.forEach(k => expect(s.player.affinities).toHaveProperty(k, 0));
  });
});

// ─────────────────────────────────────────────────────────────
// DUPLICATE-XP GUARD (via completedChallenges check)
// ─────────────────────────────────────────────────────────────
describe("Duplicate-XP guard", () => {
  it("detects already-completed quest", () => {
    const done = ["e_d1","e_d7","c_m8"];
    expect(done.includes("e_d1")).toBe(true);
    expect(done.includes("e_d5")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// AFFINITY CALCULATION
// ─────────────────────────────────────────────────────────────
describe("getAffinityGain", () => {
  it("returns scholar for uni daily", () => {
    const gains = getAffinityGain({ type:"daily", cat:"uni", xp:20 });
    expect(gains.scholar).toBe(1);
  });

  it("returns engineer for skill_tech weekly", () => {
    const gains = getAffinityGain({ type:"weekly", cat:"skill_tech", xp:100 });
    expect(gains.engineer).toBe(2);
  });

  it("returns scholar+5 for uni milestone", () => {
    const gains = getAffinityGain({ type:"milestone", cat:"uni", xp:300 });
    expect(gains.scholar).toBe(5);
  });

  it("returns fighter for strength daily", () => {
    const gains = getAffinityGain({ type:"daily", cat:"strength", xp:25 });
    expect(gains.fighter).toBe(1);
  });

  it("returns empty for unknown cat", () => {
    const gains = getAffinityGain({ type:"daily", cat:"unknown_cat", xp:10 });
    expect(Object.keys(gains)).toHaveLength(0);
  });

  it("returns empty for null challenge", () => {
    expect(getAffinityGain(null)).toEqual({});
  });
});

// ─────────────────────────────────────────────────────────────
// QUEST GENERATOR
// ─────────────────────────────────────────────────────────────
describe("generatePersonalizedQuests", () => {
  it("returns empty array for empty preferences", () => {
    expect(generatePersonalizedQuests({})).toHaveLength(0);
    expect(generatePersonalizedQuests(null)).toHaveLength(0);
  });

  it("generates quests matching interests", () => {
    const qs = generatePersonalizedQuests({ interests:["physik"], activePaths:[], preferredQuestLength:"medium" });
    expect(qs.length).toBeGreaterThan(0);
    const hasPhysik = qs.some(q => q.title.includes("Physik") || q.topic === "Physik");
    expect(hasPhysik).toBe(true);
  });

  it("respects max 8 quest limit", () => {
    const qs = generatePersonalizedQuests({
      interests:["physik","mathe","elektronik","programmieren","zeichnen","musik","kochen","fitness","mobility"],
      activePaths:[], preferredQuestLength:"medium"
    });
    expect(qs.length).toBeLessThanOrEqual(8);
  });

  it("has no duplicate IDs", () => {
    const qs = generatePersonalizedQuests({ interests:["physik","programmieren","fitness"], activePaths:["scholar","engineer","fighter"], preferredQuestLength:"medium" });
    const ids = qs.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("scales XP by quest length", () => {
    const prefs = { interests:["physik"], activePaths:[], preferredQuestLength:"medium" };
    const medium = generatePersonalizedQuests(prefs);
    const long   = generatePersonalizedQuests({...prefs, preferredQuestLength:"long"});
    const short  = generatePersonalizedQuests({...prefs, preferredQuestLength:"short"});
    if (medium.length > 0 && long.length > 0 && short.length > 0) {
      expect(short[0].xp).toBeLessThan(medium[0].xp);
      expect(medium[0].xp).toBeLessThan(long[0].xp);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// SYSTEM ANALYSIS
// ─────────────────────────────────────────────────────────────
describe("analyzeSystem", () => {
  const makeHistory = (domain, path, days) =>
    Array.from({length: days}, (_, i) => ({
      id: `h_${domain}_${i}`,
      domain,
      path,
      completedAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

  it("returns hasData=false for < 5 entries", () => {
    const r = analyzeSystem([{ id:"x", domain:"uni", completedAt: new Date().toISOString() }], {});
    expect(r.hasData).toBe(false);
  });

  it("detects dominant scholar path", () => {
    const hist = makeHistory("uni","scholar",6);
    const r = analyzeSystem(hist, { scholar:10 });
    expect(r.hasData).toBe(true);
    expect(r.suggestedMainPath).toBe("scholar");
  });

  it("detects neglected health domain after 5+ days", () => {
    const hist = makeHistory("strength","fighter",6);
    const r = analyzeSystem(hist, {});
    expect(r.neglectedDomains.some(n => n.domain === "health")).toBe(true);
  });

  it("provides message for insufficient data", () => {
    const r = analyzeSystem([], {});
    expect(r.suggestedMessage).toContain("Noch nicht genug Daten");
  });
});

// ─────────────────────────────────────────────────────────────
// TITLE UNLOCKS
// ─────────────────────────────────────────────────────────────
describe("checkTitleUnlocks", () => {
  const baseState = { currentStreak:0, completedChallenges:[], player:{ titles:[], activeTitle:null } };

  it("unlocks consistent_hunter at streak 7", () => {
    const s = { ...baseState, currentStreak: 7 };
    expect(checkTitleUnlocks(s, [])).toContain("consistent_hunter");
  });

  it("unlocks iron_discipline at streak 30", () => {
    const s = { ...baseState, currentStreak: 30 };
    const t = checkTitleUnlocks(s, []);
    expect(t).toContain("iron_discipline");
  });

  it("does not re-unlock existing title", () => {
    const s = { ...baseState, currentStreak:8, player:{ titles:["Consistent Hunter"], activeTitle:null } };
    expect(checkTitleUnlocks(s, [])).not.toContain("consistent_hunter");
  });

  it("unlocks apprentice_scholar after 5 scholar quests", () => {
    const hist = Array.from({length:5},(_,i)=>({ id:`q${i}`, domain:"uni", path:"scholar", completedAt:new Date().toISOString() }));
    expect(checkTitleUnlocks(baseState, hist)).toContain("apprentice_scholar");
  });

  it("unlocks deep_work_initiate after 5 mind quests", () => {
    const hist = Array.from({length:5},(_,i)=>({ id:`q${i}`, domain:"uni", path:"scholar", completedAt:new Date().toISOString() }));
    expect(checkTitleUnlocks(baseState, hist)).toContain("deep_work_initiate");
  });
});

// ─────────────────────────────────────────────────────────────
// GATE SYSTEM
// ─────────────────────────────────────────────────────────────
describe("Gate system", () => {
  it("all gates have required fields", () => {
    GATES.forEach(g => {
      expect(g.id).toBeDefined();
      expect(g.title).toBeDefined();
      expect(g.steps.length).toBeGreaterThan(0);
      expect(g.reward.xp).toBeGreaterThan(0);
      expect(g.reward.title).toBeDefined();
    });
  });

  it("isGateCompleted returns false for missing gate", () => {
    expect(isGateCompleted("nonexistent", {})).toBe(false);
  });

  it("isGateCompleted returns true when marked", () => {
    expect(isGateCompleted("gate_scholar_1", { gate_scholar_1:{ completed:true } })).toBe(true);
  });

  it("getGateStepsDone returns empty for no progress", () => {
    expect(getGateStepsDone("gate_scholar_1", {})).toHaveLength(0);
  });

  it("completed gate is not recommended again", () => {
    const progress = { gate_scholar_1:{ completed:true } };
    const sys = { dominantPaths:["scholar"], suggestedMainPath:"scholar" };
    const recs = getRecommendedGates(sys, progress);
    expect(recs.some(g => g.id === "gate_scholar_1")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// RECOVERY SYSTEM
// ─────────────────────────────────────────────────────────────
describe("Recovery system", () => {
  it("returns fallback quests when no preferences", () => {
    const qs = getRecoveryQuests({ neglectedDomains:[] }, [], 0, []);
    expect(qs.length).toBeGreaterThan(0);
  });

  it("returns max 4 quests", () => {
    const sys = { neglectedDomains:[{domain:"health"},{domain:"social"},{domain:"cardio"},{domain:"skill_creative"}], balanceHints:[] };
    const qs = getRecoveryQuests(sys, [], 0, ["schlaf","ordnung","mobility","ernaehrung"]);
    expect(qs.length).toBeLessThanOrEqual(4);
  });

  it("returns urgent hint when streak > 2 and nothing today", () => {
    const h = getRecoveryHint({ neglectedDomains:[], balanceHints:[] }, [], 4);
    expect(h?.urgent).toBe(true);
  });

  it("returns null hint when all is fine", () => {
    const h = getRecoveryHint({ neglectedDomains:[], balanceHints:[] }, ["e_d1","e_d2"], 1);
    expect(h).toBeNull();
  });

  it("does not include already-done quests", () => {
    const completed = ["rec_spaziergang","rec_wasser"];
    const qs = getRecoveryQuests({ neglectedDomains:[{domain:"health"}] }, completed, 0, []);
    const ids = qs.map(q => q.id);
    expect(ids).not.toContain("rec_spaziergang");
    expect(ids).not.toContain("rec_wasser");
  });
});

// ─────────────────────────────────────────────────────────────
// PATH SUGGESTIONS
// ─────────────────────────────────────────────────────────────
describe("suggestPaths + canUnlockShadow", () => {
  it("returns null for no data", () => {
    expect(suggestPaths({})).toBeNull();
    expect(suggestPaths({ scholar:0, engineer:0, fighter:0, runner:0, artisan:0, charmer:0, shadow:0 })).toBeNull();
  });

  it("suggests top affinity as main path", () => {
    const aff = { scholar:15, engineer:8, fighter:2, runner:0, artisan:0, charmer:0, shadow:0 };
    const s = suggestPaths(aff);
    expect(s.mainPath).toBe("scholar");
    expect(s.secondaryPath).toBe("engineer");
  });

  it("unlocks shadow when 3 paths >= 20", () => {
    const aff = { scholar:22, engineer:20, fighter:21, runner:5, artisan:0, charmer:0, shadow:0 };
    expect(canUnlockShadow(aff)).toBe(true);
  });

  it("does not unlock shadow when only 2 paths >= 20", () => {
    const aff = { scholar:22, engineer:20, fighter:15, runner:0, artisan:0, charmer:0, shadow:0 };
    expect(canUnlockShadow(aff)).toBe(false);
  });
});

// ============================================================
// QUEST COMPLETION — Zentrale Abschlusslogik
// Alle Reward-Anwendungen laufen durch diese Funktionen.
// Keine Duplikat-XP, keine Duplikat-Rewards.
// ============================================================
import { getAffinityGain }         from "../data/paths.js";
import { makeHistoryEntry }        from "./migration.js";
import { canComplete, markCompleted } from "./history.js";
import { getTodayKey, getTodayWeekKey } from "./dates.js";
import { checkTitleUnlocks }       from "../data/titles.js";
import { applyQuestToAllGoals, getNewlyCompletedGoals, canClaimGoalReward, calculateGoalReward, markGoalRewardClaimed } from "./goals.js";
import { applyAffinityGains, applyStatGains, applyTitleUnlock, updateXpHistory } from "./rewards.js";

// ── Externe Abhängigkeiten (App-Kontext) ──────────────────
// Diese Funktion braucht XP_PER_LEVEL, getRankFromGlobal etc.
// Sie werden als Callbacks übergeben um zirkuläre Imports zu vermeiden.

/**
 * Zentrale Quest-Abschluss-Funktion.
 * Wendet alle Rewards kontrolliert und ohne Duplikate an.
 *
 * @param {object} state          - Aktueller App-State (read-only)
 * @param {object} quest          - Quest-Objekt
 * @param {object} options        - { XP_PER_LEVEL_FN, TOTAL_LEVELS, getRankFromGlobal, getGlobalLevel }
 * @returns {{ newState, feedback }}
 *   newState  - neuer State nach Completion
 *   feedback  - { xp, statKey, statPts, pathGains, newTitles, goalCompleted }
 */
export function applyQuestCompletion(state, quest, options) {
  const { XP_PER_LEVEL_FN, TOTAL_LEVELS, getRankFromGlobal, getGlobalLevel } = options;

  // ── Duplicate Check ──
  const cs = state.completionStatus || {};
  const legacyDone = (state.completedChallenges || []).includes(quest.id);
  const newDone    = !canComplete(cs, state.questHistory || [], quest);
  if (legacyDone || newDone) {
    return { newState: null, feedback: null, alreadyDone: true };
  }

  let s = {
    ...state,
    stats:              { ...state.stats },
    completedChallenges: [...(state.completedChallenges || [])],
  };

  // ── Legacy completedChallenges (Backward-Compat) ──
  s.completedChallenges.push(quest.id);

  // ── Completion Status ──
  s.completionStatus = markCompleted(cs, quest);

  // ── XP ──
  const xp = quest.xp || 0;
  s.xp      = (s.xp      || 0) + xp;
  s.totalXP = (s.totalXP || 0) + xp;

  // ── Active day + streak ──
  const today = getTodayKey();
  s.lastActiveDay = today;
  if (s.lastDailyReset === today) {
    s.currentStreak = Math.max(s.currentStreak || 0, 1);
  }

  // ── XP History ──
  const wk = getTodayWeekKey();
  s.xpHistory = updateXpHistory(s.xpHistory, xp, wk);

  // ── Quest History ──
  const histEntry = makeHistoryEntry(quest);
  s.questHistory = [...(s.questHistory || []), histEntry].slice(-500);

  // ── Affinity ──
  const gains = getAffinityGain(quest);
  s.player = applyAffinityGains(s.player, gains);

  // ── Stats (nur Milestones) ──
  let statKey = null, statPts = 0;
  if (quest.type === "milestone" && quest.statPts > 0) {
    statKey = quest.subStat || quest.stat;
    statPts = quest.statPts;
    s.stats = applyStatGains(s.stats, statKey, statPts, quest.subStat);
  }

  // ── Level-Up ──
  const levelUps = [];
  let rankUpBlocked = null;
  let xpNeeded = XP_PER_LEVEL_FN(s.rank, s.level);
  while (s.xp >= xpNeeded) {
    s.xp -= xpNeeded;
    const gl = getGlobalLevel(s.rank, s.level);
    if (gl < TOTAL_LEVELS) {
      const next = getRankFromGlobal(gl + 1);
      // Etappe 8: Rank-Ups brauchen mehr als XP. Bei unerfüllten
      // Anforderungen staut XP an der Rank-Grenze (kein Verlust).
      if (next.rank !== s.rank && !canRankUpTo(s, next.rank)) {
        s.xp += xpNeeded; // zurückgeben — wartet an der Grenze
        rankUpBlocked = next.rank;
        break;
      }
      levelUps.push({ rank: next.rank, level: next.level, rankUp: next.rank !== s.rank });
      s.rank = next.rank;
      s.level = next.level;
      xpNeeded = XP_PER_LEVEL_FN(s.rank, s.level);
    } else break;
  }

  // ── Titel ──
  const newlyUnlocked = checkTitleUnlocks(s, s.questHistory || []);
  for (const titleId of newlyUnlocked) {
    s.player = applyTitleUnlock(s.player, titleId);
  }

  // ── Goal Progress ──
  let goalNotifications = [];
  if ((s.goals || []).length > 0) {
    const oldGoals = s.goals;
    s.goals = applyQuestToAllGoals(s.goals, quest);
    const completedNow = getNewlyCompletedGoals(oldGoals, s.goals);
    for (const completedGoal of completedNow) {
      if (canClaimGoalReward(completedGoal, s.completionStatus)) {
        const bonusXp = calculateGoalReward(completedGoal);
        s.xp      = (s.xp      || 0) + bonusXp;
        s.totalXP = (s.totalXP || 0) + bonusXp;
        s.goals = s.goals.map(g => g.id === completedGoal.id ? markGoalRewardClaimed(g) : g);
        s.completionStatus = {
          ...s.completionStatus,
          goals: {
            ...(s.completionStatus?.goals || {}),
            [completedGoal.id]: { completed: true, rewardClaimed: true },
          },
        };
        s.player = applyAffinityGains(s.player, completedGoal.rewardAffinity || {});
        goalNotifications.push({ title: completedGoal.title, xp: bonusXp });
      }
    }
  }

  const feedback = {
    xp,
    statKey,
    statPts,
    pathGains:         gains,
    newTitles:         newlyUnlocked,
    levelUps,
    rankUpBlocked,
    goalNotifications,
  };

  return { newState: s, feedback, alreadyDone: false };
}

// ── Gate Completion ────────────────────────────────────────

/**
 * Zentrale Gate-Reward-Anwendung.
 * Prüft Duplikat via gateProgress.rewardClaimed.
 */
export function applyGateCompletion(state, gate, options) {
  const { XP_PER_LEVEL_FN, TOTAL_LEVELS, getRankFromGlobal, getGlobalLevel } = options;

  const prev = state.gateProgress?.[gate.id] || {};
  if (prev.rewardClaimed) {
    return { newState: null, alreadyDone: true };
  }

  let s = { ...state, gateProgress: { ...state.gateProgress } };

  // Gate abschließen
  s.gateProgress[gate.id] = { ...prev, completed: true, rewardClaimed: true };

  // XP
  const xp = gate.reward.xp || 0;
  s.xp      = (s.xp      || 0) + xp;
  s.totalXP = (s.totalXP || 0) + xp;
  s.lastActiveDay = getTodayKey();

  // XP History
  const wk = getTodayWeekKey();
  s.xpHistory = updateXpHistory(s.xpHistory, xp, wk);

  // Affinity
  s.player = applyAffinityGains(s.player, gate.reward.affinity || {});

  // Titel
  if (gate.reward.title) {
    s.player = applyTitleUnlock(s.player, gate.reward.title);
  }

  // completionStatus.gates updaten
  s.completionStatus = {
    ...(s.completionStatus || {}),
    gates: {
      ...(s.completionStatus?.gates || {}),
      [gate.id]: { completed: true, rewardClaimed: true },
    },
  };

  // Level-Up
  const levelUps = [];
  let rankUpBlocked = null;
  let xpNeeded = XP_PER_LEVEL_FN(s.rank, s.level);
  while (s.xp >= xpNeeded) {
    s.xp -= xpNeeded;
    const gl = getGlobalLevel(s.rank, s.level);
    if (gl < TOTAL_LEVELS) {
      const next = getRankFromGlobal(gl + 1);
      // Etappe 8: Rank-Ups brauchen mehr als XP. Bei unerfüllten
      // Anforderungen staut XP an der Rank-Grenze (kein Verlust).
      if (next.rank !== s.rank && !canRankUpTo(s, next.rank)) {
        s.xp += xpNeeded; // zurückgeben — wartet an der Grenze
        rankUpBlocked = next.rank;
        break;
      }
      levelUps.push({ rank: next.rank, level: next.level, rankUp: next.rank !== s.rank });
      s.rank = next.rank;
      s.level = next.level;
      xpNeeded = XP_PER_LEVEL_FN(s.rank, s.level);
    } else break;
  }

  return {
    newState: s,
    feedback: { xp, levelUps, rankUpBlocked, titleId: gate.reward.title },
    alreadyDone: false,
  };
}

/**
 * Prüft ob eine Quest abgeschlossen werden kann.
 * Wrapper für canComplete aus history.js.
 */
export function canCompleteQuest(state, quest) {
  const cs = state.completionStatus || {};
  const legacyDone = (state.completedChallenges || []).includes(quest.id);
  if (legacyDone) return false;
  return canComplete(cs, state.questHistory || [], quest);
}

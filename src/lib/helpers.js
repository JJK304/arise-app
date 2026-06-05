// ============================================================
// HELPERS & UTILITIES
// ============================================================
import { RANKS, LEVELS_PER_RANK } from "../data/ranks.js";

export const getGlobalLevel = (rank, level) =>
  RANKS.indexOf(rank) * LEVELS_PER_RANK + level;

export const getRankFromGlobal = (g) => ({
  rank:  RANKS[Math.floor((g - 1) / LEVELS_PER_RANK)],
  level: ((g - 1) % LEVELS_PER_RANK) + 1,
});

export const getTodayStr = () => new Date().toDateString();

export const getWeekStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
};

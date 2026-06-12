// ============================================================
// REWARDS — Zentrale Reward-Berechnungen
// Alle XP/Stat/Affinity-Berechnungen an einem Ort.
// Keine Reward-Logik darf doppelt vergeben werden.
// XP-Grenzen aus balancing.js.
// ============================================================
import { RANKS, LEVELS_PER_RANK } from "../data/ranks.js";
import { canRankUpTo } from "./rankRequirements.js";
import { clampXp, XP_BOUNDS, DIFF_SCALE, LENGTH_SCALE, suggestXp } from "../data/balancing.js";

// ── XP Scaling ─────────────────────────────────────────────
// Wird auch in App.jsx als XP_PER_LEVEL genutzt — Formel muss konsistent bleiben.

// ── Level-Up Mechanik ─────────────────────────────────────

/**
 * Wendet XP-Gewinn auf einen State an und berechnet Level-Ups.
 * Gibt { newState, levelUps: [{rank, level, rankUp}] } zurück.
 * State wird NICHT mutiert — immutable Return.
 */
export function applyXpGain(state, xpAmount, XP_PER_LEVEL_FN, TOTAL_LEVELS, getRankFromGlobal, getGlobalLevel) {
  if (!xpAmount || xpAmount <= 0) return { newState: state, levelUps: [] };

  let s = { ...state };
  const wk = s._weekKey || null; // Für XP-History (wird extern gesetzt)

  s.xp      = (s.xp      || 0) + xpAmount;
  s.totalXP = (s.totalXP || 0) + xpAmount;

  const levelUps = [];
  let xpNeeded = XP_PER_LEVEL_FN(s.rank, s.level);

  while (s.xp >= xpNeeded) {
    s.xp -= xpNeeded;
    const gl = getGlobalLevel(s.rank, s.level);
    if (gl < TOTAL_LEVELS) {
      const next = getRankFromGlobal(gl + 1);
      const rankUp = next.rank !== s.rank;
      // Etappe 8: Rank-Ups brauchen mehr als XP (XP staut an der Grenze)
      if (rankUp && !canRankUpTo(s, next.rank)) {
        s.xp += xpNeeded;
        break;
      }
      s.rank = next.rank;
      s.level = next.level;
      levelUps.push({ rank: s.rank, level: s.level, rankUp });
      xpNeeded = XP_PER_LEVEL_FN(s.rank, s.level);
    } else {
      break;
    }
  }

  return { newState: s, levelUps };
}

/**
 * Fügt einen XP-Eintrag zur wöchentlichen History hinzu.
 */
export function updateXpHistory(xpHistory, xp, weekKey) {
  const hist = [...(xpHistory || [])];
  const last = hist[hist.length - 1];
  const label = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  if (last && last.w === weekKey) {
    last.v += xp;
  } else {
    hist.push({ w: weekKey, v: xp, l: label });
  }
  return hist.slice(-24);
}

/**
 * Wendet Affinity-Gains auf den Player-State an.
 * Gibt den neuen Player-Object zurück (immutable).
 */
export function applyAffinityGains(player, gains) {
  if (!gains || Object.keys(gains).length === 0) return player;
  const affinities = { ...(player.affinities || {}) };
  for (const [pathId, pts] of Object.entries(gains)) {
    if (pts > 0 && affinities[pathId] !== undefined) {
      affinities[pathId] = (affinities[pathId] || 0) + pts;
    }
  }
  return { ...player, affinities };
}

/**
 * Wendet Stat-Gains auf den Stats-State an.
 * Gibt neues Stats-Object zurück (immutable).
 */
export function applyStatGains(stats, statKey, statPts, subStat) {
  if (!statKey || !statPts || statPts <= 0) return stats;
  const s = { ...stats };
  s[statKey] = (s[statKey] || 0) + statPts;
  // Sub-Stat CHA als Nebeneffekt
  if (subStat && statPts > 1) {
    s.CHA = (s.CHA || 0) + Math.max(1, Math.floor(statPts / 5));
  }
  return s;
}

/**
 * Wendet einen Titel-Unlock an.
 * Gibt neues Player-Object zurück (immutable, kein Duplikat).
 */
export function applyTitleUnlock(player, titleId) {
  if (!titleId) return player;
  const titles = player.titles || [];
  if (titles.includes(titleId)) return player; // bereits vorhanden
  return {
    ...player,
    titles:      [...titles, titleId],
    activeTitle: player.activeTitle || titleId, // ersten Titel auto-setzen
  };
}

/**
 * Berechnet einen sicheren XP-Wert für Custom Quests.
 * Klemmt auf den erlaubten Bereich aus balancing.js.
 * Re-exportiert clampXp für Backward-Compat.
 */
export function clampCustomQuestXp(rawXp, questType, difficulty = "normal") {
  return clampXp(rawXp, questType || "custom", difficulty);
}

// Re-export für direkte Nutzung
export { clampXp, suggestXp, XP_BOUNDS, DIFF_SCALE, LENGTH_SCALE };

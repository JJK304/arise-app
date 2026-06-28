// ============================================================
// STAT HISTORY — rein, aus App.jsx ausgelagert (Etappe 7).
// Kumulierter Stat-Verlauf aus abgeschlossenen Meilensteinen.
// Liest nur aus dem State, kein Seiteneffekt → testbar.
// ============================================================
import { CHALLENGES_DB } from "../data/challenges.js";
import { RANKS } from "../data/ranks.js";

export function buildStatHistory(state = {}, statKey) {
  const allM = Object.values(CHALLENGES_DB).flatMap(r => r.milestones);
  // questHistory ist zuverlässiger als completedChallenges für Milestones
  const completedMilestoneIds = new Set([
    ...(state.completedChallenges || []),
    ...(state.questHistory || []).filter(h => h.type === "milestone").map(h => h.id),
  ]);
  const relevant = allM.filter(m => (m.subStat || m.stat) === statKey && completedMilestoneIds.has(m.id));
  // Rank-Reihenfolge als Zeit-Proxy (keine Completion-Timestamps gespeichert)
  relevant.sort((a, b) => {
    const ra = Object.entries(CHALLENGES_DB).find(([, v]) => v.milestones.includes(a))?.[0] || "E";
    const rb = Object.entries(CHALLENGES_DB).find(([, v]) => v.milestones.includes(b))?.[0] || "E";
    return RANKS.indexOf(ra) - RANKS.indexOf(rb);
  });
  let cumulative = 0;
  return relevant.map(m => {
    cumulative += m.statPts;
    return { v: cumulative, l: m.title.slice(0, 14), pts: m.statPts, title: m.title };
  });
}

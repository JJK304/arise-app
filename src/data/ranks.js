// ============================================================
// RANK CONFIGURATION
// ============================================================

export const RANKS = ["E","D","C","B","A","S","SS","SSS"];
export const LEVELS_PER_RANK = 10;
export const TOTAL_LEVELS = RANKS.length * LEVELS_PER_RANK;

export const RANK_COLORS = {
  E: {
    primary: "#7c8899", secondary: "#94a3b8",
    glow: "#6b728044", label: "Novice", desc: "Du fängst an. Grundlagen legen.",
    bg: "#050508", pattern: "none",
    accent: "#374151", headerBg: "rgba(0,0,0,0.6)",
    border: "rgba(107,114,128,0.22)", text: "#c8d0dc", muted: "#64748b",
  },
  D: {
    primary: "#22c55e", secondary: "#4ade80",
    glow: "#22c55e44", label: "Awakened", desc: "Erste echte Routinen & Erfolge.",
    bg: "#030a05", pattern: "radial-gradient(circle at 80% 20%, #052010 0%, transparent 50%)",
    accent: "#14532d", headerBg: "rgba(2,8,4,0.85)",
    border: "rgba(34,197,94,0.2)", text: "#d4f5e2", muted: "#4ade8088",
  },
  C: {
    primary: "#3b82f6", secondary: "#60a5fa",
    glow: "#3b82f644", label: "Hunter", desc: "Konsistenz ist zur Gewohnheit geworden.",
    bg: "#020510", pattern: "radial-gradient(circle at 20% 80%, #0a1628 0%, transparent 50%)",
    accent: "#1e3a5f", headerBg: "rgba(2,5,15,0.85)",
    border: "rgba(59,130,246,0.22)", text: "#cce0ff", muted: "#60a5fa88",
  },
  B: {
    primary: "#8b5cf6", secondary: "#a78bfa",
    glow: "#8b5cf644", label: "Elite Hunter", desc: "Du übertriffst 90% der Menschen.",
    bg: "#060310", pattern: "radial-gradient(circle at 70% 30%, #120828 0%, transparent 50%), radial-gradient(circle at 30% 70%, #0d0520 0%, transparent 40%)",
    accent: "#4c1d95", headerBg: "rgba(6,3,14,0.88)",
    border: "rgba(139,92,246,0.24)", text: "#e2d9ff", muted: "#a78bfa88",
  },
  A: {
    primary: "#f59e0b", secondary: "#fbbf24",
    glow: "#f59e0b44", label: "Advanced Hunter", desc: "Top 5% – in allem was du tust.",
    bg: "#080500", pattern: "radial-gradient(circle at 50% 0%, #1a0f00 0%, transparent 60%), radial-gradient(circle at 100% 100%, #120800 0%, transparent 40%)",
    accent: "#78350f", headerBg: "rgba(8,5,0,0.88)",
    border: "rgba(245,158,11,0.24)", text: "#fff0cc", muted: "#fbbf2488",
  },
  S: {
    primary: "#ef4444", secondary: "#f87171",
    glow: "#ef444444", label: "S-Rank Hunter", desc: "Elite. Kompromisslos. Kein Zurück.",
    bg: "#080000", pattern: "radial-gradient(circle at 50% -10%, #200000 0%, transparent 55%), radial-gradient(circle at 0% 100%, #180000 0%, transparent 40%)",
    accent: "#7f1d1d", headerBg: "rgba(8,0,0,0.92)",
    border: "rgba(239,68,68,0.26)", text: "#ffe0e0", muted: "#f8717188",
  },
  SS: {
    primary: "#ec4899", secondary: "#f472b6",
    glow: "#ec489944", label: "National-Level", desc: "Legendenstatus. Fast niemand erreicht das.",
    bg: "#080010", pattern: "radial-gradient(circle at 30% 20%, #1a0020 0%, transparent 50%), radial-gradient(circle at 70% 80%, #200010 0%, transparent 45%)",
    accent: "#831843", headerBg: "rgba(8,0,12,0.92)",
    border: "rgba(236,72,153,0.26)", text: "#ffe0f0", muted: "#f472b688",
  },
  SSS: {
    primary: "#00ffff", secondary: "#67e8f9",
    glow: "#00ffff55", label: "Ascendant", desc: "Das Unmögliche. Du bist über alle Pfade hinausgewachsen.",
    bg: "#000a0a", pattern: "radial-gradient(circle at 50% 0%, #001a1a 0%, transparent 60%), radial-gradient(circle at 100% 100%, #000f0f 0%, transparent 40%), radial-gradient(circle at 0% 100%, #001010 0%, transparent 35%)",
    accent: "#164e63", headerBg: "rgba(0,8,8,0.94)",
    border: "rgba(0,255,255,0.28)", text: "#ccffff", muted: "#67e8f988",
  },
};

export const XP_BASE = { E:30, D:74, C:258, B:802, A:2210, S:8487, SS:29239, SSS:191286 };
export const XP_PER_LEVEL = (rank, level) => Math.floor((XP_BASE[rank]||30) * (1 + (level-1)*0.4));

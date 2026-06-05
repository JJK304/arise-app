// ============================================================
// RANK CONFIGURATION
// ============================================================

export const RANKS = ["E","D","C","B","A","S","SS","SSS"];
export const LEVELS_PER_RANK = 10;
export const TOTAL_LEVELS = RANKS.length * LEVELS_PER_RANK;

export const RANK_COLORS = {
  E:   { primary:"#6b7280", glow:"#6b728033", label:"Novice",          desc:"Du fängst an. Grundlagen legen.",
         bg:"#050508", pattern:"none", accent:"#374151", headerBg:"rgba(0,0,0,0.55)" },
  D:   { primary:"#22c55e", glow:"#22c55e33", label:"Awakened",        desc:"Erste echte Routinen & Erfolge.",
         bg:"#030a05", pattern:"radial-gradient(circle at 80% 20%, #052010 0%, transparent 50%)", accent:"#14532d", headerBg:"rgba(2,8,4,0.8)" },
  C:   { primary:"#3b82f6", glow:"#3b82f633", label:"Hunter",          desc:"Konsistenz ist zur Gewohnheit geworden.",
         bg:"#020510", pattern:"radial-gradient(circle at 20% 80%, #0a1628 0%, transparent 50%)", accent:"#1e3a5f", headerBg:"rgba(2,5,15,0.8)" },
  B:   { primary:"#8b5cf6", glow:"#8b5cf633", label:"Elite Hunter",    desc:"Du übertriffst 90% der Menschen.",
         bg:"#060310", pattern:"radial-gradient(circle at 70% 30%, #120828 0%, transparent 50%), radial-gradient(circle at 30% 70%, #0d0520 0%, transparent 40%)", accent:"#4c1d95", headerBg:"rgba(6,3,14,0.85)" },
  A:   { primary:"#f59e0b", glow:"#f59e0b33", label:"Advanced Hunter", desc:"Top 5% – in allem was du tust.",
         bg:"#080500", pattern:"radial-gradient(circle at 50% 0%, #1a0f00 0%, transparent 60%), radial-gradient(circle at 100% 100%, #120800 0%, transparent 40%)", accent:"#78350f", headerBg:"rgba(8,5,0,0.85)" },
  S:   { primary:"#ef4444", glow:"#ef444433", label:"S-Rank Hunter",   desc:"Elite. Kompromisslos. Kein Zurück.",
         bg:"#080000", pattern:"radial-gradient(circle at 50% -10%, #200000 0%, transparent 55%), radial-gradient(circle at 0% 100%, #180000 0%, transparent 40%)", accent:"#7f1d1d", headerBg:"rgba(8,0,0,0.9)" },
  SS:  { primary:"#ec4899", glow:"#ec489933", label:"National-Level",  desc:"Legendenstatus. Fast niemand erreicht das.",
         bg:"#080010", pattern:"radial-gradient(circle at 30% 20%, #1a0020 0%, transparent 50%), radial-gradient(circle at 70% 80%, #200010 0%, transparent 45%)", accent:"#831843", headerBg:"rgba(8,0,12,0.9)" },
  SSS: { primary:"#00ffff", glow:"#00ffff44", label:"Shadow Monarch",  desc:"Das Unmögliche. Du hast es geschafft.",
         bg:"#000a0a", pattern:"radial-gradient(circle at 50% 0%, #001a1a 0%, transparent 60%), radial-gradient(circle at 100% 100%, #000f0f 0%, transparent 40%), radial-gradient(circle at 0% 100%, #001010 0%, transparent 35%)", accent:"#164e63", headerBg:"rgba(0,8,8,0.92)" },
};

export const XP_BASE = { E:30, D:74, C:258, B:802, A:2210, S:8487, SS:29239, SSS:191286 };
export const XP_PER_LEVEL = (rank, level) => Math.floor((XP_BASE[rank]||30) * (1 + (level-1)*0.4));

// ============================================================
// ACHIEVEMENTS — Prompt 13
// Einmalig, automatisch freigeschaltet, nie doppelt vergeben.
// Deckt Progression, Content-Breite, Gates, Goals, Logs ab.
// ============================================================
import { GATES } from "./gates.js";
import { RANKS } from "./ranks.js";
import { CHALLENGES_DB } from "./challenges.js";

export const ACHIEVEMENTS = [

  // ── Erste Schritte ──
  { id:"ach_1",  title:"Erwacht",          desc:"Ersten Quest abgeschlossen",                icon:"⚡",  check:(s,b) => s.totalXP > 0 },
  { id:"ach_2",  title:"Beständig",        desc:"7 Tage Streak erreicht",                    icon:"🔥",  check:(s,b) => (s.currentStreak||0) >= 7 },
  { id:"ach_3",  title:"Unaufhaltsam",     desc:"30 Tage Streak erreicht",                   icon:"🔥",  check:(s,b) => (s.currentStreak||0) >= 30 },
  { id:"ach_4",  title:"Aufgestiegen",     desc:"Ersten Rang-Aufstieg geschafft",            icon:"↑",   check:(s,b) => RANKS.indexOf(s.rank) >= 1 },
  { id:"ach_5",  title:"Hunter",           desc:"C-Rank erreicht",                           icon:"🎯",  check:(s,b) => RANKS.indexOf(s.rank) >= 2 },
  { id:"ach_6",  title:"Elite",            desc:"B-Rank erreicht",                           icon:"💎",  check:(s,b) => RANKS.indexOf(s.rank) >= 3 },

  // ── Meilensteine & Quests ──
  { id:"ach_7",  title:"Erster Beweis",    desc:"Ersten Meilenstein abgeschlossen",          icon:"★",   check:(s,b) => Object.values(CHALLENGES_DB).flatMap(r=>r.milestones).some(m=>(s.completedChallenges||[]).includes(m.id)) },
  { id:"ach_8",  title:"Fleißig",          desc:"100 Quests abgeschlossen (gesamt)",         icon:"◈",   check:(s,b) => (s.completedChallenges?.length||0) >= 100 },
  { id:"ach_9",  title:"Vielseitig",       desc:"5 verschiedene Domains aktiv",              icon:"🌐",  check:(s,b) => {
    const domains = new Set((s.questHistory||[]).map(h => h.domain).filter(Boolean));
    return domains.size >= 5;
  }},

  // ── Stats ──
  { id:"ach_10", title:"Körper-Check",     desc:"Ersten Körper-Check-In gespeichert",        icon:"📊",  check:(s,b) => b.length > 0 },
  { id:"ach_11", title:"Fortschritt",      desc:"4 Körper-Check-Ins gespeichert",            icon:"📈",  check:(s,b) => b.length >= 4 },
  { id:"ach_12", title:"Stark",            desc:"STR Stat über 50",                          icon:"⚔️",  check:(s,b) => (s.stats?.STR||0) >= 50 },
  { id:"ach_13", title:"Ausdauer",         desc:"AGI Stat über 50",                          icon:"🏃",  check:(s,b) => (s.stats?.AGI||0) >= 50 },
  { id:"ach_14", title:"Genie",            desc:"INT Stat über 50",                          icon:"🧠",  check:(s,b) => (s.stats?.INT||0) >= 50 },

  // ── XP Schwellen ──
  { id:"ach_15", title:"10.000 XP",        desc:"10.000 Total-XP gesammelt",                 icon:"✨",  check:(s,b) => (s.totalXP||0) >= 10000 },
  { id:"ach_16", title:"100.000 XP",       desc:"100.000 Total-XP gesammelt",                icon:"👑",  check:(s,b) => (s.totalXP||0) >= 100000 },
  { id:"ach_17", title:"Allrounder",       desc:"Alle 8 Core-Stats über 0",                  icon:"🌟",  check:(s,b) => ["STR","AGI","INT","CRE","CRA","VIT","END","CHA"].every(k => (s.stats?.[k]||0) > 0) },
  { id:"ach_18", title:"Maschine",         desc:"50 Tage Streak erreicht",                   icon:"🤖",  check:(s,b) => (s.currentStreak||0) >= 50 },

  // ── Gates ──
  { id:"ach_19", title:"Erstes Gate",      desc:"Ersten Gate abgeschlossen",                 icon:"🔑",  check:(s,b) => Object.values(s.gateProgress||{}).some(g => g.completed) },
  { id:"ach_20", title:"Gatebreaker",      desc:"3 Gates abgeschlossen",                     icon:"🗝️", check:(s,b) => Object.values(s.gateProgress||{}).filter(g => g.completed).length >= 3 },
  { id:"ach_21", title:"Gate Master",      desc:"5 Gates abgeschlossen",                     icon:"🔐",  check:(s,b) => Object.values(s.gateProgress||{}).filter(g => g.completed).length >= 5 },
  { id:"ach_22", title:"Tier III",         desc:"Ersten Tier-III-Gate abgeschlossen",        icon:"🏆",  check:(s,b) => {
    return GATES.filter(g => g.tier === 3).some(g => s.gateProgress?.[g.id]?.completed);
  }},

  // ── Goals ──
  { id:"ach_23", title:"Zielstrebig",      desc:"Erstes Ziel erstellt",                      icon:"🎯",  check:(s,b) => (s.goals||[]).length >= 1 },
  { id:"ach_24", title:"Goal Breaker",     desc:"Erstes Ziel vollständig abgeschlossen",     icon:"🏅",  check:(s,b) => (s.goals||[]).some(g => g.status === "completed") },
  { id:"ach_25", title:"Goal Hunter",      desc:"3 Ziele abgeschlossen",                     icon:"🎖️", check:(s,b) => (s.goals||[]).filter(g => g.status === "completed").length >= 3 },

  // ── Progress Logs ──
  { id:"ach_26", title:"Dokumentierer",    desc:"5 Progress Logs gespeichert",               icon:"📝",  check:(s,b) => (s.progressLogs||[]).length >= 5 },
  { id:"ach_27", title:"Chronicler",       desc:"25 Progress Logs gespeichert",              icon:"📓",  check:(s,b) => (s.progressLogs||[]).length >= 25 },

  // ── Pfad-Diversität ──
  { id:"ach_28", title:"Pfadfinder",       desc:"3 verschiedene Paths mit je 5+ Quests",     icon:"🧭",  check:(s,b) => {
    const counts = {};
    for (const h of (s.questHistory||[])) {
      if (h.path) counts[h.path] = (counts[h.path]||0) + 1;
    }
    return Object.values(counts).filter(v => v >= 5).length >= 3;
  }},
  { id:"ach_29", title:"Polymath",         desc:"6 verschiedene Domains je 3+ Quests",       icon:"🌍",  check:(s,b) => {
    const counts = {};
    for (const h of (s.questHistory||[])) {
      if (h.domain) counts[h.domain] = (counts[h.domain]||0) + 1;
    }
    return Object.values(counts).filter(v => v >= 3).length >= 6;
  }},

  // ── Recovery ──
  { id:"ach_30", title:"Balance Keeper",   desc:"10 Recovery-Quests abgeschlossen",          icon:"💚",  check:(s,b) => (s.questHistory||[]).filter(h => h.type === "recovery" || h.domain === "recovery").length >= 10 },
];

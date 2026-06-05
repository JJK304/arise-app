// ============================================================
// ACHIEVEMENTS
// einmalig, automatisch freigeschaltet
// ============================================================
import { RANKS } from "./ranks.js";
import { CHALLENGES_DB } from "./challenges.js";

export const ACHIEVEMENTS = [
  { id:"ach_1",   title:"Erwacht",          desc:"Ersten Quest abgeschlossen",                  icon:"⚡", check:(s,b)=>s.totalXP>0 },
  { id:"ach_2",   title:"Beständig",        desc:"7 Tage Streak erreicht",                      icon:"🔥", check:(s,b)=>(s.currentStreak||0)>=7 },
  { id:"ach_3",   title:"Unaufhaltsam",     desc:"30 Tage Streak erreicht",                     icon:"🔥", check:(s,b)=>(s.currentStreak||0)>=30 },
  { id:"ach_4",   title:"Aufgestiegen",     desc:"Ersten Rang-Aufstieg geschafft",              icon:"↑",  check:(s,b)=>RANKS.indexOf(s.rank)>=1 },
  { id:"ach_5",   title:"Hunter",           desc:"C-Rank erreicht",                             icon:"🎯", check:(s,b)=>RANKS.indexOf(s.rank)>=2 },
  { id:"ach_6",   title:"Elite",            desc:"B-Rank erreicht",                             icon:"💎", check:(s,b)=>RANKS.indexOf(s.rank)>=3 },
  { id:"ach_7",   title:"Erster Beweis",    desc:"Ersten Meilenstein abgeschlossen",            icon:"★",  check:(s,b)=>Object.values(CHALLENGES_DB).flatMap(r=>r.milestones).some(m=>s.completedChallenges?.includes(m.id)) },
  { id:"ach_8",   title:"Fleißig",          desc:"100 Quests abgeschlossen",                    icon:"◈",  check:(s,b)=>(s.completedChallenges?.length||0)>=100 },
  { id:"ach_9",   title:"Vielseitig",       desc:"5 verschiedene Kategorien aktiviert",         icon:"🌐", check:(s,b)=>{const cats=new Set((s.completedChallenges||[]).map(id=>{const c=Object.values(CHALLENGES_DB).flatMap(r=>[...r.daily,...r.weekly,...r.milestones]).find(x=>x.id===id);return c?.cat}).filter(Boolean));return cats.size>=5;} },
  { id:"ach_10",  title:"Körper-Check",     desc:"Ersten Körper-Check-In gespeichert",          icon:"📊", check:(s,b)=>b.length>0 },
  { id:"ach_11",  title:"Fortschritt",      desc:"4 Körper-Check-Ins gespeichert",              icon:"📈", check:(s,b)=>b.length>=4 },
  { id:"ach_12",  title:"Stark",            desc:"STR Stat über 50",                            icon:"⚔️", check:(s,b)=>(s.stats?.STR||0)>=50 },
  { id:"ach_13",  title:"Ausdauer",         desc:"AGI Stat über 50",                            icon:"🏃", check:(s,b)=>(s.stats?.AGI||0)>=50 },
  { id:"ach_14",  title:"Genie",            desc:"INT Stat über 50",                            icon:"🧠", check:(s,b)=>(s.stats?.INT||0)>=50 },
  { id:"ach_15",  title:"10.000 XP",        desc:"10.000 Total-XP gesammelt",                   icon:"✨", check:(s,b)=>(s.totalXP||0)>=10000 },
  { id:"ach_16",  title:"100.000 XP",       desc:"100.000 Total-XP gesammelt",                  icon:"👑", check:(s,b)=>(s.totalXP||0)>=100000 },
  { id:"ach_17",  title:"Allrounder",       desc:"Alle 8 Stats über 0 gebracht",                icon:"🌟", check:(s,b)=>["STR","AGI","INT","CRE","CRA","VIT","END","CHA"].every(k=>(s.stats?.[k]||0)>0) },
  { id:"ach_18",  title:"Maschine",         desc:"50 Tage Streak erreicht",                     icon:"🤖", check:(s,b)=>(s.currentStreak||0)>=50 },
];

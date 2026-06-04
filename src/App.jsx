import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// CORE CONFIG
// ============================================================
const RANKS = ["E","D","C","B","A","S","SS","SSS"];
const LEVELS_PER_RANK = 10;
const TOTAL_LEVELS = RANKS.length * LEVELS_PER_RANK;

const RANK_COLORS = {
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

const XP_BASE = { E:30, D:74, C:258, B:802, A:2210, S:8487, SS:29239, SSS:191286 };
const XP_PER_LEVEL = (rank, level) => Math.floor((XP_BASE[rank]||30) * (1 + (level-1)*0.4));

const STATS_CONFIG = [
  { key:"STR", label:"Strength",     icon:"⚔️", color:"#ef4444", desc:"Muskelaufbau · Kraft · Körperzusammensetzung" },
  { key:"AGI", label:"Agility",      icon:"⚡", color:"#f59e0b", desc:"Ausdauer · Cardio · Schnelligkeit · Beweglichkeit" },
  { key:"INT", label:"Intelligence", icon:"🧠", color:"#3b82f6", desc:"Physik · Mathe · Programmieren · Wissenschaft" },
  { key:"CRE", label:"Arts",         icon:"🎨", color:"#a78bfa", desc:"Musik · Zeichnen · Kunst · Komposition" },
  { key:"CRA", label:"Craft",        icon:"🔧", color:"#f97316", desc:"Kochen · Elektronik · Engineering · Bauen" },
  { key:"VIT", label:"Vitality",     icon:"💚", color:"#22c55e", desc:"Ernährung · Schlaf · Gesundheit · Regeneration" },
  { key:"END", label:"Endurance",    icon:"🛡️", color:"#64748b", desc:"Willenskraft · Disziplin · Mentale Stärke" },
  { key:"CHA", label:"Charisma",     icon:"👑", color:"#ec4899", desc:"Soziales · Beziehungen · Auftreten", sub:["SOC","REL","APP"] },
];
const SUB_STATS = {
  SOC:{ label:"Social",    icon:"🤝", color:"#06b6d4" },
  REL:{ label:"Relations", icon:"❤️", color:"#f43f5e" },
  APP:{ label:"Appearance",icon:"✨", color:"#a78bfa" },
};
const CAT_LABELS = {
  strength:"💪 Kraft", cardio:"🏃 Cardio", skill_tech:"💻 Tech",
  skill_creative:"🎨 Kreativ", skill_practical:"🔧 Handwerk",
  social:"🤝 Sozial", appearance:"✨ Aussehen", health:"💚 Gesundheit",
  discipline:"🛡️ Disziplin", uni:"🔬 Uni/Physik", legacy:"👑 Legacy",
};

// Achievements — einmalig, automatisch freigeschaltet
const ACHIEVEMENTS = [
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
// ============================================================
// CHALLENGES DATABASE
// daily/weekly → XP only (statPts:0)
// milestones   → XP + statPts — echter Selbsttest mit klarer Frage
// Gym: Körpergewicht (KG) als Maßstab für Kraft-Gates
// ============================================================
const CHALLENGES_DB = {

  // ══════════════════════════════════════════════════════════
  // E-RANK — Novice. Erste Schritte. Grundlagen legen.
  // ══════════════════════════════════════════════════════════
  E:{
    daily:[
      {id:"e_d1",  title:"Gym: Einheit absolviert",        desc:"Ins Gym gegangen und trainiert – egal was, egal wie lang.",          xp:25, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"e_d2",  title:"10 Liegestütze",                 desc:"10 saubere Liegestütze. Brust zum Boden, Körper gerade.",            xp:18, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"e_d3",  title:"20 Kniebeugen (tiefe Hocke)",    desc:"Oberschenkel parallel zum Boden – echte Tiefe zählt.",              xp:16, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"e_d4",  title:"15 Min. Spazieren / Joggen",     desc:"Raus. Bewegen. Luft schnappen. Fang einfach an.",                    xp:15, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"e_d5",  title:"5 Min. Dehnen",                  desc:"Hüfte, Oberschenkel, Schultern – täglich dehnen baut Mobilität.",   xp:12, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"e_d6",  title:"10 Min. Physik-Notizen",         desc:"Aktiv mitschreiben oder Notizen nacharbeiten.",                      xp:20, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"e_d7",  title:"1 Physik-Aufgabe lösen",         desc:"Eine Aufgabe komplett durchrechnen – kein Abschauen.",               xp:22, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"e_d8",  title:"10 Min. Programmieren",          desc:"Editor aufmachen und tippen. Anfänger tippen auch.",                  xp:18, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"e_d9",  title:"Instrument 5 Min. anfassen",     desc:"Gitarre, Klavier, was auch immer – 5 Minuten spielen oder üben.",   xp:14, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"e_d10", title:"5 Min. Zeichnen",                desc:"Skizziere irgendwas. Kein Anspruch. Einfach machen.",                xp:13, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"e_d11", title:"Etwas selbst kochen",            desc:"Keine Fertigmahlzeit. Irgendetwas selbst zubereiten.",               xp:18, stat:"CRA", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"e_d12", title:"1,5L Wasser trinken",            desc:"Mindestens 1,5 Liter Wasser. Hydration ist unterschätzt.",           xp:12, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"e_d13", title:"Kein Fast Food heute",           desc:"Einen Tag ohne Fast Food oder Junk.",                                 xp:15, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"e_d14", title:"Vor 23:30 Uhr schlafen",         desc:"Schlaf ist Muskelaufbau, Lernen, Regeneration.",                     xp:15, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"e_d15", title:"Handy 30 Min. weglegen",         desc:"30 Minuten ohne Smartphone. Tu stattdessen etwas Produktives.",      xp:18, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"e_d16", title:"To-Do-Liste schreiben",          desc:"3 konkrete Dinge aufschreiben die du heute erledigst.",               xp:12, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"e_d17", title:"Einem Freund aktiv schreiben",   desc:"Kontakt aufnehmen – nicht warten bis jemand schreibt.",              xp:15, stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"e_d18", title:"Basis-Hygiene vollständig",      desc:"Zähne 2x, Gesicht waschen, Deo – täglich, konsequent.",              xp:10, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
    ],
    weekly:[
      {id:"e_w1", title:"3x Gym / Sport diese Woche",      desc:"3 Einheiten – Gym, Laufen, Calisthenics, alles zählt.",              xp:130, stat:"END", statPts:0, type:"weekly", cat:"strength"},
      {id:"e_w2", title:"Ernährungstagebuch 5 Tage",       desc:"5 Tage aufschreiben was du isst. Bewusstsein ist der erste Schritt.", xp:95,  stat:"VIT", statPts:0, type:"weekly", cat:"health"},
      {id:"e_w3", title:"Einen Freund real treffen",       desc:"Nicht nur chatten – echte Zeit miteinander.",                        xp:105, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"e_w4", title:"Ein Tutorial fertig machen",      desc:"Kochen, Code, Musik, Elektronik – etwas praktisch abschließen.",    xp:95,  stat:"CRA", statPts:0, type:"weekly", cat:"skill_practical"},
      {id:"e_w5", title:"Kleiderschrank aussortieren",     desc:"Wirf aus was du nicht trägst. Stil beginnt mit Klarheit.",           xp:75,  stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"e_w6", title:"Wochenplan schreiben",            desc:"Nächste Woche planen: Uni, Sport, Soziales, Kreatives.",             xp:85,  stat:"END", statPts:0, type:"weekly", cat:"discipline"},
      {id:"e_w7", title:"Neues Rezept kochen",             desc:"Ein komplett neues Gericht von Anfang bis Ende.",                    xp:90,  stat:"CRA", statPts:0, type:"weekly", cat:"skill_practical"},
    ],
    milestones:[
      {id:"e_m1",  title:"20 Liegestütze am Stück",        desc:"Selbsttest: Mach sie jetzt. 20 saubere Liegestütze ohne Pause.",     xp:300,  stat:"STR", statPts:5,  type:"milestone", cat:"strength"},
      {id:"e_m2",  title:"1 Min. Plank halten",            desc:"Selbsttest: Timer starten. 60 Sek. sauber ohne Einknicken.",         xp:250,  stat:"STR", statPts:4,  type:"milestone", cat:"strength"},
      {id:"e_m3",  title:"Erste Gym-Woche: 3x",           desc:"3 Gym-Einheiten in 7 Tagen. Jede zählt.",                             xp:350,  stat:"STR", statPts:6,  type:"milestone", cat:"strength"},
      {id:"e_m4",  title:"1km am Stück laufen",            desc:"Selbsttest: Lauf los. 1km ohne Stopp. Tempo egal.",                  xp:250,  stat:"AGI", statPts:5,  type:"milestone", cat:"cardio"},
      {id:"e_m5",  title:"3km laufen",                     desc:"3km am Stück. Dein erster echter Lauf.",                             xp:380,  stat:"AGI", statPts:7,  type:"milestone", cat:"cardio"},
      {id:"e_m6",  title:"2 Wochen täglich dehnen",        desc:"Selbsttest: Kommst du nach 14 Tagen spürbar weiter?",                xp:280,  stat:"AGI", statPts:5,  type:"milestone", cat:"cardio"},
      {id:"e_m7",  title:"Hello World – erstes Programm",  desc:"Erstes lauffähiges Programm. Python, JS, C – egal.",                xp:260,  stat:"INT", statPts:5,  type:"milestone", cat:"skill_tech"},
      {id:"e_m8",  title:"Physik-Übungsblatt vollständig", desc:"Ein ganzes Blatt komplett und eigenständig durchgearbeitet.",        xp:300,  stat:"INT", statPts:6,  type:"milestone", cat:"uni"},
      {id:"e_m9",  title:"Erstes Gericht beherrscht",      desc:"Selbsttest: Kannst du es jederzeit ohne Rezept kochen?",             xp:220,  stat:"CRE", statPts:4,  type:"milestone", cat:"skill_practical"},
      {id:"e_m10", title:"Erste vollständige Zeichnung",   desc:"Selbsttest: Eine Skizze die du jemandem zeigen würdest – ohne Scham.", xp:190, stat:"CRE", statPts:3,  type:"milestone", cat:"skill_creative"},
      {id:"e_m11", title:"Instrument: einfaches Lied",     desc:"Selbsttest: Kannst du ein einfaches Lied komplett spielen?",        xp:230,  stat:"CRE", statPts:4,  type:"milestone", cat:"skill_creative"},
      {id:"e_m12", title:"7 Tage kein Fast Food",          desc:"Eine Woche konsequent. Beweis dass du es kannst.",                   xp:290,  stat:"VIT", statPts:5,  type:"milestone", cat:"health"},
      {id:"e_m13", title:"7-Tage Habit Streak",            desc:"Irgendeinen Habit 7 Tage am Stück. Kein Aussetzer.",                 xp:360,  stat:"END", statPts:7,  type:"milestone", cat:"discipline"},
      {id:"e_m14", title:"5 neue Menschen kennengelernt",  desc:"5 Personen aktiv angesprochen und ein echtes Gespräch geführt.",    xp:310,  stat:"CHA", statPts:5,  type:"milestone", cat:"social"},
    ],
  },

  // ══════════════════════════════════════════════════════════
  // D-RANK — Awakened. Erste messbare Resultate.
  // ══════════════════════════════════════════════════════════
  D:{
    daily:[
      {id:"d_d1",  title:"Gym: Push-Day",                  desc:"Brust, Schultern, Trizeps – Langhantel, Kurzhanteln, Maschinen.",    xp:35, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"d_d2",  title:"Gym: Pull-Day",                  desc:"Rücken, Bizeps – Klimmzüge (oder Latzug), Rudern, Curls.",           xp:35, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"d_d3",  title:"Gym: Leg-Day",                   desc:"Kniebeugen, Beinpresse, Ausfallschritte, Calf Raises.",              xp:35, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"d_d4",  title:"Negative Klimmzüge (5 Stück)",   desc:"Langsam von oben nach unten. Baut Klimmzug-Kraft auf.",              xp:32, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"d_d5",  title:"3km Joggen",                     desc:"3km am Stück. Konstant, kein Stopp.",                                xp:32, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"d_d6",  title:"10 Min. Stretching",             desc:"Gründliches Dehnen – Hüfte, Brust, Schultern.",                     xp:18, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"d_d7",  title:"30 Min. Physik lernen",          desc:"Aufgaben rechnen, nicht nur lesen. Aktives Lernen.",                 xp:35, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"d_d8",  title:"30 Min. Programmieren",          desc:"Tägliches Coden. Kleines Problem lösen oder Projekt voranbringen.",  xp:32, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"d_d9",  title:"15 Min. Instrument üben",        desc:"Konzentriert üben mit konkretem Ziel.",                              xp:28, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"d_d10", title:"15 Min. Zeichnen",               desc:"Proportionen, Perspektive, Licht – täglich üben.",                  xp:24, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"d_d11", title:"Neues Gericht kochen",           desc:"Frische Zutaten, echter Aufwand, kein Fertigprodukt.",              xp:25, stat:"CRA", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"d_d12", title:"2L Wasser + 120g Protein",       desc:"Protein und Hydration gleichzeitig tracken.",                       xp:25, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"d_d13", title:"Morgenroutine (15 Min.)",        desc:"Aufstehen → Wasser → kurze Bewegung → Tag planen.",                 xp:25, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"d_d14", title:"Skincare Morgens",               desc:"Gesicht reinigen + Feuchtigkeitspflege – täglich.",                  xp:18, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
      {id:"d_d15", title:"Gespräch aktiv starten",         desc:"Heute ein echtes Gespräch beginnen – kein Smalltalk.",              xp:25, stat:"CHA", statPts:0, type:"daily", cat:"social"},
    ],
    weekly:[
      {id:"d_w1", title:"5x Gym diese Woche",              desc:"5 Einheiten. Push, Pull, Legs, Cardio – nach Plan.",                 xp:210, stat:"END", statPts:0, type:"weekly", cat:"strength"},
      {id:"d_w2", title:"Freund real treffen",              desc:"Echte Zeit miteinander – kein Chat-Ersatz.",                        xp:155, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"d_w3", title:"Uni-Woche planen",                desc:"Plane was du wann lernst. Struktur schlägt Motivation.",             xp:135, stat:"INT", statPts:0, type:"weekly", cat:"uni"},
      {id:"d_w4", title:"Coding-Projekt starten",          desc:"Ein eigenes kleines Projekt anfangen – keine Tutorial-Kopie.",      xp:185, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"d_w5", title:"3 gesunde Mahlzeiten/Tag (5d)",   desc:"5 Tage: 3 vollwertige selbst zubereitete Mahlzeiten täglich.",      xp:175, stat:"VIT", statPts:0, type:"weekly", cat:"health"},
      {id:"d_w6", title:"Outfit diese Woche bewusst",      desc:"Jeden Tag bewusst auf Kleidung und Gepflegtheit achten.",            xp:105, stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"d_w7", title:"Elektronik-Einstieg",             desc:"Arduino Basics, einfacher Schaltkreis, Tutorial – anfangen.",       xp:160, stat:"CRA", statPts:0, type:"weekly", cat:"skill_practical"},
    ],
    milestones:[
      {id:"d_m1",  title:"Erster sauberer Klimmzug",       desc:"Selbsttest: Hänge dich ran. 1 echter Klimmzug – Kinn über Stange.", xp:750,  stat:"STR", statPts:15, type:"milestone", cat:"strength"},
      {id:"d_m2",  title:"50 Liegestütze am Stück",        desc:"Selbsttest: 50 saubere Liegestütze ohne Pause.",                    xp:520,  stat:"STR", statPts:10, type:"milestone", cat:"strength"},
      {id:"d_m3",  title:"Bankdrücken: 60% Körpergewicht", desc:"Selbsttest: Drückst du 60% deines KG auf der Langhantel?",         xp:620,  stat:"STR", statPts:12, type:"milestone", cat:"strength"},
      {id:"d_m4",  title:"Kniebeugen: eigenes KG",         desc:"Selbsttest: Kniebeuge mit deinem Körpergewicht – tief und sauber.", xp:670,  stat:"STR", statPts:13, type:"milestone", cat:"strength"},
      {id:"d_m5",  title:"5km laufen",                     desc:"Selbsttest: 5km am Stück ohne Stopp.",                               xp:630,  stat:"AGI", statPts:12, type:"milestone", cat:"cardio"},
      {id:"d_m6",  title:"5km unter 30 Minuten",           desc:"Selbsttest: Pace unter 6:00/km auf 5km.",                            xp:760,  stat:"AGI", statPts:14, type:"milestone", cat:"cardio"},
      {id:"d_m7",  title:"Eigenes Programm (30+ Zeilen)",  desc:"Ein Programm das wirklich etwas tut. Eigene Logik, kein Kopieren.",  xp:530,  stat:"INT", statPts:10, type:"milestone", cat:"skill_tech"},
      {id:"d_m8",  title:"Physik-Prüfung bestanden",       desc:"Eine Klausur oder Prüfung eigenständig bestanden.",                 xp:860,  stat:"INT", statPts:17, type:"milestone", cat:"uni"},
      {id:"d_m9",  title:"3 Gerichte ohne Rezept",         desc:"Selbsttest: 3 Gerichte die du jederzeit aus dem Kopf kochst.",      xp:430,  stat:"CRE", statPts:8,  type:"milestone", cat:"skill_practical"},
      {id:"d_m10", title:"Instrument: Lied A-Z spielen",   desc:"Selbsttest: Ein vollständiges Lied – erkennbar und flüssig.",       xp:490,  stat:"CRE", statPts:9,  type:"milestone", cat:"skill_creative"},
      {id:"d_m11", title:"Zeichnen: Person skizzieren",    desc:"Selbsttest: Zeichne eine Person – ist sie als Mensch erkennbar?",  xp:390,  stat:"CRE", statPts:7,  type:"milestone", cat:"skill_creative"},
      {id:"d_m12", title:"14-Tage Habit Streak",           desc:"Einen Habit 14 Tage am Stück. Kein einziger Aussetzer.",            xp:530,  stat:"END", statPts:10, type:"milestone", cat:"discipline"},
      {id:"d_m13", title:"Hautpflege 30 Tage konsequent",  desc:"Selbsttest: Siehst du nach 30 Tagen einen Unterschied?",           xp:480,  stat:"CHA", statPts:9,  type:"milestone", cat:"appearance"},
      {id:"d_m14", title:"10 echte Gespräche mit Freunden", desc:"10 tiefe, ehrliche Gespräche – kein Smalltalk.",                  xp:410,  stat:"CHA", statPts:8,  type:"milestone", cat:"social"},
    ],
  },

  // ══════════════════════════════════════════════════════════
  // C-RANK — Hunter. Konsistenz ist Gewohnheit geworden.
  // ══════════════════════════════════════════════════════════
  C:{
    daily:[
      {id:"c_d1",  title:"Gym: Push-Day (gewichtet)",      desc:"Progressive Overload. Jede Woche etwas mehr.",                       xp:60, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"c_d2",  title:"Gym: Pull-Day (gewichtet)",      desc:"Klimmzüge mit Gewicht, schweres Rudern, Facepulls.",                  xp:60, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"c_d3",  title:"Gym: Leg-Day (gewichtet)",       desc:"Kniebeugen mit Gewicht, Romanian Deadlift, Beinpresse.",             xp:62, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"c_d4",  title:"5km Joggen",                     desc:"5km gleichmäßig. Nicht schnell – konstant.",                         xp:55, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"c_d5",  title:"15 Min. Mobility",               desc:"Hüfte, Brust, Schultern – gezielt Mobilität verbessern.",           xp:30, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"c_d6",  title:"1h Physik studieren",            desc:"Aufgaben rechnen, Konzepte wirklich verstehen.",                     xp:60, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"c_d7",  title:"45 Min. Programmieren",          desc:"An einem eigenen Projekt arbeiten – echte Probleme lösen.",          xp:55, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"c_d8",  title:"20 Min. Elektronik / Engineering", desc:"Schaltpläne, Arduino, Simulation, Löten.",                         xp:45, stat:"CRA", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"c_d9",  title:"20 Min. Instrument üben",        desc:"Scales, Stücke, Technik – strukturiert üben.",                      xp:40, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"c_d10", title:"20 Min. Zeichnen",               desc:"Figuren, Landschaften, Porträts – täglich besser werden.",           xp:38, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"c_d11", title:"Anspruchsvolles Gericht kochen", desc:"Mehrere Techniken, frische Zutaten, anspruchsvolles Rezept.",        xp:36, stat:"CRA", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"c_d12", title:"2,5L Wasser + 150g Protein",    desc:"Protein und Hydration täglich tracken.",                             xp:35, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"c_d13", title:"Kalte Dusche",                   desc:"Jeden Tag kalt – Willenskraft und Durchblutung.",                    xp:35, stat:"END", statPts:0, type:"daily", cat:"health"},
      {id:"c_d14", title:"Morgenroutine (30 Min.)",        desc:"Bewegung, Planung, Intention setzen.",                               xp:40, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"c_d15", title:"Skincare Morgens + Abends",      desc:"Vollständige Routine zweimal täglich.",                              xp:25, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
      {id:"c_d16", title:"Jemanden aktiv unterstützen",    desc:"Hilf jemandem heute – Rat, Zeit oder Tat.",                         xp:38, stat:"CHA", statPts:0, type:"daily", cat:"social"},
    ],
    weekly:[
      {id:"c_w1", title:"Gym 5x + Push/Pull/Legs Split",   desc:"Vollständiger Split. Progressive Overload: jede Woche mehr.",       xp:310, stat:"STR", statPts:0, type:"weekly", cat:"strength"},
      {id:"c_w2", title:"Cold Shower 7 Tage",              desc:"Jeden Tag diese Woche kalt duschen.",                                xp:260, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
      {id:"c_w3", title:"Coding-Projekt diese Woche",      desc:"Täglich am selben Projekt – Ende der Woche: etwas Lauffähiges.",   xp:310, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"c_w4", title:"2 Freunde aktiv kontaktieren",    desc:"Nicht warten – 2 Freunde diese Woche aktiv kontaktieren.",          xp:230, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"c_w5", title:"Kleidungs-Upgrade",               desc:"Neues Teil kaufen oder Frisur auffrischen.",                        xp:185, stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"c_w6", title:"Lied diese Woche täglich üben",   desc:"Konkretes Stück täglich üben – Fortschritt am Ende der Woche?",    xp:280, stat:"CRE", statPts:0, type:"weekly", cat:"skill_creative"},
      {id:"c_w7", title:"Meal Prep für die Woche",         desc:"Mahlzeiten für 3-5 Tage planen und vorbereiten.",                   xp:240, stat:"VIT", statPts:0, type:"weekly", cat:"health"},
      {id:"c_w8", title:"Elektronik-Projekt abschließen",  desc:"Bauen, löten, programmieren – ein kleines Projekt fertig.",        xp:290, stat:"CRA", statPts:0, type:"weekly", cat:"skill_practical"},
    ],
    milestones:[
      {id:"c_m1",  title:"10 Klimmzüge am Stück",          desc:"Selbsttest: 10 saubere Klimmzüge ohne Pause.",                      xp:1250, stat:"STR", statPts:22, type:"milestone", cat:"strength"},
      {id:"c_m2",  title:"Bankdrücken: eigenes KG",        desc:"Selbsttest: Drückst du dein eigenes Körpergewicht? 1 Wiederholung.", xp:1100, stat:"STR", statPts:20, type:"milestone", cat:"strength"},
      {id:"c_m3",  title:"Kniebeugen: 1,25x KG",          desc:"Selbsttest: 1,25x dein KG – tief, sauber, kein Kippen.",            xp:1200, stat:"STR", statPts:21, type:"milestone", cat:"strength"},
      {id:"c_m4",  title:"Sichtbare Körperveränderung",    desc:"Selbsttest: Siehst du im Spiegel einen Unterschied zu vor 8 Wochen?", xp:1300, stat:"STR", statPts:23, type:"milestone", cat:"strength"},
      {id:"c_m5",  title:"10km laufen",                    desc:"Selbsttest: 10km am Stück ohne Stopp.",                              xp:1050, stat:"AGI", statPts:19, type:"milestone", cat:"cardio"},
      {id:"c_m6",  title:"10km unter 55 Minuten",          desc:"Selbsttest: Pace unter 5:30/km auf 10km.",                           xp:1150, stat:"AGI", statPts:20, type:"milestone", cat:"cardio"},
      {id:"c_m7",  title:"Boden berühren (gerade Beine)",  desc:"Selbsttest: Kannst du mit geraden Beinen den Boden berühren?",      xp:700,  stat:"AGI", statPts:13, type:"milestone", cat:"cardio"},
      {id:"c_m8",  title:"Eigene App / Tool gebaut",       desc:"Etwas das wirklich funktioniert und du selbst benutzt.",             xp:1450, stat:"INT", statPts:26, type:"milestone", cat:"skill_tech"},
      {id:"c_m9",  title:"Arduino-Projekt fertig",         desc:"Funktionsfähiges Elektronikprojekt – Hardware + Code.",             xp:1150, stat:"CRA", statPts:20, type:"milestone", cat:"skill_practical"},
      {id:"c_m10", title:"Physik-Seminar/Praktikum",       desc:"Experimentalphysik-Praktikum oder Seminar erfolgreich.",            xp:1050, stat:"INT", statPts:19, type:"milestone", cat:"uni"},
      {id:"c_m11", title:"Instrument: vor jemandem spielen", desc:"Selbsttest: Spielst du das Lied jemandem vor – ohne Scham?",      xp:950,  stat:"CRE", statPts:17, type:"milestone", cat:"skill_creative"},
      {id:"c_m12", title:"Zeichnen: erkennbares Gesicht",  desc:"Selbsttest: Zeichne ein Gesicht – ist es als solches erkennbar?",  xp:820,  stat:"CRE", statPts:15, type:"milestone", cat:"skill_creative"},
      {id:"c_m13", title:"10 Gerichte ohne Rezept",        desc:"Selbsttest: 10 Gerichte die du jederzeit aus dem Kopf kochst.",    xp:860,  stat:"CRA", statPts:15, type:"milestone", cat:"skill_practical"},
      {id:"c_m14", title:"Sauce von Grund auf kochen",     desc:"Selbsttest: Bechamel, Bolognese oder Hollandaise – selbst gemacht.", xp:760, stat:"CRA", statPts:13, type:"milestone", cat:"skill_practical"},
      {id:"c_m15", title:"30-Tage Cold Shower",            desc:"30 Tage kalt duschen. Nicht ein einziger Aussetzer.",               xp:840,  stat:"END", statPts:15, type:"milestone", cat:"discipline"},
      {id:"c_m16", title:"Tiefe Freundschaft entwickelt",  desc:"Selbsttest: Hast du jemanden dem du alles erzählen würdest?",      xp:960,  stat:"CHA", statPts:17, type:"milestone", cat:"social"},
      // VIT Meilensteine ab C-Rank
      {id:"c_m17", title:"3 Monate saubere Ernährung",    desc:"Selbsttest: Hast du 3 Monate lang keinen Junk gegessen?",             xp:1100, stat:"VIT", statPts:20, type:"milestone", cat:"health"},
      {id:"c_m18", title:"30 Tage vor Mitternacht schlafen", desc:"Selbsttest: 30 Tage in Folge vor 0:00 Uhr. Kein einziger Aussetzer.", xp:900, stat:"VIT", statPts:16, type:"milestone", cat:"health"},
      // END Meilensteine ab C-Rank
      {id:"c_m19", title:"60-Tage Habit Streak",          desc:"Selbsttest: 60 Tage am Stück denselben Habit. Kein Aussetzer.",       xp:1050, stat:"END", statPts:19, type:"milestone", cat:"discipline"},
      {id:"c_m20", title:"Kein Handy bis 10 Uhr – 30 Tage", desc:"Selbsttest: Handy nach dem Aufstehen 2h weglegen – 30 Tage?",      xp:850,  stat:"END", statPts:15, type:"milestone", cat:"discipline"},
      // REL Meilensteine (keine Romantik nötig)
      {id:"c_m21", title:"Verletzlichkeit gezeigt",       desc:"Selbsttest: Hast du jemandem etwas erzählt das du normalerweise verschweigst?", xp:780, stat:"CHA", subStat:"REL", statPts:14, type:"milestone", cat:"social"},
      {id:"c_m22", title:"Konflikt aufgelöst",            desc:"Selbsttest: Hast du einen echten Konflikt direkt und ruhig gelöst?",  xp:820,  stat:"CHA", subStat:"REL", statPts:15, type:"milestone", cat:"social"},
    ],
  },

  // ══════════════════════════════════════════════════════════
  // B-RANK — Elite Hunter. Du übertriffst 90% der Menschen.
  // ══════════════════════════════════════════════════════════
  B:{
    daily:[
      {id:"b_d1",  title:"Gym: Push schwer",               desc:"Progressive Overload – jede Einheit etwas mehr als letzte.",         xp:85, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"b_d2",  title:"Gym: Pull schwer",               desc:"Klimmzüge, Langhantelrudern, Facepulls – Rücken aufbauen.",          xp:85, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"b_d3",  title:"Gym: Legs schwer",               desc:"Kniebeugen mit Gewicht, Romanian Deadlift, Beinpresse.",             xp:90, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"b_d4",  title:"8km Joggen",                     desc:"8km täglich. Konstantes Tempo.",                                      xp:90, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"b_d5",  title:"2h Deep Work (Physik/Mathe)",    desc:"2 Stunden totaler Fokus. Keine Unterbrechung.",                      xp:95, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"b_d6",  title:"1h Programmieren (Projekt)",     desc:"Eigenes Projekt voranbringen. Echte Probleme lösen.",                xp:90, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"b_d7",  title:"30 Min. Engineering/Elektronik", desc:"Schaltungen entwerfen, simulieren, löten oder CAD.",                 xp:80, stat:"INT", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"b_d8",  title:"30 Min. Instrument",             desc:"Strukturiert üben mit konkretem Wochenziel.",                        xp:65, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"b_d9",  title:"30 Min. Zeichnen / Design",      desc:"Figuren, Porträts, digitale Kunst – täglich besser.",                xp:62, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"b_d10", title:"Gericht von Grund auf",          desc:"Frische Zutaten, keine Halbfertigprodukte, eigene Sauce.",           xp:58, stat:"CRA", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"b_d11", title:"Meal Prep + Makros tracken",     desc:"Alle Mahlzeiten vorbereitet und Makros getrackt.",                   xp:72, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"b_d12", title:"Cold Shower + 45 Min. Morgen",   desc:"Kalt duschen + vollständige Morgenroutine.",                         xp:78, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"b_d13", title:"Jemandem wirklich zuhören",      desc:"Echtes aktives Zuhören. Kein Handy, keine Unterbrechungen.",        xp:58, stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"b_d14", title:"Grooming komplett",              desc:"Haut, Haare, Bart, Körper – alles vollständig gepflegt.",            xp:48, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
    ],
    weekly:[
      {id:"b_w1", title:"Gym 5x + Progressive Overload",   desc:"5x Gym. Jede Woche mehr Gewicht oder mehr Wiederholungen.",         xp:420, stat:"STR", statPts:0, type:"weekly", cat:"strength"},
      {id:"b_w2", title:"Vor Gruppe sprechen",              desc:"Seminar, Lerngruppe, Kommilitonen – laut und klar reden.",          xp:440, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"b_w3", title:"GitHub täglich pushen",            desc:"Jeden Tag dieser Woche Code committen.",                             xp:395, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"b_w4", title:"Tiefgespräch führen",              desc:"Ein ehrliches, echtes Gespräch. Kein Smalltalk.",                   xp:315, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"b_w5", title:"Komplexes Gericht meistern",       desc:"Ein aufwendiges Gericht das du noch nie gemacht hast.",             xp:295, stat:"CRA", statPts:0, type:"weekly", cat:"skill_practical"},
      {id:"b_w6", title:"Progress-Foto + Körpermessung",    desc:"Wöchentliches Foto + Taille/Brust/Arme messen.",                   xp:260, stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"b_w7", title:"Neue Programmier-Technik",         desc:"Neuen Algorithmus, Pattern oder Framework lernen und anwenden.",   xp:355, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
    ],
    milestones:[
      {id:"b_m1",  title:"Bankdrücken: 1,25x KG",          desc:"Selbsttest: 1,25x dein Körpergewicht – 1 saubere Wiederholung.",    xp:2950, stat:"STR", statPts:40, type:"milestone", cat:"strength"},
      {id:"b_m2",  title:"Kniebeugen: 1,5x KG",           desc:"Selbsttest: 1,5x dein KG – tief, sauber, kein Kippen.",             xp:3050, stat:"STR", statPts:41, type:"milestone", cat:"strength"},
      {id:"b_m3",  title:"Kreuzheben: 1,5x KG",           desc:"Selbsttest: 1,5x dein KG vom Boden – kein Rundrücken.",             xp:3150, stat:"STR", statPts:43, type:"milestone", cat:"strength"},
      {id:"b_m4",  title:"20 Klimmzüge am Stück",          desc:"Selbsttest: 20 saubere Klimmzüge ohne Pause.",                      xp:2900, stat:"STR", statPts:39, type:"milestone", cat:"strength"},
      {id:"b_m5",  title:"Körperfett unter 15%",           desc:"Selbsttest: Sieht man im hellen Licht Bauchmuskeln-Ansatz?",        xp:2650, stat:"STR", statPts:36, type:"milestone", cat:"strength"},
      {id:"b_m6",  title:"Halbmarathon (21km)",             desc:"Selbsttest: 21km am Stück. Kein Stopp.",                            xp:3150, stat:"AGI", statPts:43, type:"milestone", cat:"cardio"},
      {id:"b_m7",  title:"15km unter 75 Minuten",          desc:"Selbsttest: 15km unter 5:00/km Pace.",                               xp:2750, stat:"AGI", statPts:37, type:"milestone", cat:"cardio"},
      {id:"b_m8",  title:"Spagat fast erreicht",           desc:"Selbsttest: Kommen deine Hüften unter 20cm über den Boden?",        xp:1850, stat:"AGI", statPts:25, type:"milestone", cat:"cardio"},
      {id:"b_m9",  title:"Eigene Website live",             desc:"Deine Website im Internet – selbst gebaut, selbst deployed.",       xp:3150, stat:"INT", statPts:43, type:"milestone", cat:"skill_tech"},
      {id:"b_m10", title:"Komplexes Elektronikprojekt",     desc:"Mikrocontroller + Code + Hardware. Fertig und funktioniert.",       xp:2750, stat:"CRA", statPts:37, type:"milestone", cat:"skill_practical"},
      {id:"b_m11", title:"Uni-Semester überdurchschnittlich", desc:"Ein Semester mit Noten klar über dem Durchschnitt.",              xp:3650, stat:"INT", statPts:47, type:"milestone", cat:"uni"},
      {id:"b_m12", title:"Instrument: vor Fremden spielen", desc:"Selbsttest: Spielst du vor jemandem den du kaum kennst?",          xp:2350, stat:"CRE", statPts:32, type:"milestone", cat:"skill_creative"},
      {id:"b_m13", title:"Zeichnen: erkennbares Porträt",   desc:"Selbsttest: Zeichne jemanden – erkennt man diese Person?",        xp:2050, stat:"CRE", statPts:28, type:"milestone", cat:"skill_creative"},
      {id:"b_m14", title:"3-Gang-Menü für Gäste kochen",    desc:"Selbsttest: Vorspeise, Hauptgang, Dessert – Gäste beeindruckt?",  xp:2150, stat:"CRA", statPts:29, type:"milestone", cat:"skill_practical"},
      {id:"b_m15", title:"3 tiefe Freundschaften",          desc:"Selbsttest: Hast du 3 Menschen denen du alles erzählen kannst?",  xp:2150, stat:"CHA", statPts:29, type:"milestone", cat:"social"},
      // VIT
      {id:"b_m16", title:"6 Monate Ernährung konsequent",  desc:"Selbsttest: 6 Monate lang Makros getrackt und eingehalten?",          xp:2400, stat:"VIT", statPts:32, type:"milestone", cat:"health"},
      {id:"b_m17", title:"90 Tage optimaler Schlaf",       desc:"Selbsttest: 90 Tage 7,5h+ Schlaf und vor 23:30 ins Bett?",            xp:2200, stat:"VIT", statPts:30, type:"milestone", cat:"health"},
      {id:"b_m18", title:"Kein Alkohol 3 Monate",         desc:"Selbsttest: 90 Tage komplett nüchtern. Kannst du das?",                xp:2000, stat:"VIT", statPts:27, type:"milestone", cat:"health"},
      // END
      {id:"b_m19", title:"90-Tage Disziplin-Streak",      desc:"Selbsttest: Jeden Tag dieselben Kern-Habits – 90 Tage am Stück?",     xp:2600, stat:"END", statPts:35, type:"milestone", cat:"discipline"},
      {id:"b_m20", title:"Unbequeme Situation durchgehalten", desc:"Selbsttest: Hast du etwas Schwieriges zu Ende gebracht obwohl du aufhören wolltest?", xp:1900, stat:"END", statPts:26, type:"milestone", cat:"discipline"},
      // REL
      {id:"b_m21", title:"Jemanden in Krise begleitet",   desc:"Selbsttest: Warst du für jemanden da der wirklich Hilfe brauchte?",   xp:1950, stat:"CHA", subStat:"REL", statPts:26, type:"milestone", cat:"social"},
      {id:"b_m22", title:"Grenzen gesetzt und gehalten",  desc:"Selbsttest: Hast du jemandem klar Nein gesagt und es durchgehalten?",  xp:1750, stat:"CHA", subStat:"REL", statPts:24, type:"milestone", cat:"social"},
    ],
  },

  // ══════════════════════════════════════════════════════════
  // A-RANK — Advanced Hunter. Top 5%.
  // ══════════════════════════════════════════════════════════
  A:{
    daily:[
      {id:"a_d1",  title:"Gym: Push (Elite)",              desc:"Schwere Einheit. Progressive Overload. Comfort Zone ist Geschichte.", xp:125, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"a_d2",  title:"Gym: Pull (Elite)",              desc:"Klimmzüge, schweres Rudern, Face Pulls – maximale Intensität.",       xp:125, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"a_d3",  title:"Gym: Legs (Elite)",              desc:"Kniebeugen, Deadlift, Beinpresse – alles schwer.",                   xp:130, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"a_d4",  title:"15km Laufen",                    desc:"15km täglich. Pace unter 5:30/km.",                                   xp:132, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"a_d5",  title:"3h Deep Work",                   desc:"3 Stunden absoluter Fokus. Weltklasse-Output.",                      xp:138, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"a_d6",  title:"1,5h Programmieren (advanced)",  desc:"Komplexe Projekte, Algorithmen, System Design.",                     xp:128, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"a_d7",  title:"Sprache 30 Min.",                desc:"Englisch perfektionieren oder neue Sprache lernen.",                  xp:92,  stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"a_d8",  title:"45 Min. Instrument",             desc:"Improvisation, eigene Stücke, fortgeschrittene Technik.",            xp:98,  stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"a_d9",  title:"45 Min. Zeichnen / kreativ",     desc:"Fortgeschrittene Techniken, Stile, eigene Werke erschaffen.",        xp:92,  stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"a_d10", title:"Gourmet-Gericht kochen",         desc:"Komplexe Saucen, Timing, mehrere Komponenten.",                     xp:82,  stat:"CRA", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"a_d11", title:"Ernährungsplan 100%",            desc:"Kalorien, Protein, Mikros – alles heute perfekt.",                   xp:92,  stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"a_d12", title:"6 Uhr aufstehen",                desc:"6 Uhr. Täglich. Keine Ausnahme.",                                    xp:102, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"a_d13", title:"Abend-Reflexion (20 Min.)",      desc:"Was war gut? Was lernst du? Was planst du?",                        xp:78,  stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"a_d14", title:"Jemanden inspirieren",           desc:"Dein Verhalten oder Wissen motiviert heute jemanden.",               xp:88,  stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"a_d15", title:"Appearance: alles auf 10/10",    desc:"Frisur, Kleidung, Haut, Körperhaltung – perfekt.",                  xp:78,  stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
    ],
    weekly:[
      {id:"a_w1", title:"6x Gym + Ernährungsplan",          desc:"6 Einheiten + Ernährung perfekt getrackt.",                         xp:620, stat:"STR", statPts:0, type:"weekly", cat:"strength"},
      {id:"a_w2", title:"Sprache: 3h diese Woche",          desc:"3h Sprachlernen. Vokabeln, Sprechen, Lesen.",                       xp:570, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"a_w3", title:"Für 2 Freunde echte Zeit",         desc:"Für 2 Freunde wirklich da sein – nicht nur körperlich anwesend.",  xp:485, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"a_w4", title:"Kreatives Werk vollenden",         desc:"Ein kreatives Projekt diese Woche fertigstellen.",                  xp:545, stat:"CRE", statPts:0, type:"weekly", cat:"skill_creative"},
      {id:"a_w5", title:"Alles dokumentieren",              desc:"Körper, Skills, Lernen, Soziales – messen und notieren.",           xp:435, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
    ],
    milestones:[
      {id:"a_m1",  title:"Bankdrücken: 1,5x KG",           desc:"Selbsttest: 1,5x dein KG – 1 saubere Wiederholung.",               xp:7300, stat:"STR", statPts:73, type:"milestone", cat:"strength"},
      {id:"a_m2",  title:"Kniebeugen: 2x KG",              desc:"Selbsttest: 2x dein KG – tief, sauber, kein Kippen.",               xp:7600, stat:"STR", statPts:76, type:"milestone", cat:"strength"},
      {id:"a_m3",  title:"Kreuzheben: 2x KG",              desc:"Selbsttest: 2x dein KG vom Boden – saubere Form.",                  xp:7900, stat:"STR", statPts:79, type:"milestone", cat:"strength"},
      {id:"a_m4",  title:"30 Klimmzüge am Stück",          desc:"Selbsttest: 30 saubere Klimmzüge ohne Pause.",                     xp:6800, stat:"STR", statPts:68, type:"milestone", cat:"strength"},
      {id:"a_m5",  title:"Muskeln sichtbar: Brust+Arme+Bauch", desc:"Selbsttest: Fotos im hellen Licht – sieht man alle drei?",     xp:8300, stat:"STR", statPts:83, type:"milestone", cat:"strength"},
      {id:"a_m6",  title:"Marathon (42km)",                 desc:"Selbsttest: 42km am Stück. Du bist jetzt Marathonläufer.",         xp:7300, stat:"AGI", statPts:73, type:"milestone", cat:"cardio"},
      {id:"a_m7",  title:"25km unter 2 Stunden",           desc:"Selbsttest: 25km unter 4:48/km Pace.",                              xp:5900, stat:"AGI", statPts:59, type:"milestone", cat:"cardio"},
      {id:"a_m8",  title:"Voller Spagat",                  desc:"Selbsttest: Beide Beine komplett am Boden – echter Spagat.",        xp:4600, stat:"AGI", statPts:46, type:"milestone", cat:"cardio"},
      {id:"a_m9",  title:"Projekt mit echten Nutzern",     desc:"App oder Tool das andere Menschen wirklich benutzen.",              xp:7300, stat:"INT", statPts:73, type:"milestone", cat:"skill_tech"},
      {id:"a_m10", title:"Bachelor Physik bestanden",      desc:"Bachelor-Abschluss erfolgreich abgelegt.",                          xp:15700, stat:"INT", statPts:126, type:"milestone", cat:"uni"},
      {id:"a_m11", title:"Sprache auf B2",                 desc:"Selbsttest: Kannst du ein flüssiges Gespräch führen?",              xp:5300, stat:"INT", statPts:53, type:"milestone", cat:"skill_tech"},
      {id:"a_m12", title:"Instrument: eigene Komposition", desc:"Selbsttest: Hast du ein Stück selbst geschrieben und gespielt?",   xp:5800, stat:"CRE", statPts:58, type:"milestone", cat:"skill_creative"},
      {id:"a_m13", title:"Zeichnen: Person aus Fantasie",  desc:"Selbsttest: Zeichne eine Person aus dem Kopf – erkennbar?",        xp:4900, stat:"CRE", statPts:49, type:"milestone", cat:"skill_creative"},
      {id:"a_m14", title:"5-Gang-Menü für Gäste",          desc:"Selbsttest: 5 Gänge selbst – Gäste sind beeindruckt?",             xp:4700, stat:"CRA", statPts:47, type:"milestone", cat:"skill_practical"},
      {id:"a_m15", title:"Körpertransformation dokumentiert", desc:"Vorher/Nachher über 6 Monate – sichtbarer Unterschied.",        xp:8600, stat:"STR", statPts:86, type:"milestone", cat:"strength"},
      // VIT
      {id:"a_m16", title:"1 Jahr gesunde Ernährung",      desc:"Selbsttest: Ein volles Jahr konsequente Ernährung ohne große Ausreißer?", xp:9500, stat:"VIT", statPts:75, type:"milestone", cat:"health"},
      {id:"a_m17", title:"6 Monate optimaler Schlaf",     desc:"Selbsttest: 6 Monate lang täglich 7,5h+ und regelmäßige Zeiten?",     xp:8000, stat:"VIT", statPts:64, type:"milestone", cat:"health"},
      // END
      {id:"a_m18", title:"1 Jahr tägliche Habits",        desc:"Selbsttest: Dieselben Kern-Habits ein volles Jahr lang täglich?",      xp:11000, stat:"END", statPts:88, type:"milestone", cat:"discipline"},
      {id:"a_m19", title:"Angst überwunden",              desc:"Selbsttest: Hast du etwas getan das dir wirklich Angst gemacht hat?",  xp:7500,  stat:"END", statPts:60, type:"milestone", cat:"discipline"},
      // REL
      {id:"a_m20", title:"Echte Verletzlichkeit langfristig", desc:"Selbsttest: Gibt es Menschen die dich wirklich kennen – auch deine Schwächen?", xp:7000, stat:"CHA", subStat:"REL", statPts:56, type:"milestone", cat:"social"},
      {id:"a_m21", title:"Beziehung aufgebaut oder gepflegt", desc:"Selbsttest: Hast du eine tiefe romantische oder platonische Bindung aktiv gepflegt?", xp:7500, stat:"CHA", subStat:"REL", statPts:60, type:"milestone", cat:"social"},
    ],
  },

  // ══════════════════════════════════════════════════════════
  // S-RANK — Elite. Kompromisslos. Top 1%.
  // ══════════════════════════════════════════════════════════
  S:{
    daily:[
      {id:"s_d1",  title:"Gym: 2h Heavy Session",          desc:"Schweres Training 2 Stunden. Kein Schummeln.",                       xp:205, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"s_d2",  title:"400 Liegestütze",                desc:"400 täglich. Aufgeteilt wenn nötig, aber alle.",                     xp:205, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"s_d3",  title:"20km Laufen",                    desc:"20km täglich. Sub-5:00/km.",                                          xp:215, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"s_d4",  title:"5h Deep Work",                   desc:"5 Stunden totale Konzentration. Weltklasse-Produktivität.",           xp:220, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"s_d5",  title:"2h Programmieren (Expert)",      desc:"Komplexe Algorithmen, Frameworks, Research-Level Code.",              xp:210, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"s_d6",  title:"1h kreativ erschaffen",          desc:"Musik, Kunst, Design – täglich auf professionellem Niveau.",         xp:180, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"s_d7",  title:"Ernährung: perfekter Tag",       desc:"Kalorien, Makros, Mikros, Timing – absolut perfekt.",                xp:160, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"s_d8",  title:"5:30 Uhr aufstehen",             desc:"5:30 Uhr. Täglich. Keine Ausnahmen.",                                xp:170, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"s_d9",  title:"Jemanden mentoren",              desc:"Jemandem helfen besser zu werden – aktiv Wissen weitergeben.",       xp:170, stat:"CHA", statPts:0, type:"daily", cat:"social"},
    ],
    weekly:[
      {id:"s_w1", title:"7x Training",                     desc:"7 Tage Training. Aktive Regeneration zählt.",                        xp:980,  stat:"END", statPts:0, type:"weekly", cat:"strength"},
      {id:"s_w2", title:"Extreme Disziplin-Woche",         desc:"7 Tage: kein Junk, kein Alkohol, 7h+ Schlaf, alle Habits.",         xp:1150, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
      {id:"s_w3", title:"Projekt publizieren",             desc:"GitHub, Artikel, Musik, Design – etwas veröffentlichen.",           xp:980,  stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"s_w4", title:"3 wichtige Beziehungen",          desc:"3 Menschen in deinem Leben aktiv diese Woche investieren.",         xp:830,  stat:"CHA", statPts:0, type:"weekly", cat:"social"},
    ],
    milestones:[
      {id:"s_m1",  title:"Bankdrücken: 2x KG",             desc:"Selbsttest: 2x dein KG – 1 saubere Wiederholung. Powerlifter-Niveau.", xp:18200, stat:"STR", statPts:132, type:"milestone", cat:"strength"},
      {id:"s_m2",  title:"Kniebeugen: 2,5x KG",           desc:"Selbsttest: 2,5x dein KG – sauber und tief. Absolute Elite.",       xp:20300, stat:"STR", statPts:147, type:"milestone", cat:"strength"},
      {id:"s_m3",  title:"50 Klimmzüge am Stück",          desc:"Selbsttest: 50 saubere Klimmzüge. Unmenschlich.",                   xp:15200, stat:"STR", statPts:110, type:"milestone", cat:"strength"},
      {id:"s_m4",  title:"Ultramarathon 50km",             desc:"Selbsttest: 50km am Stück. Kein normaler Mensch macht das.",        xp:17200, stat:"AGI", statPts:124, type:"milestone", cat:"cardio"},
      {id:"s_m5",  title:"Open-Source mit Stars",          desc:"GitHub-Projekt das andere nutzen und staren.",                      xp:17200, stat:"INT", statPts:124, type:"milestone", cat:"skill_tech"},
      {id:"s_m6",  title:"Musik-EP veröffentlicht",        desc:"Eigene EP: Komposition, Produktion, Abmischung, released.",         xp:15200, stat:"CRE", statPts:110, type:"milestone", cat:"skill_creative"},
      {id:"s_m7",  title:"Auftritt vor Publikum",          desc:"Selbsttest: Ein echter Auftritt vor Fremden. Hast du es gemacht?",  xp:14200, stat:"CRE", statPts:102, type:"milestone", cat:"skill_creative"},
      {id:"s_m8",  title:"Competition-Physique (<12% KF)", desc:"Selbsttest: Sind Bauchmuskeln auch im normalen Licht sichtbar?",   xp:22300, stat:"STR", statPts:160, type:"milestone", cat:"strength"},
      {id:"s_m9",  title:"Master Physik",                  desc:"Master-Abschluss oder gleichwertiges Wissen nachgewiesen.",         xp:27400, stat:"INT", statPts:175, type:"milestone", cat:"uni"},
      // VIT
      {id:"s_m10", title:"2 Jahre optimale Ernährung",    desc:"Selbsttest: 2 Jahre lang Ernährung konsequent und bewusst gestaltet?", xp:25000, stat:"VIT", statPts:160, type:"milestone", cat:"health"},
      {id:"s_m11", title:"Körperbewusstsein: Meister",    desc:"Selbsttest: Kennst du jeden Muskel, jede Schwäche, jeden Zyklus deines Körpers?", xp:20000, stat:"VIT", statPts:128, type:"milestone", cat:"health"},
      // END
      {id:"s_m12", title:"2 Jahre Habit-Konsistenz",      desc:"Selbsttest: Dieselben Kern-Habits zwei volle Jahre ohne Abbruch?",    xp:28000, stat:"END", statPts:179, type:"milestone", cat:"discipline"},
      {id:"s_m13", title:"Extremes Diskomfort bewältigt", desc:"Selbsttest: Hast du etwas durchgezogen das die meisten Menschen sofort aufgeben?", xp:22000, stat:"END", statPts:140, type:"milestone", cat:"discipline"},
      // REL
      {id:"s_m14", title:"Langfristige tiefe Verbindung", desc:"Selbsttest: Gibt es jemanden der sagen würde du bist die verlässlichste Person in seinem Leben?", xp:20000, stat:"CHA", subStat:"REL", statPts:128, type:"milestone", cat:"social"},
    ],
  },

  // ══════════════════════════════════════════════════════════
  // SS-RANK — National Level.
  // ══════════════════════════════════════════════════════════
  SS:{
    daily:[
      {id:"ss_d1", title:"1000 Liegestütze",               desc:"Nationaler Hunter Level. 1000 täglich.",                             xp:370, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"ss_d2", title:"30km Laufen",                    desc:"30km täglich. Sub-4:30/km.",                                          xp:390, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"ss_d3", title:"8h Hochleistungs-Output",        desc:"8 Stunden produktiv auf absolutem Spitzenlevel.",                    xp:380, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"ss_d4", title:"Täglich publizieren / lehren",   desc:"Jeden Tag etwas veröffentlichen oder jemandem beibringen.",         xp:320, stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"ss_d5", title:"Profi-Grooming täglich",         desc:"Alles perfekt: Haut, Körper, Stil, Auftreten.",                     xp:270, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
    ],
    weekly:[
      {id:"ss_w1", title:"Öffentliche Wirkung schaffen",   desc:"Talk, Video, Artikel – Wissen mit vielen Menschen teilen.",         xp:1650, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"ss_w2", title:"Komplettes Skill-Audit",         desc:"Alle Skills bewerten. Schwächen identifizieren.",                   xp:1350, stat:"INT", statPts:0, type:"weekly", cat:"discipline"},
    ],
    milestones:[
      {id:"ss_m1", title:"100km Ultramarathon",            desc:"Selbsttest: 100km am Stück. Du bist kein normaler Mensch mehr.",    xp:55500, stat:"AGI", statPts:237, type:"milestone", cat:"cardio"},
      {id:"ss_m2", title:"Wettkampf-Physique 6 Monate",    desc:"Selbsttest: Wettkampfform dauerhaft. Fotos + Messungen.",           xp:45500, stat:"STR", statPts:194, type:"milestone", cat:"strength"},
      {id:"ss_m3", title:"Projekt mit echtem Impact",      desc:"Etwas aufgebaut das viele Menschen wirklich nutzen oder hilft.",   xp:60500, stat:"INT", statPts:258, type:"milestone", cat:"skill_tech"},
      {id:"ss_m4", title:"Musik auf Streaming + Hörer",    desc:"Eigene Musik auf Spotify etc. mit echten Hörern.",                  xp:38500, stat:"CRE", statPts:164, type:"milestone", cat:"skill_creative"},
    ],
  },

  // ══════════════════════════════════════════════════════════
  // SSS-RANK — Shadow Monarch. Das Unmögliche.
  // ══════════════════════════════════════════════════════════
  SSS:{
    daily:[
      {id:"sss_d1", title:"Shadow Monarch Training",      desc:"3h Kraft + 20km + 500 Dips + 500 Liegestütze. Täglich.",             xp:640, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"sss_d2", title:"Genius-Level Work",             desc:"10h Deep Work auf absolutem Weltklasse-Niveau.",                     xp:640, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"sss_d3", title:"Erschaffen was bleibt",         desc:"Erschaffe heute etwas das andere dauerhaft verändern wird.",         xp:540, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
    ],
    weekly:[
      {id:"sss_w1", title:"Legacy Challenge",              desc:"Erschaffe etwas das über dich hinaus existiert.",                    xp:5700, stat:"CHA", statPts:0, type:"weekly", cat:"legacy"},
      {id:"sss_w2", title:"Absolutes Maximum",             desc:"7 Tage: alle Stats perfekt – Körper, Geist, Kreativität, Soziales.", xp:6700, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
    ],
    milestones:[
      {id:"sss_m1", title:"I ALONE LEVEL UP",              desc:"SSS-Rank Lv.10. Das absolut Unmögliche. Shadow Monarch.",           xp:500000, stat:"END", statPts:999, type:"milestone", cat:"legacy"},
      {id:"sss_m2", title:"PhD Physik",                    desc:"Tiefste wissenschaftliche Expertise auf Weltklasse-Niveau.",         xp:160000, stat:"INT", statPts:640, type:"milestone", cat:"uni"},
      {id:"sss_m3", title:"Körper des Shadow Monarch",     desc:"Absolute Perfektion: Kraft, Ausdauer, Ästhetik – alles maximal.",  xp:130000, stat:"STR", statPts:520, type:"milestone", cat:"strength"},
    ],
  },
};



// ============================================================
// HELPERS
// ============================================================
const getGlobalLevel = (rank, level) => RANKS.indexOf(rank) * LEVELS_PER_RANK + level;
const getRankFromGlobal = (g) => ({ rank:RANKS[Math.floor((g-1)/LEVELS_PER_RANK)], level:((g-1)%LEVELS_PER_RANK)+1 });
const getTodayStr = () => new Date().toDateString();
const getWeekStr  = () => { const d=new Date(); return `${d.getFullYear()}-W${Math.ceil(d.getDate()/7)}`; };
// ============================================================
// STORAGE — IndexedDB (survives cache clears) + localStorage fallback
// ============================================================
const DB_NAME = "arise_db", DB_VERSION = 1, STORE = "data";

const openDB = () => new Promise((res, rej) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
  req.onsuccess = e => res(e.target.result);
  req.onerror = () => rej(req.error);
});

const idbGet = async (key) => {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror = () => rej(req.error);
    });
  } catch { return null; }
};

const idbSet = async (key, value) => {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
    });
  } catch { return false; }
};

// Save: write to both IndexedDB (primary) and localStorage (fallback)
const saveData = async (key, value) => {
  localStorage.setItem(key, JSON.stringify(value)); // instant fallback
  await idbSet(key, value);                          // durable primary
};

// Load: try IndexedDB first, fall back to localStorage
const loadData = async (key) => {
  const idb = await idbGet(key);
  if (idb !== null) return idb;
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};

// Legacy sync helper for non-critical reads
const LS = (k,v) => v===undefined ? (() => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } })() : localStorage.setItem(k, JSON.stringify(v));

const defaultState = (name) => ({
  name, rank:"E", level:1, xp:0,
  stats:{ STR:0,AGI:0,INT:0,CRE:0,CRA:0,VIT:0,END:0,CHA:0,SOC:0,REL:0,APP:0 },
  completedChallenges:[], customQuests:[],
  lastDailyReset:null, lastWeeklyReset:null,
  totalXP:0, currentStreak:0, longestStreak:0,
  lastActiveDay:null, xpHistory:[], unlockedAchievements:[],
});

// ============================================================
// MINI LINE CHART (for XP history and body metrics)
// ============================================================
const MiniChart = ({ data, color="#00ffff", height=60, label="" }) => {
  if (!data || data.length < 2) return (
    <div style={{ height, display:"flex",alignItems:"center",justifyContent:"center",color:"#1e293b",fontSize:"0.7rem" }}>Noch zu wenig Daten</div>
  );
  const vals = data.map(d=>d.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const w = 280, h = height;
  const pts = vals.map((v,i) => ({ x:(i/(vals.length-1))*(w-20)+10, y:h-10-((v-min)/range)*(h-20) }));
  const path = pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = path + ` L${pts[pts.length-1].x},${h} L${pts[0].x},${h} Z`;
  return (
    <div>
      {label && <div style={{ fontSize:"0.58rem",color:"#334155",letterSpacing:"0.1em",marginBottom:4 }}>{label}</div>}
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id={`g_${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#g_${color.replace("#","")})`}/>
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" style={{ filter:`drop-shadow(0 0 3px ${color}88)` }}/>
        {pts.map((p,i) => i===pts.length-1 && (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke="#050508" strokeWidth={1.5}/>
        ))}
        <text x={pts[0].x} y={h-1} textAnchor="middle" fontSize={8} fill="#334155">{data[0].l}</text>
        <text x={pts[pts.length-1].x} y={h-1} textAnchor="middle" fontSize={8} fill="#334155">{data[data.length-1].l}</text>
        <text x={pts[pts.length-1].x+4} y={pts[pts.length-1].y-4} fontSize={9} fill={color} fontWeight={700} fontFamily="'Rajdhani',sans-serif">{vals[vals.length-1]}</text>
      </svg>
    </div>
  );
};

// ============================================================
// RADAR CHART
// ============================================================
const RadarChart = ({ stats, rankColor }) => {
  const cx=130,cy=130,r=90;
  const axes = [
    { key:"STR",label:"STR",color:"#ef4444" },
    { key:"AGI",label:"AGI",color:"#f59e0b" },
    { key:"INT",label:"INT",color:"#3b82f6" },
    { key:"CRE",label:"ART",color:"#a78bfa" },
    { key:"CRA",label:"CRA",color:"#f97316" },
    { key:"VIT",label:"VIT",color:"#22c55e" },
    { key:"END",label:"END",color:"#64748b" },
    { key:"CHA",label:"CHA",color:"#ec4899" },
  ];
  const n=axes.length;
  const angle=(i)=>(Math.PI*2*i)/n-Math.PI/2;
  const maxVal=Math.max(10,...axes.map(a=>stats[a.key]||0));
  const getPoint=(i,val)=>{ const pct=Math.min(val/maxVal,1),a=angle(i); return {x:cx+Math.cos(a)*r*pct,y:cy+Math.sin(a)*r*pct}; };
  const gridLevels=[0.25,0.5,0.75,1.0];
  const dataPoints=axes.map((ax,i)=>getPoint(i,stats[ax.key]||0));
  const dataPath=dataPoints.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")+" Z";
  return (
    <div style={{ background:"rgba(255,255,255,0.02)",border:`1px solid ${rankColor}22`,borderRadius:14,padding:"14px 10px 8px" }}>
      <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:10 }}>STAT OVERVIEW</div>
      <div style={{ display:"flex",justifyContent:"center" }}>
        <svg width={260} height={260} viewBox="0 0 260 260" style={{ overflow:"visible" }}>
          {gridLevels.map((pct,gi)=>{
            const pts=axes.map((_,i)=>{const a=angle(i);return `${(cx+Math.cos(a)*r*pct).toFixed(1)},${(cy+Math.sin(a)*r*pct).toFixed(1)}`;});
            return <polygon key={gi} points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={gi===3?1:0.5}/>;
          })}
          {axes.map((_,i)=>{const a=angle(i),ex=cx+Math.cos(a)*r,ey=cy+Math.sin(a)*r;return <line key={i} x1={cx} y1={cy} x2={ex.toFixed(1)} y2={ey.toFixed(1)} stroke="rgba(255,255,255,0.06)" strokeWidth={0.8}/>;  })}
          <path d={dataPath} fill={`${rankColor}18`} stroke={rankColor} strokeWidth={1.8} strokeLinejoin="round" style={{ filter:`drop-shadow(0 0 5px ${rankColor}66)` }}/>
          {dataPoints.map((p,i)=><circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3.5} fill={axes[i].color} stroke="#050508" strokeWidth={1.5} style={{ filter:`drop-shadow(0 0 3px ${axes[i].color})` }}/>)}
          {axes.map((ax,i)=>{
            const a=angle(i),lx=cx+Math.cos(a)*(r+22),ly=cy+Math.sin(a)*(r+22),val=stats[ax.key]||0;
            return (<g key={i}>
              <text x={lx.toFixed(1)} y={(ly-5).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} letterSpacing={1} fill={ax.color} fontFamily="'Rajdhani',sans-serif">{ax.label}</text>
              <text x={lx.toFixed(1)} y={(ly+8).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={val>0?"#e2e8f0":"#1e293b"} fontFamily="'Rajdhani',sans-serif" fontWeight={700}>{val}</text>
            </g>);
          })}
        </svg>
      </div>
    </div>
  );
};

// ============================================================
// COUNT-UP ANIMATION (Feature 9)
// ============================================================
const useCountUp = (target, duration=600) => {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    if(target === prev.current) return;
    const start = prev.current, diff = target - start;
    if(diff === 0) return;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + diff * ease));
      if(progress < 1) requestAnimationFrame(tick);
      else { prev.current = target; setDisplay(target); }
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return display;
};

// ============================================================
// SPLASH SCREEN (Feature 6)
// ============================================================
const SplashScreen = ({ rankColor }) => (
  <div style={{ position:"fixed",inset:0,zIndex:2000,background:"#050508",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"splashOut 0.4s ease 1.4s forwards" }}>
    <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(3rem,12vw,5rem)",fontWeight:900,background:`linear-gradient(135deg,${rankColor},#8b5cf6)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"splashPulse 0.8s ease",letterSpacing:"0.05em" }}>ARISE</div>
    <div style={{ fontSize:"0.65rem",letterSpacing:"0.4em",color:"#1e293b",marginTop:8,animation:"splashFade 0.6s ease 0.3s both" }}>SYSTEM LOADING...</div>
    <div style={{ marginTop:24,width:120,height:2,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden",animation:"splashFade 0.4s ease 0.5s both" }}>
      <div style={{ height:"100%",background:`linear-gradient(90deg,${rankColor}88,${rankColor})`,animation:"splashBar 1s ease 0.6s both",width:"0%" }}/>
    </div>
  </div>
);

// ============================================================
// STAT BAR
// ============================================================
const StatBar = ({ label, icon, value, max=100, color, small=false, onClick }) => {
  const animated = useCountUp(value);
  const pct=Math.min(value>0?(value/max)*100:0,100);
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.025)",border:`1px solid ${color}22`,borderRadius:8,padding:small?"7px 10px":"9px 12px",cursor:onClick?"pointer":"default",transition:"all 0.15s" }}
      onMouseEnter={e=>{ if(onClick) e.currentTarget.style.borderColor=color+"55"; }}
      onMouseLeave={e=>{ if(onClick) e.currentTarget.style.borderColor=color+"22"; }}
    >
      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
        <span style={{ fontSize:small?"0.68rem":"0.74rem",color:"#666" }}>{icon} {label}</span>
        <span style={{ fontSize:small?"0.72rem":"0.8rem",color,fontWeight:700,fontFamily:"'Rajdhani',sans-serif" }}>{animated}</span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:3,height:3,overflow:"hidden" }}>
        <div style={{ width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${color}66,${color})`,boxShadow:`0 0 5px ${color}88`,borderRadius:3,transition:"width 0.6s ease" }}/>
      </div>
    </div>
  );
};

// ============================================================
// CHALLENGE CARD
// ============================================================
const ChallengeCard = ({ challenge, done, onComplete, rankColor }) => {
  const typeColors={daily:"#3b82f6",weekly:"#8b5cf6",milestone:"#f59e0b",custom:"#06b6d4"};
  const typeLabels={daily:"◈ TÄGLICH",weekly:"◉ WÖCHENTLICH",milestone:"★ MEILENSTEIN",custom:"✦ EIGENE"};
  const tc=typeColors[challenge.type]||"#3b82f6";
  const isMilestone=challenge.type==="milestone";
  const statKey=challenge.subStat||challenge.stat;
  const statColor=SUB_STATS[statKey]?.color||STATS_CONFIG.find(s=>s.key===statKey)?.color||"#aaa";
  return (
    <div style={{ background:done?"rgba(255,255,255,0.01)":isMilestone?`linear-gradient(135deg,rgba(255,255,255,0.04),${tc}08)`:"rgba(255,255,255,0.035)", border:`1px solid ${done?"#111":isMilestone?tc+"55":tc+"33"}`, borderRadius:10,padding:"12px 13px",opacity:done?0.4:1,transition:"all 0.3s",position:"relative",overflow:"hidden" }}>
      {!done && <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${tc},transparent)`,opacity:isMilestone?0.7:0.4 }}/>}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",flexWrap:"wrap",alignItems:"center",gap:5,marginBottom:3 }}>
            <span style={{ color:tc,fontSize:"0.6rem",letterSpacing:"0.1em" }}>{typeLabels[challenge.type]||"◈ QUEST"}</span>
            {isMilestone&&<><span style={{ color:"#333" }}>·</span><span style={{ color:"#22c55e",fontSize:"0.6rem" }}>+{challenge.xp} XP</span><span style={{ color:"#333" }}>·</span><span style={{ color:statColor,fontSize:"0.6rem",fontWeight:700 }}>+{challenge.statPts} {statKey}</span></>}
            {!isMilestone&&<><span style={{ color:"#333" }}>·</span><span style={{ color:"#22c55e88",fontSize:"0.6rem" }}>+{challenge.xp} XP</span></>}
          </div>
          <div style={{ color:done?"#333":"#dde",fontWeight:600,fontSize:"0.86rem",marginBottom:2,lineHeight:1.3 }}>{challenge.title}</div>
          <div style={{ color:"#3d4f6a",fontSize:"0.74rem",lineHeight:1.4 }}>{challenge.desc}</div>
        </div>
        {!done&&<button onClick={()=>onComplete(challenge)} style={{ background:`linear-gradient(135deg,${tc}14,${tc}28)`,border:`1px solid ${tc}44`,color:tc,borderRadius:8,padding:isMilestone?"9px 13px":"6px 11px",fontSize:isMilestone?"0.8rem":"0.74rem",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.05em",transition:"all 0.2s" }} onMouseEnter={e=>e.target.style.boxShadow=`0 0 10px ${tc}44`} onMouseLeave={e=>e.target.style.boxShadow="none"}>{isMilestone?"BEWIESEN":"DONE"}</button>}
        {done&&<span style={{ color:"#22c55e88",fontSize:"1rem",flexShrink:0 }}>✓</span>}
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function AriseApp() {
  const [state, setState] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [view, setView] = useState("profile");
  const [notification, setNotification] = useState(null);
  const [levelUpAnim, setLevelUpAnim] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default"); // default | xp
  const [bodyEntries, setBodyEntries] = useState([]);
  const [bodyForm, setBodyForm] = useState({ weight:"",bf:"",bench:"",squat:"",deadlift:"",pullups:"",run5k:"",note:"" });
  const [bodyMetric, setBodyMetric] = useState("weight");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null); // for stat detail chart
  const [showSplash, setShowSplash] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(() => { try { return JSON.parse(localStorage.getItem("arise_haptic") ?? "true"); } catch { return true; } });
  const [collapsedSections, setCollapsedSections] = useState({});
  const [customForm, setCustomForm] = useState({ title:"",desc:"",xp:"20",cat:"discipline" });
  const [newAchievements, setNewAchievements] = useState([]);
  const notifRef = useRef(null);
  const achievRef = useRef(null);

  // Load from IndexedDB on mount
  useEffect(() => {
    (async () => {
      const s = await loadData("arise_v3");
      if(s) setState(s);
      const b = await loadData("arise_body");
      if(b) setBodyEntries(b);
      setTimeout(() => setShowSplash(false), 1800);
    })();
  }, []);

  // Haptic feedback helper
  const haptic = useCallback((type="light") => {
    if(!hapticEnabled) return;
    try {
      if(navigator.vibrate) {
        navigator.vibrate(type==="heavy"?[30,10,30]:type==="medium"?20:10);
      }
    } catch {}
  }, [hapticEnabled]);

  const toggleHaptic = (val) => {
    setHapticEnabled(val);
    localStorage.setItem("arise_haptic", JSON.stringify(val));
  };

  const toggleSection = (key) => setCollapsedSections(p => ({...p, [key]: !p[key]}));

  // Daily/Weekly reset + streak update
  useEffect(() => {
    if(!state) return;
    const today = getTodayStr(), week = getWeekStr();
    let u = {...state, stats:{...state.stats}}, changed = false;
    // Daily reset
    if(state.lastDailyReset !== today) {
      const ids = Object.values(CHALLENGES_DB).flatMap(r=>r.daily.map(c=>c.id));
      u.completedChallenges = (state.completedChallenges||[]).filter(id=>!ids.includes(id));
      // Streak logic
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yStr = yesterday.toDateString();
      if(state.lastActiveDay === yStr) {
        u.currentStreak = (state.currentStreak||0) + 1;
        u.longestStreak = Math.max(u.currentStreak, state.longestStreak||0);
      } else if(state.lastActiveDay !== today) {
        u.currentStreak = 0;
      }
      u.lastDailyReset = today; changed = true;
    }
    if(state.lastWeeklyReset !== week) {
      const ids = Object.values(CHALLENGES_DB).flatMap(r=>r.weekly.map(c=>c.id));
      u.completedChallenges = (u.completedChallenges||state.completedChallenges).filter(id=>!ids.includes(id));
      u.lastWeeklyReset = week; changed = true;
    }
    if(changed) { setState(u); saveData("arise_v3", u); }
  }, [state?.rank, state?.lastDailyReset]);

  // Check achievements
  const checkAchievements = useCallback((s, body) => {
    const already = s.unlockedAchievements || [];
    const newly = ACHIEVEMENTS.filter(a => !already.includes(a.id) && a.check(s, body));
    if(newly.length > 0) {
      const updated = { ...s, unlockedAchievements: [...already, ...newly.map(a=>a.id)] };
      saveData("arise_v3", updated);
      setState(updated);
      setNewAchievements(newly);
      clearTimeout(achievRef.current);
      achievRef.current = setTimeout(() => setNewAchievements([]), 4000);
    }
  }, []);

  const showNotif = (msg, color="#00ffff") => {
    setNotification({msg,color});
    clearTimeout(notifRef.current);
    notifRef.current = setTimeout(()=>setNotification(null), 3500);
  };

  const handleCreate = () => {
    if(!nameInput.trim()) return;
    const s = defaultState(nameInput.trim());
    s.lastDailyReset = getTodayStr();
    s.lastWeeklyReset = getWeekStr();
    setState(s); saveData("arise_v3", s);
  };

  const handleComplete = (challenge) => {
    let s = { ...state, stats:{...state.stats}, completedChallenges:[...(state.completedChallenges||[])] };
    s.completedChallenges.push(challenge.id);
    s.xp = (s.xp||0) + challenge.xp;
    s.totalXP = (s.totalXP||0) + challenge.xp;
    s.lastActiveDay = getTodayStr();
    if(s.lastDailyReset === getTodayStr()) {
      s.currentStreak = Math.max(s.currentStreak||0, 1);
    }
    // XP history (weekly buckets)
    const wk = getWeekStr();
    const hist = [...(s.xpHistory||[])];
    const last = hist[hist.length-1];
    if(last && last.w === wk) last.v += challenge.xp;
    else hist.push({ w:wk, v:challenge.xp, l:new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}) });
    s.xpHistory = hist.slice(-24);

    // Stat-Punkte NUR bei Meilensteinen
    if(challenge.type === "milestone" && challenge.statPts > 0) {
      const sk = challenge.subStat || challenge.stat;
      s.stats[sk] = (s.stats[sk]||0) + challenge.statPts;
      if(challenge.subStat) s.stats.CHA = (s.stats.CHA||0) + Math.max(1,Math.floor(challenge.statPts/5));
      showNotif(`★ STAT UP! +${challenge.statPts} ${sk}`, "#f59e0b");
    }

    // Level up
    let xpNeeded = XP_PER_LEVEL(s.rank, s.level);
    while(s.xp >= xpNeeded) {
      s.xp -= xpNeeded;
      const gl = getGlobalLevel(s.rank, s.level);
      if(gl < TOTAL_LEVELS) {
        const next = getRankFromGlobal(gl+1);
        const rankUp = next.rank !== s.rank;
        s.rank = next.rank; s.level = next.level;
        setLevelUpAnim({ rank:s.rank, level:s.level, rankUp });
        setTimeout(()=>setLevelUpAnim(null), 2800);
        if(rankUp) showNotif(`⚡ RANK UP! ${RANK_COLORS[s.rank].label.toUpperCase()}`, RANK_COLORS[s.rank].primary);
        else showNotif(`↑ LEVEL UP! ${s.rank}-Rank Lv.${s.level}`, "#00ffff");
        xpNeeded = XP_PER_LEVEL(s.rank, s.level);
      } else break;
    }
    if(challenge.type !== "milestone") showNotif(`+${challenge.xp} XP`, "#3b82f6");
    haptic(challenge.type==="milestone"?"heavy":"medium");
    setState(s); saveData("arise_v3", s);
    setTimeout(() => checkAchievements(s, bodyEntries), 100);
  };

  const saveBodyEntry = () => {
    const entry = { ...bodyForm, date:new Date().toLocaleDateString("de-DE"), ts:Date.now() };
    const updated = [entry, ...bodyEntries].slice(0,52);
    setBodyEntries(updated); saveData("arise_body", updated);
    setBodyForm({ weight:"",bf:"",bench:"",squat:"",deadlift:"",pullups:"",run5k:"",note:"" });
    showNotif("✓ Check-In gespeichert", "#22c55e");
    if(state) setTimeout(() => checkAchievements(state, updated), 100);
  };

  const addCustomQuest = () => {
    if(!customForm.title.trim()) return;
    const quest = { id:`custom_${Date.now()}`, title:customForm.title.trim(), desc:customForm.desc.trim()||"Eigene Quest", xp:Math.max(1,parseInt(customForm.xp)||20), stat:"END", statPts:0, type:"custom", cat:customForm.cat };
    const s = { ...state, customQuests:[...(state.customQuests||[]), quest] };
    setState(s); saveData("arise_v3", s);
    setCustomForm({ title:"",desc:"",xp:"20",cat:"discipline" });
    setShowCustomForm(false);
    showNotif("✦ Quest hinzugefügt", "#06b6d4");
  };

  const deleteCustomQuest = (id) => {
    const s = { ...state, customQuests:(state.customQuests||[]).filter(q=>q.id!==id) };
    setState(s); saveData("arise_v3", s);
  };

  const handleReset = async () => {
    // Clear IndexedDB
    try {
      const db = await openDB();
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
    } catch {}
    // Clear localStorage
    localStorage.removeItem("arise_v3");
    localStorage.removeItem("arise_body");
    // Reset state
    setBodyEntries([]);
    setConfirmReset(false);
    setView("profile");
    setState(null);
    // Small delay then re-init
    setTimeout(() => {
      const s = defaultState("");
      // Don't auto-create — go back to name input
    }, 100);
  };

  const exportData = () => {
    const data = { state: LS("arise_v3"), body: LS("arise_body"), exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`arise_backup_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    showNotif("↓ Backup gespeichert", "#22c55e");
  };

  const importData = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if(data.state) { saveData("arise_v3", data.state); setState(data.state); }
        if(data.body)  { saveData("arise_body", data.body); setBodyEntries(data.body); }
        showNotif("✓ Daten importiert", "#22c55e");
      } catch { showNotif("⚠ Import fehlgeschlagen", "#ef4444"); }
    };
    reader.readAsText(file);
  };

  // ── SETUP SCREEN ──
  if(!state) return (
    <div style={{ minHeight:"100vh",background:"#050508",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif",backgroundImage:"radial-gradient(ellipse at 50% 0%,#0d0d2b,#050508 60%)",padding:24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{ textAlign:"center",marginBottom:40 }}>
        <div style={{ fontSize:"0.65rem",letterSpacing:"0.4em",color:"#1e2a3a",marginBottom:14 }}>SYSTEM NOTIFICATION</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(2.5rem,10vw,4.5rem)",fontWeight:900,background:"linear-gradient(135deg,#00ffff,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1,marginBottom:8 }}>ARISE</div>
        <div style={{ color:"#1e2a3a",fontSize:"0.78rem",letterSpacing:"0.25em" }}>YOU HAVE BEEN CHOSEN TO LEVEL UP</div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #1a1a3e",borderRadius:16,padding:"28px 24px",width:"100%",maxWidth:380 }}>
        <div style={{ color:"#4a5568",fontSize:"0.82rem",marginBottom:22,lineHeight:1.6 }}>Das System hat dich auserwählt. Dein Erwachen beginnt jetzt.</div>
        <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCreate()} placeholder="Dein Name..." style={{ width:"100%",background:"rgba(0,255,255,0.03)",border:"1px solid #00ffff22",borderRadius:10,padding:"13px 15px",color:"#e2e8f0",fontSize:"1rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:14,letterSpacing:"0.05em" }}/>
        <button onClick={handleCreate} style={{ width:"100%",background:"linear-gradient(135deg,#00ffff18,#8b5cf625)",border:"1px solid #00ffff44",color:"#00ffff",borderRadius:10,padding:13,fontSize:"0.95rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.15em",cursor:"pointer" }}>ERWACHEN</button>
      </div>
    </div>
  );

  // ── COMPUTED ──
  const rc = RANK_COLORS[state.rank];
  const xpNeeded = XP_PER_LEVEL(state.rank, state.level);
  const xpPct = Math.min((state.xp/xpNeeded)*100,100);
  const globalLvl = getGlobalLevel(state.rank, state.level);
  const currentDB = CHALLENGES_DB[state.rank]||{daily:[],weekly:[],milestones:[]};
  const allMilestones = Object.entries(CHALLENGES_DB).filter(([r])=>RANKS.indexOf(r)<=RANKS.indexOf(state.rank)).flatMap(([,v])=>v.milestones);
  const customQuests = state.customQuests||[];
  const todayDone = currentDB.daily.filter(c=>state.completedChallenges?.includes(c.id)).length;
  const totalMilestonesDone = Object.values(CHALLENGES_DB).flatMap(r=>r.milestones).filter(c=>state.completedChallenges?.includes(c.id)).length;
  const unlockedAchievements = ACHIEVEMENTS.filter(a=>(state.unlockedAchievements||[]).includes(a.id));

  let displayChallenges = [...currentDB.daily, ...currentDB.weekly, ...allMilestones, ...customQuests];
  if(showTodayOnly) displayChallenges = displayChallenges.filter(c=>c.type==="daily"&&!state.completedChallenges?.includes(c.id));
  if(filterType!=="all") displayChallenges = displayChallenges.filter(c=>c.type===filterType);
  if(filterCat!=="all")  displayChallenges = displayChallenges.filter(c=>c.cat===filterCat);
  if(sortBy==="xp") displayChallenges = [...displayChallenges].sort((a,b)=>b.xp-a.xp);
  const availableCats=[...new Set([...currentDB.daily,...currentDB.weekly,...allMilestones,...customQuests].map(c=>c.cat))];

  // Body chart data
  const bodyChartData = bodyEntries.slice().reverse().map(e=>({ v:parseFloat(e[bodyMetric])||0, l:e.date?.split(".").slice(0,2).join(".") })).filter(d=>d.v>0);
  const bodyMetrics = [{k:"weight",l:"Gewicht",u:"kg",c:"#22c55e"},{k:"bf",l:"KF",u:"%",c:"#f59e0b"},{k:"bench",l:"Bench",u:"kg",c:"#ef4444"},{k:"squat",l:"Squat",u:"kg",c:"#8b5cf6"},{k:"deadlift",l:"DL",u:"kg",c:"#f97316"},{k:"pullups",l:"Pull",u:"",c:"#3b82f6"},{k:"run5k",l:"5km",u:"min",c:"#ec4899"}];
  const activeMetric = bodyMetrics.find(m=>m.k===bodyMetric)||bodyMetrics[0];

  const navItems = [
    {id:"profile",icon:"◈",label:"Status"},
    {id:"quests", icon:"◉",label:"Quests"},
    {id:"body",   icon:"◆",label:"Körper"},
    {id:"stats",  icon:"▲",label:"Stats"},
    {id:"more",   icon:"⊕",label:"Mehr"},
  ];

  // Build stat history from completed milestones
  const buildStatHistory = (statKey) => {
    const allM = Object.values(CHALLENGES_DB).flatMap(r=>r.milestones);
    const relevant = allM.filter(m=>(m.subStat||m.stat)===statKey && state.completedChallenges?.includes(m.id));
    // Sort by rank order as proxy for time (we don't store completion timestamps)
    relevant.sort((a,b)=>{
      const ra=Object.entries(CHALLENGES_DB).find(([,v])=>v.milestones.includes(a))?.[0]||"E";
      const rb=Object.entries(CHALLENGES_DB).find(([,v])=>v.milestones.includes(b))?.[0]||"E";
      return RANKS.indexOf(ra)-RANKS.indexOf(rb);
    });
    let cumulative = 0;
    return relevant.map(m=>{ cumulative+=m.statPts; return { v:cumulative, l:m.title.slice(0,14), pts:m.statPts, title:m.title }; });
  };

  return (
    <>
    {showSplash && <SplashScreen rankColor={rc.primary}/>}
    <div style={{ minHeight:"100dvh",background:rc.bg,fontFamily:"'Rajdhani',sans-serif",color:"#e2e8f0",backgroundImage:`${rc.pattern}, radial-gradient(ellipse at 50% -5%,${rc.glow},transparent 55%)`,maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",paddingTop:"env(safe-area-inset-top)",paddingLeft:"env(safe-area-inset-left)",paddingRight:"env(safe-area-inset-right)",transition:"background 1s ease" }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeInOut{0%{opacity:0;transform:scale(.85)}15%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0}} @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}} @keyframes glitch{0%,100%{transform:translate(0)}25%{transform:translate(-2px,1px)}75%{transform:translate(2px,-1px)}} @keyframes statModal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes splashOut{from{opacity:1}to{opacity:0;pointer-events:none}} @keyframes splashPulse{0%{opacity:0;transform:scale(0.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}} @keyframes splashFade{from{opacity:0}to{opacity:1}} @keyframes splashBar{from{width:0%}to{width:100%}} @keyframes sectionOpen{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}} *{-webkit-tap-highlight-color:transparent;} input,select,textarea{-webkit-appearance:none;background-color:rgba(255,255,255,0.04)!important;color:#e2e8f0!important;} input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #0d0d17 inset!important;-webkit-text-fill-color:#e2e8f0!important;} input::placeholder{color:#2d3748;} html,body{background:${rc.bg} !important; transition:background 1s ease;} @supports(padding:max(0px)){.safe-bottom{padding-bottom:max(18px,env(safe-area-inset-bottom))}}`}</style>

      {/* Level Up overlay */}
      {levelUpAnim && (
        <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.9)",animation:"fadeInOut 2.8s ease forwards",pointerEvents:"none" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(2rem,10vw,3.5rem)",fontWeight:900,color:rc.primary,textShadow:`0 0 30px ${rc.primary}`,animation:"glitch 0.4s infinite",letterSpacing:"0.08em" }}>{levelUpAnim.rankUp?"RANK UP!":"LEVEL UP"}</div>
            <div style={{ color:"#555",fontSize:"0.9rem",marginTop:8,letterSpacing:"0.25em" }}>{levelUpAnim.rank}-RANK · LV.{levelUpAnim.level}</div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && <div style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.94)",border:`1px solid ${notification.color}44`,borderRadius:10,padding:"9px 18px",color:notification.color,fontFamily:"'Orbitron',sans-serif",fontSize:"0.72rem",letterSpacing:"0.08em",zIndex:500,whiteSpace:"nowrap",animation:"fadeInOut 3.5s ease" }}>{notification.msg}</div>}

      {/* Achievement popup */}
      {newAchievements.length > 0 && (
        <div style={{ position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:499,animation:"slideDown 0.3s ease",display:"flex",flexDirection:"column",gap:6,minWidth:220 }}>
          {newAchievements.map(a=>(
            <div key={a.id} style={{ background:"rgba(0,0,0,0.95)",border:"1px solid #f59e0b55",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:"1.2rem" }}>{a.icon}</span>
              <div>
                <div style={{ color:"#f59e0b",fontSize:"0.72rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.08em" }}>ACHIEVEMENT</div>
                <div style={{ color:"#e2e8f0",fontSize:"0.82rem",fontWeight:700 }}>{a.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stat Detail Modal */}
      {selectedStat && (() => {
        const sc = [...STATS_CONFIG, ...Object.entries(SUB_STATS).map(([k,v])=>({key:k,...v}))].find(s=>s.key===selectedStat);
        if(!sc) return null;
        const history = buildStatHistory(selectedStat);
        const currentVal = state.stats[selectedStat]||0;
        return (
          <div onClick={()=>setSelectedStat(null)} style={{ position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 80px" }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:rc.bg,border:`1px solid ${sc.color}44`,borderRadius:"20px 20px 0 0",padding:"24px 20px",width:"100%",maxWidth:480,animation:"statModal 0.25s ease",maxHeight:"70vh",overflowY:"auto" }}>
              {/* Header */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:12,background:`${sc.color}18`,border:`1px solid ${sc.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem" }}>{sc.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.1rem",color:sc.color,textShadow:`0 0 10px ${sc.color}88` }}>{sc.label||selectedStat}</div>
                    <div style={{ fontSize:"0.68rem",color:"#334155" }}>{sc.desc||""}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.8rem",fontWeight:900,color:sc.color,textShadow:`0 0 12px ${sc.color}`,lineHeight:1 }}>{currentVal}</div>
                  <div style={{ fontSize:"0.6rem",color:"#1e293b",letterSpacing:"0.1em" }}>PUNKTE</div>
                </div>
              </div>

              {/* Chart or empty state */}
              {history.length >= 2 ? (
                <div style={{ marginBottom:18 }}>
                  <div style={{ fontSize:"0.56rem",letterSpacing:"0.2em",color:"#1e293b",marginBottom:8 }}>ENTWICKLUNG DURCH MEILENSTEINE</div>
                  <MiniChart data={history} color={sc.color} height={70}/>
                </div>
              ) : history.length === 1 ? (
                <div style={{ background:`${sc.color}08`,border:`1px solid ${sc.color}22`,borderRadius:10,padding:"12px",marginBottom:18,textAlign:"center" }}>
                  <div style={{ color:sc.color,fontSize:"0.8rem",fontWeight:700,marginBottom:2 }}>Erster Meilenstein erreicht</div>
                  <div style={{ color:"#334155",fontSize:"0.72rem" }}>Schließe weitere Meilensteine ab um den Verlauf zu sehen</div>
                </div>
              ) : (
                <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:10,padding:"16px",marginBottom:18,textAlign:"center" }}>
                  <div style={{ color:"#1e293b",fontSize:"0.8rem",marginBottom:4 }}>Noch keine Meilensteine abgeschlossen</div>
                  <div style={{ color:"#111",fontSize:"0.7rem" }}>Schließe einen Meilenstein ab um deinen ersten Punkt zu verdienen</div>
                </div>
              )}

              {/* Completed milestones list */}
              {history.length > 0 && (
                <div>
                  <div style={{ fontSize:"0.56rem",letterSpacing:"0.2em",color:"#1e293b",marginBottom:8 }}>ABGESCHLOSSENE MEILENSTEINE</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    {history.map((h,i)=>(
                      <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.02)",border:"1px solid #0a0a14",borderRadius:8,padding:"9px 12px" }}>
                        <div style={{ flex:1,fontSize:"0.78rem",color:"#94a3b8",fontWeight:600 }}>{h.title}</div>
                        <span style={{ color:sc.color,fontSize:"0.76rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif",marginLeft:8,flexShrink:0 }}>+{h.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={()=>setSelectedStat(null)} style={{ width:"100%",marginTop:18,background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",color:"#334155",borderRadius:10,padding:"12px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em" }}>SCHLIESSEN</button>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div style={{ padding:"16px 18px 13px",borderBottom:`1px solid ${rc.primary}18`,background:rc.headerBg,backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:100,transition:"background 1s ease" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <div>
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.35em",color:"#1e293b",marginBottom:1 }}>PLAYER</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.95rem",fontWeight:900,color:"#e2e8f0",letterSpacing:"0.06em" }}>{state.name}</div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {/* Streak badge */}
            {(state.currentStreak||0) > 0 && (
              <div style={{ background:"rgba(245,158,11,0.12)",border:"1px solid #f59e0b33",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:5 }}>
                <span style={{ fontSize:"0.9rem" }}>🔥</span>
                <div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.78rem",fontWeight:900,color:"#f59e0b",lineHeight:1 }}>{state.currentStreak}</div>
                  <div style={{ fontSize:"0.5rem",color:"#78350f",letterSpacing:"0.1em" }}>STREAK</div>
                </div>
              </div>
            )}
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.2rem",fontWeight:900,color:rc.primary,textShadow:`0 0 10px ${rc.primary}` }}>{state.rank}<span style={{ fontSize:"0.6rem",color:"#1e293b",marginLeft:3 }}>Rank</span></div>
              <div style={{ fontSize:"0.6rem",color:"#334155" }}>Lv.{state.level} · {rc.label}</div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
            <span style={{ fontSize:"0.58rem",color:"#1e293b",letterSpacing:"0.1em" }}>EXP</span>
            <span style={{ fontSize:"0.58rem",color:rc.primary }}>{state.xp} / {xpNeeded}</span>
          </div>
          <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:4,height:5,overflow:"hidden" }}>
            <div style={{ width:`${xpPct}%`,height:"100%",background:`linear-gradient(90deg,${rc.primary}44,${rc.primary})`,boxShadow:`0 0 8px ${rc.primary}88`,borderRadius:4,transition:"width 0.8s ease" }}/>
          </div>
          <div style={{ fontSize:"0.56rem",color:"#334155",marginTop:3,transition:"all 0.3s" }}>
            {view==="quests" && `Heute: ${todayDone}/${currentDB.daily.length} tägl. erledigt · ${totalMilestonesDone} Meilensteine`}
            {view==="profile" && `Global Lv.${globalLvl}/${TOTAL_LEVELS} · ${(state.totalXP||0).toLocaleString()} XP gesamt`}
            {view==="body" && (bodyEntries.length > 0 ? `Letzter Check-In: ${bodyEntries[0].date}` : "Noch kein Check-In — trag deinen ersten ein")}
            {view==="stats" && `${Object.values(state.stats||{}).reduce((a,b)=>a+b,0)} Stat-Punkte insgesamt`}
            {view==="more" && `${unlockedAchievements.length}/${ACHIEVEMENTS.length} Achievements freigeschaltet`}
          </div>
        </div>
      </div>

      {/* CONTENT — swipe between tabs */}
      <div style={{ flex:1,overflowY:"auto",padding:"15px 13px 110px" }}
        onTouchStart={e=>{ const t=e.touches[0]; e.currentTarget._touchX=t.clientX; e.currentTarget._touchY=t.clientY; }}
        onTouchEnd={e=>{
          const dx=e.changedTouches[0].clientX-(e.currentTarget._touchX||0);
          const dy=e.changedTouches[0].clientY-(e.currentTarget._touchY||0);
          if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) {
            const tabs=["profile","quests","body","stats","more"];
            const ci=tabs.indexOf(view);
            if(dx<0 && ci<tabs.length-1) { setView(tabs[ci+1]); haptic("light"); }
            else if(dx>0 && ci>0) { setView(tabs[ci-1]); haptic("light"); }
          }
        }}
      >

        {/* ── PROFILE ── */}
        {view==="profile" && (
          <div>
            {/* Rank card */}
            <div style={{ background:`linear-gradient(135deg,${rc.primary}0c,${rc.primary}1c)`,border:`1px solid ${rc.primary}33`,borderRadius:14,padding:"16px",marginBottom:15,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-8,right:-8,fontSize:"5rem",opacity:0.04,fontFamily:"'Orbitron',sans-serif",fontWeight:900,color:rc.primary,lineHeight:1,pointerEvents:"none" }}>{state.rank}</div>
              <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:rc.primary,marginBottom:5 }}>AKTUELLER RANG</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.8rem",color:rc.primary,textShadow:`0 0 16px ${rc.primary}` }}>{state.rank}-Rank</div>
              <div style={{ color:"#4a5568",fontSize:"0.76rem",marginTop:2,marginBottom:12 }}>{rc.label} — {rc.desc}</div>
              <div style={{ display:"flex",gap:3 }}>
                {RANKS.map((r,i)=>{
                  const ci=RANKS.indexOf(state.rank),passed=i<ci,active=i===ci;
                  const rC=RANK_COLORS[r].primary;
                  return <div key={r} style={{ flex:1,textAlign:"center" }}>
                    <div style={{ height:3,borderRadius:3,background:passed?rC:active?`${rC}88`:"#0d0d17",boxShadow:active?`0 0 6px ${rC}`:"none",transition:"all 0.3s" }}/>
                    <div style={{ fontSize:"0.42rem",marginTop:2,color:passed||active?rC:"#1e1e30",fontWeight:700 }}>{r}</div>
                  </div>;
                })}
              </div>
            </div>

            {/* Streak + summary row */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:15 }}>
              {[
                {label:"Streak",  val:`${state.currentStreak||0}🔥`, color:"#f59e0b"},
                {label:"Rekord",  val:`${state.longestStreak||0}🔥`, color:"#f97316"},
                {label:"Total XP",val:(state.totalXP||0)>=1000?`${((state.totalXP||0)/1000).toFixed(1)}k`:(state.totalXP||0), color:"#00ffff"},
                {label:"Meilenst.",val:totalMilestonesDone, color:rc.primary},
              ].map(item=>(
                <div key={item.label} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:9,padding:"9px 6px",textAlign:"center" }}>
                  <div style={{ fontSize:"1rem",fontWeight:700,color:item.color,fontFamily:"'Rajdhani',sans-serif",lineHeight:1.1 }}>{item.val}</div>
                  <div style={{ fontSize:"0.54rem",color:"#1e293b",letterSpacing:"0.08em",marginTop:2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* XP History chart */}
            {(state.xpHistory||[]).length >= 2 && (
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:12,padding:"13px",marginBottom:15 }}>
                <MiniChart data={state.xpHistory.map(h=>({v:h.v,l:h.l}))} color={rc.primary} height={55} label="XP PRO WOCHE"/>
              </div>
            )}

            {/* Stats quick view */}
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:9 }}>KERN-STATS <span style={{ color:"#1e293b",fontSize:"0.5rem",letterSpacing:"0.1em" }}>· TIPPEN FÜR DETAILS</span></div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12 }}>
              {STATS_CONFIG.filter(s=>!["SOC","REL","APP"].includes(s.key)).map(sc=>(
                <StatBar key={sc.key} label={sc.key} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color} onClick={()=>setSelectedStat(sc.key)}/>
              ))}
            </div>
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:9 }}>CHARISMA</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:15 }}>
              {["SOC","REL","APP"].map(k=>(
                <StatBar key={k} label={k} icon={SUB_STATS[k].icon} value={state.stats[k]||0} max={Math.max(10,(state.stats[k]||0)*1.8+5)} color={SUB_STATS[k].color} small onClick={()=>setSelectedStat(k)}/>
              ))}
            </div>

            {/* Achievements preview */}
            {unlockedAchievements.length > 0 && (
              <div>
                <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:9 }}>ACHIEVEMENTS ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                  {unlockedAchievements.map(a=>(
                    <div key={a.id} style={{ background:"rgba(245,158,11,0.08)",border:"1px solid #f59e0b22",borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:"0.9rem" }}>{a.icon}</span>
                      <span style={{ fontSize:"0.72rem",color:"#f59e0b",fontWeight:700 }}>{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── QUESTS ── */}
        {view==="quests" && (
          <div>
            {/* Today filter + sort */}
            <div style={{ display:"flex",gap:7,marginBottom:10,alignItems:"center" }}>
              <button onClick={()=>setShowTodayOnly(v=>!v)} style={{ background:showTodayOnly?`${rc.primary}22`:"transparent",border:`1px solid ${showTodayOnly?rc.primary+"55":"#111"}`,color:showTodayOnly?rc.primary:"#334155",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
                {showTodayOnly?"● HEUTE OFFEN":"HEUTE OFFEN"}
              </button>
              <button onClick={()=>setSortBy(v=>v==="xp"?"default":"xp")} style={{ background:sortBy==="xp"?`${rc.primary}22`:"transparent",border:`1px solid ${sortBy==="xp"?rc.primary+"55":"#111"}`,color:sortBy==="xp"?rc.primary:"#334155",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
                {sortBy==="xp"?"● NACH XP":"NACH XP"}
              </button>
              <button onClick={()=>setShowCustomForm(v=>!v)} style={{ marginLeft:"auto",background:"rgba(6,182,212,0.1)",border:"1px solid #06b6d422",color:"#06b6d4",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em",whiteSpace:"nowrap" }}>+ EIGENE</button>
            </div>

            {/* Custom quest form */}
            {showCustomForm && (
              <div style={{ background:"rgba(6,182,212,0.06)",border:"1px solid #06b6d422",borderRadius:11,padding:"14px",marginBottom:12,animation:"slideDown 0.2s ease" }}>
                <div style={{ fontSize:"0.58rem",letterSpacing:"0.2em",color:"#06b6d4",marginBottom:10 }}>NEUE EIGENE QUEST</div>
                <input value={customForm.title} onChange={e=>setCustomForm(p=>({...p,title:e.target.value}))} placeholder="Quest-Name *" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:7 }}/>
                <input value={customForm.desc} onChange={e=>setCustomForm(p=>({...p,desc:e.target.value}))} placeholder="Beschreibung (optional)" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:7 }}/>
                <div style={{ display:"flex",gap:7,marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.58rem",color:"#334155",marginBottom:3 }}>XP</div>
                    <input value={customForm.xp} onChange={e=>setCustomForm(p=>({...p,xp:e.target.value}))} type="number" min="1" max="500" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ flex:2 }}>
                    <div style={{ fontSize:"0.58rem",color:"#334155",marginBottom:3 }}>Kategorie</div>
                    <select value={customForm.cat} onChange={e=>setCustomForm(p=>({...p,cat:e.target.value}))} style={{ width:"100%",background:"#0d0d17",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}>
                      {Object.entries(CAT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex",gap:7 }}>
                  <button onClick={addCustomQuest} style={{ flex:1,background:"linear-gradient(135deg,#06b6d418,#06b6d430)",border:"1px solid #06b6d444",color:"#06b6d4",borderRadius:8,padding:"9px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>SPEICHERN</button>
                  <button onClick={()=>setShowCustomForm(false)} style={{ flex:1,background:"transparent",border:"1px solid #1a1a2e",color:"#334155",borderRadius:8,padding:"9px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>ABBRECHEN</button>
                </div>
              </div>
            )}

            {/* Type filter */}
            <div style={{ display:"flex",gap:5,marginBottom:8,overflowX:"auto",paddingBottom:2 }}>
              {["all","daily","weekly","milestone","custom"].map(f=>(
                <button key={f} onClick={()=>setFilterType(f)} style={{ background:filterType===f?`${rc.primary}18`:"transparent",border:`1px solid ${filterType===f?rc.primary+"44":"#111"}`,color:filterType===f?rc.primary:"#222",borderRadius:7,padding:"5px 11px",fontSize:"0.64rem",letterSpacing:"0.08em",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>
                  {f==="all"?"Alle":f==="daily"?"Täglich":f==="weekly"?"Wöchentl.":f==="milestone"?"Meilst.":"Eigene"}
                </button>
              ))}
            </div>
            {/* Category filter */}
            <div style={{ display:"flex",gap:5,marginBottom:14,overflowX:"auto",paddingBottom:2 }}>
              <button onClick={()=>setFilterCat("all")} style={{ background:filterCat==="all"?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat==="all"?rc.primary+"33":"#0d0d17"}`,color:filterCat==="all"?rc.primary:"#1e293b",borderRadius:6,padding:"4px 9px",fontSize:"0.6rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0 }}>Alle</button>
              {availableCats.map(cat=>(
                <button key={cat} onClick={()=>setFilterCat(cat)} style={{ background:filterCat===cat?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat===cat?rc.primary+"33":"#0d0d17"}`,color:filterCat===cat?rc.primary:"#1e293b",borderRadius:6,padding:"4px 9px",fontSize:"0.6rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>{CAT_LABELS[cat]||cat}</button>
              ))}
            </div>

            {/* Sectioned quest list */}
            {(showTodayOnly || filterType!=="all" || filterCat!=="all") ? (
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {displayChallenges.length===0 && <div style={{ color:"#1e293b",textAlign:"center",padding:"40px 0",fontSize:"0.85rem" }}>{showTodayOnly?"Alle heutigen Quests erledigt! ✓":"Keine Quests für diesen Filter."}</div>}
                {[...displayChallenges].sort((a,b)=>{
                  const da=state.completedChallenges?.includes(a.id)?1:0;
                  const db=state.completedChallenges?.includes(b.id)?1:0;
                  return da-db;
                }).map(c=>(
                  <div key={c.id} style={{ position:"relative" }}>
                    <ChallengeCard challenge={c} done={state.completedChallenges?.includes(c.id)} onComplete={handleComplete} rankColor={rc.primary}/>
                    {c.type==="custom" && !state.completedChallenges?.includes(c.id) && <button onClick={()=>deleteCustomQuest(c.id)} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:"#334155",fontSize:"0.8rem",cursor:"pointer",padding:4 }}>✕</button>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                {[
                  { key:"daily",     label:"TÄGLICH",     icon:"◈", items:currentDB.daily,   color:"#3b82f6" },
                  { key:"weekly",    label:"WÖCHENTLICH", icon:"◉", items:currentDB.weekly,  color:"#8b5cf6" },
                  { key:"milestone", label:"MEILENSTEINE",icon:"★", items:allMilestones,     color:"#f59e0b" },
                  { key:"custom",    label:"EIGENE",      icon:"✦", items:customQuests,      color:"#06b6d4" },
                ].filter(s=>s.items.length>0).map(section=>{
                  const done=section.items.filter(c=>state.completedChallenges?.includes(c.id)).length;
                  const total=section.items.length;
                  const collapsed=collapsedSections[section.key];
                  const allDone=done===total;
                  return (
                    <div key={section.key}>
                      {/* Section header */}
                      <button onClick={()=>toggleSection(section.key)} style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:collapsed?0:8,padding:"2px 0",transition:"all 0.2s" }}>
                        <span style={{ color:section.color,fontSize:"0.7rem" }}>{section.icon}</span>
                        <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:allDone?"#22c55e":section.color }}>{section.label}</span>
                        <div style={{ flex:1,height:1,background:`${section.color}22`,borderRadius:1 }}/>
                        <span style={{ fontSize:"0.62rem",color:allDone?"#22c55e":"#334155",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{done}/{total}</span>
                        {/* Mini progress bar */}
                        <div style={{ width:28,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden" }}>
                          <div style={{ width:`${total>0?(done/total)*100:0}%`,height:"100%",background:allDone?"#22c55e":section.color,borderRadius:2,transition:"width 0.4s ease" }}/>
                        </div>
                        <span style={{ fontSize:"0.6rem",color:"#1e293b",transform:collapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
                      </button>
                      {/* Section items — done ones sink to bottom */}
                      {!collapsed && (
                        <div style={{ display:"flex",flexDirection:"column",gap:7,animation:"sectionOpen 0.2s ease" }}>
                          {[...section.items].sort((a,b)=>{
                            const da=state.completedChallenges?.includes(a.id)?1:0;
                            const db=state.completedChallenges?.includes(b.id)?1:0;
                            return da-db;
                          }).map(c=>(
                            <div key={c.id} style={{ position:"relative",transition:"order 0.4s ease" }}>
                              <ChallengeCard challenge={c} done={state.completedChallenges?.includes(c.id)} onComplete={handleComplete} rankColor={rc.primary}/>
                              {c.type==="custom" && !state.completedChallenges?.includes(c.id) && <button onClick={()=>deleteCustomQuest(c.id)} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:"#334155",fontSize:"0.8rem",cursor:"pointer",padding:4 }}>✕</button>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BODY ── */}
        {view==="body" && (
          <div>
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:13 }}>KÖRPER-CHECK</div>

            {/* Metric selector + chart */}
            {bodyEntries.length >= 2 && (
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:12,padding:"13px",marginBottom:15 }}>
                <div style={{ display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:2 }}>
                  {bodyMetrics.map(m=>(
                    <button key={m.k} onClick={()=>setBodyMetric(m.k)} style={{ background:bodyMetric===m.k?`${m.c}22`:"transparent",border:`1px solid ${bodyMetric===m.k?m.c+"55":"#111"}`,color:bodyMetric===m.k?m.c:"#222",borderRadius:6,padding:"4px 10px",fontSize:"0.62rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>{m.l}</button>
                  ))}
                </div>
                <MiniChart data={bodyChartData} color={activeMetric.c} height={70} label={`${activeMetric.l.toUpperCase()} VERLAUF (${activeMetric.u})`}/>
              </div>
            )}

            {/* Delta cards */}
            {bodyEntries.length >= 2 && (
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:10,padding:"11px 13px",marginBottom:15 }}>
                <div style={{ fontSize:"0.56rem",letterSpacing:"0.15em",color:"#334155",marginBottom:8 }}>VERÄNDERUNG (letzte 2 Einträge)</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7 }}>
                  {bodyMetrics.map(m=>{
                    const curr=parseFloat(bodyEntries[0][m.k]),prev=parseFloat(bodyEntries[1][m.k]);
                    if(isNaN(curr)||isNaN(prev)) return null;
                    const diff=curr-prev,better=(m.k==="weight"||m.k==="bf")?diff<0:diff>0;
                    const color=diff===0?"#334155":better?"#22c55e":"#ef4444";
                    return (
                      <div key={m.k} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:"0.54rem",color:"#1e293b" }}>{m.l}</div>
                        <div style={{ fontSize:"0.88rem",fontWeight:700,color,fontFamily:"'Rajdhani',sans-serif",lineHeight:1.2 }}>{diff>0?"+":""}{diff%1===0?diff:diff.toFixed(1)}{m.u}</div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}

            {/* Check-in form */}
            <div style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${rc.primary}22`,borderRadius:12,padding:"15px",marginBottom:15 }}>
              <div style={{ fontSize:"0.58rem",letterSpacing:"0.2em",color:rc.primary,marginBottom:11 }}>NEUE MESSUNG</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8 }}>
                {bodyMetrics.map(m=>(
                  <div key={m.k}>
                    <div style={{ fontSize:"0.58rem",color:"#334155",marginBottom:2 }}>{m.l}{m.u?` (${m.u})`:""}</div>
                    <input value={bodyForm[m.k]} onChange={e=>setBodyForm(p=>({...p,[m.k]:e.target.value}))} placeholder="—" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}/>
                  </div>
                ))}
              </div>
              <input value={bodyForm.note} onChange={e=>setBodyForm(p=>({...p,note:e.target.value}))} placeholder="Notiz (optional)" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
              <button onClick={saveBodyEntry} style={{ width:"100%",background:`linear-gradient(135deg,${rc.primary}18,${rc.primary}30)`,border:`1px solid ${rc.primary}44`,color:rc.primary,borderRadius:9,padding:"11px",fontSize:"0.8rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.1em",cursor:"pointer" }}>CHECK-IN SPEICHERN</button>
            </div>

            {/* History */}
            {bodyEntries.length > 0 && (
              <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:4 }}>VERLAUF</div>
                {bodyEntries.map((e,i)=>(
                  <div key={e.ts} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0a0a14",borderRadius:9,padding:"10px 13px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                      <span style={{ fontSize:"0.63rem",color:i===0?rc.primary:"#334155",fontWeight:i===0?700:400 }}>{i===0?"● AKTUELL":e.date}</span>
                      {i===0 && <span style={{ fontSize:"0.56rem",color:"#1e293b" }}>{e.date}</span>}
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5 }}>
                      {bodyMetrics.filter(m=>e[m.k]).map(m=>(
                        <div key={m.k} style={{ textAlign:"center" }}>
                          <div style={{ fontSize:"0.52rem",color:"#1e293b" }}>{m.l}</div>
                          <div style={{ fontSize:"0.76rem",color:"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:600 }}>{e[m.k]}{m.u}</div>
                        </div>
                      ))}
                    </div>
                    {e.note && <div style={{ fontSize:"0.66rem",color:"#334155",marginTop:5,fontStyle:"italic" }}>"{e.note}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STATS ── */}
        {view==="stats" && (
          <div>
            <RadarChart stats={state.stats} rankColor={rc.primary}/>
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20,marginTop:18 }}>
              {STATS_CONFIG.map(sc=>(
                <div key={sc.key}>
                  <StatBar label={`${sc.label} (${sc.key})`} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color} onClick={()=>setSelectedStat(sc.key)}/>
                  {sc.sub && (
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:5,marginLeft:10 }}>
                      {sc.sub.map(k=><StatBar key={k} label={k} icon={SUB_STATS[k].icon} value={state.stats[k]||0} max={Math.max(10,(state.stats[k]||0)*1.8+5)} color={SUB_STATS[k].color} small onClick={()=>setSelectedStat(k)}/>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:10 }}>RANG-ÜBERSICHT</div>
            {RANKS.map(r=>{
              const idx=RANKS.indexOf(r),ci=RANKS.indexOf(state.rank),passed=idx<ci,active=idx===ci;
              const rC=RANK_COLORS[r];
              return (
                <div key={r} style={{ background:active?`${rC.primary}0c`:"rgba(255,255,255,0.01)",border:`1px solid ${active?rC.primary+"2a":"#0a0a14"}`,borderRadius:9,padding:"10px 13px",marginBottom:6,opacity:passed?0.4:1 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.88rem",color:rC.primary,textShadow:active?`0 0 7px ${rC.primary}`:"none" }}>{r}</span>
                      <div>
                        <div style={{ fontSize:"0.74rem",color:"#4a5568" }}>{rC.label}</div>
                        <div style={{ fontSize:"0.58rem",color:"#1e293b" }}>{rC.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:"0.58rem",color:passed?"#22c55e":active?rC.primary:"#111",letterSpacing:"0.08em" }}>{passed?"✓ DONE":active?"◈ AKTIV":"LOCKED"}</span>
                  </div>
                  {active && <div style={{ marginTop:5,fontSize:"0.64rem",color:"#1e293b" }}>Lv.{state.level}/{LEVELS_PER_RANK} · {state.xp}/{xpNeeded} XP · Global {globalLvl}/{TOTAL_LEVELS}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* ── MEHR ── */}
        {view==="more" && (
          <div>

            {/* Achievements */}
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:11 }}>ACHIEVEMENTS ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:22 }}>
              {ACHIEVEMENTS.map(a=>{
                const unlocked=(state.unlockedAchievements||[]).includes(a.id);
                return (
                  <div key={a.id} style={{ background:unlocked?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.015)",border:`1px solid ${unlocked?"#f59e0b33":"#0a0a14"}`,borderRadius:9,padding:"10px 13px",display:"flex",alignItems:"center",gap:12,opacity:unlocked?1:0.4 }}>
                    <span style={{ fontSize:"1.1rem",flexShrink:0 }}>{a.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"0.8rem",fontWeight:700,color:unlocked?"#f59e0b":"#334155" }}>{a.title}</div>
                      <div style={{ fontSize:"0.68rem",color:"#1e293b" }}>{a.desc}</div>
                    </div>
                    {unlocked && <span style={{ color:"#22c55e",fontSize:"0.9rem",flexShrink:0 }}>✓</span>}
                  </div>
                );
              })}
            </div>

            {/* Einstellungen — collapsible submenu */}
            <div style={{ marginBottom:8 }}>
              <button onClick={()=>toggleSection("settings")} style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"2px 0",marginBottom:collapsedSections["settings"]===false?10:0 }}>
                <span style={{ color:rc.primary,fontSize:"0.7rem" }}>⚙</span>
                <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:rc.primary }}>EINSTELLUNGEN</span>
                <div style={{ flex:1,height:1,background:`${rc.primary}22`,borderRadius:1 }}/>
                <span style={{ fontSize:"0.6rem",color:"#1e293b",transform:collapsedSections["settings"]===false?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
              </button>

              {collapsedSections["settings"]===false && (
                <div style={{ display:"flex",flexDirection:"column",gap:8,animation:"sectionOpen 0.2s ease" }}>

                  {/* Vibration toggle */}
                  <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:11,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:"0.8rem",color:"#94a3b8",fontWeight:600 }}>Vibration</div>
                      <div style={{ fontSize:"0.66rem",color:"#1e293b",marginTop:2 }}>Feedback beim Abschließen von Quests</div>
                    </div>
                    <button onClick={()=>toggleHaptic(!hapticEnabled)} style={{ position:"relative",width:44,height:24,borderRadius:12,background:hapticEnabled?`${rc.primary}44`:"rgba(255,255,255,0.06)",border:`1px solid ${hapticEnabled?rc.primary+"66":"#1a1a2e"}`,cursor:"pointer",transition:"all 0.3s",padding:0,flexShrink:0 }}>
                      <div style={{ position:"absolute",top:2,left:hapticEnabled?22:2,width:18,height:18,borderRadius:"50%",background:hapticEnabled?rc.primary:"#334155",transition:"all 0.25s ease",boxShadow:hapticEnabled?`0 0 6px ${rc.primary}`:"none" }}/>
                    </button>
                  </div>

                  {/* Backup */}
                  <button onClick={exportData} style={{ background:"rgba(34,197,94,0.08)",border:"1px solid #22c55e33",color:"#22c55e",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    ↓ BACKUP HERUNTERLADEN
                  </button>
                  <label style={{ background:"rgba(59,130,246,0.08)",border:"1px solid #3b82f633",color:"#3b82f6",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    ↑ BACKUP IMPORTIEREN
                    <input type="file" accept=".json" onChange={importData} style={{ display:"none" }}/>
                  </label>

                  {/* Reset */}
                  {!confirmReset ? (
                    <button onClick={()=>setConfirmReset(true)} style={{ background:"rgba(239,68,68,0.07)",border:"1px solid #ef444422",color:"#ef4444",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                      ⚠ RESET — ALLES LÖSCHEN
                    </button>
                  ) : (
                    <div style={{ background:"rgba(239,68,68,0.08)",border:"1px solid #ef444444",borderRadius:10,padding:"14px" }}>
                      <div style={{ color:"#ef4444",fontSize:"0.78rem",fontWeight:700,marginBottom:4,letterSpacing:"0.05em" }}>Wirklich alles löschen?</div>
                      <div style={{ color:"#7f1d1d",fontSize:"0.72rem",marginBottom:12,lineHeight:1.5 }}>Rang, Level, XP, Stats, Körper-Daten — alles wird auf 0 zurückgesetzt.</div>
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={handleReset} style={{ flex:1,background:"linear-gradient(135deg,#ef444418,#ef444430)",border:"1px solid #ef444466",color:"#ef4444",borderRadius:8,padding:"11px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em" }}>JA, LÖSCHEN</button>
                        <button onClick={()=>setConfirmReset(false)} style={{ flex:1,background:"transparent",border:"1px solid #1a1a2e",color:"#334155",borderRadius:8,padding:"11px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>ABBRECHEN</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:rc.headerBg,borderTop:`1px solid ${rc.primary}18`,backdropFilter:"blur(20px)",display:"flex",padding:`8px 0 calc(16px + env(safe-area-inset-bottom))`,zIndex:200,transition:"background 1s ease" }}>
        {navItems.map(item=>{
          const active=view===item.id;
          return (
            <button key={item.id} onClick={()=>{ setView(item.id); haptic("light"); }} style={{ flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 0",transition:"all 0.2s",position:"relative" }}>
              {/* Active top bar */}
              <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:active?28:0,height:2,background:rc.primary,borderRadius:"0 0 3px 3px",boxShadow:active?`0 0 8px ${rc.primary}`:"none",transition:"all 0.25s ease" }}/>
              <span style={{ fontSize:"0.92rem",color:active?rc.primary:"#253040",textShadow:active?`0 0 10px ${rc.primary}`:"none",transition:"all 0.2s",marginTop:4 }}>{item.icon}</span>
              <span style={{ fontSize:"0.5rem",letterSpacing:"0.12em",color:active?rc.primary:"#253040",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,transition:"all 0.2s" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}

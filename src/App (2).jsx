import { useState, useEffect, useRef } from "react";

// ============================================================
// CORE CONFIG
// ============================================================
const RANKS = ["E","D","C","B","A","S","SS","SSS"];
const LEVELS_PER_RANK = 10;
const TOTAL_LEVELS = RANKS.length * LEVELS_PER_RANK; // 80

const RANK_COLORS = {
  E:   { primary:"#6b7280", glow:"#6b728033", label:"Novice",           desc:"Du fängst an. Grundlagen legen." },
  D:   { primary:"#22c55e", glow:"#22c55e33", label:"Awakened",         desc:"Erste echte Routinen & Erfolge." },
  C:   { primary:"#3b82f6", glow:"#3b82f633", label:"Hunter",           desc:"Konsistenz ist zur Gewohnheit geworden." },
  B:   { primary:"#8b5cf6", glow:"#8b5cf633", label:"Elite Hunter",     desc:"Du übertriffst 90% der Menschen." },
  A:   { primary:"#f59e0b", glow:"#f59e0b33", label:"Advanced Hunter",  desc:"Top 5% – in allem was du tust." },
  S:   { primary:"#ef4444", glow:"#ef444433", label:"S-Rank Hunter",    desc:"Elite. Kompromisslos. Kein Zurück." },
  SS:  { primary:"#ec4899", glow:"#ec489933", label:"National-Level",   desc:"Legendenstatus. Fast niemand erreicht das." },
  SSS: { primary:"#00ffff", glow:"#00ffff44", label:"Shadow Monarch",   desc:"Das Unmögliche. Du hast es geschafft." },
};

// XP-Kurve: exponentiell für realistische Zeiträume
// E: ~4 Wochen | D: ~6 Wochen | C: ~3 Monate | B: ~6 Monate
// A: ~1 Jahr   | S: ~2 Jahre  | SS: ~4 Jahre  | SSS: ~10 Jahre
const XP_BASE = { E:30, D:74, C:258, B:802, A:2210, S:8487, SS:29239, SSS:191286 };
const XP_PER_LEVEL = (rank, level) => {
  const base = XP_BASE[rank] || 30;
  return Math.floor(base * (1 + (level - 1) * 0.4));
};

// ============================================================
// STATS
// Wichtig: Stats steigen NUR durch Meilensteine (echte Beweise)
// Quests geben nur XP
// ============================================================
const STATS_CONFIG = [
  { key:"STR", label:"Strength",     icon:"⚔️",  color:"#ef4444", desc:"Muskelaufbau · Kraft · Körperzusammensetzung" },
  { key:"AGI", label:"Agility",      icon:"⚡",  color:"#f59e0b", desc:"Ausdauer · Cardio · Schnelligkeit · Beweglichkeit" },
  { key:"INT", label:"Intelligence", icon:"🧠",  color:"#3b82f6", desc:"Physik · Mathe · Programmieren · Wissenschaft" },
  { key:"CRE", label:"Creativity",   icon:"🎨",  color:"#a78bfa", desc:"Musik · Kunst · Kochen · Design · Engineering" },
  { key:"VIT", label:"Vitality",     icon:"💚",  color:"#22c55e", desc:"Ernährung · Schlaf · Gesundheit · Regeneration" },
  { key:"END", label:"Endurance",    icon:"🛡️",  color:"#64748b", desc:"Willenskraft · Disziplin · Mentale Stärke" },
  { key:"CHA", label:"Charisma",     icon:"👑",  color:"#ec4899", desc:"Soziales · Beziehungen · Auftreten", sub:["SOC","REL","APP"] },
];
const SUB_STATS = {
  SOC:{ label:"Social",     icon:"🤝", color:"#06b6d4", desc:"Freundschaften · Netzwerk · Kommunikation" },
  REL:{ label:"Relations",  icon:"❤️", color:"#f43f5e", desc:"Tiefe Beziehungen · Empathie · Verbundenheit" },
  APP:{ label:"Appearance", icon:"✨", color:"#a78bfa", desc:"Aussehen · Stil · Körperpflege · Auftreten" },
};

const CAT_LABELS = {
  strength:"💪 Kraft", cardio:"🏃 Cardio", skill_tech:"💻 Tech/Code",
  skill_creative:"🎨 Kreativ", skill_practical:"🔧 Praktisch",
  social:"🤝 Sozial", appearance:"✨ Aussehen", health:"💚 Gesundheit",
  discipline:"🛡️ Disziplin", uni:"🔬 Uni/Physik", legacy:"👑 Legacy",
};

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
      {id:"e_d11", title:"Etwas selbst kochen",            desc:"Keine Fertigmahlzeit. Irgendetwas selbst zubereiten.",               xp:18, stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
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
      {id:"e_w4", title:"Ein Tutorial fertig machen",      desc:"Kochen, Code, Musik, Elektronik – etwas praktisch abschließen.",    xp:95,  stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
      {id:"e_w5", title:"Kleiderschrank aussortieren",     desc:"Wirf aus was du nicht trägst. Stil beginnt mit Klarheit.",           xp:75,  stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"e_w6", title:"Wochenplan schreiben",            desc:"Nächste Woche planen: Uni, Sport, Soziales, Kreatives.",             xp:85,  stat:"END", statPts:0, type:"weekly", cat:"discipline"},
      {id:"e_w7", title:"Neues Rezept kochen",             desc:"Ein komplett neues Gericht von Anfang bis Ende.",                    xp:90,  stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
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
      {id:"d_d11", title:"Neues Gericht kochen",           desc:"Frische Zutaten, echter Aufwand, kein Fertigprodukt.",              xp:25, stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
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
      {id:"d_w7", title:"Elektronik-Einstieg",             desc:"Arduino Basics, einfacher Schaltkreis, Tutorial – anfangen.",       xp:160, stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
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
      {id:"c_d8",  title:"20 Min. Elektronik / Engineering", desc:"Schaltpläne, Arduino, Simulation, Löten.",                         xp:45, stat:"INT", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"c_d9",  title:"20 Min. Instrument üben",        desc:"Scales, Stücke, Technik – strukturiert üben.",                      xp:40, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"c_d10", title:"20 Min. Zeichnen",               desc:"Figuren, Landschaften, Porträts – täglich besser werden.",           xp:38, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"c_d11", title:"Anspruchsvolles Gericht kochen", desc:"Mehrere Techniken, frische Zutaten, anspruchsvolles Rezept.",        xp:36, stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
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
      {id:"c_w8", title:"Elektronik-Projekt abschließen",  desc:"Bauen, löten, programmieren – ein kleines Projekt fertig.",        xp:290, stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
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
      {id:"c_m9",  title:"Arduino-Projekt fertig",         desc:"Funktionsfähiges Elektronikprojekt – Hardware + Code.",             xp:1150, stat:"CRE", statPts:20, type:"milestone", cat:"skill_practical"},
      {id:"c_m10", title:"Physik-Seminar/Praktikum",       desc:"Experimentalphysik-Praktikum oder Seminar erfolgreich.",            xp:1050, stat:"INT", statPts:19, type:"milestone", cat:"uni"},
      {id:"c_m11", title:"Instrument: vor jemandem spielen", desc:"Selbsttest: Spielst du das Lied jemandem vor – ohne Scham?",      xp:950,  stat:"CRE", statPts:17, type:"milestone", cat:"skill_creative"},
      {id:"c_m12", title:"Zeichnen: erkennbares Gesicht",  desc:"Selbsttest: Zeichne ein Gesicht – ist es als solches erkennbar?",  xp:820,  stat:"CRE", statPts:15, type:"milestone", cat:"skill_creative"},
      {id:"c_m13", title:"10 Gerichte ohne Rezept",        desc:"Selbsttest: 10 Gerichte die du jederzeit aus dem Kopf kochst.",    xp:860,  stat:"CRE", statPts:15, type:"milestone", cat:"skill_practical"},
      {id:"c_m14", title:"Sauce von Grund auf kochen",     desc:"Selbsttest: Bechamel, Bolognese oder Hollandaise – selbst gemacht.", xp:760, stat:"CRE", statPts:13, type:"milestone", cat:"skill_practical"},
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
      {id:"b_d10", title:"Gericht von Grund auf",          desc:"Frische Zutaten, keine Halbfertigprodukte, eigene Sauce.",           xp:58, stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
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
      {id:"b_w5", title:"Komplexes Gericht meistern",       desc:"Ein aufwendiges Gericht das du noch nie gemacht hast.",             xp:295, stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
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
      {id:"b_m10", title:"Komplexes Elektronikprojekt",     desc:"Mikrocontroller + Code + Hardware. Fertig und funktioniert.",       xp:2750, stat:"CRE", statPts:37, type:"milestone", cat:"skill_practical"},
      {id:"b_m11", title:"Uni-Semester überdurchschnittlich", desc:"Ein Semester mit Noten klar über dem Durchschnitt.",              xp:3650, stat:"INT", statPts:47, type:"milestone", cat:"uni"},
      {id:"b_m12", title:"Instrument: vor Fremden spielen", desc:"Selbsttest: Spielst du vor jemandem den du kaum kennst?",          xp:2350, stat:"CRE", statPts:32, type:"milestone", cat:"skill_creative"},
      {id:"b_m13", title:"Zeichnen: erkennbares Porträt",   desc:"Selbsttest: Zeichne jemanden – erkennt man diese Person?",        xp:2050, stat:"CRE", statPts:28, type:"milestone", cat:"skill_creative"},
      {id:"b_m14", title:"3-Gang-Menü für Gäste kochen",    desc:"Selbsttest: Vorspeise, Hauptgang, Dessert – Gäste beeindruckt?",  xp:2150, stat:"CRE", statPts:29, type:"milestone", cat:"skill_practical"},
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
      {id:"a_d10", title:"Gourmet-Gericht kochen",         desc:"Komplexe Saucen, Timing, mehrere Komponenten.",                     xp:82,  stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
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
      {id:"a_m14", title:"5-Gang-Menü für Gäste",          desc:"Selbsttest: 5 Gänge selbst – Gäste sind beeindruckt?",             xp:4700, stat:"CRE", statPts:47, type:"milestone", cat:"skill_practical"},
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
const getRankFromGlobal = (g) => ({ rank: RANKS[Math.floor((g-1)/LEVELS_PER_RANK)], level: ((g-1)%LEVELS_PER_RANK)+1 });
const defaultState = (name) => ({
  name, rank:"E", level:1, xp:0,
  stats:{ STR:0, AGI:0, INT:0, CRE:0, VIT:0, END:0, CHA:0, SOC:0, REL:0, APP:0 },
  completedChallenges:[], lastDailyReset:null, lastWeeklyReset:null, totalXP:0,
});
const saveState = (s) => localStorage.setItem("arise_v3", JSON.stringify(s));
const loadState = () => { try { return JSON.parse(localStorage.getItem("arise_v3")); } catch { return null; } };
const getTodayStr = () => new Date().toDateString();
const getWeekStr  = () => { const d=new Date(); return `${d.getFullYear()}-W${Math.ceil(d.getDate()/7)}`; };

// ============================================================
// RADAR CHART — alle Stats auf einen Blick
// ============================================================
const RadarChart = ({ stats, rankColor }) => {
  const cx = 130, cy = 130, r = 95;
  // 7 axes: STR, AGI, INT, CRE, VIT, END, CHA
  const axes = [
    { key:"STR", label:"STR", icon:"⚔️",  color:"#ef4444" },
    { key:"AGI", label:"AGI", icon:"⚡",  color:"#f59e0b" },
    { key:"INT", label:"INT", icon:"🧠",  color:"#3b82f6" },
    { key:"CRE", label:"CRE", icon:"🎨",  color:"#a78bfa" },
    { key:"VIT", label:"VIT", icon:"💚",  color:"#22c55e" },
    { key:"END", label:"END", icon:"🛡️",  color:"#64748b" },
    { key:"CHA", label:"CHA", icon:"👑",  color:"#ec4899" },
  ];
  const n = axes.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const maxVal = Math.max(10, ...axes.map(a => stats[a.key] || 0));

  const getPoint = (i, val, maxV) => {
    const pct = Math.min(val / maxV, 1);
    const a = angle(i);
    return {
      x: cx + Math.cos(a) * r * pct,
      y: cy + Math.sin(a) * r * pct,
    };
  };

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const dataPoints = axes.map((ax, i) => getPoint(i, stats[ax.key] || 0, maxVal));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${rankColor}22`, borderRadius:14, padding:"16px 12px 8px", marginBottom:4 }}>
      <div style={{ fontSize:"0.58rem", letterSpacing:"0.3em", color:"#1e293b", marginBottom:12 }}>STAT OVERVIEW</div>
      <div style={{ display:"flex", justifyContent:"center" }}>
        <svg width={260} height={260} viewBox="0 0 260 260" style={{ overflow:"visible" }}>
          {/* Grid circles */}
          {gridLevels.map((pct, gi) => {
            const pts = axes.map((_, i) => {
              const a = angle(i);
              return `${(cx + Math.cos(a) * r * pct).toFixed(1)},${(cy + Math.sin(a) * r * pct).toFixed(1)}`;
            });
            return (
              <polygon key={gi} points={pts.join(" ")}
                fill="none" stroke="rgba(255,255,255,0.05)"
                strokeWidth={gi === gridLevels.length - 1 ? 1 : 0.5}/>
            );
          })}

          {/* Axis lines */}
          {axes.map((ax, i) => {
            const a = angle(i);
            const ex = cx + Math.cos(a) * r;
            const ey = cy + Math.sin(a) * r;
            return <line key={i} x1={cx} y1={cy} x2={ex.toFixed(1)} y2={ey.toFixed(1)} stroke="rgba(255,255,255,0.07)" strokeWidth={0.8}/>;
          })}

          {/* Data fill */}
          <path d={dataPath}
            fill={`${rankColor}1a`}
            stroke={rankColor}
            strokeWidth={1.8}
            strokeLinejoin="round"
            style={{ filter:`drop-shadow(0 0 6px ${rankColor}66)` }}
          />

          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3.5}
              fill={axes[i].color}
              stroke="#050508" strokeWidth={1.5}
              style={{ filter:`drop-shadow(0 0 4px ${axes[i].color})` }}
            />
          ))}

          {/* Labels */}
          {axes.map((ax, i) => {
            const a = angle(i);
            const lx = cx + Math.cos(a) * (r + 22);
            const ly = cy + Math.sin(a) * (r + 22);
            const val = stats[ax.key] || 0;
            return (
              <g key={i}>
                <text x={lx.toFixed(1)} y={(ly - 5).toFixed(1)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9.5} fontWeight={700} letterSpacing={1}
                  fill={ax.color} fontFamily="'Rajdhani',sans-serif"
                >{ax.label}</text>
                <text x={lx.toFixed(1)} y={(ly + 8).toFixed(1)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9} fill={val > 0 ? "#e2e8f0" : "#1e293b"}
                  fontFamily="'Rajdhani',sans-serif" fontWeight={700}
                >{val}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ============================================================
// STAT BAR
// ============================================================
const StatBar = ({ label, icon, value, max=100, color, small=false }) => {
  const pct = Math.min(value>0?(value/max)*100:0, 100);
  return (
    <div style={{ background:"rgba(255,255,255,0.025)", border:`1px solid ${color}22`, borderRadius:8, padding: small?"7px 10px":"9px 12px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize: small?"0.68rem":"0.74rem", color:"#666" }}>{icon} {label}</span>
        <span style={{ fontSize: small?"0.72rem":"0.8rem", color, fontWeight:700, fontFamily:"'Rajdhani',sans-serif" }}>{value}</span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:3, height:3, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${color}66,${color})`, boxShadow:`0 0 5px ${color}88`, borderRadius:3, transition:"width 0.6s ease" }}/>
      </div>
    </div>
  );
};

const ChallengeCard = ({ challenge, done, onComplete, rankColor }) => {
  const typeColors  = { daily:"#3b82f6", weekly:"#8b5cf6", milestone:"#f59e0b" };
  const typeLabels  = { daily:"◈ TÄGLICH", weekly:"◉ WÖCHENTLICH", milestone:"★ MEILENSTEIN" };
  const tc = typeColors[challenge.type];
  const isMilestone = challenge.type === "milestone";
  const statKey = challenge.subStat || challenge.stat;
  const statColor = SUB_STATS[statKey]?.color || STATS_CONFIG.find(s=>s.key===statKey)?.color || "#aaa";

  return (
    <div style={{
      background: done ? "rgba(255,255,255,0.01)" : isMilestone ? `linear-gradient(135deg,rgba(255,255,255,0.04),${tc}08)` : "rgba(255,255,255,0.035)",
      border:`1px solid ${done?"#111":isMilestone?tc+"55":tc+"33"}`,
      borderRadius:10, padding:"13px 14px",
      opacity: done?0.4:1, transition:"all 0.3s",
      position:"relative", overflow:"hidden",
    }}>
      {!done && <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${tc},transparent)`,opacity:isMilestone?0.7:0.4 }}/>}
      {isMilestone && !done && <div style={{ position:"absolute",top:0,left:0,bottom:0,width:2,background:`linear-gradient(180deg,transparent,${tc},transparent)`,opacity:0.4 }}/>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:5, marginBottom:4 }}>
            <span style={{ color:tc, fontSize:"0.62rem", letterSpacing:"0.1em" }}>{typeLabels[challenge.type]}</span>
            {isMilestone && (
              <>
                <span style={{ color:"#333" }}>·</span>
                <span style={{ color:"#22c55e", fontSize:"0.62rem" }}>+{challenge.xp} XP</span>
                <span style={{ color:"#333" }}>·</span>
                <span style={{ color:statColor, fontSize:"0.62rem", fontWeight:700 }}>+{challenge.statPts} {statKey}</span>
              </>
            )}
            {!isMilestone && <><span style={{ color:"#333" }}>·</span><span style={{ color:"#22c55e88", fontSize:"0.62rem" }}>+{challenge.xp} XP</span></>}
          </div>
          <div style={{ color:done?"#333":"#dde", fontWeight:600, fontSize:"0.87rem", marginBottom:3, lineHeight:1.3 }}>{challenge.title}</div>
          <div style={{ color:"#3d4f6a", fontSize:"0.75rem", lineHeight:1.4 }}>{challenge.desc}</div>
        </div>
        {!done && (
          <button onClick={()=>onComplete(challenge)} style={{
            background:`linear-gradient(135deg,${tc}14,${tc}28)`, border:`1px solid ${tc}44`,
            color:tc, borderRadius:8, padding:isMilestone?"9px 14px":"6px 12px",
            fontSize:isMilestone?"0.82rem":"0.76rem",
            cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
            fontFamily:"'Rajdhani',sans-serif", fontWeight:700, letterSpacing:"0.05em",
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>e.target.style.boxShadow=`0 0 12px ${tc}44`}
          onMouseLeave={e=>e.target.style.boxShadow="none"}
          >{isMilestone?"BEWIESEN":"DONE"}</button>
        )}
        {done && <span style={{ color:"#22c55e88", fontSize:"1rem", flexShrink:0 }}>✓</span>}
      </div>
    </div>
  );
};

// ============================================================
// MAIN
// ============================================================
export default function AriseApp() {
  const [state, setState] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [view, setView] = useState("profile");
  const [notification, setNotification] = useState(null);
  const [levelUpAnim, setLevelUpAnim] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const notifRef = useRef(null);

  useEffect(() => { const s = loadState(); if(s) setState(s); }, []);

  // Daily/Weekly reset
  useEffect(() => {
    if(!state) return;
    const today = getTodayStr(), week = getWeekStr();
    let u = {...state}, changed = false;
    if(state.lastDailyReset !== today) {
      const ids = Object.values(CHALLENGES_DB).flatMap(r=>r.daily.map(c=>c.id));
      u.completedChallenges = state.completedChallenges.filter(id=>!ids.includes(id));
      u.lastDailyReset = today; changed = true;
    }
    if(state.lastWeeklyReset !== week) {
      const ids = Object.values(CHALLENGES_DB).flatMap(r=>r.weekly.map(c=>c.id));
      u.completedChallenges = (u.completedChallenges||state.completedChallenges).filter(id=>!ids.includes(id));
      u.lastWeeklyReset = week; changed = true;
    }
    if(changed) { setState(u); saveState(u); }
  }, [state?.rank]);

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
    setState(s); saveState(s);
  };

  const handleComplete = (challenge) => {
    let s = { ...state, stats:{...state.stats}, completedChallenges:[...(state.completedChallenges||[])] };
    s.completedChallenges.push(challenge.id);
    s.xp = (s.xp||0) + challenge.xp;
    s.totalXP = (s.totalXP||0) + challenge.xp;

    // KEY RULE: Stat-Punkte NUR bei Meilensteinen
    if(challenge.type === "milestone" && challenge.statPts > 0) {
      const sk = challenge.subStat || challenge.stat;
      s.stats[sk] = (s.stats[sk]||0) + challenge.statPts;
      if(challenge.subStat) s.stats.CHA = (s.stats.CHA||0) + Math.max(1, Math.floor(challenge.statPts/5));
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
    setState(s); saveState(s);
  };

  // ── SETUP ──
  if(!state) return (
    <div style={{ minHeight:"100vh", background:"#050508", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Rajdhani',sans-serif", backgroundImage:"radial-gradient(ellipse at 50% 0%,#0d0d2b,#050508 60%)", padding:24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ fontSize:"0.65rem", letterSpacing:"0.4em", color:"#1e2a3a", marginBottom:14 }}>SYSTEM NOTIFICATION</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"clamp(2.5rem,10vw,4.5rem)", fontWeight:900, background:"linear-gradient(135deg,#00ffff,#8b5cf6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1, marginBottom:8 }}>ARISE</div>
        <div style={{ color:"#1e2a3a", fontSize:"0.78rem", letterSpacing:"0.25em" }}>YOU HAVE BEEN CHOSEN TO LEVEL UP</div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid #1a1a3e", borderRadius:16, padding:"28px 24px", width:"100%", maxWidth:380 }}>
        <div style={{ color:"#4a5568", fontSize:"0.82rem", marginBottom:22, lineHeight:1.6 }}>Das System hat dich auserwählt. Dein Erwachen beginnt jetzt.</div>
        <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCreate()} placeholder="Dein Name..." style={{ width:"100%", background:"rgba(0,255,255,0.03)", border:"1px solid #00ffff22", borderRadius:10, padding:"13px 15px", color:"#e2e8f0", fontSize:"1rem", fontFamily:"'Rajdhani',sans-serif", outline:"none", boxSizing:"border-box", marginBottom:14, letterSpacing:"0.05em" }}/>
        <button onClick={handleCreate} style={{ width:"100%", background:"linear-gradient(135deg,#00ffff18,#8b5cf625)", border:"1px solid #00ffff44", color:"#00ffff", borderRadius:10, padding:13, fontSize:"0.95rem", fontFamily:"'Orbitron',sans-serif", fontWeight:700, letterSpacing:"0.15em", cursor:"pointer" }}>ERWACHEN</button>
      </div>
    </div>
  );

  // ── MAIN ──
  const rc = RANK_COLORS[state.rank];
  const xpNeeded = XP_PER_LEVEL(state.rank, state.level);
  const xpPct = Math.min((state.xp/xpNeeded)*100, 100);
  const globalLvl = getGlobalLevel(state.rank, state.level);

  const currentDB = CHALLENGES_DB[state.rank] || {daily:[],weekly:[],milestones:[]};
  const allMilestones = Object.entries(CHALLENGES_DB)
    .filter(([r])=>RANKS.indexOf(r)<=RANKS.indexOf(state.rank))
    .flatMap(([,v])=>v.milestones);

  let displayChallenges = [...currentDB.daily, ...currentDB.weekly, ...allMilestones];
  if(filterType!=="all") displayChallenges = displayChallenges.filter(c=>c.type===filterType);
  if(filterCat!=="all")  displayChallenges = displayChallenges.filter(c=>c.cat===filterCat);

  const todayDone = currentDB.daily.filter(c=>state.completedChallenges?.includes(c.id)).length;
  const availableCats = [...new Set([...currentDB.daily,...currentDB.weekly,...allMilestones].map(c=>c.cat))];

  // Milestone stat totals for context
  const totalMilestonesDone = Object.values(CHALLENGES_DB).flatMap(r=>r.milestones).filter(c=>state.completedChallenges?.includes(c.id)).length;

  const navItems = [{id:"profile",icon:"◈",label:"Status"},{id:"quests",icon:"◉",label:"Quests"},{id:"stats",icon:"▲",label:"Stats"}];

  return (
    <div style={{ minHeight:"100vh", background:"#050508", fontFamily:"'Rajdhani',sans-serif", color:"#e2e8f0", backgroundImage:`radial-gradient(ellipse at 50% -5%,${rc.glow},transparent 55%)`, maxWidth:480, margin:"0 auto", display:"flex", flexDirection:"column", position:"relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeInOut{0%{opacity:0;transform:scale(.85)}20%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0}} @keyframes glitch{0%,100%{transform:translate(0)}25%{transform:translate(-2px,1px)}75%{transform:translate(2px,-1px)}} *{-webkit-tap-highlight-color:transparent;}`}</style>

      {levelUpAnim && (
        <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.9)",animation:"fadeInOut 2.8s ease forwards",pointerEvents:"none" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(2rem,10vw,3.5rem)",fontWeight:900,color:rc.primary,textShadow:`0 0 30px ${rc.primary}`,animation:"glitch 0.4s infinite",letterSpacing:"0.08em" }}>{levelUpAnim.rankUp?"RANK UP!":"LEVEL UP"}</div>
            <div style={{ color:"#555",fontSize:"0.9rem",marginTop:8,letterSpacing:"0.25em" }}>{levelUpAnim.rank}-RANK · LV.{levelUpAnim.level}</div>
          </div>
        </div>
      )}
      {notification && (
        <div style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.94)",border:`1px solid ${notification.color}44`,borderRadius:10,padding:"9px 18px",color:notification.color,fontFamily:"'Orbitron',sans-serif",fontSize:"0.72rem",letterSpacing:"0.08em",zIndex:500,whiteSpace:"nowrap",animation:"fadeInOut 3.5s ease" }}>{notification.msg}</div>
      )}

      {/* Header */}
      <div style={{ padding:"18px 18px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <div>
            <div style={{ fontSize:"0.58rem",letterSpacing:"0.35em",color:"#1e293b",marginBottom:1 }}>PLAYER</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1rem",fontWeight:900,color:"#e2e8f0",letterSpacing:"0.06em" }}>{state.name}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.3rem",fontWeight:900,color:rc.primary,textShadow:`0 0 10px ${rc.primary}` }}>{state.rank}<span style={{ fontSize:"0.65rem",color:"#1e293b",marginLeft:3 }}>Rank</span></div>
            <div style={{ fontSize:"0.63rem",color:"#334155" }}>Lv.{state.level} · {rc.label}</div>
          </div>
        </div>
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
            <span style={{ fontSize:"0.6rem",color:"#1e293b",letterSpacing:"0.1em" }}>EXP</span>
            <span style={{ fontSize:"0.6rem",color:rc.primary }}>{state.xp} / {xpNeeded}</span>
          </div>
          <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:4,height:5,overflow:"hidden" }}>
            <div style={{ width:`${xpPct}%`,height:"100%",background:`linear-gradient(90deg,${rc.primary}44,${rc.primary})`,boxShadow:`0 0 8px ${rc.primary}88`,borderRadius:4,transition:"width 0.8s ease" }}/>
          </div>
          {view==="quests" && <div style={{ fontSize:"0.58rem",color:"#1e293b",marginTop:3 }}>Heute: {todayDone}/{currentDB.daily.length} tägl. · {totalMilestonesDone} Meilensteine abgeschlossen</div>}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1,overflowY:"auto",padding:"16px 13px 100px" }}>

        {/* ── PROFILE ── */}
        {view==="profile" && (
          <div>
            <div style={{ background:`linear-gradient(135deg,${rc.primary}0c,${rc.primary}1c)`,border:`1px solid ${rc.primary}33`,borderRadius:14,padding:"17px",marginBottom:17,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-8,right:-8,fontSize:"5rem",opacity:0.04,fontFamily:"'Orbitron',sans-serif",fontWeight:900,color:rc.primary,lineHeight:1,pointerEvents:"none" }}>{state.rank}</div>
              <div style={{ fontSize:"0.58rem",letterSpacing:"0.3em",color:rc.primary,marginBottom:5 }}>AKTUELLER RANG</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.8rem",color:rc.primary,textShadow:`0 0 16px ${rc.primary}` }}>{state.rank}-Rank</div>
              <div style={{ color:"#4a5568",fontSize:"0.78rem",marginTop:2,marginBottom:12 }}>{rc.label} — {rc.desc}</div>
              <div style={{ display:"flex",gap:3 }}>
                {RANKS.map((r,i)=>{
                  const ci=RANKS.indexOf(state.rank), passed=i<ci, active=i===ci;
                  const rC=RANK_COLORS[r].primary;
                  return <div key={r} style={{ flex:1,textAlign:"center" }}>
                    <div style={{ height:3,borderRadius:3,background:passed?rC:active?`${rC}88`:"#0d0d17",boxShadow:active?`0 0 6px ${rC}`:"none",transition:"all 0.3s" }}/>
                    <div style={{ fontSize:"0.42rem",marginTop:2,color:passed||active?rC:"#1e1e30",fontWeight:700 }}>{r}</div>
                  </div>;
                })}
              </div>
            </div>

            <div style={{ fontSize:"0.58rem",letterSpacing:"0.3em",color:"#1e293b",marginBottom:9 }}>KERN-STATS</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12 }}>
              {STATS_CONFIG.filter(s=>!["SOC","REL","APP"].includes(s.key)).map(sc=>(
                <StatBar key={sc.key} label={sc.key} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color}/>
              ))}
            </div>
            <div style={{ fontSize:"0.58rem",letterSpacing:"0.3em",color:"#1e293b",marginBottom:9 }}>CHARISMA</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:18 }}>
              {["SOC","REL","APP"].map(k=>(
                <StatBar key={k} label={k} icon={SUB_STATS[k].icon} value={state.stats[k]||0} max={Math.max(10,(state.stats[k]||0)*1.8+5)} color={SUB_STATS[k].color} small/>
              ))}
            </div>

            <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:11,padding:"13px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
              {[
                {label:"Total XP",     val:(state.totalXP||0).toLocaleString(), color:"#00ffff"},
                {label:"Meilensteine", val:totalMilestonesDone,                 color:"#f59e0b"},
                {label:"Global",       val:`${((globalLvl/TOTAL_LEVELS)*100).toFixed(0)}%`, color:rc.primary},
              ].map(item=>(
                <div key={item.label} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"1.05rem",fontWeight:700,color:item.color,fontFamily:"'Orbitron',sans-serif" }}>{item.val}</div>
                  <div style={{ fontSize:"0.56rem",color:"#1e293b",letterSpacing:"0.08em",marginTop:2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUESTS ── */}
        {view==="quests" && (
          <div>
            <div style={{ fontSize:"0.58rem",letterSpacing:"0.3em",color:"#1e293b",marginBottom:11 }}>QUESTS — {state.rank}-RANK</div>

            <div style={{ display:"flex",gap:5,marginBottom:9,overflowX:"auto",paddingBottom:3 }}>
              {["all","daily","weekly","milestone"].map(f=>(
                <button key={f} onClick={()=>setFilterType(f)} style={{ background:filterType===f?`${rc.primary}18`:"transparent",border:`1px solid ${filterType===f?rc.primary+"44":"#111"}`,color:filterType===f?rc.primary:"#222",borderRadius:7,padding:"5px 11px",fontSize:"0.67rem",letterSpacing:"0.08em",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>
                  {f==="all"?"Alle":f==="daily"?"Täglich":f==="weekly"?"Wöchentl.":"Meilensteine"}
                </button>
              ))}
            </div>
            <div style={{ display:"flex",gap:5,marginBottom:15,overflowX:"auto",paddingBottom:3 }}>
              <button onClick={()=>setFilterCat("all")} style={{ background:filterCat==="all"?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat==="all"?rc.primary+"33":"#0d0d17"}`,color:filterCat==="all"?rc.primary:"#1e293b",borderRadius:6,padding:"4px 9px",fontSize:"0.6rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0 }}>Alle</button>
              {availableCats.map(cat=>(
                <button key={cat} onClick={()=>setFilterCat(cat)} style={{ background:filterCat===cat?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat===cat?rc.primary+"33":"#0d0d17"}`,color:filterCat===cat?rc.primary:"#1e293b",borderRadius:6,padding:"4px 9px",fontSize:"0.6rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>{CAT_LABELS[cat]||cat}</button>
              ))}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {displayChallenges.length===0 && <div style={{ color:"#1e293b",textAlign:"center",padding:"40px 0",fontSize:"0.85rem" }}>Keine Quests für diesen Filter.</div>}
              {displayChallenges.map(c=>(
                <ChallengeCard key={c.id} challenge={c} done={state.completedChallenges?.includes(c.id)} onComplete={handleComplete} rankColor={rc.primary}/>
              ))}
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        {view==="stats" && (
          <div>
            {/* ── RADAR CHART ── */}
            <RadarChart stats={state.stats} rankColor={rc.primary}/>

            {/* ── STAT BARS ── */}
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:22,marginTop:20 }}>
              {STATS_CONFIG.map(sc=>(
                <div key={sc.key}>
                  <StatBar label={`${sc.label} (${sc.key})`} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color}/>
                  {sc.sub && (
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:5,marginLeft:10 }}>
                      {sc.sub.map(k=>(
                        <StatBar key={k} label={k} icon={SUB_STATS[k].icon} value={state.stats[k]||0} max={Math.max(10,(state.stats[k]||0)*1.8+5)} color={SUB_STATS[k].color} small/>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ fontSize:"0.58rem",letterSpacing:"0.3em",color:"#1e293b",marginBottom:11 }}>RANG-ÜBERSICHT</div>
            {RANKS.map(r=>{
              const idx=RANKS.indexOf(r),ci=RANKS.indexOf(state.rank),passed=idx<ci,active=idx===ci;
              const rC=RANK_COLORS[r];
              return (
                <div key={r} style={{ background:active?`${rC.primary}0c`:"rgba(255,255,255,0.01)",border:`1px solid ${active?rC.primary+"2a":"#0a0a14"}`,borderRadius:9,padding:"11px 13px",marginBottom:6,opacity:passed?0.4:1 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.9rem",color:rC.primary,textShadow:active?`0 0 7px ${rC.primary}`:"none" }}>{r}</span>
                      <div>
                        <div style={{ fontSize:"0.75rem",color:"#4a5568" }}>{rC.label}</div>
                        <div style={{ fontSize:"0.6rem",color:"#1e293b" }}>{rC.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:"0.6rem",color:passed?"#22c55e":active?rC.primary:"#111",letterSpacing:"0.08em" }}>{passed?"✓ DONE":active?"◈ AKTIV":"LOCKED"}</span>
                  </div>
                  {active && <div style={{ marginTop:6,fontSize:"0.67rem",color:"#1e293b" }}>Lv.{state.level}/{LEVELS_PER_RANK} · {state.xp}/{xpNeeded} XP · Global {globalLvl}/{TOTAL_LEVELS}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(2,2,5,0.97)",borderTop:"1px solid rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",display:"flex",padding:"8px 0 18px",zIndex:200 }}>
        {navItems.map(item=>{
          const active=view===item.id;
          return (
            <button key={item.id} onClick={()=>setView(item.id)} style={{ flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"7px 0",transition:"all 0.2s" }}>
              <span style={{ fontSize:"0.95rem",color:active?rc.primary:"#1a1a28",textShadow:active?`0 0 8px ${rc.primary}`:"none",transition:"all 0.2s" }}>{item.icon}</span>
              <span style={{ fontSize:"0.56rem",letterSpacing:"0.12em",color:active?rc.primary:"#1a1a28",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,transition:"all 0.2s" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

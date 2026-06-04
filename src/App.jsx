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

const XP_PER_LEVEL = (rank, level) => {
  const ri = RANKS.indexOf(rank);
  return Math.floor((120 + ri * 180) * (1 + (level - 1) * 0.35));
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
//
// REGEL: daily/weekly → xp ONLY (statPts: 0)
//        milestones   → xp + statPts (echter Beweis einer Fähigkeit)
//
// Meilensteine sind GATES: du beweist es, du verdienst den Stat-Punkt.
// ============================================================
const CHALLENGES_DB = {

  // ══════════════════════════════════════
  // E-RANK — Novice. Absolute Grundlagen.
  // ══════════════════════════════════════
  E:{
    daily:[
      // Kraft
      {id:"e_d1",  title:"10 Liegestütze",               desc:"10 saubere Liegestütze. Form zählt mehr als Schnelligkeit.",           xp:20, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"e_d2",  title:"20 Kniebeugen",                desc:"20 Kniebeugen mit gerader Wirbelsäule und tiefer Hocke.",              xp:18, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"e_d3",  title:"30 Sec. Plank",                desc:"Halte eine saubere Plank-Position für 30 Sekunden.",                   xp:14, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      // Cardio
      {id:"e_d4",  title:"15 Min. Spaziergang",          desc:"Raus gehen. Frische Luft. Bewegung beginnt hier.",                     xp:15, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"e_d5",  title:"5 Min. Dehnen",                desc:"Hüfte, Oberschenkel, Schultern – Mobilität ist die Basis von allem.",  xp:12, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      // Uni & Physik
      {id:"e_d6",  title:"10 Min. Physik-Notizen",       desc:"Schreib aktiv Notizen zu einem Thema aus der Vorlesung.",              xp:20, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"e_d7",  title:"1 Physik-Aufgabe lösen",       desc:"Eine einzige Aufgabe komplett durchrechnen. Qualität über Quantität.", xp:22, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      // Programmieren
      {id:"e_d8",  title:"10 Min. Programmieren",        desc:"Editor öffnen, irgendetwas schreiben. Der erste Schritt zählt.",       xp:18, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"e_d9",  title:"10 Min. Lesen (Sach/Fach)",   desc:"Buch, Artikel oder Dokumentation – 10 Minuten fokussiertes Lesen.",    xp:15, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      // Kreativität
      {id:"e_d10", title:"5 Min. Zeichnen/Skizzieren",   desc:"Skizziere irgendwas ohne Bewertung. Anfänger zeichnen auch.",          xp:15, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"e_d11", title:"Musik bewusst anhören",        desc:"Ein Lied komplett anhören und analysieren: Rhythmus, Struktur, Feeling.", xp:10, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"e_d12", title:"Etwas selbst kochen",          desc:"Kein Fertigessen. Irgendetwas selbst zubereiten – egal wie simpel.",   xp:18, stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
      // Gesundheit
      {id:"e_d13", title:"1,5L Wasser",                  desc:"Mindestens 1,5 Liter Wasser trinken. Hydration ist unterschätzt.",     xp:12, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"e_d14", title:"Kein Fast Food",               desc:"Einen Tag ohne Fast Food. Einmal bewusst essen.",                      xp:15, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"e_d15", title:"Vor 23:30 Uhr schlafen",       desc:"Schlaf ist Muskelaufbau, Lernen, Erholung. Geh rechtzeitig ins Bett.", xp:15, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      // Disziplin
      {id:"e_d16", title:"Handy 30 Min. weglegen",       desc:"30 Minuten ohne Smartphone. Tue stattdessen etwas Produktives.",       xp:18, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"e_d17", title:"Zimmer/Schreibtisch aufräumen", desc:"Ordnung außen schafft Ordnung innen.",                                 xp:10, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"e_d18", title:"To-Do-Liste schreiben",        desc:"Schreib 3 Dinge auf die du heute erledigen willst.",                   xp:12, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      // Soziales
      {id:"e_d19", title:"Einem Freund aktiv schreiben", desc:"Kontakt aufnehmen – nicht warten bis jemand schreibt.",                xp:15, stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"e_d20", title:"Mit jemandem reden (nicht digital)", desc:"Ein echtes Gespräch – in Person oder am Telefon.",               xp:18, stat:"CHA", statPts:0, type:"daily", cat:"social"},
      // Aussehen
      {id:"e_d21", title:"Basis-Hygiene vollständig",    desc:"Zähne 2x, Gesicht waschen, Deo – konsequent jeden Tag.",               xp:10, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
      {id:"e_d22", title:"Gepflegt aus dem Haus gehen",  desc:"Bewusst auf dein Erscheinungsbild achten bevor du rausgehst.",         xp:12, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
    ],
    weekly:[
      {id:"e_w1", title:"3x Sport diese Woche",           desc:"Egal was – 3 Trainingseinheiten in dieser Woche absolvieren.",         xp:120, stat:"END", statPts:0, type:"weekly", cat:"strength"},
      {id:"e_w2", title:"Ernährungstagebuch (5 Tage)",    desc:"5 Tage aufschreiben was du isst. Bewusstsein ist der erste Schritt.",  xp:90,  stat:"VIT", statPts:0, type:"weekly", cat:"health"},
      {id:"e_w3", title:"Einen Freund real treffen",      desc:"Nicht nur chatten – echte Zeit gemeinsam verbringen.",                 xp:100, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"e_w4", title:"Ein Tutorial abschließen",       desc:"Kochen, Code, Musik, Elektronik – irgendetwas Praktisches lernen.",    xp:90,  stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
      {id:"e_w5", title:"Kleiderschrank aussortieren",    desc:"Werfe aus was du nicht trägst. Stil beginnt mit Klarheit.",            xp:70,  stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"e_w6", title:"Wochenplan aufschreiben",        desc:"Plane die kommende Woche: Uni, Sport, Soziales – alles strukturieren.", xp:80,  stat:"END", statPts:0, type:"weekly", cat:"discipline"},
      {id:"e_w7", title:"Neues Rezept kochen",            desc:"Ein Gericht das du noch nie gekocht hast von Anfang bis Ende.",        xp:85,  stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
    ],
    milestones:[
      // STR Meilensteine — echter Körperbeweis
      {id:"e_m1",  title:"20 Liegestütze am Stück",       desc:"20 saubere Liegestütze ohne Pause. Beweise es dir selbst.",            xp:300,  stat:"STR", statPts:5,  type:"milestone", cat:"strength"},
      {id:"e_m2",  title:"1 Min. Plank halten",           desc:"60 Sekunden saubere Plank. Kein Einknicken.",                          xp:250,  stat:"STR", statPts:4,  type:"milestone", cat:"strength"},
      // AGI Meilensteine
      {id:"e_m3",  title:"1km am Stück laufen",           desc:"1 Kilometer ohne Stopp. Tempo egal – Distanz zählt.",                  xp:250,  stat:"AGI", statPts:5,  type:"milestone", cat:"cardio"},
      {id:"e_m4",  title:"3km laufen",                    desc:"3km am Stück. Dein erster echter Lauf.",                               xp:350,  stat:"AGI", statPts:7,  type:"milestone", cat:"cardio"},
      // INT Meilensteine
      {id:"e_m5",  title:"Hello World – erstes Programm", desc:"Dein erstes lauffähiges Programm. Python, JS, C – egal.",              xp:250,  stat:"INT", statPts:5,  type:"milestone", cat:"skill_tech"},
      {id:"e_m6",  title:"Physik-Übungsblatt komplett",   desc:"Ein ganzes Übungsblatt vollständig und korrekt abgegeben.",            xp:300,  stat:"INT", statPts:6,  type:"milestone", cat:"uni"},
      // CRE Meilensteine
      {id:"e_m7",  title:"Erstes selbst gekochtes Gericht", desc:"Ein richtiges Gericht komplett selbst gekocht.",                     xp:200,  stat:"CRE", statPts:4,  type:"milestone", cat:"skill_practical"},
      {id:"e_m8",  title:"Erste eigene Skizze/Zeichnung",  desc:"Eine vollständige Zeichnung die du wirklich gemacht hast.",           xp:180,  stat:"CRE", statPts:3,  type:"milestone", cat:"skill_creative"},
      // VIT Meilensteine
      {id:"e_m9",  title:"7 Tage kein Fast Food",         desc:"Eine Woche komplett ohne Fast Food. Beweis dass du es kannst.",        xp:280,  stat:"VIT", statPts:5,  type:"milestone", cat:"health"},
      {id:"e_m10", title:"7 Tage vor Mitternacht schlafen", desc:"7 Tage in Folge vor 0:00 Uhr einschlafen.",                          xp:280,  stat:"VIT", statPts:5,  type:"milestone", cat:"health"},
      // END Meilensteine
      {id:"e_m11", title:"7-Tage Habit Streak",           desc:"Einen Habit 7 Tage am Stück durchhalten. Welcher Habit du willst.",    xp:350,  stat:"END", statPts:7,  type:"milestone", cat:"discipline"},
      // CHA Meilensteine
      {id:"e_m12", title:"5 neue Menschen kennengelernt", desc:"5 verschiedene Personen aktiv angesprochen und kennengelernt.",        xp:300,  stat:"CHA", statPts:5,  type:"milestone", cat:"social"},
    ],
  },

  // ══════════════════════════════════════
  // D-RANK — Awakened. Erste echte Resultate.
  // ══════════════════════════════════════
  D:{
    daily:[
      {id:"d_d1",  title:"30 Liegestütze",                desc:"30 saubere Liegestütze täglich.",                                      xp:30, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"d_d2",  title:"30 Kniebeugen",                 desc:"30 tiefe Kniebeugen mit sauberer Form.",                               xp:28, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"d_d3",  title:"Negative Klimmzüge (5 Stück)",  desc:"Langsam von oben nach unten – baut Klimmzug-Kraft auf.",               xp:32, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"d_d4",  title:"3km Joggen",                    desc:"3km am Stück. Konstantes, ruhiges Tempo.",                             xp:32, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"d_d5",  title:"10 Min. Stretching",            desc:"Gründliches Dehnen nach dem Training.",                                xp:18, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"d_d6",  title:"30 Min. Physik lernen",         desc:"Aktives Lernen: Aufgaben rechnen, Konzepte erklären können.",          xp:35, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"d_d7",  title:"15 Min. Mathe/Rechnungen",      desc:"Ableitungen, Integrale, Vektoren – aktiv rechnen.",                    xp:30, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"d_d8",  title:"30 Min. Programmieren",         desc:"Tägliches Coden. Ein kleines Problem lösen oder Tutorial durcharbeiten.", xp:32, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"d_d9",  title:"Englisch 15 Min.",              desc:"Englische Texte lesen, Videos schauen, oder Vokabeln – täglich.",      xp:22, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"d_d10", title:"15 Min. Instrument üben",       desc:"Gitarre, Klavier, Schlagzeug – 15 Minuten konzentriertes Üben.",      xp:28, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"d_d11", title:"Etwas Neues kochen",            desc:"Kein Fertigprodukt. Ein neues oder bekanntes Gericht selbst kochen.",  xp:25, stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"d_d12", title:"15 Min. Zeichnen/Kreatives",    desc:"Sketching, Digitale Kunst, Schreiben – täglich kreativ sein.",        xp:22, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"d_d13", title:"2L Wasser",                     desc:"2 Liter Wasser täglich. Konsequent.",                                  xp:18, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"d_d14", title:"120g Protein",                  desc:"Mindestens 120g Protein heute – Muskelaufbau funktioniert nicht ohne.", xp:25, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"d_d15", title:"Morgenroutine (15 Min.)",       desc:"Aufstehen → Wasser trinken → kurze Bewegung → Tag planen.",           xp:25, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"d_d16", title:"Handy-freie Stunde",            desc:"1 Stunde am Tag komplett ohne Smartphone.",                            xp:22, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"d_d17", title:"Skincare Morgenroutine",        desc:"Gesicht reinigen + Feuchtigkeitspflege – täglich, konsequent.",       xp:18, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
      {id:"d_d18", title:"Gespräch aktiv initiieren",     desc:"Starte heute ein echtes Gespräch – nicht nur Smalltalk.",              xp:25, stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"d_d19", title:"Jemanden aktiv loben",          desc:"Echtes, aufrichtiges Lob an jemanden. Kein Floskeln.",                 xp:18, stat:"CHA", statPts:0, type:"daily", cat:"social"},
    ],
    weekly:[
      {id:"d_w1", title:"5x trainieren",                  desc:"5 Trainingseinheiten: Gym, Calisthenics, Laufen – alles gilt.",        xp:200, stat:"END", statPts:0, type:"weekly", cat:"strength"},
      {id:"d_w2", title:"Freund real treffen",             desc:"Echte Zeit zusammen – kein Online-Ersatz.",                           xp:150, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"d_w3", title:"Wöchentlicher Lernplan",         desc:"Plane deine Uni-Woche: Was lernst du wann?",                           xp:130, stat:"INT", statPts:0, type:"weekly", cat:"uni"},
      {id:"d_w4", title:"Elektronik-Einstieg",            desc:"Arduino Basics, einfacher Schaltkreis, YouTube-Tutorial – anfangen.", xp:160, stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
      {id:"d_w5", title:"Outfit bewusst wählen",          desc:"Diese Woche jeden Tag bewusst auf dein Outfit achten.",                xp:100, stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"d_w6", title:"3 gesunde Mahlzeiten pro Tag",   desc:"5 Tage lang 3 vollwertige, selbst zubereitete Mahlzeiten.",            xp:170, stat:"VIT", statPts:0, type:"weekly", cat:"health"},
      {id:"d_w7", title:"Coding: kleines Projekt starten", desc:"Fang ein eigenes kleines Projekt an. Nicht nur Tutorials nachmachen.", xp:180, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
    ],
    milestones:[
      {id:"d_m1",  title:"Erster sauberer Klimmzug",      desc:"Aus hängender Position bis Kinn über die Stange – sauber.",           xp:700,  stat:"STR", statPts:14, type:"milestone", cat:"strength"},
      {id:"d_m2",  title:"50 Liegestütze am Stück",       desc:"50 saubere Liegestütze ohne Pause.",                                  xp:500,  stat:"STR", statPts:10, type:"milestone", cat:"strength"},
      {id:"d_m3",  title:"5km laufen",                    desc:"5km am Stück. Kein Stopp, kein Schummeln.",                           xp:600,  stat:"AGI", statPts:12, type:"milestone", cat:"cardio"},
      {id:"d_m4",  title:"Erstes Buch durchgelesen",      desc:"Ein Buch von Anfang bis Ende. Sach-, Fach- oder Roman – alles gilt.", xp:450,  stat:"INT", statPts:9,  type:"milestone", cat:"skill_tech"},
      {id:"d_m5",  title:"Eigenes Programm (30+ Zeilen)", desc:"Ein Programm das wirklich etwas tut. Kein Copy-Paste.",               xp:500,  stat:"INT", statPts:10, type:"milestone", cat:"skill_tech"},
      {id:"d_m6",  title:"Physik-Prüfung bestanden",      desc:"Eine Klausur oder Prüfung erfolgreich bestanden.",                    xp:800,  stat:"INT", statPts:16, type:"milestone", cat:"uni"},
      {id:"d_m7",  title:"3 verschiedene Gerichte meistern", desc:"3 komplett unterschiedliche Gerichte die du wirklich beherrschst.", xp:400, stat:"CRE", statPts:8,  type:"milestone", cat:"skill_practical"},
      {id:"d_m8",  title:"14-Tage Habit Streak",          desc:"Einen Habit 14 Tage am Stück. Kein einziger Aussetzer.",              xp:500,  stat:"END", statPts:10, type:"milestone", cat:"discipline"},
      {id:"d_m9",  title:"Hautpflege-Routine 30 Tage",    desc:"30 Tage durchgehend Morgen- und Abendroutine für die Haut.",         xp:450,  stat:"CHA", statPts:9,  type:"milestone", cat:"appearance"},
      {id:"d_m10", title:"10 echte Freundschaftsgespräche", desc:"10 tiefe, ehrliche Gespräche mit Freunden (nicht Smalltalk).",     xp:400,  stat:"CHA", statPts:8,  type:"milestone", cat:"social"},
    ],
  },

  // ══════════════════════════════════════
  // C-RANK — Hunter. Konsistenz = Gewohnheit.
  // ══════════════════════════════════════
  C:{
    daily:[
      {id:"c_d1",  title:"50 Liegestütze + 50 Kniebeugen", desc:"Tägliche Basis C-Rank. Kein Verhandeln.",                             xp:50, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"c_d2",  title:"3 Sätze Klimmzüge",             desc:"3 Sätze maximale Klimmzüge – jeder Satz bis zum Versagen.",           xp:55, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"c_d3",  title:"Gym-Session",                   desc:"Strukturiertes Gym-Training nach einem Split-Plan.",                   xp:65, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"c_d4",  title:"5km Joggen",                    desc:"5km bei gleichmäßigem, komfortablen Tempo.",                           xp:55, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"c_d5",  title:"15 Min. Mobility",              desc:"Hüfte, Schultern, Brust – gründliche Mobilitätsarbeit.",              xp:30, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"c_d6",  title:"1h Physik studieren",           desc:"Vorlesungsstoff aktiv erarbeiten. Aufgaben rechnen, nicht nur lesen.", xp:60, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"c_d7",  title:"45 Min. Programmieren",         desc:"An einem echten Projekt arbeiten – nicht nur Tutorials.",              xp:55, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"c_d8",  title:"20 Min. Elektronik/Engineering", desc:"Schaltpläne lesen, löten, Arduino, Simulation.",                     xp:45, stat:"INT", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"c_d9",  title:"20 Min. Instrument üben",       desc:"Strukturiertes Üben: Scales, Stücke, Technik.",                       xp:40, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"c_d10", title:"20 Min. Zeichnen/Design",       desc:"Sketching, digitale Kunst, kreatives Gestalten.",                     xp:38, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"c_d11", title:"Anspruchsvolleres Gericht kochen", desc:"Komplexere Technik, mehr Zutaten – Kochen auf neuem Niveau.",      xp:35, stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"c_d12", title:"2,5L Wasser + 150g Protein",   desc:"Hydration und Protein konsequent einhalten.",                          xp:35, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"c_d13", title:"Kalte Dusche",                  desc:"Jeden Tag kalt duschen – Willenskraft und Durchblutung.",             xp:35, stat:"END", statPts:0, type:"daily", cat:"health"},
      {id:"c_d14", title:"Morgenroutine (30 Min.)",       desc:"Bewegung, Planung, Intention – strukturierter Morgen.",               xp:40, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"c_d15", title:"Tagesreview (10 Min.)",         desc:"Was hast du heute erreicht? Was verbesserst du morgen?",              xp:30, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"c_d16", title:"Skincare Morning + Evening",    desc:"Morgen- und Abendroutine für die Haut. Konsequenz.",                  xp:25, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
      {id:"c_d17", title:"Jemanden aktiv unterstützen",   desc:"Hilf jemandem heute – mit Rat, Zeit oder konkreter Tat.",            xp:38, stat:"CHA", statPts:0, type:"daily", cat:"social"},
    ],
    weekly:[
      {id:"c_w1", title:"Gym 5x + Trainingsplan",         desc:"5x Gym mit strukturiertem Split und progressiver Überladung.",        xp:300, stat:"STR", statPts:0, type:"weekly", cat:"strength"},
      {id:"c_w2", title:"Cold Shower 7 Tage",             desc:"Jeden Tag diese Woche kalt duschen.",                                 xp:250, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
      {id:"c_w3", title:"Wöchentliches Coding-Projekt",   desc:"Jeden Tag am selben Projekt – am Ende etwas Lauffähiges.",           xp:300, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"c_w4", title:"2 Freunde aktiv kontaktieren",   desc:"Diese Woche 2 Freunde aktiv kontaktieren oder treffen.",              xp:220, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"c_w5", title:"Kleidungs-Upgrade",              desc:"Ein neues Kleidungsstück kaufen oder Frisur auffrischen.",            xp:180, stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"c_w6", title:"Lied üben (komplettes Stück)",   desc:"Diese Woche ein komplettes Lied auf deinem Instrument üben.",        xp:270, stat:"CRE", statPts:0, type:"weekly", cat:"skill_creative"},
      {id:"c_w7", title:"Meal Prep für die Woche",        desc:"Mahlzeiten für 3-5 Tage vorausplanen und zubereiten.",               xp:230, stat:"VIT", statPts:0, type:"weekly", cat:"health"},
      {id:"c_w8", title:"Elektronik-Projekt diese Woche", desc:"Baue, löte oder programmiere ein kleines Elektronikprojekt.",        xp:280, stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
    ],
    milestones:[
      {id:"c_m1",  title:"10 Klimmzüge am Stück",         desc:"10 saubere Klimmzüge ohne Pause. Echter Beweis.",                    xp:1200, stat:"STR", statPts:22, type:"milestone", cat:"strength"},
      {id:"c_m2",  title:"100 Liegestütze am Stück",       desc:"100 Liegestütze ohne Stopp. Sauber bis zum letzten.",               xp:1000, stat:"STR", statPts:18, type:"milestone", cat:"strength"},
      {id:"c_m3",  title:"10km laufen",                   desc:"10km am Stück. Kein Stopp.",                                          xp:1000, stat:"AGI", statPts:18, type:"milestone", cat:"cardio"},
      {id:"c_m4",  title:"Eigene App/Tool gebaut",         desc:"Ein Programm das wirklich benutzt wird – von dir oder anderen.",    xp:1400, stat:"INT", statPts:25, type:"milestone", cat:"skill_tech"},
      {id:"c_m5",  title:"Arduino-Projekt fertig",         desc:"Funktionsfähiges Elektronikprojekt von Anfang bis Ende.",           xp:1100, stat:"CRE", statPts:20, type:"milestone", cat:"skill_practical"},
      {id:"c_m6",  title:"Lied komplett spielen können",   desc:"Ein Lied auf deinem Instrument von Anfang bis Ende fehlerfrei.",   xp:900,  stat:"CRE", statPts:16, type:"milestone", cat:"skill_creative"},
      {id:"c_m7",  title:"Physik-Seminar bestanden",       desc:"Praktikum, Seminar oder Hausarbeit erfolgreich abgeschlossen.",     xp:1000, stat:"INT", statPts:18, type:"milestone", cat:"uni"},
      {id:"c_m8",  title:"30-Tage Cold Shower Streak",     desc:"30 Tage in Folge kalt duschen. Kein einziger Aussetzer.",          xp:800,  stat:"END", statPts:15, type:"milestone", cat:"discipline"},
      {id:"c_m9",  title:"Sichtbare Körperveränderung",    desc:"Andere Menschen bemerken dass du trainierst. Fotos beweisen es.",  xp:1200, stat:"STR", statPts:22, type:"milestone", cat:"strength"},
      {id:"c_m10", title:"Tiefe Freundschaft entwickelt",  desc:"Eine Freundschaft auf echtes Vertrauensniveau gebracht.",          xp:900,  stat:"CHA", statPts:16, type:"milestone", cat:"social"},
      {id:"c_m11", title:"10 Gerichte die du beherrschst", desc:"10 verschiedene Gerichte die du jederzeit perfekt kochen kannst.", xp:800,  stat:"CRE", statPts:14, type:"milestone", cat:"skill_practical"},
    ],
  },

  // ══════════════════════════════════════
  // B-RANK — Elite Hunter. 90% übertroffen.
  // ══════════════════════════════════════
  B:{
    daily:[
      {id:"b_d1",  title:"100 Liegestütze",               desc:"100 saubere Liegestütze täglich. Kein Verhandeln.",                   xp:80, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"b_d2",  title:"5 Sätze Klimmzüge",             desc:"5 Sätze maximale Klimmzüge.",                                         xp:85, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"b_d3",  title:"Gym: Push/Pull/Legs",           desc:"Strukturierter Split. Progressive Overload.",                         xp:90, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"b_d4",  title:"8km Joggen",                    desc:"8km täglich bei konstantem Tempo.",                                    xp:90, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"b_d5",  title:"2h Deep Work (Uni/Physik)",     desc:"2 Stunden absoluter Fokus auf Physik oder Mathe. Keine Unterbrechung.", xp:95, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"b_d6",  title:"1h Programmieren (Projekt)",    desc:"An einem eigenen Projekt arbeiten. Echte Probleme lösen.",            xp:90, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"b_d7",  title:"30 Min. Engineering/Elektronik", desc:"Schaltungen entwerfen, simulieren, löten oder CAD.",                 xp:80, stat:"INT", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"b_d8",  title:"30 Min. Instrument",            desc:"Strukturiertes Üben mit konkretem Lernziel.",                         xp:65, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"b_d9",  title:"30 Min. kreatives Schaffen",    desc:"Musik produzieren, Zeichnen, Design – aktiv erschaffen.",             xp:60, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"b_d10", title:"Mahlzeit von Grund auf kochen", desc:"Kein Fertigprodukt, keine Halbfertigprodukte. Alles selbst.",         xp:55, stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"b_d11", title:"Meal Prep + Makros tracken",    desc:"Alle Mahlzeiten selbst vorbereitet und Makros getrackt.",             xp:70, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"b_d12", title:"Cold Shower + 45 Min. Morgen",  desc:"Kalt duschen + vollständige 45-Minuten Morgenroutine.",               xp:75, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"b_d13", title:"Jemanden wirklich zuhören",     desc:"Echtes aktives Zuhören. Kein Handy, keine Unterbrechungen.",         xp:55, stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"b_d14", title:"Grooming komplett",             desc:"Haut, Haare, Bart, Zähne, Körper – alles vollständig.",              xp:45, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
    ],
    weekly:[
      {id:"b_w1", title:"Gym 5x + Progressive Overload",  desc:"5x Gym mit nachweisbarer Gewichtssteigerung diese Woche.",           xp:400, stat:"STR", statPts:0, type:"weekly", cat:"strength"},
      {id:"b_w2", title:"Öffentlich präsentieren",         desc:"Vor Menschen sprechen: Seminar, Gruppe, Kommilitonen.",              xp:420, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"b_w3", title:"GitHub-Push täglich",             desc:"Jeden Tag dieser Woche Code auf GitHub pushen.",                     xp:380, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"b_w4", title:"Tiefes Gespräch führen",          desc:"Ein ehrliches, tiefes Gespräch. Kein Smalltalk.",                   xp:300, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"b_w5", title:"Komplexes Gericht meistern",      desc:"Ein aufwendiges Gericht das du noch nie gemacht hast.",             xp:280, stat:"CRE", statPts:0, type:"weekly", cat:"skill_practical"},
      {id:"b_w6", title:"Fortschritts-Foto + Notiz",       desc:"Wöchentliches Körperfoto + kurze Notiz über Fortschritt.",          xp:250, stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"b_w7", title:"Neue Programmier-Technik lernen", desc:"Einen neuen Algorithmus, ein Pattern oder Framework lernen.",       xp:350, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
    ],
    milestones:[
      {id:"b_m1",  title:"Halbmarathon (21km)",            desc:"21km am Stück laufen. Kein Stopp.",                                  xp:3000, stat:"AGI", statPts:40, type:"milestone", cat:"cardio"},
      {id:"b_m2",  title:"20 Klimmzüge am Stück",         desc:"20 saubere Klimmzüge ohne Pause.",                                   xp:2800, stat:"STR", statPts:38, type:"milestone", cat:"strength"},
      {id:"b_m3",  title:"Eigene Website live",            desc:"Deine eigene Website im Internet – selbst gebaut und deployed.",    xp:3000, stat:"INT", statPts:40, type:"milestone", cat:"skill_tech"},
      {id:"b_m4",  title:"Komplexes Elektronikprojekt",    desc:"Mikrocontroller + eigener Code + Hardware. Komplett fertig.",       xp:2600, stat:"CRE", statPts:35, type:"milestone", cat:"skill_practical"},
      {id:"b_m5",  title:"Lied perfekt beherrscht",        desc:"Ein Lied auf deinem Instrument perfekt – andere würden applaudieren.", xp:2200, stat:"CRE", statPts:30, type:"milestone", cat:"skill_creative"},
      {id:"b_m6",  title:"Uni-Semester mit Auszeichnung",  desc:"Ein Semester mit deutlich überdurchschnittlichen Noten abgeschlossen.", xp:3500, stat:"INT", statPts:45, type:"milestone", cat:"uni"},
      {id:"b_m7",  title:"Echter Freundeskreis aufgebaut", desc:"Mindestens 3 tiefe Freundschaften die auf echtem Vertrauen basieren.", xp:2000, stat:"CHA", statPts:28, type:"milestone", cat:"social"},
      {id:"b_m8",  title:"Körperfett sichtbar reduziert",  desc:"Sichtbare Bauchmuskeln oder deutlich definierter Körper – Fotos beweisen es.", xp:2500, stat:"STR", statPts:34, type:"milestone", cat:"strength"},
      {id:"b_m9",  title:"20 Gerichte auf Profi-Niveau",   desc:"20 Gerichte die du auf Restaurantqualität kochen kannst.",         xp:2000, stat:"CRE", statPts:27, type:"milestone", cat:"skill_practical"},
    ],
  },

  // ══════════════════════════════════════
  // A-RANK — Advanced Hunter. Top 5%.
  // ══════════════════════════════════════
  A:{
    daily:[
      {id:"a_d1",  title:"200 Liegestütze",               desc:"200 saubere Liegestütze täglich.",                                    xp:120, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"a_d2",  title:"15km Laufen",                   desc:"15km täglich. Pace unter 5:30/km.",                                   xp:130, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"a_d3",  title:"Gym + 30 Min. Cardio",          desc:"Vollständige Gym-Session mit anschließendem Cardio.",                 xp:130, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"a_d4",  title:"3h Deep Work",                  desc:"3 Stunden absoluter Fokus. Weltklasse-Konzentration.",               xp:135, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"a_d5",  title:"1,5h Programmieren (advanced)", desc:"Algorithmen, System Design, komplexe eigene Projekte.",              xp:125, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"a_d6",  title:"30 Min. Engineering (advanced)", desc:"CAD, Schaltungsdesign auf höherem Niveau, Simulation.",             xp:105, stat:"INT", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"a_d7",  title:"Fremdsprache 30 Min.",           desc:"Englisch perfektionieren oder eine neue Sprache lernen.",            xp:90,  stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"a_d8",  title:"45 Min. Instrument",            desc:"Fortgeschrittenes Üben: Improvisation, eigene Stücke.",              xp:95,  stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"a_d9",  title:"45 Min. kreatives Schaffen",    desc:"Musik produzieren, Design, Kunst – auf professionellem Niveau.",    xp:90,  stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"a_d10", title:"Gourmet-Gericht kochen",        desc:"Komplexes Kochen – Saucen, Timing, mehrere Techniken.",             xp:80,  stat:"CRE", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"a_d11", title:"Ernährungsplan 100% einhalten", desc:"Kalorien, Protein, Mikros – alles stimmt heute perfekt.",            xp:90,  stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"a_d12", title:"6 Uhr aufstehen",               desc:"Um 6 Uhr morgens aufstehen. Jeden Tag ohne Ausnahme.",               xp:100, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"a_d13", title:"Abend-Reflexion (20 Min.)",     desc:"Was lief gut? Was lernst du? Was planst du für morgen?",            xp:75,  stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"a_d14", title:"Jemanden durch Handeln inspirieren", desc:"Dein Verhalten oder Wissen motiviert heute jemanden.",          xp:85,  stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"a_d15", title:"Appearance: alles optimiert",   desc:"Frisur, Kleidung, Haut, Körperhaltung – alles auf 10/10.",          xp:75,  stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
    ],
    weekly:[
      {id:"a_w1", title:"6x Gym + Ernährungsplan",         desc:"6 Trainingseinheiten + Ernährung perfekt getrackt.",                 xp:600, stat:"STR", statPts:0, type:"weekly", cat:"strength"},
      {id:"a_w2", title:"Neue Sprache: 3h diese Woche",    desc:"3 Stunden Sprachlernen. Vokabeln, Grammatik, Sprechen.",            xp:550, stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"a_w3", title:"Für 2 Freunde echte Zeit",        desc:"Für 2 Freunde wirklich da sein – nicht nur physical present.",     xp:470, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"a_w4", title:"Kreatives Werk vollenden",        desc:"Ein kreatives Projekt diese Woche von Anfang bis Ende.",            xp:530, stat:"CRE", statPts:0, type:"weekly", cat:"skill_creative"},
      {id:"a_w5", title:"Alle Stats dokumentieren",        desc:"Körper, Skills, Lernen, Soziales – alles diese Woche dokumentieren.", xp:420, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
    ],
    milestones:[
      {id:"a_m1",  title:"Marathon (42km)",                desc:"42km am Stück. Du bist jetzt ein Marathonläufer.",                   xp:7000, stat:"AGI", statPts:70, type:"milestone", cat:"cardio"},
      {id:"a_m2",  title:"30 Klimmzüge am Stück",         desc:"30 saubere Klimmzüge. Absolute Oberkörper-Elite.",                  xp:6500, stat:"STR", statPts:65, type:"milestone", cat:"strength"},
      {id:"a_m3",  title:"Tech-Projekt mit echten Nutzern", desc:"Eine App oder ein Tool das andere Menschen wirklich benutzen.",    xp:7000, stat:"INT", statPts:70, type:"milestone", cat:"skill_tech"},
      {id:"a_m4",  title:"Eigene Musikkomposition",        desc:"Ein eigenes Musikstück komplett selbst komponiert und aufgenommen.", xp:5500, stat:"CRE", statPts:55, type:"milestone", cat:"skill_creative"},
      {id:"a_m5",  title:"Sichtbare Muskeln überall",      desc:"Brust, Schultern, Arme, Bauch – sichtbar definiert auf Fotos.",    xp:8000, stat:"STR", statPts:80, type:"milestone", cat:"strength"},
      {id:"a_m6",  title:"30 Gerichte Meisterkoch",        desc:"30 Gerichte die du auf sehr hohem Niveau kochen kannst.",          xp:4500, stat:"CRE", statPts:45, type:"milestone", cat:"skill_practical"},
      {id:"a_m7",  title:"Bachelor Physik abgeschlossen",  desc:"Bachelor-Abschluss in Physik erfolgreich abgelegt.",               xp:15000, stat:"INT", statPts:120, type:"milestone", cat:"uni"},
      {id:"a_m8",  title:"Sprache auf B2-Niveau",          desc:"Eine Fremdsprache auf nachweislichem B2-Niveau.",                  xp:5000, stat:"INT", statPts:50, type:"milestone", cat:"skill_tech"},
    ],
  },

  // ══════════════════════════════════════
  // S-RANK — Elite. Kompromisslos. Top 1%.
  // ══════════════════════════════════════
  S:{
    daily:[
      {id:"s_d1",  title:"400 Liegestütze",               desc:"400 Liegestütze täglich. Elite-Level.",                              xp:200, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"s_d2",  title:"20km Laufen",                   desc:"20km täglich. Sub-5:00/km.",                                          xp:210, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"s_d3",  title:"Gym: 2h intensive Session",     desc:"2 Stunden intensives Training ohne Kompromisse.",                    xp:200, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"s_d4",  title:"5h Deep Work",                  desc:"5 Stunden totale Konzentration. Weltklasse-Produktivität.",          xp:215, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"s_d5",  title:"2h Programmieren (Expert)",     desc:"Komplexe Algorithmen, eigene Frameworks, Research-Level.",           xp:205, stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"s_d6",  title:"1h kreatives Schaffen",         desc:"Musik, Kunst, Design – auf professionellem Level täglich.",         xp:175, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"s_d7",  title:"Ernährung: perfekter Tag",      desc:"Kalorien, Makros, Mikros, Timing – absolut perfekt.",               xp:155, stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"s_d8",  title:"5:30 Uhr aufstehen",            desc:"Um 5:30 Uhr aufstehen. Täglich. Keine Ausnahmen.",                  xp:165, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"s_d9",  title:"Jemanden mentoren",             desc:"Jemandem helfen besser zu werden – Wissen aktiv weitergeben.",      xp:165, stat:"CHA", statPts:0, type:"daily", cat:"social"},
    ],
    weekly:[
      {id:"s_w1", title:"7x Training",                    desc:"7 Tage Training. Aktive Regeneration zählt als Training.",          xp:950,  stat:"END", statPts:0, type:"weekly", cat:"strength"},
      {id:"s_w2", title:"Extreme Disziplin-Woche",        desc:"7 Tage: kein Junk, kein Alkohol, 7h+ Schlaf, alle Habits erfüllt.", xp:1100, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
      {id:"s_w3", title:"Projekt publizieren",            desc:"Etwas veröffentlichen: GitHub, Artikel, Musik, Design.",           xp:950,  stat:"INT", statPts:0, type:"weekly", cat:"skill_tech"},
      {id:"s_w4", title:"3 wichtige Beziehungen pflegen", desc:"3 Menschen in deinem Leben aktiv investieren diese Woche.",        xp:800,  stat:"CHA", statPts:0, type:"weekly", cat:"social"},
    ],
    milestones:[
      {id:"s_m1",  title:"Ultramarathon 50km",            desc:"50km am Stück. Du gehörst zu den Härtesten.",                       xp:15000, stat:"AGI", statPts:110, type:"milestone", cat:"cardio"},
      {id:"s_m2",  title:"50 Klimmzüge am Stück",         desc:"50 saubere Klimmzüge. Unmenschlich.",                               xp:13000, stat:"STR", statPts:95, type:"milestone", cat:"strength"},
      {id:"s_m3",  title:"Open-Source-Projekt mit Stars", desc:"Ein GitHub-Projekt das andere benutzen und mit Stars versehen.",   xp:15000, stat:"INT", statPts:110, type:"milestone", cat:"skill_tech"},
      {id:"s_m4",  title:"Musik-EP fertiggestellt",       desc:"Eigene EP: Komposition, Produktion, Abmischung, veröffentlicht.",  xp:13000, stat:"CRE", statPts:95, type:"milestone", cat:"skill_creative"},
      {id:"s_m5",  title:"Competition-Physique",          desc:"Wettkampf-Körperfett (<12%) und Muskelmasse über 6 Monate gehalten.", xp:20000, stat:"STR", statPts:140, type:"milestone", cat:"strength"},
      {id:"s_m6",  title:"Master Physik (oder äquivalent)", desc:"Master-Abschluss oder gleichwertiges Expertenwissen nachgewiesen.", xp:25000, stat:"INT", statPts:160, type:"milestone", cat:"uni"},
    ],
  },

  // ══════════════════════════════════════
  // SS-RANK — National Level. Fast niemand erreicht das.
  // ══════════════════════════════════════
  SS:{
    daily:[
      {id:"ss_d1", title:"1000 Liegestütze",              desc:"Nationaler Hunter Level. 1000 täglich.",                             xp:360, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"ss_d2", title:"30km Laufen",                   desc:"30km täglich. Sub-4:30/km.",                                          xp:380, stat:"AGI", statPts:0, type:"daily", cat:"cardio"},
      {id:"ss_d3", title:"8h Hochleistungs-Output",       desc:"8 Stunden produktiver Output auf absolutem Spitzenlevel.",           xp:370, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"ss_d4", title:"Täglich publizieren oder lehren", desc:"Jeden Tag etwas veröffentlichen oder jemandem beibringen.",       xp:310, stat:"CHA", statPts:0, type:"daily", cat:"social"},
      {id:"ss_d5", title:"Profi-Grooming täglich",        desc:"Alles perfekt: Haut, Körper, Stil, Auftreten – täglich.",           xp:260, stat:"CHA", statPts:0, type:"daily", cat:"appearance"},
    ],
    weekly:[
      {id:"ss_w1", title:"Öffentliche Wirkung schaffen",  desc:"Talk, Video, Artikel – Wissen mit vielen Menschen teilen.",         xp:1600, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"ss_w2", title:"Komplettes Skill-Audit",        desc:"Bewerte alle deine Skills. Schwächen identifizieren und angreifen.", xp:1300, stat:"INT", statPts:0, type:"weekly", cat:"discipline"},
    ],
    milestones:[
      {id:"ss_m1", title:"100km Ultramarathon",           desc:"100km am Stück. Du bist kein normaler Mensch mehr.",                xp:50000, stat:"AGI", statPts:220, type:"milestone", cat:"cardio"},
      {id:"ss_m2", title:"Wettkampf-Physique 6 Monate",   desc:"Wettkampfform dauerhaft gehalten. Fotos und Messungen beweisen es.", xp:40000, stat:"STR", statPts:180, type:"milestone", cat:"strength"},
      {id:"ss_m3", title:"Projekt mit echtem Impact",     desc:"Etwas aufgebaut das viele Menschen wirklich benutzen oder hilft.",  xp:55000, stat:"INT", statPts:240, type:"milestone", cat:"skill_tech"},
      {id:"ss_m4", title:"Musik auf Streaming-Plattformen", desc:"Eigene Musik auf Spotify, Apple Music etc. mit Hörern.",          xp:35000, stat:"CRE", statPts:155, type:"milestone", cat:"skill_creative"},
    ],
  },

  // ══════════════════════════════════════
  // SSS-RANK — Shadow Monarch. Das Unmögliche.
  // ══════════════════════════════════════
  SSS:{
    daily:[
      {id:"sss_d1", title:"Shadow Monarch Training",     desc:"3h Kraft + 20km + 500 Dips + 500 Liegestütze. Täglich.",             xp:620, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"sss_d2", title:"Genius-Level Work",            desc:"10h Deep Work auf absolutem Weltklasse-Niveau.",                     xp:620, stat:"INT", statPts:0, type:"daily", cat:"uni"},
      {id:"sss_d3", title:"Erschaffen was bleibt",        desc:"Schaffe heute etwas das andere Menschen dauerhaft verändern wird.",  xp:520, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
    ],
    weekly:[
      {id:"sss_w1", title:"Legacy Challenge",             desc:"Erschaffe etwas das über dich hinaus existiert und andere inspiriert.", xp:5500, stat:"CHA", statPts:0, type:"weekly", cat:"legacy"},
      {id:"sss_w2", title:"Absolutes Maximum",            desc:"7 Tage: alle Stats perfekt – Körper, Geist, Kreativität, Soziales.", xp:6500, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
    ],
    milestones:[
      {id:"sss_m1", title:"I ALONE LEVEL UP",             desc:"SSS-Rank Level 10 erreicht. Du hast das absolut Unmögliche geschafft.", xp:500000, stat:"END", statPts:999, type:"milestone", cat:"legacy"},
      {id:"sss_m2", title:"PhD Physik oder Äquivalent",   desc:"Tiefste wissenschaftliche Expertise auf Weltklasse-Niveau.",         xp:150000, stat:"INT", statPts:600, type:"milestone", cat:"uni"},
      {id:"sss_m3", title:"Körper des Shadow Monarch",    desc:"Absolute Perfektion: Kraft, Ausdauer, Ästhetik – alles maximal.",   xp:120000, stat:"STR", statPts:500, type:"milestone", cat:"strength"},
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

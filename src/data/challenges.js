// ============================================================
// CHALLENGES DATABASE
// daily/weekly → XP only (statPts:0)
// milestones   → XP + statPts — echter Selbsttest mit klarer Frage
// Prompt 10: Erweitert durch challengesExtra.js
// ============================================================
import { NEUTRAL_RANK_QUESTS } from "./neutralQuests.js";
import { EXTRA_DAILIES, EXTRA_WEEKLIES, EXTRA_MILESTONES,
         EXTRA_DAILIES_D, EXTRA_WEEKLIES_C, EXTRA_MILESTONES_CB } from "./challengesExtra.js";

export const CHALLENGES_DB = {

  // ══════════════════════════════════════════════════════════
  // E-RANK — Novice. Erste Schritte. Grundlagen legen.
  // ══════════════════════════════════════════════════════════
  // ── E-RANK: Neutrale System-Quests. Kein Thema bevorzugt. ──
  // Jede Richtung ist offen. Spezialisierung entsteht erst durch Signale.
  E:{
    daily:[
      {id:"e_d1",  title:"System Focus",        desc:"Arbeite 15 Minuten konzentriert an etwas Wichtigem — kein Handy, keine Ablenkung.",              xp:25, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline"},
      {id:"e_d2",  title:"Body Activation",     desc:"Bewege dich 20 Minuten bewusst — was auch immer du wählst. Alles zählt.",                         xp:22, stat:"VIT", statPts:0, type:"daily", cat:"health",      domain:"body"},
      {id:"e_d3",  title:"Skill Spark",         desc:"Übe 10 Minuten eine Fähigkeit die dir wichtig ist — irgendetwas das dich weiterbringt.",           xp:20, stat:"INT", statPts:0, type:"daily", cat:"mind",       domain:"mind"},
      {id:"e_d4",  title:"Environment Reset",   desc:"Bringe einen Bereich 10 Minuten in Ordnung — Schreibtisch, Zimmer oder digitale Ablage.",          xp:18, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home"},
      {id:"e_d5",  title:"Objective Step",      desc:"Mache einen kleinen, konkreten Fortschritt an einem deiner Ziele — kein Aufschieben.",             xp:22, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline"},
      {id:"e_d6",  title:"Recovery Protocol",   desc:"Plane oder mache 10 Minuten bewusste Regeneration — Pause, Atemübung, Spaziergang.",               xp:15, stat:"VIT", statPts:0, type:"daily", cat:"recovery",   domain:"recovery"},
      {id:"e_d7",  title:"Reflection Log",      desc:"Notiere kurz was du heute verbessert hast oder morgen besser machen willst.",                      xp:15, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline", actionType:"reflection"},
      {id:"e_d8",  title:"Discipline Check",    desc:"Schließe eine bewusst aufgeschobene Kleinaufgabe heute noch ab.",                                   xp:20, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline"},
      {id:"e_d9",  title:"Social Signal",       desc:"Mache einen kleinen, bewussten sozialen Schritt — schreiben, ansprechen, erscheinen.",              xp:15, stat:"CHA", statPts:0, type:"daily", cat:"social",     domain:"social"},
      {id:"e_d10", title:"Planning Pulse",      desc:"Plane deinen nächsten sinnvollen Schritt — konkret, machbar, aufgeschrieben.",                      xp:12, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline"},
      {id:"e_d11", title:"Awareness Check",     desc:"30 Minuten bewusst auf Ablenkungen verzichten — Fokus behalten, Präsenz üben.",                    xp:18, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline"},
      {id:"e_d12", title:"Vitality Base",       desc:"Sorge heute bewusst für deinen Körper — Hydration, Ruhe, Bewegung, Ernährung.",                     xp:12, stat:"VIT", statPts:0, type:"daily", cat:"health",     domain:"recovery"},
      {id:"e_d13", title:"Rest Signal",         desc:"Schlafe heute zu einer sinnvollen Zeit — Erholung ist Teil des Systems.",                           xp:15, stat:"VIT", statPts:0, type:"daily", cat:"health",     domain:"recovery"},
      {id:"e_d14", title:"Connection Step",     desc:"Nimm bewusst Kontakt zu jemandem auf — nicht warten, aktiv handeln.",                               xp:15, stat:"CHA", statPts:0, type:"daily", cat:"social",     domain:"social"},
      {id:"e_d15", title:"Output Moment",       desc:"Erschaffe heute etwas — egal wie klein: schreiben, bauen, skizzieren, dokumentieren.",              xp:18, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative", domain:"creativity"},
    ],
    weekly:[
      {id:"e_w1", title:"Weekly Focus Order",   desc:"Schließe diese Woche 3 Fokus-Sessions ab — je mindestens 15 Minuten ohne Ablenkung.",              xp:130, stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"discipline"},
      {id:"e_w2", title:"Body Foundation",      desc:"Bewege dich diese Woche an mindestens 2 Tagen bewusst — Dauer und Art sind dir überlassen.",        xp:120, stat:"VIT", statPts:0, type:"weekly", cat:"health",      domain:"body"},
      {id:"e_w3", title:"Objective Progress",   desc:"Mache diese Woche einen sichtbaren Fortschritt an einem aktiven Ziel.",                             xp:110, stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"discipline"},
      {id:"e_w4", title:"System Review",        desc:"Führe ein kurzes Wochenreview durch — was lief gut, was möchte ich verbessern?",                    xp:90,  stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"discipline", actionType:"reflection"},
      {id:"e_w5", title:"Environment Upgrade",  desc:"Verbessere oder organisiere diese Woche einen Bereich deines Umfelds oder deiner Routinen.",         xp:80,  stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"home"},
      {id:"e_w6", title:"Skill Foundation",     desc:"Übe eine Fähigkeit an mindestens 2 Tagen diese Woche — was auch immer dich interessiert.",           xp:105, stat:"INT", statPts:0, type:"weekly", cat:"mind",       domain:"mind"},
      {id:"e_w7", title:"Social Contact",       desc:"Pflege oder starte diese Woche einen sinnvollen sozialen Kontakt.",                                  xp:95,  stat:"CHA", statPts:0, type:"weekly", cat:"social",     domain:"social"},
    ],
    milestones:[
      {id:"e_m1",  title:"20 Liegestütze am Stück",        desc:"Selbsttest: Mach sie jetzt. 20 saubere Liegestütze ohne Pause.",     xp:300,  stat:"STR", statPts:5,  type:"milestone", cat:"strength"},
      {id:"e_m2",  title:"1 Min. Plank halten",            desc:"Selbsttest: Timer starten. 60 Sek. sauber ohne Einknicken.",         xp:250,  stat:"STR", statPts:4,  type:"milestone", cat:"strength"},
      {id:"e_m3",  title:"Erste Gym-Woche: 3x",           desc:"3 Gym-Einheiten in 7 Tagen. Jede zählt.",                             xp:350,  stat:"STR", statPts:6,  type:"milestone", cat:"strength"},
      {id:"e_m4",  title:"1km am Stück laufen",            desc:"Selbsttest: Lauf los. 1km ohne Stopp. Tempo egal.",                  xp:250,  stat:"AGI", statPts:5,  type:"milestone", cat:"cardio"},
      {id:"e_m5",  title:"3km laufen",                     desc:"3km am Stück. Dein erster echter Lauf.",                             xp:380,  stat:"AGI", statPts:7,  type:"milestone", cat:"cardio"},
      {id:"e_m6",  title:"2 Wochen täglich dehnen",        desc:"Selbsttest: Kommst du nach 14 Tagen spürbar weiter?",                xp:280,  stat:"AGI", statPts:5,  type:"milestone", cat:"cardio"},
      {id:"e_m7",  title:"Erste Fähigkeit nachgewiesen",    desc:"Selbsttest: Kannst du etwas zeigen das du diese Woche gelernt hast?",  xp:260,  stat:"INT", statPts:5,  type:"milestone", cat:"mind"},
      {id:"e_m8",  title:"Aufgabe vollständig erledigt",    desc:"Selbsttest: Eine Aufgabe komplett und eigenständig durchgearbeitet.",   xp:300,  stat:"INT", statPts:6,  type:"milestone", cat:"discipline"},
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
      {id:"d_d7",  title:"30 Min. Deep Learning",          desc:"Aktiv lernen: Aufgaben, Konzepte oder Fähigkeiten – kein passives Lesen.", xp:35, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"d_d8",  title:"30 Min. Skill Building",         desc:"Aktiv eine Fähigkeit üben – echte Probleme lösen, nicht nur Tutorial folgen.", xp:32, stat:"INT", statPts:0, type:"daily", cat:"mind"},
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
      {id:"d_w3", title:"Woche strukturiert planen",       desc:"Plane deine Woche mit klaren Prioritäten. Struktur schlägt Motivation.", xp:135, stat:"INT", statPts:0, type:"weekly", cat:"discipline"},
      {id:"d_w4", title:"Eigenes Projekt starten",         desc:"Ein eigenes kleines Projekt anfangen – kein Tutorial. Etwas Echtes.",xp:185, stat:"INT", statPts:0, type:"weekly", cat:"mind"},
      {id:"d_w5", title:"3 gesunde Mahlzeiten/Tag (5d)",   desc:"5 Tage: 3 vollwertige selbst zubereitete Mahlzeiten täglich.",      xp:175, stat:"VIT", statPts:0, type:"weekly", cat:"health"},
      {id:"d_w6", title:"Outfit diese Woche bewusst",      desc:"Jeden Tag bewusst auf Kleidung und Gepflegtheit achten.",            xp:105, stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"d_w7", title:"Praktische Fähigkeit starten",    desc:"Einen neuen praktischen Skill beginnen – bauen, reparieren, gestalten, erstellen.", xp:160, stat:"CRA", statPts:0, type:"weekly", cat:"craft"},
    ],
    milestones:[
      {id:"d_m1",  title:"Erster sauberer Klimmzug",       desc:"Selbsttest: Hänge dich ran. 1 echter Klimmzug – Kinn über Stange.", xp:750,  stat:"STR", statPts:15, type:"milestone", cat:"strength"},
      {id:"d_m2",  title:"50 Liegestütze am Stück",        desc:"Selbsttest: 50 saubere Liegestütze ohne Pause.",                    xp:520,  stat:"STR", statPts:10, type:"milestone", cat:"strength"},
      {id:"d_m3",  title:"Bankdrücken: 60% Körpergewicht", desc:"Selbsttest: Drückst du 60% deines KG auf der Langhantel?",         xp:620,  stat:"STR", statPts:12, type:"milestone", cat:"strength"},
      {id:"d_m4",  title:"Kniebeugen: eigenes KG",         desc:"Selbsttest: Kniebeuge mit deinem Körpergewicht – tief und sauber.", xp:670,  stat:"STR", statPts:13, type:"milestone", cat:"strength"},
      {id:"d_m5",  title:"5km laufen",                     desc:"Selbsttest: 5km am Stück ohne Stopp.",                               xp:630,  stat:"AGI", statPts:12, type:"milestone", cat:"cardio"},
      {id:"d_m6",  title:"5km unter 30 Minuten",           desc:"Selbsttest: Pace unter 6:00/km auf 5km.",                            xp:760,  stat:"AGI", statPts:14, type:"milestone", cat:"cardio"},
      {id:"d_m7",  title:"Eigenes Programm (30+ Zeilen)",  desc:"Ein Programm das wirklich etwas tut. Eigene Logik, kein Kopieren.",  xp:530,  stat:"INT", statPts:10, type:"milestone", cat:"skill_tech"},
      {id:"d_m8",  title:"Test oder Prüfung bestanden",    desc:"Eine Klausur, Prüfung oder anspruchsvoller Test eigenständig bestanden.", xp:750, stat:"INT", statPts:17, type:"milestone", cat:"mind"},
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
      {id:"c_d6",  title:"1h Focused Study",               desc:"Ein Thema intensiv durcharbeiten – wirklich verstehen, nicht nur durchlesen.", xp:60, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"c_d7",  title:"45 Min. Skill Execution",        desc:"An einem echten Projekt oder Vorhaben arbeiten – Fortschritt erzeugen.", xp:55, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"c_d8",  title:"20 Min. Craft / Making",         desc:"Etwas bauen, gestalten oder reparieren – praktisch tätig werden.",    xp:45, stat:"CRA", statPts:0, type:"daily", cat:"craft"},
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
      {id:"c_w3", title:"Projekt diese Woche vorantreiben",desc:"Täglich am selben Vorhaben – Ende der Woche ein sichtbares Ergebnis.", xp:310, stat:"INT", statPts:0, type:"weekly", cat:"mind"},
      {id:"c_w4", title:"2 Freunde aktiv kontaktieren",    desc:"Nicht warten – 2 Freunde diese Woche aktiv kontaktieren.",          xp:230, stat:"CHA", statPts:0, type:"weekly", cat:"social"},
      {id:"c_w5", title:"Kleidungs-Upgrade",               desc:"Neues Teil kaufen oder Frisur auffrischen.",                        xp:185, stat:"CHA", statPts:0, type:"weekly", cat:"appearance"},
      {id:"c_w6", title:"Lied diese Woche täglich üben",   desc:"Konkretes Stück täglich üben – Fortschritt am Ende der Woche?",    xp:280, stat:"CRE", statPts:0, type:"weekly", cat:"skill_creative"},
      {id:"c_w7", title:"Meal Prep für die Woche",         desc:"Mahlzeiten für 3-5 Tage planen und vorbereiten.",                   xp:240, stat:"VIT", statPts:0, type:"weekly", cat:"health"},
      {id:"c_w8", title:"Praktisches Projekt abschließen", desc:"Ein kleines Projekt vollständig fertig machen – Ergebnis zählt.",   xp:290, stat:"CRA", statPts:0, type:"weekly", cat:"craft"},
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
      {id:"c_m9",  title:"Eigenständiges Projekt fertig",  desc:"Ein selbst gewähltes Projekt vollständig abgeschlossen und funktionsfähig.", xp:1150, stat:"CRA", statPts:20, type:"milestone", cat:"craft"},
      {id:"c_m10", title:"Kurs oder Praktikum abgeschlossen", desc:"Einen Kurs, ein Seminar oder ein Praktikum erfolgreich abgeschlossen.", xp:1050, stat:"INT", statPts:19, type:"milestone", cat:"mind"},
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
      {id:"b_d5",  title:"2h Deep Work",                   desc:"2 Stunden totaler Fokus an einer wichtigen Aufgabe. Keine Unterbrechung.", xp:95, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"b_d6",  title:"1h Projekt-Arbeit",              desc:"An einem echten Projekt arbeiten – Fortschritt durch Tun, nicht durch Planen.", xp:90, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"b_d7",  title:"30 Min. Craft / Engineering",    desc:"Etwas bauen, entwerfen oder reparieren – praktisch auf hohem Niveau.", xp:80, stat:"INT", statPts:0, type:"daily", cat:"craft"},
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
      {id:"b_w7", title:"Neue Technik oder Methode",        desc:"Eine neue Methode, Technik oder Framework lernen und anwenden – echte Nutzung.", xp:355, stat:"INT", statPts:0, type:"weekly", cat:"mind"},
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
      {id:"b_m10", title:"Komplexes Projekt abgeschlossen", desc:"Ein eigenständiges, anspruchsvolles Projekt vollständig fertig und funktionsfähig.", xp:2750, stat:"CRA", statPts:37, type:"milestone", cat:"craft"},
      {id:"b_m11", title:"Großes Ziel überdurchschnittlich abgeschlossen", desc:"Ein anspruchsvolles Vorhaben klar über den eigenen Erwartungen abgeschlossen.", xp:3650, stat:"INT", statPts:47, type:"milestone", cat:"mind"},
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
      {id:"a_d5",  title:"3h Deep Work",                   desc:"3 Stunden absoluter Fokus. Elite-Output auf echten Problemen.",       xp:138, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"a_d6",  title:"1,5h Advanced Skill Work",       desc:"Anspruchsvolle Arbeit auf hohem Niveau – Systeme, Algorithmen, Strukturen.", xp:128, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"a_d7",  title:"Sprache 30 Min.",                desc:"Englisch perfektionieren oder neue Sprache lernen.",                  xp:92,  stat:"INT", statPts:0, type:"daily", cat:"skill_tech"},
      {id:"a_d8",  title:"45 Min. Instrument",             desc:"Improvisation, eigene Stücke, fortgeschrittene Technik.",            xp:98,  stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"a_d9",  title:"45 Min. Zeichnen / kreativ",     desc:"Fortgeschrittene Techniken, Stile, eigene Werke erschaffen.",        xp:92,  stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
      {id:"a_d10", title:"Gourmet-Gericht kochen",         desc:"Komplexe Saucen, Timing, mehrere Komponenten.",                     xp:82,  stat:"CRA", statPts:0, type:"daily", cat:"skill_practical"},
      {id:"a_d11", title:"Ernährungsplan 100%",            desc:"Kalorien, Protein, Mikros – alles heute perfekt.",                   xp:92,  stat:"VIT", statPts:0, type:"daily", cat:"health"},
      {id:"a_d12", title:"6 Uhr aufstehen",                desc:"6 Uhr. Täglich. Keine Ausnahme.",                                    xp:102, stat:"END", statPts:0, type:"daily", cat:"discipline"},
      {id:"a_d13", title:"Abend-Log (20 Min.)",            desc:"Was war gut? Was gelernt? Was als Nächstes?",                        xp:78,  stat:"END", statPts:0, type:"daily", cat:"discipline"},
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
      {id:"a_m10", title:"Abschluss oder Meilenstein abgelegt", desc:"Einen Major-Abschluss, eine Zertifizierung oder ein langfristiges Vorhaben erfolgreich beendet.", xp:15700, stat:"INT", statPts:126, type:"milestone", cat:"mind"},
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
      {id:"s_d4",  title:"5h Deep Work",                   desc:"5 Stunden totale Konzentration. Weltklasse-Output auf dem eigenen Gebiet.", xp:220, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"s_d5",  title:"2h Expert Skill Work",           desc:"Komplexe Arbeit auf Research-Level – Systeme, Algorithmen, Strukturen, Entwürfe.", xp:210, stat:"INT", statPts:0, type:"daily", cat:"mind"},
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
      {id:"s_m9",  title:"Master-Level Expertise",         desc:"Master-Abschluss oder gleichwertiges Wissen auf einem Gebiet nachgewiesen.", xp:27400, stat:"INT", statPts:175, type:"milestone", cat:"mind"},
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
      {id:"ss_d3", title:"8h Hochleistungs-Output",        desc:"8 Stunden produktiv auf absolutem Spitzenlevel des eigenen Feldes.",  xp:380, stat:"INT", statPts:0, type:"daily", cat:"mind"},
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
  // SSS-RANK — Ascendant. Das Unmögliche.
  // ══════════════════════════════════════════════════════════
  SSS:{
    daily:[
      {id:"sss_d1", title:"Ascendant Training",      desc:"3h Kraft + 20km + 500 Dips + 500 Liegestütze. Täglich.",             xp:640, stat:"STR", statPts:0, type:"daily", cat:"strength"},
      {id:"sss_d2", title:"Genius-Level Work",             desc:"10h Deep Work auf absolutem Weltklasse-Niveau. Echte Probleme, echte Lösungen.", xp:640, stat:"INT", statPts:0, type:"daily", cat:"mind"},
      {id:"sss_d3", title:"Erschaffen was bleibt",         desc:"Erschaffe heute etwas das andere dauerhaft verändern wird.",         xp:540, stat:"CRE", statPts:0, type:"daily", cat:"skill_creative"},
    ],
    weekly:[
      {id:"sss_w1", title:"Legacy Challenge",              desc:"Erschaffe etwas das über dich hinaus existiert.",                    xp:5700, stat:"CHA", statPts:0, type:"weekly", cat:"legacy"},
      {id:"sss_w2", title:"Absolutes Maximum",             desc:"7 Tage: alle Stats perfekt – Körper, Geist, Kreativität, Soziales.", xp:6700, stat:"END", statPts:0, type:"weekly", cat:"discipline"},
    ],
    milestones:[
      {id:"sss_m1", title:"ASCENSION COMPLETE",             desc:"SSS-Rank Lv.10. Das absolut Unmögliche. Shadow Ascendant.",           xp:500000, stat:"END", statPts:999, type:"milestone", cat:"legacy"},
      {id:"sss_m2", title:"Weltklasse-Expertise",          desc:"Tiefste Expertise auf einem Gebiet. Weltweit anerkannt oder nachgewiesen.", xp:160000, stat:"INT", statPts:640, type:"milestone", cat:"mind"},
      {id:"sss_m3", title:"Körper des Ascendant",     desc:"Absolute Perfektion: Kraft, Ausdauer, Ästhetik – alles maximal.",  xp:130000, stat:"STR", statPts:520, type:"milestone", cat:"strength"},
    ],
  },
};

// ── Extra-Content einmergen (Prompt 10) ──────────────────────
// Fügt breiten Domain-Content zu E- und D-Rank hinzu.
// Neue Kategorien: recovery, social, home, finance, adventure.

const allExtraDailies = [
  ...(EXTRA_DAILIES.discipline || []),
  ...(EXTRA_DAILIES.recovery   || []),
  ...(EXTRA_DAILIES.social     || []),
  ...(EXTRA_DAILIES.home       || []),
  ...(EXTRA_DAILIES.finance    || []),
  ...(EXTRA_DAILIES.adventure  || []),
];

// E-Rank: alle Extra-Dailies + neue Weeklies + neue Milestones
CHALLENGES_DB.E.daily     = [...CHALLENGES_DB.E.daily,     ...allExtraDailies];
CHALLENGES_DB.E.weekly    = [...CHALLENGES_DB.E.weekly,    ...(EXTRA_WEEKLIES.E || [])];
CHALLENGES_DB.E.milestones= [...CHALLENGES_DB.E.milestones,...(EXTRA_MILESTONES.E || [])];

// D-Rank: neue Weeklies + Milestones + breite Domain-Extras (Etappe 7)
const allExtraDailiesD = [
  ...(EXTRA_DAILIES_D?.finance   || []),
  ...(EXTRA_DAILIES_D?.adventure || []),
  ...(EXTRA_DAILIES_D?.home      || []),
  ...(EXTRA_DAILIES_D?.service   || []),
];
CHALLENGES_DB.D.daily     = [...CHALLENGES_DB.D.daily,     ...allExtraDailiesD];
CHALLENGES_DB.D.weekly    = [...CHALLENGES_DB.D.weekly,    ...(EXTRA_WEEKLIES.D || [])];
CHALLENGES_DB.D.milestones= [...CHALLENGES_DB.D.milestones,...(EXTRA_MILESTONES.D || [])];

// C-Rank: neue Milestones + Weeklies + extra domain content (Etappe 7)
CHALLENGES_DB.C.milestones= [...(CHALLENGES_DB.C.milestones||[]),...(EXTRA_MILESTONES.C || []),...(EXTRA_MILESTONES_CB?.C || [])];
CHALLENGES_DB.C.weekly    = [...(CHALLENGES_DB.C.weekly||[]),...(EXTRA_WEEKLIES_C || [])];
// B-Rank: extra milestones
CHALLENGES_DB.B = CHALLENGES_DB.B || { daily:[], weekly:[], milestones:[] };
CHALLENGES_DB.B.milestones= [...(CHALLENGES_DB.B.milestones||[]),...(EXTRA_MILESTONES_CB?.B || [])];

// ── Neutrale Rank-Quests einmergen (Etappe 2: Equal Start) ──
// Sichert vollen neutralen Pool auf jedem Rank — ohne Themenbevorzugung.
for (const rk of Object.keys(NEUTRAL_RANK_QUESTS)) {
  CHALLENGES_DB[rk] = CHALLENGES_DB[rk] || { daily:[], weekly:[], milestones:[] };
  CHALLENGES_DB[rk].daily  = [...(CHALLENGES_DB[rk].daily  || []), ...(NEUTRAL_RANK_QUESTS[rk].daily  || [])];
  CHALLENGES_DB[rk].weekly = [...(CHALLENGES_DB[rk].weekly || []), ...(NEUTRAL_RANK_QUESTS[rk].weekly || [])];
}



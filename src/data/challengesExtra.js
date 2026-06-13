// ============================================================
// CHALLENGES EXTRA — Prompt 10
// Erweitert die CHALLENGES_DB um breiten, domain-diversifizier-
// ten Content. Verhindert Fokus nur auf Physik/Gym/Coding.
// 
// Neue Quests decken ab:
//   - Allgemeine Starter-Dailies (für alle Nutzer)
//   - Balance-Domains: social, appearance, home, finance, recovery
//   - Weekly-Quests für alle Lebensbereiche
//   - Langfristige Milestones (Session-Zähler, Habit-Chains, Projektziele)
// ============================================================

// ── Neue Dailies: breite Domain-Abdeckung ──────────────────
// Werden an die bestehenden Rank-Dailies angehängt.

export const EXTRA_DAILIES = {

  // ── Discipline / Planning ──
  discipline: [
    { id:"xd_disc_1", title:"Tagesplanung: 3 Prioritäten setzen",    desc:"Schreib die 3 wichtigsten Dinge für heute auf. Dann anfangen.", xp:15, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    { id:"xd_disc_2", title:"10 Min. Ordnung schaffen",               desc:"Schreibtisch, Zimmer, Desktop — einen Bereich aufräumen.",       xp:14, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home" },
    { id:"xd_disc_3", title:"Abend-Review: Was lief heute?",          desc:"5 Minuten Rückblick: Erfolge, Misserfolge, morgen besser.",       xp:16, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    { id:"xd_disc_4", title:"Digital Detox: 1h ohne Social Media",   desc:"Bewusste Auszeit vom Feed. Nichts verpassen was zählt.",          xp:18, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    { id:"xd_disc_5", title:"Inbox auf Null leeren",                   desc:"E-Mails, Nachrichten, Tasks — alles beantworten oder archivieren.", xp:15, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
  ],

  // ── Recovery / Mindfulness ──
  recovery: [
    { id:"xd_rec_1",  title:"10 Min. Reset-Protokoll",                desc:"Augen zu. Atmung runterfahren. Reset.",                        xp:22, stat:"VIT", statPts:0, type:"daily", cat:"health", domain:"recovery" },
    { id:"xd_rec_2",  title:"30 Min. ohne Bildschirm vor dem Schlafen", desc:"Handy weg, Buch statt Reel. Schlafqualität verbessern.",         xp:18, stat:"VIT", statPts:0, type:"daily", cat:"health", domain:"recovery" },
    { id:"xd_rec_3",  title:"Tages-Log: 3 Erfolge notieren",           desc:"Was lief heute gut? Drei Einträge — auch kleine.",                   xp:14, stat:"VIT", statPts:0, type:"daily", cat:"health", domain:"recovery" },
    { id:"xd_rec_4",  title:"Natur: 20 Min. draußen ohne Handy",      desc:"Raus. Luft. Gedanken sacken lassen. Kein Podcast.",               xp:20, stat:"VIT", statPts:0, type:"daily", cat:"health", domain:"recovery" },
    { id:"xd_rec_5",  title:"Schlafroutine einhalten",                  desc:"Gleiche Zeit ins Bett. Kein Handy. Entspannungsritual.",          xp:16, stat:"VIT", statPts:0, type:"daily", cat:"health", domain:"recovery" },
  ],

  // ── Social / Appearance ──
  social: [
    { id:"xd_soc_1",  title:"Jemandem ein ehrliches Kompliment machen", desc:"Nicht irgendeins — ein echtes, das du meinst.",                 xp:15, stat:"CHA", statPts:0, type:"daily", cat:"social", domain:"social" },
    { id:"xd_soc_2",  title:"Aktiv zuhören: keine Gegenwartsprobleme", desc:"Im nächsten Gespräch wirklich zuhören statt schon antworten.",  xp:16, stat:"SOC", statPts:0, type:"daily", cat:"social", domain:"social" },
    { id:"xd_soc_3",  title:"Outfit bewusst wählen",                    desc:"Was trägst du heute — und warum? Bewusste Entscheidung.",        xp:12, stat:"APP", statPts:0, type:"daily", cat:"appearance", domain:"appearance" },
    { id:"xd_soc_4",  title:"Vollständige Pflegeroutine",               desc:"Alles: Gesicht, Zähne, Haare, Körper — gewissenhaft.",           xp:12, stat:"APP", statPts:0, type:"daily", cat:"appearance", domain:"appearance" },
    { id:"xd_soc_5",  title:"Einem alten Kontakt schreiben",            desc:"Nicht wer zuletzt geschrieben hat — du bist dran.",              xp:17, stat:"CHA", statPts:0, type:"daily", cat:"social", domain:"social" },
  ],

  // ── Home / Household ──
  home: [
    { id:"xd_home_1", title:"Küchenbereich sauber halten",             desc:"Nach der Benutzung direkt aufräumen. Kein Aufschub.",                  xp:13, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home" },
    { id:"xd_home_2", title:"Wäsche waschen oder aufhängen",           desc:"Kleine Haushalts-Task direkt erledigen.",                         xp:14, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home" },
    { id:"xd_home_3", title:"Wohnung in 10 Min. aufräumen",            desc:"Timer stellen. Alles auf seinen Platz.",                          xp:14, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home" },
  ],

  // ── Finance / Career ──
  finance: [
    { id:"xd_fin_1",  title:"Ausgaben heute notieren",                  desc:"Was hast du heute ausgegeben? Aufschreiben — keine Ausrede.",     xp:16, stat:"INT", statPts:0, type:"daily", cat:"discipline", domain:"finance" },
    { id:"xd_fin_2",  title:"1 Karriere-Aufgabe erledigen",            desc:"Bewerbung, LinkedIn, Skill, Recherche — irgendetwas voranbringen.", xp:22, stat:"INT", statPts:0, type:"daily", cat:"discipline", domain:"career" },
    { id:"xd_fin_3",  title:"Finanzartikel oder -video lesen/schauen",  desc:"15 Min. lernen wie Geld und Wirtschaft funktionieren.",           xp:18, stat:"INT", statPts:0, type:"daily", cat:"discipline", domain:"finance" },
  ],

  // ── Adventure / Growth ──
  adventure: [
    { id:"xd_adv_1",  title:"Heute etwas zum ersten Mal tun",          desc:"Egal wie klein — irgendetwas neues ausprobieren.",                xp:22, stat:"AGI", statPts:0, type:"daily", cat:"discipline", domain:"adventure" },
    { id:"xd_adv_2",  title:"Komfortzone: jemanden Fremdes ansprechen", desc:"Einmal aktiv Kontakt zu jemandem herstellen den du nicht kennst.", xp:30, stat:"CHA", statPts:0, type:"daily", cat:"social", domain:"social" },
    { id:"xd_adv_3",  title:"Neue Route / neuer Weg heute",            desc:"Heute einen anderen Weg nehmen als gewohnt — andere Route, anderer Ort.",  xp:14, stat:"AGI", statPts:0, type:"daily", cat:"cardio", domain:"adventure" },
  ],
};

// ── Neue Weeklies ────────────────────────────────────────────

export const EXTRA_WEEKLIES = {
  E: [
    { id:"xw_e_1", title:"Woche review: Was lief gut / schlecht?",    desc:"15 Min. ruhige Reflexion: 3 Erfolge, 2 Misserfolge, 1 Fokus.",    xp:120, stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"discipline" },
    { id:"xw_e_2", title:"1 Recovery-Block machen",                    desc:"1h bewusstes Nichts-tun: kein Handy, kein Laptop, kein Content.", xp:100, stat:"VIT", statPts:0, type:"weekly", cat:"health",     domain:"recovery" },
    { id:"xw_e_3", title:"Zimmer oder Arbeitsplatz komplett aufräumen", desc:"Alles. Nicht nur halb — wirklich gründlich.",                    xp:90,  stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"home" },
    { id:"xw_e_4", title:"5x Tages-Log diese Woche",                  desc:"5 von 7 Tagen: 3 Erfolge loggen die gut liefen.",             xp:105, stat:"VIT", statPts:0, type:"weekly", cat:"health",     domain:"recovery" },
    { id:"xw_e_5", title:"Budget der Woche aufschreiben",              desc:"Einnahmen vs. Ausgaben — erste Bestandsaufnahme.",                xp:85,  stat:"INT", statPts:0, type:"weekly", cat:"discipline", domain:"finance" },
    { id:"xw_e_6", title:"2 Social Challenges diese Woche",            desc:"Zweimal aktiv auf andere zugehen oder ein Treffen organisieren.", xp:115, stat:"CHA", statPts:0, type:"weekly", cat:"social",     domain:"social" },
    { id:"xw_e_7", title:"Lernziel für nächste Woche setzen",          desc:"Konkret: was willst du lernen, wie viel, bis wann.",              xp:80,  stat:"INT", statPts:0, type:"weekly", cat:"mind",       domain:"mind" },
  ],
  D: [
    { id:"xw_d_1", title:"3 Lernsessions à 45 Min.",                   desc:"3x 45 Min. fokussiertes Lernen — kein Multitasking.",             xp:180, stat:"INT", statPts:0, type:"weekly", cat:"mind",       domain:"mind" },
    { id:"xw_d_2", title:"2 Trainingseinheiten + Recovery-Tag",        desc:"2x Training, 1x bewusste Erholung mit Stretching/Spa.",          xp:165, stat:"END", statPts:0, type:"weekly", cat:"strength",   domain:"body" },
    { id:"xw_d_3", title:"Projekt 1 Schritt voranbringen",             desc:"Coding, Elektronik, kreatives Projekt — einen Schritt weiter.",   xp:150, stat:"CRA", statPts:0, type:"weekly", cat:"skill_tech", domain:"craft" },
    { id:"xw_d_4", title:"1 Social Challenge + Reflexion",             desc:"Einmal auf jemanden zugehen und reflektieren wie es war.",        xp:130, stat:"CHA", statPts:0, type:"weekly", cat:"social",     domain:"social" },
    { id:"xw_d_5", title:"Budget 5 Tage tracken",                      desc:"Ausgaben 5 Tage aufschreiben. Muster erkennen.",                  xp:120, stat:"INT", statPts:0, type:"weekly", cat:"discipline", domain:"finance" },
    { id:"xw_d_6", title:"Pflegewoche: täglich vollständige Routine",  desc:"7 Tage: Pflege, Outfit, Auftreten bewusst gestalten.",            xp:140, stat:"APP", statPts:0, type:"weekly", cat:"appearance", domain:"appearance" },
    { id:"xw_d_7", title:"1 Recovery-Block + 1 Reset-Einheit",        desc:"Je 30 Min. — einmal Ruhe, einmal aktive Atem-Regeneration.",            xp:130, stat:"VIT", statPts:0, type:"weekly", cat:"health",     domain:"recovery" },
  ],
};

// ── Langfristige Milestones ───────────────────────────────────
// Zeigen echten Fortschritt über Wochen/Monate

export const EXTRA_MILESTONES = {
  E: [
    // Learning streaks
    { id:"xm_e_learn1",  title:"10 Lernsessions abgeschlossen",        desc:"10 fokussierte Lernblöcke — alle gezählt. Kein Halbherziges.",   xp:400, stat:"INT", statPts:5,  type:"milestone", cat:"mind",          domain:"mind" },
    { id:"xm_e_learn2",  title:"Erster Wochenplan eingehalten",        desc:"Eine komplette Woche nach Plan — alle Key-Tasks erledigt.",       xp:350, stat:"END", statPts:5,  type:"milestone", cat:"discipline",    domain:"discipline" },
    { id:"xm_e_log1",    title:"10 Progress Logs gespeichert",         desc:"10 Mal Fortschritt dokumentiert. Daten > Eindrücke.",             xp:300, stat:"INT", statPts:4,  type:"milestone", cat:"discipline",    domain:"discipline" },
    // Social / Appearance
    { id:"xm_e_soc1",    title:"5 Social Challenges abgeschlossen",    desc:"5 Mal aktiv auf andere zugegangen. Soziale Energie ist trainierbar.", xp:380, stat:"CHA", statPts:5, type:"milestone", cat:"social",    domain:"social" },
    { id:"xm_e_style1",  title:"Erste Style-Transformation",           desc:"Kleiderschrank sortiert, Pflegeroutine etabliert, Outfit bewusst gewählt — alles an einem Tag.", xp:320, stat:"APP", statPts:5, type:"milestone", cat:"appearance", domain:"appearance" },
    // Recovery
    { id:"xm_e_rec1",    title:"14 Tage Schlafroutine eingehalten",    desc:"14 Tage: gleiche Schlafenszeit, kein Handy im Bett, Ritual.",     xp:400, stat:"VIT", statPts:6,  type:"milestone", cat:"health",        domain:"recovery" },
    { id:"xm_e_rec2",    title:"7 Tage Tages-Log",                     desc:"7 Tage täglich 3 Erfolge geloggt die gut liefen.",           xp:280, stat:"VIT", statPts:4,  type:"milestone", cat:"health",        domain:"recovery" },
    // Finance
    { id:"xm_e_fin1",    title:"Ersten Monatsplan erstellt",           desc:"Einnahmen, Ausgaben, Sparziel — schriftlich für 1 Monat.",        xp:350, stat:"INT", statPts:5,  type:"milestone", cat:"discipline",    domain:"finance" },
    // Home
    { id:"xm_e_home1",   title:"Wohnung komplett organisiert",         desc:"Jeder Gegenstand hat einen Platz. Aufräumen dauert < 10 Min.",    xp:300, stat:"END", statPts:4,  type:"milestone", cat:"discipline",    domain:"home" },
    // Creativity
    { id:"xm_e_cre1",    title:"Erstes kreatives Werk fertiggestellt", desc:"Zeichnung, Song, Foto-Serie, Text — irgendetwas zu Ende gebracht.", xp:340, stat:"CRE", statPts:5, type:"milestone", cat:"skill_creative", domain:"creativity" },
  ],
  D: [
    // Learning milestones
    { id:"xm_d_learn1",  title:"25 Lernsessions abgeschlossen",        desc:"25 fokussierte Deep-Work-Blöcke. Du bist kein Anfänger mehr.",   xp:600, stat:"INT", statPts:7,  type:"milestone", cat:"mind",          domain:"mind" },
    { id:"xm_d_streak1", title:"14-Tage-Streak",                       desc:"14 Tage am Stück mindestens eine Quest erledigt.",                xp:550, stat:"END", statPts:8,  type:"milestone", cat:"discipline",    domain:"discipline" },
    // Project milestones
    { id:"xm_d_proj1",   title:"Erstes echtes Projekt abgeschlossen",  desc:"Coding-, Elektronik-, Handwerk- oder Kreativprojekt — fertig.",  xp:700, stat:"CRA", statPts:9,  type:"milestone", cat:"skill_tech",    domain:"craft" },
    { id:"xm_d_proj2",   title:"Projekt dokumentiert und erklärt",     desc:"README, Wiki, Fotos — du kannst es jemandem zeigen.",            xp:450, stat:"INT", statPts:6,  type:"milestone", cat:"skill_tech",    domain:"craft" },
    // Social milestones
    { id:"xm_d_soc1",    title:"10 Social Challenges abgeschlossen",   desc:"10 Mal Initiative ergriffen. Menschen gehen nicht von alleine.",  xp:500, stat:"CHA", statPts:7,  type:"milestone", cat:"social",        domain:"social" },
    // Finance milestones
    { id:"xm_d_fin1",    title:"4 Wochen Budget getrackt",             desc:"4 Wochen konsequent Einnahmen und Ausgaben aufgeschrieben.",      xp:520, stat:"INT", statPts:6,  type:"milestone", cat:"discipline",    domain:"finance" },
    // Recovery milestones
    { id:"xm_d_rec1",    title:"30 Tage Schlaf-/Morgenroutine",        desc:"30 Tage: gleiche Schlafzeit + Morgenritual eingehalten.",         xp:650, stat:"VIT", statPts:8,  type:"milestone", cat:"health",        domain:"recovery" },
    { id:"xm_d_rec2",    title:"20 Reset-Protokolle abgeschlossen",       desc:"20 bewusste Atem-Sessions — mind. je 5 Minuten.",      xp:480, stat:"VIT", statPts:6,  type:"milestone", cat:"health",        domain:"recovery" },
    // Creative milestones
    { id:"xm_d_cre1",    title:"3 kreative Werke fertiggestellt",      desc:"Nicht gut sein — fertig sein. 3 abgeschlossene Werke.",           xp:600, stat:"CRE", statPts:7,  type:"milestone", cat:"skill_creative", domain:"creativity" },
  ],
  C: [
    { id:"xm_c_learn1",  title:"50 Lernsessions abgeschlossen",        desc:"50 fokussierte Sessions. Du hast dir eine Disziplin aufgebaut.",  xp:800, stat:"INT", statPts:10, type:"milestone", cat:"mind",          domain:"mind" },
    { id:"xm_c_streak1", title:"30-Tage-Streak",                       desc:"30 Tage am Stück. Kein einziger Aussetzer.",                      xp:750, stat:"END", statPts:10, type:"milestone", cat:"discipline",    domain:"discipline" },
    { id:"xm_c_goal1",   title:"Erstes Ziel vollständig abgeschlossen", desc:"Ein Goal von 0 auf 100% — vollständig durchgezogen.",            xp:900, stat:"END", statPts:12, type:"milestone", cat:"discipline",    domain:"discipline" },
    { id:"xm_c_gate1",   title:"Drei Gates abgeschlossen",             desc:"Drei Prüfungen gemeistert. Du bist kein Anfänger mehr.",          xp:800, stat:"END", statPts:10, type:"milestone", cat:"discipline",    domain:"discipline" },
    { id:"xm_c_logs1",   title:"50 Progress Logs gespeichert",         desc:"50 dokumentierte Momente. Wachstum ist sichtbar.",                xp:600, stat:"INT", statPts:7,  type:"milestone", cat:"discipline",    domain:"discipline" },
  ],
};

// ── D-Rank Extra Dailies — Etappe 7: fehlende Domains ───────
// finance, career, adventure, home, service/leadership

export const EXTRA_DAILIES_D = {

  // ── Finance / Career ──
  finance: [
    { id:"xd_d_fin_1", title:"Ausgaben-Tracker: Heute alles notieren",  desc:"Was hast du ausgegeben? Wirklich alles — auch Kleinigkeiten.",        xp:20, stat:"INT", statPts:0, type:"daily", cat:"discipline", domain:"finance" },
    { id:"xd_d_fin_2", title:"Einen Vertrag oder Abo prüfen",           desc:"Brauchst du das noch? Ist es das wert? Entscheidung treffen.",          xp:22, stat:"INT", statPts:0, type:"daily", cat:"discipline", domain:"finance" },
    { id:"xd_d_fin_3", title:"Karriere-Task: Heute voranbringen",       desc:"Bewerbung, Skill, Netzwerk, Projekt — einen konkreten Schritt.",         xp:30, stat:"INT", statPts:0, type:"daily", cat:"discipline", domain:"career" },
    { id:"xd_d_fin_4", title:"Finanzwissen: 15 Min. lernen",            desc:"Investieren, Steuern, Budgeting — ein Konzept verstehen.",               xp:25, stat:"INT", statPts:0, type:"daily", cat:"mind",       domain:"finance" },
  ],

  // ── Adventure / Growth ──
  adventure: [
    { id:"xd_d_adv_1", title:"Komfortzone: Heute etwas Ungewohntes tun", desc:"Klein ist OK — Hauptsache du hast kurz gezögert und es trotzdem getan.", xp:28, stat:"AGI", statPts:0, type:"daily", cat:"discipline", domain:"adventure" },
    { id:"xd_d_adv_2", title:"Neue Perspektive: Fremdes Thema 15 Min.", desc:"Etwas das du normalerweise ignorierst. Neugier trainieren.",              xp:22, stat:"INT", statPts:0, type:"daily", cat:"mind",       domain:"adventure" },
    { id:"xd_d_adv_3", title:"Initiative: Jemanden für etwas vorschlagen", desc:"Einen Ausflug, ein Gespräch, eine Aktivität — du bringst die Idee.",    xp:25, stat:"CHA", statPts:0, type:"daily", cat:"social",     domain:"adventure" },
  ],

  // ── Home / Haushalt ──
  home: [
    { id:"xd_d_home_1", title:"Haushalt-Task: Vollständig erledigen",  desc:"Einkaufen, Putzen, Wäsche, Kochen — eine Aufgabe ganz zu Ende.",          xp:20, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home" },
    { id:"xd_d_home_2", title:"Bereich organisieren (15 Min.)",         desc:"Schrank, Schublade, Kabel, Dokumente — irgendetwas in Ordnung bringen.",   xp:22, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home" },
    { id:"xd_d_home_3", title:"Bürokratie-Task: Nicht aufschieben",     desc:"Brief, Formular, E-Mail, Antrag — heute erledigen, nicht morgen.",         xp:25, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home" },
  ],

  // ── Service / Leadership ──
  service: [
    { id:"xd_d_serv_1", title:"Jemandem aktiv helfen — ohne Gegenleistung", desc:"Nicht weil du musst. Einfach weil du es kannst.",                     xp:25, stat:"CHA", statPts:0, type:"daily", cat:"social",     domain:"social" },
    { id:"xd_d_serv_2", title:"Aktiv zuhören: Gespräch ohne eigene Agenda", desc:"Das nächste Gespräch: zuhören, nicht schnell antworten.",              xp:22, stat:"SOC", statPts:0, type:"daily", cat:"social",     domain:"social" },
    { id:"xd_d_serv_3", title:"Wissen oder Tipp weitergeben",            desc:"Irgendetwas das du weißt — jemandem nützlich machen.",                    xp:28, stat:"CHA", statPts:0, type:"daily", cat:"social",     domain:"social" },
    { id:"xd_d_lead_1", title:"Entscheidung treffen: Kein weiteres Aufschieben", desc:"Eine offene Entscheidung — heute treffen und kommunizieren.",      xp:30, stat:"INT", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    { id:"xd_d_lead_2", title:"Für andere planen oder koordinieren",     desc:"Irgendetwas organisieren das anderen nützt.",                             xp:28, stat:"CHA", statPts:0, type:"daily", cat:"social",     domain:"social" },
  ],
};

// ── C/B-Rank Extra Weeklies — Etappe 7 ───────────────────────
// Deckt finance, adventure, service/leadership für höhere Ranks ab

export const EXTRA_WEEKLIES_C = [
  { id:"xw_c_fin_1",  title:"Budget der Woche analysieren",             desc:"Wo geht das Geld hin? Muster erkennen und einen Bereich optimieren.",    xp:160, stat:"INT", statPts:0, type:"weekly", cat:"discipline", domain:"finance" },
  { id:"xw_c_adv_1",  title:"Diese Woche etwas Neues ausprobieren",    desc:"Aktivität, Ort, Kontakt, Thema — etwas das du noch nie gemacht hast.",    xp:180, stat:"AGI", statPts:0, type:"weekly", cat:"discipline", domain:"adventure" },
  { id:"xw_c_serv_1", title:"Diese Woche 3× aktiv helfen",             desc:"Drei Momente in denen du jemandem wirklich nützlich warst.",               xp:170, stat:"CHA", statPts:0, type:"weekly", cat:"social",     domain:"social" },
  { id:"xw_c_lead_1", title:"Diese Woche Verantwortung übernehmen",    desc:"Mindestens eine Situation aktiv leiten, organisieren oder entscheiden.",    xp:185, stat:"CHA", statPts:0, type:"weekly", cat:"discipline", domain:"discipline" },
];

// ── C/B-Rank Extra Milestones — Etappe 7 ─────────────────────
export const EXTRA_MILESTONES_CB = {
  C: [
    { id:"xm_c_fin1",  title:"4 Wochen Budget konsequent geführt",      desc:"Einnahmen vs. Ausgaben 4 Wochen aufgeschrieben und analysiert.",           xp:700, stat:"INT", statPts:8,  type:"milestone", cat:"discipline", domain:"finance" },
    { id:"xm_c_adv1",  title:"10 neue Aktivitäten oder Orte erlebt",    desc:"10 Momente außerhalb der gewohnten Routine. Breite schlägt Tiefe.",        xp:650, stat:"AGI", statPts:7,  type:"milestone", cat:"discipline", domain:"adventure" },
    { id:"xm_c_serv1", title:"20 Mal jemandem aktiv geholfen",          desc:"20 bewusste Momente des Gebens — dokumentiert.",                           xp:600, stat:"CHA", statPts:7,  type:"milestone", cat:"social",     domain:"social" },
    { id:"xm_c_lead1", title:"Erste echte Leadership-Situation gemeistert", desc:"Entscheidung für andere, Konflikt gelöst, Gruppe geführt — wirklich.",  xp:750, stat:"CHA", statPts:9,  type:"milestone", cat:"social",     domain:"social" },
  ],
  B: [
    { id:"xm_b_fin1",  title:"Finanzsystem aufgebaut + 3 Monate gehalten", desc:"Budget + Sparziel + Tracking — dauerhaft funktionierend.",               xp:900, stat:"INT", statPts:11, type:"milestone", cat:"discipline", domain:"finance" },
    { id:"xm_b_adv1",  title:"Mehrtägiges Abenteuer absolviert",         desc:"Reise, Outdoor-Event, Fremdes Land — etwas das echten Mut brauchte.",      xp:1000,stat:"AGI", statPts:12, type:"milestone", cat:"discipline", domain:"adventure" },
    { id:"xm_b_lead1", title:"Team oder Projekt über 4+ Wochen geführt", desc:"Nicht nur Ideen — wirklich Verantwortung getragen.",                       xp:950, stat:"CHA", statPts:11, type:"milestone", cat:"social",     domain:"social" },
  ],
};

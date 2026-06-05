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
    { id:"xd_rec_1",  title:"10 Min. Meditation oder Atemübung",      desc:"Augen zu. Atmen. Gedanken ziehen lassen.",                        xp:22, stat:"VIT", statPts:0, type:"daily", cat:"health", domain:"recovery" },
    { id:"xd_rec_2",  title:"30 Min. ohne Bildschirm vor dem Schlafen", desc:"Handy weg, Buch statt Reel. Schlafqualität verbessern.",         xp:18, stat:"VIT", statPts:0, type:"daily", cat:"health", domain:"recovery" },
    { id:"xd_rec_3",  title:"Dankbarkeitsnotiz: 3 Dinge aufschreiben", desc:"Was war heute gut? Drei Dinge — auch kleine.",                   xp:14, stat:"VIT", statPts:0, type:"daily", cat:"health", domain:"recovery" },
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
    { id:"xd_home_1", title:"Küche nach dem Kochen sauber machen",     desc:"Teller, Pfanne, Herd — direkt. Kein Aufschub.",                  xp:13, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"home" },
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
    { id:"xd_adv_3",  title:"Neue Route / neuer Weg heute",            desc:"Auf dem Weg zur Uni, zum Gym oder einkaufen eine neue Strecke.",  xp:14, stat:"AGI", statPts:0, type:"daily", cat:"cardio", domain:"adventure" },
  ],
};

// ── Neue Weeklies ────────────────────────────────────────────

export const EXTRA_WEEKLIES = {
  E: [
    { id:"xw_e_1", title:"Woche review: Was lief gut / schlecht?",    desc:"15 Min. ruhige Reflexion: 3 Erfolge, 2 Misserfolge, 1 Fokus.",    xp:120, stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"discipline" },
    { id:"xw_e_2", title:"1 Recovery-Block machen",                    desc:"1h bewusstes Nichts-tun: kein Handy, kein Laptop, kein Content.", xp:100, stat:"VIT", statPts:0, type:"weekly", cat:"health",     domain:"recovery" },
    { id:"xw_e_3", title:"Zimmer oder Arbeitsplatz komplett aufräumen", desc:"Alles. Nicht nur halb — wirklich gründlich.",                    xp:90,  stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"home" },
    { id:"xw_e_4", title:"5x täglich Dankbarkeitsnotiz diese Woche",  desc:"5 von 7 Tagen: 3 Dinge aufschreiben die gut liefen.",             xp:105, stat:"VIT", statPts:0, type:"weekly", cat:"health",     domain:"recovery" },
    { id:"xw_e_5", title:"Budget der Woche aufschreiben",              desc:"Einnahmen vs. Ausgaben — erste Bestandsaufnahme.",                xp:85,  stat:"INT", statPts:0, type:"weekly", cat:"discipline", domain:"finance" },
    { id:"xw_e_6", title:"2 Social Challenges diese Woche",            desc:"Zweimal aktiv auf andere zugehen oder ein Treffen organisieren.", xp:115, stat:"CHA", statPts:0, type:"weekly", cat:"social",     domain:"social" },
    { id:"xw_e_7", title:"Lernziel für nächste Woche setzen",          desc:"Konkret: was willst du lernen, wie viel, bis wann.",              xp:80,  stat:"INT", statPts:0, type:"weekly", cat:"uni",        domain:"mind" },
  ],
  D: [
    { id:"xw_d_1", title:"3 Lernsessions à 45 Min.",                   desc:"3x 45 Min. fokussiertes Lernen — kein Multitasking.",             xp:180, stat:"INT", statPts:0, type:"weekly", cat:"uni",        domain:"mind" },
    { id:"xw_d_2", title:"2 Trainingseinheiten + Recovery-Tag",        desc:"2x Training, 1x bewusste Erholung mit Stretching/Spa.",          xp:165, stat:"END", statPts:0, type:"weekly", cat:"strength",   domain:"body" },
    { id:"xw_d_3", title:"Projekt 1 Schritt voranbringen",             desc:"Coding, Elektronik, kreatives Projekt — einen Schritt weiter.",   xp:150, stat:"CRA", statPts:0, type:"weekly", cat:"skill_tech", domain:"craft" },
    { id:"xw_d_4", title:"1 Social Challenge + Reflexion",             desc:"Einmal auf jemanden zugehen und reflektieren wie es war.",        xp:130, stat:"CHA", statPts:0, type:"weekly", cat:"social",     domain:"social" },
    { id:"xw_d_5", title:"Budget 5 Tage tracken",                      desc:"Ausgaben 5 Tage aufschreiben. Muster erkennen.",                  xp:120, stat:"INT", statPts:0, type:"weekly", cat:"discipline", domain:"finance" },
    { id:"xw_d_6", title:"Pflegewoche: täglich vollständige Routine",  desc:"7 Tage: Pflege, Outfit, Auftreten bewusst gestalten.",            xp:140, stat:"APP", statPts:0, type:"weekly", cat:"appearance", domain:"appearance" },
    { id:"xw_d_7", title:"1 Recovery-Block + 1 Meditationseinheit",   desc:"Je 30 Min. — einmal Ruhe, einmal aktive Achtsamkeit.",            xp:130, stat:"VIT", statPts:0, type:"weekly", cat:"health",     domain:"recovery" },
  ],
};

// ── Langfristige Milestones ───────────────────────────────────
// Zeigen echten Fortschritt über Wochen/Monate

export const EXTRA_MILESTONES = {
  E: [
    // Learning streaks
    { id:"xm_e_learn1",  title:"10 Lernsessions abgeschlossen",        desc:"10 fokussierte Lernblöcke — alle gezählt. Kein Halbherziges.",   xp:400, stat:"INT", statPts:5,  type:"milestone", cat:"uni",           domain:"mind" },
    { id:"xm_e_learn2",  title:"Erster Wochenplan eingehalten",        desc:"Eine komplette Woche nach Plan — alle Key-Tasks erledigt.",       xp:350, stat:"END", statPts:5,  type:"milestone", cat:"discipline",    domain:"discipline" },
    { id:"xm_e_log1",    title:"10 Progress Logs gespeichert",         desc:"10 Mal Fortschritt dokumentiert. Daten > Eindrücke.",             xp:300, stat:"INT", statPts:4,  type:"milestone", cat:"discipline",    domain:"discipline" },
    // Social / Appearance
    { id:"xm_e_soc1",    title:"5 Social Challenges abgeschlossen",    desc:"5 Mal aktiv auf andere zugegangen. Soziale Energie ist trainierbar.", xp:380, stat:"CHA", statPts:5, type:"milestone", cat:"social",    domain:"social" },
    { id:"xm_e_style1",  title:"Erste Style-Transformation",           desc:"Kleiderschrank sortiert, Pflegeroutine etabliert, Outfit bewusst gewählt — alles an einem Tag.", xp:320, stat:"APP", statPts:5, type:"milestone", cat:"appearance", domain:"appearance" },
    // Recovery
    { id:"xm_e_rec1",    title:"14 Tage Schlafroutine eingehalten",    desc:"14 Tage: gleiche Schlafenszeit, kein Handy im Bett, Ritual.",     xp:400, stat:"VIT", statPts:6,  type:"milestone", cat:"health",        domain:"recovery" },
    { id:"xm_e_rec2",    title:"7 Tage Dankbarkeitsjournal",           desc:"7 Tage täglich 3 Dinge aufgeschrieben die gut liefen.",           xp:280, stat:"VIT", statPts:4,  type:"milestone", cat:"health",        domain:"recovery" },
    // Finance
    { id:"xm_e_fin1",    title:"Ersten Monatsplan erstellt",           desc:"Einnahmen, Ausgaben, Sparziel — schriftlich für 1 Monat.",        xp:350, stat:"INT", statPts:5,  type:"milestone", cat:"discipline",    domain:"finance" },
    // Home
    { id:"xm_e_home1",   title:"Wohnung komplett organisiert",         desc:"Jeder Gegenstand hat einen Platz. Aufräumen dauert < 10 Min.",    xp:300, stat:"END", statPts:4,  type:"milestone", cat:"discipline",    domain:"home" },
    // Creativity
    { id:"xm_e_cre1",    title:"Erstes kreatives Werk fertiggestellt", desc:"Zeichnung, Song, Foto-Serie, Text — irgendetwas zu Ende gebracht.", xp:340, stat:"CRE", statPts:5, type:"milestone", cat:"skill_creative", domain:"creativity" },
  ],
  D: [
    // Learning milestones
    { id:"xm_d_learn1",  title:"25 Lernsessions abgeschlossen",        desc:"25 fokussierte Deep-Work-Blöcke. Du bist kein Anfänger mehr.",   xp:600, stat:"INT", statPts:7,  type:"milestone", cat:"uni",           domain:"mind" },
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
    { id:"xm_d_rec2",    title:"20 Meditation/Atemübungen abgeschlossen", desc:"20 bewusste Achtsamkeitssessions — mind. je 5 Minuten.",      xp:480, stat:"VIT", statPts:6,  type:"milestone", cat:"health",        domain:"recovery" },
    // Creative milestones
    { id:"xm_d_cre1",    title:"3 kreative Werke fertiggestellt",      desc:"Nicht gut sein — fertig sein. 3 abgeschlossene Werke.",           xp:600, stat:"CRE", statPts:7,  type:"milestone", cat:"skill_creative", domain:"creativity" },
  ],
  C: [
    { id:"xm_c_learn1",  title:"50 Lernsessions abgeschlossen",        desc:"50 fokussierte Sessions. Du hast dir eine Disziplin aufgebaut.",  xp:800, stat:"INT", statPts:10, type:"milestone", cat:"uni",           domain:"mind" },
    { id:"xm_c_streak1", title:"30-Tage-Streak",                       desc:"30 Tage am Stück. Kein einziger Aussetzer.",                      xp:750, stat:"END", statPts:10, type:"milestone", cat:"discipline",    domain:"discipline" },
    { id:"xm_c_goal1",   title:"Erstes Ziel vollständig abgeschlossen", desc:"Ein Goal von 0 auf 100% — vollständig durchgezogen.",            xp:900, stat:"END", statPts:12, type:"milestone", cat:"discipline",    domain:"discipline" },
    { id:"xm_c_gate1",   title:"Drei Gates abgeschlossen",             desc:"Drei Prüfungen gemeistert. Du bist kein Anfänger mehr.",          xp:800, stat:"END", statPts:10, type:"milestone", cat:"discipline",    domain:"discipline" },
    { id:"xm_c_logs1",   title:"50 Progress Logs gespeichert",         desc:"50 dokumentierte Momente. Wachstum ist sichtbar.",                xp:600, stat:"INT", statPts:7,  type:"milestone", cat:"discipline",    domain:"discipline" },
  ],
};

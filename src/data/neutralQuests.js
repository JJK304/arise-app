// ============================================================
// NEUTRAL RANK QUESTS — Etappe 2: Equal Start
// Neutrale System-Quests für C..SSS, progressiv anspruchsvoller.
// Sie sichern, dass ein Nutzer OHNE Signale auf jedem Rank
// einen vollen, sinnvollen Quest-Pool hat — ohne dass ein
// Spezialthema bevorzugt wird.
// XP orientiert sich am bestehenden Rank-Niveau.
// ============================================================

export const NEUTRAL_RANK_QUESTS = {
  C: {
    daily: [
      { id:"nc_c_d1", title:"Focus Block II",      desc:"45 Minuten konzentriert an etwas Wichtigem — keine Unterbrechung, kein Handy.",          xp:50, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
      { id:"nc_c_d2", title:"Body Activation II",  desc:"30 Minuten fordernde Bewegung deiner Wahl — Hauptsache bewusst und durchgezogen.",        xp:45, stat:"VIT", statPts:0, type:"daily", cat:"health",     domain:"body" },
      { id:"nc_c_d3", title:"Skill Practice II",   desc:"25 Minuten gezielt eine Fähigkeit üben — mit konkretem Ziel, nicht nur konsumieren.",      xp:42, stat:"INT", statPts:0, type:"daily", cat:"mind",       domain:"mind" },
      { id:"nc_c_d4", title:"Objective Drive",     desc:"Einen messbaren Fortschritt an einem aktiven Ziel erzeugen — heute, nicht irgendwann.",    xp:45, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    ],
    weekly: [
      { id:"nc_c_w1", title:"Weekly Momentum",     desc:"4 Fokus-Sessions diese Woche — je mindestens 30 Minuten ohne Ablenkung.",                 xp:250, stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"discipline" },
    ],
  },
  B: {
    daily: [
      { id:"nc_b_d1", title:"Focus Block III",     desc:"90 Minuten Deep Focus an deiner wichtigsten Aufgabe — Block planen, Block halten.",        xp:80, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
      { id:"nc_b_d2", title:"Body Activation III", desc:"45 Minuten fordernde körperliche Aktivität deiner Wahl — Intensität zählt.",              xp:75, stat:"VIT", statPts:0, type:"daily", cat:"health",     domain:"body" },
      { id:"nc_b_d3", title:"Skill Execution",     desc:"45 Minuten eine Fähigkeit auf Anwendungsniveau einsetzen — echtes Problem, echtes Ergebnis.", xp:72, stat:"INT", statPts:0, type:"daily", cat:"mind",     domain:"mind" },
    ],
    weekly: [
      { id:"nc_b_w1", title:"Weekly Output",       desc:"Diese Woche ein konkretes, vorzeigbares Ergebnis produzieren und festhalten.",            xp:340, stat:"END", statPts:0, type:"weekly", cat:"discipline", domain:"discipline" },
    ],
  },
  A: {
    daily: [
      { id:"nc_a_d1", title:"Mastery Block",       desc:"2 Stunden strukturierte Arbeit an deiner wichtigsten Sache — geplant, fokussiert, dokumentiert.", xp:120, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    ],
    weekly: [
      { id:"nc_a_w1", title:"Weekly Result Proof", desc:"Ein vorzeigbares Wochenergebnis erzeugen und kurz dokumentieren — Beweis statt Behauptung.", xp:500, stat:"INT", statPts:0, type:"weekly", cat:"discipline", domain:"discipline" },
    ],
  },
  S: {
    daily: [
      { id:"nc_s_d1", title:"Peak Output Block",   desc:"4 Stunden fokussierte Arbeit auf deinem höchsten persönlichen Niveau — keine Kompromisse.", xp:200, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    ],
    weekly: [
      { id:"nc_s_w1", title:"Excellence Review",   desc:"Die Woche schonungslos analysieren: Output, Standards, nächste Stufe — schriftlich.",       xp:900, stat:"INT", statPts:0, type:"weekly", cat:"discipline", domain:"discipline", actionType:"reflection" },
    ],
  },
  SS: {
    daily: [
      { id:"nc_ss_d1", title:"Elite Focus",        desc:"6 Stunden strukturierter Hochleistungs-Fokus — auf dem eigenen Spitzenfeld.",              xp:340, stat:"INT", statPts:0, type:"daily", cat:"mind",       domain:"mind" },
      { id:"nc_ss_d2", title:"Elite Conditioning", desc:"60+ Minuten fordernde körperliche Arbeit deiner Wahl — Elite-Standard.",                   xp:300, stat:"VIT", statPts:0, type:"daily", cat:"health",     domain:"body" },
      { id:"nc_ss_d3", title:"Standard Audit",     desc:"Einen Lebensbereich auf Elite-Standard prüfen und konkret nachschärfen.",                  xp:280, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    ],
    weekly: [],
  },
  SSS: {
    daily: [
      { id:"nc_sss_d1", title:"Apex Protocol",     desc:"Ein Tag, in dem jede Stunde bewusst gestaltet ist — Plan, Ausführung, Abend-Review.",      xp:560, stat:"END", statPts:0, type:"daily", cat:"discipline", domain:"discipline" },
    ],
    weekly: [],
  },
};

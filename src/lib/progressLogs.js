// ============================================================
// PROGRESS LOGS — Fortschrittsdokumentation
// Schnelle, optional ausfüllbare Logs beim Quest-Abschluss.
// Anti-Spam: max 5–20 XP Bonus, Cooldown pro Quest-ID/Tag.
// ============================================================
import { getDayKey } from "./dates.js";

// Max Logs insgesamt im State
const MAX_LOGS = 200;

// Max XP-Bonus pro Log (anti-farmbar)
const LOG_XP_BONUS = {
  action:     5,
  reflection: 15,
  metric:     10,
  project:    12,
  recovery:   8,
};

/**
 * Erstellt einen neuen Progress-Log-Eintrag.
 */
export function createProgressLog({ questId, goalId, gateId, quest, metrics, notes, tags }) {
  const type    = quest?.actionType || quest?.type || "action";
  const domain  = quest?.domain || quest?.cat || null;
  const path    = quest?.path   || null;
  const topic   = quest?.topic  || null;
  const interestId = quest?.interestId || null;

  return {
    id:          `log_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    createdAt:   new Date().toISOString(),
    dayKey:      getDayKey(),
    questId:     questId  || null,
    goalId:      goalId   || null,
    gateId:      gateId   || null,
    type,
    domain,
    path,
    interestId,
    topic,
    title:       quest?.title || "Log",
    notes:       (notes  || "").trim(),
    metrics:     sanitizeMetrics(metrics || {}),
    tags:        tags || [],
    xpBonus:     LOG_XP_BONUS[type] || 5,
  };
}

/**
 * Sanitized metrics — nur numerische Werte, nichts übertrieben.
 */
function sanitizeMetrics(raw) {
  const allowed = ["duration","reps","weight","sets","distance","tasksCompleted",
                   "understanding","mood","energy","stress","sleepQuality","progressPercent",
                   "confidence","recovery","amount","impact"];
  // Etappe 10: Text-Felder nach Sprint-Spez (nextStep, output, situation, …)
  const allowedText = ["nextStep","output","feedback","situation","area",
                       "personOrGroup","actionTaken"];
  const out = {};
  for (const key of allowed) {
    const v = raw[key];
    if (v !== undefined && v !== "" && v !== null) {
      const num = parseFloat(v);
      if (!isNaN(num)) out[key] = num;
    }
  }
  for (const key of allowedText) {
    const v = raw[key];
    if (typeof v === "string" && v.trim().length > 0) {
      out[key] = v.trim().slice(0, 200);
    }
  }
  return out;
}

/**
 * Prüft ob für diese Quest heute schon ein Log mit Bonus erstellt wurde.
 * Verhindert Log-Spam (max 1 Bonus-Log pro questId pro Tag).
 */
export function canLogWithBonus(progressLogs, questId) {
  if (!questId) return true;
  const today = getDayKey();
  return !(progressLogs || []).some(
    l => l.questId === questId && l.dayKey === today
  );
}

/**
 * Fügt einen Log zum State hinzu (immutable).
 * Hält auf MAX_LOGS.
 */
export function addProgressLog(progressLogs, log) {
  return [...(progressLogs || []), log].slice(-MAX_LOGS);
}

/**
 * Filtert Logs nach Domain.
 */
export function getLogsByDomain(progressLogs, domain) {
  return (progressLogs || []).filter(l => l.domain === domain);
}

/**
 * Filtert Logs nach Goal.
 */
export function getLogsByGoal(progressLogs, goalId) {
  return (progressLogs || []).filter(l => l.goalId === goalId);
}

/**
 * Gibt die letzten N Logs zurück.
 */
export function getRecentLogs(progressLogs, n = 10) {
  return (progressLogs || []).slice(-n).reverse();
}

/**
 * Gibt Felder zurück die für einen bestimmten Quest-Typ relevant sind.
 * Steuert was im Log-Modal angezeigt wird.
 * Abgedeckte Domains: body, mind, craft, creativity, recovery,
 *   social, finance, career, home, discipline, adventure
 */
export function getLogFields(quest) {
  const domain  = quest?.domain || quest?.cat || "";
  const aType   = quest?.actionType || "";
  const path    = quest?.path || "";

  // Reflexion (höchste Priorität — überschreibt Domain-Checks)
  if (aType === "reflection") {
    return {
      metrics: ["mood","energy"],
      notesLabel: "Deine Reflexion",
      notesRequired: true,
    };
  }

  // Metric Quest
  if (aType === "metric") {
    return {
      metrics: ["duration","tasksCompleted","progressPercent"],
      notesLabel: "Was gemessen? Was dokumentiert?",
      notesRequired: false,
    };
  }

  // Fitness / Körper
  if (domain === "body" || ["strength","cardio"].includes(domain) ||
      ["fighter","runner"].includes(path)) {
    return {
      metrics: ["sets","reps","weight","distance","duration","energy","recovery"],
      notesLabel: "Wie lief es? Technik, Energie, Fortschritt?",
      notesRequired: false,
    };
  }

  // Lernen / Wissen
  if (domain === "mind" || domain === "uni" ||
      path === "scholar" || aType === "deep_work") {
    return {
      metrics: ["duration","tasksCompleted","understanding","nextStep"],
      notesLabel: "Was gelernt? Was war schwer?",
      notesRequired: aType === "reflection",
    };
  }

  // Craft / Technik / Projekt
  if (domain === "craft" || aType === "project" ||
      ["engineer","artisan"].includes(path)) {
    return {
      metrics: ["duration","progressPercent","output","nextStep"],
      notesLabel: "Was gebaut? Was debuggt?",
      notesRequired: false,
    };
  }

  // Recovery / Healer
  if (domain === "recovery" || aType === "recovery" ||
      ["monk","healer"].includes(path) || quest?.recovery) {
    return {
      metrics: ["mood","energy","stress","sleepQuality"],
      notesLabel: "Was hat geholfen? Wie geht es dir?",
      notesRequired: false,
    };
  }

  // Kreativität / Creator
  if (domain === "creativity" || ["creator","artisan"].includes(path)) {
    return {
      metrics: ["progressPercent","output","feedback","nextStep"],
      notesLabel: "Was erstellt? Wie zufrieden bist du?",
      notesRequired: false,
    };
  }

  // Service / Leadership (Sprint Etappe 10: personOrGroup, actionTaken, impact)
  if (domain === "leadership" || domain === "service" ||
      ["leader","healer"].includes(path)) {
    return {
      metrics: ["personOrGroup","actionTaken","impact","nextStep"],
      notesLabel: "Reflexion: Was hat es bewirkt?",
      notesRequired: false,
    };
  }

  // Social / Charmer
  if (domain === "social" || domain === "appearance" ||
      domain === "leadership" || domain === "service" ||
      ["charmer","leader","healer"].includes(path)) {
    return {
      metrics: ["situation","confidence","nextStep"],
      notesLabel: "Reaktion und Reflexion?",
      notesRequired: aType === "reflection",
    };
  }

  // Finance / Career / Merchant
  if (domain === "finance" || domain === "career" || path === "merchant") {
    return {
      metrics: ["tasksCompleted","amount","nextStep"],
      notesLabel: "Was erledigt? (Betrag optional)",
      notesRequired: false,
    };
  }

  // Home / Guardian
  if (domain === "home" || path === "guardian") {
    return {
      metrics: ["area","tasksCompleted","duration","nextStep"],
      notesLabel: "Was erledigt?",
      notesRequired: false,
    };
  }

  // Discipline / Strategist
  if (domain === "discipline" || ["strategist"].includes(path)) {
    return {
      metrics: ["area","tasksCompleted","duration","nextStep"],
      notesLabel: "Was abgeschlossen?",
      notesRequired: false,
    };
  }

  // Adventure / Explorer
  if (domain === "adventure" || path === "explorer") {
    return {
      metrics: ["duration","energy"],
      notesLabel: "Was erlebt? Was hat sich verändert?",
      notesRequired: false,
    };
  }

  // Default
  return {
    metrics: ["duration"],
    notesLabel: "Notiz (optional)",
    notesRequired: false,
  };
}

/**
 * Label-Map für Metric-Felder im UI.
 */
export const METRIC_LABELS = {
  duration:        { label: "Dauer (Min.)",  icon: "◷",  type: "number", min: 1,   max: 300  },
  reps:            { label: "Wdh.",          icon: "⟳",  type: "number", min: 1,   max: 500  },
  weight:          { label: "Gewicht (kg)",  icon: "⬡",  type: "number", min: 0,   max: 500  },
  sets:            { label: "Sätze",         icon: "▤",  type: "number", min: 1,   max: 20   },
  distance:        { label: "Distanz (km)",  icon: "⟶",  type: "number", min: 0.1, max: 200  },
  tasksCompleted:  { label: "Aufgaben ✓",    icon: "✓",  type: "number", min: 0,   max: 100  },
  understanding:   { label: "Verständnis",   icon: "◈",  type: "range",  min: 1,   max: 5    },
  mood:            { label: "Stimmung",      icon: "◉",  type: "range",  min: 1,   max: 5    },
  energy:          { label: "Energie",       icon: "⚡",  type: "range",  min: 1,   max: 5    },
  stress:          { label: "Stress",        icon: "⌁",  type: "range",  min: 1,   max: 5    },
  sleepQuality:    { label: "Schlaf",        icon: "◎",  type: "range",  min: 1,   max: 5    },
  progressPercent: { label: "Fortschritt %", icon: "▲",  type: "number", min: 0,   max: 100  },
  confidence:      { label: "Selbstsicherheit", icon: "✧", type: "range", min: 1, max: 5    },
  nextStep:        { label: "Nächster Schritt",  icon: "→", type: "text",  min: 0, max: 200   },
  recovery:        { label: "Erholung",       icon: "⬢",  type: "range",  min: 1,   max: 5    },
  amount:          { label: "Betrag (€)",     icon: "◆",  type: "number", min: 0,   max: 100000 },
  impact:          { label: "Wirkung",        icon: "✦",  type: "range",  min: 1,   max: 5    },
  output:          { label: "Ergebnis/Output", icon: "⌖", type: "text",  min: 0,   max: 200  },
  feedback:        { label: "Feedback erhalten", icon: "◇", type: "text", min: 0,  max: 200  },
  situation:       { label: "Situation",      icon: "⟡",  type: "text",  min: 0,   max: 200  },
  area:            { label: "Bereich",        icon: "▣",  type: "text",  min: 0,   max: 200  },
  personOrGroup:   { label: "Person/Gruppe",  icon: "◉",  type: "text",  min: 0,   max: 200  },
  actionTaken:     { label: "Was getan",      icon: "⌁",  type: "text",  min: 0,   max: 200  },
};

// ═══════════════════════════════════════════════════════════
// shouldPromptProgressLog — Etappe 10
// Normale Daily Quests öffnen KEIN erzwungenes Log-Modal.
// Logs werden angeboten bei: Reflection / Metric / Project /
// Training (Body) / Gate Step / Trial / Milestone /
// requiresLog:true / optional bei Goal-verknüpften Quests.
// ═══════════════════════════════════════════════════════════
export function shouldPromptProgressLog(quest, _state, feedback) {
  if (!quest) return false;
  if (quest.requiresLog) return true;
  if (["reflection", "metric", "project"].includes(quest.actionType)) return true;
  if (quest.actionType === "training" && quest.domain === "body") return true;
  if (quest.type === "gate_step") return true;
  if (quest.trial) return true;
  if (quest.type === "milestone") return true;
  if (feedback?.goalProgress?.length > 0 && quest.suggestLog) return true;
  if (quest.source === "starter" || !quest.personalized) return false;
  if (quest.goalId && quest.domain) return true;
  return false;
}

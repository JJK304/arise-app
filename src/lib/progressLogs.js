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
                   "understanding","mood","energy","stress","sleepQuality","progressPercent"];
  const out = {};
  for (const key of allowed) {
    const v = raw[key];
    if (v !== undefined && v !== "" && v !== null) {
      const num = parseFloat(v);
      if (!isNaN(num)) out[key] = num;
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
 */
export function getLogFields(quest) {
  const domain  = quest?.domain || quest?.cat || "";
  const aType   = quest?.actionType || "";

  // Fitness / Körper
  if (domain === "body" || ["strength","cardio"].includes(domain)) {
    return {
      metrics: ["duration","reps","weight","sets","distance","energy"],
      notesLabel: "Wie lief es?",
      notesRequired: false,
    };
  }
  // Lernen / Studium
  if (domain === "mind" || domain === "uni") {
    return {
      metrics: ["duration","tasksCompleted","understanding"],
      notesLabel: "Was gelernt? Was war schwer?",
      notesRequired: aType === "reflection",
    };
  }
  // Projekt / Craft
  if (domain === "craft" || aType === "project") {
    return {
      metrics: ["duration","progressPercent"],
      notesLabel: "Was gebaut? Nächster Schritt?",
      notesRequired: false,
    };
  }
  // Recovery
  if (domain === "recovery" || aType === "recovery" || quest?.recovery) {
    return {
      metrics: ["mood","energy","stress","sleepQuality"],
      notesLabel: "Was hat geholfen?",
      notesRequired: false,
    };
  }
  // Kreativität
  if (domain === "creativity") {
    return {
      metrics: ["duration","progressPercent"],
      notesLabel: "Was erstellt? Wie fühlst du dich damit?",
      notesRequired: false,
    };
  }
  // Reflexion
  if (aType === "reflection") {
    return {
      metrics: ["mood","energy"],
      notesLabel: "Deine Reflexion",
      notesRequired: true,
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
  duration:        { label: "Dauer (Min.)", icon: "⏱️",  type: "number", min: 1,   max: 300  },
  reps:            { label: "Wdh.",         icon: "🔁",  type: "number", min: 1,   max: 500  },
  weight:          { label: "Gewicht (kg)", icon: "⚖️",  type: "number", min: 0,   max: 500  },
  sets:            { label: "Sätze",        icon: "📊",  type: "number", min: 1,   max: 20   },
  distance:        { label: "Distanz (km)", icon: "📏",  type: "number", min: 0.1, max: 200  },
  tasksCompleted:  { label: "Aufgaben",     icon: "✅",  type: "number", min: 0,   max: 100  },
  understanding:   { label: "Verständnis",  icon: "🧠",  type: "range",  min: 1,   max: 5    },
  mood:            { label: "Stimmung",     icon: "😊",  type: "range",  min: 1,   max: 5    },
  energy:          { label: "Energie",      icon: "⚡",  type: "range",  min: 1,   max: 5    },
  stress:          { label: "Stress",       icon: "🌊",  type: "range",  min: 1,   max: 5    },
  sleepQuality:    { label: "Schlaf",       icon: "😴",  type: "range",  min: 1,   max: 5    },
  progressPercent: { label: "Fortschritt%", icon: "📈",  type: "number", min: 0,   max: 100  },
};

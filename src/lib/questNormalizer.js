// ============================================================
// QUEST NORMALIZER
// Normalisiert Quests aus verschiedenen Quellen auf ein
// einheitliches Datenmodell.
// Alte Felder (cat, stat/statPts) werden beibehalten (Kompatibilität)
// und um neue Felder (domain, stats, actionType) ergänzt.
// ============================================================
import { catToDomain } from "../data/domains.js";

/**
 * Einheitliches normalisiertes Quest-Objekt.
 *
 * type:       daily | weekly | milestone | gate | recovery | custom | personalized
 * actionType: action | reflection | metric | project | gate_step | recovery
 * domain:     body | mind | craft | creativity | social | appearance |
 *             discipline | career | finance | home | recovery | adventure
 */

const ACTION_TYPE_MAP = {
  daily:       "action",
  weekly:      "action",
  milestone:   "action",   // Milestones sind Selbsttests
  gate:        "gate_step",
  recovery:    "recovery",
  custom:      "action",
  personalized:"action",
};

/**
 * Normalisiert ein einzelnes Quest/Challenge-Objekt.
 * Bestehende Felder werden nie überschrieben — nur fehlende ergänzt.
 *
 * @param {object} quest  - Rohes Quest-Objekt (aus challenges.js, Gates, Recovery etc.)
 * @returns {object}      - Normalisiertes Quest-Objekt
 */
export function normalizeQuest(quest) {
  if (!quest || typeof quest !== "object") return quest;

  const q = { ...quest };

  // ── domain: aus cat ableiten wenn nicht vorhanden ──
  if (!q.domain) {
    q.domain = catToDomain(q.cat) || "discipline";
  }

  // ── actionType ableiten ──
  if (!q.actionType) {
    if (q.recovery) {
      q.actionType = "recovery";
    } else if (q.type === "milestone") {
      q.actionType = "action"; // Milestones sind Selbsttests/Aktionen
    } else {
      q.actionType = ACTION_TYPE_MAP[q.type] || "action";
    }
  }

  // ── stats-Objekt aus altem stat/statPts normalisieren ──
  // Altes Format: stat: "STR", statPts: 5
  // Neues Format: stats: { STR: 5 }
  // Beide Formate werden beibehalten (Backward-Compat).
  if (!q.stats && q.stat && q.statPts > 0) {
    const key = q.subStat || q.stat;
    q.stats = { [key]: q.statPts };
  } else if (!q.stats) {
    q.stats = {};
  }

  // ── Sicherstellen dass Pflichtfelder vorhanden sind ──
  if (!q.id)          q.id          = `quest_${Math.random().toString(36).slice(2)}`;
  if (!q.title)       q.title       = "Quest";
  if (q.xp == null)   q.xp          = 20;
  if (!q.type)        q.type        = "daily";
  if (q.source == null) q.source = q.personalized ? "generated" : "db";

  // ── Optionale Felder mit Defaults ──
  if (q.difficulty  == null) q.difficulty  = "normal";
  if (q.repeatable  == null) q.repeatable  = q.type === "daily" || q.type === "weekly";
  if (q.personalized == null) q.personalized = false;
  if (q.recommended  == null) q.recommended  = false;

  return q;
}

/**
 * Normalisiert ein Array von Quests.
 */
export function normalizeQuests(quests) {
  if (!Array.isArray(quests)) return [];
  return quests.map(normalizeQuest);
}

/**
 * Erstellt einen normalisierten Quest-History-Eintrag.
 * Ersetzt makeHistoryEntry() aus migration.js (bleibt dort als Alias erhalten).
 *
 * @param {object} quest  - Normalisiertes Quest-Objekt
 * @returns {object}      - History-Eintrag
 */
export function makeNormalizedHistoryEntry(quest) {
  const q = normalizeQuest(quest);
  return {
    id:          q.id,
    title:       q.title,
    completedAt: new Date().toISOString(),
    type:        q.type        || "daily",
    actionType:  q.actionType  || "action",
    domain:      q.domain      || null,
    cat:         q.cat         || null,   // Legacy-Compat
    path:        q.path        || null,
    topic:       q.topic       || null,
    interestId:  q.interestId  || null,
    goalId:      q.goalId      || null,
    xp:          q.xp          || 0,
    stats:       q.stats       || {},
    source:      q.source      || "db",
  };
}

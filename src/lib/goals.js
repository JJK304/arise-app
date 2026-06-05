// ============================================================
// GOALS — Ziel-System Logik
// Erstellen, Fortschritt tracken, Abschließen, Belohnungen.
// Anti-Exploit: Reward nur einmal pro Goal (rewardClaimed-Flag).
// ============================================================
import { GOAL_TEMPLATES, GOAL_TEMPLATE_MAP } from "../data/goalTypes.js";
import { getDayKey } from "./dates.js";

// ── Goal-Erstellung ────────────────────────────────────────

let _goalCounter = 0;

/**
 * Erstellt ein neues Goal-Objekt aus einem Template oder Custom.
 */
export function createGoal({
  templateId = "custom_goal",
  title,
  domain,
  path,
  interestId,
  topic,
  targetType,
  targetValue,
  unit,
  deadline,
  linkedTags = [],
  linkedQuestIds = [],
}) {
  const template = GOAL_TEMPLATE_MAP[templateId] || GOAL_TEMPLATE_MAP["custom_goal"];
  const id = `goal_${Date.now()}_${++_goalCounter}`;

  return {
    id,
    templateId,
    title:          title        || template.exampleTitle,
    icon:           template.icon || "⭐",
    domain:         domain       || template.domain       || "discipline",
    path:           path         || template.path         || null,
    interestId:     interestId   || null,
    topic:          topic        || null,
    targetType:     targetType   || template.targetType   || "milestones",
    targetValue:    Number(targetValue)  || template.targetValue || 10,
    currentValue:   0,
    unit:           unit         || template.unit         || "Schritte",
    deadline:       deadline     || null,
    status:         "active",      // active | completed | paused | abandoned
    createdAt:      new Date().toISOString(),
    completedAt:    null,
    linkedQuestIds: linkedQuestIds,
    linkedTags:     linkedTags.length ? linkedTags : (template.linkedTags || []),
    rewardClaimed:  false,
    // Reward-Definition aus Template
    rewardXp:       template.rewardXp       || 400,
    rewardAffinity: template.rewardAffinity || {},
  };
}

// ── Progress ───────────────────────────────────────────────

/**
 * Berechnet ob eine Quest zu einem Goal passt.
 * Matching über: goalId, domain, path, interestId, topic, tags.
 */
export function questMatchesGoal(quest, goal) {
  if (!quest || !goal) return false;
  if (goal.status !== "active") return false;

  // Direktes goalId-Match (höchste Priorität)
  if (quest.goalId && quest.goalId === goal.id) return true;

  // Domain-Match
  if (quest.domain && goal.domain && quest.domain === goal.domain) return true;

  // Path-Match
  if (quest.path && goal.path && quest.path === goal.path) return true;

  // Interest-Match
  if (quest.interestId && goal.interestId && quest.interestId === goal.interestId) return true;

  // Topic-Match
  if (quest.topic && goal.topic && quest.topic === goal.topic) return true;

  // Tag-Match
  const questTags  = quest.tags  || [];
  const goalTags   = goal.linkedTags || [];
  if (questTags.length > 0 && goalTags.length > 0) {
    if (questTags.some(t => goalTags.includes(t))) return true;
  }

  return false;
}

/**
 * Erhöht den Fortschritt eines Goals nach einem Quest-Abschluss.
 * Gibt das aktualisierte Goal-Objekt zurück (immutable).
 * Gibt null zurück wenn keine Änderung.
 */
export function applyQuestToGoal(goal, quest) {
  if (!questMatchesGoal(quest, goal)) return null;
  if (goal.status !== "active") return null;

  const newValue = Math.min(goal.currentValue + 1, goal.targetValue);
  const completed = newValue >= goal.targetValue;

  return {
    ...goal,
    currentValue: newValue,
    status:       completed ? "completed" : "active",
    completedAt:  completed ? new Date().toISOString() : null,
  };
}

/**
 * Wendet einen Quest-Abschluss auf alle aktiven Goals im State an.
 * Gibt ein neues Goals-Array zurück.
 */
export function applyQuestToAllGoals(goals, quest) {
  if (!Array.isArray(goals)) return [];
  return goals.map(goal => applyQuestToGoal(goal, quest) || goal);
}

/**
 * Gibt die IDs der Goals zurück, die durch den Quest vervollständigt wurden.
 */
export function getNewlyCompletedGoals(oldGoals, newGoals) {
  if (!Array.isArray(oldGoals) || !Array.isArray(newGoals)) return [];
  return newGoals.filter((newG, i) => {
    const oldG = oldGoals[i];
    return oldG && oldG.status !== "completed" && newG.status === "completed";
  });
}

// ── Reward ─────────────────────────────────────────────────

/**
 * Prüft ob ein Goal-Reward beansprucht werden kann.
 */
export function canClaimGoalReward(goal, completionStatus) {
  if (!goal) return false;
  if (goal.status !== "completed") return false;
  if (goal.rewardClaimed) return false;
  // Auch in completionStatus prüfen (doppelter Schutz)
  return !completionStatus?.goals?.[goal.id]?.rewardClaimed;
}

/**
 * Berechnet den XP-Bonus für ein abgeschlossenes Goal.
 * Skaliert leicht nach targetValue.
 */
export function calculateGoalReward(goal) {
  const base = goal.rewardXp || 400;
  // Skalierung: größere Goals geben proportional etwas mehr
  const scale = Math.min(1 + (goal.targetValue || 10) / 50, 1.5);
  return Math.round(base * scale);
}

/**
 * Markiert ein Goal als "Reward beansprucht" (immutable).
 */
export function markGoalRewardClaimed(goal) {
  return { ...goal, rewardClaimed: true };
}

// ── UI-Helpers ─────────────────────────────────────────────

/**
 * Fortschritt in Prozent (0–100).
 */
export function goalProgressPct(goal) {
  if (!goal || goal.targetValue <= 0) return 0;
  return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
}

/**
 * Status-Label für UI.
 */
export function goalStatusLabel(goal) {
  if (!goal) return "";
  const pct = goalProgressPct(goal);
  if (goal.status === "completed") return "✅ Abgeschlossen";
  if (goal.status === "paused")    return "⏸ Pausiert";
  if (goal.status === "abandoned") return "✗ Aufgegeben";
  if (pct >= 75) return "🔥 Fast da";
  if (pct >= 40) return "📈 Auf Kurs";
  if (pct >= 1)  return "🌱 In Arbeit";
  return "○ Noch nicht begonnen";
}

/**
 * Gibt die aktiven Goals zurück, sortiert nach Fortschritt (absteigend).
 */
export function getActiveGoals(goals) {
  return (goals || [])
    .filter(g => g.status === "active")
    .sort((a, b) => goalProgressPct(b) - goalProgressPct(a));
}

/**
 * Gibt die zu einem Quest passenden aktiven Goals zurück.
 */
export function getMatchingGoals(quest, goals) {
  return (goals || []).filter(g => g.status === "active" && questMatchesGoal(quest, g));
}

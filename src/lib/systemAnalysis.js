// ============================================================
// SYSTEM ANALYSIS — Prompt 15 + Etappe 4 (Signal-System integriert)
// Analysiert Verhalten, Goals, Preferences, Affinities und
// Weekly Reviews lokal. Keine externe API.
// Berücksichtigt: History, Goals, Affinities, Preferences,
//   Balance Areas, Inaktivität, Rank-Phase, Weekly Reviews.
// ============================================================

import { getTopSignalPaths, derivePathAffinityFromProgress, getSignalSummary, calculatePathSignal, getSignalBreakdown } from "./signals.js";


const NEGLECT_THRESHOLD_DAYS = 5;
const MIN_HISTORY = 5;

// Domain → primärer Pfad
const DOMAIN_TO_PATH = {
  body:            "fighter",
  mind:            "scholar",
  craft:           "engineer",
  creativity:      "artisan",
  social:          "charmer",
  appearance:      "charmer",
  discipline:      "strategist",
  career:          "merchant",
  finance:         "merchant",
  home:            "guardian",
  recovery:        "monk",
  adventure:       "explorer",
  leadership:      "leader",
  service:         "healer",
  spirituality:    "monk",
  // Legacy
  strength:        "fighter",
  cardio:          "runner",
  uni:             "scholar",
  skill_tech:      "engineer",
  skill_practical: "engineer",
  skill_creative:  "artisan",
  health:          "monk",
  legacy:          "explorer",
};

const BALANCE_DOMAINS = [
  "recovery","social","body","discipline","creativity","mind","home","finance","adventure",
];

const PATH_QUEST_TYPE = {
  scholar:    "deep_work",
  engineer:   "project",
  fighter:    "training",
  runner:     "cardio",
  artisan:    "creative",
  charmer:    "social",
  strategist: "planning",
  guardian:   "home",
  merchant:   "finance",
  creator:    "creative",
  monk:       "recovery",
  explorer:   "adventure",
  leader:     "social",
  healer:     "recovery",
};

// Rank-Phasen für Empfehlungen
const RANK_PHASE = {
  E: "beginner", D: "beginner", C: "intermediate",
  B: "intermediate", A: "advanced", S: "advanced",
  SS: "elite", SSS: "elite",
};

// ── Hilfsfunktionen ────────────────────────────────────────

function daysSinceLastDomain(history, domain) {
  const entry = [...history].reverse().find(e =>
    e.domain === domain || e.cat === domain
  );
  if (!entry?.completedAt) return Infinity;
  return Math.floor((Date.now() - new Date(entry.completedAt)) / 86400000);
}

function countByPath(history) {
  const counts = {
    fighter:0, runner:0, scholar:0, engineer:0,
    artisan:0, charmer:0, strategist:0, guardian:0,
    merchant:0, creator:0, monk:0, explorer:0,
    leader:0, healer:0,
  };
  for (const e of history) {
    const pathId = e.path || DOMAIN_TO_PATH[e.domain] || DOMAIN_TO_PATH[e.cat];
    if (pathId && pathId !== "shadow" && pathId in counts) counts[pathId]++;
  }
  return counts;
}

function countByDomain(history) {
  const counts = {};
  for (const e of history) {
    const d = e.domain || e.cat;
    if (d) counts[d] = (counts[d] || 0) + 1;
  }
  return counts;
}

function extractInterestCounts(history) {
  const counts = {};
  for (const e of history) {
    if (e.interestId) counts[e.interestId] = (counts[e.interestId] || 0) + 1;
  }
  return counts;
}

// ── Main Export ────────────────────────────────────────────

/**
 * Vollständige Systemanalyse aus State-Daten.
 *
 * @param {object[]} questHistory   - state.questHistory
 * @param {object}   affinities     - state.player.affinities
 * @param {object}   preferences    - state.player.preferences
 * @param {object}   [context]      - { goals, weeklyReviews, rank, level, currentStreak, gateProgress }
 * @returns {object} Vollständiges Analyse-Ergebnis
 */
export function analyzeSystem(
  questHistory = [],
  affinities = {},
  preferences = {},
  context = {}
) {
  const {
    goals         = [],
    weeklyReviews = [],
    rank          = "E",
    level         = 1,
    currentStreak = 0,
    gateProgress  = {},
  } = context;

  // Reconstruct full state object for signal system
  const state_obj = {
    questHistory,
    progressLogs: context.progressLogs || [],
    goals,
    player: { affinities, preferences },
    stats:  context.stats || {},
    gateProgress,
    weeklyReviews,
  };

  const result = {
    hasData:               false,
    dominantPaths:         [],
    dominantDomains:       [],
    dominantInterests:     [],
    suggestedMainPath:     null,
    suggestedSecondaryPath: null,
    neglectedDomains:      [],
    activeGoalFocus:       null,
    recommendedQuestTypes: [],
    recommendedTopics:     [],
    suggestedGates:        [],
    nextBestQuestReason:   null,
    balanceWarning:        null,
    balanceHints:          [],
    pathCounts:            {},
    systemMessage:         null,
    suggestedMessage:      null,
    rankPhase:             RANK_PHASE[rank] || "beginner",
  };

  // ── Insuffiziente Daten ──
  if (!questHistory || questHistory.length < MIN_HISTORY) {
    result.suggestedMessage = "Noch nicht genug Daten. Schließe weitere Quests ab, damit dein System deinen Pfad erkennt.";
    result.systemMessage    = result.suggestedMessage;
    return result;
  }

  result.hasData = true;

  // ── 1. Path-Zählung (History + Affinities) ──
  const pathCounts = countByPath(questHistory);
  result.pathCounts = pathCounts;

  const combinedScores = {};
  for (const [pathId, cnt] of Object.entries(pathCounts)) {
    const affScore = (affinities[pathId] || 0) / 5;
    combinedScores[pathId] = cnt + affScore;
  }
  const sortedPaths = Object.entries(combinedScores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  result.dominantPaths        = sortedPaths.slice(0, 3).map(([k]) => k);
  result.suggestedMainPath    = sortedPaths[0]?.[0] || null;
  result.suggestedSecondaryPath = sortedPaths[1]?.[0] || null;

  // ── 2. Domain-Analyse ──
  const domainCounts = countByDomain(questHistory);
  result.dominantDomains = Object.entries(domainCounts)
    .sort(([, a], [, b]) => b - a).slice(0, 4).map(([k]) => k);

  // ── 3. Interest-Analyse ──
  const interestCounts = extractInterestCounts(questHistory);
  result.dominantInterests = Object.entries(interestCounts)
    .sort(([, a], [, b]) => b - a).slice(0, 3).map(([k]) => k);

  // ── 4. Vernachlässigte Domains ──
  const balanceAreas = preferences?.balanceAreas || BALANCE_DOMAINS;
  const neglected = [];
  for (const domain of balanceAreas) {
    const days = daysSinceLastDomain(questHistory, domain);
    if (days >= NEGLECT_THRESHOLD_DAYS) {
      neglected.push({ domain, daysSince: days === Infinity ? null : days });
    }
  }
  result.neglectedDomains = neglected;

  // ── 5. Balance-Hinweise ──
  const domainHints = {
    recovery:   { text: "Recovery vernachlässigt",    icon: "💚" },
    social:     { text: "Soziales vernachlässigt",     icon: "🤝" },
    body:       { text: "Körper vernachlässigt",       icon: "⚡" },
    creativity: { text: "Kreativität vernachlässigt",  icon: "🎨" },
    mind:       { text: "Lernen vernachlässigt",       icon: "🧠" },
    home:       { text: "Haushalt vernachlässigt",     icon: "🏠" },
    finance:    { text: "Finanzen vernachlässigt",     icon: "💰" },
    adventure:  { text: "Abenteuer vernachlässigt",    icon: "🌍" },
    discipline: { text: "Disziplin vernachlässigt",   icon: "🛡️" },
  };
  const hints = [];
  for (const { domain } of neglected.slice(0, 3)) {
    const h = domainHints[domain];
    if (h) hints.push({ type: domain, ...h });
  }
  result.balanceHints = hints;

  if (neglected.length >= 3) {
    result.balanceWarning = `${neglected.length} Bereiche seit 5+ Tagen inaktiv.`;
  }

  // ── 6. Goal-Fokus ──
  const activeGoals = goals.filter(g => g.status === "active");
  if (activeGoals.length > 0) {
    // Aktives Ziel mit höchstem Fortschritt
    const topGoal = [...activeGoals].sort((a, b) =>
      (b.currentValue / b.targetValue) - (a.currentValue / a.targetValue)
    )[0];
    result.activeGoalFocus = {
      id:      topGoal.id,
      title:   topGoal.title,
      domain:  topGoal.domain,
      path:    topGoal.path,
      pct:     Math.round((topGoal.currentValue / topGoal.targetValue) * 100),
      icon:    topGoal.icon,
    };
  }

  // ── 7. Empfohlene Quest-Typen ──
  const recommended = [];
  if (neglected.some(n => n.domain === "recovery")) recommended.push("recovery");
  if (result.suggestedMainPath) {
    const qt = PATH_QUEST_TYPE[result.suggestedMainPath];
    if (qt) recommended.push(qt);
  }
  if (result.activeGoalFocus?.domain) recommended.push(result.activeGoalFocus.domain);
  result.recommendedQuestTypes = [...new Set(recommended)];

  // ── 8. Empfohlene Topics (aus Interests + Goals) ──
  const topics = [];
  const prefInterests = preferences?.interests || [];
  if (prefInterests.length > 0) topics.push(...prefInterests.slice(0, 3));
  if (result.activeGoalFocus?.path) {
    const pathTopic = result.activeGoalFocus.path;
    if (!topics.includes(pathTopic)) topics.push(pathTopic);
  }
  result.recommendedTopics = topics.slice(0, 4);

  // ── 9. Weekly Reviews analysieren ──
  if (weeklyReviews.length >= 2) {
    const recent = weeklyReviews.slice(-4);
    const avgXp = recent.reduce((s, r) => s + (r.xpThisWeek || 0), 0) / recent.length;
    const lastXp = recent[recent.length - 1]?.xpThisWeek || 0;
    if (lastXp < avgXp * 0.5 && avgXp > 50) {
      result.balanceWarning = result.balanceWarning ||
        "Letzte Woche unter Durchschnitt — Recovery oder Fokus-Shift empfohlen.";
    }
  }

  // ── 10. Rank-Phase spezifische Hinweise ──
  const phase = result.rankPhase;
  if (phase === "beginner") {
    if (currentStreak < 3) {
      result.nextBestQuestReason = "Starte mit einem kleinen Daily-Quest um einen Streak aufzubauen.";
    }
  } else if (phase === "intermediate") {
    if (result.activeGoalFocus) {
      result.nextBestQuestReason = `Aktives Ziel: ${result.activeGoalFocus.title}. Empfohlen: ${result.activeGoalFocus.domain}-Quest.`;
    }
  } else if (phase === "advanced" || phase === "elite") {
    const completedGates = Object.values(gateProgress).filter(g => g.completed).length;
    if (completedGates < 3) {
      result.nextBestQuestReason = "Gates abschließen für langfristige Progression.";
    }
  }

  // ── 11. Zusammenfassende Nachricht ──
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  if (result.suggestedMainPath) {
    const mainName = PATHS_LABELS[result.suggestedMainPath] || cap(result.suggestedMainPath);
    const secName  = result.suggestedSecondaryPath
      ? PATHS_LABELS[result.suggestedSecondaryPath] || cap(result.suggestedSecondaryPath)
      : null;

    result.suggestedMessage = secName
      ? `Dein System erkennt eine ${mainName}/${secName}-Spezialisierung.`
      : `Dein System erkennt eine starke ${mainName}-Tendenz.`;

    // Goal-Fokus ergänzen
    if (result.activeGoalFocus) {
      result.suggestedMessage += ` Aktives Ziel: ${result.activeGoalFocus.title} (${result.activeGoalFocus.pct}%).`;
    }

    result.systemMessage = result.suggestedMessage;

    if (neglected.length > 0) {
      const domains = neglected.slice(0, 2)
        .map(n => domainHints[n.domain]?.icon || "⚠️" + " " + n.domain)
        .join(" · ");
      result.systemMessage += ` Vernachlässigt: ${domains}.`;
    }
  }

  // ── Signal-System integrieren ──
  try {
    const signalSummary = getSignalSummary(state_obj);
    result.signalSummary    = signalSummary;
    result.topSignalPaths   = signalSummary.topPaths;
    result.signalStatus     = signalSummary.statusMessage;

    // Signal-basierte Path-Empfehlung überschreibt History-basierte wenn stärker
    if (signalSummary.dominantPath && signalSummary.dominantPath.level >= 2) {
      // Etappe 5 — Hysterese: Ein vom Nutzer gewählter Main Path wird nicht
      // aggressiv überschrieben. Ein anderer Path wird nur empfohlen, wenn
      // sein Signal das des gewählten Paths um >= 25% übertrifft. Sonst
      // bleibt der gewählte Path Main-Empfehlung, der wachsende Path wird
      // Secondary (neue Richtungen können trotzdem jederzeit wachsen).
      const chosenMain = (preferences?.activePaths || [])[0] || null;
      const dominant   = signalSummary.dominantPath;
      let mainPick     = dominant.pathId;
      let secondaryPick = signalSummary.topPaths[1]?.level >= 1
        ? signalSummary.topPaths[1].pathId : null;

      if (chosenMain && chosenMain !== dominant.pathId) {
        const chosenSignal = calculatePathSignal(state_obj, chosenMain);
        if (dominant.score < chosenSignal * 1.25) {
          mainPick      = chosenMain;
          secondaryPick = dominant.pathId;
        }
      }

      result.suggestedMainPath = mainPick;
      if (secondaryPick && secondaryPick !== mainPick) {
        result.suggestedSecondaryPath = secondaryPick;
      }
      // Update message with signal reason
      const mainName = PATHS_LABELS[result.suggestedMainPath] || result.suggestedMainPath;
      const reason   = mainPick === dominant.pathId
        ? signalSummary.dominantPath.reason
        : `Dein gewählter Pfad bleibt führend — ${PATHS_LABELS[dominant.pathId] || dominant.pathId} wächst als zweite Richtung`;
      result.suggestedMessage = `Signal erkannt: ${mainName}. ${reason}.`;
      result.systemMessage    = result.suggestedMessage;
    }

    // Etappe 6: Erklärbarkeit — Breakdown des dominanten Pfads für die UI
    if (signalSummary.dominantPath) {
      result.dominantBreakdown = getSignalBreakdown(state_obj, "path", signalSummary.dominantPath.pathId);
      result.dominantBreakdown.pathId = signalSummary.dominantPath.pathId;
    }
  } catch(_) {
    // Signal system non-critical — fail silently
  }

  return result;
}

// Pfad-Labels für lesbare Messages
const PATHS_LABELS = {
  fighter: "Fighter", runner: "Runner", scholar: "Scholar", engineer: "Engineer",
  artisan: "Artisan", charmer: "Charmer", strategist: "Strategist", guardian: "Guardian",
  merchant: "Merchant", creator: "Creator", monk: "Monk", explorer: "Explorer",
  leader: "Leader", healer: "Healer",
  shadow: "Shadow Ascendant",
};

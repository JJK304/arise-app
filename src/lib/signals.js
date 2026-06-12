// ============================================================
// SIGNAL SYSTEM v2 — Etappe 4 (Gleichwertige Paths)
// Spezialisierung entsteht nur durch echte Signale.
// Kein Thema wird defaultmäßig bevorzugt.
//
// Signal-Quellen (gewichtet):
//   1. Quest-History (Verhalten zählt am stärksten)
//      — mit temporalem Decay (recent > older)
//   2. Progress Logs zu einem Thema
//   3. Aktive Goals mit passendem Thema
//   4. Abgeschlossene Gates / Trials
//   5. Stats-Wachstum in passender Richtung
//   6. Explizit gewählte Interessen (beschleunigt, überschreibt nicht)
//   7. Wiederholung über Zeit (Consistency Bonus)
//
// Signal-Level:
//   0     → Kein Signal. Thema ist neutrale Option.
//   1–2   → Schwaches Signal. Gelegentlich leichte Quests.
//   3–5   → Aktive Spezialisierung. Spezifischere Quests.
//   6+    → Starkes Signal. Gates, Trials, Milestones verfügbar.
//
// Alle 14 spielbaren Paths sind gleichwertig behandelt.
// ============================================================

import { INTERESTS } from "../data/interests.js";
import { PATHS }     from "../data/paths.js";

// ── Domain → Paths (vollständig, alle neuen Domains) ───────
const DOMAIN_PATH_MAP = {
  body:           ["fighter", "runner"],
  mind:           ["scholar", "strategist"],
  craft:          ["engineer", "artisan"],
  creativity:     ["artisan", "creator"],
  social:         ["charmer", "leader"],
  appearance:     ["charmer"],
  discipline:     ["strategist", "guardian"],
  career:         ["merchant", "strategist"],
  finance:        ["merchant"],
  home:           ["guardian", "healer"],
  recovery:       ["monk", "healer"],
  adventure:      ["explorer"],
  leadership:     ["leader"],
  service:        ["healer", "leader"],
  // Legacy cats
  strength:       ["fighter"],
  cardio:         ["runner"],
  uni:            ["scholar"],
  skill_tech:     ["engineer"],
  skill_practical:["engineer", "artisan"],
  skill_creative: ["artisan", "creator"],
  health:         ["monk", "healer"],
};

// ── Weight constants — Verhalten > alles andere ─────────────
const W_BEHAVIOR_FRESH  = 3.5;  // Quest < 7 Tage alt
const W_BEHAVIOR_MID    = 2.0;  // Quest 7–14 Tage alt
const W_BEHAVIOR_OLD    = 1.0;  // Quest 15–21 Tage alt
const W_LOG             = 2.5;  // Progress log
const W_GOAL            = 2.0;  // Aktives Ziel im Bereich
const W_GOAL_DONE       = 3.0;  // Abgeschlossenes Ziel
const W_GATE            = 2.5;  // Gate abgeschlossen
const W_INTEREST        = 1.5;  // Explizites Interesse (nur Booster)
const W_STAT            = 1.0;  // Stat-Punkte
const W_CONSISTENCY     = 1.5;  // Konsistenz über mehrere Tage
const W_REVIEW          = 1.0;  // Weekly Review mit passender Top-Domain

const RECENT_DAYS       = 21;   // Lookback-Fenster

// ── Helpers ─────────────────────────────────────────────────

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

// Temporaler Decay: jüngere Aktivität zählt mehr
function behaviorWeight(completedAt) {
  const age = daysSince(completedAt);
  if (age <= 7)  return W_BEHAVIOR_FRESH;
  if (age <= 14) return W_BEHAVIOR_MID;
  if (age <= 21) return W_BEHAVIOR_OLD;
  return 0;
}

// Etappe 5: Milestones/Weeklies sind stärkere Signale als Dailies
function typeWeight(h) {
  if (h?.type === "milestone") return 1.5;
  if (h?.type === "weekly")    return 1.2;
  return 1;
}

function recentHistory(questHistory, days = RECENT_DAYS) {
  const cutoff = Date.now() - days * 86400000;
  return (questHistory || []).filter(h =>
    h.completedAt && new Date(h.completedAt) >= cutoff
  );
}

// Anzahl unterschiedlicher Tage mit Aktivität (Konsistenz)
function activeDaySpread(entries) {
  const days = new Set(entries.map(e => {
    const d = new Date(e.completedAt || 0);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  return days.size;
}

// Exakter Domain/Cat-Abgleich (kein String-includes Bug)
function questMatchesDomain(h, domain) {
  return h.domain === domain || h.cat === domain;
}

function questMatchesPath(h, pathId) {
  return h.path === pathId;
}

// ═══════════════════════════════════════════════════════════
// calculateInterestSignal
// Numerischer Signal-Score für ein bestimmtes Interesse.
// ═══════════════════════════════════════════════════════════
export function calculateInterestSignal(state, interestId) {
  const {
    questHistory  = [],
    progressLogs  = [],
    goals         = [],
    player        = {},
    stats         = {},
    gateProgress  = {},
    weeklyReviews = [],
  } = state;

  const interest = INTERESTS[interestId];
  if (!interest) return 0;

  const prefs       = player?.preferences || {};
  const interestIds = prefs.interests || [];
  const affinities  = player?.affinities || {};
  const relatedPaths = interest.relatedPaths || [];

  let score = 0;

  // 1. Quest History — mit temporalem Decay.
  // Etappe 5: gestufte Matches — direkter interestId-Match zählt voll,
  // Path-Match 50%, Domain/Cat-Match nur 30%. Vorher boostete JEDE
  // Domain-Quest ALLE Interessen der Domain gleich stark (z. B. eine
  // generische Mind-Quest alle 20 Lern-Interessen) — das verhinderte
  // echte Differenzierung zwischen Interessen.
  const recent = recentHistory(questHistory);
  const matchWeight = (h) => {
    if (h.interestId === interestId) return 1.0;
    if (relatedPaths.length > 0 && relatedPaths.some(p => questMatchesPath(h, p))) return 0.5;
    if (h.domain === interest.domain || h.cat === interest.domain) return 0.3;
    return 0;
  };
  const matchingQuests = recent.filter(h => matchWeight(h) > 0);

  if (matchingQuests.length > 0) {
    // Gewichtete Summe mit Decay, Match-Stufe und Quest-Typ
    const weightedSum = matchingQuests.reduce((s, h) =>
      s + behaviorWeight(h.completedAt) * matchWeight(h) * typeWeight(h), 0
    );
    score += Math.min(weightedSum, 15);

    // Konsistenz-Bonus nur bei direkter/Path-Aktivität (kein Domain-Streu-Bonus)
    const focused = matchingQuests.filter(h => matchWeight(h) >= 0.5);
    const spread = activeDaySpread(focused.length > 0 ? focused : matchingQuests);
    if (spread >= 3) score += W_CONSISTENCY;
    if (spread >= 7) score += W_CONSISTENCY * 1.5;
  }

  // 2. Progress Logs (direkt voll, Domain/Path halb)
  const logScore = (progressLogs || []).reduce((s, l) => {
    if (l.interestId === interestId) return s + W_LOG;
    if (l.domain === interest.domain || relatedPaths.some(p => l.path === p)) return s + W_LOG * 0.5;
    return s;
  }, 0);
  score += Math.min(logScore, 10);

  // 3. Goals (direkt voll, Domain/Path halb)
  const goalWeightFn = (g) => {
    if (g.interestId === interestId) return 1;
    if (g.domain === interest.domain || relatedPaths.some(p => g.path === p)) return 0.5;
    return 0;
  };
  for (const g of goals || []) {
    const w = goalWeightFn(g);
    if (w === 0) continue;
    if (g.status === "active")    score += W_GOAL * w;
    if (g.status === "completed") score += W_GOAL_DONE * w;
  }

  // 4. Explizites Interesse (Booster, kein Hauptsignal —
  //    Verhalten zählt stärker als manuelle Auswahl)
  if (interestIds.includes(interestId)) score += W_INTEREST;

  // 5. Verwandte Path-Affinity
  const maxAff = relatedPaths.length > 0
    ? Math.max(...relatedPaths.map(p => affinities[p] || 0), 0)
    : 0;
  score += Math.min(maxAff / 10, W_STAT);

  // 6. Gates abgeschlossen (für verwandte Paths)
  const completedGates = Object.entries(gateProgress || {}).filter(([, g]) => g?.completed);
  for (const [gateId] of completedGates) {
    if (relatedPaths.some(p => gateId.includes(p))) score += W_GATE * 0.4;
  }

  // 7. Weekly Reviews (Etappe 5): Domain unter Top-Domains der Review
  const recentReviews = (weeklyReviews || []).slice(-4);
  for (const r of recentReviews) {
    const tops = (r?.topDomains || []).map(t => (typeof t === "string" ? t : t?.domain));
    if (tops.includes(interest.domain)) score += W_REVIEW;
  }

  return Math.round(score * 10) / 10;
}

// ═══════════════════════════════════════════════════════════
// calculatePathSignal
// Numerischer Signal-Score für einen bestimmten Path.
// Alle 14 Paths gleichwertig behandelt.
// ═══════════════════════════════════════════════════════════
export function calculatePathSignal(state, pathId) {
  const {
    questHistory  = [],
    progressLogs  = [],
    goals         = [],
    player        = {},
    stats         = {},
    gateProgress  = {},
    weeklyReviews = [],
  } = state;

  const path = PATHS[pathId];
  if (!path || path.special) return 0;

  const prefs      = player?.preferences || {};
  const interests  = prefs.interests || [];
  const affinities = player?.affinities || {};

  let score = 0;

  const pathDomains = path.domains || [];
  const pathCats    = path.cats    || [];

  // 1. Quest History — mit temporalem Decay
  const recent = recentHistory(questHistory);
  // Distinguish: direct path match (full weight) vs domain match.
  // Etappe 3: Primär-Domain (Index 0) zählt 60%, Sekundär-Domains 20%,
  // Cat-Match 50% — schärft die Abgrenzung überlappender Pfade.
  const primaryDomain = pathDomains[0] || null;
  const directQuests = recent.filter(h => questMatchesPath(h, pathId));
  const domainQuests = recent.filter(h =>
    !questMatchesPath(h, pathId) && (
      pathDomains.some(d => questMatchesDomain(h, d)) ||
      pathCats.some(c => h.cat === c || h.domain === c)
    )
  );
  const matchingQuests = [...directQuests, ...domainQuests];

  if (matchingQuests.length > 0) {
    const directSum = directQuests.reduce((s, h) => s + behaviorWeight(h.completedAt) * typeWeight(h), 0);
    const domainSum = domainQuests.reduce((s, h) => {
      let w = 0.2; // Sekundär-Domain
      if (primaryDomain && questMatchesDomain(h, primaryDomain)) w = 0.6;       // Primär-Domain
      else if (pathCats.some(c => h.cat === c || h.domain === c)) w = 0.5;      // Cat (Legacy)
      return s + behaviorWeight(h.completedAt) * w * typeWeight(h);
    }, 0);
    const weightedSum = directSum + domainSum;
    score += Math.min(weightedSum, 18);

    const spread = activeDaySpread(matchingQuests);
    if (spread >= 3) score += W_CONSISTENCY;
    if (spread >= 7) score += W_CONSISTENCY * 1.5;
    if (spread >= 14) score += W_CONSISTENCY * 0.5; // Langzeit-Bonus
  }

  // 2. Progress Logs (Primär-Domain voll, Sekundär halb)
  const logScore = (progressLogs || []).reduce((s, l) => {
    if (l.path === pathId) return s + W_LOG;
    if (primaryDomain && l.domain === primaryDomain) return s + W_LOG;
    if (pathDomains.slice(1).includes(l.domain)) return s + W_LOG * 0.5;
    return s;
  }, 0);
  score += Math.min(logScore, 12);

  // 3. Goals (Primär-Domain voll, Sekundär halb)
  const goalWeight = (g) => {
    if (g.path === pathId) return 1;
    if (primaryDomain && g.domain === primaryDomain) return 1;
    if (pathDomains.slice(1).includes(g.domain)) return 0.5;
    return 0;
  };
  for (const g of goals || []) {
    const w = goalWeight(g);
    if (w === 0) continue;
    if (g.status === "active")    score += W_GOAL * w;
    if (g.status === "completed") score += W_GOAL_DONE * w;
  }

  // 4. Interests die auf diesen Path zeigen (Booster)
  const matchingInterests = interests.filter(id => {
    const interest = INTERESTS[id];
    return interest?.relatedPaths?.includes(pathId);
  });
  // Etappe 14 (Szenario C): manuelle Auswahl ist nur ein einmaliger Booster —
  // egal wie viele passende Interessen gewählt sind, Path-Level entsteht
  // erst durch echte Aktivität (Quests, Logs, Goals, Gates).
  score += Math.min(matchingInterests.length * W_INTEREST, W_INTEREST);

  // 5. Bestehende Affinity (normalisiert)
  const aff = affinities[pathId] || 0;
  score += Math.min(aff / 8, W_STAT * 2);

  // 6. Abgeschlossene Gates (starkes Signal)
  const completedGates = Object.entries(gateProgress || {}).filter(([id, g]) =>
    g?.completed && id.includes(pathId)
  );
  score += completedGates.length * W_GATE;

  // 7. Relevante Stats gewachsen
  const pathStats = path.stats || [];
  const statSum   = pathStats.reduce((s, k) => s + (stats[k] || 0), 0);
  score += Math.min(statSum / 5, W_STAT * 2);

  // 8. Weekly Reviews (Etappe 5): Primär-Domain voll, Sekundär halb
  const recentReviews = (weeklyReviews || []).slice(-4);
  for (const r of recentReviews) {
    const tops = (r?.topDomains || []).map(t => (typeof t === "string" ? t : t?.domain));
    if (primaryDomain && tops.includes(primaryDomain)) score += W_REVIEW;
    else if (pathDomains.slice(1).some(d => tops.includes(d))) score += W_REVIEW * 0.5;
  }

  return Math.round(score * 10) / 10;
}

// ═══════════════════════════════════════════════════════════
// calculateSpecializationLevel
// 0 = kein Signal
// 1 = schwach (gelegentlich personalisierte Quests)
// 2 = aktiv (spezifische Quests generiert)
// 3 = stark (Gates, Trials, Milestones freigeschaltet)
// ═══════════════════════════════════════════════════════════
export function calculateSpecializationLevel(state, interestId) {
  const signal = calculateInterestSignal(state, interestId);
  if (signal >= 6)  return 3;  // stark — Gates/Trials/Milestones (Sprint: 6+ Signale)
  if (signal >= 3)  return 2;  // aktiv — Spezialisierung (3–5)
  if (signal >= 1)  return 1;  // schwach — gelegentliche leichte Quests (1–2)
  return 0;
}

// Path specialization level (gleiche Skala)
export function calculatePathSpecializationLevel(state, pathId) {
  const signal = calculatePathSignal(state, pathId);
  if (signal >= 15) return 3; // stark — Gates/Trials (ca. 4–5 fokussierte frische Quests)
  if (signal >= 8)  return 2; // aktiv — spezifische Quests (ca. 2–3 direkte Quests)
  if (signal >= 2)  return 1; // schwach — Aktivität nötig; Auswahl allein (1.5) reicht nicht
  return 0;                   // kein Signal
}

// ═══════════════════════════════════════════════════════════
// derivePathAffinityFromProgress
// Map { pathId: signalScore } für alle Paths.
// ═══════════════════════════════════════════════════════════
export function derivePathAffinityFromProgress(state) {
  const result = {};
  const pathIds = Object.keys(PATHS).filter(id => !PATHS[id].special);
  for (const pathId of pathIds) {
    result[pathId] = calculatePathSignal(state, pathId);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════
// getTopSignalPaths
// Paths sortiert nach Signal-Stärke, mit Level-Tags.
// ═══════════════════════════════════════════════════════════
export function getTopSignalPaths(state, topN = 5) {
  const scores = derivePathAffinityFromProgress(state);

  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([pathId, score]) => ({
      pathId,
      score,
      level: calculatePathSpecializationLevel(state, pathId),
      reason: buildPathSignalReason(state, pathId),
    }));
}

// ═══════════════════════════════════════════════════════════
// getTopSignalInterests
// Interests sortiert nach Signal-Stärke.
// ═══════════════════════════════════════════════════════════
export function getTopSignalInterests(state, topN = 6) {
  const interestIds = Object.keys(INTERESTS);
  return interestIds
    .map(id => ({ id, score: calculateInterestSignal(state, id) }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(e => ({
      interestId: e.id,
      score:      e.score,
      level:      calculateSpecializationLevel(state, e.id),
    }));
}

// ── Reason-Builder für UI ──────────────────────────────────
function buildPathSignalReason(state, pathId) {
  const {
    questHistory = [],
    progressLogs = [],
    goals        = [],
    player       = {},
    gateProgress = {},
  } = state;

  const path    = PATHS[pathId];
  const prefs   = player?.preferences || {};
  const domains = path?.domains || [];
  const recent  = recentHistory(questHistory);
  const reasons = [];

  // Verhalten
  const behaviorCount = recent.filter(h =>
    questMatchesPath(h, pathId) ||
    domains.some(d => questMatchesDomain(h, d))
  ).length;
  if (behaviorCount >= 5)
    reasons.push(`${behaviorCount} Quests in ${path?.name || pathId}`);
  else if (behaviorCount > 0)
    reasons.push(`${behaviorCount} passende Quest${behaviorCount > 1 ? "s" : ""}`);

  // Goals
  const goalCount = (goals || []).filter(g =>
    g.path === pathId || domains.some(d => g.domain === d)
  ).length;
  if (goalCount > 0)
    reasons.push(`${goalCount} Ziel${goalCount > 1 ? "e" : ""} in diesem Bereich`);

  // Interests
  const matchInts = (prefs.interests || []).filter(id => {
    const interest = INTERESTS[id];
    return interest?.relatedPaths?.includes(pathId);
  });
  if (matchInts.length > 0)
    reasons.push(`Interesse: ${matchInts.slice(0,2).map(id => INTERESTS[id]?.label || id).join(", ")}`);

  // Gates
  const gateCount = Object.entries(gateProgress || {}).filter(([id, g]) =>
    g?.completed && id.includes(pathId)
  ).length;
  if (gateCount > 0)
    reasons.push(`${gateCount} Gate${gateCount > 1 ? "s" : ""} abgeschlossen`);

  // Logs
  const logCount = (progressLogs || []).filter(l =>
    l.path === pathId || domains.some(d => l.domain === d)
  ).length;
  if (logCount >= 3)
    reasons.push(`${logCount} Progress Logs`);

  if (reasons.length === 0) return "Aktivität in verwandten Bereichen";
  return reasons.slice(0, 2).join(" · ");
}

// ═══════════════════════════════════════════════════════════
// getSignalSummary
// Vollständige Signal-Zusammenfassung für SystemAnalysisCard.
// ═══════════════════════════════════════════════════════════
export function getSignalSummary(state) {
  // Defensive guards
  const safeState = {
    questHistory: Array.isArray(state?.questHistory) ? state.questHistory : [],
    progressLogs: Array.isArray(state?.progressLogs) ? state.progressLogs : [],
    goals:        Array.isArray(state?.goals)        ? state.goals        : [],
    player:       state?.player  || {},
    stats:        state?.stats   || {},
    gateProgress: state?.gateProgress || {},
    weeklyReviews: Array.isArray(state?.weeklyReviews) ? state.weeklyReviews : [],
  };

  const topPaths     = getTopSignalPaths(safeState, 5);
  const topInterests = getTopSignalInterests(safeState, 6);

  const hasAnySignal = topPaths.some(p => p.score > 0);
  const strongPaths  = topPaths.filter(p => p.level >= 2);
  const dominantPath = topPaths[0] || null;

  let statusMessage = "";
  if (!hasAnySignal) {
    statusMessage = "System wartet auf Signale. Schließe Quests ab um deinen Pfad zu formen.";
  } else if (dominantPath?.level === 1) {
    const name = PATHS[dominantPath.pathId]?.name || dominantPath.pathId;
    statusMessage = `Schwaches Signal erkannt: ${name}. Mehr Aktivität um Gates freizuschalten.`;
  } else if (dominantPath?.level === 2) {
    const name = PATHS[dominantPath.pathId]?.name || dominantPath.pathId;
    statusMessage = `Aktive Spezialisierung: ${name}. ${dominantPath.reason}.`;
  } else if (dominantPath?.level === 3) {
    const name = PATHS[dominantPath.pathId]?.name || dominantPath.pathId;
    statusMessage = `Starkes Signal: ${name}. Gates und Trials verfügbar.`;
  }

  return {
    topPaths,
    topInterests,
    dominantPath,
    hasAnySignal,
    strongPaths,
    statusMessage,
  };
}

// ═══════════════════════════════════════════════════════════
// calculateInterestSignalBatch
// Effiziente Berechnung für alle Interests auf einmal.
// Wird vom questGenerator für Scoring genutzt.
// ═══════════════════════════════════════════════════════════
export function calculateInterestSignalBatch(state) {
  const result = {};
  for (const id of Object.keys(INTERESTS)) {
    result[id] = calculateInterestSignal(state, id);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════
// getSignalBreakdown — Etappe 5: Erklärbarkeit
// Zerlegt ein Path- oder Interest-Signal in nachvollziehbare
// Einzelquellen für die System-Analyse / UI.
// kind: "path" | "interest"
// Rückgabe: { total, level, parts: [{ source, label, points }] }
// ═══════════════════════════════════════════════════════════
export function getSignalBreakdown(state, kind, id) {
  const safe = {
    questHistory:  Array.isArray(state?.questHistory)  ? state.questHistory  : [],
    progressLogs:  Array.isArray(state?.progressLogs)  ? state.progressLogs  : [],
    goals:         Array.isArray(state?.goals)         ? state.goals         : [],
    player:        state?.player || {},
    stats:         state?.stats  || {},
    gateProgress:  state?.gateProgress || {},
    weeklyReviews: Array.isArray(state?.weeklyReviews) ? state.weeklyReviews : [],
  };

  const isPath = kind === "path";
  const total  = isPath ? calculatePathSignal(safe, id) : calculateInterestSignal(safe, id);
  const level  = isPath
    ? calculatePathSpecializationLevel(safe, id)
    : calculateSpecializationLevel(safe, id);

  const parts = [];
  const push = (source, label, points) => {
    if (points > 0) parts.push({ source, label, points: Math.round(points * 10) / 10 });
  };

  const def     = isPath ? PATHS[id] : INTERESTS[id];
  if (!def) return { total: 0, level: 0, parts: [] };
  const domains = isPath ? (def.domains || []) : [def.domain];
  const rPaths  = isPath ? [id] : (def.relatedPaths || []);
  const recent  = recentHistory(safe.questHistory);

  // Verhalten
  const behaviorQuests = recent.filter(h =>
    h.interestId === id || rPaths.some(p => questMatchesPath(h, p)) ||
    domains.some(d => questMatchesDomain(h, d))
  );
  if (behaviorQuests.length > 0) {
    const days = activeDaySpread(behaviorQuests);
    push("behavior", `${behaviorQuests.length} Quests an ${days} Tag${days > 1 ? "en" : ""}`, behaviorQuests.length);
  }

  // Logs
  const logs = safe.progressLogs.filter(l =>
    l.interestId === id || rPaths.some(p => l.path === p) || domains.some(d => l.domain === d)
  );
  push("logs", `${logs.length} Progress Log${logs.length !== 1 ? "s" : ""}`, logs.length);

  // Goals
  const gs = safe.goals.filter(g =>
    g.interestId === id || rPaths.some(p => g.path === p) || domains.some(d => g.domain === d)
  );
  const gAct  = gs.filter(g => g.status === "active").length;
  const gDone = gs.filter(g => g.status === "completed").length;
  push("goals", `${gAct} aktive${gDone > 0 ? `, ${gDone} erreichte` : ""} Ziel(e)`, gAct + gDone);

  // Explizite Interessen
  const prefs = safe.player?.preferences || {};
  if (!isPath && (prefs.interests || []).includes(id)) {
    push("interest", "Explizit als Interesse gewählt", 1);
  }
  if (isPath) {
    const ints = (prefs.interests || []).filter(i => INTERESTS[i]?.relatedPaths?.includes(id));
    push("interest", ints.length > 0 ? `Interessen: ${ints.slice(0, 2).map(i => INTERESTS[i]?.label).join(", ")}` : "", ints.length);
  }

  // Gates
  const gates = Object.entries(safe.gateProgress).filter(([gid, g]) =>
    g?.completed && rPaths.some(p => gid.includes(p))
  ).length;
  push("gates", `${gates} Gate${gates !== 1 ? "s" : ""}/Trial${gates !== 1 ? "s" : ""} abgeschlossen`, gates);

  // Reviews
  const revs = safe.weeklyReviews.slice(-4).filter(r => {
    const tops = (r?.topDomains || []).map(t => (typeof t === "string" ? t : t?.domain));
    return domains.some(d => tops.includes(d));
  }).length;
  push("reviews", `${revs} Weekly Review${revs !== 1 ? "s" : ""} mit Fokus hier`, revs);

  return { total, level, parts };
}

/**
 * getQuestPathId — Etappe 13: Welchem Path "gehört" eine Quest?
 * Für Signal-Feedback beim Abschluss: quest.path direkt, sonst
 * der erste Path, dessen Primär-Domain der Quest-Domain entspricht.
 */
export function getQuestPathId(quest) {
  if (!quest) return null;
  if (quest.path && PATHS[quest.path]) return quest.path;
  const d = quest.domain || quest.cat || null;
  if (!d) return null;
  for (const p of Object.values(PATHS)) {
    if (!p.special && (p.domains || [])[0] === d) return p.id;
  }
  return null;
}

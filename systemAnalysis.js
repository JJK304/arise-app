// ============================================================
// SYSTEM ANALYSIS
// Analysiert questHistory lokal, um dominante Pfade, vernach-
// lässigte Bereiche und Empfehlungen zu berechnen.
// Keine externe API — alles regelbasiert.
// ============================================================

// Wie viele Tage ein Bereich vernachlässigt sein muss, bevor
// ein Balance-Hinweis erscheint.
const NEGLECT_THRESHOLD_DAYS = 5;

// Mindest-Einträge in questHistory für sinnvolle Analyse
const MIN_HISTORY = 5;

// Domain → Pfad-Mapping (cat-Key aus challenges → pathId)
const DOMAIN_TO_PATH = {
  strength:         "fighter",
  discipline:       "fighter",
  cardio:           "runner",
  uni:              "scholar",
  skill_tech:       "engineer",
  skill_practical:  "engineer",
  skill_creative:   "artisan",
  social:           "charmer",
  appearance:       "charmer",
  health:           "fighter",  // gesundheit zählt leicht zu fighter
  legacy:           "shadow",
};

// Domains die für Balance-Tracking relevant sind
const BALANCE_DOMAINS = ["health", "social", "cardio", "discipline", "skill_creative"];

/**
 * Gibt zurück wie viele Tage seit dem letzten Eintrag
 * mit diesem domain-Key vergangen sind.
 * Gibt Infinity zurück wenn kein Eintrag gefunden.
 */
function daysSinceLastDomain(history, domain) {
  const entry = [...history]
    .reverse()
    .find(e => e.domain === domain);
  if (!entry) return Infinity;
  const completed = new Date(entry.completedAt);
  const now = new Date();
  return Math.floor((now - completed) / (1000 * 60 * 60 * 24));
}

/**
 * Zählt Einträge je Pfad aus der questHistory.
 * Nutzt DOMAIN_TO_PATH um domain → path zu mappen.
 */
function countByPath(history) {
  const counts = {
    fighter: 0, runner: 0, scholar: 0,
    engineer: 0, artisan: 0, charmer: 0,
  };
  for (const entry of history) {
    const pathId = entry.path || DOMAIN_TO_PATH[entry.domain];
    if (pathId && pathId !== "shadow" && counts[pathId] !== undefined) {
      counts[pathId]++;
    }
  }
  return counts;
}

/**
 * Haupt-Analyse-Funktion.
 * @param {object[]} questHistory  - state.questHistory
 * @param {object}   affinities   - state.player.affinities
 * @returns {AnalysisResult}
 */
export function analyzeSystem(questHistory = [], affinities = {}) {
  const result = {
    hasData:              false,
    dominantPaths:        [],
    suggestedMainPath:    null,
    suggestedSecondaryPath: null,
    neglectedDomains:     [],
    suggestedMessage:     null,
    recommendedQuestTypes: [],
    pathCounts:           {},
    balanceHints:         [],
  };

  if (!questHistory || questHistory.length < MIN_HISTORY) {
    result.suggestedMessage = "Noch nicht genug Daten. Schließe weitere Quests ab, damit dein System deinen Pfad erkennt.";
    return result;
  }

  result.hasData = true;

  // ── 1. Pfad-Zählung aus History ──
  const pathCounts = countByPath(questHistory);
  result.pathCounts = pathCounts;

  // ── 2. Dominante Pfade (Top-2 mit mind. 1 Eintrag) ──
  const sorted = Object.entries(pathCounts)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  result.dominantPaths = sorted.slice(0, 3).map(([k]) => k);

  // ── 3. Pfad-Empfehlungen ──
  // Kombination: History-Counts + Affinitäten (50/50 gewichtet)
  const combinedScores = {};
  for (const [pathId, cnt] of Object.entries(pathCounts)) {
    const affScore = (affinities[pathId] || 0) / 5; // Affinity normalisiert
    combinedScores[pathId] = cnt + affScore;
  }
  const sortedCombined = Object.entries(combinedScores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  result.suggestedMainPath      = sortedCombined[0]?.[0] || null;
  result.suggestedSecondaryPath = sortedCombined[1]?.[0] || null;

  // ── 4. Vernachlässigte Bereiche ──
  const neglected = [];
  for (const domain of BALANCE_DOMAINS) {
    const days = daysSinceLastDomain(questHistory, domain);
    if (days >= NEGLECT_THRESHOLD_DAYS) {
      neglected.push({ domain, daysSince: days === Infinity ? null : days });
    }
  }
  result.neglectedDomains = neglected;

  // ── 5. Balance-Hinweise ──
  const hints = [];
  if (neglected.some(n => n.domain === "health"))
    hints.push({ type: "recovery", text: "Gesundheits-Quest empfohlen", icon: "💚" });
  if (neglected.some(n => n.domain === "social"))
    hints.push({ type: "social",   text: "Social-Quest verfügbar",       icon: "🤝" });
  if (neglected.some(n => n.domain === "cardio"))
    hints.push({ type: "cardio",   text: "Bewegung lange nicht erledigt",icon: "⚡" });
  if (neglected.some(n => n.domain === "skill_creative"))
    hints.push({ type: "creative", text: "Kreativ-Quest verfügbar",       icon: "🎨" });
  result.balanceHints = hints;

  // ── 6. Empfohlene Quest-Typen ──
  const recommended = [];
  if (neglected.length > 0) recommended.push("recovery");
  if (sortedCombined.length > 0) {
    const top = sortedCombined[0][0];
    if (top === "scholar" || top === "engineer") recommended.push("deep_work");
    if (top === "fighter")  recommended.push("strength");
    if (top === "runner")   recommended.push("cardio");
    if (top === "artisan")  recommended.push("creative");
    if (top === "charmer")  recommended.push("social");
  }
  result.recommendedQuestTypes = recommended;

  // ── 7. Zusammenfassende Nachricht ──
  if (result.suggestedMainPath) {
    const mainName = result.suggestedMainPath.charAt(0).toUpperCase() + result.suggestedMainPath.slice(1);
    const secName  = result.suggestedSecondaryPath
      ? result.suggestedSecondaryPath.charAt(0).toUpperCase() + result.suggestedSecondaryPath.slice(1)
      : null;

    result.suggestedMessage = secName
      ? `Dein System erkennt eine ${mainName}/${secName}-Spezialisierung.`
      : `Dein System erkennt eine starke ${mainName}-Tendenz.`;
  }

  return result;
}

// ============================================================
// STATE MIGRATION
// Alte gespeicherte Daten defensiv migrieren.
// Fehlende Felder werden mit Defaults aufgefüllt, nichts
// wird gelöscht oder überschrieben.
// ============================================================
import { getAffinityGain } from "../data/paths.js";
import { catToDomain } from "../data/domains.js";
import { getDayKey, getWeekKey } from "./dates.js";
import { normalizeInterests } from "../data/interests.js";
import { normalizeTitles } from "../data/titles.js";
import { RANKS } from "../data/ranks.js";

const DEFAULT_AFFINITIES = {
  fighter:    0,
  runner:     0,
  scholar:    0,
  engineer:   0,
  artisan:    0,
  charmer:    0,
  strategist: 0,
  guardian:   0,
  merchant:   0,
  creator:    0,
  monk:       0,
  explorer:   0,
  leader:     0,
  healer:     0,
  shadow:     0,
};

const DEFAULT_PREFERENCES = {
  interests:            [],
  goals:                [],
  weakAreas:            [],
  preferredQuestLength: "medium",
  activePaths:          [],
  balanceAreas:         [],
  difficulty:           "normal",
};

const DEFAULT_PLAYER = (name = "") => ({
  name,
  mainPath:      null,
  secondaryPath: null,
  titles:        [],
  activeTitle:   null,
  affinities:    { ...DEFAULT_AFFINITIES },
  preferences:   { ...DEFAULT_PREFERENCES },
});

/**
 * Nimmt einen potenziell alten gespeicherten State und füllt
 * alle fehlenden Felder mit sicheren Defaults auf.
 * Bestehende Daten (XP, Stats, Quests usw.) werden nie verändert.
 *
 * v3-Änderungen:
 * - completionStatus (daily/weekly getrennt von History)
 * - progressLogs []
 * - goals []
 * - weeklyReviews []
 * - history entries erhalten domain (normalisiert aus cat)
 */
export function migrateState(raw) {
  if (!raw || typeof raw !== "object") return null;

  const s = { ...raw };

  // ── Core-Felder sicherstellen ──
  if (!s.stats)                s.stats               = { STR:0,AGI:0,INT:0,CRE:0,CRA:0,VIT:0,END:0,CHA:0,SOC:0,REL:0,APP:0 };
  if (!s.completedChallenges)  s.completedChallenges = [];
  if (!s.customQuests)         s.customQuests        = [];
  if (!s.xpHistory)            s.xpHistory           = [];
  if (!s.unlockedAchievements) s.unlockedAchievements= [];
  if (typeof s.totalXP  !== "number") s.totalXP        = 0;
  if (typeof s.currentStreak !== "number") s.currentStreak = 0;
  if (typeof s.longestStreak !== "number") s.longestStreak = 0;
  // Rank/Level/XP — der Render hängt direkt davon ab (RANK_COLORS[rank],
  // XP_PER_LEVEL(rank,level)); fehlende/ungültige Werte defensiv defaulten.
  if (!RANKS.includes(s.rank))                    s.rank  = "E";
  if (typeof s.level !== "number" || s.level < 1) s.level = 1;
  if (typeof s.xp !== "number")                   s.xp    = 0;

  // ── Player Model ──
  if (!s.player || typeof s.player !== "object") {
    s.player = DEFAULT_PLAYER(s.name || "");
  } else {
    const p = s.player;
    if (p.mainPath      === undefined) p.mainPath      = null;
    if (p.secondaryPath === undefined) p.secondaryPath = null;
    // Normalisiere String-Titel auf IDs (e.g. "Apprentice Scholar" → "apprentice_scholar")
    if (!Array.isArray(p.titles)) {
      p.titles = [];
    } else {
      p.titles = normalizeTitles(p.titles);
    }
    if (p.activeTitle   === undefined) p.activeTitle   = null;

    if (!p.affinities || typeof p.affinities !== "object") {
      p.affinities = { ...DEFAULT_AFFINITIES };
    } else {
      Object.keys(DEFAULT_AFFINITIES).forEach(k => {
        if (typeof p.affinities[k] !== "number") p.affinities[k] = 0;
      });
    }

    if (!p.preferences || typeof p.preferences !== "object") {
      p.preferences = { ...DEFAULT_PREFERENCES };
    } else {
      const pr = p.preferences;
      if (!Array.isArray(pr.interests))                  pr.interests            = [];
      if (!Array.isArray(pr.goals))                      pr.goals                = [];
      if (!Array.isArray(pr.weakAreas))                  pr.weakAreas            = [];
      if (typeof pr.preferredQuestLength !== "string")   pr.preferredQuestLength = "medium";
      if (!Array.isArray(pr.activePaths))                pr.activePaths          = [];
      if (!Array.isArray(pr.balanceAreas))               pr.balanceAreas         = [];
      if (typeof pr.difficulty !== "string")             pr.difficulty           = "normal";
      // Normalisiere alte Interest-IDs auf neue (z.B. "fitness" → "krafttraining")
      if (pr.interests.length > 0) {
        pr.interests = normalizeInterests(pr.interests);
      }
    }
  }

  // ── Quest History ──
  if (!Array.isArray(s.questHistory)) {
    s.questHistory = [];
  } else {
    // Normalisiere alte History-Einträge: domain aus cat ableiten
    s.questHistory = s.questHistory.map(entry => {
      if (!entry.domain && entry.cat) {
        return { ...entry, domain: catToDomain(entry.cat) };
      }
      return entry;
    });
  }

  // ── Completion Status (neu — getrennt von History) ──
  // Migriere alten completedChallenges-Array in neue Struktur wenn nötig.
  if (!s.completionStatus || typeof s.completionStatus !== "object") {
    // Baue completionStatus aus existierenden completedChallenges + lastDailyReset/lastWeeklyReset
    s.completionStatus = {
      daily:  {},
      weekly: {},
      gates:  {},
      goals:  {},
    };
    // Falls lastDailyReset gesetzt ist und completedChallenges IDs enthält,
    // migriere den heutigen Tag — nur tagesaktuelle IDs (Daily-Reset-Basis)
    // Wir können nicht sicher rekonstruieren welche Daily/Weekly waren,
    // daher lassen wir die neue Struktur leer starten. Die alten
    // completedChallenges bleiben als Fallback für Milestone-Checks.
  } else {
    // Sicherstellen dass alle Sub-Objekte existieren
    if (!s.completionStatus.daily)  s.completionStatus.daily  = {};
    if (!s.completionStatus.weekly) s.completionStatus.weekly = {};
    if (!s.completionStatus.gates)  s.completionStatus.gates  = {};
    if (!s.completionStatus.goals)  s.completionStatus.goals  = {};
  }

  // Migriere Gate-Progress in completionStatus.gates
  if (s.gateProgress && typeof s.gateProgress === "object") {
    for (const [gateId, progress] of Object.entries(s.gateProgress)) {
      if (progress?.completed && !s.completionStatus.gates[gateId]) {
        s.completionStatus.gates[gateId] = {
          completed:    true,
          rewardClaimed: progress.rewardClaimed || false,
        };
      }
    }
  }

  // ── Gate Progress ──
  if (!s.gateProgress || typeof s.gateProgress !== "object") s.gateProgress = {};

  // ── Progress Logs (neu) ──
  if (!Array.isArray(s.progressLogs)) s.progressLogs = [];

  // ── Goals (neu) ──
  if (!Array.isArray(s.goals)) s.goals = [];

  // ── Weekly Reviews (neu) ──
  if (!Array.isArray(s.weeklyReviews))       s.weeklyReviews       = [];
  if (!Array.isArray(s.completedMilestones)) s.completedMilestones = [];

  return s;
}

/**
 * Erstellt einen normalisierten Quest-History-Eintrag.
 * Rückwärtskompatibel: bleibt als makeHistoryEntry exportiert.
 *
 * @param {object} challenge  - Quest/Challenge-Objekt
 * @returns {object}          - History-Eintrag
 */
export function makeHistoryEntry(challenge) {
  return {
    id:          challenge.id,
    title:       challenge.title,
    completedAt: new Date().toISOString(),
    type:        challenge.type       || "daily",
    actionType:  challenge.actionType || "action",
    // domain: normalisiert aus challenge.domain oder cat
    domain:      challenge.domain || catToDomain(challenge.cat) || null,
    cat:         challenge.cat        || null,  // Legacy
    path:        challenge.path       || null,
    topic:       challenge.topic      || null,
    interestId:  challenge.interestId || null,
    goalId:      challenge.goalId     || null,
    xp:          challenge.xp         || 0,
    stats:       challenge.stats ||
      (challenge.statPts > 0
        ? { [challenge.subStat || challenge.stat]: challenge.statPts }
        : {}),
    source:      challenge.source     || "db",
  };
}

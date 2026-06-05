// ============================================================
// STATE MIGRATION
// Alte gespeicherte Daten defensiv migrieren.
// Fehlende Felder werden mit Defaults aufgefüllt, nichts
// wird gelöscht oder überschrieben.
// ============================================================
import { getAffinityGain } from "../data/paths.js";

const DEFAULT_AFFINITIES = {
  fighter:  0,
  runner:   0,
  scholar:  0,
  engineer: 0,
  artisan:  0,
  charmer:  0,
  shadow:   0,
};

const DEFAULT_PREFERENCES = {
  interests:            [],
  goals:                [],
  weakAreas:            [],
  preferredQuestLength: "medium",
  activePaths:          [],
  balanceAreas:         [],
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
 * alle fehlenden v2-Felder mit sicheren Defaults auf.
 * Bestehende Daten (XP, Stats, Quests usw.) werden nie verändert.
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

  // ── Player Model v2 ──
  if (!s.player || typeof s.player !== "object") {
    s.player = DEFAULT_PLAYER(s.name || "");
  } else {
    // Fehlende Sub-Felder einzeln ergänzen (nie bestehende überschreiben)
    const p = s.player;
    if (p.mainPath      === undefined) p.mainPath      = null;
    if (p.secondaryPath === undefined) p.secondaryPath = null;
    if (!Array.isArray(p.titles))      p.titles        = [];
    if (p.activeTitle   === undefined) p.activeTitle   = null;

    if (!p.affinities || typeof p.affinities !== "object") {
      p.affinities = { ...DEFAULT_AFFINITIES };
    } else {
      // Nur fehlende Keys ergänzen
      Object.keys(DEFAULT_AFFINITIES).forEach(k => {
        if (typeof p.affinities[k] !== "number") p.affinities[k] = 0;
      });
    }

    if (!p.preferences || typeof p.preferences !== "object") {
      p.preferences = { ...DEFAULT_PREFERENCES };
    } else {
      const pr = p.preferences;
      if (!Array.isArray(pr.interests))            pr.interests            = [];
      if (!Array.isArray(pr.goals))                pr.goals                = [];
      if (!Array.isArray(pr.weakAreas))            pr.weakAreas            = [];
      if (typeof pr.preferredQuestLength !== "string") pr.preferredQuestLength = "medium";
      if (!Array.isArray(pr.activePaths))          pr.activePaths          = [];
      if (!Array.isArray(pr.balanceAreas))         pr.balanceAreas         = [];
    }
  }

  // ── Quest History v2 ──
  if (!Array.isArray(s.questHistory)) s.questHistory = [];

  // ── Gate Progress ──
  if (!s.gateProgress || typeof s.gateProgress !== "object") s.gateProgress = {};

  return s;
}

/**
 * Erstellt einen Quest-History-Eintrag aus einem abgeschlossenen Challenge-Objekt.
 */
export function makeHistoryEntry(challenge) {
  return {
    id:          challenge.id,
    title:       challenge.title,
    completedAt: new Date().toISOString(),
    type:        challenge.type   || "daily",
    domain:      challenge.cat   || null,
    path:        challenge.path   || null,
    topic:       challenge.topic  || null,
    xp:          challenge.xp    || 0,
    stats:       challenge.statPts > 0
      ? { [challenge.subStat || challenge.stat]: challenge.statPts }
      : {},
  };
}

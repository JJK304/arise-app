// ============================================================
// QUEST GENERATOR
// Erzeugt personalisierte Quests aus Templates + Preferences.
// Alles lokal, regelbasiert, keine externe KI.
// ============================================================
import { QUEST_TEMPLATES, INTEREST_TOPICS } from "../data/questTemplates.js";

// XP-Multiplikatoren je Quest-Länge
const LENGTH_SCALE = { short: 0.7, medium: 1.0, long: 1.35 };

// Welche Template-Variable welche Interesse-Gruppe bedient
const GROUP_VARS = ["interest_mind", "interest_tech", "interest_creative", "interest_kitchen", "interest_fitness"];

/**
 * Resolves die Template-Variablen für ein bestimmtes Topic.
 * Gibt { duration, count, distance, topic, ... } zurück.
 */
function resolveVars(template, topicLabel, preferredLength) {
  const vars = template.variables || {};
  const resolved = {};

  if (vars.duration) {
    const idx = preferredLength === "short" ? 0 : preferredLength === "long" ? 2 : 1;
    resolved.duration = vars.duration[Math.min(idx, vars.duration.length - 1)];
  }
  if (vars.count) {
    const idx = preferredLength === "short" ? 0 : preferredLength === "long" ? 2 : 1;
    resolved.count = vars.count[Math.min(idx, vars.count.length - 1)];
  }
  if (vars.distance) {
    const idx = preferredLength === "short" ? 0 : preferredLength === "long" ? 2 : 1;
    resolved.distance = vars.distance[Math.min(idx, vars.distance.length - 1)];
  }
  if (vars.topic) {
    resolved.topic = topicLabel || "Thema";
  }

  return resolved;
}

/**
 * Ersetzt Template-Platzhalter mit den aufgelösten Vars.
 */
function applyTemplate(tmpl, vars) {
  return tmpl.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : `{${key}}`
  );
}

/**
 * Berechnet finales XP basierend auf Basis-XP und Quest-Länge.
 */
function calcXp(baseXp, preferredLength) {
  return Math.round(baseXp * (LENGTH_SCALE[preferredLength] || 1.0));
}

/**
 * Generiert personalisierte Quests basierend auf player.preferences.
 *
 * @param {object} preferences  - state.player.preferences
 * @param {number} maxPerGroup  - max quests per interest group (default 2)
 * @returns {Quest[]}           - Array fertiger Quest-Objekte
 */
export function generatePersonalizedQuests(preferences, maxPerGroup = 2) {
  const interests     = preferences?.interests            || [];
  const activePaths   = preferences?.activePaths          || [];
  const preferredLength = preferences?.preferredQuestLength || "medium";

  if (interests.length === 0 && activePaths.length === 0) return [];

  // Baue Topic-Map: group → [{ label, interestId }]
  const topicMap = {};
  for (const interestId of interests) {
    const info = INTEREST_TOPICS[interestId];
    if (!info) continue;
    if (!topicMap[info.group]) topicMap[info.group] = [];
    topicMap[info.group].push({ label: info.label, interestId });
  }

  // Welche Pfade sind aktiv / haben Affinität?
  const pathSet = new Set(activePaths);

  const results = [];
  const usedTemplates = new Set();
  const groupCounts = {};

  for (const template of QUEST_TEMPLATES) {
    // Pfad-Filter: Template muss zu mindestens einem aktiven Pfad passen
    // (wenn keine activePaths gesetzt, alle erlaubt)
    const pathMatch = pathSet.size === 0
      || template.paths.some(p => pathSet.has(p));
    if (!pathMatch) continue;

    // Bestimme Thema aus der passenden Interesse-Gruppe
    const varGroups = GROUP_VARS.filter(g => {
      const varKeys = Object.values(template.variables || {});
      return varKeys.includes(g);
    });

    // Template ohne topic-Variable → direkt generieren (z.B. Training, Laufen)
    if (varGroups.length === 0) {
      if (usedTemplates.has(template.id)) continue;
      const gKey = template.domain;
      if ((groupCounts[gKey] || 0) >= maxPerGroup) continue;

      const vars = resolveVars(template, null, preferredLength);
      const title = applyTemplate(template.titleTemplate, vars);
      const desc  = applyTemplate(template.descTemplate, vars);
      const xp    = calcXp(template.baseXp, preferredLength);

      results.push({
        id:           `pq_${template.id}_${preferredLength}`,
        title,
        desc,
        xp,
        stat:         "END",
        statPts:      0,
        type:         "daily",
        cat:          template.domain,
        path:         template.paths[0] || null,
        topic:        null,
        personalized: true,
      });
      usedTemplates.add(template.id);
      groupCounts[gKey] = (groupCounts[gKey] || 0) + 1;
      continue;
    }

    // Template mit topic-Variable → einmal pro passendem Interesse
    for (const group of varGroups) {
      const topics = topicMap[group] || [];
      if (topics.length === 0) continue;

      for (const { label, interestId } of topics) {
        const tplKey = `${template.id}_${interestId}`;
        if (usedTemplates.has(tplKey)) continue;

        const gKey = `${template.domain}_${group}`;
        if ((groupCounts[gKey] || 0) >= maxPerGroup) continue;

        const vars = resolveVars(template, label, preferredLength);
        const title = applyTemplate(template.titleTemplate, vars);
        const desc  = applyTemplate(template.descTemplate, vars);
        const xp    = calcXp(template.baseXp, preferredLength);

        results.push({
          id:           `pq_${template.id}_${interestId}_${preferredLength}`,
          title,
          desc,
          xp,
          stat:         "INT",
          statPts:      0,
          type:         "daily",
          cat:          template.domain,
          path:         template.paths[0] || null,
          topic:        label,
          personalized: true,
        });
        usedTemplates.add(tplKey);
        groupCounts[gKey] = (groupCounts[gKey] || 0) + 1;
      }
    }
  }

  // Max. 8 personalisierte Quests insgesamt (keine Quest-Flut)
  return results.slice(0, 8);
}

// ============================================================
// QUEST THEMES — Etappe 2: Equal Start
// Spezifische Quests (Gym, Instrument, Kochen, Finanzen, …)
// bleiben im System erhalten, erscheinen aber NUR wenn der
// Nutzer ein passendes Signal hat: explizites Interesse,
// aktiver Path, aktives Goal oder Verhaltens-Signal.
//
// Quests OHNE Eintrag hier gelten als neutral und sind immer
// für die Rotation wählbar. Milestones (Selbsttests) werden
// hier bewusst NICHT gegated — sie sind ein Katalog und werden
// über die Sichtbarkeits-Limits (Etappe 6) gesteuert.
// ============================================================
import { INTERESTS, normalizeInterests } from "./interests.js";
import { PATHS } from "./paths.js";

// id → { domains:[...], interests:[...] }
// Match wenn MINDESTENS eine Domain ODER ein Interest passt.
export const QUEST_THEMES = {
  // ── D-Rank ──
  d_d1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  d_d2:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  d_d3:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  d_d4:  { domains: ["body"], interests: ["krafttraining", "calisthenics"] },
  d_d5:  { domains: ["body"], interests: ["laufen", "ausdauer"] },
  d_d6:  { domains: ["body"], interests: ["mobility", "dehnen"] },
  d_d9:  { domains: ["creativity"], interests: ["musik"] },
  d_d10: { domains: ["creativity"], interests: ["zeichnen", "malen"] },
  d_d11: { domains: ["craft"], interests: ["kochen"] },
  d_d12: { domains: ["body"], interests: ["ernaehrung", "muskelaufbau"] },
  d_d14: { domains: ["appearance"], interests: ["hautpflege", "grooming"] },
  d_w1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  d_w5:  { domains: ["body"], interests: ["ernaehrung", "meal_prep"] },
  d_w6:  { domains: ["appearance"], interests: ["style"] },
  d_w7:  { domains: ["craft"] },

  // ── C-Rank ──
  c_d1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  c_d2:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  c_d3:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  c_d4:  { domains: ["body"], interests: ["laufen", "ausdauer"] },
  c_d5:  { domains: ["body"], interests: ["mobility", "dehnen"] },
  c_d8:  { domains: ["craft"] },
  c_d9:  { domains: ["creativity"], interests: ["musik"] },
  c_d10: { domains: ["creativity"], interests: ["zeichnen", "malen"] },
  c_d11: { domains: ["craft"], interests: ["kochen"] },
  c_d12: { domains: ["body"], interests: ["ernaehrung", "muskelaufbau"] },
  c_d13: { domains: ["body"], interests: ["sport", "kampfsport"] },
  c_d15: { domains: ["appearance"], interests: ["hautpflege", "grooming"] },
  c_w1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  c_w2:  { domains: ["body"] },
  c_w5:  { domains: ["appearance"], interests: ["style"] },
  c_w6:  { domains: ["creativity"], interests: ["musik"] },
  c_w7:  { domains: ["body"], interests: ["ernaehrung", "meal_prep", "kochen"] },
  c_w8:  { domains: ["craft"] },

  // ── B-Rank ──
  b_d1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  b_d2:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  b_d3:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  b_d4:  { domains: ["body"], interests: ["laufen", "ausdauer"] },
  b_d7:  { domains: ["craft"] },
  b_d8:  { domains: ["creativity"], interests: ["musik"] },
  b_d9:  { domains: ["creativity"], interests: ["zeichnen", "design"] },
  b_d10: { domains: ["craft"], interests: ["kochen"] },
  b_d11: { domains: ["body"], interests: ["ernaehrung", "meal_prep"] },
  b_d12: { domains: ["body"] },
  b_d14: { domains: ["appearance"], interests: ["grooming", "hautpflege"] },
  b_w1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  b_w3:  { domains: ["craft"], interests: ["programmieren", "software_projekte", "webentwicklung"] },
  b_w5:  { domains: ["craft"], interests: ["kochen"] },
  b_w6:  { domains: ["body", "appearance"], interests: ["muskelaufbau"] },

  // ── A-Rank ──
  a_d1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  a_d2:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  a_d3:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  a_d4:  { domains: ["body"], interests: ["laufen", "ausdauer"] },
  a_d7:  { domains: [], interests: ["sprachen"] },
  a_d8:  { domains: ["creativity"], interests: ["musik"] },
  a_d9:  { domains: ["creativity"], interests: ["zeichnen", "malen", "design"] },
  a_d10: { domains: ["craft"], interests: ["kochen"] },
  a_d11: { domains: ["body"], interests: ["ernaehrung"] },
  a_d15: { domains: ["appearance"], interests: ["style", "grooming"] },
  a_w1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  a_w2:  { domains: [], interests: ["sprachen"] },
  a_w4:  { domains: ["creativity"] },

  // ── S-Rank ──
  s_d1:  { domains: ["body"], interests: ["krafttraining", "muskelaufbau"] },
  s_d2:  { domains: ["body"], interests: ["calisthenics", "krafttraining"] },
  s_d3:  { domains: ["body"], interests: ["laufen", "ausdauer"] },
  s_d6:  { domains: ["creativity"] },
  s_d7:  { domains: ["body"], interests: ["ernaehrung"] },
  s_w1:  { domains: ["body"] },
  s_w3:  { domains: ["craft", "creativity", "career"] },

  // ── SS-Rank ──
  ss_d1: { domains: ["body"], interests: ["calisthenics", "krafttraining"] },
  ss_d2: { domains: ["body"], interests: ["laufen", "ausdauer"] },
  ss_d5: { domains: ["appearance"], interests: ["grooming", "style"] },

  // ── SSS-Rank ──
  sss_d1: { domains: ["body"] },

  // ── E-Rank Record-/Track-Quests (signal-gebunden, NICHT neutral) ──
  e_r1: { domains: ["body"], interests: ["krafttraining", "calisthenics", "muskelaufbau"] },
  e_r2: { domains: ["body"], interests: ["calisthenics", "krafttraining", "muskelaufbau"] },
  e_r3: { domains: ["mind"], interests: ["deepwork"] },

  // ── Extra-Dailies (in E gemergt) ──
  xd_fin_1: { domains: ["finance"], interests: ["budgeting", "finanzplanung"] },
  xd_fin_2: { domains: ["career"], interests: ["karriere", "bewerbung"] },
  xd_fin_3: { domains: ["finance"], interests: ["investieren", "finanzplanung", "wirtschaft"] },
  xd_adv_1: { domains: ["adventure"], interests: ["komfortzone", "neue_skills"] },
  xd_adv_2: { domains: ["adventure"], interests: ["komfortzone", "selbstbewusstsein"] },
  xd_adv_3: { domains: ["adventure"], interests: ["neue_orte", "komfortzone"] },
  xw_e_5:   { domains: ["finance"], interests: ["budgeting"] },

  // ── Extra-Dailies/Weeklies (in D gemergt) ──
  xd_d_fin_1: { domains: ["finance"], interests: ["budgeting"] },
  xd_d_fin_2: { domains: ["finance"], interests: ["versicherungen", "buerokratie", "sparen"] },
  xd_d_fin_3: { domains: ["career"], interests: ["karriere", "bewerbung", "nebenprojekt"] },
  xd_d_fin_4: { domains: ["finance"], interests: ["investieren", "steuern", "budgeting"] },
  xd_d_adv_1: { domains: ["adventure"], interests: ["komfortzone"] },
  xd_d_adv_2: { domains: ["adventure"], interests: ["neue_skills", "kultur"] },
  xd_d_adv_3: { domains: ["adventure"], interests: ["events", "komfortzone"] },
  xw_d_2:     { domains: ["body"] },
  xw_d_3:     { domains: ["craft"] },
  xw_d_5:     { domains: ["finance"], interests: ["budgeting"] },
  xw_d_6:     { domains: ["appearance"], interests: ["style", "grooming"] },

  // ── Extra-Weeklies (in C gemergt) ──
  xw_c_fin_1: { domains: ["finance"], interests: ["budgeting", "finanzplanung"] },
  xw_c_adv_1: { domains: ["adventure"], interests: ["komfortzone", "neue_orte"] },
};

/** True wenn die Quest thematisch spezifisch (signal-gebunden) ist. */
export function isThemedQuest(quest) {
  return !!(quest && QUEST_THEMES[quest.id]);
}

/**
 * Baut aus dem Rotation-Kontext die Match-Grundlage:
 * - explizite Interessen (normalisiert) + deren Domains
 * - Verhaltens-Signal-Interessen (aus signals.js) + deren Domains
 * - Domains aktiver Paths
 * - Domains aktiver Goals
 */
export function buildThemeContext(context = {}) {
  const {
    interests       = [],
    activePaths     = [],
    activeGoals     = [],
    signalInterests = [],
  } = context;

  const interestIds = new Set();
  const domains     = new Set();

  let normalized = [];
  try { normalized = normalizeInterests(interests) || []; } catch (_) { normalized = []; }
  for (const id of normalized) {
    interestIds.add(id);
    const d = INTERESTS[id]?.domain;
    if (d) domains.add(d);
  }

  for (const si of signalInterests) {
    const id = typeof si === "string" ? si : si?.interestId;
    if (!id) continue;
    interestIds.add(id);
    const d = INTERESTS[id]?.domain;
    if (d) domains.add(d);
  }

  for (const p of activePaths) {
    for (const d of PATHS[p]?.domains || []) domains.add(d);
  }

  for (const g of activeGoals) {
    if (g?.domain) domains.add(g.domain);
  }

  return { interestIds, domains };
}

/**
 * True wenn die Quest angezeigt werden darf:
 * neutral → immer; themed → nur bei Domain- oder Interest-Match.
 */
export function questThemeMatches(quest, themeCtx) {
  const theme = quest && QUEST_THEMES[quest.id];
  if (!theme) return true; // neutral
  if (!themeCtx) return false;
  for (const d of theme.domains || []) {
    if (themeCtx.domains && themeCtx.domains.has(d)) return true;
  }
  for (const i of theme.interests || []) {
    if (themeCtx.interestIds && themeCtx.interestIds.has(i)) return true;
  }
  return false;
}

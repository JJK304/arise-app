// ============================================================
// STATS CONFIGURATION
// ============================================================

export const STATS_CONFIG = [
  { key:"STR", label:"Strength",     icon:"⚔", color:"#ef4444", desc:"Muskelaufbau · Kraft · Körperzusammensetzung" },
  { key:"AGI", label:"Agility",      icon:"⚡", color:"#f59e0b", desc:"Ausdauer · Cardio · Schnelligkeit · Beweglichkeit" },
  { key:"INT", label:"Intelligence", icon:"◈", color:"#3b82f6", desc:"Lernen · Verstehen · Denken · Wissen" },
  { key:"CRE", label:"Arts",         icon:"✦", color:"#a78bfa", desc:"Kreativität · Gestaltung · Ausdruck" },
  { key:"CRA", label:"Craft",        icon:"⌬", color:"#f97316", desc:"Bauen · Reparieren · Technik · Praktisches" },
  { key:"VIT", label:"Vitality",     icon:"⌁", color:"#22c55e", desc:"Ernährung · Schlaf · Gesundheit · Regeneration" },
  { key:"END", label:"Endurance",    icon:"⬢", color:"#64748b", desc:"Willenskraft · Disziplin · Mentale Stärke" },
  { key:"CHA", label:"Charisma",     icon:"✧", color:"#ec4899", desc:"Soziales · Beziehungen · Auftreten", sub:["SOC","REL","APP"] },
];

export const SUB_STATS = {
  SOC:{ label:"Social",    icon:"◉", color:"#06b6d4" },
  REL:{ label:"Relations", icon:"⌁", color:"#f43f5e" },
  APP:{ label:"Appearance",icon:"◇", color:"#a78bfa" },
};

export const CAT_LABELS = {
  strength:"⚔ Kraft", cardio:"⚡ Cardio", skill_tech:"💻 Tech",
  skill_creative:"✦ Kreativ", skill_practical:"🔧 Handwerk",
  social:"◉ Sozial", appearance:"◇ Aussehen", health:"⌁ Gesundheit",
  discipline:"⬢ Disziplin", uni:"◈ Uni & Lernen", legacy:"✧ Legacy",
};

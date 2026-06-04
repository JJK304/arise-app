import { useState, useEffect, useRef } from "react";

// ============================================================
// DATA
// ============================================================

const RANKS = ["E", "D", "C", "B", "A", "S", "SS", "SSS"];
const LEVELS_PER_RANK = 10;
const TOTAL_LEVELS = RANKS.length * LEVELS_PER_RANK; // 80

const RANK_COLORS = {
  E: { primary: "#6b7280", glow: "#6b728055", label: "Novice" },
  D: { primary: "#22c55e", glow: "#22c55e55", label: "Awakened" },
  C: { primary: "#3b82f6", glow: "#3b82f655", label: "Hunter" },
  B: { primary: "#8b5cf6", glow: "#8b5cf655", label: "Elite Hunter" },
  A: { primary: "#f59e0b", glow: "#f59e0b55", label: "Advanced Hunter" },
  S: { primary: "#ef4444", glow: "#ef444455", label: "S-Rank Hunter" },
  SS: { primary: "#ec4899", glow: "#ec489955", label: "National-Level Hunter" },
  SSS: { primary: "#00ffff", glow: "#00ffff66", label: "Shadow Monarch" },
};

const XP_PER_LEVEL = (rank, level) => {
  const rankIdx = RANKS.indexOf(rank);
  const base = 100 + rankIdx * 150;
  return Math.floor(base * (1 + (level - 1) * 0.3));
};

const STATS_CONFIG = [
  { key: "STR", label: "Strength", icon: "⚔️", color: "#ef4444", desc: "Körperkraft & Muskelaufbau" },
  { key: "AGI", label: "Agility", icon: "⚡", color: "#f59e0b", desc: "Ausdauer & Geschwindigkeit" },
  { key: "INT", label: "Intelligence", icon: "🧠", color: "#3b82f6", desc: "Lernen & mentale Stärke" },
  { key: "VIT", label: "Vitality", icon: "💚", color: "#22c55e", desc: "Gesundheit & Ernährung" },
  { key: "END", label: "Endurance", icon: "🛡️", color: "#8b5cf6", desc: "Willenskraft & Disziplin" },
  { key: "CHA", label: "Charisma", icon: "👑", color: "#ec4899", desc: "SOC · REL · APP", sub: ["SOC", "REL", "APP"] },
];

const SUB_STATS = {
  SOC: { label: "Social", icon: "🤝", color: "#06b6d4" },
  REL: { label: "Relations", icon: "❤️", color: "#f43f5e" },
  APP: { label: "Appearance", icon: "✨", color: "#a78bfa" },
};

// Realistic challenges per rank
const CHALLENGES_DB = {
  E: {
    daily: [
      { id: "e_d1", title: "10 Liegestütze", desc: "Führe 10 saubere Liegestütze aus", xp: 20, stat: "STR", statPts: 1, type: "daily", category: "fitness" },
      { id: "e_d2", title: "15 Min. Spaziergang", desc: "Geh 15 Minuten an frischer Luft", xp: 15, stat: "AGI", statPts: 1, type: "daily", category: "fitness" },
      { id: "e_d3", title: "10 Min. Lesen", desc: "Lies 10 Minuten in einem Buch oder Artikel", xp: 15, stat: "INT", statPts: 1, type: "daily", category: "mental" },
      { id: "e_d4", title: "1,5L Wasser trinken", desc: "Mindestens 1,5 Liter Wasser heute", xp: 10, stat: "VIT", statPts: 1, type: "daily", category: "health" },
      { id: "e_d5", title: "1 neue Person ansprechen", desc: "Sprich heute eine unbekannte Person an", xp: 15, stat: "CHA", subStat: "SOC", statPts: 1, type: "daily", category: "social" },
    ],
    weekly: [
      { id: "e_w1", title: "3x Sport diese Woche", desc: "Absolviere 3 Trainingseinheiten", xp: 80, stat: "END", statPts: 3, type: "weekly", category: "fitness" },
      { id: "e_w2", title: "Ernährungstagebuch führen", desc: "Schreib 5 Tage lang auf, was du isst", xp: 60, stat: "VIT", statPts: 2, type: "weekly", category: "health" },
    ],
    milestones: [
      { id: "e_m1", title: "Erste 100 Liegestütze", desc: "Erreiche insgesamt 100 Liegestütze (aufgeteilt)", xp: 200, stat: "STR", statPts: 5, type: "milestone", category: "fitness" },
      { id: "e_m2", title: "1km am Stück laufen", desc: "Laufe ohne Pause 1 Kilometer", xp: 150, stat: "AGI", statPts: 4, type: "milestone", category: "fitness" },
    ],
  },
  D: {
    daily: [
      { id: "d_d1", title: "30 Liegestütze", desc: "Führe 30 saubere Liegestütze aus", xp: 35, stat: "STR", statPts: 2, type: "daily", category: "fitness" },
      { id: "d_d2", title: "2km Joggen", desc: "Jogg 2km ohne große Pause", xp: 30, stat: "AGI", statPts: 2, type: "daily", category: "fitness" },
      { id: "d_d3", title: "30 Min. fokussiertes Lernen", desc: "Lerne 30 Minuten ohne Ablenkung", xp: 30, stat: "INT", statPts: 2, type: "daily", category: "mental" },
      { id: "d_d4", title: "2L Wasser + gesunde Mahlzeit", desc: "Trinke 2L Wasser und iss eine gesunde Mahlzeit", xp: 25, stat: "VIT", statPts: 2, type: "daily", category: "health" },
    ],
    weekly: [
      { id: "d_w1", title: "5x Training diese Woche", desc: "5 Trainingseinheiten absolvieren", xp: 150, stat: "END", statPts: 5, type: "weekly", category: "fitness" },
      { id: "d_w2", title: "Freund aktiv treffen", desc: "Unternimm etwas mit einem Freund (nicht nur chatten)", xp: 100, stat: "CHA", subStat: "SOC", statPts: 4, type: "weekly", category: "social" },
    ],
    milestones: [
      { id: "d_m1", title: "5km laufen", desc: "Laufe 5km am Stück", xp: 400, stat: "AGI", statPts: 10, type: "milestone", category: "fitness" },
      { id: "d_m2", title: "Erstes Buch durchlesen", desc: "Schließe ein Buch von Anfang bis Ende ab", xp: 300, stat: "INT", statPts: 8, type: "milestone", category: "mental" },
    ],
  },
  C: {
    daily: [
      { id: "c_d1", title: "50 Liegestütze + 50 Kniebeugen", desc: "Führe je 50 saubere Wiederholungen aus", xp: 50, stat: "STR", statPts: 3, type: "daily", category: "fitness" },
      { id: "c_d2", title: "5km Joggen", desc: "Jogg 5km in einem Stück", xp: 55, stat: "AGI", statPts: 3, type: "daily", category: "fitness" },
      { id: "c_d3", title: "1h fokussiertes Studieren", desc: "1 Stunde tiefes, ablenkungsfreies Lernen", xp: 50, stat: "INT", statPts: 3, type: "daily", category: "mental" },
      { id: "c_d4", title: "Skincare Routine", desc: "Morgen- und Abendroutine für Haut", xp: 30, stat: "CHA", subStat: "APP", statPts: 2, type: "daily", category: "appearance" },
    ],
    weekly: [
      { id: "c_w1", title: "Gym 5x + Protein-Ziel", desc: "5x Gym + täglich 150g Protein erreichen", xp: 250, stat: "STR", statPts: 8, type: "weekly", category: "fitness" },
      { id: "c_w2", title: "Cold Shower jeden Tag", desc: "7 Tage lang kalte Duschen", xp: 200, stat: "END", statPts: 7, type: "weekly", category: "health" },
    ],
    milestones: [
      { id: "c_m1", title: "10km laufen", desc: "Laufe 10km am Stück", xp: 700, stat: "AGI", statPts: 15, type: "milestone", category: "fitness" },
      { id: "c_m2", title: "Klimmzug meistern", desc: "Schaffe deinen ersten sauberen Klimmzug", xp: 500, stat: "STR", statPts: 12, type: "milestone", category: "fitness" },
    ],
  },
  B: {
    daily: [
      { id: "b_d1", title: "100 Liegestütze", desc: "100 saubere Liegestütze am Tag", xp: 80, stat: "STR", statPts: 4, type: "daily", category: "fitness" },
      { id: "b_d2", title: "10km Joggen", desc: "10km täglich laufen", xp: 90, stat: "AGI", statPts: 4, type: "daily", category: "fitness" },
      { id: "b_d3", title: "2h Deep Work", desc: "2 Stunden unterbrechungsfreies Arbeiten/Lernen", xp: 80, stat: "INT", statPts: 4, type: "daily", category: "mental" },
      { id: "b_d4", title: "Meal Prep durchziehen", desc: "Alle Mahlzeiten vorbereitet und trackt", xp: 60, stat: "VIT", statPts: 3, type: "daily", category: "health" },
    ],
    weekly: [
      { id: "b_w1", title: "Relationship investieren", desc: "Qualitätszeit mit einer wichtigen Beziehung (Partner, Familie)", xp: 300, stat: "CHA", subStat: "REL", statPts: 10, type: "weekly", category: "social" },
      { id: "b_w2", title: "Öffentlich sprechen", desc: "Halte eine Präsentation oder rede vor einer Gruppe", xp: 350, stat: "CHA", subStat: "SOC", statPts: 12, type: "weekly", category: "social" },
    ],
    milestones: [
      { id: "b_m1", title: "Halbmarathon", desc: "Laufe 21km am Stück", xp: 1500, stat: "AGI", statPts: 25, type: "milestone", category: "fitness" },
      { id: "b_m2", title: "10 saubere Klimmzüge", desc: "10 Klimmzüge in einem Satz", xp: 1200, stat: "STR", statPts: 20, type: "milestone", category: "fitness" },
    ],
  },
  A: {
    daily: [
      { id: "a_d1", title: "200 Liegestütze", desc: "200 Liegestütze, aufgeteilt nach Bedarf", xp: 120, stat: "STR", statPts: 6, type: "daily", category: "fitness" },
      { id: "a_d2", title: "15km Lauf", desc: "15km täglich bei angemessenem Tempo", xp: 130, stat: "AGI", statPts: 6, type: "daily", category: "fitness" },
      { id: "a_d3", title: "4h Deep Work", desc: "4 Stunden produktives Arbeiten ohne Ablenkung", xp: 120, stat: "INT", statPts: 6, type: "daily", category: "mental" },
      { id: "a_d4", title: "5:30 Uhr aufstehen", desc: "Jeden Tag um 5:30 Uhr aufstehen", xp: 100, stat: "END", statPts: 5, type: "daily", category: "discipline" },
    ],
    weekly: [
      { id: "a_w1", title: "Neue Fähigkeit üben", desc: "Übe täglich 30min eine neue Fähigkeit (Sprache, Instrument, etc.)", xp: 500, stat: "INT", statPts: 15, type: "weekly", category: "mental" },
      { id: "a_w2", title: "Physique dokumentieren", desc: "Wöchentliches Progress-Foto + Messungen", xp: 400, stat: "CHA", subStat: "APP", statPts: 12, type: "weekly", category: "appearance" },
    ],
    milestones: [
      { id: "a_m1", title: "Marathon", desc: "Laufe 42km am Stück", xp: 3000, stat: "AGI", statPts: 40, type: "milestone", category: "fitness" },
      { id: "a_m2", title: "30 Klimmzüge", desc: "30 saubere Klimmzüge in einem Satz", xp: 2500, stat: "STR", statPts: 35, type: "milestone", category: "fitness" },
    ],
  },
  S: {
    daily: [
      { id: "s_d1", title: "400 Liegestütze", desc: "Elite-Level: 400 Liegestütze täglich", xp: 200, stat: "STR", statPts: 10, type: "daily", category: "fitness" },
      { id: "s_d2", title: "20km täglich", desc: "20km Lauf – konstantes Tempo", xp: 210, stat: "AGI", statPts: 10, type: "daily", category: "fitness" },
      { id: "s_d3", title: "6h Deep Work", desc: "6 Stunden Hochleistungs-Fokus", xp: 200, stat: "INT", statPts: 10, type: "daily", category: "mental" },
    ],
    weekly: [
      { id: "s_w1", title: "Mentor oder Lehrer sein", desc: "Bringe jemand anderem etwas bei diese Woche", xp: 800, stat: "CHA", subStat: "SOC", statPts: 20, type: "weekly", category: "social" },
      { id: "s_w2", title: "Extreme Disziplin-Woche", desc: "7 Tage: kein Zucker, kein Alkohol, 8h Schlaf, alle Habits", xp: 1000, stat: "END", statPts: 25, type: "weekly", category: "discipline" },
    ],
    milestones: [
      { id: "s_m1", title: "Ultramarathon 50km", desc: "Schließe einen 50km Ultramarathon ab", xp: 8000, stat: "AGI", statPts: 70, type: "milestone", category: "fitness" },
      { id: "s_m2", title: "100 Klimmzüge", desc: "100 Klimmzüge in einem einzigen Tag", xp: 7000, stat: "STR", statPts: 60, type: "milestone", category: "fitness" },
    ],
  },
  SS: {
    daily: [
      { id: "ss_d1", title: "1000 Liegestütze", desc: "Nationaler Hunter Level: 1000 täglich", xp: 350, stat: "STR", statPts: 15, type: "daily", category: "fitness" },
      { id: "ss_d2", title: "30km Lauf", desc: "30km tägliche Distanz", xp: 370, stat: "AGI", statPts: 15, type: "daily", category: "fitness" },
      { id: "ss_d3", title: "8h Hochleistung", desc: "8h produktiver Output auf höchstem Level", xp: 350, stat: "INT", statPts: 15, type: "daily", category: "mental" },
    ],
    weekly: [
      { id: "ss_w1", title: "Öffentliche Wirkung", desc: "Teile dein Wissen mit einem größeren Publikum (Video, Talk, Artikel)", xp: 1500, stat: "CHA", statPts: 35, type: "weekly", category: "social" },
    ],
    milestones: [
      { id: "ss_m1", title: "100km Ultra", desc: "Absolviere einen 100km Ultramarathon", xp: 20000, stat: "AGI", statPts: 120, type: "milestone", category: "fitness" },
      { id: "ss_m2", title: "Physique Transformation", desc: "Erreiche und halte einen Wettkampf-Körper für 3 Monate", xp: 15000, stat: "CHA", subStat: "APP", statPts: 100, type: "milestone", category: "appearance" },
    ],
  },
  SSS: {
    daily: [
      { id: "sss_d1", title: "Unmenschliches Training", desc: "3h Kraft + 20km + 500 Dips + 500 Liegestütze", xp: 600, stat: "STR", statPts: 25, type: "daily", category: "fitness" },
      { id: "sss_d2", title: "Shadow Monarch's Work", desc: "10h Deep Work auf absolutem Spitzenlevel", xp: 600, stat: "INT", statPts: 25, type: "daily", category: "mental" },
    ],
    weekly: [
      { id: "sss_w1", title: "Legacy Challenge", desc: "Erschaffe etwas, das andere Menschen dauerhaft inspiriert", xp: 5000, stat: "CHA", statPts: 80, type: "weekly", category: "legacy" },
    ],
    milestones: [
      { id: "sss_m1", title: "I ALONE LEVEL UP", desc: "Erreiche SSS-Rank Level 10 — du hast das Unmögliche geschafft", xp: 100000, stat: "END", statPts: 500, type: "milestone", category: "legendary" },
    ],
  },
};

// ============================================================
// HELPERS
// ============================================================

const getGlobalLevel = (rank, level) => RANKS.indexOf(rank) * LEVELS_PER_RANK + level;

const getRankFromGlobal = (g) => ({
  rank: RANKS[Math.floor((g - 1) / LEVELS_PER_RANK)],
  level: ((g - 1) % LEVELS_PER_RANK) + 1,
});

const defaultState = (name) => ({
  name,
  rank: "E",
  level: 1,
  xp: 0,
  stats: { STR: 1, AGI: 1, INT: 1, VIT: 1, END: 1, CHA: 1, SOC: 1, REL: 1, APP: 1 },
  completedChallenges: [],
  lastDailyReset: null,
  lastWeeklyReset: null,
  totalXP: 0,
  statPoints: 0,
});

const saveState = (s) => localStorage.setItem("arise_state", JSON.stringify(s));
const loadState = () => {
  try { return JSON.parse(localStorage.getItem("arise_state")); } catch { return null; }
};

const getTodayStr = () => new Date().toDateString();
const getWeekStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
};

// ============================================================
// COMPONENTS
// ============================================================

const GlitchText = ({ text, color = "#00ffff", size = "1rem" }) => (
  <span style={{
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: size,
    color,
    textShadow: `0 0 8px ${color}, 0 0 20px ${color}55`,
    letterSpacing: "0.12em",
    fontWeight: 700,
  }}>{text}</span>
);

const StatBar = ({ label, icon, value, max = 100, color, onClick }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div onClick={onClick} style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${color}33`,
      borderRadius: 8,
      padding: "10px 14px",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color + "88"}
    onMouseLeave={e => e.currentTarget.style.borderColor = color + "33"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: "0.8rem", color: "#aaa", letterSpacing: "0.1em" }}>{icon} {label}</span>
        <span style={{ fontSize: "0.85rem", color, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>{value}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 5, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}`,
          borderRadius: 4,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
};

const ChallengeCard = ({ challenge, done, onComplete, rankColor }) => {
  const typeColors = { daily: "#3b82f6", weekly: "#8b5cf6", milestone: "#f59e0b" };
  const typeIcons = { daily: "◈", weekly: "◉", milestone: "★" };
  const tc = typeColors[challenge.type];

  return (
    <div style={{
      background: done ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${done ? "#333" : tc + "44"}`,
      borderRadius: 10,
      padding: "14px 16px",
      opacity: done ? 0.5 : 1,
      transition: "all 0.3s",
      position: "relative",
      overflow: "hidden",
    }}>
      {!done && <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${tc}, transparent)`,
        opacity: 0.6,
      }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: tc, fontSize: "0.7rem", letterSpacing: "0.15em" }}>{typeIcons[challenge.type]} {challenge.type.toUpperCase()}</span>
            <span style={{ color: "#666", fontSize: "0.7rem" }}>+{challenge.xp} XP</span>
            <span style={{ color: challenge.stat === "CHA" ? "#ec4899" : "#888", fontSize: "0.7rem" }}>
              +{challenge.statPts} {challenge.subStat || challenge.stat}
            </span>
          </div>
          <div style={{ color: done ? "#555" : "#e2e8f0", fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>{challenge.title}</div>
          <div style={{ color: "#64748b", fontSize: "0.78rem" }}>{challenge.desc}</div>
        </div>
        {!done && (
          <button onClick={() => onComplete(challenge)} style={{
            background: `linear-gradient(135deg, ${tc}22, ${tc}44)`,
            border: `1px solid ${tc}66`,
            color: tc,
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: "0.8rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.05em",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.target.style.background = `${tc}33`; e.target.style.boxShadow = `0 0 12px ${tc}44`; }}
          onMouseLeave={e => { e.target.style.background = `linear-gradient(135deg, ${tc}22, ${tc}44)`; e.target.style.boxShadow = "none"; }}
          >
            DONE
          </button>
        )}
        {done && <span style={{ color: "#22c55e", fontSize: "1.2rem" }}>✓</span>}
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================

export default function AriseApp() {
  const [state, setState] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [view, setView] = useState("profile"); // profile | quests | stats | skills
  const [notification, setNotification] = useState(null);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const notifRef = useRef(null);

  // Load
  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
  }, []);

  // Reset daily/weekly
  useEffect(() => {
    if (!state) return;
    const today = getTodayStr();
    const week = getWeekStr();
    let updated = { ...state };
    let changed = false;

    if (state.lastDailyReset !== today) {
      updated.completedChallenges = state.completedChallenges.filter(id => !id.endsWith("_daily"));
      // Remove daily IDs
      const allDailyIds = Object.values(CHALLENGES_DB).flatMap(r => r.daily.map(c => c.id));
      updated.completedChallenges = state.completedChallenges.filter(id => !allDailyIds.includes(id));
      updated.lastDailyReset = today;
      changed = true;
    }
    if (state.lastWeeklyReset !== week) {
      const allWeeklyIds = Object.values(CHALLENGES_DB).flatMap(r => r.weekly.map(c => c.id));
      updated.completedChallenges = (updated.completedChallenges || state.completedChallenges).filter(id => !allWeeklyIds.includes(id));
      updated.lastWeeklyReset = week;
      changed = true;
    }
    if (changed) { setState(updated); saveState(updated); }
  }, [state?.rank]);

  const showNotif = (msg, color = "#00ffff") => {
    setNotification({ msg, color });
    clearTimeout(notifRef.current);
    notifRef.current = setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateCharacter = () => {
    if (!nameInput.trim()) return;
    const s = defaultState(nameInput.trim());
    s.lastDailyReset = getTodayStr();
    s.lastWeeklyReset = getWeekStr();
    setState(s);
    saveState(s);
  };

  const handleCompleteChallenge = (challenge) => {
    let s = { ...state };
    s.completedChallenges = [...(s.completedChallenges || []), challenge.id];
    s.xp = (s.xp || 0) + challenge.xp;
    s.totalXP = (s.totalXP || 0) + challenge.xp;
    s.statPoints = (s.statPoints || 0) + challenge.statPts;

    // Apply stat
    const statKey = challenge.subStat || challenge.stat;
    s.stats = { ...s.stats, [statKey]: (s.stats[statKey] || 0) + challenge.statPts };
    // If sub-stat, also increase parent CHA a bit
    if (challenge.subStat) s.stats.CHA = (s.stats.CHA || 0) + Math.floor(challenge.statPts / 3);

    // Level up logic
    const xpNeeded = XP_PER_LEVEL(s.rank, s.level);
    if (s.xp >= xpNeeded) {
      s.xp -= xpNeeded;
      const gLevel = getGlobalLevel(s.rank, s.level);
      if (gLevel < TOTAL_LEVELS) {
        const next = getRankFromGlobal(gLevel + 1);
        const rankUp = next.rank !== s.rank;
        s.rank = next.rank;
        s.level = next.level;
        setLevelUpAnim(true);
        setTimeout(() => setLevelUpAnim(false), 2500);
        if (rankUp) {
          showNotif(`⚡ RANK UP! ${RANK_COLORS[next.rank].label.toUpperCase()}`, RANK_COLORS[next.rank].primary);
        } else {
          showNotif(`↑ LEVEL UP! ${next.rank}-Rank Lv.${next.level}`, "#00ffff");
        }
      }
    } else {
      showNotif(`+${challenge.xp} XP · +${challenge.statPts} ${statKey}`, "#22c55e");
    }

    setState(s);
    saveState(s);
  };

  // ---- SETUP SCREEN ----
  if (!state) {
    return (
      <div style={{
        minHeight: "100vh", background: "#050508",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Rajdhani', sans-serif",
        backgroundImage: "radial-gradient(ellipse at 50% 0%, #0d0d2b 0%, #050508 60%)",
        padding: 24,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            fontSize: "0.75rem", letterSpacing: "0.4em", color: "#4a5568",
            marginBottom: 16, textTransform: "uppercase",
          }}>System Notification</div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            fontWeight: 900,
            background: "linear-gradient(135deg, #00ffff, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            lineHeight: 1,
            marginBottom: 8,
          }}>ARISE</div>
          <div style={{ color: "#4a5568", fontSize: "0.85rem", letterSpacing: "0.2em" }}>
            YOU HAVE BEEN CHOSEN
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid #1a1a3e",
          borderRadius: 16,
          padding: "32px 28px",
          width: "100%", maxWidth: 380,
          boxShadow: "0 0 60px #0d0d2b",
        }}>
          <div style={{ color: "#8892a4", fontSize: "0.85rem", marginBottom: 20, lineHeight: 1.6 }}>
            Du wurdest vom System auserwählt. Gib deinen Namen ein, um dein Erwachen zu beginnen.
          </div>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateCharacter()}
            placeholder="Dein Name..."
            style={{
              width: "100%", background: "rgba(0,255,255,0.05)",
              border: "1px solid #00ffff33", borderRadius: 10,
              padding: "14px 16px", color: "#e2e8f0",
              fontSize: "1rem", fontFamily: "'Rajdhani', sans-serif",
              outline: "none", boxSizing: "border-box", marginBottom: 16,
              letterSpacing: "0.05em",
            }}
          />
          <button
            onClick={handleCreateCharacter}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #00ffff22, #8b5cf633)",
              border: "1px solid #00ffff55",
              color: "#00ffff",
              borderRadius: 10, padding: "14px",
              fontSize: "1rem", fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700, letterSpacing: "0.15em",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 0 20px #00ffff11",
            }}
            onMouseEnter={e => e.target.style.boxShadow = "0 0 30px #00ffff33"}
            onMouseLeave={e => e.target.style.boxShadow = "0 0 20px #00ffff11"}
          >
            ERWACHEN
          </button>
        </div>
      </div>
    );
  }

  // ---- MAIN APP ----
  const rc = RANK_COLORS[state.rank];
  const xpNeeded = XP_PER_LEVEL(state.rank, state.level);
  const xpPct = Math.min((state.xp / xpNeeded) * 100, 100);
  const globalLvl = getGlobalLevel(state.rank, state.level);

  // Challenges for current rank (+ previous ranks for milestones if not done)
  const currentChallenges = CHALLENGES_DB[state.rank] || { daily: [], weekly: [], milestones: [] };
  const allMilestones = Object.entries(CHALLENGES_DB).flatMap(([r, v]) =>
    v.milestones.map(c => ({ ...c, fromRank: r }))
  );
  const visibleMilestones = allMilestones.filter(c =>
    RANKS.indexOf(c.fromRank) <= RANKS.indexOf(state.rank)
  );

  const allChallenges = [
    ...currentChallenges.daily,
    ...currentChallenges.weekly,
    ...visibleMilestones,
  ];

  const filtered = filterType === "all" ? allChallenges
    : allChallenges.filter(c => c.type === filterType);

  const navItems = [
    { id: "profile", icon: "◈", label: "Status" },
    { id: "quests", icon: "◉", label: "Quests" },
    { id: "stats", icon: "▲", label: "Stats" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#050508",
      fontFamily: "'Rajdhani', sans-serif",
      color: "#e2e8f0",
      backgroundImage: `radial-gradient(ellipse at 50% -20%, ${rc.glow} 0%, transparent 60%)`,
      maxWidth: 480, margin: "0 auto",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />

      {/* Level Up Overlay */}
      {levelUpAnim && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)",
          animation: "fadeInOut 2.5s ease",
          pointerEvents: "none",
        }}>
          <style>{`
            @keyframes fadeInOut { 0%{opacity:0;transform:scale(0.8)} 20%{opacity:1;transform:scale(1)} 80%{opacity:1} 100%{opacity:0} }
            @keyframes glitch { 0%{transform:translate(0)} 20%{transform:translate(-2px,1px)} 40%{transform:translate(2px,-1px)} 60%{transform:translate(-1px,2px)} 80%{transform:translate(1px,-2px)} 100%{transform:translate(0)} }
            @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
          `}</style>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(2rem, 10vw, 3.5rem)",
              fontWeight: 900,
              color: rc.primary,
              textShadow: `0 0 30px ${rc.primary}, 0 0 60px ${rc.primary}55`,
              animation: "glitch 0.3s infinite",
              letterSpacing: "0.1em",
            }}>LEVEL UP</div>
            <div style={{ color: "#aaa", fontSize: "1rem", marginTop: 8, letterSpacing: "0.3em" }}>
              {state.rank}-RANK · LV.{state.level}
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.9)", border: `1px solid ${notification.color}66`,
          borderRadius: 10, padding: "10px 20px",
          color: notification.color,
          fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem",
          letterSpacing: "0.1em",
          boxShadow: `0 0 20px ${notification.color}33`,
          zIndex: 500, whiteSpace: "nowrap",
          animation: "fadeInOut 3s ease",
        }}>{notification.msg}</div>
      )}

      {/* Header */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.35em", color: "#4a5568", marginBottom: 2 }}>PLAYER</div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "1.1rem", fontWeight: 900,
              color: "#e2e8f0",
              letterSpacing: "0.08em",
            }}>{state.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "1.4rem", fontWeight: 900,
              color: rc.primary,
              textShadow: `0 0 15px ${rc.primary}`,
              letterSpacing: "0.05em",
            }}>{state.rank}<span style={{ fontSize: "0.75rem", color: "#666", marginLeft: 4 }}>Rank</span></div>
            <div style={{ fontSize: "0.7rem", color: "#4a5568", letterSpacing: "0.1em" }}>Lv.{state.level} · {rc.label}</div>
          </div>
        </div>
        {/* XP Bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: "0.7rem", color: "#4a5568", letterSpacing: "0.15em" }}>EXPERIENCE</span>
            <span style={{ fontSize: "0.7rem", color: rc.primary }}>{state.xp} / {xpNeeded} XP</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 6, overflow: "hidden" }}>
            <div style={{
              width: `${xpPct}%`, height: "100%",
              background: `linear-gradient(90deg, ${rc.primary}66, ${rc.primary})`,
              boxShadow: `0 0 10px ${rc.primary}`,
              borderRadius: 6,
              transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <div style={{ fontSize: "0.65rem", color: "#2d3748", marginTop: 4, textAlign: "right" }}>
            Global Lv.{globalLvl} / {TOTAL_LEVELS}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}>

        {/* === PROFILE VIEW === */}
        {view === "profile" && (
          <div>
            {/* Rank Card */}
            <div style={{
              background: `linear-gradient(135deg, ${rc.primary}11, ${rc.primary}22)`,
              border: `1px solid ${rc.primary}44`,
              borderRadius: 16, padding: "20px",
              marginBottom: 20,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -20, right: -20,
                fontSize: "6rem", opacity: 0.06,
                fontFamily: "'Orbitron', sans-serif", fontWeight: 900,
                color: rc.primary, lineHeight: 1,
                pointerEvents: "none",
              }}>{state.rank}</div>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: rc.primary, marginBottom: 6 }}>CURRENT RANK</div>
              <div style={{
                fontFamily: "'Orbitron', sans-serif", fontWeight: 900,
                fontSize: "2rem", color: rc.primary,
                textShadow: `0 0 20px ${rc.primary}`,
              }}>{state.rank}-Rank</div>
              <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 4 }}>{rc.label}</div>

              {/* Rank progression */}
              <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
                {RANKS.map((r, i) => {
                  const idx = RANKS.indexOf(state.rank);
                  const passed = i < idx;
                  const active = i === idx;
                  const rC = RANK_COLORS[r].primary;
                  return (
                    <div key={r} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        height: 4, borderRadius: 3,
                        background: passed ? rC : active ? `${rC}99` : "#1a1a2e",
                        boxShadow: active ? `0 0 8px ${rC}` : "none",
                        transition: "all 0.3s",
                      }} />
                      <div style={{
                        fontSize: "0.5rem", marginTop: 3,
                        color: passed || active ? rC : "#2d3748",
                        fontWeight: 700, letterSpacing: "0.05em",
                      }}>{r}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#4a5568", marginBottom: 12 }}>CORE STATS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {STATS_CONFIG.filter(s => !["SOC","REL","APP"].includes(s.key)).map(sc => (
                  <StatBar
                    key={sc.key}
                    label={sc.key}
                    icon={sc.icon}
                    value={state.stats[sc.key] || 0}
                    max={Math.max(50, (state.stats[sc.key] || 0) * 1.5)}
                    color={sc.color}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#4a5568", marginBottom: 12 }}>CHARISMA</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {["SOC","REL","APP"].map(k => (
                  <StatBar
                    key={k}
                    label={k}
                    icon={SUB_STATS[k].icon}
                    value={state.stats[k] || 0}
                    max={Math.max(30, (state.stats[k] || 0) * 1.5)}
                    color={SUB_STATS[k].color}
                  />
                ))}
              </div>
            </div>

            {/* Total stats */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a2e",
              borderRadius: 12, padding: "16px", marginTop: 20,
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
            }}>
              {[
                { label: "Total XP", val: (state.totalXP || 0).toLocaleString(), color: "#00ffff" },
                { label: "Quests Done", val: (state.completedChallenges?.length || 0), color: "#22c55e" },
                { label: "Rank Progress", val: `${((globalLvl / TOTAL_LEVELS) * 100).toFixed(0)}%`, color: rc.primary },
              ].map(item => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: item.color, fontFamily: "'Orbitron', sans-serif" }}>{item.val}</div>
                  <div style={{ fontSize: "0.6rem", color: "#4a5568", letterSpacing: "0.1em", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === QUESTS VIEW === */}
        {view === "quests" && (
          <div>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#4a5568", marginBottom: 14 }}>
              AKTIVE QUESTS — {state.rank}-RANK
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["all", "daily", "weekly", "milestone"].map(f => (
                <button key={f} onClick={() => setFilterType(f)} style={{
                  background: filterType === f ? rc.primary + "22" : "transparent",
                  border: `1px solid ${filterType === f ? rc.primary + "66" : "#1a1a2e"}`,
                  color: filterType === f ? rc.primary : "#4a5568",
                  borderRadius: 8, padding: "6px 12px",
                  fontSize: "0.7rem", letterSpacing: "0.1em",
                  cursor: "pointer", fontFamily: "'Rajdhani', sans-serif",
                  textTransform: "uppercase", fontWeight: 600,
                  transition: "all 0.2s",
                }}>
                  {f === "all" ? "Alle" : f === "daily" ? "Täglich" : f === "weekly" ? "Wöchentl." : "Meilenstein"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0 && (
                <div style={{ color: "#2d3748", textAlign: "center", padding: "40px 0", fontSize: "0.9rem" }}>
                  Keine Quests für diesen Filter.
                </div>
              )}
              {filtered.map(c => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  done={state.completedChallenges?.includes(c.id)}
                  onComplete={handleCompleteChallenge}
                  rankColor={rc.primary}
                />
              ))}
            </div>
          </div>
        )}

        {/* === STATS VIEW === */}
        {view === "stats" && (
          <div>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#4a5568", marginBottom: 14 }}>
              ALLE STATS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {STATS_CONFIG.map(sc => (
                <div key={sc.key}>
                  <StatBar
                    label={sc.label}
                    icon={sc.icon}
                    value={state.stats[sc.key] || 0}
                    max={Math.max(50, (state.stats[sc.key] || 0) * 1.5)}
                    color={sc.color}
                  />
                  {sc.sub && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6, marginLeft: 12 }}>
                      {sc.sub.map(k => (
                        <StatBar
                          key={k}
                          label={k}
                          icon={SUB_STATS[k].icon}
                          value={state.stats[k] || 0}
                          max={Math.max(30, (state.stats[k] || 0) * 1.5)}
                          color={SUB_STATS[k].color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Rank Requirements */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#4a5568", marginBottom: 14 }}>
                RANG-ÜBERSICHT
              </div>
              {RANKS.map(r => {
                const idx = RANKS.indexOf(r);
                const currentIdx = RANKS.indexOf(state.rank);
                const rC = RANK_COLORS[r];
                const passed = idx < currentIdx;
                const active = idx === currentIdx;
                return (
                  <div key={r} style={{
                    background: active ? `${rC.primary}11` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${active ? rC.primary + "44" : "#0f0f1a"}`,
                    borderRadius: 10, padding: "12px 16px", marginBottom: 8,
                    opacity: passed ? 0.5 : 1,
                    transition: "all 0.3s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          fontFamily: "'Orbitron', sans-serif", fontWeight: 900,
                          fontSize: "1rem", color: rC.primary,
                          textShadow: active ? `0 0 10px ${rC.primary}` : "none",
                        }}>{r}</span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{rC.label}</span>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: passed ? "#22c55e" : active ? rC.primary : "#2d3748" }}>
                        {passed ? "✓ ABGESCHLOSSEN" : active ? "◈ AKTIV" : "GESPERRT"}
                      </span>
                    </div>
                    {active && (
                      <div style={{ marginTop: 8, fontSize: "0.75rem", color: "#4a5568" }}>
                        Lv.{state.level} / {LEVELS_PER_RANK} · {state.xp}/{xpNeeded} XP
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "rgba(5,5,8,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        display: "flex",
        padding: "8px 0 16px",
        zIndex: 200,
      }}>
        {navItems.map(item => {
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)} style={{
              flex: 1,
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "8px 0",
              transition: "all 0.2s",
            }}>
              <span style={{
                fontSize: "1.1rem",
                color: active ? rc.primary : "#2d3748",
                textShadow: active ? `0 0 10px ${rc.primary}` : "none",
                transition: "all 0.2s",
              }}>{item.icon}</span>
              <span style={{
                fontSize: "0.6rem", letterSpacing: "0.15em",
                color: active ? rc.primary : "#2d3748",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                transition: "all 0.2s",
              }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

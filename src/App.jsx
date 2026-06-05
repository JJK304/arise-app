import { useState, useEffect, useRef, useCallback } from "react";

// Data
import { RANKS, RANK_COLORS, XP_PER_LEVEL, TOTAL_LEVELS, LEVELS_PER_RANK } from "./data/ranks.js";
import { STATS_CONFIG, SUB_STATS, CAT_LABELS } from "./data/stats.js";
import { CHALLENGES_DB } from "./data/challenges.js";
import { ACHIEVEMENTS } from "./data/achievements.js";
import { defaultState } from "./data/defaultState.js";
import { PATHS, getAffinityGain, suggestPaths, canUnlockShadow } from "./data/paths.js";
import {
  INTERESTS_OPTIONS, QUEST_LENGTH_OPTIONS,
  ACTIVE_PATHS_OPTIONS, BALANCE_AREAS_OPTIONS,
} from "./data/preferences.js";
import { GATES, isGateCompleted, getGateStepsDone, getRecommendedGates } from "./data/gates.js";
import { getRecoveryQuests, getRecoveryHint, RECOVERY_QUESTS } from "./data/recoveryQuests.js";
import { TITLES, checkTitleUnlocks } from "./data/titles.js";

// Lib
import { getGlobalLevel, getRankFromGlobal, getTodayStr, getWeekStr } from "./lib/helpers.js";
import { useCountUp } from "./lib/useCountUp.js";
import { migrateState, makeHistoryEntry } from "./lib/migration.js";
import { generatePersonalizedQuests } from "./lib/questGenerator.js";
import { analyzeSystem } from "./lib/systemAnalysis.js";

// Storage
import { saveData, loadData, LS } from "./storage/db.js";

// Components
import { MiniChart } from "./components/MiniChart.jsx";
import { RadarChart } from "./components/RadarChart.jsx";
import { SplashScreen } from "./components/SplashScreen.jsx";
import { StatBar } from "./components/StatBar.jsx";
import { ChallengeCard } from "./components/ChallengeCard.jsx";
import { GateCard } from "./components/GateCard.jsx";

// Internal DB constants needed for reset
const DB_NAME = "arise_db", DB_VERSION = 1, STORE = "data";
const openDB = () => new Promise((res, rej) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
  req.onsuccess = e => res(e.target.result);
  req.onerror = () => rej(req.error);
});

export default function AriseApp() {
  const [state, setState] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [view, setView] = useState("profile");
  const [notification, setNotification] = useState(null);
  const [levelUpAnim, setLevelUpAnim] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default"); // default | xp
  const [bodyEntries, setBodyEntries] = useState([]);
  const [bodyForm, setBodyForm] = useState({ weight:"",bf:"",bench:"",squat:"",deadlift:"",pullups:"",run5k:"",note:"" });
  const [bodyMetric, setBodyMetric] = useState("weight");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null); // for stat detail chart
  const [showSplash, setShowSplash] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(() => { try { return JSON.parse(localStorage.getItem("arise_haptic") ?? "true"); } catch { return true; } });
  const [collapsedSections, setCollapsedSections] = useState({});
  const [customForm, setCustomForm] = useState({ title:"",desc:"",xp:"20",cat:"discipline" });
  const [newAchievements, setNewAchievements] = useState([]);
  const [newTitles, setNewTitles] = useState([]);
  const [questFeedback, setQuestFeedback] = useState(null); // { xp, statKey, statPts, pathGains, newTitles }
  const notifRef = useRef(null);
  const achievRef = useRef(null);
  const feedbackRef = useRef(null);

  // Load from IndexedDB on mount — always migrate defensively
  useEffect(() => {
    (async () => {
      const raw = await loadData("arise_v3");
      if (raw) {
        const migrated = migrateState(raw);
        setState(migrated);
        // Persist migration immediately if anything changed
        if (JSON.stringify(migrated) !== JSON.stringify(raw)) {
          saveData("arise_v3", migrated);
        }
      }
      const b = await loadData("arise_body");
      if(b) setBodyEntries(b);
      setTimeout(() => setShowSplash(false), 1800);
    })();
  }, []);

  // Haptic feedback helper
  const haptic = useCallback((type="light") => {
    if(!hapticEnabled) return;
    try {
      if(navigator.vibrate) {
        navigator.vibrate(type==="heavy"?[30,10,30]:type==="medium"?20:10);
      }
    } catch {}
  }, [hapticEnabled]);

  const toggleHaptic = (val) => {
    setHapticEnabled(val);
    localStorage.setItem("arise_haptic", JSON.stringify(val));
  };

  const toggleSection = (key) => setCollapsedSections(p => ({...p, [key]: !p[key]}));

  // Daily/Weekly reset + streak update
  useEffect(() => {
    if(!state) return;
    const today = getTodayStr(), week = getWeekStr();
    let u = {...state, stats:{...state.stats}}, changed = false;
    // Daily reset
    if(state.lastDailyReset !== today) {
      const ids = Object.values(CHALLENGES_DB).flatMap(r=>r.daily.map(c=>c.id));
      u.completedChallenges = (state.completedChallenges||[]).filter(id=>!ids.includes(id));
      // Streak logic
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yStr = yesterday.toDateString();
      if(state.lastActiveDay === yStr) {
        u.currentStreak = (state.currentStreak||0) + 1;
        u.longestStreak = Math.max(u.currentStreak, state.longestStreak||0);
      } else if(state.lastActiveDay !== today) {
        u.currentStreak = 0;
      }
      u.lastDailyReset = today; changed = true;
    }
    if(state.lastWeeklyReset !== week) {
      const ids = Object.values(CHALLENGES_DB).flatMap(r=>r.weekly.map(c=>c.id));
      u.completedChallenges = (u.completedChallenges||state.completedChallenges).filter(id=>!ids.includes(id));
      u.lastWeeklyReset = week; changed = true;
    }
    if(changed) { setState(u); saveData("arise_v3", u); }
  }, [state?.rank, state?.lastDailyReset]);

  // Check achievements
  const checkAchievements = useCallback((s, body) => {
    const already = s.unlockedAchievements || [];
    const newly = ACHIEVEMENTS.filter(a => !already.includes(a.id) && a.check(s, body));
    if(newly.length > 0) {
      const updated = { ...s, unlockedAchievements: [...already, ...newly.map(a=>a.id)] };
      saveData("arise_v3", updated);
      setState(updated);
      setNewAchievements(newly);
      clearTimeout(achievRef.current);
      achievRef.current = setTimeout(() => setNewAchievements([]), 4000);
    }
  }, []);

  const showNotif = (msg, color="#00ffff") => {
    setNotification({msg,color});
    clearTimeout(notifRef.current);
    notifRef.current = setTimeout(()=>setNotification(null), 3500);
  };

  const handleCreate = () => {
    if(!nameInput.trim()) return;
    const s = migrateState({
      ...defaultState(nameInput.trim()),
      lastDailyReset:  getTodayStr(),
      lastWeeklyReset: getWeekStr(),
    });
    setState(s); saveData("arise_v3", s);
  };

  const handleComplete = (challenge) => {
    // ── Duplicate-XP-Schutz ──
    // Milestones: dürfen grundsätzlich nie doppelt abgeschlossen werden
    // Daily/Weekly: werden durch den Reset-Mechanismus gesteuert,
    //   aber wir prüfen trotzdem ob die ID schon in completedChallenges ist
    const alreadyDone = (state.completedChallenges || []).includes(challenge.id);
    if (alreadyDone) {
      showNotif("Quest bereits erledigt", "#64748b");
      return;
    }

    let s = { ...state, stats:{...state.stats}, completedChallenges:[...(state.completedChallenges||[])] };
    s.completedChallenges.push(challenge.id);
    s.xp = (s.xp||0) + challenge.xp;
    s.totalXP = (s.totalXP||0) + challenge.xp;
    s.lastActiveDay = getTodayStr();
    if(s.lastDailyReset === getTodayStr()) {
      s.currentStreak = Math.max(s.currentStreak||0, 1);
    }
    // XP history (weekly buckets)
    const wk = getWeekStr();
    const hist = [...(s.xpHistory||[])];
    const last = hist[hist.length-1];
    if(last && last.w === wk) last.v += challenge.xp;
    else hist.push({ w:wk, v:challenge.xp, l:new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}) });
    s.xpHistory = hist.slice(-24);

    // ── Quest History Eintrag ──
    const histEntry = makeHistoryEntry(challenge);
    s.questHistory = [...(s.questHistory || []), histEntry].slice(-500); // max 500 Einträge

    // ── Path Affinity aktualisieren ──
    const gains = getAffinityGain(challenge);
    if (Object.keys(gains).length > 0) {
      s.player = { ...s.player, affinities: { ...s.player.affinities } };
      for (const [pathId, pts] of Object.entries(gains)) {
        s.player.affinities[pathId] = (s.player.affinities[pathId] || 0) + pts;
      }
    }

    // Stat-Punkte NUR bei Meilensteinen
    if(challenge.type === "milestone" && challenge.statPts > 0) {
      const sk = challenge.subStat || challenge.stat;
      s.stats[sk] = (s.stats[sk]||0) + challenge.statPts;
      if(challenge.subStat) s.stats.CHA = (s.stats.CHA||0) + Math.max(1,Math.floor(challenge.statPts/5));
      showNotif(`★ STAT UP! +${challenge.statPts} ${sk}`, "#f59e0b");
    }

    // Level up
    let xpNeeded = XP_PER_LEVEL(s.rank, s.level);
    while(s.xp >= xpNeeded) {
      s.xp -= xpNeeded;
      const gl = getGlobalLevel(s.rank, s.level);
      if(gl < TOTAL_LEVELS) {
        const next = getRankFromGlobal(gl+1);
        const rankUp = next.rank !== s.rank;
        s.rank = next.rank; s.level = next.level;
        setLevelUpAnim({ rank:s.rank, level:s.level, rankUp });
        setTimeout(()=>setLevelUpAnim(null), 2800);
        if(rankUp) showNotif(`⚡ RANK UP! ${RANK_COLORS[s.rank].label.toUpperCase()}`, RANK_COLORS[s.rank].primary);
        else showNotif(`↑ LEVEL UP! ${s.rank}-Rank Lv.${s.level}`, "#00ffff");
        xpNeeded = XP_PER_LEVEL(s.rank, s.level);
      } else break;
    }
    if(challenge.type !== "milestone") showNotif(`+${challenge.xp} XP`, "#3b82f6");
    haptic(challenge.type==="milestone"?"heavy":"medium");

    // ── Titel-Check ──
    const newlyUnlocked = checkTitleUnlocks(s, s.questHistory || []);
    if (newlyUnlocked.length > 0) {
      const titles = s.player?.titles || [];
      const merged = [...new Set([...titles, ...newlyUnlocked])];
      s.player = {
        ...s.player,
        titles: merged,
        // Ersten Titel auto-setzen wenn noch keiner aktiv
        activeTitle: s.player.activeTitle || newlyUnlocked[0],
      };
      setNewTitles(TITLES.filter(t => newlyUnlocked.includes(t.id)));
      clearTimeout(feedbackRef.current);
      feedbackRef.current = setTimeout(() => setNewTitles([]), 4500);
    }

    // ── Quest-Feedback-Moment ──
    const feedbackGains = getAffinityGain(challenge);
    const statKey = challenge.type === "milestone" && challenge.statPts > 0
      ? (challenge.subStat || challenge.stat) : null;
    setQuestFeedback({
      xp:        challenge.xp,
      statKey,
      statPts:   challenge.statPts || 0,
      pathGains: feedbackGains,
      newTitles: newlyUnlocked,
    });
    clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setQuestFeedback(null), 3000);

    setState(s); saveData("arise_v3", s);
    setTimeout(() => checkAchievements(s, bodyEntries), 100);
  };

  const saveBodyEntry = () => {
    const entry = { ...bodyForm, date:new Date().toLocaleDateString("de-DE"), ts:Date.now() };
    const updated = [entry, ...bodyEntries].slice(0,52);
    setBodyEntries(updated); saveData("arise_body", updated);
    setBodyForm({ weight:"",bf:"",bench:"",squat:"",deadlift:"",pullups:"",run5k:"",note:"" });
    showNotif("✓ Check-In gespeichert", "#22c55e");
    if(state) setTimeout(() => checkAchievements(state, updated), 100);
  };

  const addCustomQuest = () => {
    if(!customForm.title.trim()) return;
    const quest = { id:`custom_${Date.now()}`, title:customForm.title.trim(), desc:customForm.desc.trim()||"Eigene Quest", xp:Math.max(1,parseInt(customForm.xp)||20), stat:"END", statPts:0, type:"custom", cat:customForm.cat };
    const s = { ...state, customQuests:[...(state.customQuests||[]), quest] };
    setState(s); saveData("arise_v3", s);
    setCustomForm({ title:"",desc:"",xp:"20",cat:"discipline" });
    setShowCustomForm(false);
    showNotif("✦ Quest hinzugefügt", "#06b6d4");
  };

  const deleteCustomQuest = (id) => {
    const s = { ...state, customQuests:(state.customQuests||[]).filter(q=>q.id!==id) };
    setState(s); saveData("arise_v3", s);
  };

  const handleReset = async () => {
    // Clear IndexedDB
    try {
      const db = await openDB();
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
    } catch {}
    // Clear localStorage
    localStorage.removeItem("arise_v3");
    localStorage.removeItem("arise_body");
    // Reset state
    setBodyEntries([]);
    setConfirmReset(false);
    setView("profile");
    setState(null);
    // Small delay then re-init
    setTimeout(() => {
      const s = defaultState("");
      // Don't auto-create — go back to name input
    }, 100);
  };

  const exportData = () => {
    const data = { state: LS("arise_v3"), body: LS("arise_body"), exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`arise_backup_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    showNotif("↓ Backup gespeichert", "#22c55e");
  };

  const importData = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if(data.state) {
          const migrated = migrateState(data.state);
          saveData("arise_v3", migrated);
          setState(migrated);
        }
        if(data.body)  { saveData("arise_body", data.body); setBodyEntries(data.body); }
        showNotif("✓ Daten importiert", "#22c55e");
      } catch { showNotif("⚠ Import fehlgeschlagen", "#ef4444"); }
    };
    reader.readAsText(file);
  };

  // ── Preferences updaten ──
  const savePreferences = (patch) => {
    const s = {
      ...state,
      player: {
        ...state.player,
        preferences: { ...state.player.preferences, ...patch },
      },
    };
    setState(s);
    saveData("arise_v3", s);
  };

  const toggleArrayPref = (field, value) => {
    const current = state.player?.preferences?.[field] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    savePreferences({ [field]: next });
  };

  // ── Gate Handlers ──
  const handleGateStepToggle = (gateId, stepIndex) => {
    const prev = state.gateProgress?.[gateId] || { stepsDone: [], completed: false };
    if (prev.completed) return; // Kein Ändern nach Abschluss
    const stepsDone = prev.stepsDone.includes(stepIndex)
      ? prev.stepsDone.filter(i => i !== stepIndex)
      : [...prev.stepsDone, stepIndex];
    const s = {
      ...state,
      gateProgress: { ...state.gateProgress, [gateId]: { ...prev, stepsDone } },
    };
    setState(s); saveData("arise_v3", s);
  };

  const handleGateClaim = (gate) => {
    const prev = state.gateProgress?.[gate.id] || {};
    if (prev.completed) return; // Kein doppelter Reward
    const gate_def = GATES.find(g => g.id === gate.id);
    if (!gate_def) return;

    let s = { ...state, gateProgress: { ...state.gateProgress } };

    // Gate als abgeschlossen markieren
    s.gateProgress[gate.id] = { ...prev, completed: true, rewardClaimed: true };

    // XP vergeben
    s.xp      = (s.xp      || 0) + gate_def.reward.xp;
    s.totalXP = (s.totalXP || 0) + gate_def.reward.xp;
    s.lastActiveDay = getTodayStr();

    // XP-History updaten
    const wk = getWeekStr();
    const hist = [...(s.xpHistory || [])];
    const last = hist[hist.length - 1];
    if (last && last.w === wk) last.v += gate_def.reward.xp;
    else hist.push({ w:wk, v:gate_def.reward.xp, l:new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}) });
    s.xpHistory = hist.slice(-24);

    // Affinity vergeben
    s.player = { ...s.player, affinities: { ...s.player.affinities } };
    for (const [pathId, pts] of Object.entries(gate_def.reward.affinity || {})) {
      s.player.affinities[pathId] = (s.player.affinities[pathId] || 0) + pts;
    }

    // Titel vergeben (nicht doppelt)
    if (gate_def.reward.title) {
      const titles = s.player.titles || [];
      if (!titles.includes(gate_def.reward.title)) {
        s.player = { ...s.player, titles: [...titles, gate_def.reward.title] };
        // Ersten Titel automatisch als aktiv setzen
        if (!s.player.activeTitle) {
          s.player = { ...s.player, activeTitle: gate_def.reward.title };
        }
      }
    }

    // Level-up prüfen
    let xpNeeded = XP_PER_LEVEL(s.rank, s.level);
    while (s.xp >= xpNeeded) {
      s.xp -= xpNeeded;
      const gl = getGlobalLevel(s.rank, s.level);
      if (gl < TOTAL_LEVELS) {
        const next = getRankFromGlobal(gl + 1);
        const rankUp = next.rank !== s.rank;
        s.rank = next.rank; s.level = next.level;
        setLevelUpAnim({ rank: s.rank, level: s.level, rankUp });
        setTimeout(() => setLevelUpAnim(null), 2800);
        if (rankUp) showNotif(`⚡ RANK UP! ${RANK_COLORS[s.rank].label.toUpperCase()}`, RANK_COLORS[s.rank].primary);
        else showNotif(`↑ LEVEL UP! ${s.rank}-Rank Lv.${s.level}`, "#00ffff");
        xpNeeded = XP_PER_LEVEL(s.rank, s.level);
      } else break;
    }

    setState(s); saveData("arise_v3", s);
    haptic("heavy");
    showNotif(`◈ GATE CLEARED! +${gate_def.reward.xp} XP`, gate_def.color || "#f59e0b");
    setTimeout(() => checkAchievements(s, bodyEntries), 100);
  };

  // ── SETUP SCREEN ──
  if(!state) return (
    <div style={{ minHeight:"100vh",background:"#050508",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif",backgroundImage:"radial-gradient(ellipse at 50% 0%,#0d0d2b,#050508 60%)",padding:24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{ textAlign:"center",marginBottom:40 }}>
        <div style={{ fontSize:"0.65rem",letterSpacing:"0.4em",color:"#1e2a3a",marginBottom:14 }}>SYSTEM NOTIFICATION</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(2.5rem,10vw,4.5rem)",fontWeight:900,background:"linear-gradient(135deg,#00ffff,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1,marginBottom:8 }}>ARISE</div>
        <div style={{ color:"#1e2a3a",fontSize:"0.78rem",letterSpacing:"0.25em" }}>YOU HAVE BEEN CHOSEN TO LEVEL UP</div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #1a1a3e",borderRadius:16,padding:"28px 24px",width:"100%",maxWidth:380 }}>
        <div style={{ color:"#4a5568",fontSize:"0.82rem",marginBottom:22,lineHeight:1.6 }}>Das System hat dich erkannt. Dein Erwachen beginnt jetzt. Wähle deinen Namen.</div>
        <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCreate()} placeholder="Dein Name..." style={{ width:"100%",background:"rgba(0,255,255,0.03)",border:"1px solid #00ffff22",borderRadius:10,padding:"13px 15px",color:"#e2e8f0",fontSize:"1rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:14,letterSpacing:"0.05em" }}/>
        <button onClick={handleCreate} style={{ width:"100%",background:"linear-gradient(135deg,#00ffff18,#8b5cf625)",border:"1px solid #00ffff44",color:"#00ffff",borderRadius:10,padding:13,fontSize:"0.95rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.15em",cursor:"pointer" }}>SYSTEM INITIALISIEREN</button>
      </div>
    </div>
  );

  // ── COMPUTED ──
  const rc = RANK_COLORS[state.rank];
  const xpNeeded = XP_PER_LEVEL(state.rank, state.level);
  const xpPct = Math.min((state.xp/xpNeeded)*100,100);
  const globalLvl = getGlobalLevel(state.rank, state.level);
  const currentDB = CHALLENGES_DB[state.rank]||{daily:[],weekly:[],milestones:[]};
  const allMilestones = Object.entries(CHALLENGES_DB).filter(([r])=>RANKS.indexOf(r)<=RANKS.indexOf(state.rank)).flatMap(([,v])=>v.milestones);
  const customQuests = state.customQuests||[];
  const todayDone = currentDB.daily.filter(c=>state.completedChallenges?.includes(c.id)).length;
  const totalMilestonesDone = Object.values(CHALLENGES_DB).flatMap(r=>r.milestones).filter(c=>state.completedChallenges?.includes(c.id)).length;
  const unlockedAchievements = ACHIEVEMENTS.filter(a=>(state.unlockedAchievements||[]).includes(a.id));

  // Personalisierte Quests aus Interessen generieren
  const personalizedQuests = generatePersonalizedQuests(state.player?.preferences);

  // System-Analyse aus Quest-Verlauf
  const sysAnalysis = analyzeSystem(state.questHistory, state.player?.affinities);

  // Gate-Daten
  const gateProgress      = state.gateProgress || {};
  const recommendedGates  = getRecommendedGates(sysAnalysis, gateProgress);

  // Recovery-Quests
  const completedTodayIds = (state.completedChallenges || []);
  const balanceAreas      = state.player?.preferences?.balanceAreas || [];
  const recoveryQuests    = getRecoveryQuests(sysAnalysis, completedTodayIds, state.currentStreak || 0, balanceAreas);
  const recoveryHint      = getRecoveryHint(sysAnalysis, completedTodayIds, state.currentStreak || 0);

  let displayChallenges = [...currentDB.daily, ...currentDB.weekly, ...allMilestones, ...customQuests, ...personalizedQuests, ...recoveryQuests];
  if(showTodayOnly) displayChallenges = displayChallenges.filter(c=>c.type==="daily"&&!state.completedChallenges?.includes(c.id));
  if(filterType!=="all") displayChallenges = displayChallenges.filter(c=>c.type===filterType);
  if(filterType==="personalized") displayChallenges = personalizedQuests;
  if(filterType==="recovery")     displayChallenges = recoveryQuests;
  if(filterCat!=="all")  displayChallenges = displayChallenges.filter(c=>c.cat===filterCat);
  if(sortBy==="xp") displayChallenges = [...displayChallenges].sort((a,b)=>b.xp-a.xp);
  const availableCats=[...new Set([...currentDB.daily,...currentDB.weekly,...allMilestones,...customQuests,...personalizedQuests,...recoveryQuests].map(c=>c.cat))];

  // Body chart data
  const bodyChartData = bodyEntries.slice().reverse().map(e=>({ v:parseFloat(e[bodyMetric])||0, l:e.date?.split(".").slice(0,2).join(".") })).filter(d=>d.v>0);
  const bodyMetrics = [{k:"weight",l:"Gewicht",u:"kg",c:"#22c55e"},{k:"bf",l:"KF",u:"%",c:"#f59e0b"},{k:"bench",l:"Bench",u:"kg",c:"#ef4444"},{k:"squat",l:"Squat",u:"kg",c:"#8b5cf6"},{k:"deadlift",l:"DL",u:"kg",c:"#f97316"},{k:"pullups",l:"Pull",u:"",c:"#3b82f6"},{k:"run5k",l:"5km",u:"min",c:"#ec4899"}];
  const activeMetric = bodyMetrics.find(m=>m.k===bodyMetric)||bodyMetrics[0];

  const navItems = [
    {id:"profile",icon:"◈",label:"Status"},
    {id:"quests", icon:"◉",label:"Quests"},
    {id:"body",   icon:"◆",label:"Körper"},
    {id:"stats",  icon:"▲",label:"Stats"},
    {id:"more",   icon:"⊕",label:"System"},
  ];

  // Build stat history from completed milestones
  const buildStatHistory = (statKey) => {
    const allM = Object.values(CHALLENGES_DB).flatMap(r=>r.milestones);
    const relevant = allM.filter(m=>(m.subStat||m.stat)===statKey && state.completedChallenges?.includes(m.id));
    // Sort by rank order as proxy for time (we don't store completion timestamps)
    relevant.sort((a,b)=>{
      const ra=Object.entries(CHALLENGES_DB).find(([,v])=>v.milestones.includes(a))?.[0]||"E";
      const rb=Object.entries(CHALLENGES_DB).find(([,v])=>v.milestones.includes(b))?.[0]||"E";
      return RANKS.indexOf(ra)-RANKS.indexOf(rb);
    });
    let cumulative = 0;
    return relevant.map(m=>{ cumulative+=m.statPts; return { v:cumulative, l:m.title.slice(0,14), pts:m.statPts, title:m.title }; });
  };

  return (
    <>
    {showSplash && <SplashScreen rankColor={rc.primary}/>}
    <div style={{ minHeight:"100dvh",background:rc.bg,fontFamily:"'Rajdhani',sans-serif",color:"#e2e8f0",backgroundImage:`${rc.pattern}, radial-gradient(ellipse at 50% -5%,${rc.glow},transparent 55%)`,maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",paddingTop:"env(safe-area-inset-top)",paddingLeft:"env(safe-area-inset-left)",paddingRight:"env(safe-area-inset-right)",transition:"background 1s ease" }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeInOut{0%{opacity:0;transform:scale(.85)}15%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0}} @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}} @keyframes glitch{0%,100%{transform:translate(0)}25%{transform:translate(-2px,1px)}75%{transform:translate(2px,-1px)}} @keyframes statModal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes splashOut{from{opacity:1}to{opacity:0;pointer-events:none}} @keyframes splashPulse{0%{opacity:0;transform:scale(0.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}} @keyframes splashFade{from{opacity:0}to{opacity:1}} @keyframes splashBar{from{width:0%}to{width:100%}} @keyframes sectionOpen{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}} *{-webkit-tap-highlight-color:transparent;} input,select,textarea{-webkit-appearance:none;background-color:rgba(255,255,255,0.04)!important;color:#e2e8f0!important;} input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #0d0d17 inset!important;-webkit-text-fill-color:#e2e8f0!important;} input::placeholder{color:#2d3748;} html,body{background:${rc.bg} !important; transition:background 1s ease;} @supports(padding:max(0px)){.safe-bottom{padding-bottom:max(18px,env(safe-area-inset-bottom))}}`}</style>

      {/* Level Up overlay */}
      {levelUpAnim && (
        <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.9)",animation:"fadeInOut 2.8s ease forwards",pointerEvents:"none" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(2rem,10vw,3.5rem)",fontWeight:900,color:rc.primary,textShadow:`0 0 30px ${rc.primary}`,animation:"glitch 0.4s infinite",letterSpacing:"0.08em" }}>{levelUpAnim.rankUp?"RANK UP!":"LEVEL UP"}</div>
            <div style={{ color:"#555",fontSize:"0.9rem",marginTop:8,letterSpacing:"0.25em" }}>{levelUpAnim.rank}-RANK · LV.{levelUpAnim.level}</div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && <div style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.94)",border:`1px solid ${notification.color}44`,borderRadius:10,padding:"9px 18px",color:notification.color,fontFamily:"'Orbitron',sans-serif",fontSize:"0.72rem",letterSpacing:"0.08em",zIndex:500,whiteSpace:"nowrap",animation:"fadeInOut 3.5s ease" }}>{notification.msg}</div>}

      {/* Achievement popup */}
      {newAchievements.length > 0 && (
        <div style={{ position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:499,animation:"slideDown 0.3s ease",display:"flex",flexDirection:"column",gap:6,minWidth:220 }}>
          {newAchievements.map(a=>(
            <div key={a.id} style={{ background:"rgba(0,0,0,0.95)",border:"1px solid #f59e0b55",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:"1.2rem" }}>{a.icon}</span>
              <div>
                <div style={{ color:"#f59e0b",fontSize:"0.72rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.08em" }}>ACHIEVEMENT</div>
                <div style={{ color:"#e2e8f0",fontSize:"0.82rem",fontWeight:700 }}>{a.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Titles popup */}
      {newTitles.length > 0 && (
        <div style={{ position:"fixed",top:newAchievements.length>0?120:60,left:"50%",transform:"translateX(-50%)",zIndex:498,animation:"slideDown 0.3s ease",display:"flex",flexDirection:"column",gap:6,minWidth:220 }}>
          {newTitles.map(t=>(
            <div key={t.id} style={{ background:"rgba(0,0,0,0.95)",border:`1px solid ${t.color}55`,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:"1.2rem" }}>{t.icon}</span>
              <div>
                <div style={{ color:t.color,fontSize:"0.72rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.08em" }}>TITEL FREIGESCHALTET</div>
                <div style={{ color:"#e2e8f0",fontSize:"0.82rem",fontWeight:700 }}>{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quest Feedback Moment */}
      {questFeedback && (
        <div style={{ position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",zIndex:497,animation:"slideDown 0.25s ease",pointerEvents:"none" }}>
          <div style={{ background:"rgba(0,0,0,0.92)",border:"1px solid #ffffff18",borderRadius:12,padding:"12px 18px",display:"flex",flexDirection:"column",gap:5,minWidth:180 }}>
            {/* XP */}
            <div style={{ display:"flex",alignItems:"center",gap:7 }}>
              <span style={{ color:"#22c55e",fontSize:"1rem",fontFamily:"'Orbitron',sans-serif",fontWeight:900 }}>+{questFeedback.xp} XP</span>
            </div>
            {/* Stat up */}
            {questFeedback.statKey && (
              <div style={{ fontSize:"0.7rem",color:"#f59e0b" }}>
                ★ +{questFeedback.statPts} {questFeedback.statKey} stat
              </div>
            )}
            {/* Path affinity gains */}
            {Object.entries(questFeedback.pathGains || {}).map(([pathId, pts]) => (
              <div key={pathId} style={{ fontSize:"0.66rem",color:PATHS[pathId]?.color||"#aaa" }}>
                {PATHS[pathId]?.icon} {PATHS[pathId]?.name} +{pts}
              </div>
            ))}
            {/* New title hint */}
            {(questFeedback.newTitles || []).map(id => {
              const t = TITLES.find(tt => tt.id === id);
              return t ? (
                <div key={id} style={{ fontSize:"0.66rem",color:t.color }}>
                  {t.icon} Titel: {t.title}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Stat Detail Modal */}
      {selectedStat && (() => {
        const sc = [...STATS_CONFIG, ...Object.entries(SUB_STATS).map(([k,v])=>({key:k,...v}))].find(s=>s.key===selectedStat);
        if(!sc) return null;
        const history = buildStatHistory(selectedStat);
        const currentVal = state.stats[selectedStat]||0;
        return (
          <div onClick={()=>setSelectedStat(null)} style={{ position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 80px" }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:rc.bg,border:`1px solid ${sc.color}44`,borderRadius:"20px 20px 0 0",padding:"24px 20px",width:"100%",maxWidth:480,animation:"statModal 0.25s ease",maxHeight:"70vh",overflowY:"auto" }}>
              {/* Header */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:12,background:`${sc.color}18`,border:`1px solid ${sc.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem" }}>{sc.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.1rem",color:sc.color,textShadow:`0 0 10px ${sc.color}88` }}>{sc.label||selectedStat}</div>
                    <div style={{ fontSize:"0.68rem",color:"#334155" }}>{sc.desc||""}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.8rem",fontWeight:900,color:sc.color,textShadow:`0 0 12px ${sc.color}`,lineHeight:1 }}>{currentVal}</div>
                  <div style={{ fontSize:"0.6rem",color:"#1e293b",letterSpacing:"0.1em" }}>PUNKTE</div>
                </div>
              </div>

              {/* Chart or empty state */}
              {history.length >= 2 ? (
                <div style={{ marginBottom:18 }}>
                  <div style={{ fontSize:"0.56rem",letterSpacing:"0.2em",color:"#1e293b",marginBottom:8 }}>STAT-ENTWICKLUNG</div>
                  <MiniChart data={history} color={sc.color} height={70}/>
                </div>
              ) : history.length === 1 ? (
                <div style={{ background:`${sc.color}08`,border:`1px solid ${sc.color}22`,borderRadius:10,padding:"12px",marginBottom:18,textAlign:"center" }}>
                  <div style={{ color:sc.color,fontSize:"0.8rem",fontWeight:700,marginBottom:2 }}>Erster Meilenstein erreicht</div>
                  <div style={{ color:"#334155",fontSize:"0.72rem" }}>Schließe weitere Meilensteine ab um den Verlauf zu sehen</div>
                </div>
              ) : (
                <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:10,padding:"16px",marginBottom:18,textAlign:"center" }}>
                  <div style={{ color:"#1e293b",fontSize:"0.8rem",marginBottom:4 }}>Noch keine Meilensteine abgeschlossen</div>
                  <div style={{ color:"#111",fontSize:"0.7rem" }}>Schließe einen Meilenstein ab um deinen ersten Punkt zu verdienen</div>
                </div>
              )}

              {/* Completed milestones list */}
              {history.length > 0 && (
                <div>
                  <div style={{ fontSize:"0.56rem",letterSpacing:"0.2em",color:"#1e293b",marginBottom:8 }}>FREIGESCHALTETE MEILENSTEINE</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    {history.map((h,i)=>(
                      <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.02)",border:"1px solid #0a0a14",borderRadius:8,padding:"9px 12px" }}>
                        <div style={{ flex:1,fontSize:"0.78rem",color:"#94a3b8",fontWeight:600 }}>{h.title}</div>
                        <span style={{ color:sc.color,fontSize:"0.76rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif",marginLeft:8,flexShrink:0 }}>+{h.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={()=>setSelectedStat(null)} style={{ width:"100%",marginTop:18,background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",color:"#334155",borderRadius:10,padding:"12px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em" }}>SCHLIESSEN</button>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div style={{ padding:"16px 18px 13px",borderBottom:`1px solid ${rc.primary}18`,background:rc.headerBg,backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:100,transition:"background 1s ease" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <div>
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.35em",color:"#1e293b",marginBottom:1 }}>HUNTER</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.95rem",fontWeight:900,color:"#e2e8f0",letterSpacing:"0.06em" }}>{state.name}</div>
            {/* Active Title badge */}
            {state.player?.activeTitle && (() => {
              const t = TITLES.find(tt => tt.title === state.player.activeTitle) || { color:"#f59e0b", icon:"★" };
              return (
                <div style={{ fontSize:"0.58rem",color:t.color,marginTop:2,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em" }}>
                  {t.icon} {state.player.activeTitle}
                </div>
              );
            })()}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {/* Streak badge */}
            {(state.currentStreak||0) > 0 && (
              <div style={{ background:"rgba(245,158,11,0.12)",border:"1px solid #f59e0b33",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:5 }}>
                <span style={{ fontSize:"0.9rem" }}>🔥</span>
                <div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.78rem",fontWeight:900,color:"#f59e0b",lineHeight:1 }}>{state.currentStreak}</div>
                  <div style={{ fontSize:"0.5rem",color:"#78350f",letterSpacing:"0.1em" }}>STREAK</div>
                </div>
              </div>
            )}
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.2rem",fontWeight:900,color:rc.primary,textShadow:`0 0 10px ${rc.primary}` }}>{state.rank}<span style={{ fontSize:"0.6rem",color:"#1e293b",marginLeft:3 }}>Rank</span></div>
              <div style={{ fontSize:"0.6rem",color:"#334155" }}>Lv.{state.level} · {rc.label}</div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
            <span style={{ fontSize:"0.58rem",color:"#1e293b",letterSpacing:"0.1em" }}>EXP</span>
            <span style={{ fontSize:"0.58rem",color:rc.primary }}>{state.xp} / {xpNeeded}</span>
          </div>
          <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:4,height:5,overflow:"hidden" }}>
            <div style={{ width:`${xpPct}%`,height:"100%",background:`linear-gradient(90deg,${rc.primary}44,${rc.primary})`,boxShadow:`0 0 8px ${rc.primary}88`,borderRadius:4,transition:"width 0.8s ease" }}/>
          </div>
          <div style={{ fontSize:"0.56rem",color:"#334155",marginTop:3,transition:"all 0.3s" }}>
            {view==="quests" && `Heute: ${todayDone}/${currentDB.daily.length} tägl. erledigt · ${totalMilestonesDone} Meilensteine`}
            {view==="profile" && `Global Lv.${globalLvl}/${TOTAL_LEVELS} · ${(state.totalXP||0).toLocaleString()} XP gesamt`}
            {view==="body" && (bodyEntries.length > 0 ? `Letzter Check-In: ${bodyEntries[0].date}` : "Noch kein Check-In — trag deinen ersten ein")}
            {view==="stats" && `${Object.values(state.stats||{}).reduce((a,b)=>a+b,0)} Stat-Punkte insgesamt`}
            {view==="more" && `${unlockedAchievements.length}/${ACHIEVEMENTS.length} Achievements · System v2`}
          </div>
        </div>
      </div>

      {/* CONTENT — swipe between tabs */}
      <div style={{ flex:1,overflowY:"auto",padding:"15px 13px 110px" }}
        onTouchStart={e=>{ const t=e.touches[0]; e.currentTarget._touchX=t.clientX; e.currentTarget._touchY=t.clientY; }}
        onTouchEnd={e=>{
          const dx=e.changedTouches[0].clientX-(e.currentTarget._touchX||0);
          const dy=e.changedTouches[0].clientY-(e.currentTarget._touchY||0);
          if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) {
            const tabs=["profile","quests","body","stats","more"];
            const ci=tabs.indexOf(view);
            if(dx<0 && ci<tabs.length-1) { setView(tabs[ci+1]); haptic("light"); }
            else if(dx>0 && ci>0) { setView(tabs[ci-1]); haptic("light"); }
          }
        }}
      >

        {/* ── PROFILE — HUNTER STATUS SCREEN ── */}
        {view==="profile" && (
          <div>

            {/* ── HUNTER STATUS CARD ── */}
            <div style={{ background:`linear-gradient(135deg,${rc.primary}0a,${rc.primary}18)`,border:`1px solid ${rc.primary}33`,borderRadius:14,padding:"16px",marginBottom:12,position:"relative",overflow:"hidden" }}>
              {/* Watermark rank letter */}
              <div style={{ position:"absolute",top:-12,right:-4,fontSize:"7rem",opacity:0.04,fontFamily:"'Orbitron',sans-serif",fontWeight:900,color:rc.primary,lineHeight:1,pointerEvents:"none",userSelect:"none" }}>{state.rank}</div>

              {/* Top row: label + rank badge */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:"0.52rem",letterSpacing:"0.3em",color:`${rc.primary}88`,marginBottom:3 }}>HUNTER STATUS</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.5rem",color:rc.primary,textShadow:`0 0 18px ${rc.primary}88`,lineHeight:1 }}>
                    {state.rank}-Rank
                  </div>
                  <div style={{ fontSize:"0.7rem",color:"#4a5568",marginTop:3 }}>
                    {rc.label} · Lv.{state.level}/{LEVELS_PER_RANK}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"0.52rem",color:"#1e293b",letterSpacing:"0.08em",marginBottom:2 }}>GLOBAL</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.2rem",fontWeight:900,color:rc.primary,lineHeight:1 }}>
                    {globalLvl}<span style={{ fontSize:"0.6rem",color:"#334155" }}>/{TOTAL_LEVELS}</span>
                  </div>
                  <div style={{ fontSize:"0.52rem",color:"#1e293b",marginTop:2 }}>{(state.totalXP||0).toLocaleString()} XP</div>
                </div>
              </div>

              {/* EXP bar */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                  <span style={{ fontSize:"0.54rem",color:"#1e293b",letterSpacing:"0.12em" }}>EXP TO NEXT LEVEL</span>
                  <span style={{ fontSize:"0.58rem",color:rc.primary,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{state.xp} / {xpNeeded}</span>
                </div>
                <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:4,height:5,overflow:"hidden" }}>
                  <div style={{ width:`${xpPct}%`,height:"100%",background:`linear-gradient(90deg,${rc.primary}44,${rc.primary})`,boxShadow:`0 0 10px ${rc.primary}88`,borderRadius:4,transition:"width 0.8s ease" }}/>
                </div>
              </div>

              {/* Rank progression dots */}
              <div style={{ display:"flex",gap:3 }}>
                {RANKS.map((r,i)=>{
                  const ci=RANKS.indexOf(state.rank),passed=i<ci,active=i===ci;
                  const rC=RANK_COLORS[r].primary;
                  return (
                    <div key={r} style={{ flex:1,textAlign:"center" }}>
                      <div style={{ height:3,borderRadius:3,background:passed?rC:active?`${rC}88`:"#0d0d17",boxShadow:active?`0 0 6px ${rC}`:"none",transition:"all 0.3s" }}/>
                      <div style={{ fontSize:"0.42rem",marginTop:2,color:passed||active?rC:"#1e1e30",fontWeight:700 }}>{r}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── MAIN PATH + SECONDARY PATH ── */}
            {(() => {
              const mainPath  = state.player?.mainPath;
              const secPath   = state.player?.secondaryPath;
              const hasEither = mainPath || secPath;
              return hasEither ? (
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12 }}>
                  {[
                    { label:"MAIN PATH",      path:mainPath,  dimIfEmpty:true },
                    { label:"SECONDARY PATH", path:secPath,   dimIfEmpty:true },
                  ].map(({ label, path }) => {
                    const p = path ? PATHS[path] : null;
                    return (
                      <div key={label} style={{ background:p?`${p.color}0c`:"rgba(255,255,255,0.02)",border:`1px solid ${p?p.color+"33":"#0d0d1a"}`,borderRadius:10,padding:"10px 12px" }}>
                        <div style={{ fontSize:"0.5rem",letterSpacing:"0.14em",color:"#334155",marginBottom:4 }}>{label}</div>
                        {p ? (
                          <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                            <span style={{ fontSize:"1.1rem" }}>{p.icon}</span>
                            <div>
                              <div style={{ fontSize:"0.8rem",fontWeight:700,color:p.color,fontFamily:"'Rajdhani',sans-serif" }}>{p.name}</div>
                              <div style={{ fontSize:"0.58rem",color:"#334155",lineHeight:1.3,marginTop:1 }}>{p.focus}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ color:"#1e293b",fontSize:"0.68rem" }}>—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null;
            })()}

            {/* ── QUICK STATS: Streak / XP / Milestones / Quests ── */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:12 }}>
              {[
                { label:"Streak",   val:`${state.currentStreak||0}`, suffix:"🔥", color:"#f59e0b" },
                { label:"Rekord",   val:`${state.longestStreak||0}`,  suffix:"🔥", color:"#f97316" },
                { label:"Total XP", val:(state.totalXP||0)>=1000?`${((state.totalXP||0)/1000).toFixed(1)}k`:`${state.totalXP||0}`, suffix:"", color:"#00ffff" },
                { label:"Meilst.",  val:`${totalMilestonesDone}`,     suffix:"★",  color:rc.primary },
              ].map(item=>(
                <div key={item.label} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:9,padding:"8px 5px",textAlign:"center" }}>
                  <div style={{ fontSize:"0.92rem",fontWeight:700,color:item.color,fontFamily:"'Rajdhani',sans-serif",lineHeight:1.1 }}>
                    {item.val}{item.suffix}
                  </div>
                  <div style={{ fontSize:"0.52rem",color:"#1e293b",letterSpacing:"0.07em",marginTop:2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* ── XP HISTORY ── */}
            {(state.xpHistory||[]).length >= 2 && (
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:12,padding:"12px",marginBottom:12 }}>
                <MiniChart data={state.xpHistory.map(h=>({v:h.v,l:h.l}))} color={rc.primary} height={52} label="AWAKENING PROGRESS — XP PRO WOCHE"/>
              </div>
            )}

            {/* ── KERN-STATS ── */}
            <div style={{ fontSize:"0.54rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:8 }}>
              HUNTER STATS <span style={{ color:"#111",fontSize:"0.48rem",letterSpacing:"0.1em" }}>· TIPPEN FÜR DETAILS</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10 }}>
              {STATS_CONFIG.filter(s=>!["SOC","REL","APP"].includes(s.key)).map(sc=>(
                <StatBar key={sc.key} label={sc.key} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color} onClick={()=>setSelectedStat(sc.key)}/>
              ))}
            </div>
            <div style={{ fontSize:"0.54rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:8 }}>CHARISMA</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14 }}>
              {["SOC","REL","APP"].map(k=>(
                <StatBar key={k} label={k} icon={SUB_STATS[k].icon} value={state.stats[k]||0} max={Math.max(10,(state.stats[k]||0)*1.8+5)} color={SUB_STATS[k].color} small onClick={()=>setSelectedStat(k)}/>
              ))}
            </div>

            {/* ── PATH AFFINITY ── */}
            {(() => {
              const affinities = state.player?.affinities || {};
              const sorted = Object.entries(affinities)
                .filter(([k]) => k !== "shadow")
                .sort(([,a],[,b]) => b - a)
                .filter(([,v]) => v > 0);
              if (sorted.length === 0) return null;
              const maxAff = sorted[0][1];
              return (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:"0.54rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:8 }}>PATH AFFINITY</div>
                  <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:10,padding:"11px 12px",display:"flex",flexDirection:"column",gap:7 }}>
                    {sorted.slice(0,5).map(([pathId, val]) => {
                      const p = PATHS[pathId];
                      const pct = Math.min((val / Math.max(maxAff, 1)) * 100, 100);
                      return (
                        <div key={pathId}>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                            <span style={{ fontSize:"0.68rem",color:p?.color||"#aaa" }}>{p?.icon} {p?.name}</span>
                            <span style={{ fontSize:"0.66rem",color:"#334155",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{val}</span>
                          </div>
                          <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:3,height:3 }}>
                            <div style={{ width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${p?.color||"#aaa"}55,${p?.color||"#aaa"})`,borderRadius:3,transition:"width 0.6s ease",boxShadow:`0 0 5px ${p?.color||"#aaa"}66` }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── TITLES ── */}
            {(state.player?.titles || []).length > 0 && (() => {
              const playerTitles = state.player.titles || [];
              const activeTitle  = state.player.activeTitle;
              return (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:"0.54rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:8 }}>TITEL ({playerTitles.length})</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                    {playerTitles.map(titleStr => {
                      const t = TITLES.find(tt => tt.title === titleStr) || { color:"#f59e0b",icon:"★",title:titleStr };
                      const isActive = activeTitle === titleStr;
                      return (
                        <button key={titleStr} onClick={()=>{
                          const s2 = { ...state, player: { ...state.player, activeTitle: titleStr }};
                          setState(s2); saveData("arise_v3", s2);
                          showNotif(`${t.icon} Aktiver Titel: ${titleStr}`, t.color);
                        }} style={{ background:isActive?`${t.color}22`:"rgba(255,255,255,0.03)",border:`1px solid ${isActive?t.color+"55":"#1a1a2e"}`,color:isActive?t.color:"#4a5568",borderRadius:20,padding:"4px 11px",fontSize:"0.66rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:4,transition:"all 0.15s" }}>
                          <span style={{ fontSize:"0.75rem" }}>{t.icon}</span>{titleStr}
                          {isActive && <span style={{ fontSize:"0.55rem",color:t.color }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── ACHIEVEMENTS PREVIEW ── */}
            {unlockedAchievements.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:"0.54rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:8 }}>ACHIEVEMENTS ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                  {unlockedAchievements.map(a=>(
                    <div key={a.id} style={{ background:"rgba(245,158,11,0.07)",border:"1px solid #f59e0b1a",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:"0.85rem" }}>{a.icon}</span>
                      <span style={{ fontSize:"0.7rem",color:"#f59e0b",fontWeight:700 }}>{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SYSTEM ANALYSIS ── */}
            {(() => {
              const affinities      = state.player?.affinities || {};
              const mainPath        = state.player?.mainPath;
              const secPath         = state.player?.secondaryPath;
              const shadowUnlockable= canUnlockShadow(affinities);
              const showSuggestion  = sysAnalysis.suggestedMainPath && (!mainPath || !secPath);
              const msg             = sysAnalysis.suggestedMessage;

              return (
                <div style={{ marginBottom:8 }}>
                  <div style={{ background:"rgba(0,255,255,0.04)",border:"1px solid #00ffff1e",borderRadius:10,padding:"13px" }}>
                    <div style={{ fontSize:"0.52rem",letterSpacing:"0.2em",color:"#00ffff66",marginBottom:6 }}>SYSTEM ANALYSIS</div>

                    <div style={{ fontSize:"0.76rem",color:"#64748b",lineHeight:1.55,marginBottom:sysAnalysis.dominantPaths.length>0?8:0 }}>
                      {msg || "Schließe weitere Quests ab, damit dein System deinen Pfad erkennt."}
                    </div>

                    {sysAnalysis.dominantPaths.length > 0 && (
                      <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:sysAnalysis.balanceHints.length>0||showSuggestion?8:0 }}>
                        {sysAnalysis.dominantPaths.map(pathId => {
                          const p = PATHS[pathId];
                          const cnt = sysAnalysis.pathCounts[pathId] || 0;
                          return (
                            <span key={pathId} style={{ background:`${p?.color}14`,border:`1px solid ${p?.color}2a`,color:p?.color,borderRadius:20,padding:"3px 9px",fontSize:"0.6rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
                              {p?.icon} {p?.name} ×{cnt}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {sysAnalysis.balanceHints.length > 0 && (
                      <div style={{ display:"flex",flexDirection:"column",gap:3,marginBottom:showSuggestion?8:0 }}>
                        {sysAnalysis.balanceHints.map((hint,i) => (
                          <div key={i} style={{ fontSize:"0.64rem",color:"#475569",display:"flex",alignItems:"center",gap:5 }}>
                            <span>{hint.icon}</span><span>{hint.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {showSuggestion && (
                      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:8 }}>
                        {!mainPath && sysAnalysis.suggestedMainPath && (
                          <button onClick={()=>{
                            const s2 = { ...state, player:{ ...state.player, mainPath: sysAnalysis.suggestedMainPath }};
                            setState(s2); saveData("arise_v3", s2);
                            showNotif(`◈ Main Path: ${PATHS[sysAnalysis.suggestedMainPath]?.name}`, PATHS[sysAnalysis.suggestedMainPath]?.color);
                          }} style={{ background:`${PATHS[sysAnalysis.suggestedMainPath]?.color}16`,border:`1px solid ${PATHS[sysAnalysis.suggestedMainPath]?.color}44`,color:PATHS[sysAnalysis.suggestedMainPath]?.color,borderRadius:7,padding:"7px 12px",fontSize:"0.67rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.05em" }}>
                            Als Main Path übernehmen
                          </button>
                        )}
                        {!secPath && sysAnalysis.suggestedSecondaryPath && (
                          <button onClick={()=>{
                            const s2 = { ...state, player:{ ...state.player, secondaryPath: sysAnalysis.suggestedSecondaryPath }};
                            setState(s2); saveData("arise_v3", s2);
                            showNotif(`◈ Secondary Path: ${PATHS[sysAnalysis.suggestedSecondaryPath]?.name}`, PATHS[sysAnalysis.suggestedSecondaryPath]?.color);
                          }} style={{ background:`${PATHS[sysAnalysis.suggestedSecondaryPath]?.color}12`,border:`1px solid ${PATHS[sysAnalysis.suggestedSecondaryPath]?.color}33`,color:PATHS[sysAnalysis.suggestedSecondaryPath]?.color,borderRadius:7,padding:"7px 12px",fontSize:"0.67rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.05em" }}>
                            Als Secondary Path
                          </button>
                        )}
                      </div>
                    )}

                    {shadowUnlockable && (
                      <div style={{ marginTop:10,display:"flex",alignItems:"center",gap:7 }}>
                        <span style={{ fontSize:"1rem" }}>🌑</span>
                        <div style={{ fontSize:"0.67rem",color:"#00ffff55",lineHeight:1.4 }}>Shadow Monarch Path verfügbar — meistere alle Pfade.</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* ── QUESTS ── */}
        {view==="quests" && (
          <div>
            {/* Quest Progress Widget */}
            {(() => {
              const totalDaily = currentDB.daily.length;
              const doneDaily  = currentDB.daily.filter(c => state.completedChallenges?.includes(c.id)).length;
              const totalWeekly = currentDB.weekly.length;
              const doneWeekly  = currentDB.weekly.filter(c => state.completedChallenges?.includes(c.id)).length;
              const pctD = totalDaily  > 0 ? Math.round((doneDaily  / totalDaily)  * 100) : 0;
              const pctW = totalWeekly > 0 ? Math.round((doneWeekly / totalWeekly) * 100) : 0;
              return (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:12 }}>
                  {[
                    { label:"Daily",    done:doneDaily,  total:totalDaily,  pct:pctD, color:"#3b82f6" },
                    { label:"Weekly",   done:doneWeekly, total:totalWeekly, pct:pctW, color:"#8b5cf6" },
                  ].map(item => (
                    <div key={item.label} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:9,padding:"9px 11px" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:"0.58rem",color:"#334155",letterSpacing:"0.08em" }}>{item.label.toUpperCase()}</span>
                        <span style={{ fontSize:"0.68rem",color:item.pct===100?"#22c55e":item.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{item.done}/{item.total}</span>
                      </div>
                      <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:3,height:3,overflow:"hidden" }}>
                        <div style={{ width:`${item.pct}%`,height:"100%",background:item.pct===100?"#22c55e":`linear-gradient(90deg,${item.color}66,${item.color})`,borderRadius:3,transition:"width 0.5s ease",boxShadow:item.pct>0?`0 0 5px ${item.color}66`:"none" }}/>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Recovery Hint Banner */}
            {recoveryHint && (
              <div onClick={()=>setFilterType("recovery")} style={{ background:recoveryHint.urgent?"rgba(34,197,94,0.08)":"rgba(100,116,139,0.08)", border:`1px solid ${recoveryHint.urgent?"#22c55e33":"#33415533"}`, borderRadius:10, padding:"10px 13px", marginBottom:10, display:"flex", alignItems:"center", gap:8, cursor:"pointer", transition:"all 0.2s" }}>
                <span style={{ fontSize:"1rem" }}>{recoveryHint.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.7rem",color:recoveryHint.urgent?"#22c55e":"#64748b",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em" }}>{recoveryHint.text}</div>
                </div>
                <span style={{ fontSize:"0.6rem",color:"#334155" }}>→</span>
              </div>
            )}
            {/* Today filter + sort */}
            <div style={{ display:"flex",gap:7,marginBottom:10,alignItems:"center" }}>
              <button onClick={()=>setShowTodayOnly(v=>!v)} style={{ background:showTodayOnly?`${rc.primary}22`:"transparent",border:`1px solid ${showTodayOnly?rc.primary+"55":"#111"}`,color:showTodayOnly?rc.primary:"#334155",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
                {showTodayOnly?"● HEUTE OFFEN":"HEUTE OFFEN"}
              </button>
              <button onClick={()=>setSortBy(v=>v==="xp"?"default":"xp")} style={{ background:sortBy==="xp"?`${rc.primary}22`:"transparent",border:`1px solid ${sortBy==="xp"?rc.primary+"55":"#111"}`,color:sortBy==="xp"?rc.primary:"#334155",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
                {sortBy==="xp"?"● NACH XP":"NACH XP"}
              </button>
              <button onClick={()=>setShowCustomForm(v=>!v)} style={{ marginLeft:"auto",background:"rgba(6,182,212,0.1)",border:"1px solid #06b6d422",color:"#06b6d4",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em",whiteSpace:"nowrap" }}>+ EIGENE</button>
            </div>

            {/* Custom quest form */}
            {showCustomForm && (
              <div style={{ background:"rgba(6,182,212,0.06)",border:"1px solid #06b6d422",borderRadius:11,padding:"14px",marginBottom:12,animation:"slideDown 0.2s ease" }}>
                <div style={{ fontSize:"0.58rem",letterSpacing:"0.2em",color:"#06b6d4",marginBottom:10 }}>NEUE EIGENE QUEST</div>
                <input value={customForm.title} onChange={e=>setCustomForm(p=>({...p,title:e.target.value}))} placeholder="Quest-Name *" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:7 }}/>
                <input value={customForm.desc} onChange={e=>setCustomForm(p=>({...p,desc:e.target.value}))} placeholder="Beschreibung (optional)" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:7 }}/>
                <div style={{ display:"flex",gap:7,marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.58rem",color:"#334155",marginBottom:3 }}>XP</div>
                    <input value={customForm.xp} onChange={e=>setCustomForm(p=>({...p,xp:e.target.value}))} type="number" min="1" max="500" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ flex:2 }}>
                    <div style={{ fontSize:"0.58rem",color:"#334155",marginBottom:3 }}>Kategorie</div>
                    <select value={customForm.cat} onChange={e=>setCustomForm(p=>({...p,cat:e.target.value}))} style={{ width:"100%",background:"#0d0d17",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}>
                      {Object.entries(CAT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex",gap:7 }}>
                  <button onClick={addCustomQuest} style={{ flex:1,background:"linear-gradient(135deg,#06b6d418,#06b6d430)",border:"1px solid #06b6d444",color:"#06b6d4",borderRadius:8,padding:"9px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>SPEICHERN</button>
                  <button onClick={()=>setShowCustomForm(false)} style={{ flex:1,background:"transparent",border:"1px solid #1a1a2e",color:"#334155",borderRadius:8,padding:"9px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>ABBRECHEN</button>
                </div>
              </div>
            )}

            {/* Type filter */}
            <div style={{ display:"flex",gap:5,marginBottom:8,overflowX:"auto",paddingBottom:2 }}>
              {["all","daily","weekly","milestone","gate","recovery","personalized","custom"].map(f=>(
                <button key={f} onClick={()=>setFilterType(f)} style={{ background:filterType===f?`${rc.primary}18`:"transparent",border:`1px solid ${filterType===f?rc.primary+"44":"#111"}`,color:filterType===f?rc.primary:"#222",borderRadius:7,padding:"5px 11px",fontSize:"0.64rem",letterSpacing:"0.08em",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>
                  {f==="all"?"Alle":f==="daily"?"Daily":f==="weekly"?"Weekly":f==="milestone"?"Meilst.":f==="gate"?"◈ Gates":f==="recovery"?"💚 Recovery":f==="personalized"?"★ Für mich":"Eigene"}
                </button>
              ))}
            </div>
            {/* Category filter */}
            <div style={{ display:"flex",gap:5,marginBottom:14,overflowX:"auto",paddingBottom:2 }}>
              <button onClick={()=>setFilterCat("all")} style={{ background:filterCat==="all"?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat==="all"?rc.primary+"33":"#0d0d17"}`,color:filterCat==="all"?rc.primary:"#1e293b",borderRadius:6,padding:"4px 9px",fontSize:"0.6rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0 }}>Alle</button>
              {availableCats.map(cat=>(
                <button key={cat} onClick={()=>setFilterCat(cat)} style={{ background:filterCat===cat?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat===cat?rc.primary+"33":"#0d0d17"}`,color:filterCat===cat?rc.primary:"#1e293b",borderRadius:6,padding:"4px 9px",fontSize:"0.6rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>{CAT_LABELS[cat]||cat}</button>
              ))}
            </div>

            {/* Sectioned quest list */}
            {filterType === "gate" ? (
              /* ── GATE-ONLY VIEW ── */
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:4 }}>GATE QUESTS</div>
                {GATES.map(gate => {
                  const stepsDone = getGateStepsDone(gate.id, gateProgress);
                  const completed = isGateCompleted(gate.id, gateProgress);
                  const isRec     = recommendedGates.some(g => g.id === gate.id);
                  return (
                    <GateCard
                      key={gate.id}
                      gate={gate}
                      stepsDone={stepsDone}
                      completed={completed}
                      recommended={isRec}
                      onToggleStep={handleGateStepToggle}
                      onClaim={handleGateClaim}
                    />
                  );
                })}
              </div>
            ) : (showTodayOnly || filterType!=="all" || filterCat!=="all") ? (
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {displayChallenges.length===0 && <div style={{ color:"#1e293b",textAlign:"center",padding:"40px 0",fontSize:"0.85rem" }}>{showTodayOnly?"Alle heutigen Quests erledigt! ✓":"Keine Quests für diesen Filter."}</div>}
                {[...displayChallenges].sort((a,b)=>{
                  const da=state.completedChallenges?.includes(a.id)?1:0;
                  const db=state.completedChallenges?.includes(b.id)?1:0;
                  return da-db;
                }).map(c=>(
                  <div key={c.id} style={{ position:"relative" }}>
                    <ChallengeCard challenge={c} done={state.completedChallenges?.includes(c.id)} onComplete={handleComplete} rankColor={rc.primary}/>
                    {c.type==="custom" && !state.completedChallenges?.includes(c.id) && <button onClick={()=>deleteCustomQuest(c.id)} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:"#334155",fontSize:"0.8rem",cursor:"pointer",padding:4 }}>✕</button>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                {/* Empfohlene Gates — oben, außerhalb der Sections */}
                {recommendedGates.length > 0 && (
                  <div>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                      <span style={{ color:"#f59e0b",fontSize:"0.7rem" }}>◈</span>
                      <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:"#f59e0b" }}>GATE DETECTED</span>
                      <div style={{ flex:1,height:1,background:"#f59e0b22",borderRadius:1 }}/>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                      {recommendedGates.map(gate => (
                        <GateCard
                          key={gate.id}
                          gate={gate}
                          stepsDone={getGateStepsDone(gate.id, gateProgress)}
                          completed={isGateCompleted(gate.id, gateProgress)}
                          recommended={true}
                          onToggleStep={handleGateStepToggle}
                          onClaim={handleGateClaim}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {[
                  { key:"daily",     label:"DAILY QUESTS",     icon:"◈", items:currentDB.daily,   color:"#3b82f6", recommended:false },
                  { key:"weekly",    label:"WEEKLY QUESTS",    icon:"◉", items:currentDB.weekly,  color:"#8b5cf6", recommended:false },
                  { key:"milestone", label:"MEILENSTEINE",     icon:"★", items:allMilestones,     color:"#f59e0b", recommended:false },
                  { key:"custom",    label:"EIGENE QUESTS",    icon:"✦", items:customQuests,      color:"#06b6d4", recommended:false },
                  ...(personalizedQuests.length > 0 ? [
                    { key:"personalized", label:"FÜR MICH", icon:"★", items:personalizedQuests, color:"#a78bfa", recommended:true },
                  ] : []),
                  ...(recoveryQuests.length > 0 ? [
                    { key:"recovery", label:"SYSTEM RECOVERY", icon:"💚", items:recoveryQuests, color:"#22c55e", recommended:true },
                  ] : []),
                ].filter(s=>s.items.length>0).map(section=>{
                  const done=section.items.filter(c=>state.completedChallenges?.includes(c.id)).length;
                  const total=section.items.length;
                  const collapsed=collapsedSections[section.key];
                  const allDone=done===total;
                  return (
                    <div key={section.key}>
                      {/* Section header */}
                      <button onClick={()=>toggleSection(section.key)} style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:collapsed?0:8,padding:"2px 0",transition:"all 0.2s" }}>
                        <span style={{ color:allDone?"#22c55e":section.color,fontSize:"0.7rem" }}>{allDone?"✓":section.icon}</span>
                        <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:allDone?"#22c55e":section.color }}>{section.label}</span>
                        {section.recommended && !allDone && (
                          <span style={{ background:`${section.color}18`,border:`1px solid ${section.color}33`,color:section.color,borderRadius:20,padding:"1px 6px",fontSize:"0.5rem",letterSpacing:"0.06em",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>EMPFOHLEN</span>
                        )}
                        <div style={{ flex:1,height:1,background:`${allDone?"#22c55e":section.color}22`,borderRadius:1 }}/>
                        <span style={{ fontSize:"0.62rem",color:allDone?"#22c55e":"#334155",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{done}/{total}</span>
                        {/* Mini progress bar */}
                        <div style={{ width:28,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden" }}>
                          <div style={{ width:`${total>0?(done/total)*100:0}%`,height:"100%",background:allDone?"#22c55e":section.color,borderRadius:2,transition:"width 0.4s ease",boxShadow:done>0?`0 0 4px ${section.color}88`:"none" }}/>
                        </div>
                        <span style={{ fontSize:"0.6rem",color:"#1e293b",transform:collapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
                      </button>
                      {/* Section items — done ones sink to bottom */}
                      {!collapsed && (
                        <div style={{ display:"flex",flexDirection:"column",gap:7,animation:"sectionOpen 0.2s ease" }}>
                          {[...section.items].sort((a,b)=>{
                            const da=state.completedChallenges?.includes(a.id)?1:0;
                            const db=state.completedChallenges?.includes(b.id)?1:0;
                            return da-db;
                          }).map(c=>(
                            <div key={c.id} style={{ position:"relative",transition:"order 0.4s ease" }}>
                              <ChallengeCard challenge={c} done={state.completedChallenges?.includes(c.id)} onComplete={handleComplete} rankColor={rc.primary} recommended={section.recommended && !state.completedChallenges?.includes(c.id)}/>
                              {c.type==="custom" && !state.completedChallenges?.includes(c.id) && <button onClick={()=>deleteCustomQuest(c.id)} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:"#334155",fontSize:"0.8rem",cursor:"pointer",padding:4 }}>✕</button>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BODY ── */}
        {view==="body" && (
          <div>
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:13 }}>KÖRPER-TRACKING</div>

            {/* Metric selector + chart */}
            {bodyEntries.length >= 2 && (
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:12,padding:"13px",marginBottom:15 }}>
                <div style={{ display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:2 }}>
                  {bodyMetrics.map(m=>(
                    <button key={m.k} onClick={()=>setBodyMetric(m.k)} style={{ background:bodyMetric===m.k?`${m.c}22`:"transparent",border:`1px solid ${bodyMetric===m.k?m.c+"55":"#111"}`,color:bodyMetric===m.k?m.c:"#222",borderRadius:6,padding:"4px 10px",fontSize:"0.62rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>{m.l}</button>
                  ))}
                </div>
                <MiniChart data={bodyChartData} color={activeMetric.c} height={70} label={`${activeMetric.l.toUpperCase()} VERLAUF (${activeMetric.u})`}/>
              </div>
            )}

            {/* Delta cards */}
            {bodyEntries.length >= 2 && (
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:10,padding:"11px 13px",marginBottom:15 }}>
                <div style={{ fontSize:"0.56rem",letterSpacing:"0.15em",color:"#334155",marginBottom:8 }}>VERÄNDERUNG (letzte 2 Einträge)</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7 }}>
                  {bodyMetrics.map(m=>{
                    const curr=parseFloat(bodyEntries[0][m.k]),prev=parseFloat(bodyEntries[1][m.k]);
                    if(isNaN(curr)||isNaN(prev)) return null;
                    const diff=curr-prev,better=(m.k==="weight"||m.k==="bf")?diff<0:diff>0;
                    const color=diff===0?"#334155":better?"#22c55e":"#ef4444";
                    return (
                      <div key={m.k} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:"0.54rem",color:"#1e293b" }}>{m.l}</div>
                        <div style={{ fontSize:"0.88rem",fontWeight:700,color,fontFamily:"'Rajdhani',sans-serif",lineHeight:1.2 }}>{diff>0?"+":""}{diff%1===0?diff:diff.toFixed(1)}{m.u}</div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}

            {/* Check-in form */}
            <div style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${rc.primary}22`,borderRadius:12,padding:"15px",marginBottom:15 }}>
              <div style={{ fontSize:"0.58rem",letterSpacing:"0.2em",color:rc.primary,marginBottom:11 }}>NEUES CHECK-IN</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8 }}>
                {bodyMetrics.map(m=>(
                  <div key={m.k}>
                    <div style={{ fontSize:"0.58rem",color:"#334155",marginBottom:2 }}>{m.l}{m.u?` (${m.u})`:""}</div>
                    <input value={bodyForm[m.k]} onChange={e=>setBodyForm(p=>({...p,[m.k]:e.target.value}))} placeholder="—" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}/>
                  </div>
                ))}
              </div>
              <input value={bodyForm.note} onChange={e=>setBodyForm(p=>({...p,note:e.target.value}))} placeholder="Notiz (optional)" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid #1a1a2e",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
              <button onClick={saveBodyEntry} style={{ width:"100%",background:`linear-gradient(135deg,${rc.primary}18,${rc.primary}30)`,border:`1px solid ${rc.primary}44`,color:rc.primary,borderRadius:9,padding:"11px",fontSize:"0.8rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.1em",cursor:"pointer" }}>CHECK-IN SPEICHERN ◈</button>
            </div>

            {/* History */}
            {bodyEntries.length > 0 && (
              <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:4 }}>CHECK-IN VERLAUF</div>
                {bodyEntries.map((e,i)=>(
                  <div key={e.ts} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0a0a14",borderRadius:9,padding:"10px 13px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                      <span style={{ fontSize:"0.63rem",color:i===0?rc.primary:"#334155",fontWeight:i===0?700:400 }}>{i===0?"● AKTUELL":e.date}</span>
                      {i===0 && <span style={{ fontSize:"0.56rem",color:"#1e293b" }}>{e.date}</span>}
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5 }}>
                      {bodyMetrics.filter(m=>e[m.k]).map(m=>(
                        <div key={m.k} style={{ textAlign:"center" }}>
                          <div style={{ fontSize:"0.52rem",color:"#1e293b" }}>{m.l}</div>
                          <div style={{ fontSize:"0.76rem",color:"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:600 }}>{e[m.k]}{m.u}</div>
                        </div>
                      ))}
                    </div>
                    {e.note && <div style={{ fontSize:"0.66rem",color:"#334155",marginTop:5,fontStyle:"italic" }}>"{e.note}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STATS ── */}
        {view==="stats" && (
          <div>
            <RadarChart stats={state.stats} rankColor={rc.primary}/>
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20,marginTop:18 }}>
              {STATS_CONFIG.map(sc=>(
                <div key={sc.key}>
                  <StatBar label={`${sc.label} (${sc.key})`} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color} onClick={()=>setSelectedStat(sc.key)}/>
                  {sc.sub && (
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:5,marginLeft:10 }}>
                      {sc.sub.map(k=><StatBar key={k} label={k} icon={SUB_STATS[k].icon} value={state.stats[k]||0} max={Math.max(10,(state.stats[k]||0)*1.8+5)} color={SUB_STATS[k].color} small onClick={()=>setSelectedStat(k)}/>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:10 }}>AWAKENING PFAD</div>
            {RANKS.map(r=>{
              const idx=RANKS.indexOf(r),ci=RANKS.indexOf(state.rank),passed=idx<ci,active=idx===ci;
              const rC=RANK_COLORS[r];
              return (
                <div key={r} style={{ background:active?`${rC.primary}0c`:"rgba(255,255,255,0.01)",border:`1px solid ${active?rC.primary+"2a":"#0a0a14"}`,borderRadius:9,padding:"10px 13px",marginBottom:6,opacity:passed?0.4:1 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.88rem",color:rC.primary,textShadow:active?`0 0 7px ${rC.primary}`:"none" }}>{r}</span>
                      <div>
                        <div style={{ fontSize:"0.74rem",color:"#4a5568" }}>{rC.label}</div>
                        <div style={{ fontSize:"0.58rem",color:"#1e293b" }}>{rC.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:"0.58rem",color:passed?"#22c55e":active?rC.primary:"#111",letterSpacing:"0.08em" }}>{passed?"✓ DONE":active?"◈ AKTIV":"LOCKED"}</span>
                  </div>
                  {active && <div style={{ marginTop:5,fontSize:"0.64rem",color:"#1e293b" }}>Lv.{state.level}/{LEVELS_PER_RANK} · {state.xp}/{xpNeeded} XP · Global {globalLvl}/{TOTAL_LEVELS}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* ── MEHR ── */}
        {view==="more" && (
          <div>

            {/* Achievements */}
            <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:11 }}>SYSTEM RECORDS ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:22 }}>
              {ACHIEVEMENTS.map(a=>{
                const unlocked=(state.unlockedAchievements||[]).includes(a.id);
                return (
                  <div key={a.id} style={{ background:unlocked?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.015)",border:`1px solid ${unlocked?"#f59e0b33":"#0a0a14"}`,borderRadius:9,padding:"10px 13px",display:"flex",alignItems:"center",gap:12,opacity:unlocked?1:0.4 }}>
                    <span style={{ fontSize:"1.1rem",flexShrink:0 }}>{a.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"0.8rem",fontWeight:700,color:unlocked?"#f59e0b":"#334155" }}>{a.title}</div>
                      <div style={{ fontSize:"0.68rem",color:"#1e293b" }}>{a.desc}</div>
                    </div>
                    {unlocked && <span style={{ color:"#22c55e",fontSize:"0.9rem",flexShrink:0 }}>✓</span>}
                  </div>
                );
              })}
            </div>

            {/* ── PERSONALISIERUNG ── */}
            {(() => {
              const prefs = state.player?.preferences || {};
              const interests   = prefs.interests   || [];
              const activePaths = prefs.activePaths || [];
              const balanceAreas= prefs.balanceAreas|| [];
              const questLength = prefs.preferredQuestLength || "medium";

              const SectionToggle = ({ id, label, icon }) => (
                <button
                  onClick={()=>toggleSection("prefs_"+id)}
                  style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"2px 0",marginBottom:collapsedSections["prefs_"+id]===false?8:0 }}
                >
                  <span style={{ color:rc.primary,fontSize:"0.7rem" }}>{icon}</span>
                  <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:rc.primary }}>{label}</span>
                  <div style={{ flex:1,height:1,background:`${rc.primary}22`,borderRadius:1 }}/>
                  <span style={{ fontSize:"0.6rem",color:"#1e293b",transform:collapsedSections["prefs_"+id]===false?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
                </button>
              );

              const ChipGrid = ({ options, selected, onToggle, color }) => (
                <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:4 }}>
                  {options.map(opt => {
                    const active = selected.includes(opt.id);
                    return (
                      <button key={opt.id} onClick={()=>onToggle(opt.id)}
                        style={{ background:active?`${color}22`:"rgba(255,255,255,0.03)",border:`1px solid ${active?color+"55":"#1a1a2e"}`,color:active?color:"#334155",borderRadius:20,padding:"5px 11px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.04em",transition:"all 0.15s",display:"flex",alignItems:"center",gap:4 }}>
                        <span style={{ fontSize:"0.8rem" }}>{opt.icon}</span>{opt.label}
                      </button>
                    );
                  })}
                </div>
              );

              return (
                <div style={{ marginBottom:18 }}>
                  <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:11 }}>SYSTEM KONFIGURATION</div>

                  {/* Interessen */}
                  <div style={{ marginBottom:10 }}>
                    <SectionToggle id="interests" label="INTERESSEN" icon="◈"/>
                    {collapsedSections["prefs_interests"]===false && (
                      <div style={{ animation:"sectionOpen 0.2s ease" }}>
                        <ChipGrid
                          options={INTERESTS_OPTIONS}
                          selected={interests}
                          onToggle={v=>toggleArrayPref("interests",v)}
                          color={rc.primary}
                        />
                      </div>
                    )}
                  </div>

                  {/* Fokuspfade */}
                  <div style={{ marginBottom:10 }}>
                    <SectionToggle id="paths" label="FOKUSPFADE" icon="◉"/>
                    {collapsedSections["prefs_paths"]===false && (
                      <div style={{ animation:"sectionOpen 0.2s ease" }}>
                        <ChipGrid
                          options={ACTIVE_PATHS_OPTIONS}
                          selected={activePaths}
                          onToggle={v=>toggleArrayPref("activePaths",v)}
                          color="#8b5cf6"
                        />
                      </div>
                    )}
                  </div>

                  {/* Balance-Bereiche */}
                  <div style={{ marginBottom:10 }}>
                    <SectionToggle id="balance" label="BALANCE-BEREICHE" icon="▲"/>
                    {collapsedSections["prefs_balance"]===false && (
                      <div style={{ animation:"sectionOpen 0.2s ease" }}>
                        <ChipGrid
                          options={BALANCE_AREAS_OPTIONS}
                          selected={balanceAreas}
                          onToggle={v=>toggleArrayPref("balanceAreas",v)}
                          color="#22c55e"
                        />
                      </div>
                    )}
                  </div>

                  {/* Quest-Länge */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:"0.52rem",letterSpacing:"0.15em",color:"#334155",marginBottom:8 }}>BEVORZUGTE QUEST-LÄNGE</div>
                    <div style={{ display:"flex",gap:7 }}>
                      {QUEST_LENGTH_OPTIONS.map(opt => {
                        const active = questLength === opt.id;
                        return (
                          <button key={opt.id} onClick={()=>savePreferences({preferredQuestLength:opt.id})}
                            style={{ flex:1,background:active?`${rc.primary}18`:"rgba(255,255,255,0.02)",border:`1px solid ${active?rc.primary+"55":"#0d0d1a"}`,color:active?rc.primary:"#334155",borderRadius:9,padding:"10px 6px",textAlign:"center",cursor:"pointer",transition:"all 0.15s" }}>
                            <div style={{ fontSize:"1rem",marginBottom:3 }}>{opt.icon}</div>
                            <div style={{ fontSize:"0.72rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em",color:active?rc.primary:"#94a3b8" }}>{opt.label}</div>
                            <div style={{ fontSize:"0.56rem",color:"#1e293b",marginTop:2 }}>{opt.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ziele — Freitext */}
                  <div style={{ marginBottom:4 }}>
                    <div style={{ fontSize:"0.52rem",letterSpacing:"0.15em",color:"#334155",marginBottom:6 }}>ZIELE (optional)</div>
                    <textarea
                      value={(prefs.goals||[]).join("\n")}
                      onChange={e=>savePreferences({goals:e.target.value.split("\n").filter(Boolean)})}
                      placeholder={"Deine Ziele, eines pro Zeile...\nz.B. Physik Klausur bestehen\nKörper transformieren"}
                      rows={3}
                      style={{ width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid #1a1a2e",borderRadius:9,padding:"10px 12px",color:"#e2e8f0",fontSize:"0.78rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",resize:"vertical",lineHeight:1.6 }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Einstellungen — collapsible submenu */}
            <div style={{ marginBottom:8 }}>
              <button onClick={()=>toggleSection("settings")} style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"2px 0",marginBottom:collapsedSections["settings"]===false?10:0 }}>
                <span style={{ color:rc.primary,fontSize:"0.7rem" }}>⚙</span>
                <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:rc.primary }}>SYSTEM EINSTELLUNGEN</span>
                <div style={{ flex:1,height:1,background:`${rc.primary}22`,borderRadius:1 }}/>
                <span style={{ fontSize:"0.6rem",color:"#1e293b",transform:collapsedSections["settings"]===false?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
              </button>

              {collapsedSections["settings"]===false && (
                <div style={{ display:"flex",flexDirection:"column",gap:8,animation:"sectionOpen 0.2s ease" }}>

                  {/* Vibration toggle */}
                  <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:11,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:"0.8rem",color:"#94a3b8",fontWeight:600 }}>Vibration</div>
                      <div style={{ fontSize:"0.66rem",color:"#1e293b",marginTop:2 }}>Feedback beim Abschließen von Quests</div>
                    </div>
                    <button onClick={()=>toggleHaptic(!hapticEnabled)} style={{ position:"relative",width:44,height:24,borderRadius:12,background:hapticEnabled?`${rc.primary}44`:"rgba(255,255,255,0.06)",border:`1px solid ${hapticEnabled?rc.primary+"66":"#1a1a2e"}`,cursor:"pointer",transition:"all 0.3s",padding:0,flexShrink:0 }}>
                      <div style={{ position:"absolute",top:2,left:hapticEnabled?22:2,width:18,height:18,borderRadius:"50%",background:hapticEnabled?rc.primary:"#334155",transition:"all 0.25s ease",boxShadow:hapticEnabled?`0 0 6px ${rc.primary}`:"none" }}/>
                    </button>
                  </div>

                  {/* Backup */}
                  <button onClick={exportData} style={{ background:"rgba(34,197,94,0.08)",border:"1px solid #22c55e33",color:"#22c55e",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    ↓ DATEN EXPORTIEREN
                  </button>
                  <label style={{ background:"rgba(59,130,246,0.08)",border:"1px solid #3b82f633",color:"#3b82f6",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    ↑ DATEN IMPORTIEREN
                    <input type="file" accept=".json" onChange={importData} style={{ display:"none" }}/>
                  </label>

                  {/* Reset */}
                  {!confirmReset ? (
                    <button onClick={()=>setConfirmReset(true)} style={{ background:"rgba(239,68,68,0.07)",border:"1px solid #ef444422",color:"#ef4444",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                      ⚠ SYSTEM ZURÜCKSETZEN
                    </button>
                  ) : (
                    <div style={{ background:"rgba(239,68,68,0.08)",border:"1px solid #ef444444",borderRadius:10,padding:"14px" }}>
                      <div style={{ color:"#ef4444",fontSize:"0.78rem",fontWeight:700,marginBottom:4,letterSpacing:"0.05em" }}>System wirklich zurücksetzen?</div>
                      <div style={{ color:"#7f1d1d",fontSize:"0.72rem",marginBottom:12,lineHeight:1.5 }}>Rang, Level, XP, Stats, Körper-Daten — alle Fortschritte werden gelöscht.</div>
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={handleReset} style={{ flex:1,background:"linear-gradient(135deg,#ef444418,#ef444430)",border:"1px solid #ef444466",color:"#ef4444",borderRadius:8,padding:"11px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em" }}>JA, LÖSCHEN</button>
                        <button onClick={()=>setConfirmReset(false)} style={{ flex:1,background:"transparent",border:"1px solid #1a1a2e",color:"#334155",borderRadius:8,padding:"11px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>ABBRECHEN</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:rc.headerBg,borderTop:`1px solid ${rc.primary}18`,backdropFilter:"blur(20px)",display:"flex",padding:`8px 0 calc(16px + env(safe-area-inset-bottom))`,zIndex:200,transition:"background 1s ease" }}>
        {navItems.map(item=>{
          const active=view===item.id;
          return (
            <button key={item.id} onClick={()=>{ setView(item.id); haptic("light"); }} style={{ flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 0",transition:"all 0.2s",position:"relative" }}>
              {/* Active top bar */}
              <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:active?28:0,height:2,background:rc.primary,borderRadius:"0 0 3px 3px",boxShadow:active?`0 0 8px ${rc.primary}`:"none",transition:"all 0.25s ease" }}/>
              <span style={{ fontSize:"0.92rem",color:active?rc.primary:"#253040",textShadow:active?`0 0 10px ${rc.primary}`:"none",transition:"all 0.2s",marginTop:4 }}>{item.icon}</span>
              <span style={{ fontSize:"0.5rem",letterSpacing:"0.12em",color:active?rc.primary:"#253040",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,transition:"all 0.2s" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}

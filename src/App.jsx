import { useState, useEffect, useRef, useCallback } from "react";

// Data
import { RANKS, RANK_COLORS, XP_PER_LEVEL, TOTAL_LEVELS, LEVELS_PER_RANK } from "./data/ranks.js";
import { STATS_CONFIG, SUB_STATS, CAT_LABELS } from "./data/stats.js";
import { CHALLENGES_DB } from "./data/challenges.js";
import { ACHIEVEMENTS } from "./data/achievements.js";
import { findNewPathMilestones } from "./data/pathMilestones.js";
import { getRankUpStatus, canRankUpTo } from "./lib/rankRequirements.js";
import { defaultState } from "./data/defaultState.js";
import { PATHS, getAffinityGain, suggestPaths, canUnlockShadow } from "./data/paths.js";
import {
  INTERESTS_OPTIONS, QUEST_LENGTH_OPTIONS,
  ACTIVE_PATHS_OPTIONS, BALANCE_AREAS_OPTIONS,
  DIFFICULTY_OPTIONS,
} from "./data/preferences.js";
import { INTEREST_GROUPS, INTERESTS, normalizeInterests } from "./data/interests.js";
import { DOMAINS } from "./data/domains.js";
import { GOAL_TEMPLATES } from "./data/goalTypes.js";
import { GATES, isGateCompleted, getGateStepsDone, getRecommendedGates, isGateUnlocked, getVisibleGates } from "./data/gates.js";
import { getRecoveryQuests, getRecoveryHint, RECOVERY_QUESTS } from "./data/recoveryQuests.js";
import { TITLES, TITLE_MAP, checkTitleUnlocks, normalizeTitles } from "./data/titles.js";

// Lib
import { getGlobalLevel, getRankFromGlobal, getTodayStr, getWeekStr } from "./lib/helpers.js";
import { getTodayKey, getTodayWeekKey, getYesterdayKey } from "./lib/dates.js";
import {
  isDailyDone, isWeeklyDone, canComplete, markCompleted,
  pruneCompletionStatus,
} from "./lib/history.js";
import { useCountUp } from "./lib/useCountUp.js";
import { migrateState, makeHistoryEntry } from "./lib/migration.js";
import { generatePersonalizedQuests, generateStarterQuests, getNextBestQuests, getVisibleContent, selectNextMilestones } from "./lib/questGenerator.js";
import { applyQuestCompletion, applyGateCompletion, canCompleteQuest } from "./lib/questCompletion.js";
import { rotateQuestPool, canCompleteCustomQuest, calculateCustomQuestXpBounds } from "./lib/questRotation.js";
import {
  getTopSignalInterests,
  getTopSignalPaths,
  calculatePathSignal,
  calculatePathSpecializationLevel,
  getQuestPathId
} from "./lib/signals.js";
import { createWeeklyReview, hasReviewThisWeek, getCurrentWeekReview, getWeekQuestStats, addWeeklyReview } from "./lib/weeklyReview.js";
import { updateXpHistory } from "./lib/rewards.js";
import { PreferencesSection } from "./features/settings/PreferencesSection.jsx";
import { SystemAnalysisCard } from "./features/profile/SystemAnalysisCard.jsx";
import { OnboardingModal } from "./features/profile/OnboardingModal.jsx";
import { ProgressLogModal } from "./features/quests/ProgressLogModal.jsx";
import { ClearedFeedback } from "./components/ClearedFeedback.jsx";
import { shouldPromptProgressLog } from "./lib/progressLogs.js";
import { DEMO_PROFILES } from "./data/demoProfiles.js";
import { analyzeSystem } from "./lib/systemAnalysis.js";
import {
  createGoal, applyQuestToAllGoals, getNewlyCompletedGoals,
  canClaimGoalReward, calculateGoalReward, markGoalRewardClaimed,
  goalProgressPct, goalStatusLabel, getActiveGoals, getMatchingGoals,
} from "./lib/goals.js";
import {
  createProgressLog, canLogWithBonus, addProgressLog,
  getRecentLogs, getLogFields, METRIC_LABELS,
} from "./lib/progressLogs.js";

// Storage
import { saveData, loadData, LS, onSaveError } from "./storage/db.js";

// Components
import { MiniChart } from "./components/MiniChart.jsx";
import { RadarChart } from "./components/RadarChart.jsx";
import { LevelTree } from "./features/profile/LevelTree.jsx";
import { SplashScreen } from "./components/SplashScreen.jsx";
import { StatBar } from "./components/StatBar.jsx";
import { ChallengeCard } from "./components/ChallengeCard.jsx";
import { GateCard } from "./components/GateCard.jsx";
import { SetupScreen } from "./components/SetupScreen.jsx";
import { SystemOverlays } from "./components/SystemOverlays.jsx";
import { BodyView } from "./components/BodyView.jsx";
import { StatsView } from "./components/StatsView.jsx";
import { GoalsView } from "./components/GoalsView.jsx";
import { ReviewView } from "./components/ReviewView.jsx";



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
  const [customForm, setCustomForm] = useState({
    title:"", desc:"", xp:"35",
    type:"daily", domain:"discipline", path:"",
    difficulty:"normal", tags:""
  });
  const [newAchievements, setNewAchievements] = useState([]);
  const [newTitles, setNewTitles] = useState([]);
  // Goal UI state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ templateId:"learning_goal", title:"", targetValue:"", deadline:"" });
  // Progress Log UI state
  const [pendingLogQuest, setPendingLogQuest] = useState(null);
  const [logForm, setLogForm]   = useState({ notes:"", metrics:{} });
  // Weekly Review state
  const [reviewForm, setReviewForm] = useState({ wentWell:"", wasHard:"", learned:"", nextFocus:"" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  // Demo profiles
  const [showDemo, setShowDemo] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clearedCard, setClearedCard] = useState(null);
  const clearedRef = useRef();
  const showClearedCard = (card, ms = 3600) => {
    setClearedCard(card);
    clearTimeout(clearedRef.current);
    clearedRef.current = setTimeout(() => setClearedCard(null), ms);
  };
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
      // Show onboarding on first start (no existing state)
      if (!raw) {
        setTimeout(() => setShowOnboarding(true), 2000);
      }
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

  // Daily/Weekly reset + streak update + completionStatus pruning
  useEffect(() => {
    if(!state) return;
    const today = getTodayKey();
    const week  = getTodayWeekKey();
    let u = { ...state, stats: { ...state.stats } };
    let changed = false;

    // ── Daily Reset ──
    if (state.lastDailyReset !== today) {
      // Legacy: completedChallenges-Filter für old Daily-IDs (Backward-Compat)
      const dailyIds = Object.values(CHALLENGES_DB).flatMap(r => r.daily.map(c => c.id));
      u.completedChallenges = (state.completedChallenges || []).filter(id => !dailyIds.includes(id));

      // Streak-Logik: gestern aktiv? → Streak weiter. Nicht gestern? → Streak bricht.
      const yesterday = getYesterdayKey();
      if (state.lastActiveDay === yesterday) {
        u.currentStreak = (state.currentStreak || 0) + 1;
        u.longestStreak = Math.max(u.currentStreak, state.longestStreak || 0);
      } else if (state.lastActiveDay !== today) {
        u.currentStreak = 0;
      }
      u.lastDailyReset = today;
      changed = true;
    }

    // ── Weekly Reset ──
    if (state.lastWeeklyReset !== week) {
      // Legacy: completedChallenges-Filter für old Weekly-IDs (Backward-Compat)
      const weeklyIds = Object.values(CHALLENGES_DB).flatMap(r => r.weekly.map(c => c.id));
      u.completedChallenges = (u.completedChallenges || state.completedChallenges || [])
        .filter(id => !weeklyIds.includes(id));
      u.lastWeeklyReset = week;
      changed = true;
    }

    // ── completionStatus pruning (täglich bereinigen) ──
    // Entfernt alte Daily/Weekly-Einträge um State-Größe zu kontrollieren.
    if (changed || !state.completionStatus) {
      const pruned = pruneCompletionStatus(state.completionStatus);
      if (JSON.stringify(pruned) !== JSON.stringify(state.completionStatus)) {
        u.completionStatus = pruned;
        changed = true;
      }
    }

    if (changed) { setState(u); saveData("arise_v3", u); }
  }, [state?.rank, state?.lastDailyReset, state?.lastWeeklyReset]);

  // Check achievements + Path-Milestones (Etappe 9)
  const checkAchievements = useCallback((s, body) => {
    const already = s.unlockedAchievements || [];
    const newly = ACHIEVEMENTS.filter(a => !already.includes(a.id) && a.check(s, body));
    // Path-Milestones: gleiche Mechanik, eigener Storage (nie doppelt)
    const pmAlready = s.pathMilestonesUnlocked || [];
    let newPm = [];
    try { newPm = findNewPathMilestones(s, pmAlready); } catch (_) {}
    if (newly.length > 0 || newPm.length > 0) {
      const updated = {
        ...s,
        unlockedAchievements:   [...already, ...newly.map(a => a.id)],
        pathMilestonesUnlocked: [...pmAlready, ...newPm.map(m => m.id)],
      };
      saveData("arise_v3", updated);
      setState(updated);
      setNewAchievements([...newly, ...newPm]);
      clearTimeout(achievRef.current);
      achievRef.current = setTimeout(() => setNewAchievements([]), 4000);
    }
  }, []);

  const showNotif = (msg, color="#00ffff") => {
    setNotification({msg,color});
    clearTimeout(notifRef.current);
    notifRef.current = setTimeout(()=>setNotification(null), 3500);
  };

  // Speicherfehler sichtbar machen — statt still Fortschritt zu verlieren.
  // Eine Subscription deckt alle saveData-Aufrufe ab.
  useEffect(() => onSaveError(({ reason }) => {
    if (reason === "quota_soft") {
      showNotif("⚠ Speicher fast voll — Daten exportieren", "#f59e0b");
    } else {
      showNotif("⚠ Speichern fehlgeschlagen — Daten sichern!", "#ef4444");
    }
  }), []);

  const handleCreate = () => {
    if(!nameInput.trim()) return;
    const s = migrateState({
      ...defaultState(nameInput.trim()),
      lastDailyReset:  getTodayKey(),
      lastWeeklyReset: getTodayWeekKey(),
    });
    setState(s); saveData("arise_v3", s);
  };

  const completionOptions = {
    XP_PER_LEVEL_FN:  XP_PER_LEVEL,
    TOTAL_LEVELS,
    getRankFromGlobal,
    getGlobalLevel,
  };

  // ── shouldPromptProgressLog ─────────────────────────────
  // Log-Modal nur bei bestimmten Quest-Typen zeigen.
  // Normale daily action-Quests: kein Modal — nur XP-Feedback.
  //
  // Modal erscheint bei:
  //   requiresLog: true         → explizit markiert
  //   actionType: reflection    → Reflexionsquests
  //   actionType: metric        → Metrik-Quests
  //   actionType: project       → Projekt-Quests
  //   actionType: training      → Trainings-Quests (Body)
  //   type: gate_step           → Gate-Schritte
  //   trial: true               → Trials
  //   suggestLog + goalProgress  → zielverknüpfte Quests mit Fortschritt
  //
  // Modal erscheint NICHT bei:
  //   normalen daily action-Quests
  //   starter quests
  //   recovery quests (bereits eigener Flow)
  // Etappe 10: shouldPromptProgressLog lebt jetzt testbar in lib/progressLogs.js

  const handleComplete = (challenge) => {
    // Etappe 13: Signal-Delta für Feedback messen (vorher)
    const _qPath = getQuestPathId(challenge);
    let _preLvl = 0, _preSig = 0;
    try {
      if (_qPath) { _preSig = calculatePathSignal(state, _qPath); _preLvl = calculatePathSpecializationLevel(state, _qPath); }
    } catch (_) {}
    const { newState, feedback, alreadyDone } = applyQuestCompletion(state, challenge, completionOptions);
    if (alreadyDone) {
      showNotif("Quest already cleared", "#64748b");
      return;
    }

    // Notifications
    if (feedback.levelUps?.length > 0) {
      for (const lu of feedback.levelUps) {
        setLevelUpAnim({ rank: lu.rank, level: lu.level, rankUp: lu.rankUp });
        setTimeout(() => setLevelUpAnim(null), 2800);
      }
    }

    // Etappe 13: aggregierte QUEST-CLEARED-Karte statt Toast-Kaskade
    {
      const lines = [{ mark: "▸", text: `+${feedback.xp} XP`, color: "#3b82f6" }];
      if (feedback.statPts > 0 && feedback.statKey) {
        lines.push({ mark: "★", text: `+${feedback.statPts} ${feedback.statKey}`, color: "#f59e0b" });
      }
      // Signal-Delta (nachher)
      try {
        if (_qPath) {
          const postSig = calculatePathSignal(newState, _qPath);
          const postLvl = calculatePathSpecializationLevel(newState, _qPath);
          const pName   = PATHS[_qPath]?.name || _qPath;
          const pColor  = PATHS[_qPath]?.color || "#00ffff";
          if (postLvl > _preLvl)            lines.push({ mark: "◈", text: `${pName} Signal increased`, color: pColor });
          else if (_preSig === 0 && postSig > 0) lines.push({ mark: "◈", text: `${pName} Signal detected`, color: pColor });
        }
      } catch (_) {}
      if ((feedback.goalProgress || []).length > 0) {
        lines.push({ mark: "⌖", text: `Objective Progress +${feedback.goalProgress.length}`, color: "#22c55e" });
      }
      for (const gn of (feedback.goalNotifications || [])) {
        lines.push({ mark: "✦", text: `ZIEL ERREICHT! +${gn.xp} XP`, color: "#f59e0b" });
      }
      showClearedCard({ kind: "QUEST CLEARED", subtitle: `${challenge.title} abgeschlossen`, color: "#00ffff", lines });
      // Ascension Check: Rank-Grenze erreicht, Anforderungen offen
      if (feedback.rankUpBlocked) {
        setTimeout(() => {
          try {
            const st = getRankUpStatus(newState);
            if (st && !st.met) {
              const done    = st.checks.filter(c => c.done).slice(0, 2);
              const missing = st.checks.filter(c => !c.done).slice(0, 3);
              showClearedCard({
                kind: "ASCENSION CHECK",
                subtitle: `${st.nextRank}-Rank fast erreicht — XP wartet an der Grenze`,
                color: RANK_COLORS[st.nextRank]?.primary || "#f59e0b",
                lines: [
                  ...done.map(c => ({ mark: "✓", text: c.label, color: "#22c55e" })),
                  ...missing.map(c => ({ mark: "▢", text: `Fehlt: ${c.label} (${Math.min(c.have,c.need)}/${c.need})`, color: "#94a3b8" })),
                ],
              }, 4800);
            }
          } catch (_) {}
        }, 2200);
      }
    }

    if (feedback.newTitles?.length > 0) {
      setNewTitles(TITLES.filter(t => feedback.newTitles.includes(t.id)));
      clearTimeout(feedbackRef.current);
      feedbackRef.current = setTimeout(() => setNewTitles([]), 4500);
    }

    haptic(challenge.type === "milestone" ? "heavy" : "medium");
    setState(newState); saveData("arise_v3", newState);
    setTimeout(() => checkAchievements(newState, bodyEntries), 100);

    // Optional Progress Log — nur bei passenden Quest-Typen
    if (shouldPromptProgressLog(challenge, newState, feedback)) {
      setPendingLogQuest(challenge);
      setLogForm({ notes: "", metrics: {} });
    }
  };


  const saveProgressLog = (quest, formData) => {
    if (!quest) return;
    // Defensive guards — sicherstellen dass Arrays vorhanden
    const progressLogs = Array.isArray(state.progressLogs) ? state.progressLogs : [];
    const goals        = Array.isArray(state.goals)        ? state.goals        : [];
    // Anti-spam: XP-Bonus nur wenn noch kein Log heute für diese Quest
    const withBonus = canLogWithBonus(progressLogs, quest.id);
    // Passende Goals aus State finden
    const matchingGoal = goals.find(g =>
      g.status === "active" && (g.domain === quest.domain || g.path === quest.path)
    );
    const log = createProgressLog({
      questId:  quest.id,
      goalId:   matchingGoal?.id || null,
      quest,
      metrics:  formData.metrics || {},
      notes:    formData.notes   || "",
    });
    let s = { ...state, progressLogs: addProgressLog(progressLogs, log) };
    // XP-Bonus nur einmal pro Quest/Tag
    if (withBonus && log.xpBonus > 0) {
      s.xp      = (s.xp      || 0) + log.xpBonus;
      s.totalXP = (s.totalXP || 0) + log.xpBonus;
      showNotif(`⌁ Log gespeichert +${log.xpBonus} XP`, "#8b5cf6");
    } else {
      showNotif("⌁ Log gespeichert", "#8b5cf6");
    }
    setPendingLogQuest(null);
    setLogForm({ notes: "", metrics: {} });
    setState(s); saveData("arise_v3", s);
  };

  const dismissLog = () => {
    setPendingLogQuest(null);
    setLogForm({ notes: "", metrics: {} });
  };

  const saveBodyEntry = () => {
    const entry = { ...bodyForm, date:new Date().toLocaleDateString("de-DE"), ts:Date.now() };
    const updated = [entry, ...bodyEntries].slice(0,52);
    setBodyEntries(updated); saveData("arise_body", updated);
    setBodyForm({ weight:"",bf:"",bench:"",squat:"",deadlift:"",pullups:"",run5k:"",note:"" });
    showNotif("✓ Check-In gespeichert", "#22c55e");
    if(state) setTimeout(() => checkAchievements(state, updated), 100);
  };

  const loadDemoProfile = (profileId) => {
    const profile = DEMO_PROFILES.find(p => p.id === profileId);
    if (!profile) return;
    const playerName = state?.name || "Hunter";
    const newState = profile.buildState(playerName);
    setState(newState);
    saveData("arise_v3", newState);
    showNotif(`${profile.icon} Profil geladen: ${profile.label}`, profile.color);
  };

  const saveWeeklyReview = (reflection) => {
    // Defensive guards
    const safeState = {
      ...state,
      progressLogs:  Array.isArray(state.progressLogs)  ? state.progressLogs  : [],
      questHistory:  Array.isArray(state.questHistory)   ? state.questHistory  : [],
      weeklyReviews: Array.isArray(state.weeklyReviews)  ? state.weeklyReviews : [],
      goals:         Array.isArray(state.goals)          ? state.goals         : [],
    };
    if (hasReviewThisWeek(safeState.weeklyReviews)) {
      showNotif("Review dieser Woche bereits gespeichert", "#64748b");
      return;
    }
    const review = createWeeklyReview(safeState, reflection);
    // XP-Bonus vergeben
    let s = {
      ...state,
      weeklyReviews: addWeeklyReview(safeState.weeklyReviews, review),
      xp:      (state.xp      || 0) + review.xpBonus,
      totalXP: (state.totalXP || 0) + review.xpBonus,
    };
    s.xpHistory = updateXpHistory(s.xpHistory, review.xpBonus, getTodayWeekKey());
    setState(s); saveData("arise_v3", s);
    setReviewForm({ wentWell:"", wasHard:"", learned:"", nextFocus:"" });
    setShowReviewForm(false);
    showNotif(`◇ Wochenreview gespeichert! +${review.xpBonus} XP`, "#8b5cf6");
  };

  const addCustomQuest = () => {
    if(!customForm.title.trim()) return;
    const questType = customForm.type || "daily";
    const bounds = calculateCustomQuestXpBounds({ type: questType, difficulty: customForm.difficulty });
    const rawXp   = parseInt(customForm.xp) || bounds.suggested;
    const safeXp  = Math.max(bounds.min, Math.min(bounds.max, rawXp));
    const quest = {
      id:         `custom_${Date.now()}`,
      title:      customForm.title.trim(),
      desc:       customForm.desc.trim() || "Eigene Quest",
      xp:         safeXp,
      stat:       "END", statPts: 0,
      type:       questType,
      actionType: "action",
      cat:        customForm.domain,   // legacy compat
      domain:     customForm.domain,
      path:       customForm.path     || null,
      difficulty: customForm.difficulty || "normal",
      tags:       customForm.tags.split(",").map(t=>t.trim()).filter(Boolean),
      personalized: false,
      source:     "custom",
    };
    const s = { ...state, customQuests:[...(state.customQuests||[]), quest] };
    setState(s); saveData("arise_v3", s);
    setCustomForm({ title:"",desc:"",xp:"35",type:"daily",domain:"discipline",path:"",difficulty:"normal",tags:"" });
    setShowCustomForm(false);
    showNotif("✦ Quest cleared for duty", "#06b6d4");
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
    const { newState, feedback, alreadyDone } = applyGateCompletion(state, gate, completionOptions);
    if (alreadyDone) return;

    if (feedback.levelUps?.length > 0) {
      for (const lu of feedback.levelUps) {
        setLevelUpAnim({ rank: lu.rank, level: lu.level, rankUp: lu.rankUp });
        setTimeout(() => setLevelUpAnim(null), 2800);
      }
    }

    setState(newState); saveData("arise_v3", newState);
    haptic("heavy");
    // Etappe 13: GATE-CLEARED-Karte mit Branch- und Trial-Info
    {
      const isTrial = String(gate.id).startsWith("trial_");
      const pName   = PATHS[gate.path]?.name || gate.path;
      const pColor  = PATHS[gate.path]?.color || gate.color || "#f59e0b";
      const lines   = [{ mark: "▸", text: `+${feedback.xp} XP`, color: "#3b82f6" }];
      lines.push({ mark: "◈", text: gate.discovery
        ? `Branch unlocked: ${pName} Signal`
        : `${pName} Signal verstärkt`, color: pColor });
      try {
        const nextTrial = GATES.find(g =>
          g.path === gate.path && String(g.id).startsWith("trial_") &&
          !isGateCompleted(g.id, newState.gateProgress || {}) &&
          isGateUnlocked(g, newState.gateProgress || {})
        );
        if (nextTrial) lines.push({ mark: "⧫", text: `Next Trial available: ${nextTrial.title.split("—")[0].trim()}`, color: "#00ffff" });
      } catch (_) {}
      showClearedCard({
        kind: isTrial ? "TRIAL CLEARED" : "GATE CLEARED",
        subtitle: `${gate.title} abgeschlossen`,
        color: pColor, lines,
      }, 4200);
    }
    setTimeout(() => checkAchievements(newState, bodyEntries), 100);
  };


  // ── SETUP SCREEN — SYSTEM · PLAYER REGISTRATION ──
  if(!state) return <SetupScreen nameInput={nameInput} setNameInput={setNameInput} handleCreate={handleCreate} />;

  // ── COMPUTED ──
  const rc = RANK_COLORS[state.rank];
  const xpNeeded = XP_PER_LEVEL(state.rank, state.level);
  const xpPct = Math.min((state.xp/xpNeeded)*100,100);
  const globalLvl = getGlobalLevel(state.rank, state.level);
  const currentDB = CHALLENGES_DB[state.rank]||{daily:[],weekly:[],milestones:[]};
  const allMilestones = Object.entries(CHALLENGES_DB).filter(([r])=>RANKS.indexOf(r)<=RANKS.indexOf(state.rank)).flatMap(([,v])=>v.milestones);
  // Etappe 6: Hauptansicht zeigt nur die nächsten relevanten Milestones (Katalog via Filter erreichbar)
  const _completedMilestoneIds = new Set([
    ...(state.completedChallenges || []),
    ...(state.questHistory || []).filter(h => h.type === "milestone").map(h => h.id),
  ]);
const customQuests = state.customQuests||[];

// Unified done-check: uses completionStatus (new) + completedChallenges (legacy fallback)
const isQuestDone = (quest) => {
  if (!quest) return false;
  const cs = state.completionStatus || {};
  const qh = state.questHistory || [];

  // New system
  if (!canComplete(cs, qh, quest)) return true;

  // Legacy fallback
  return (state.completedChallenges || []).includes(quest.id);
};

const todayDone = currentDB.daily.filter(c=>isQuestDone(c)).length;
const totalMilestonesDone = Object.values(CHALLENGES_DB).flatMap(r=>r.milestones).filter(c=>isQuestDone(c)).length;
const unlockedAchievements = ACHIEVEMENTS.filter(a=>(state.unlockedAchievements||[]).includes(a.id));

  // Personalisierte Quests aus Interessen generieren
  const prefs = state.player?.preferences || {};
  const hasInterests = (prefs.interests?.length || 0) > 0 || (prefs.activePaths?.length || 0) > 0;
  const questContext = {
    goals:            state.goals        || [],
    questHistory:     state.questHistory || [],
    affinities:       state.player?.affinities || {},
    currentStreak:    state.currentStreak || 0,
    neglectedDomains: [], // Wird nach sysAnalysis befüllt (unten)
    // Signal system context
    progressLogs:     Array.isArray(state.progressLogs) ? state.progressLogs : [],
    stats:            state.stats        || {},
    gateProgress:     state.gateProgress || {},
  };
  const personalizedQuests = hasInterests
    ? generatePersonalizedQuests(
        { ...prefs, mainPath: state.player?.mainPath, secondaryPath: state.player?.secondaryPath },
        questContext
      )
    : generateStarterQuests(prefs.preferredQuestLength || "medium");

  // System-Analyse aus Quest-Verlauf + vollständigem Kontext
  const sysAnalysis = analyzeSystem(
    Array.isArray(state.questHistory) ? state.questHistory : [],
    state.player?.affinities,
    state.player?.preferences,
    {
      goals:         Array.isArray(state.goals)         ? state.goals         : [],
      weeklyReviews: Array.isArray(state.weeklyReviews) ? state.weeklyReviews : [],
      rank:          state.rank          || "E",
      level:         state.level         || 1,
      currentStreak: state.currentStreak || 0,
      gateProgress:  state.gateProgress  || {},
      progressLogs:  Array.isArray(state.progressLogs)  ? state.progressLogs  : [],
      stats:         state.stats         || {},
    }
  );

  // Gate-Daten
  const gateProgress      = state.gateProgress || {};
  const recommendedGates  = getRecommendedGates(sysAnalysis, gateProgress).slice(0, 2); // Etappe 6: max 1–2 sichtbar

  // Recovery-Quests
  const completedTodayIds = (state.completedChallenges || []);


  const balanceAreas      = state.player?.preferences?.balanceAreas || [];
  const recoveryQuests    = getRecoveryQuests(sysAnalysis, completedTodayIds, state.currentStreak || 0, balanceAreas);
  const recoveryHint      = getRecoveryHint(sysAnalysis, completedTodayIds, state.currentStreak || 0);

  // ── Quest Rotation: stabile dayKey-/weekKey-gebundene Auswahl ──
  // State-Objekt für Signal-/Sichtbarkeitsberechnung (vor Rotation gebraucht)
  const _visState = {
    questHistory: Array.isArray(state.questHistory) ? state.questHistory : [],
    progressLogs: Array.isArray(state.progressLogs) ? state.progressLogs : [],
    goals:        Array.isArray(state.goals)        ? state.goals        : [],
    player:       state.player || {},
    stats:        state.stats  || {},
    gateProgress: state.gateProgress || {},
    weeklyReviews: Array.isArray(state.weeklyReviews) ? state.weeklyReviews : [],
  };
  // Verhaltens-Signale: schalten thematische Quests frei (Etappe 2/5).
  // Nur Level >= 1 (Score >= 1) — minimale Streusignale reichen nicht.
  let _signalInterests = [];
  let _signalPaths = [];
  try {
    _signalInterests = (getTopSignalInterests(_visState, 8) || []).filter(si => si.level >= 1);
    _signalPaths     = (getTopSignalPaths(_visState, 3) || []).filter(sp => sp.level >= 1);
  } catch (_) {}
  // Jüngstes Verhalten (14 Tage) als Domain-Verteilung für das Scoring (Etappe 6)
  const _recentDomains = {};
  {
    const cutoff = Date.now() - 14 * 86400000;
    for (const h of _visState.questHistory) {
      if (!h?.completedAt || new Date(h.completedAt) < cutoff) continue;
      const d = h.domain || h.cat;
      if (d) _recentDomains[d] = (_recentDomains[d] || 0) + 1;
    }
  }

  const rotationContext = {
    interests:        prefs.interests     || [],
    activePaths:      prefs.activePaths   || [],
    activeGoals:      (state.goals || []).filter(g => g.status === "active"),
    neglectedDomains: sysAnalysis.neglectedDomains?.map(n => n.domain) || [],
    signalInterests:  _signalInterests,
    signalPaths:      _signalPaths,
    recentDomains:    _recentDomains,
  };
  const rotated = rotateQuestPool({
    daily:        currentDB.daily,
    weekly:       currentDB.weekly,
    personalized: personalizedQuests,
    recovery:     recoveryQuests,
  }, rotationContext);

  // Apply visible content limits based on signal level
  const visibleContent = getVisibleContent(rotated, _visState);
  const nextMilestones = selectNextMilestones(allMilestones, _visState, _completedMilestoneIds, 3);

  // Rotate daily/weekly from DB — custom + milestones always shown fully
  const rotatedDaily   = visibleContent.visibleDaily;
  const rotatedWeekly  = visibleContent.visibleWeekly;

  let displayChallenges = [
    ...rotatedDaily,
    ...rotatedWeekly,
    ...allMilestones,
    ...customQuests,
    ...rotated.personalized,
    ...rotated.recovery,
  ];
  if(showTodayOnly) displayChallenges = displayChallenges.filter(c=>c.type==="daily"&&!isQuestDone(c));
  if(filterType!=="all") displayChallenges = displayChallenges.filter(c=>c.type===filterType);
  if(filterType==="personalized") displayChallenges = visibleContent.visiblePersonalized || rotated.personalized;
  if(filterType==="recovery")     displayChallenges = visibleContent.visibleRecovery     || rotated.recovery;
  if(filterType==="goal-linked")  {
    const activeGoalIds  = new Set((state.goals||[]).filter(g=>g.status==="active").map(g=>g.id));
    const activeGoalDomains = new Set((state.goals||[]).filter(g=>g.status==="active").map(g=>g.domain).filter(Boolean));
    const activeGoalPaths   = new Set((state.goals||[]).filter(g=>g.status==="active").map(g=>g.path).filter(Boolean));
    displayChallenges = displayChallenges.filter(c =>
      (c.goalId && activeGoalIds.has(c.goalId)) ||
      (c.domain && activeGoalDomains.has(c.domain)) ||
      (c.path   && activeGoalPaths.has(c.path))
    );
  }
  if(filterCat!=="all") displayChallenges = displayChallenges.filter(c=>c.cat===filterCat||c.domain===filterCat);
  if(sortBy==="xp") displayChallenges = [...displayChallenges].sort((a,b)=>b.xp-a.xp);
  const availableCats=[...new Set([...rotatedDaily,...rotatedWeekly,...allMilestones,...customQuests,...rotated.personalized,...rotated.recovery].map(c=>c.cat||c.domain).filter(Boolean))];

  // Body chart data
  const bodyChartData = bodyEntries.slice().reverse().map(e=>({ v:parseFloat(e[bodyMetric])||0, l:e.date?.split(".").slice(0,2).join(".") })).filter(d=>d.v>0);
  const bodyMetrics = [{k:"weight",l:"Gewicht",u:"kg",c:"#22c55e"},{k:"bf",l:"KF",u:"%",c:"#f59e0b"},{k:"bench",l:"Bench",u:"kg",c:"#ef4444"},{k:"squat",l:"Squat",u:"kg",c:"#8b5cf6"},{k:"deadlift",l:"DL",u:"kg",c:"#f97316"},{k:"pullups",l:"Pull",u:"",c:"#3b82f6"},{k:"run5k",l:"5km",u:"min",c:"#ec4899"}];
  const activeMetric = bodyMetrics.find(m=>m.k===bodyMetric)||bodyMetrics[0];

  const navItems = [
    {id:"profile",icon:"◈",label:"Status"},
    {id:"stats",  icon:"✦",label:"Stats"},
    {id:"quests", icon:"◉",label:"Quests"},
    {id:"goals",  icon:"⌖",label:"Ziele"},
    {id:"body",   icon:"⬡",label:"Körper"},
    {id:"review", icon:"⟁",label:"Report"},
    {id:"more",   icon:"⌬",label:"System"},
  ];

  // Build stat history from completed milestones
  const buildStatHistory = (statKey) => {
    const allM = Object.values(CHALLENGES_DB).flatMap(r=>r.milestones);
    // Use questHistory for milestones (more reliable than completedChallenges)
    const completedMilestoneIds = new Set([
      ...(state.completedChallenges || []),
      ...(state.questHistory || []).filter(h => h.type === "milestone").map(h => h.id),
    ]);
    const relevant = allM.filter(m=>(m.subStat||m.stat)===statKey && completedMilestoneIds.has(m.id));
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
      <style>{`@keyframes fadeInOut{0%{opacity:0;transform:scale(.85)}15%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0}} @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}} @keyframes glitch{0%,100%{transform:translate(0)}25%{transform:translate(-2px,1px)}75%{transform:translate(2px,-1px)}} @keyframes statModal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes splashOut{from{opacity:1}to{opacity:0;pointer-events:none}} @keyframes splashPulse{0%{opacity:0;transform:scale(0.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}} @keyframes splashFade{from{opacity:0}to{opacity:1}} @keyframes splashBar{from{width:0%}to{width:100%}} @keyframes sectionOpen{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}} *{-webkit-tap-highlight-color:transparent;} input,select,textarea{-webkit-appearance:none;background-color:rgba(255,255,255,0.04)!important;color:#e2e8f0!important;} input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #0d0d17 inset!important;-webkit-text-fill-color:#e2e8f0!important;} input::placeholder{color:#475569;} html,body{background:${rc.bg} !important; transition:background 1s ease;} @supports(padding:max(0px)){.safe-bottom{padding-bottom:max(18px,env(safe-area-inset-bottom))}}`}</style>

      <SystemOverlays rc={rc} levelUpAnim={levelUpAnim} notification={notification} newAchievements={newAchievements} newTitles={newTitles} />

      {/* ── CLEARED FEEDBACK CARD (Etappe 13) ── */}
      {clearedCard && <ClearedFeedback card={clearedCard} />}

      {/* ── ONBOARDING MODAL ── */}
      {showOnboarding && (
        <OnboardingModal
          rc={rc}
          onDismiss={() => setShowOnboarding(false)}
          onSetInterests={() => {
            setShowOnboarding(false);
            setView("profile");
            // Scroll to interests section via slight delay
            setTimeout(() => {
              const el = document.getElementById("interests-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }}
        />
      )}

      {/* ── PROGRESS LOG MODAL ── */}
      <ProgressLogModal
        quest={pendingLogQuest}
        logForm={logForm}
        setLogForm={setLogForm}
        onSave={saveProgressLog}
        onDismiss={dismissLog}
        progressLogs={state.progressLogs || []}
      />

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
                    <div style={{ fontSize:"0.68rem",color:"#64748b" }}>{sc.desc||""}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.8rem",fontWeight:900,color:sc.color,textShadow:`0 0 12px ${sc.color}`,lineHeight:1 }}>{currentVal}</div>
                  <div style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.1em" }}>PUNKTE</div>
                </div>
              </div>

              {/* Chart or empty state */}
              {history.length >= 2 ? (
                <div style={{ marginBottom:18 }}>
                  <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#64748b",marginBottom:8 }}>STAT-ENTWICKLUNG</div>
                  <MiniChart data={history} color={sc.color} height={70}/>
                </div>
              ) : history.length === 1 ? (
                <div style={{ background:`${sc.color}08`,border:`1px solid ${sc.color}22`,borderRadius:10,padding:"12px",marginBottom:18,textAlign:"center" }}>
                  <div style={{ color:sc.color,fontSize:"0.8rem",fontWeight:700,marginBottom:2 }}>Erster Meilenstein erreicht</div>
                  <div style={{ color:"#64748b",fontSize:"0.72rem" }}>Schließe weitere Meilensteine ab um den Verlauf zu sehen</div>
                </div>
              ) : (
                <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:10,padding:"16px",marginBottom:18,textAlign:"center" }}>
                  <div style={{ color:"#64748b",fontSize:"0.8rem",marginBottom:4 }}>No Milestones Unlocked Yet</div>
                  <div style={{ color:"#64748b",fontSize:"0.7rem" }}>Schließe einen Meilenstein ab um deinen ersten Punkt zu verdienen</div>
                </div>
              )}

              {/* Completed milestones list */}
              {history.length > 0 && (
                <div>
                  <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#64748b",marginBottom:8 }}>FREIGESCHALTETE MEILENSTEINE</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    {history.map((h,i)=>(
                      <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:8,padding:"9px 12px" }}>
                        <div style={{ flex:1,fontSize:"0.78rem",color:"#94a3b8",fontWeight:600 }}>{h.title}</div>
                        <span style={{ color:sc.color,fontSize:"0.76rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif",marginLeft:8,flexShrink:0 }}>+{h.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={()=>setSelectedStat(null)} style={{ width:"100%",marginTop:18,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",color:"#64748b",borderRadius:10,padding:"12px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em" }}>SCHLIESSEN</button>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div style={{ padding:"16px 18px 13px",borderBottom:`1px solid ${rc.primary}18`,background:rc.headerBg,backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:100,transition:"background 1s ease, box-shadow 1s ease",boxShadow:`0 4px 26px ${rc.primary}10` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <div>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.35em",color:"#94a3b8",marginBottom:1 }}>◈ HUNTER</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"0.95rem",fontWeight:900,color:"#e2e8f0",letterSpacing:"0.06em" }}>{state.name}</div>
            {/* Active Title badge */}
            {state.player?.activeTitle && (() => {
              const titleId = state.player.activeTitle;
              const t = TITLE_MAP[titleId] || TITLES.find(tt => tt.title === titleId) || { color:"#f59e0b", icon:"★", title: titleId };
              const label = t.title || titleId;
              return (
                <div style={{ fontSize:"0.64rem",color:t.color,marginTop:2,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em" }}>
                  {t.icon} {label}
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
                  <div style={{ fontSize:"0.64rem",color:"#d97706",letterSpacing:"0.1em" }}>STREAK</div>
                </div>
              </div>
            )}
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.2rem",fontWeight:900,color:rc.primary,textShadow:`0 0 10px ${rc.primary}` }}>{state.rank}<span style={{ fontSize:"0.64rem",color:"#94a3b8",marginLeft:3 }}>Rank</span></div>
              <div style={{ fontSize:"0.64rem",color:"#94a3b8" }}>Lv.{state.level} · {rc.label}</div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
            <span style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.1em" }}>EXP</span>
            <span style={{ fontSize:"0.64rem",color:rc.primary }}>{state.xp} / {xpNeeded}</span>
          </div>
          <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:4,height:5,overflow:"hidden" }}>
            <div style={{ width:`${xpPct}%`,height:"100%",background:`linear-gradient(90deg,${rc.primary}44,${rc.primary})`,boxShadow:`0 0 8px ${rc.primary}88`,borderRadius:4,transition:"width 0.8s ease" }}/>
          </div>
          <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:3,transition:"all 0.3s" }}>
            {view==="quests"  && `Daily: ${todayDone}/${rotatedDaily.length} cleared · ${totalMilestonesDone} Milestones`}
            {view==="profile" && `Lv.${globalLvl}/${TOTAL_LEVELS} Global · ${(state.totalXP||0).toLocaleString()} Total XP`}
            {view==="goals"   && `${(state.goals||[]).filter(g=>g.status==="active").length} active · ${(state.goals||[]).filter(g=>g.status==="completed").length} completed`}
            {view==="review"  && `${(state.weeklyReviews||[]).length} Reports · ${getWeekQuestStats(state.questHistory).count} Quests cleared this week`}
            {view==="body"    && (bodyEntries.length > 0 ? `Letzter Check-In: ${bodyEntries[0].date}` : "Noch kein Check-In")}
            {view==="stats"   && `${Object.values(state.stats||{}).reduce((a,b)=>a+b,0)} Stat-Punkte insgesamt`}
            {view==="more"    && `${unlockedAchievements.length}/${ACHIEVEMENTS.length} Achievements · System v3`}
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
            const tabs=["profile","stats","quests","goals","body","review","more"];
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
                  <div style={{ fontSize:"0.64rem",letterSpacing:"0.3em",color:`${rc.primary}88`,marginBottom:3 }}>HUNTER STATUS</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.5rem",color:rc.primary,textShadow:`0 0 18px ${rc.primary}88`,lineHeight:1 }}>
                    {state.rank}-Rank
                  </div>
                  <div style={{ fontSize:"0.7rem",color:"#94a3b8",marginTop:3 }}>
                    {rc.label} · Lv.{state.level}/{LEVELS_PER_RANK}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.08em",marginBottom:2 }}>GLOBAL</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.2rem",fontWeight:900,color:rc.primary,lineHeight:1 }}>
                    {globalLvl}<span style={{ fontSize:"0.64rem",color:"#64748b" }}>/{TOTAL_LEVELS}</span>
                  </div>
                  <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:2 }}>{(state.totalXP||0).toLocaleString()} XP</div>
                </div>
              </div>

              {/* EXP bar */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                  <span style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.12em" }}>EXP TO NEXT LEVEL</span>
                  <span style={{ fontSize:"0.64rem",color:rc.primary,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{state.xp} / {xpNeeded}</span>
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
                      <div style={{ fontSize:"0.64rem",marginTop:2,color:passed||active?rC:"#1e1e30",fontWeight:700 }}>{r}</div>
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
                      <div key={label} style={{ background:p?`${p.color}0c`:"rgba(255,255,255,0.02)",border:`1px solid ${p?p.color+"33":"rgba(148,163,184,0.1)"}`,borderRadius:10,padding:"10px 12px" }}>
                        <div style={{ fontSize:"0.64rem",letterSpacing:"0.14em",color:"#64748b",marginBottom:4 }}>{label}</div>
                        {p ? (
                          <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                            <span style={{ fontSize:"1.1rem" }}>{p.icon}</span>
                            <div>
                              <div style={{ fontSize:"0.8rem",fontWeight:700,color:p.color,fontFamily:"'Rajdhani',sans-serif" }}>{p.name}</div>
                              <div style={{ fontSize:"0.64rem",color:"#64748b",lineHeight:1.3,marginTop:1 }}>{p.focus}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ color:"#64748b",fontSize:"0.68rem" }}>—</div>
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
                { label:"Streak ⚡",   val:`${state.currentStreak||0}`, suffix:"🔥", color:"#f59e0b" },
                { label:"Best Run",   val:`${state.longestStreak||0}`,  suffix:"🔥", color:"#f97316" },
                { label:"Total XP", val:(state.totalXP||0)>=1000?`${((state.totalXP||0)/1000).toFixed(1)}k`:`${state.totalXP||0}`, suffix:"", color:"#00ffff" },
                { label:"Meilst.",  val:`${totalMilestonesDone}`,     suffix:"★",  color:rc.primary },
              ].map(item=>(
                <div key={item.label} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:9,padding:"8px 5px",textAlign:"center" }}>
                  <div style={{ fontSize:"0.92rem",fontWeight:700,color:item.color,fontFamily:"'Rajdhani',sans-serif",lineHeight:1.1 }}>
                    {item.val}{item.suffix}
                  </div>
                  <div style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.07em",marginTop:2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* ── XP HISTORY ── */}
            {(state.xpHistory||[]).length >= 2 && (
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:12,padding:"12px",marginBottom:12 }}>
                <MiniChart data={(state.xpHistory||[]).map(h=>({v:h.v,l:h.l}))} color={rc.primary} height={52} label="AWAKENING PROGRESS — XP PRO WOCHE"/>
              </div>
            )}

            {/* ── KERN-STATS ── */}
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>
              HUNTER STATS <span style={{ color:"#64748b",fontSize:"0.64rem",letterSpacing:"0.1em" }}>· TIPPEN FÜR DETAILS</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10 }}>
              {STATS_CONFIG.filter(s=>!["SOC","REL","APP"].includes(s.key)).map(sc=>(
                <StatBar key={sc.key} label={sc.key} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color} onClick={()=>setSelectedStat(sc.key)}/>
              ))}
            </div>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>CHARISMA</div>
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
                  <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>PATH AFFINITY</div>
                  <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:10,padding:"11px 12px",display:"flex",flexDirection:"column",gap:7 }}>
                    {sorted.slice(0,5).map(([pathId, val]) => {
                      const p = PATHS[pathId];
                      const pct = Math.min((val / Math.max(maxAff, 1)) * 100, 100);
                      return (
                        <div key={pathId}>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                            <span style={{ fontSize:"0.68rem",color:p?.color||"#aaa" }}>{p?.icon} {p?.name}</span>
                            <span style={{ fontSize:"0.66rem",color:"#64748b",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{val}</span>
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
              // Normalisiere Legacy-Titel-Strings auf IDs
              const normalizedTitles = playerTitles.map(t =>
                TITLE_MAP[t] ? t : (TITLES.find(ti => ti.title === t)?.id || t)
              );
              return (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>TITEL ({playerTitles.length})</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                    {normalizedTitles.map(titleId => {
                      const t = TITLE_MAP[titleId] || TITLES.find(tt => tt.title === titleId) || { color:"#f59e0b",icon:"★",title:titleId };
                      const label = t.title || titleId;
                      const isActive = activeTitle === titleId;
                      return (
                        <button key={titleId} onClick={()=>{
                          const s2 = { ...state, player: { ...state.player, activeTitle: titleId }};
                          setState(s2); saveData("arise_v3", s2);
                          showNotif(`${t.icon} Aktiver Titel: ${label}`, t.color);
                        }} style={{ background:isActive?`${t.color}22`:"rgba(255,255,255,0.03)",border:`1px solid ${isActive?t.color+"55":"rgba(148,163,184,0.12)"}`,color:isActive?t.color:"#94a3b8",borderRadius:20,padding:"4px 11px",fontSize:"0.66rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:4,transition:"all 0.15s" }}>
                          <span style={{ fontSize:"0.75rem" }}>{t.icon}</span>{label}
                          {isActive && <span style={{ fontSize:"0.64rem",color:t.color }}>✓</span>}
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
                <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>ACHIEVEMENTS ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
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
            <SystemAnalysisCard
              state={state}
              sysAnalysis={sysAnalysis}
              rc={rc}
              saveData={saveData}
              setState={setState}
              showNotif={showNotif}
            />


          </div>
        )}

        {/* ── QUESTS ── */}
        {view==="quests" && (
          <div>
            {/* Quest Progress Widget */}
            {(() => {
              const totalDaily  = rotatedDaily.length;
              const doneDaily   = rotatedDaily.filter(c => isQuestDone(c)).length;
              const totalWeekly = rotatedWeekly.length;
              const doneWeekly  = rotatedWeekly.filter(c => isQuestDone(c)).length;
              const activeGoalCount = (state.goals||[]).filter(g=>g.status==="active").length;
              const completedGoalCount = (state.goals||[]).filter(g=>g.status==="completed").length;
              const totalGoalCount = (state.goals||[]).length;
              const pctD = totalDaily  > 0 ? Math.round((doneDaily  / totalDaily)  * 100) : 0;
              const pctW = totalWeekly > 0 ? Math.round((doneWeekly / totalWeekly) * 100) : 0;
              const pctG = totalGoalCount > 0 ? Math.round((completedGoalCount / totalGoalCount) * 100) : 0;
              const cols = activeGoalCount > 0 ? "1fr 1fr 1fr" : "1fr 1fr";
              return (
                <div style={{ display:"grid", gridTemplateColumns:cols, gap:7, marginBottom:12 }}>
                  {[
                    { label:"Daily",  done:doneDaily,  total:totalDaily,  pct:pctD, color:"#3b82f6" },
                    { label:"Weekly", done:doneWeekly, total:totalWeekly, pct:pctW, color:"#8b5cf6" },
                    ...(activeGoalCount > 0 ? [{ label:"OBJECTIVES", done:completedGoalCount, total:totalGoalCount, pct:pctG, color:"#f59e0b" }] : []),
                  ].map(item => (
                    <div key={item.label} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:9,padding:"9px 11px" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <span style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.08em" }}>{item.label}</span>
                        <span style={{ fontSize:"0.68rem",color:item.pct===100?"#22c55e":item.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{item.done}/{item.total}</span>
                      </div>
                      <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:3,height:3,overflow:"hidden" }}>
                        <div style={{ width:`${item.pct}%`,height:"100%",background:item.pct===100?"#22c55e":`linear-gradient(90deg,${item.color}66,${item.color})`,borderRadius:3,transition:"width 0.5s ease" }}/>
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
                <span style={{ fontSize:"0.64rem",color:"#64748b" }}>→</span>
              </div>
            )}
            {/* Today filter + sort */}
            <div style={{ display:"flex",gap:7,marginBottom:10,alignItems:"center" }}>
              <button onClick={()=>setShowTodayOnly(v=>!v)} style={{ background:showTodayOnly?`${rc.primary}22`:"transparent",border:`1px solid ${showTodayOnly?rc.primary+"55":"rgba(148,163,184,0.12)"}`,color:showTodayOnly?rc.primary:"#64748b",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
                {showTodayOnly?"● HEUTE OFFEN":"HEUTE OFFEN"}
              </button>
              <button onClick={()=>setSortBy(v=>v==="xp"?"default":"xp")} style={{ background:sortBy==="xp"?`${rc.primary}22`:"transparent",border:`1px solid ${sortBy==="xp"?rc.primary+"55":"rgba(148,163,184,0.12)"}`,color:sortBy==="xp"?rc.primary:"#64748b",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
                {sortBy==="xp"?"● NACH XP":"NACH XP"}
              </button>
              <button onClick={()=>setShowCustomForm(v=>!v)} style={{ marginLeft:"auto",background:"rgba(6,182,212,0.1)",border:"1px solid #06b6d422",color:"#06b6d4",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em",whiteSpace:"nowrap" }}>+ EIGENE</button>
            </div>

            {/* Custom quest form */}
            {showCustomForm && (
              <div style={{ background:"rgba(6,182,212,0.06)",border:"1px solid #06b6d422",borderRadius:11,padding:"14px",marginBottom:12,animation:"slideDown 0.2s ease" }}>
                <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#06b6d4",marginBottom:10 }}>NEW CUSTOM ORDER</div>
                <input value={customForm.title} onChange={e=>setCustomForm(p=>({...p,title:e.target.value}))} placeholder="Quest Title *" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:7 }}/>
                <input value={customForm.desc} onChange={e=>setCustomForm(p=>({...p,desc:e.target.value}))} placeholder="Description (optional)" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:7 }}/>
                <div style={{ display:"flex",gap:7,marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:3 }}>XP</div>
                    <input value={customForm.xp} onChange={e=>setCustomForm(p=>({...p,xp:e.target.value}))} type="number" min="1" max="500" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ flex:2 }}>
                    <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:3 }}>Kategorie</div>
                    <select value={customForm.cat} onChange={e=>setCustomForm(p=>({...p,cat:e.target.value}))} style={{ width:"100%",background:"#0a0a16",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}>
                      {Object.entries(CAT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex",gap:7 }}>
                  <button onClick={addCustomQuest} style={{ flex:1,background:"linear-gradient(135deg,#06b6d418,#06b6d430)",border:"1px solid #06b6d444",color:"#06b6d4",borderRadius:8,padding:"9px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>CREATE ORDER</button>
                  <button onClick={()=>setShowCustomForm(false)} style={{ flex:1,background:"transparent",border:"1px solid rgba(148,163,184,0.12)",color:"#64748b",borderRadius:8,padding:"9px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>CANCEL</button>
                </div>
              </div>
            )}

            {/* Type filter */}
            <div style={{ display:"flex",gap:5,marginBottom:8,overflowX:"auto",paddingBottom:2 }}>
              {["all","daily","weekly","milestone","gate","recovery","personalized","custom","goal-linked"].map(f=>(
                <button key={f} onClick={()=>setFilterType(f)} style={{ background:filterType===f?`${rc.primary}18`:"transparent",border:`1px solid ${filterType===f?rc.primary+"44":"rgba(148,163,184,0.12)"}`,color:filterType===f?rc.primary:"#64748b",borderRadius:7,padding:"5px 11px",fontSize:"0.64rem",letterSpacing:"0.08em",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>
                  {f==="all"?"All":f==="daily"?"◎ Daily":f==="weekly"?"◇ Weekly":f==="milestone"?"◆ Milestones":f==="gate"?"⧫ Gates":f==="recovery"?"⟡ Recovery":f==="personalized"?"◈ Recommended":"✦ Custom"}
                </button>
              ))}
            </div>
            {/* Category filter */}
            <div style={{ display:"flex",gap:5,marginBottom:14,overflowX:"auto",paddingBottom:2 }}>
              <button onClick={()=>setFilterCat("all")} style={{ background:filterCat==="all"?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat==="all"?rc.primary+"33":"rgba(148,163,184,0.1)"}`,color:filterCat==="all"?rc.primary:"#64748b",borderRadius:6,padding:"4px 9px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0 }}>Alle</button>
              {availableCats.map(cat=>(
                <button key={cat} onClick={()=>setFilterCat(cat)} style={{ background:filterCat===cat?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat===cat?rc.primary+"33":"rgba(148,163,184,0.1)"}`,color:filterCat===cat?rc.primary:"#64748b",borderRadius:6,padding:"4px 9px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>{CAT_LABELS[cat]||cat}</button>
              ))}
            </div>

            {/* Sectioned quest list */}
            {filterType === "gate" ? (
              /* ── GATE-ONLY VIEW ── */
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:4 }}>⧫ GATE QUESTS</div>
                {getVisibleGates(gateProgress, { signalPaths: _signalPaths, activePaths: prefs.activePaths || [] }).map(gate => {
                  const stepsDone = getGateStepsDone(gate.id, gateProgress);
                  const completed = isGateCompleted(gate.id, gateProgress);
                  const isRec     = recommendedGates.some(g => g.id === gate.id);
                  const unlocked  = isGateUnlocked(gate, gateProgress);
                  return (
                    <GateCard
                      key={gate.id}
                      gate={gate}
                      stepsDone={stepsDone}
                      completed={completed}
                      recommended={isRec}
                      locked={!unlocked}
                      onToggleStep={handleGateStepToggle}
                      onClaim={handleGateClaim}
                    />
                  );
                })}
              </div>
            ) : (showTodayOnly || filterType!=="all" || filterCat!=="all") ? (
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {displayChallenges.length===0 && <div style={{ color:"#64748b",textAlign:"center",padding:"40px 0",fontSize:"0.85rem" }}>{showTodayOnly?"⚡ All daily quests cleared.":"No quests match this filter."}</div>}
                {[...displayChallenges].sort((a,b)=>{
                  const da=isQuestDone(a)?1:0;
                  const db=isQuestDone(b)?1:0;
                  return da-db;
                }).map(c=>(
                  <div key={c.id} style={{ position:"relative" }}>
                    <ChallengeCard challenge={c} done={isQuestDone(c)} onComplete={handleComplete} rankColor={rc.primary} goals={state.goals||[]}/>
                    {c.type==="custom" && !isQuestDone(c) && <button onClick={()=>deleteCustomQuest(c.id)} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:"#64748b",fontSize:"0.8rem",cursor:"pointer",padding:4 }}>✕</button>}
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
                      <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:"#f59e0b" }}>◈ NEXT GATE AVAILABLE</span>
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
                  { key:"daily",     label:"DAILY SYSTEM QUESTS",   icon:"◎", items:rotatedDaily,   color:"#3b82f6", recommended:false },
                  { key:"weekly",    label:"WEEKLY ORDERS",           icon:"◇", items:rotatedWeekly,  color:"#8b5cf6", recommended:false },
                  { key:"milestone", label:"AWAKENING MILESTONES",    icon:"◆", items:nextMilestones,    color:"#f59e0b", recommended:false },
                  { key:"custom",    label:"CUSTOM ORDERS",           icon:"✦", items:customQuests,      color:"#06b6d4", recommended:false },
                  ...(personalizedQuests.length > 0 ? [
                    { key:"personalized", label:"SYSTEM RECOMMENDATION", icon:"◈", items:personalizedQuests, color:"#a78bfa", recommended:true },
                  ] : []),
                  ...(recoveryQuests.length > 0 ? [
                    { key:"recovery", label:"RECOVERY PROTOCOL", icon:"⟡", items:recoveryQuests, color:"#22c55e", recommended:true },
                  ] : []),
                ].filter(s=>s.items.length>0).map(section=>{
                  const done=section.items.filter(c=>isQuestDone(c)).length;
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
                          <span style={{ background:`${section.color}18`,border:`1px solid ${section.color}33`,color:section.color,borderRadius:20,padding:"1px 6px",fontSize:"0.64rem",letterSpacing:"0.06em",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>EMPFOHLEN</span>
                        )}
                        <div style={{ flex:1,height:1,background:`${allDone?"#22c55e":section.color}22`,borderRadius:1 }}/>
                        <span style={{ fontSize:"0.64rem",color:allDone?"#22c55e":"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{done}/{total}</span>
                        {/* Mini progress bar */}
                        <div style={{ width:28,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden" }}>
                          <div style={{ width:`${total>0?(done/total)*100:0}%`,height:"100%",background:allDone?"#22c55e":section.color,borderRadius:2,transition:"width 0.4s ease",boxShadow:done>0?`0 0 4px ${section.color}88`:"none" }}/>
                        </div>
                        <span style={{ fontSize:"0.64rem",color:"#64748b",transform:collapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
                      </button>
                      {/* Section items — done ones sink to bottom */}
                      {!collapsed && (
                        <div style={{ display:"flex",flexDirection:"column",gap:7,animation:"sectionOpen 0.2s ease" }}>
                          {[...section.items].sort((a,b)=>{
                            const da=isQuestDone(a)?1:0;
                            const db=isQuestDone(b)?1:0;
                            return da-db;
                          }).map(c=>(
                            <div key={c.id} style={{ position:"relative",transition:"order 0.4s ease" }}>
                              <ChallengeCard challenge={c} done={isQuestDone(c)} onComplete={handleComplete} rankColor={rc.primary} recommended={section.recommended && !isQuestDone(c)} goals={state.goals||[]}/>
                              {c.type==="custom" && !isQuestDone(c) && <button onClick={()=>deleteCustomQuest(c.id)} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:"#64748b",fontSize:"0.8rem",cursor:"pointer",padding:4 }}>✕</button>}
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


        {/* ── GOALS ── */}
        {view==="goals" && <GoalsView state={state} setState={setState} showNotif={showNotif} goalForm={goalForm} setGoalForm={setGoalForm} showGoalForm={showGoalForm} setShowGoalForm={setShowGoalForm} setView={setView} displayChallenges={displayChallenges} isQuestDone={isQuestDone} rc={rc} />}

        {/* ── BODY ── */}
        {view==="body" && <BodyView bodyEntries={bodyEntries} bodyMetrics={bodyMetrics} bodyMetric={bodyMetric} setBodyMetric={setBodyMetric} bodyChartData={bodyChartData} activeMetric={activeMetric} bodyForm={bodyForm} setBodyForm={setBodyForm} saveBodyEntry={saveBodyEntry} rc={rc} />}

        {/* ── STATS ── */}
        {view==="stats" && <StatsView state={state} rc={rc} setSelectedStat={setSelectedStat} xpNeeded={xpNeeded} globalLvl={globalLvl} />}

        {/* ── WEEKLY REVIEW ── */}
        {view==="review" && <ReviewView state={state} rc={rc} showReviewForm={showReviewForm} setShowReviewForm={setShowReviewForm} reviewForm={reviewForm} setReviewForm={setReviewForm} saveWeeklyReview={saveWeeklyReview} />}

        {/* ── MEHR ── */}
        {view==="more" && (
          <div>

            {/* Achievements */}
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:11 }}>◆ ACHIEVEMENT LOG ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:22 }}>
              {ACHIEVEMENTS.map(a=>{
                const unlocked=(state.unlockedAchievements||[]).includes(a.id);
                return (
                  <div key={a.id} style={{ background:unlocked?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.015)",border:`1px solid ${unlocked?"#f59e0b33":"rgba(148,163,184,0.08)"}`,borderRadius:9,padding:"10px 13px",display:"flex",alignItems:"center",gap:12,opacity:unlocked?1:0.4 }}>
                    <span style={{ fontSize:"1.1rem",flexShrink:0 }}>{a.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"0.8rem",fontWeight:700,color:unlocked?"#f59e0b":"#64748b" }}>{a.title}</div>
                      <div style={{ fontSize:"0.68rem",color:"#64748b" }}>{a.desc}</div>
                    </div>
                    {unlocked && <span style={{ color:"#22c55e",fontSize:"0.9rem",flexShrink:0 }}>✓</span>}
                  </div>
                );
              })}
            </div>

            {/* ── PERSONALISIERUNG ── */}
            <PreferencesSection
              preferences={state.player?.preferences}
              rankColor={rc.primary}
              toggleArrayPref={toggleArrayPref}
              savePreferences={savePreferences}
              toggleSection={toggleSection}
              collapsedSections={collapsedSections}
            />

            {/* Einstellungen — collapsible submenu */}
            <div style={{ marginBottom:8 }}>
              <button onClick={()=>toggleSection("settings")} style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"2px 0",marginBottom:collapsedSections["settings"]===false?10:0 }}>
                <span style={{ color:rc.primary,fontSize:"0.7rem" }}>⌬</span>
                <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:rc.primary }}>SYSTEM CONFIGURATION</span>
                <div style={{ flex:1,height:1,background:`${rc.primary}22`,borderRadius:1 }}/>
                <span style={{ fontSize:"0.64rem",color:"#64748b",transform:collapsedSections["settings"]===false?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
              </button>

              {collapsedSections["settings"]===false && (
                <div style={{ display:"flex",flexDirection:"column",gap:8,animation:"sectionOpen 0.2s ease" }}>

                  {/* Onboarding wieder anzeigen */}
                  <button
                    onClick={() => setShowOnboarding(true)}
                    style={{ background:"rgba(0,255,255,0.06)",border:"1px solid #00ffff22",color:"#00ffff88",borderRadius:10,padding:"11px",fontSize:"0.76rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}
                  >
                    ◈ ONBOARDING ANZEIGEN
                  </button>

                  {/* Vibration toggle */}
                  <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:11,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:"0.8rem",color:"#94a3b8",fontWeight:600 }}>Vibration</div>
                      <div style={{ fontSize:"0.66rem",color:"#64748b",marginTop:2 }}>Feedback beim Abschließen von Quests</div>
                    </div>
                    <button onClick={()=>toggleHaptic(!hapticEnabled)} style={{ position:"relative",width:44,height:24,borderRadius:12,background:hapticEnabled?`${rc.primary}44`:"rgba(255,255,255,0.06)",border:`1px solid ${hapticEnabled?rc.primary+"66":"rgba(148,163,184,0.15)"}`,cursor:"pointer",transition:"all 0.3s",padding:0,flexShrink:0 }}>
                      <div style={{ position:"absolute",top:2,left:hapticEnabled?22:2,width:18,height:18,borderRadius:"50%",background:hapticEnabled?rc.primary:"#64748b",transition:"all 0.25s ease",boxShadow:hapticEnabled?`0 0 6px ${rc.primary}`:"none" }}/>
                    </button>
                  </div>

                  {/* Demo Presets */}
                  <div style={{ marginBottom:8 }}>
                    <button onClick={()=>setShowDemo(v=>!v)}
                      style={{ width:"100%",background:"rgba(139,92,246,0.06)",border:"1px solid #8b5cf622",color:"#8b5cf666",borderRadius:9,padding:"10px 13px",fontSize:"0.72rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                      <span>⌬ TEST-PROFILE (Szenarien)</span>
                      <span style={{ fontSize:"0.64rem" }}>{showDemo?"▲":"▼"}</span>
                    </button>
                    {showDemo && (
                      <div style={{ background:"rgba(0,0,0,0.3)",border:"1px solid #8b5cf622",borderRadius:"0 0 9px 9px",padding:"10px" }}>
                        <div style={{ fontSize:"0.64rem",color:"#94a3b8",marginBottom:10,lineHeight:1.5 }}>
                          ⚠️ Lädt ein vorgefertigtes Testprofil. Aktueller Fortschritt wird überschrieben.
                        </div>
                        <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                          {DEMO_PROFILES.map(profile => (
                            <button key={profile.id} onClick={()=>loadDemoProfile(profile.id)}
                              style={{ background:`${profile.color}08`,border:`1px solid ${profile.color}22`,borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left",transition:"all 0.15s" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                                <span style={{ fontSize:"1rem" }}>{profile.icon}</span>
                                <span style={{ fontSize:"0.75rem",color:profile.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{profile.label}</span>
                              </div>
                              <div style={{ fontSize:"0.64rem",color:"#64748b",lineHeight:1.4,marginLeft:24 }}>{profile.desc}</div>
                              <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:5,marginLeft:24 }}>
                                <span style={{ color:`${profile.color}66` }}>Paths: </span>{profile.expectedPaths.join(", ")}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                      <div style={{ color:"#ef4444aa",fontSize:"0.72rem",marginBottom:12,lineHeight:1.5 }}>Rang, Level, XP, Stats, Körper-Daten — alle Fortschritte werden gelöscht.</div>
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={handleReset} style={{ flex:1,background:"linear-gradient(135deg,#ef444418,#ef444430)",border:"1px solid #ef444466",color:"#ef4444",borderRadius:8,padding:"11px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em" }}>JA, LÖSCHEN</button>
                        <button onClick={()=>setConfirmReset(false)} style={{ flex:1,background:"transparent",border:"1px solid rgba(148,163,184,0.12)",color:"#64748b",borderRadius:8,padding:"11px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>CANCEL</button>
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
              <span style={{ fontSize:"0.92rem",color:active?rc.primary:"#475569",textShadow:active?`0 0 10px ${rc.primary}`:"none",transition:"all 0.2s",marginTop:4 }}>{item.icon}</span>
              <span style={{ fontSize:"0.64rem",letterSpacing:"0.12em",color:active?rc.primary:"#475569",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,transition:"all 0.2s" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}

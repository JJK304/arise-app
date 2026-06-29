// ============================================================
// useQuestCompletion — der Kern-Completion-Flow, aus App.jsx
// ausgelagert (finaler Entlastungsschritt).
//
// handleComplete ist VERBATIM übernommen — die XP-/Level-/Stat-/
// Record-/Signal-/Goal-/RankUp-Mechanik ist NICHT verändert.
// applyQuestCompletion liefert den alreadyDone-Guard (kein Doppel-XP).
// Nimmt state/setState + completionOptions + Feedback-Helfer +
// checkAchievements/bodyEntries/haptic + die Log-Setter (aus
// useProgressLogs) als Abhängigkeiten.
// ============================================================
import { applyQuestCompletion } from "../lib/questCompletion.js";
import { calculatePathSignal, calculatePathSpecializationLevel, getQuestPathId } from "../lib/signals.js";
import { getQuestBest, isQuestRecord, applyQuestRecord } from "../lib/questRecords.js";
import { shouldPromptProgressLog } from "../lib/progressLogs.js";
import { getRankUpStatus } from "../lib/rankRequirements.js";
import { PATHS } from "../data/paths.js";
import { RANK_COLORS } from "../data/ranks.js";
import { TITLES } from "../data/titles.js";
import { saveData } from "../storage/db.js";

export function useQuestCompletion({
  state, setState, completionOptions,
  showNotif, showLevelUp, showClearedCard, showTitles,
  checkAchievements, bodyEntries, haptic,
  setPendingLogQuest, setLogForm,
}) {
  const handleComplete = (challenge, recordValue) => {
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

    // Progressive Overload: trackbare Quest mit Wert → Bestwert prüfen.
    // Neuer Rekord (höher als bisher) → +1 Stat; sonst nur Baseline speichern.
    let questRecord = null;
    if (challenge.track) {
      const val = parseFloat(recordValue);
      if (Number.isFinite(val)) {
        const records = state.questRecords || {};
        if (isQuestRecord(records, challenge.id, val)) {
          const sk = challenge.subStat || challenge.stat || "END";
          newState.stats = { ...(newState.stats || {}), [sk]: (newState.stats?.[sk] || 0) + 1 };
          questRecord = { value: val, prev: getQuestBest(records, challenge.id), stat: sk, unit: challenge.track.unit || "" };
        }
        newState.questRecords = applyQuestRecord(records, challenge.id, val);
      }
    }

    // Notifications
    if (feedback.levelUps?.length > 0) {
      for (const lu of feedback.levelUps) {
        showLevelUp({ rank: lu.rank, level: lu.level, rankUp: lu.rankUp });
      }
    }

    // Etappe 13: aggregierte QUEST-CLEARED-Karte statt Toast-Kaskade
    {
      const lines = [{ mark: "▸", text: `+${feedback.xp} XP`, color: "#3b82f6" }];
      if (questRecord) {
        lines.push({ mark: "⚡", text: `NEUER REKORD: ${questRecord.value}${questRecord.unit}${questRecord.prev != null ? ` (vorher ${questRecord.prev}${questRecord.unit})` : ""}`, color: "#f59e0b" });
        lines.push({ mark: "★", text: `+1 ${questRecord.stat}`, color: "#f59e0b" });
      }
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
      showTitles(TITLES.filter(t => feedback.newTitles.includes(t.id)));
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

  return { handleComplete };
}

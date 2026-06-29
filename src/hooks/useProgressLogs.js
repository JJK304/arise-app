// ============================================================
// useProgressLogs — aus App.jsx ausgelagert.
// Optionales Quest-Log nach Abschluss (Metriken/Notiz) + XP-Bonus
// (anti-spam: nur 1× pro Quest/Tag). saveProgressLog schließt das
// Modal IMMER zuerst (Button-Bug-Absicherung aus Etappe 2) und
// verarbeitet danach defensiv in try/catch.
// Verhalten 1:1 zur bisherigen Inline-Logik.
// ============================================================
import { useState } from "react";
import { createProgressLog, canLogWithBonus, addProgressLog } from "../lib/progressLogs.js";
import { saveData } from "../storage/db.js";

export function useProgressLogs({ state, setState, showNotif }) {
  const [pendingLogQuest, setPendingLogQuest] = useState(null);
  const [logForm, setLogForm]                 = useState({ notes: "", metrics: {} });

  const saveProgressLog = (quest, formData) => {
    // Modal IMMER zuerst schließen — kein blockierender Layer bleibt stehen,
    // egal ob die Log-Verarbeitung unten wirft.
    setPendingLogQuest(null);
    setLogForm({ notes: "", metrics: {} });
    if (!quest) return;
    try {
      const progressLogs = Array.isArray(state.progressLogs) ? state.progressLogs : [];
      const goals        = Array.isArray(state.goals)        ? state.goals        : [];
      const withBonus = canLogWithBonus(progressLogs, quest.id);
      const matchingGoal = goals.find(g =>
        g.status === "active" && (g.domain === quest.domain || g.path === quest.path)
      );
      const log = createProgressLog({
        questId:  quest.id,
        goalId:   matchingGoal?.id || null,
        quest,
        metrics:  (formData && formData.metrics) || {},
        notes:    (formData && formData.notes)   || "",
      });
      let s = { ...state, progressLogs: addProgressLog(progressLogs, log) };
      if (withBonus && log.xpBonus > 0) {
        s.xp      = (s.xp      || 0) + log.xpBonus;
        s.totalXP = (s.totalXP || 0) + log.xpBonus;
        showNotif(`⌁ Log gespeichert +${log.xpBonus} XP`, "#8b5cf6");
      } else {
        showNotif("⌁ Log gespeichert", "#8b5cf6");
      }
      setState(s); saveData("arise_v3", s);
    } catch (_) {
      showNotif("⚠ Log konnte nicht gespeichert werden", "#ef4444");
    }
  };

  const dismissLog = () => {
    setPendingLogQuest(null);
    setLogForm({ notes: "", metrics: {} });
  };

  return { pendingLogQuest, setPendingLogQuest, logForm, setLogForm, saveProgressLog, dismissLog };
}

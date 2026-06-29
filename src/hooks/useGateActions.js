// ============================================================
// useGateActions — aus App.jsx ausgelagert.
// Gate-Schritte togglen + Gate/Trial-Claim. Der Claim läuft über
// applyGateCompletion (enthält den alreadyDone-Guard gegen Doppel-
// Claim) und zeigt Level-Up + GATE/TRIAL-CLEARED-Karte (inkl. Next-
// Trial-Hinweis), danach Achievement-Check. Verhalten 1:1 zur Inline-
// Logik — keine geänderte Reward-/XP-Mechanik.
// ============================================================
import { applyGateCompletion } from "../lib/questCompletion.js";
import { GATES, isGateCompleted, isGateUnlocked } from "../data/gates.js";
import { PATHS } from "../data/paths.js";
import { saveData } from "../storage/db.js";

export function useGateActions({ state, setState, completionOptions, showLevelUp, showClearedCard, checkAchievements, bodyEntries, haptic }) {
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
        showLevelUp({ rank: lu.rank, level: lu.level, rankUp: lu.rankUp });
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

  return { handleGateStepToggle, handleGateClaim };
}

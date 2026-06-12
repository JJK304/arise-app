// ============================================================
// LEVEL TREE — Etappe 11: Visuelles Progressions-Feedback
// Zeigt auf echten Daten:
//   1) Branch Progress  — stärkste/wachsende Path-Signale
//   2) Branch Tree      — Discovery + Gate/Trial-Ketten
//                         (cleared / available / locked)
//   3) Next Ascension   — XP + Anforderungen für den nächsten Rank
// Leichtgewichtig, ohne neue Dependencies, mobile-tauglich.
// ============================================================
import React from "react";
import { PATHS } from "../../data/paths.js";
import { GATES, isGateCompleted, isGateUnlocked } from "../../data/gates.js";
import { getTopSignalPaths } from "../../lib/signals.js";
import { getPathMastery } from "../../lib/mastery.js";
import { getPathMilestoneProgress } from "../../data/pathMilestones.js";
import { getRankUpStatus } from "../../lib/rankRequirements.js";
import { RANKS, RANK_COLORS, XP_PER_LEVEL, LEVELS_PER_RANK } from "../../data/ranks.js";

// ── Status eines Gates/Trials ──────────────────────────────
function gateStatus(gate, gateProgress) {
  if (isGateCompleted(gate.id, gateProgress)) return "cleared";
  if (isGateUnlocked(gate, gateProgress))     return "available";
  return "locked";
}

const STATUS_STYLE = {
  cleared:   { color: "#22c55e", mark: "✓", opacity: 1 },
  available: { color: "#00ffff", mark: "◈", opacity: 1 },
  locked:    { color: "#475569", mark: "🔒", opacity: 0.55 },
};

function NodeChip({ label, status }) {
  const st = STATUS_STYLE[status];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "4px 8px", borderRadius: 6, opacity: st.opacity,
      background: status === "available" ? "rgba(0,255,255,0.05)" : "rgba(255,255,255,0.015)",
      border: `1px solid ${st.color}${status === "locked" ? "22" : "33"}`,
    }}>
      <span style={{ fontSize: "0.5rem", color: st.color }}>{st.mark}</span>
      <span style={{ fontSize: "0.56rem", color: status === "locked" ? "#64748b" : "#cbd5e1", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

// ── 1) Branch Progress ─────────────────────────────────────
function BranchProgress({ state, signalPaths }) {
  if (signalPaths.length === 0) {
    return (
      <div style={{ fontSize: "0.6rem", color: "#64748b", padding: "8px 2px", lineHeight: 1.6 }}>
        Noch keine Branches erkannt. Schließe Quests ab — das System
        beobachtet dein Verhalten und zeigt hier, welche Richtungen wachsen.
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {signalPaths.map(sp => {
        const p = PATHS[sp.pathId];
        if (!p) return null;
        const pct = Math.min(100, Math.round((sp.score / 15) * 100));
        const mastery = getPathMastery(state, sp.pathId);
        const ms = getPathMilestoneProgress(state, sp.pathId);
        return (
          <div key={sp.pathId}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
              <span style={{ fontSize: "0.62rem", color: "#cbd5e1" }}>
                {p.icon} {p.name}
                <span style={{ fontSize: "0.5rem", color: p.color, marginLeft: 6, letterSpacing: "0.1em" }}>
                  SIGNAL LV.{sp.level}
                </span>
              </span>
              <span style={{ fontSize: "0.52rem", color: "#64748b", fontFamily: "'Orbitron',sans-serif" }}>
                {pct}% · ◆ {ms.doneCount}/{ms.total} · M {mastery.pct}%
              </span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: 3,
                background: `linear-gradient(90deg, ${p.color}66, ${p.color})`,
                boxShadow: `0 0 6px ${p.color}55`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 2) Branch Tree ─────────────────────────────────────────
function BranchTree({ state, signalPaths }) {
  const gateProgress = state.gateProgress || {};

  // Discovery-Reihe: kompakt, nur nächste relevante (cleared zuerst raus)
  const discovery = GATES.filter(g => g.discovery);
  const discCleared = discovery.filter(g => gateStatus(g, gateProgress) === "cleared");
  const discOpen    = discovery.filter(g => gateStatus(g, gateProgress) !== "cleared").slice(0, 4);

  // Branches: Top-Signal-Paths (max 3) mit Gate/Trial-Kette
  const branches = signalPaths.slice(0, 3).map(sp => {
    const p = PATHS[sp.pathId];
    const chain = [1, 2, 3].flatMap(tier => {
      const gate  = GATES.find(g => g.id === `gate_${sp.pathId}_${tier}`);
      const trial = GATES.find(g => g.id === `trial_${sp.pathId}_${tier}`);
      return [
        gate  && { label: `Gate ${"I".repeat(tier)}`,  status: gateStatus(gate, gateProgress) },
        trial && { label: `Trial ${"I".repeat(tier)}`, status: gateStatus(trial, gateProgress) },
      ].filter(Boolean);
    });
    return { path: p, chain };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <div style={{ fontSize: "0.52rem", letterSpacing: "0.18em", color: "#64748b", marginBottom: 5 }}>
          ⧫ DISCOVERY GATES {discCleared.length > 0 && <span style={{ color: "#22c55e" }}>· {discCleared.length} cleared</span>}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {discOpen.map(g => (
            <NodeChip key={g.id} label={g.title.split("—")[0].trim()} status={gateStatus(g, gateProgress)} />
          ))}
        </div>
      </div>
      {branches.map(({ path, chain }) => path && (
        <div key={path.id}>
          <div style={{ fontSize: "0.52rem", letterSpacing: "0.18em", color: path.color, marginBottom: 5 }}>
            {path.icon} {path.name.toUpperCase()} BRANCH
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
            {chain.map((n, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: "#334155", fontSize: "0.5rem" }}>→</span>}
                <NodeChip label={n.label} status={n.status} />
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
      {branches.length === 0 && (
        <div style={{ fontSize: "0.56rem", color: "#64748b" }}>
          Path-Branches erscheinen, sobald Signale wachsen.
        </div>
      )}
    </div>
  );
}

// ── 3) Next Ascension Panel ────────────────────────────────
function NextAscensionPanel({ state }) {
  const status = getRankUpStatus(state);
  if (!status) {
    return <div style={{ fontSize: "0.6rem", color: "#00ffff" }}>◈ Höchster Rank erreicht — Ascendant.</div>;
  }
  const nextColor = RANK_COLORS[status.nextRank]?.primary || "#00ffff";

  // XP-Sicht: Fortschritt im aktuellen Level + verbleibende Level im Rank
  const xpNeeded   = XP_PER_LEVEL(state.rank, state.level);
  const xpPct      = Math.min(100, Math.round(((state.xp || 0) / Math.max(1, xpNeeded)) * 100));
  const levelsLeft = LEVELS_PER_RANK - (state.level || 1);
  const doneCount  = status.checks.filter(c => c.done).length;

  return (
    <div style={{
      padding: "10px 12px", borderRadius: 9,
      background: `${nextColor}08`, border: `1px solid ${nextColor}26`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: "0.56rem", letterSpacing: "0.2em", color: nextColor }}>
          ⧫ NEXT ASCENSION — {status.nextRank}-RANK
        </span>
        <span style={{ fontSize: "0.5rem", color: "#64748b", fontFamily: "'Orbitron',sans-serif" }}>
          {doneCount}/{status.checks.length} ✓
        </span>
      </div>
      <div style={{ fontSize: "0.54rem", color: "#94a3b8", marginBottom: 4 }}>
        XP: Lv.{state.level}/{LEVELS_PER_RANK} · {(state.xp || 0).toLocaleString()}/{xpNeeded.toLocaleString()}
        {levelsLeft > 0 && <span style={{ color: "#64748b" }}> · noch {levelsLeft} Level in {state.rank}</span>}
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ width: `${xpPct}%`, height: "100%", background: nextColor, borderRadius: 2 }} />
      </div>
      {status.checks.map(c => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "0.56rem", lineHeight: 1.6, color: c.done ? "#22c55e" : "#94a3b8" }}>
          <span>{c.done ? "✓" : "▢"} {c.label}</span>
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.5rem", color: c.done ? "#22c55e" : "#64748b" }}>
            {Math.min(c.have, c.need)}/{c.need}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Hauptkomponente ────────────────────────────────────────
export function LevelTree({ state }) {
  let signalPaths = [];
  try {
    signalPaths = (getTopSignalPaths(state, 5) || []).filter(sp => sp.score > 0);
  } catch (_) {}

  const section = (title, body) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: "0.56rem", letterSpacing: "0.28em", color: "#94a3b8", marginBottom: 8 }}>{title}</div>
      {body}
    </div>
  );

  return (
    <div style={{ marginBottom: 20 }}>
      {section("◈ BRANCH PROGRESS", <BranchProgress state={state} signalPaths={signalPaths} />)}
      {section("◈ ASCENSION TREE", <BranchTree state={state} signalPaths={signalPaths} />)}
      <NextAscensionPanel state={state} />
    </div>
  );
}

// ============================================================
// CLEARED FEEDBACK — Etappe 13: Reward Feedback
// Solo-Leveling System-Fenster (eine aggregierte Karte):
//   QUEST CLEARED   — Titel, +XP, +Stat, Signal, Objective
//   GATE CLEARED    — Branch unlocked, Next Trial available
//   ASCENSION CHECK — erfüllt / fehlt für den nächsten Rank
// card = { kind, title, subtitle, color, lines:[{mark,text,color}] }
// ============================================================

export function ClearedFeedback({ card }) {
  if (!card) return null;
  const color = card.color || "#00e5ff";

  const corners = [["top","left"],["top","right"],["bottom","left"],["bottom","right"]];

  return (
    <div style={{
      position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
      zIndex: 950, width: "calc(100% - 28px)", maxWidth: 400,
      pointerEvents: "none", animation: "statModal 0.28s ease",
    }}>
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg,#070b18f5,#05060ef5)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${color}33`,
        borderRadius: 4, padding: "12px 16px 13px",
        boxShadow: `0 10px 38px rgba(0,0,0,0.6), 0 0 24px ${color}1f`,
      }}>

        {/* corner brackets */}
        {corners.map(([v, h], i) => (
          <div key={i} style={{
            position: "absolute", [v]: 5, [h]: 5, width: 11, height: 11,
            borderTop:    v === "top"    ? `2px solid ${color}` : "none",
            borderBottom: v === "bottom" ? `2px solid ${color}` : "none",
            borderLeft:   h === "left"   ? `2px solid ${color}` : "none",
            borderRight:  h === "right"  ? `2px solid ${color}` : "none",
            opacity: 0.75,
          }} />
        ))}

        {/* header bar: ◈ SYSTEM ─── KIND */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: card.subtitle ? 3 : 6 }}>
          <span style={{
            fontSize: "0.46rem", letterSpacing: "0.3em", color: `${color}99`,
            fontFamily: "'Orbitron',sans-serif", fontWeight: 700, whiteSpace: "nowrap",
          }}>◈ SYSTEM</span>
          <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${color}33,transparent)` }} />
          <span style={{
            fontFamily: "'Orbitron',sans-serif", fontWeight: 900,
            fontSize: "0.7rem", letterSpacing: "0.16em",
            color, textShadow: `0 0 12px ${color}66`, whiteSpace: "nowrap",
          }}>{card.kind}</span>
        </div>

        {card.subtitle && (
          <div style={{ fontSize: "0.66rem", color: "#cbd5e1", marginBottom: 7, letterSpacing: "0.01em" }}>
            {card.subtitle}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {(card.lines || []).map((l, i) => (
            <div key={i} style={{
              fontSize: "0.63rem", lineHeight: 1.5,
              color: l.color || "#94a3b8",
              display: "flex", alignItems: "baseline", gap: 7,
            }}>
              <span style={{ fontSize: "0.54rem", color: l.color || "#64748b" }}>{l.mark || "▸"}</span>
              <span>{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

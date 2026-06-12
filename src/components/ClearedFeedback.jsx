// ============================================================
// CLEARED FEEDBACK — Etappe 13: Reward Feedback
// Aggregierte System-Feedback-Karte statt Toast-Kaskade:
//   QUEST CLEARED   — Titel, +XP, +Stat, Signal, Objective
//   GATE CLEARED    — Branch unlocked, Next Trial available
//   ASCENSION CHECK — erfüllt / fehlt für den nächsten Rank
// card = { kind, title, subtitle, color, lines:[{mark,text,color}] }
// ============================================================

export function ClearedFeedback({ card }) {
  if (!card) return null;
  const color = card.color || "#00ffff";

  return (
    <div style={{
      position: "fixed", top: 76, left: "50%", transform: "translateX(-50%)",
      zIndex: 950, width: "calc(100% - 32px)", maxWidth: 380,
      background: "#070712f2", backdropFilter: "blur(10px)",
      border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`,
      borderRadius: 12, padding: "12px 14px",
      boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 22px ${color}18`,
      animation: "statModal 0.25s ease",
      pointerEvents: "none",
    }}>
      <div style={{
        fontFamily: "'Orbitron',sans-serif", fontWeight: 900,
        fontSize: "0.72rem", letterSpacing: "0.18em",
        color, textShadow: `0 0 12px ${color}66`, marginBottom: 2,
      }}>
        {card.kind}
      </div>
      {card.subtitle && (
        <div style={{ fontSize: "0.68rem", color: "#cbd5e1", marginBottom: 7 }}>
          {card.subtitle}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {(card.lines || []).map((l, i) => (
          <div key={i} style={{
            fontSize: "0.62rem", lineHeight: 1.5,
            color: l.color || "#94a3b8",
            display: "flex", alignItems: "baseline", gap: 6,
          }}>
            <span style={{ fontSize: "0.52rem", color: l.color || "#64748b" }}>{l.mark || "▸"}</span>
            <span>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

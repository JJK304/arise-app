// ============================================================
// ONBOARDING MODAL — SYSTEM INITIALIZED
// Erscheint beim ersten Start und erklärbar im System-Menü.
// Solo-Leveling System-Fenster: erklärt neutralen Start,
// Signal-System, Gate-System, Ascension, Path.
// ============================================================

export function OnboardingModal({ onDismiss, onSetInterests, rc }) {
  const color = rc?.primary || "#00e5ff";
  const corners = [["top","left"],["top","right"],["bottom","left"],["bottom","right"]];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(0,0,0,0.94)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <style>{`
        @keyframes obGlow{0%,100%{box-shadow:0 0 0 1px ${color}22,0 0 30px ${color}10}50%{box-shadow:0 0 0 1px ${color}3a,0 0 46px ${color}22}}
        @keyframes obScan{0%{transform:translateY(0);opacity:0}10%{opacity:.4}100%{transform:translateY(440px);opacity:0}}
      `}</style>

      <div style={{ position: "relative", width: "100%", maxWidth: 430, maxHeight: "86vh", animation: "statModal 0.3s ease" }}>
        <div style={{
          position: "relative",
          background: "linear-gradient(180deg,#070b18,#05060e)",
          border: `1px solid ${color}22`, borderRadius: 6,
          maxHeight: "86vh", display: "flex", flexDirection: "column",
          overflow: "hidden", animation: "obGlow 3.6s ease-in-out infinite",
        }}>

          {/* corner brackets on the frame */}
          {corners.map(([v, h], i) => (
            <div key={i} style={{
              position: "absolute", [v]: 8, [h]: 8, width: 14, height: 14, zIndex: 2,
              borderTop:    v === "top"    ? `2px solid ${color}` : "none",
              borderBottom: v === "bottom" ? `2px solid ${color}` : "none",
              borderLeft:   h === "left"   ? `2px solid ${color}` : "none",
              borderRight:  h === "right"  ? `2px solid ${color}` : "none",
              opacity: 0.85, pointerEvents: "none",
            }} />
          ))}
          {/* scan line */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: `linear-gradient(90deg,transparent,${color}aa,transparent)`, animation: "obScan 4.6s linear infinite", pointerEvents: "none", zIndex: 2 }} />

          {/* scrollable content */}
          <div style={{ overflowY: "auto", padding: "30px 22px 24px" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{
                fontSize: "0.64rem", letterSpacing: "0.35em",
                color: `${color}88`, marginBottom: 8,
                fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
                textShadow: `0 0 12px ${color}55`,
              }}>
                ◈ ARISE SYSTEM ◈
              </div>
              <div style={{
                fontSize: "1.1rem", fontFamily: "'Orbitron',sans-serif",
                fontWeight: 900, color: color,
                textShadow: `0 0 20px ${color}88`,
                letterSpacing: "0.08em", marginBottom: 6,
              }}>
                SYSTEM INITIALIZED
              </div>
              <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${color}66,transparent)`, margin: "0 auto" }} />
            </div>

            {/* Main text */}
            <div style={{
              fontSize: "0.76rem", color: "#94a3b8", lineHeight: 1.75,
              marginBottom: 20, textAlign: "center",
            }}>
              Du startest als <span style={{ color: "#e2e8f0", fontWeight: 700 }}>unklassifizierter Hunter.</span>
            </div>

            {/* Info blocks */}
            {[
              {
                icon: "◎",
                color: "#3b82f6",
                title: "Allgemeiner Start",
                text: "ARISE gibt dir zuerst wenige allgemeine System-Quests. Sie bauen deine Grundlagen auf — ohne dich zu überladen. Alle Richtungen sind offen.",
              },
              {
                icon: "◈",
                color: "#f59e0b",
                title: "Signal-System",
                text: "Wenn deine Handlungen Signale erzeugen, erkennt das System mögliche Branches. Kein Thema ist am Anfang stärker als ein anderes. Spezialisierung entsteht durch das was du wirklich tust.",
              },
              {
                icon: "⬡",
                color: "#22c55e",
                title: "Gates",
                text: "Ein Gate ist ein Skill-Check. Wenn du es clearst, öffnet oder verstärkt sich ein Fortschrittspfad. Gates sind kein Muss — aber sie geben stärkere Progression.",
              },
              {
                icon: "⧫",
                color: "#ef4444",
                title: "Ascension",
                text: "Spätere Ranks verlangen mehr als XP. Du brauchst Gates, Trials, echte Ziele, Milestones und sichtbaren Fortschritt — Daily-Spam allein reicht nicht.",
              },
              {
                icon: "◇",
                color: "#a78bfa",
                title: "Dein Path",
                text: "Du musst keinen Path wählen. Du levelst durch das, was du wirklich tust. Neue Richtungen können jederzeit entstehen — auch später.",
              },
            ].map((block, i) => (
              <div key={i} style={{
                position: "relative",
                background: `${block.color}08`,
                border: `1px solid ${block.color}20`,
                borderLeft: `2px solid ${block.color}`,
                borderRadius: 4, padding: "12px 14px",
                marginBottom: 10,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 5,
                }}>
                  <span style={{ color: block.color, fontSize: "0.85rem" }}>{block.icon}</span>
                  <span style={{
                    fontSize: "0.64rem", letterSpacing: "0.12em",
                    color: block.color, fontFamily: "'Rajdhani',sans-serif",
                    fontWeight: 700,
                  }}>
                    {block.title.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", lineHeight: 1.6 }}>
                  {block.text}
                </div>
              </div>
            ))}

            {/* Tagline */}
            <div style={{
              textAlign: "center", fontSize: "0.65rem",
              color: `${color}88`, margin: "16px 0 20px",
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
              letterSpacing: "0.1em",
            }}>
              Level deine Stats · Clear Gates · Unlock your Path.
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={onDismiss}
                style={{
                  background: `${color}18`, border: `1px solid ${color}55`,
                  color: color, borderRadius: 4, padding: "13px",
                  fontSize: "0.8rem", cursor: "pointer",
                  fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
                  letterSpacing: "0.1em", textShadow: `0 0 10px ${color}55`,
                }}
              >
                ◈ SYSTEM VERSTANDEN
              </button>
              <button
                onClick={() => { onSetInterests(); onDismiss(); }}
                style={{
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.35)",
                  color: "#a78bfa", borderRadius: 4, padding: "12px",
                  fontSize: "0.78rem", cursor: "pointer",
                  fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                ◇ INTERESSEN SETZEN
              </button>
            </div>

            <div style={{
              fontSize: "0.64rem", color: "#64748b",
              textAlign: "center", marginTop: 14, lineHeight: 1.5,
            }}>
              Onboarding jederzeit wieder aufrufbar unter<br />
              Status → System Configuration → Onboarding
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

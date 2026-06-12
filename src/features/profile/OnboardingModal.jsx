// ============================================================
// ONBOARDING MODAL — SYSTEM INITIALIZED
// Erscheint beim ersten Start und erklärbar im System-Menü.
// Erklärt: neutraler Start, Signal-System, Gate-System.
// ============================================================

export function OnboardingModal({ onDismiss, onSetInterests, rc }) {
  const color = rc?.primary || "#00ffff";

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
      <div style={{
        background: "#050510",
        border: `1px solid ${color}22`,
        borderRadius: 20,
        padding: "28px 22px",
        width: "100%",
        maxWidth: 420,
        maxHeight: "85vh",
        overflowY: "auto",
        animation: "statModal 0.3s ease",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{
            fontSize: "0.48rem", letterSpacing: "0.35em",
            color: `${color}66`, marginBottom: 6,
            fontFamily: "'Orbitron',sans-serif",
          }}>
            ◈ ARISE SYSTEM ◈
          </div>
          <div style={{
            fontSize: "1.1rem", fontFamily: "'Orbitron',sans-serif",
            fontWeight: 900, color: color,
            textShadow: `0 0 20px ${color}88`,
            letterSpacing: "0.08em", marginBottom: 4,
          }}>
            SYSTEM INITIALIZED
          </div>
          <div style={{ width: 60, height: 1, background: `${color}33`, margin: "0 auto" }} />
        </div>

        {/* Main text */}
        <div style={{
          fontSize: "0.76rem", color: "#94a3b8", lineHeight: 1.75,
          marginBottom: 20,
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
            background: `${block.color}08`,
            border: `1px solid ${block.color}20`,
            borderRadius: 12, padding: "12px 14px",
            marginBottom: 10,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 5,
            }}>
              <span style={{ color: block.color, fontSize: "0.85rem" }}>{block.icon}</span>
              <span style={{
                fontSize: "0.6rem", letterSpacing: "0.12em",
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
          color: `${color}77`, marginBottom: 22,
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
              background: `${color}18`, border: `1px solid ${color}44`,
              color: color, borderRadius: 10, padding: "13px",
              fontSize: "0.8rem", cursor: "pointer",
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            ◈ SYSTEM VERSTANDEN
          </button>
          <button
            onClick={() => { onSetInterests(); onDismiss(); }}
            style={{
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "#8b5cf6", borderRadius: 10, padding: "12px",
              fontSize: "0.78rem", cursor: "pointer",
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            ◇ INTERESSEN SETZEN
          </button>
        </div>

        <div style={{
          fontSize: "0.56rem", color: "#64748b",
          textAlign: "center", marginTop: 14, lineHeight: 1.5,
        }}>
          Onboarding jederzeit wieder aufrufbar unter<br />
          Status → System Configuration → Onboarding
        </div>

      </div>
    </div>
  );
}

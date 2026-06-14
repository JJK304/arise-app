// ============================================================
// ERROR BOUNDARY — fängt Render-Crashes ab, statt weißem Bildschirm.
// Zeigt ein System-Fenster mit Daten-Backup-Ausweg, damit ein
// Fehler nie zu stillem Fortschrittsverlust führt.
// ============================================================
import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    try { console.error("ARISE SYSTEM ERROR:", error, info); } catch (_) {}
  }

  exportData = () => {
    try {
      const raw = localStorage.getItem("arise_v3") || "{}";
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `arise-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
  };

  render() {
    if (!this.state.error) return this.props.children;

    const c = "#00e5ff";
    const corners = [["top","left"],["top","right"],["bottom","left"],["bottom","right"]];

    return (
      <div style={{ minHeight: "100vh", background: "#04040a", backgroundImage: "radial-gradient(ellipse at 50% 0%,#2a0a12,#04040a 62%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Rajdhani',sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
        <div style={{ position: "relative", width: "100%", maxWidth: 400, background: "linear-gradient(180deg,#0d0710f2,#05060ef2)", border: "1px solid #ef444433", borderRadius: 6, padding: "30px 24px 24px", boxShadow: "0 0 40px #ef444418" }}>
          {corners.map(([v, h], i) => (
            <div key={i} style={{ position: "absolute", [v]: 8, [h]: 8, width: 14, height: 14,
              borderTop:    v === "top"    ? "2px solid #ef4444" : "none",
              borderBottom: v === "bottom" ? "2px solid #ef4444" : "none",
              borderLeft:   h === "left"   ? "2px solid #ef4444" : "none",
              borderRight:  h === "right"  ? "2px solid #ef4444" : "none", opacity: 0.85 }} />
          ))}

          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: "0.64rem", letterSpacing: "0.42em", color: "#ef4444", fontFamily: "'Orbitron',sans-serif", fontWeight: 700, marginBottom: 10, textShadow: "0 0 14px #ef444466" }}>◈ SYSTEM ◈</div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.25rem", fontWeight: 900, color: "#ef4444", letterSpacing: "0.08em", textShadow: "0 0 20px #ef444488" }}>⚠ SYSTEM ERROR</div>
          </div>

          <div style={{ color: "#cbd5e1", fontSize: "0.8rem", lineHeight: 1.7, textAlign: "center", marginBottom: 20 }}>
            Ein unerwarteter Fehler ist aufgetreten.<br />
            <span style={{ color: "#94a3b8" }}>Deine Daten sind gespeichert. Sichere sie zur Sicherheit und starte das System neu.</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <button onClick={this.exportData} style={{ width: "100%", background: `${c}18`, border: `1px solid ${c}55`, color: c, borderRadius: 4, padding: 13, fontSize: "0.82rem", fontFamily: "'Orbitron',sans-serif", fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer", textShadow: `0 0 10px ${c}55` }}>
              ↓ DATEN SICHERN
            </button>
            <button onClick={() => window.location.reload()} style={{ width: "100%", background: "rgba(239,68,68,0.12)", border: "1px solid #ef444455", color: "#ef4444", borderRadius: 4, padding: 13, fontSize: "0.82rem", fontFamily: "'Orbitron',sans-serif", fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer" }}>
              ⟳ SYSTEM NEUSTART
            </button>
          </div>

          <div style={{ fontSize: "0.64rem", color: "#475569", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
            Bleibt der Fehler bestehen, importiere das Backup nach einem Neustart.
          </div>
        </div>
      </div>
    );
  }
}

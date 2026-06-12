// ============================================================
// PROGRESS ARCHIVE MODAL — Ausgelagert aus App.jsx (Prompt 17)
// Optional nach Quest-Abschluss: Metriken + Notiz eingeben.
// ============================================================
import { getLogFields, METRIC_LABELS, canLogWithBonus } from "../../lib/progressLogs.js";

export function ProgressLogModal({ quest, logForm, setLogForm, onSave, onDismiss, progressLogs }) {
  if (!quest) return null;

  let fields;
  try { fields = getLogFields(quest); } 
  catch(_) { fields = { metrics: ["duration"], notesLabel: "Notiz (optional)", notesRequired: false }; }
  const isReflection = quest.actionType === "reflection";
  const bonus = canLogWithBonus(progressLogs || [], quest.id);
  const xpHint = bonus ? "5–15" : "0";

  return (
    <div style={{ position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 80px" }}
      onClick={e => { if (e.target === e.currentTarget) onDismiss(); }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:"#050510",border:"1px solid #8b5cf644",borderRadius:"20px 20px 0 0",padding:"22px 18px",width:"100%",maxWidth:480,animation:"statModal 0.25s ease",maxHeight:"80vh",overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div>
            <div style={{ fontSize:"0.52rem",letterSpacing:"0.2em",color:"#8b5cf666",marginBottom:3 }}>SYSTEM RECORD</div>
            <div style={{ fontSize:"0.88rem",color:"#e2e8f0",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{quest.title}</div>
          </div>
          <button onClick={onDismiss}
            style={{ background:"transparent",border:"none",color:"#64748b",fontSize:"1.1rem",cursor:"pointer",padding:4 }}>✕</button>
        </div>

        {/* Metrics */}
        {fields.metrics.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:"0.52rem",letterSpacing:"0.15em",color:"#64748b",marginBottom:8 }}>METRICS (optional)</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {fields.metrics.map(key => {
                const meta = METRIC_LABELS[key];
                if (!meta) return null;
                if (meta.type === "text") {
                  return (
                    <div key={key} style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize:"0.52rem",color:"#64748b",letterSpacing:"0.1em" }}>
                        {meta.icon} {meta.label}
                      </label>
                      <input
                        type="text" maxLength={200}
                        value={logForm.metrics[key] || ""}
                        onChange={e => setLogForm(f => ({ ...f, metrics: { ...f.metrics, [key]: e.target.value } }))}
                        style={{ width:"100%",background:"#0b1020",border:"1px solid #1e293b",borderRadius:6,color:"#e2e8f0",fontSize:"0.7rem",padding:"6px 8px",marginTop:2 }}
                      />
                    </div>
                  );
                }
                if (!meta) return null;
                const isRange = meta.type === "range";
                return (
                  <div key={key} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:9,padding:"10px" }}>
                    <div style={{ fontSize:"0.56rem",color:"#64748b",marginBottom:5 }}>
                      {meta.icon} {meta.label}{isRange ? " (1–5)" : ""}
                    </div>
                    <input
                      type="number" min={meta.min} max={meta.max} step={isRange ? 1 : 0.1}
                      value={logForm.metrics[key] || ""}
                      onChange={e => setLogForm(f => ({ ...f, metrics: { ...f.metrics, [key]: e.target.value } }))}
                      placeholder={isRange ? "1–5" : String(meta.min)}
                      style={{ width:"100%",background:"transparent",border:"none",color:"#e2e8f0",fontSize:"0.9rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,outline:"none",padding:0,boxSizing:"border-box" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:"0.52rem",letterSpacing:"0.15em",color:"#64748b",marginBottom:6 }}>
            {fields.notesLabel}{fields.notesRequired ? "" : " (optional)"}
          </div>
          <textarea
            value={logForm.notes}
            onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))}
            placeholder={isReflection ? "Reflection entry..." : "Notes..."}
            rows={isReflection ? 4 : 2}
            style={{ width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid #1a1a2e",borderRadius:9,padding:"10px 12px",color:"#e2e8f0",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",resize:"vertical",lineHeight:1.5 }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={() => onSave(quest, logForm)}
            style={{ flex:1,background:"rgba(139,92,246,0.15)",border:"1px solid #8b5cf644",color:"#8b5cf6",borderRadius:9,padding:"11px",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em" }}>
            ◈ ARCHIVE PROGRESS
          </button>
          <button onClick={onDismiss}
            style={{ background:"transparent",border:"1px solid rgba(148,163,184,0.15)",color:"#64748b",borderRadius:9,padding:"11px 14px",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
            SKIP
          </button>
        </div>

        <div style={{ fontSize:"0.58rem",color:"#475569",textAlign:"center",marginTop:8 }}>
          +{xpHint} XP — Documented Progress Bonus
        </div>
      </div>
    </div>
  );
}

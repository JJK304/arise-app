// ============================================================
// BODY VIEW — Körper-Tracking: Metrik-Chart, Delta-Karten,
// Check-in-Formular, Verlauf. Präsentational (Werte als Props).
// ============================================================
import { MiniChart } from "./MiniChart.jsx";

export function BodyView({ bodyEntries, bodyMetrics, bodyMetric, setBodyMetric, bodyChartData, activeMetric, bodyForm, setBodyForm, saveBodyEntry, rc }) {
  return (
    <div>
      <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#64748b",marginBottom:13 }}>KÖRPER-TRACKING</div>

      {/* Metric selector + chart */}
      {bodyEntries.length >= 2 && (
        <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:12,padding:"13px",marginBottom:15 }}>
          <div style={{ display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:2 }}>
            {bodyMetrics.map(m=>(
              <button key={m.k} onClick={()=>setBodyMetric(m.k)} style={{ background:bodyMetric===m.k?`${m.c}22`:"transparent",border:`1px solid ${bodyMetric===m.k?m.c+"55":"rgba(148,163,184,0.12)"}`,color:bodyMetric===m.k?m.c:"#64748b",borderRadius:6,padding:"4px 10px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>{m.l}</button>
            ))}
          </div>
          <MiniChart data={bodyChartData} color={activeMetric.c} height={70} label={`${activeMetric.l.toUpperCase()} VERLAUF (${activeMetric.u})`}/>
        </div>
      )}

      {/* Delta cards */}
      {bodyEntries.length >= 2 && (
        <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:10,padding:"11px 13px",marginBottom:15 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.15em",color:"#64748b",marginBottom:8 }}>VERÄNDERUNG (letzte 2 Einträge)</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7 }}>
            {bodyMetrics.map(m=>{
              const curr=parseFloat(bodyEntries[0][m.k]),prev=parseFloat(bodyEntries[1][m.k]);
              if(isNaN(curr)||isNaN(prev)) return null;
              const diff=curr-prev,better=(m.k==="weight"||m.k==="bf")?diff<0:diff>0;
              const color=diff===0?"#475569":better?"#22c55e":"#ef4444";
              return (
                <div key={m.k} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"0.64rem",color:"#64748b" }}>{m.l}</div>
                  <div style={{ fontSize:"0.88rem",fontWeight:700,color,fontFamily:"'Rajdhani',sans-serif",lineHeight:1.2 }}>{diff>0?"+":""}{diff%1===0?diff:diff.toFixed(1)}{m.u}</div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>
      )}

      {/* Check-in form */}
      <div style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${rc.primary}22`,borderRadius:12,padding:"15px",marginBottom:15 }}>
        <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:rc.primary,marginBottom:11 }}>NEUES CHECK-IN</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8 }}>
          {bodyMetrics.map(m=>(
            <div key={m.k}>
              <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:2 }}>{m.l}{m.u?` (${m.u})`:""}</div>
              <input value={bodyForm[m.k]} onChange={e=>setBodyForm(p=>({...p,[m.k]:e.target.value}))} placeholder="—" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}/>
            </div>
          ))}
        </div>
        <input value={bodyForm.note} onChange={e=>setBodyForm(p=>({...p,note:e.target.value}))} placeholder="Notiz (optional)" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
        <button onClick={saveBodyEntry} style={{ width:"100%",background:`linear-gradient(135deg,${rc.primary}18,${rc.primary}30)`,border:`1px solid ${rc.primary}44`,color:rc.primary,borderRadius:9,padding:"11px",fontSize:"0.8rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.1em",cursor:"pointer" }}>CHECK-IN SPEICHERN ◈</button>
      </div>

      {/* History */}
      {bodyEntries.length > 0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#64748b",marginBottom:4 }}>CHECK-IN VERLAUF</div>
          {bodyEntries.map((e,i)=>(
            <div key={e.ts} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:9,padding:"10px 13px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <span style={{ fontSize:"0.64rem",color:i===0?rc.primary:"#64748b",fontWeight:i===0?700:400 }}>{i===0?"● AKTUELL":e.date}</span>
                {i===0 && <span style={{ fontSize:"0.64rem",color:"#64748b" }}>{e.date}</span>}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5 }}>
                {bodyMetrics.filter(m=>e[m.k]).map(m=>(
                  <div key={m.k} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"0.64rem",color:"#64748b" }}>{m.l}</div>
                    <div style={{ fontSize:"0.76rem",color:"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:600 }}>{e[m.k]}{m.u}</div>
                  </div>
                ))}
              </div>
              {e.note && <div style={{ fontSize:"0.66rem",color:"#64748b",marginTop:5,fontStyle:"italic" }}>"{e.note}"</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

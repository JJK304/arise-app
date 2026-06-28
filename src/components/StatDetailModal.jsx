// ============================================================
// STAT DETAIL MODAL — aus App.jsx ausgelagert (Etappe 7).
// Reines Anzeige-Modal: Stat-Wert, Verlauf, Meilenstein-Liste.
// Schließbar via Backdrop / SCHLIESSEN-Button (onClose).
// ============================================================
import { STATS_CONFIG, SUB_STATS } from "../data/stats.js";
import { MiniChart } from "./MiniChart.jsx";
import { buildStatHistory } from "../lib/statHistory.js";

export function StatDetailModal({ selectedStat, state, rc, onClose }) {
  const sc = [...STATS_CONFIG, ...Object.entries(SUB_STATS).map(([k,v])=>({key:k,...v}))].find(s=>s.key===selectedStat);
  if(!sc) return null;
  const history = buildStatHistory(state, selectedStat);
  const currentVal = state.stats?.[selectedStat]||0;
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 80px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:rc.bg,border:`1px solid ${sc.color}44`,borderRadius:"20px 20px 0 0",padding:"24px 20px",width:"100%",maxWidth:480,animation:"statModal 0.25s ease",maxHeight:"70vh",overflowY:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:`${sc.color}18`,border:`1px solid ${sc.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem" }}>{sc.icon}</div>
            <div>
              <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.1rem",color:sc.color,textShadow:`0 0 10px ${sc.color}88` }}>{sc.label||selectedStat}</div>
              <div style={{ fontSize:"0.68rem",color:"#64748b" }}>{sc.desc||""}</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.8rem",fontWeight:900,color:sc.color,textShadow:`0 0 12px ${sc.color}`,lineHeight:1 }}>{currentVal}</div>
            <div style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.1em" }}>PUNKTE</div>
          </div>
        </div>

        {/* Chart or empty state */}
        {history.length >= 2 ? (
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#64748b",marginBottom:8 }}>STAT-ENTWICKLUNG</div>
            <MiniChart data={history} color={sc.color} height={70}/>
          </div>
        ) : history.length === 1 ? (
          <div style={{ background:`${sc.color}08`,border:`1px solid ${sc.color}22`,borderRadius:10,padding:"12px",marginBottom:18,textAlign:"center" }}>
            <div style={{ color:sc.color,fontSize:"0.8rem",fontWeight:700,marginBottom:2 }}>Erster Meilenstein erreicht</div>
            <div style={{ color:"#64748b",fontSize:"0.72rem" }}>Schließe weitere Meilensteine ab um den Verlauf zu sehen</div>
          </div>
        ) : (
          <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:10,padding:"16px",marginBottom:18,textAlign:"center" }}>
            <div style={{ color:"#64748b",fontSize:"0.8rem",marginBottom:4 }}>No Milestones Unlocked Yet</div>
            <div style={{ color:"#64748b",fontSize:"0.7rem" }}>Schließe einen Meilenstein ab um deinen ersten Punkt zu verdienen</div>
          </div>
        )}

        {/* Completed milestones list */}
        {history.length > 0 && (
          <div>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#64748b",marginBottom:8 }}>FREIGESCHALTETE MEILENSTEINE</div>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {history.map((h,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.08)",borderRadius:8,padding:"9px 12px" }}>
                  <div style={{ flex:1,fontSize:"0.78rem",color:"#94a3b8",fontWeight:600 }}>{h.title}</div>
                  <span style={{ color:sc.color,fontSize:"0.76rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif",marginLeft:8,flexShrink:0 }}>+{h.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose} style={{ width:"100%",marginTop:18,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",color:"#64748b",borderRadius:10,padding:"12px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em" }}>SCHLIESSEN</button>
      </div>
    </div>
  );
}

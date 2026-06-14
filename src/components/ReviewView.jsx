// ============================================================
// REVIEW VIEW — Weekly System Report: aktuelle Wochen-Stats,
// Reflexions-Formular, vergangene Reports. saveWeeklyReview als Prop.
// ============================================================
import { getWeekQuestStats, getCurrentWeekReview, hasReviewThisWeek } from "../lib/weeklyReview.js";
import { DOMAINS } from "../data/domains.js";
import { PATHS } from "../data/paths.js";

export function ReviewView({ state, rc, showReviewForm, setShowReviewForm, reviewForm, setReviewForm, saveWeeklyReview }) {
  // Defensive guards — Review crasht sonst bei frisch gespeicherten Logs
  const safeQuestHistory  = Array.isArray(state.questHistory)  ? state.questHistory  : [];
  const safeWeeklyReviews = Array.isArray(state.weeklyReviews) ? state.weeklyReviews : [];
  const safeGoals         = Array.isArray(state.goals)         ? state.goals         : [];
  const weekStats     = getWeekQuestStats(safeQuestHistory);
  const existingReview= getCurrentWeekReview(safeWeeklyReviews);
  const alreadyDone   = hasReviewThisWeek(safeWeeklyReviews);
  const allReviews    = [...safeWeeklyReviews].reverse();
  const activeGoals   = safeGoals.filter(g=>g.status==="active");

  const DomainPill = ({domain, count}) => {
    const d = DOMAINS[domain] || { label: domain, icon:"◈", color:"#64748b" };
    return (
      <span style={{ background:`${d.color}15`,border:`1px solid ${d.color}33`,color:d.color,borderRadius:20,padding:"3px 9px",fontSize:"0.64rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,display:"inline-flex",alignItems:"center",gap:4 }}>
        {d.icon} {d.label} <span style={{opacity:0.6}}>×{count}</span>
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8" }}>⟁ WEEKLY SYSTEM REPORT</div>
        {!alreadyDone && (
          <button onClick={()=>setShowReviewForm(v=>!v)}
            style={{ background:"rgba(139,92,246,0.12)",border:"1px solid #8b5cf644",color:"#8b5cf6",borderRadius:8,padding:"5px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
            {showReviewForm ? "✕ CANCEL" : "◈ WRITE SYSTEM REPORT"}
          </button>
        )}
        {alreadyDone && (
          <span style={{ fontSize:"0.64rem",color:"#22c55e",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>✓ Report Submitted</span>
        )}
      </div>

      {/* Diese Woche Stats — immer sichtbar */}
      <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:12,padding:"14px",marginBottom:12 }}>
        <div style={{ fontSize:"0.64rem",letterSpacing:"0.18em",color:"#94a3b8",marginBottom:10 }}>CURRENT CYCLE</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
          <div style={{ background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px",textAlign:"center" }}>
            <div style={{ fontSize:"1.4rem",fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:rc.primary,lineHeight:1 }}>{weekStats.count}</div>
            <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:3 }}>Quests</div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px",textAlign:"center" }}>
            <div style={{ fontSize:"1.4rem",fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#22c55e",lineHeight:1 }}>{weekStats.totalXp}</div>
            <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:3 }}>XP</div>
          </div>
        </div>

        {/* Top Domains */}
        {weekStats.topDomains.length > 0 && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:"0.64rem",color:"#94a3b8",marginBottom:6 }}>DOMINANT DOMAINS</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {weekStats.topDomains.map(({domain,count}) => (
                <DomainPill key={domain} domain={domain} count={count}/>
              ))}
            </div>
          </div>
        )}

        {/* Top Paths */}
        {weekStats.topPaths.length > 0 && (
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:"0.64rem",color:"#94a3b8",marginBottom:6 }}>ACTIVE PATHS</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {weekStats.topPaths.map(({path,count}) => {
                const p = PATHS[path];
                if (!p) return null;
                return (
                  <span key={path} style={{ background:`${p.color}15`,border:`1px solid ${p.color}33`,color:p.color,borderRadius:20,padding:"3px 9px",fontSize:"0.64rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,display:"inline-flex",alignItems:"center",gap:3 }}>
                    {p.icon} {p.name} <span style={{opacity:0.6}}>×{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {weekStats.count === 0 && (
          <div style={{ color:"#64748b",fontSize:"0.72rem",textAlign:"center" }}>No quests cleared this cycle.</div>
        )}
      </div>

      {/* Aktive Ziele Vorschau */}
      {activeGoals.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:12,padding:"14px",marginBottom:12 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.18em",color:"#94a3b8",marginBottom:10 }}>ACTIVE OBJECTIVES</div>
          {activeGoals.slice(0,3).map(g => {
            const pct = Math.min(Math.round((g.currentValue/g.targetValue)*100),100);
            return (
              <div key={g.id} style={{ marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                  <span style={{ fontSize:"0.7rem",color:"#94a3b8",fontFamily:"'Rajdhani',sans-serif" }}>{g.icon} {g.title}</span>
                  <span style={{ fontSize:"0.64rem",color:"#64748b" }}>{pct}%</span>
                </div>
                <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:3,height:3,overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${rc.primary}66,${rc.primary})`,borderRadius:3 }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && !alreadyDone && (
        <div style={{ background:"rgba(139,92,246,0.04)",border:"1px solid #8b5cf622",borderRadius:12,padding:"14px",marginBottom:12 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.18em",color:"#8b5cf6",marginBottom:12 }}>SYSTEM REFLECTION</div>

          {[
            { key:"wentWell",  label:"Was lief diese Woche gut?",               placeholder:"Erfolge, Highlights, Fortschritte..." },
            { key:"wasHard",   label:"Was war schwer oder hat nicht geklappt?",  placeholder:"Herausforderungen, Blockaden..." },
            { key:"learned",   label:"Was habe ich gelernt oder erkannt?",       placeholder:"Erkenntnisse, Einsichten..." },
            { key:"nextFocus", label:"Mein Fokus für nächste Woche:",            placeholder:"Hauptziel, wichtigste Aufgabe..." },
          ].map(field => (
            <div key={field.key} style={{ marginBottom:10 }}>
              <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:4 }}>{field.label}</div>
              <textarea
                value={reviewForm[field.key]}
                onChange={e=>setReviewForm(f=>({...f,[field.key]:e.target.value}))}
                placeholder={field.placeholder}
                rows={2}
                style={{ width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,padding:"9px 11px",color:"#e2e8f0",fontSize:"0.78rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",resize:"vertical",lineHeight:1.5 }}
              />
            </div>
          ))}

          <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:10 }}>
            Bonus: +{80 + (reviewForm.wentWell||reviewForm.wasHard||reviewForm.learned||reviewForm.nextFocus ? 20 : 0)} XP
          </div>

          <div style={{ display:"flex",gap:7 }}>
            <button onClick={()=>saveWeeklyReview(reviewForm)}
              style={{ flex:1,background:"rgba(139,92,246,0.15)",border:"1px solid #8b5cf644",color:"#8b5cf6",borderRadius:9,padding:"11px",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em" }}>
              ◈ SUBMIT REPORT
            </button>
            <button onClick={()=>{ saveWeeklyReview({}); }}
              style={{ background:"transparent",border:"1px solid rgba(148,163,184,0.12)",color:"#64748b",borderRadius:9,padding:"11px 14px",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
              SKIP REFLECTION
            </button>
          </div>
        </div>
      )}

      {/* Vergangene Reviews */}
      {allReviews.length > 0 && (
        <div style={{ marginTop:8 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.18em",color:"#94a3b8",marginBottom:10 }}>✦ PAST SYSTEM REPORTS ({allReviews.length})</div>
          {allReviews.slice(0,5).map(review => (
            <div key={review.id} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:10,padding:"12px",marginBottom:8 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                <div style={{ fontSize:"0.7rem",color:"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>Week {review.weekKey?.replace(/.*-W/,"")}</div>
                <div style={{ display:"flex",gap:8 }}>
                  <span style={{ fontSize:"0.64rem",color:"#22c55e" }}>✓ {review.completedQuestsCount} Quests</span>
                  <span style={{ fontSize:"0.64rem",color:"#f59e0b" }}>+{review.xpThisWeek||0} XP</span>
                </div>
              </div>
              {review.reflection?.nextFocus && (
                <div style={{ fontSize:"0.66rem",color:"#94a3b8",lineHeight:1.4 }}>
                  <span style={{ color:"#8b5cf666" }}>Fokus: </span>
                  {(review.reflection?.nextFocus||"").slice(0,80)}{(review.reflection?.nextFocus||"").length>80?"…":""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {allReviews.length === 0 && !showReviewForm && (
        <div style={{ textAlign:"center",padding:"30px 20px",color:"#64748b" }}>
          <div style={{ fontSize:"2rem",marginBottom:10 }}>⟁</div>
          <div style={{ fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,marginBottom:6 }}>No System Reports</div>
          <div style={{ fontSize:"0.68rem",lineHeight:1.5 }}>Submit a weekly system report to track your awakening progress.</div>
        </div>
      )}
    </div>
  );
}

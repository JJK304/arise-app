import { PATHS } from "../data/paths.js";

// ============================================================
// GATE CARD — Prompt 11 Update: locked state, tier badge
// ============================================================
export const GateCard = ({ gate, stepsDone, completed, onToggleStep, onClaim, recommended, locked }) => {
  const totalSteps = gate.steps.length;
  const doneCnt    = stepsDone.length;
  const allDone    = doneCnt === totalSteps;
  const pct        = totalSteps > 0 ? (doneCnt / totalSteps) * 100 : 0;
  const pathInfo   = PATHS[gate.path];

  // Locked: Gate II/III noch nicht erreichbar
  if (locked) {
    const prevGateLabel = gate.unlockCondition
      ? gate.unlockCondition.replace(/_/g," ").replace(/gate /i,"Gate ").replace(/(\w+)/g, w => w.charAt(0).toUpperCase()+w.slice(1))
      : null;
    return (
      <div style={{
        background: "rgba(255,255,255,0.01)",
        border: "1px solid rgba(148,163,184,0.08)",
        borderRadius: 12, padding: "11px 14px",
        opacity: 0.45, position: "relative", overflow: "hidden",
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:"0.9rem",filter:"grayscale(1)" }}>{gate.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"0.7rem",color:"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{gate.title}</div>
            {prevGateLabel && (
              <div style={{ fontSize:"0.58rem",color:"#64748b",marginTop:2 }}>⧫ Erfordert: {prevGateLabel}</div>
            )}
          </div>
          <span style={{ fontSize:"0.6rem",color:"#64748b",background:"rgba(255,255,255,0.04)",borderRadius:4,padding:"2px 6px" }}>
            TIER {gate.tier}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: completed
        ? "rgba(255,255,255,0.01)"
        : `linear-gradient(135deg, rgba(255,255,255,0.03), ${gate.color}08)`,
      border: `1px solid ${completed ? "rgba(148,163,184,0.08)" : recommended ? gate.color + "66" : gate.color + "33"}`,
      borderRadius: 12,
      padding: "14px",
      opacity: completed ? 0.45 : 1,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s",
    }}>
      {/* Top accent line */}
      {!completed && (
        <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${gate.color},transparent)`,opacity:0.7 }}/>
      )}

      {/* Recommended badge */}
      {recommended && !completed && (
        <div style={{ position:"absolute",top:10,right:10,background:`${gate.color}22`,border:`1px solid ${gate.color}44`,borderRadius:20,padding:"2px 8px",fontSize:"0.55rem",color:gate.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em" }}>
          EMPFOHLEN
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:10 }}>
        <div style={{ width:38,height:38,borderRadius:10,background:`${gate.color}18`,border:`1px solid ${gate.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0 }}>
          {gate.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
            <span style={{ fontSize:"0.56rem",letterSpacing:"0.12em",color:gate.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>◈ GATE QUEST</span>
            {gate.tier && (
              <span style={{ background:`${gate.color}15`,border:`1px solid ${gate.color}33`,color:gate.color,borderRadius:4,padding:"1px 5px",fontSize:"0.52rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif" }}>
                TIER {gate.tier}
              </span>
            )}
            {pathInfo && (
              <>
                <span style={{ color:"#475569",fontSize:"0.56rem" }}>·</span>
                <span style={{ fontSize:"0.56rem",color:pathInfo.color }}>{pathInfo.icon} {pathInfo.name}</span>
              </>
            )}
          </div>
          <div style={{ fontSize:"0.86rem",fontWeight:700,color:completed?"#64748b":"#e5e7eb",lineHeight:1.3 }}>
            {gate.title}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:10 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
          <span style={{ fontSize:"0.58rem",color:"#64748b",letterSpacing:"0.08em" }}>AWAKENING PROGRESS</span>
          <span style={{ fontSize:"0.62rem",color:allDone?"#22c55e":gate.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{doneCnt}/{totalSteps}</span>
        </div>
        <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:4,height:4,overflow:"hidden" }}>
          <div style={{ width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${gate.color}66,${gate.color})`,borderRadius:4,transition:"width 0.5s ease",boxShadow:`0 0 6px ${gate.color}88` }}/>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display:"flex",flexDirection:"column",gap:5,marginBottom:12 }}>
        {gate.steps.map((step, i) => {
          const done = stepsDone.includes(i);
          return (
            <button
              key={i}
              onClick={() => !completed && onToggleStep(gate.id, i)}
              style={{
                background: done ? `${gate.color}12` : "rgba(255,255,255,0.02)",
                border: `1px solid ${done ? gate.color+"44" : "#1a1a2e"}`,
                borderRadius: 7,
                padding: "8px 10px",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                cursor: completed ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width:16,height:16,borderRadius:4,border:`1.5px solid ${done?gate.color:gate.color+"44"}`,background:done?`${gate.color}33`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all 0.2s" }}>
                {done && <span style={{ color:gate.color,fontSize:"0.7rem",lineHeight:1 }}>✓</span>}
              </div>
              <span style={{ fontSize:"0.74rem",color:done?"#64748b":"#94a3b8",lineHeight:1.4,textDecoration:done?"line-through":"none" }}>
                {step}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reward preview */}
      <div style={{ background:`${gate.color}08`,border:`1px solid ${gate.color}1a`,borderRadius:8,padding:"9px 11px",marginBottom:allDone&&!completed?10:0 }}>
        <div style={{ fontSize:"0.52rem",letterSpacing:"0.12em",color:"#64748b",marginBottom:5 }}>GATE REWARD</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,alignItems:"center" }}>
          <span style={{ fontSize:"0.72rem",color:"#22c55e",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>+{gate.reward.xp} XP</span>
          {Object.entries(gate.reward.affinity || {}).map(([pathId, pts]) => (
            <span key={pathId} style={{ fontSize:"0.66rem",color:PATHS[pathId]?.color||"#aaa" }}>
              +{pts} {PATHS[pathId]?.name} Affinity
            </span>
          ))}
          {gate.reward.title && (
            <span style={{ fontSize:"0.66rem",color:"#f59e0b",background:"rgba(245,158,11,0.1)",borderRadius:20,padding:"2px 7px" }}>
              Titel: {gate.reward.title}
            </span>
          )}
        </div>
      </div>

      {/* Claim button — nur wenn alle Steps done und noch nicht claimed */}
      {allDone && !completed && (
        <button
          onClick={() => onClaim(gate)}
          style={{ width:"100%",background:`linear-gradient(135deg,${gate.color}20,${gate.color}38)`,border:`1px solid ${gate.color}66`,color:gate.color,borderRadius:9,padding:"11px",fontSize:"0.82rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.1em",cursor:"pointer",transition:"all 0.2s",marginTop:10 }}
          onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 16px ${gate.color}44`}
          onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
        >
          GATE CLEARED ✓
        </button>
      )}

      {completed && (
        <div style={{ textAlign:"center",fontSize:"0.72rem",color:"#22c55e44",marginTop:8,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.1em" }}>
          ✓ GATE CLEARED
        </div>
      )}
    </div>
  );
};

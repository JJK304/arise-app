import { STATS_CONFIG, SUB_STATS, CAT_LABELS } from "../data/stats.js";
import { PATHS } from "../data/paths.js";
import { DOMAINS } from "../data/domains.js";

// ============================================================
// CHALLENGE CARD — Design Fix: Lesbarkeit & Icon-System
// ============================================================
export const ChallengeCard = ({ challenge, done, onComplete, rankColor, recommended, goals = [] }) => {
  const typeColors = {
    daily:       "#3b82f6",
    weekly:      "#8b5cf6",
    milestone:   "#f59e0b",
    custom:      "#06b6d4",
    personalized:"#a78bfa",
    recovery:    "#22c55e",
  };
  const typeLabels = {
    daily:       "◎ DAILY",
    weekly:      "◇ WEEKLY",
    milestone:   "◆ MILESTONE",
    custom:      "✦ CUSTOM",
    personalized:"◈ RECOMMENDED",
    recovery:    "⟡ RECOVERY",
    gate:        "⧫ GATE",
  };

  const tc = challenge.recovery
    ? typeColors.recovery
    : typeColors[challenge.personalized ? "personalized" : challenge.type] || "#3b82f6";
  const typeLabel = challenge.recovery
    ? typeLabels.recovery
    : challenge.personalized
      ? typeLabels.personalized
      : (typeLabels[challenge.type] || "◈ QUEST");

  const isMilestone = challenge.type === "milestone";
  const statKey     = challenge.subStat || challenge.stat;
  const statCfg     = SUB_STATS[statKey] || STATS_CONFIG.find(s => s.key === statKey);
  const statColor   = statCfg?.color || "#aaa";
  const pathInfo    = challenge.path ? PATHS[challenge.path] : null;

  const domainInfo  = challenge.domain ? DOMAINS[challenge.domain] : null;
  const catLabel    = challenge.cat ? CAT_LABELS[challenge.cat] : null;
  const domainLabel = domainInfo?.label
    ? `${domainInfo.icon} ${domainInfo.label}`
    : catLabel || null;

  const linkedGoal = challenge.goalId
    ? goals.find(g => g.id === challenge.goalId)
    : null;

  const bgStyle = done
    ? "rgba(255,255,255,0.01)"
    : challenge.recovery
      ? `linear-gradient(135deg,rgba(34,197,94,0.04),rgba(34,197,94,0.07))`
      : isMilestone
        ? `linear-gradient(135deg,rgba(255,255,255,0.04),${tc}08)`
        : challenge.personalized
          ? `linear-gradient(135deg,rgba(167,139,250,0.03),rgba(167,139,250,0.06))`
          : "rgba(255,255,255,0.035)";

  return (
    <div style={{
      background: bgStyle,
      border: `1px solid ${done ? "rgba(148,163,184,0.08)" : recommended ? tc+"88" : isMilestone ? tc+"55" : tc+"33"}`,
      borderRadius: 10,
      padding: "11px 13px",
      opacity: done ? 0.4 : 1,
      transition: "all 0.3s",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Top accent line */}
      {!done && (
        <div style={{ position:"absolute",top:0,left:0,right:0,height:recommended?3:2,background:`linear-gradient(90deg,transparent,${tc},transparent)`,opacity:isMilestone?0.8:recommended?0.9:0.45 }}/>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>

          {/* Meta row */}
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:4, marginBottom:4, lineHeight:1 }}>
            <span style={{ color:tc, fontSize:"0.58rem", letterSpacing:"0.08em", fontWeight:700 }}>{typeLabel}</span>

            {recommended && !done && (
              <span style={{ background:`${tc}22`, border:`1px solid ${tc}44`, color:tc, borderRadius:20, padding:"1px 6px", fontSize:"0.52rem", letterSpacing:"0.06em", fontWeight:700 }}>◈ SYS.EMPFEHLUNG</span>
            )}

            <span style={{ color:"#475569" }}>·</span>

            <span style={{ color: isMilestone ? "#22c55e" : "#22c55e", fontSize:"0.6rem", fontWeight:700 }}>
              +{challenge.xp} XP
            </span>

            {isMilestone && challenge.statPts > 0 && (
              <>
                <span style={{ color:"#475569" }}>·</span>
                <span style={{ color:statColor, fontSize:"0.58rem", fontWeight:700 }}>+{challenge.statPts} {statKey}</span>
              </>
            )}

            {pathInfo && (
              <>
                <span style={{ color:"#475569" }}>·</span>
                <span style={{ color:pathInfo.color, fontSize:"0.56rem" }}>{pathInfo.icon} {pathInfo.name}</span>
              </>
            )}

            {challenge.topic && (
              <>
                <span style={{ color:"#475569" }}>·</span>
                <span style={{ color:"#a78bfa88", fontSize:"0.56rem" }}>{challenge.topic}</span>
              </>
            )}
          </div>

          {/* Title */}
          <div style={{
            color: done ? "#64748b" : "#e5e7eb",
            fontWeight: 600,
            fontSize: "0.84rem",
            marginBottom: challenge.desc ? 3 : 0,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {challenge.title}
          </div>

          {/* Description */}
          {challenge.desc && (
            <div style={{ color:"#94a3b8", fontSize:"0.72rem", lineHeight:1.4 }}>
              {challenge.desc}
            </div>
          )}

          {/* Bottom tags row */}
          {(!done) && (
            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginTop:5,alignItems:"center" }}>
              {domainLabel && !challenge.recovery && (
                <span style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:4,padding:"2px 6px",fontSize:"0.54rem",color:"#64748b" }}>
                  {domainLabel}
                </span>
              )}

              {linkedGoal && (
                <span style={{ background:"rgba(245,158,11,0.1)",border:"1px solid #f59e0b33",color:"#f59e0b",borderRadius:4,padding:"2px 6px",fontSize:"0.54rem",fontWeight:700 }}>
                  ⌖ {linkedGoal.title.slice(0,22)}{linkedGoal.title.length>22?"…":""}
                </span>
              )}

              {challenge.reason && (challenge.personalized || challenge.source === "generated") && (
                <span style={{ color:"#a78bfa55",fontSize:"0.52rem",fontFamily:"'Rajdhani',sans-serif" }}>
                  ↳ {challenge.reason}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action button */}
        {!done && (
          <button
            onClick={() => onComplete(challenge)}
            style={{
              background: `linear-gradient(135deg,${tc}14,${tc}28)`,
              border: `1px solid ${tc}44`,
              color: tc,
              borderRadius: 8,
              padding: isMilestone ? "9px 13px" : "7px 11px",
              fontSize: isMilestone ? "0.78rem" : "0.72rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 700,
              letterSpacing: "0.05em",
              transition: "all 0.2s",
              alignSelf: "flex-start",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 10px ${tc}44`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            {isMilestone ? "CLEARED" : "DONE"}
          </button>
        )}
        {done && (
          <span style={{ color:"#22c55e66", fontSize:"1rem", flexShrink:0, alignSelf:"flex-start", paddingTop:2 }}>✓</span>
        )}
      </div>
    </div>
  );
};

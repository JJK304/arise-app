import { STATS_CONFIG, SUB_STATS, CAT_LABELS } from "../data/stats.js";
import { PATHS } from "../data/paths.js";

// ============================================================
// CHALLENGE CARD
// ============================================================
export const ChallengeCard = ({ challenge, done, onComplete, rankColor, recommended }) => {
  const typeColors = {
    daily:"#3b82f6", weekly:"#8b5cf6", milestone:"#f59e0b",
    custom:"#06b6d4", personalized:"#a78bfa", recovery:"#22c55e",
  };
  const typeLabels = {
    daily:"◈ DAILY", weekly:"◉ WEEKLY", milestone:"★ MEILENSTEIN",
    custom:"✦ EIGENE", personalized:"★ FÜR MICH", recovery:"💚 RECOVERY",
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
  const domainLabel = challenge.cat ? (CAT_LABELS[challenge.cat] || challenge.cat) : null;

  // Background style
  const bgStyle = done
    ? "rgba(255,255,255,0.01)"
    : challenge.recovery
      ? `linear-gradient(135deg,rgba(34,197,94,0.04),rgba(34,197,94,0.07))`
      : isMilestone
        ? `linear-gradient(135deg,rgba(255,255,255,0.04),${tc}08)`
        : challenge.personalized
          ? `linear-gradient(135deg,rgba(167,139,250,0.04),rgba(167,139,250,0.08))`
          : "rgba(255,255,255,0.035)";

  return (
    <div style={{
      background: bgStyle,
      border: `1px solid ${done ? "#111" : recommended ? tc + "88" : isMilestone ? tc + "55" : tc + "33"}`,
      borderRadius: 10,
      padding: "11px 13px",
      opacity: done ? 0.38 : 1,
      transition: "all 0.3s",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Top accent */}
      {!done && (
        <div style={{ position:"absolute",top:0,left:0,right:0,height:recommended?3:2,background:`linear-gradient(90deg,transparent,${tc},transparent)`,opacity:isMilestone?0.8:recommended?0.9:0.45 }}/>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>

          {/* Meta row: type · XP · stat · path · topic · domain */}
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:4, marginBottom:4, lineHeight:1 }}>
            {/* Type label */}
            <span style={{ color:tc, fontSize:"0.58rem", letterSpacing:"0.08em", fontWeight:700 }}>{typeLabel}</span>

            {/* Recommended badge */}
            {recommended && !done && (
              <span style={{ background:`${tc}22`, border:`1px solid ${tc}44`, color:tc, borderRadius:20, padding:"1px 6px", fontSize:"0.52rem", letterSpacing:"0.06em", fontWeight:700 }}>EMPFOHLEN</span>
            )}

            <span style={{ color:"#222" }}>·</span>

            {/* XP */}
            <span style={{ color: isMilestone ? "#22c55e" : "#22c55e88", fontSize:"0.6rem", fontWeight:700 }}>
              +{challenge.xp} XP
            </span>

            {/* Stat points (milestones only) */}
            {isMilestone && challenge.statPts > 0 && (
              <>
                <span style={{ color:"#222" }}>·</span>
                <span style={{ color:statColor, fontSize:"0.58rem", fontWeight:700 }}>+{challenge.statPts} {statKey}</span>
              </>
            )}

            {/* Path */}
            {pathInfo && (
              <>
                <span style={{ color:"#222" }}>·</span>
                <span style={{ color:pathInfo.color, fontSize:"0.56rem" }}>{pathInfo.icon} {pathInfo.name}</span>
              </>
            )}

            {/* Topic */}
            {challenge.topic && (
              <>
                <span style={{ color:"#222" }}>·</span>
                <span style={{ color:"#a78bfa88", fontSize:"0.56rem" }}>{challenge.topic}</span>
              </>
            )}
          </div>

          {/* Title */}
          <div style={{
            color: done ? "#2d3748" : "#dde",
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
            <div style={{ color:"#2d3f52", fontSize:"0.72rem", lineHeight:1.4 }}>
              {challenge.desc}
            </div>
          )}

          {/* Domain tag */}
          {domainLabel && !challenge.recovery && (
            <div style={{ marginTop:5 }}>
              <span style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1a1a2e", borderRadius:4, padding:"2px 6px", fontSize:"0.54rem", color:"#334155" }}>
                {domainLabel}
              </span>
            </div>
          )}
        </div>

        {/* Action button / done check */}
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
            {isMilestone ? "BEWIESEN" : "DONE"}
          </button>
        )}
        {done && (
          <span style={{ color:"#22c55e66", fontSize:"1rem", flexShrink:0, alignSelf:"flex-start", paddingTop:2 }}>✓</span>
        )}
      </div>
    </div>
  );
};

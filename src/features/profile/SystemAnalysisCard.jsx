// ============================================================
// SYSTEM ANALYSIS CARD — Ausgelagert aus App.jsx (Prompt 17)
// Zeigt Pfad-Empfehlungen, Balance-Hinweise, Goal-Fokus,
// Next Best Quest und Shadow-Hinweis.
// ============================================================
import { PATHS } from "../../data/paths.js";
import { getRankUpStatus } from "../../lib/rankRequirements.js";
import { canUnlockShadow } from "../../data/paths.js";
import { getNextPathMilestone } from "../../data/gates.js";

export function SystemAnalysisCard({ state, sysAnalysis, rc, saveData, setState, showNotif }) {
  // Etappe 8: Anforderungen für den nächsten Rank (jenseits von XP)
  let rankUpStatus = null;
  try { rankUpStatus = getRankUpStatus(state); } catch (_) {}
  const affinities      = state.player?.affinities || {};
  const mainPath        = state.player?.mainPath;
  const secPath         = state.player?.secondaryPath;
  const shadowUnlockable= canUnlockShadow(affinities, state.gateProgress || {}, state.goals || [], state.rank || "E", { progressLogs: state.progressLogs || [], weeklyReviews: state.weeklyReviews || [] });
  const showSuggestion  = sysAnalysis.suggestedMainPath && (!mainPath || !secPath);
  const msg             = sysAnalysis.suggestedMessage;

  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ background:"rgba(0,255,255,0.04)",border:"1px solid #00ffff1e",borderRadius:10,padding:"13px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#00ffff66" }}>SYSTEM ANALYSIS</div>
          {sysAnalysis.rankPhase && (
            <span style={{ fontSize:"0.64rem",color:"#00ffff44",background:"rgba(0,255,255,0.06)",border:"1px solid #00ffff1a",borderRadius:4,padding:"2px 7px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em" }}>
              {{beginner:"BEGINNER",intermediate:"INTERMEDIATE",advanced:"ADVANCED",elite:"ELITE"}[sysAnalysis.rankPhase] || sysAnalysis.rankPhase.toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ fontSize:"0.76rem",color:"#94a3b8",lineHeight:1.55,marginBottom:sysAnalysis.dominantPaths.length>0?8:0 }}>
          {msg || "Complete more quests for the system to recognize your path."}
        </div>

        {/* Signal Paths — from signal system */}
        {(sysAnalysis.topSignalPaths || []).length > 0 ? (
          <div style={{ marginBottom: sysAnalysis.balanceHints.length>0||showSuggestion ? 8 : 0 }}>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.12em",color:"#00ffff44",marginBottom:4 }}>SIGNAL DETECTED</div>
            <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
              {(sysAnalysis.topSignalPaths || []).slice(0,4).map(sp => {
                const p = PATHS[sp.pathId];
                const levelLabel = ["—","WEAK","ACTIVE","STRONG"][sp.level] || "—";
                const levelColor = ["#64748b","#64748b","#f59e0b","#22c55e"][sp.level] || "#64748b";
                return (
                  <div key={sp.pathId} title={sp.reason} style={{ background:`${p?.color}10`,border:`1px solid ${p?.color}${sp.level >= 2 ? "40" : "1a"}`,borderRadius:20,padding:"3px 9px",display:"flex",alignItems:"center",gap:4 }}>
                    <span style={{ fontSize:"0.64rem",color:p?.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{p?.icon} {p?.name}</span>
                    <span style={{ fontSize:"0.64rem",color:levelColor,fontFamily:"'Orbitron',sans-serif",fontWeight:700 }}>{levelLabel}</span>
                  </div>
                );
              })}
            </div>
            {sysAnalysis.topSignalPaths?.[0]?.reason && (
              <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:4 }}>
                {sysAnalysis.topSignalPaths[0].reason}
              </div>
            )}
            {/* Etappe 6: nachvollziehbarer Signal-Breakdown des dominanten Pfads */}
            {sysAnalysis.dominantBreakdown?.parts?.length > 0 && (
              <div style={{ marginTop:6,padding:"6px 8px",background:"rgba(0,255,255,0.03)",border:"1px solid rgba(0,255,255,0.08)",borderRadius:6 }}>
                <div style={{ fontSize:"0.64rem",letterSpacing:"0.14em",color:"#00ffff33",marginBottom:3 }}>WARUM DIESES SIGNAL</div>
                {sysAnalysis.dominantBreakdown.parts.slice(0,4).map((part,i)=>(
                  <div key={i} style={{ fontSize:"0.64rem",color:"#94a3b8",lineHeight:1.5,display:"flex",justifyContent:"space-between",gap:8 }}>
                    <span>▸ {part.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : sysAnalysis.dominantPaths?.length > 0 ? (
          <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:sysAnalysis.balanceHints.length>0||showSuggestion?8:0 }}>
            {sysAnalysis.dominantPaths.map(pathId => {
              const p = PATHS[pathId];
              const cnt = sysAnalysis.pathCounts[pathId] || 0;
              return (
                <span key={pathId} style={{ background:`${p?.color}14`,border:`1px solid ${p?.color}2a`,color:p?.color,borderRadius:20,padding:"3px 9px",fontSize:"0.64rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
                  {p?.icon} {p?.name} ×{cnt}
                </span>
              );
            })}
          </div>
        ) : null}

        {/* Etappe 8: Rank-Up-Anforderungen (mehr als XP) — immer sichtbar wenn offen */}
        {rankUpStatus && !rankUpStatus.met && (
          <div style={{ marginBottom:8,padding:"6px 8px",background:"rgba(245,158,11,0.04)",border:"1px solid rgba(245,158,11,0.14)",borderRadius:6 }}>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.14em",color:"#f59e0b88",marginBottom:3 }}>
              ⧫ RANK-UP {rankUpStatus.nextRank} — ANFORDERUNGEN
            </div>
            {rankUpStatus.checks.map(c => (
              <div key={c.id} style={{ fontSize:"0.64rem",color:c.done?"#22c55e":"#94a3b8",lineHeight:1.55,display:"flex",justifyContent:"space-between",gap:8 }}>
                <span>{c.done ? "✓" : "▢"} {c.label}</span>
                <span style={{ color:c.done?"#22c55e":"#64748b",fontFamily:"'Orbitron',sans-serif",fontSize:"0.64rem" }}>{Math.min(c.have,c.need)}/{c.need}</span>
              </div>
            ))}
          </div>
        )}

        {/* Balance Hints */}
        {sysAnalysis.balanceHints.length > 0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:3,marginBottom:showSuggestion?8:0 }}>
            {sysAnalysis.balanceHints.map((hint,i) => (
              <div key={i} style={{ fontSize:"0.64rem",color:"#94a3b8",display:"flex",alignItems:"center",gap:5 }}>
                <span>{hint.icon}</span><span>{hint.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Path Suggestions */}
        {showSuggestion && (
          <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:8 }}>
            {!mainPath && sysAnalysis.suggestedMainPath && (
              <button onClick={()=>{
                const s2 = { ...state, player:{ ...state.player, mainPath: sysAnalysis.suggestedMainPath }};
                setState(s2); saveData("arise_v3", s2);
                showNotif(`◈ Main Path: ${PATHS[sysAnalysis.suggestedMainPath]?.name}`, PATHS[sysAnalysis.suggestedMainPath]?.color);
              }} style={{ background:`${PATHS[sysAnalysis.suggestedMainPath]?.color}16`,border:`1px solid ${PATHS[sysAnalysis.suggestedMainPath]?.color}44`,color:PATHS[sysAnalysis.suggestedMainPath]?.color,borderRadius:7,padding:"7px 12px",fontSize:"0.67rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.05em" }}>
                ◈ Set as Main Path
              </button>
            )}
            {!secPath && sysAnalysis.suggestedSecondaryPath && (
              <button onClick={()=>{
                const s2 = { ...state, player:{ ...state.player, secondaryPath: sysAnalysis.suggestedSecondaryPath }};
                setState(s2); saveData("arise_v3", s2);
                showNotif(`◈ Secondary Path: ${PATHS[sysAnalysis.suggestedSecondaryPath]?.name}`, PATHS[sysAnalysis.suggestedSecondaryPath]?.color);
              }} style={{ background:`${PATHS[sysAnalysis.suggestedSecondaryPath]?.color}12`,border:`1px solid ${PATHS[sysAnalysis.suggestedSecondaryPath]?.color}33`,color:PATHS[sysAnalysis.suggestedSecondaryPath]?.color,borderRadius:7,padding:"7px 12px",fontSize:"0.67rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.05em" }}>
                ◈ Set as Secondary Path
              </button>
            )}
          </div>
        )}

        {/* Next Path Milestone */}
        {(() => {
          const dominantPath = sysAnalysis?.topSignalPaths?.[0]?.pathId ||
                               sysAnalysis?.suggestedMainPath ||
                               state.player?.mainPath;
          const signalLv = sysAnalysis?.topSignalPaths?.[0]?.level || 0;
          if (!dominantPath) return null;
          try {
            const milestone = getNextPathMilestone(dominantPath, state, signalLv);
            if (!milestone) return null;
            const p = PATHS[dominantPath];
            return (
              <div style={{ marginTop:8,background:`${p?.color}08`,border:`1px solid ${p?.color}1a`,borderRadius:8,padding:"8px 11px" }}>
                <div style={{ fontSize:"0.64rem",letterSpacing:"0.12em",color:`${p?.color}88`,marginBottom:3 }}>NEXT MILESTONE</div>
                <div style={{ fontSize:"0.68rem",color:"#cbd5e1",lineHeight:1.4 }}>
                  {p?.icon} {milestone.label}
                </div>
                {milestone.specific && (
                  <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:2 }}>Spezifisch für {p?.name}</div>
                )}
              </div>
            );
          } catch(_) { return null; }
        })()}

        {/* Shadow */}
        {shadowUnlockable && (
          <div style={{ marginTop:10,display:"flex",alignItems:"center",gap:7 }}>
            <span style={{ fontSize:"1rem" }}>🌑</span>
            <div style={{ fontSize:"0.67rem",color:"#00ffff88",lineHeight:1.4 }}>Shadow Ascendant Path verfügbar — meistere alle Pfade.</div>
          </div>
        )}

        {/* Goal Focus */}
        {sysAnalysis.activeGoalFocus && (
          <div style={{ marginTop:10,background:"rgba(245,158,11,0.06)",border:"1px solid #f59e0b22",borderRadius:8,padding:"9px 11px" }}>
            <div style={{ fontSize:"0.64rem",color:"#f59e0b88",letterSpacing:"0.12em",marginBottom:4 }}>AKTIVES ZIEL</div>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
              <span style={{ fontSize:"1rem" }}>{sysAnalysis.activeGoalFocus.icon || "🎯"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.72rem",color:"#e2e8f0",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{sysAnalysis.activeGoalFocus.title}</div>
              </div>
              <span style={{ fontSize:"0.68rem",color:"#f59e0b",fontFamily:"'Orbitron',sans-serif",fontWeight:700 }}>{sysAnalysis.activeGoalFocus.pct}%</span>
            </div>
            <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:3,height:3 }}>
              <div style={{ width:`${sysAnalysis.activeGoalFocus.pct}%`,height:"100%",background:"linear-gradient(90deg,#f59e0b66,#f59e0b)",borderRadius:3 }}/>
            </div>
          </div>
        )}

        {/* Next Best Quest Reason */}
        {sysAnalysis.nextBestQuestReason && (
          <div style={{ marginTop:8,fontSize:"0.64rem",color:"#64748b",lineHeight:1.5,borderLeft:"2px solid #00ffff22",paddingLeft:8 }}>
            💡 {sysAnalysis.nextBestQuestReason}
          </div>
        )}

        {/* Balance Warning */}
        {sysAnalysis.balanceWarning && (
          <div style={{ marginTop:8,fontSize:"0.64rem",color:"#f59e0b88",lineHeight:1.5 }}>
            ⚠️ {sysAnalysis.balanceWarning}
          </div>
        )}
      </div>
    </div>
  );
}

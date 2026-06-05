// ============================================================
// SYSTEM ANALYSIS CARD — Ausgelagert aus App.jsx (Prompt 17)
// Zeigt Pfad-Empfehlungen, Balance-Hinweise, Goal-Fokus,
// Next Best Quest und Shadow-Hinweis.
// ============================================================
import { PATHS } from "../../data/paths.js";
import { canUnlockShadow } from "../../data/paths.js";

export function SystemAnalysisCard({ state, sysAnalysis, rc, saveData, setState, showNotif }) {
  const affinities      = state.player?.affinities || {};
  const mainPath        = state.player?.mainPath;
  const secPath         = state.player?.secondaryPath;
  const shadowUnlockable= canUnlockShadow(affinities, state.gateProgress || {}, state.goals || [], state.rank || "E");
  const showSuggestion  = sysAnalysis.suggestedMainPath && (!mainPath || !secPath);
  const msg             = sysAnalysis.suggestedMessage;

  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ background:"rgba(0,255,255,0.04)",border:"1px solid #00ffff1e",borderRadius:10,padding:"13px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
          <div style={{ fontSize:"0.52rem",letterSpacing:"0.2em",color:"#00ffff66" }}>SYSTEM ANALYSIS</div>
          {sysAnalysis.rankPhase && (
            <span style={{ fontSize:"0.52rem",color:"#00ffff44",background:"rgba(0,255,255,0.06)",border:"1px solid #00ffff1a",borderRadius:4,padding:"2px 7px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em" }}>
              {{beginner:"BEGINNER",intermediate:"INTERMEDIATE",advanced:"ADVANCED",elite:"ELITE"}[sysAnalysis.rankPhase] || sysAnalysis.rankPhase.toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ fontSize:"0.76rem",color:"#64748b",lineHeight:1.55,marginBottom:sysAnalysis.dominantPaths.length>0?8:0 }}>
          {msg || "Schließe weitere Quests ab, damit dein System deinen Pfad erkennt."}
        </div>

        {/* Dominant Paths */}
        {sysAnalysis.dominantPaths.length > 0 && (
          <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:sysAnalysis.balanceHints.length>0||showSuggestion?8:0 }}>
            {sysAnalysis.dominantPaths.map(pathId => {
              const p = PATHS[pathId];
              const cnt = sysAnalysis.pathCounts[pathId] || 0;
              return (
                <span key={pathId} style={{ background:`${p?.color}14`,border:`1px solid ${p?.color}2a`,color:p?.color,borderRadius:20,padding:"3px 9px",fontSize:"0.6rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
                  {p?.icon} {p?.name} ×{cnt}
                </span>
              );
            })}
          </div>
        )}

        {/* Balance Hints */}
        {sysAnalysis.balanceHints.length > 0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:3,marginBottom:showSuggestion?8:0 }}>
            {sysAnalysis.balanceHints.map((hint,i) => (
              <div key={i} style={{ fontSize:"0.64rem",color:"#475569",display:"flex",alignItems:"center",gap:5 }}>
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
                Als Main Path übernehmen
              </button>
            )}
            {!secPath && sysAnalysis.suggestedSecondaryPath && (
              <button onClick={()=>{
                const s2 = { ...state, player:{ ...state.player, secondaryPath: sysAnalysis.suggestedSecondaryPath }};
                setState(s2); saveData("arise_v3", s2);
                showNotif(`◈ Secondary Path: ${PATHS[sysAnalysis.suggestedSecondaryPath]?.name}`, PATHS[sysAnalysis.suggestedSecondaryPath]?.color);
              }} style={{ background:`${PATHS[sysAnalysis.suggestedSecondaryPath]?.color}12`,border:`1px solid ${PATHS[sysAnalysis.suggestedSecondaryPath]?.color}33`,color:PATHS[sysAnalysis.suggestedSecondaryPath]?.color,borderRadius:7,padding:"7px 12px",fontSize:"0.67rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.05em" }}>
                Als Secondary Path
              </button>
            )}
          </div>
        )}

        {/* Shadow */}
        {shadowUnlockable && (
          <div style={{ marginTop:10,display:"flex",alignItems:"center",gap:7 }}>
            <span style={{ fontSize:"1rem" }}>🌑</span>
            <div style={{ fontSize:"0.67rem",color:"#00ffff55",lineHeight:1.4 }}>Shadow Monarch Path verfügbar — meistere alle Pfade.</div>
          </div>
        )}

        {/* Goal Focus */}
        {sysAnalysis.activeGoalFocus && (
          <div style={{ marginTop:10,background:"rgba(245,158,11,0.06)",border:"1px solid #f59e0b22",borderRadius:8,padding:"9px 11px" }}>
            <div style={{ fontSize:"0.52rem",color:"#f59e0b66",letterSpacing:"0.12em",marginBottom:4 }}>AKTIVES ZIEL</div>
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
          <div style={{ marginTop:8,fontSize:"0.64rem",color:"#475569",lineHeight:1.5,borderLeft:"2px solid #00ffff22",paddingLeft:8 }}>
            💡 {sysAnalysis.nextBestQuestReason}
          </div>
        )}

        {/* Balance Warning */}
        {sysAnalysis.balanceWarning && (
          <div style={{ marginTop:8,fontSize:"0.62rem",color:"#f59e0b88",lineHeight:1.5 }}>
            ⚠️ {sysAnalysis.balanceWarning}
          </div>
        )}
      </div>
    </div>
  );
}

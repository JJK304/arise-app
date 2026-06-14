// ============================================================
// STATS VIEW — Radar, Stat-Bars (+Sub-Stats), LevelTree, Awakening-Pfad.
// Präsentational: dynamische Werte als Props, statische Daten importiert.
// ============================================================
import { RANKS, RANK_COLORS, TOTAL_LEVELS, LEVELS_PER_RANK } from "../data/ranks.js";
import { STATS_CONFIG, SUB_STATS } from "../data/stats.js";
import { StatBar } from "./StatBar.jsx";
import { RadarChart } from "./RadarChart.jsx";
import { LevelTree } from "../features/profile/LevelTree.jsx";

export function StatsView({ state, rc, setSelectedStat, xpNeeded, globalLvl }) {
  return (
    <div>
      <RadarChart stats={state.stats} rankColor={rc.primary}/>
      <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20,marginTop:18 }}>
        {STATS_CONFIG.map(sc=>(
          <div key={sc.key}>
            <StatBar label={`${sc.label} (${sc.key})`} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color} onClick={()=>setSelectedStat(sc.key)}/>
            {sc.sub && (
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginTop:5,marginLeft:10 }}>
                {sc.sub.map(k=><StatBar key={k} label={k} icon={SUB_STATS[k].icon} value={state.stats[k]||0} max={Math.max(10,(state.stats[k]||0)*1.8+5)} color={SUB_STATS[k].color} small onClick={()=>setSelectedStat(k)}/>)}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Etappe 11: visuelles Progressions-Feedback */}
      <LevelTree state={state} />
      <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:10 }}>◈ AWAKENING PFAD</div>
      {RANKS.map(r=>{
        const idx=RANKS.indexOf(r),ci=RANKS.indexOf(state.rank),passed=idx<ci,active=idx===ci;
        const rC=RANK_COLORS[r];
        return (
          <div key={r} style={{ background:active?`${rC.primary}0c`:"rgba(255,255,255,0.01)",border:`1px solid ${active?rC.primary+"2a":"rgba(148,163,184,0.08)"}`,borderRadius:9,padding:"10px 13px",marginBottom:6,opacity:passed?0.4:1 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"0.88rem",color:rC.primary,textShadow:active?`0 0 7px ${rC.primary}`:"none" }}>{r}</span>
                <div>
                  <div style={{ fontSize:"0.74rem",color:"#94a3b8" }}>{rC.label}</div>
                  <div style={{ fontSize:"0.64rem",color:"#64748b" }}>{rC.desc}</div>
                </div>
              </div>
              <span style={{ fontSize:"0.64rem",color:passed?"#22c55e":active?rC.primary:"#475569",letterSpacing:"0.08em" }}>{passed?"✓ DONE":active?"◈ AKTIV":"LOCKED"}</span>
            </div>
            {active && <div style={{ marginTop:5,fontSize:"0.64rem",color:"#64748b" }}>Lv.{state.level}/{LEVELS_PER_RANK} · {state.xp}/{xpNeeded} XP · Global {globalLvl}/{TOTAL_LEVELS}</div>}
          </div>
        );
      })}
    </div>
  );
}

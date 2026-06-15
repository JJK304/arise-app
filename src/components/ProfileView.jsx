// ============================================================
// PROFILE VIEW — Status-Hauptscreen: Hunter-Status-Karte, Paths,
// Quick-Stats, XP-History, Kern-Stats, Path-Affinity, Titel,
// Achievements-Preview, System-Analyse.
// ============================================================
import { LEVELS_PER_RANK, TOTAL_LEVELS, RANKS, RANK_COLORS } from "../data/ranks.js";
import { PATHS } from "../data/paths.js";
import { STATS_CONFIG, SUB_STATS } from "../data/stats.js";
import { TITLES, TITLE_MAP } from "../data/titles.js";
import { ACHIEVEMENTS } from "../data/achievements.js";
import { MiniChart } from "./MiniChart.jsx";
import { StatBar } from "./StatBar.jsx";
import { SystemAnalysisCard } from "../features/profile/SystemAnalysisCard.jsx";
import { computePowerLevel } from "../lib/powerLevel.js";
import { saveData } from "../storage/db.js";

export function ProfileView({ rc, state, globalLvl, xpNeeded, xpPct, totalMilestonesDone, setSelectedStat, unlockedAchievements, sysAnalysis, setState, showNotif }) {
  const pl = computePowerLevel(state, { globalLevel: globalLvl, milestonesDone: totalMilestonesDone });
  return (
  <div>

    {/* ── HUNTER STATUS CARD ── */}
    <div style={{ background:`linear-gradient(135deg,${rc.primary}0a,${rc.primary}18)`,border:`1px solid ${rc.primary}33`,borderRadius:14,padding:"16px",marginBottom:12,position:"relative",overflow:"hidden" }}>
      {/* Watermark rank letter */}
      <div style={{ position:"absolute",top:-12,right:-4,fontSize:"7rem",opacity:0.04,fontFamily:"'Orbitron',sans-serif",fontWeight:900,color:rc.primary,lineHeight:1,pointerEvents:"none",userSelect:"none" }}>{state.rank}</div>

      {/* Top row: label + rank badge */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
        <div>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.3em",color:`${rc.primary}88`,marginBottom:3 }}>HUNTER STATUS</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"1.5rem",color:rc.primary,textShadow:`0 0 18px ${rc.primary}88`,lineHeight:1 }}>
            {state.rank}-Rank
          </div>
          <div style={{ fontSize:"0.7rem",color:"#94a3b8",marginTop:3 }}>
            {rc.label} · Lv.{state.level}/{LEVELS_PER_RANK}
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.08em",marginBottom:2 }}>GLOBAL</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"1.2rem",fontWeight:900,color:rc.primary,lineHeight:1 }}>
            {globalLvl}<span style={{ fontSize:"0.64rem",color:"#64748b" }}>/{TOTAL_LEVELS}</span>
          </div>
          <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:2 }}>{(state.totalXP||0).toLocaleString()} XP</div>
        </div>
      </div>

      {/* EXP bar */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
          <span style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.12em" }}>EXP TO NEXT LEVEL</span>
          <span style={{ fontSize:"0.64rem",color:rc.primary,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{state.xp} / {xpNeeded}</span>
        </div>
        <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:4,height:5,overflow:"hidden" }}>
          <div style={{ width:`${xpPct}%`,height:"100%",background:`linear-gradient(90deg,${rc.primary}44,${rc.primary})`,boxShadow:`0 0 10px ${rc.primary}88`,borderRadius:4,transition:"width 0.8s ease" }}/>
        </div>
      </div>

      {/* Rank progression dots */}
      <div style={{ display:"flex",gap:3 }}>
        {RANKS.map((r,i)=>{
          const ci=RANKS.indexOf(state.rank),passed=i<ci,active=i===ci;
          const rC=RANK_COLORS[r].primary;
          return (
            <div key={r} style={{ flex:1,textAlign:"center" }}>
              <div style={{ height:3,borderRadius:3,background:passed?rC:active?`${rC}88`:"#0d0d17",boxShadow:active?`0 0 6px ${rC}`:"none",transition:"all 0.3s" }}/>
              <div style={{ fontSize:"0.64rem",marginTop:2,color:passed||active?rC:"#1e1e30",fontWeight:700 }}>{r}</div>
            </div>
          );
        })}
      </div>
    </div>

    {/* ── POWER LEVEL ── eine Zahl, die nur durch echte Verbesserung steigt ── */}
    {(() => {
      const multColor = pl.mult >= 1.0 ? "#22c55e" : pl.mult >= 0.85 ? "#f59e0b" : "#ef4444";
      const bodyColor = "#ef4444", mindColor = "#3b82f6";
      const axisMax   = Math.max(pl.body, pl.mind, 1);
      const weakLabel = pl.weakAxis === "body" ? "Körper" : pl.weakAxis === "mind" ? "Geist" : null;
      const weakStats = pl.weakAxis === "body" ? "STR · AGI · VIT" : "INT · CRE · END";
      return (
        <div style={{ background:`linear-gradient(135deg,#0a0a16,${rc.primary}14)`, border:`1px solid ${rc.primary}44`, borderRadius:14, padding:"14px 16px", marginBottom:12, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-18, right:-6, fontSize:"6rem", opacity:0.05, fontWeight:900, color:rc.primary, lineHeight:1, pointerEvents:"none", userSelect:"none" }}>⚡</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div>
              <div style={{ fontSize:"0.6rem", letterSpacing:"0.3em", color:`${rc.primary}99`, marginBottom:2 }}>POWER LEVEL</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontWeight:900, fontSize:"2.4rem", color:rc.primary, textShadow:`0 0 22px ${rc.primary}aa`, lineHeight:1 }}>{pl.value.toLocaleString()}</div>
              <div style={{ fontSize:"0.62rem", color:"#64748b", marginTop:4 }}>
                {pl.statTotal} Stat · {pl.recordCount} PB · {pl.milestones} ◆
              </div>
            </div>
            <div style={{ minWidth:124 }}>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:6 }}>
                <span style={{ background:`${multColor}1f`, border:`1px solid ${multColor}55`, color:multColor, borderRadius:20, padding:"2px 9px", fontSize:"0.64rem", fontWeight:700, fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.05em" }}>
                  BREITE ×{pl.mult.toFixed(2)}
                </span>
              </div>
              {[
                { label:"KÖRPER", val:pl.body, color:bodyColor },
                { label:"GEIST",  val:pl.mind, color:mindColor },
              ].map(a => (
                <div key={a.label} style={{ marginBottom:5 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:"0.6rem", color:a.color, letterSpacing:"0.08em", fontWeight:700 }}>{a.label}</span>
                    <span style={{ fontSize:"0.6rem", color:"#64748b", fontFamily:"'Rajdhani',sans-serif", fontWeight:700 }}>{a.val}</span>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:3, height:4, overflow:"hidden" }}>
                    <div style={{ width:`${(a.val/axisMax)*100}%`, height:"100%", background:`linear-gradient(90deg,${a.color}66,${a.color})`, borderRadius:3, transition:"width 0.6s ease" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {pl.mult < 1.0 && weakLabel && (
            <div style={{ marginTop:8, background:`${multColor}12`, border:`1px solid ${multColor}33`, borderRadius:8, padding:"7px 10px", fontSize:"0.64rem", color:"#cbd5e1", lineHeight:1.4 }}>
              <span style={{ color:multColor, fontWeight:700 }}>⚠ {weakLabel} vernachlässigt.</span> Trainiere {weakStats}, um deinen Breite-Bonus (bis ×1.15) freizuschalten.
            </div>
          )}
        </div>
      );
    })()}

    {/* ── MAIN PATH + SECONDARY PATH ── */}
    {(() => {
      const mainPath  = state.player?.mainPath;
      const secPath   = state.player?.secondaryPath;
      const hasEither = mainPath || secPath;
      return hasEither ? (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12 }}>
          {[
            { label:"MAIN PATH",      path:mainPath,  dimIfEmpty:true },
            { label:"SECONDARY PATH", path:secPath,   dimIfEmpty:true },
          ].map(({ label, path }) => {
            const p = path ? PATHS[path] : null;
            return (
              <div key={label} style={{ background:p?`${p.color}0c`:"rgba(255,255,255,0.02)",border:`1px solid ${p?p.color+"33":"rgba(148,163,184,0.1)"}`,borderRadius:10,padding:"10px 12px" }}>
                <div style={{ fontSize:"0.64rem",letterSpacing:"0.14em",color:"#64748b",marginBottom:4 }}>{label}</div>
                {p ? (
                  <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                    <span style={{ fontSize:"1.1rem" }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize:"0.8rem",fontWeight:700,color:p.color,fontFamily:"'Rajdhani',sans-serif" }}>{p.name}</div>
                      <div style={{ fontSize:"0.64rem",color:"#64748b",lineHeight:1.3,marginTop:1 }}>{p.focus}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color:"#64748b",fontSize:"0.68rem" }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      ) : null;
    })()}

    {/* ── QUICK STATS: Streak / XP / Milestones / Quests ── */}
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:12 }}>
      {[
        { label:"Streak ⚡",   val:`${state.currentStreak||0}`, suffix:"🔥", color:"#f59e0b" },
        { label:"Best Run",   val:`${state.longestStreak||0}`,  suffix:"🔥", color:"#f97316" },
        { label:"Total XP", val:(state.totalXP||0)>=1000?`${((state.totalXP||0)/1000).toFixed(1)}k`:`${state.totalXP||0}`, suffix:"", color:"#00ffff" },
        { label:"Meilst.",  val:`${totalMilestonesDone}`,     suffix:"★",  color:rc.primary },
      ].map(item=>(
        <div key={item.label} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:9,padding:"8px 5px",textAlign:"center" }}>
          <div style={{ fontSize:"0.92rem",fontWeight:700,color:item.color,fontFamily:"'Rajdhani',sans-serif",lineHeight:1.1 }}>
            {item.val}{item.suffix}
          </div>
          <div style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.07em",marginTop:2 }}>{item.label}</div>
        </div>
      ))}
    </div>

    {/* ── XP HISTORY ── */}
    {(state.xpHistory||[]).length >= 2 && (
      <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:12,padding:"12px",marginBottom:12 }}>
        <MiniChart data={(state.xpHistory||[]).map(h=>({v:h.v,l:h.l}))} color={rc.primary} height={52} label="AWAKENING PROGRESS — XP PRO WOCHE"/>
      </div>
    )}

    {/* ── KERN-STATS ── */}
    <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>
      HUNTER STATS <span style={{ color:"#64748b",fontSize:"0.64rem",letterSpacing:"0.1em" }}>· TIPPEN FÜR DETAILS</span>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10 }}>
      {STATS_CONFIG.filter(s=>!["SOC","REL","APP"].includes(s.key)).map(sc=>(
        <StatBar key={sc.key} label={sc.key} icon={sc.icon} value={state.stats[sc.key]||0} max={Math.max(10,(state.stats[sc.key]||0)*1.8+5)} color={sc.color} onClick={()=>setSelectedStat(sc.key)}/>
      ))}
    </div>
    <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>CHARISMA</div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14 }}>
      {["SOC","REL","APP"].map(k=>(
        <StatBar key={k} label={k} icon={SUB_STATS[k].icon} value={state.stats[k]||0} max={Math.max(10,(state.stats[k]||0)*1.8+5)} color={SUB_STATS[k].color} small onClick={()=>setSelectedStat(k)}/>
      ))}
    </div>

    {/* ── PATH AFFINITY ── */}
    {(() => {
      const affinities = state.player?.affinities || {};
      const sorted = Object.entries(affinities)
        .filter(([k]) => k !== "shadow")
        .sort(([,a],[,b]) => b - a)
        .filter(([,v]) => v > 0);
      if (sorted.length === 0) return null;
      const maxAff = sorted[0][1];
      return (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>PATH AFFINITY</div>
          <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:10,padding:"11px 12px",display:"flex",flexDirection:"column",gap:7 }}>
            {sorted.slice(0,5).map(([pathId, val]) => {
              const p = PATHS[pathId];
              const pct = Math.min((val / Math.max(maxAff, 1)) * 100, 100);
              return (
                <div key={pathId}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                    <span style={{ fontSize:"0.68rem",color:p?.color||"#aaa" }}>{p?.icon} {p?.name}</span>
                    <span style={{ fontSize:"0.66rem",color:"#64748b",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{val}</span>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:3,height:3 }}>
                    <div style={{ width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${p?.color||"#aaa"}55,${p?.color||"#aaa"})`,borderRadius:3,transition:"width 0.6s ease",boxShadow:`0 0 5px ${p?.color||"#aaa"}66` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })()}

    {/* ── TITLES ── */}
    {(state.player?.titles || []).length > 0 && (() => {
      const playerTitles = state.player.titles || [];
      const activeTitle  = state.player.activeTitle;
      // Normalisiere Legacy-Titel-Strings auf IDs
      const normalizedTitles = playerTitles.map(t =>
        TITLE_MAP[t] ? t : (TITLES.find(ti => ti.title === t)?.id || t)
      );
      return (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>TITEL ({playerTitles.length})</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {normalizedTitles.map(titleId => {
              const t = TITLE_MAP[titleId] || TITLES.find(tt => tt.title === titleId) || { color:"#f59e0b",icon:"★",title:titleId };
              const label = t.title || titleId;
              const isActive = activeTitle === titleId;
              return (
                <button key={titleId} onClick={()=>{
                  const s2 = { ...state, player: { ...state.player, activeTitle: titleId }};
                  setState(s2); saveData("arise_v3", s2);
                  showNotif(`${t.icon} Aktiver Titel: ${label}`, t.color);
                }} style={{ background:isActive?`${t.color}22`:"rgba(255,255,255,0.03)",border:`1px solid ${isActive?t.color+"55":"rgba(148,163,184,0.12)"}`,color:isActive?t.color:"#94a3b8",borderRadius:20,padding:"4px 11px",fontSize:"0.66rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:4,transition:"all 0.15s" }}>
                  <span style={{ fontSize:"0.75rem" }}>{t.icon}</span>{label}
                  {isActive && <span style={{ fontSize:"0.64rem",color:t.color }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      );
    })()}

    {/* ── ACHIEVEMENTS PREVIEW ── */}
    {unlockedAchievements.length > 0 && (
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:8 }}>ACHIEVEMENTS ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
          {unlockedAchievements.map(a=>(
            <div key={a.id} style={{ background:"rgba(245,158,11,0.07)",border:"1px solid #f59e0b1a",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:6 }}>
              <span style={{ fontSize:"0.85rem" }}>{a.icon}</span>
              <span style={{ fontSize:"0.7rem",color:"#f59e0b",fontWeight:700 }}>{a.title}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    {/* ── SYSTEM ANALYSIS ── */}
    <SystemAnalysisCard
      state={state}
      sysAnalysis={sysAnalysis}
      rc={rc}
      saveData={saveData}
      setState={setState}
      showNotif={showNotif}
    />


  </div>
  );
}

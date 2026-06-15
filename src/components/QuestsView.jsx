// ============================================================
// QUESTS VIEW — Quest-Hauptscreen: Progress-Widget, Recovery-Hint,
// Filter (Typ/Kategorie/Heute/Sort), Custom-Quest-Formular,
// Gate-Liste, sektionierte Quest-Liste. Viele Props (Tier-3-Kandidat).
// ============================================================
import { isGateCompleted, getGateStepsDone, isGateUnlocked, getVisibleGates } from "../data/gates.js";
import { CAT_LABELS } from "../data/stats.js";
import { GateCard } from "./GateCard.jsx";
import { ChallengeCard } from "./ChallengeCard.jsx";

export function QuestsView({ rotatedDaily, rotatedWeekly, isQuestDone, state, recoveryHint, filterType, setFilterType, showTodayOnly, setShowTodayOnly, sortBy, setSortBy, showCustomForm, setShowCustomForm, customForm, setCustomForm, addCustomQuest, rc, availableCats, filterCat, setFilterCat, gateProgress, _signalPaths, prefs, recommendedGates, handleGateStepToggle, handleGateClaim, displayChallenges, handleComplete, deleteCustomQuest, nextMilestones, customQuests, personalizedQuests, recoveryQuests, collapsedSections, toggleSection }) {
  return (
  <div>
    {/* Quest Progress Widget */}
    {(() => {
      const totalDaily  = rotatedDaily.length;
      const doneDaily   = rotatedDaily.filter(c => isQuestDone(c)).length;
      const totalWeekly = rotatedWeekly.length;
      const doneWeekly  = rotatedWeekly.filter(c => isQuestDone(c)).length;
      const activeGoalCount = (state.goals||[]).filter(g=>g.status==="active").length;
      const completedGoalCount = (state.goals||[]).filter(g=>g.status==="completed").length;
      const totalGoalCount = (state.goals||[]).length;
      const pctD = totalDaily  > 0 ? Math.round((doneDaily  / totalDaily)  * 100) : 0;
      const pctW = totalWeekly > 0 ? Math.round((doneWeekly / totalWeekly) * 100) : 0;
      const pctG = totalGoalCount > 0 ? Math.round((completedGoalCount / totalGoalCount) * 100) : 0;
      const cols = activeGoalCount > 0 ? "1fr 1fr 1fr" : "1fr 1fr";
      return (
        <div style={{ display:"grid", gridTemplateColumns:cols, gap:7, marginBottom:12 }}>
          {[
            { label:"Daily",  done:doneDaily,  total:totalDaily,  pct:pctD, color:"#3b82f6" },
            { label:"Weekly", done:doneWeekly, total:totalWeekly, pct:pctW, color:"#8b5cf6" },
            ...(activeGoalCount > 0 ? [{ label:"OBJECTIVES", done:completedGoalCount, total:totalGoalCount, pct:pctG, color:"#f59e0b" }] : []),
          ].map(item => (
            <div key={item.label} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid #0d0d1a",borderRadius:9,padding:"9px 11px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontSize:"0.64rem",color:"#64748b",letterSpacing:"0.08em" }}>{item.label}</span>
                <span style={{ fontSize:"0.68rem",color:item.pct===100?"#22c55e":item.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{item.done}/{item.total}</span>
              </div>
              <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:3,height:3,overflow:"hidden" }}>
                <div style={{ width:`${item.pct}%`,height:"100%",background:item.pct===100?"#22c55e":`linear-gradient(90deg,${item.color}66,${item.color})`,borderRadius:3,transition:"width 0.5s ease" }}/>
              </div>
            </div>
          ))}
        </div>
      );
    })()}
    {/* Recovery Hint Banner */}
    {recoveryHint && (
      <div onClick={()=>setFilterType("recovery")} style={{ background:recoveryHint.urgent?"rgba(34,197,94,0.08)":"rgba(100,116,139,0.08)", border:`1px solid ${recoveryHint.urgent?"#22c55e33":"#33415533"}`, borderRadius:10, padding:"10px 13px", marginBottom:10, display:"flex", alignItems:"center", gap:8, cursor:"pointer", transition:"all 0.2s" }}>
        <span style={{ fontSize:"1rem" }}>{recoveryHint.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:"0.7rem",color:recoveryHint.urgent?"#22c55e":"#64748b",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em" }}>{recoveryHint.text}</div>
        </div>
        <span style={{ fontSize:"0.64rem",color:"#64748b" }}>→</span>
      </div>
    )}
    {/* Today filter + sort */}
    <div style={{ display:"flex",gap:7,marginBottom:10,alignItems:"center" }}>
      <button onClick={()=>setShowTodayOnly(v=>!v)} style={{ background:showTodayOnly?`${rc.primary}22`:"transparent",border:`1px solid ${showTodayOnly?rc.primary+"55":"rgba(148,163,184,0.12)"}`,color:showTodayOnly?rc.primary:"#64748b",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
        {showTodayOnly?"● HEUTE OFFEN":"HEUTE OFFEN"}
      </button>
      <button onClick={()=>setSortBy(v=>v==="xp"?"default":"xp")} style={{ background:sortBy==="xp"?`${rc.primary}22`:"transparent",border:`1px solid ${sortBy==="xp"?rc.primary+"55":"rgba(148,163,184,0.12)"}`,color:sortBy==="xp"?rc.primary:"#64748b",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap" }}>
        {sortBy==="xp"?"● NACH XP":"NACH XP"}
      </button>
      <button onClick={()=>setShowCustomForm(v=>!v)} style={{ marginLeft:"auto",background:"rgba(6,182,212,0.1)",border:"1px solid #06b6d422",color:"#06b6d4",borderRadius:8,padding:"6px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.06em",whiteSpace:"nowrap" }}>+ EIGENE</button>
    </div>

    {/* Custom quest form */}
    {showCustomForm && (
      <div style={{ background:"rgba(6,182,212,0.06)",border:"1px solid #06b6d422",borderRadius:11,padding:"14px",marginBottom:12,animation:"slideDown 0.2s ease" }}>
        <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#06b6d4",marginBottom:10 }}>NEW CUSTOM ORDER</div>
        <input value={customForm.title} onChange={e=>setCustomForm(p=>({...p,title:e.target.value}))} placeholder="Quest Title *" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:7 }}/>
        <input value={customForm.desc} onChange={e=>setCustomForm(p=>({...p,desc:e.target.value}))} placeholder="Description (optional)" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:7 }}/>
        <div style={{ display:"flex",gap:7,marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:3 }}>XP</div>
            <input value={customForm.xp} onChange={e=>setCustomForm(p=>({...p,xp:e.target.value}))} type="number" min="1" max="500" style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}/>
          </div>
          <div style={{ flex:2 }}>
            <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:3 }}>Kategorie</div>
            <select value={customForm.cat} onChange={e=>setCustomForm(p=>({...p,cat:e.target.value}))} style={{ width:"100%",background:"#0a0a16",border:"1px solid rgba(148,163,184,0.12)",borderRadius:7,padding:"8px 10px",color:"#e2e8f0",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}>
              {Object.entries(CAT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex",gap:7 }}>
          <button onClick={addCustomQuest} style={{ flex:1,background:"linear-gradient(135deg,#06b6d418,#06b6d430)",border:"1px solid #06b6d444",color:"#06b6d4",borderRadius:8,padding:"9px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>CREATE ORDER</button>
          <button onClick={()=>setShowCustomForm(false)} style={{ flex:1,background:"transparent",border:"1px solid rgba(148,163,184,0.12)",color:"#64748b",borderRadius:8,padding:"9px",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>CANCEL</button>
        </div>
      </div>
    )}

    {/* Type filter */}
    <div style={{ display:"flex",gap:5,marginBottom:8,overflowX:"auto",paddingBottom:2 }}>
      {["all","daily","weekly","milestone","gate","recovery","personalized","custom","goal-linked"].map(f=>(
        <button key={f} onClick={()=>setFilterType(f)} style={{ background:filterType===f?`${rc.primary}18`:"transparent",border:`1px solid ${filterType===f?rc.primary+"44":"rgba(148,163,184,0.12)"}`,color:filterType===f?rc.primary:"#64748b",borderRadius:7,padding:"5px 11px",fontSize:"0.64rem",letterSpacing:"0.08em",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>
          {f==="all"?"All":f==="daily"?"◎ Daily":f==="weekly"?"◇ Weekly":f==="milestone"?"◆ Milestones":f==="gate"?"⧫ Gates":f==="recovery"?"⟡ Recovery":f==="personalized"?"◈ Recommended":"✦ Custom"}
        </button>
      ))}
    </div>
    {/* Category filter */}
    <div style={{ display:"flex",gap:5,marginBottom:14,overflowX:"auto",paddingBottom:2 }}>
      <button onClick={()=>setFilterCat("all")} style={{ background:filterCat==="all"?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat==="all"?rc.primary+"33":"rgba(148,163,184,0.1)"}`,color:filterCat==="all"?rc.primary:"#64748b",borderRadius:6,padding:"4px 9px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0 }}>Alle</button>
      {availableCats.map(cat=>(
        <button key={cat} onClick={()=>setFilterCat(cat)} style={{ background:filterCat===cat?`${rc.primary}18`:"transparent",border:`1px solid ${filterCat===cat?rc.primary+"33":"rgba(148,163,184,0.1)"}`,color:filterCat===cat?rc.primary:"#64748b",borderRadius:6,padding:"4px 9px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.2s" }}>{CAT_LABELS[cat]||cat}</button>
      ))}
    </div>

    {/* Sectioned quest list */}
    {filterType === "gate" ? (
      /* ── GATE-ONLY VIEW ── */
      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:4 }}>⧫ GATE QUESTS</div>
        {getVisibleGates(gateProgress, { signalPaths: _signalPaths, activePaths: prefs.activePaths || [] }).map(gate => {
          const stepsDone = getGateStepsDone(gate.id, gateProgress);
          const completed = isGateCompleted(gate.id, gateProgress);
          const isRec     = recommendedGates.some(g => g.id === gate.id);
          const unlocked  = isGateUnlocked(gate, gateProgress);
          return (
            <GateCard
              key={gate.id}
              gate={gate}
              stepsDone={stepsDone}
              completed={completed}
              recommended={isRec}
              locked={!unlocked}
              onToggleStep={handleGateStepToggle}
              onClaim={handleGateClaim}
            />
          );
        })}
      </div>
    ) : (showTodayOnly || filterType!=="all" || filterCat!=="all") ? (
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {displayChallenges.length===0 && <div style={{ color:"#64748b",textAlign:"center",padding:"40px 0",fontSize:"0.85rem" }}>{showTodayOnly?"⚡ All daily quests cleared.":"No quests match this filter."}</div>}
        {[...displayChallenges].sort((a,b)=>{
          const da=isQuestDone(a)?1:0;
          const db=isQuestDone(b)?1:0;
          return da-db;
        }).map(c=>(
          <div key={c.id} style={{ position:"relative" }}>
            <ChallengeCard challenge={c} done={isQuestDone(c)} onComplete={handleComplete} rankColor={rc.primary} best={state.questRecords?.[c.id] ?? null} goals={state.goals||[]}/>
            {c.type==="custom" && !isQuestDone(c) && <button onClick={()=>deleteCustomQuest(c.id)} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:"#64748b",fontSize:"0.8rem",cursor:"pointer",padding:4 }}>✕</button>}
          </div>
        ))}
      </div>
    ) : (
      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {/* Empfohlene Gates — oben, außerhalb der Sections */}
        {recommendedGates.length > 0 && (
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
              <span style={{ color:"#f59e0b",fontSize:"0.7rem" }}>◈</span>
              <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:"#f59e0b" }}>◈ NEXT GATE AVAILABLE</span>
              <div style={{ flex:1,height:1,background:"#f59e0b22",borderRadius:1 }}/>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {recommendedGates.map(gate => (
                <GateCard
                  key={gate.id}
                  gate={gate}
                  stepsDone={getGateStepsDone(gate.id, gateProgress)}
                  completed={isGateCompleted(gate.id, gateProgress)}
                  recommended={true}
                  onToggleStep={handleGateStepToggle}
                  onClaim={handleGateClaim}
                />
              ))}
            </div>
          </div>
        )}

        {[
          { key:"daily",     label:"DAILY SYSTEM QUESTS",   icon:"◎", items:rotatedDaily,   color:"#3b82f6", recommended:false },
          { key:"weekly",    label:"WEEKLY ORDERS",           icon:"◇", items:rotatedWeekly,  color:"#8b5cf6", recommended:false },
          { key:"milestone", label:"AWAKENING MILESTONES",    icon:"◆", items:nextMilestones,    color:"#f59e0b", recommended:false },
          { key:"custom",    label:"CUSTOM ORDERS",           icon:"✦", items:customQuests,      color:"#06b6d4", recommended:false },
          ...(personalizedQuests.length > 0 ? [
            { key:"personalized", label:"SYSTEM RECOMMENDATION", icon:"◈", items:personalizedQuests, color:"#a78bfa", recommended:true },
          ] : []),
          ...(recoveryQuests.length > 0 ? [
            { key:"recovery", label:"RECOVERY PROTOCOL", icon:"⟡", items:recoveryQuests, color:"#22c55e", recommended:true },
          ] : []),
        ].filter(s=>s.items.length>0).map(section=>{
          const done=section.items.filter(c=>isQuestDone(c)).length;
          const total=section.items.length;
          const allDone=done===total;
          // Fertige Sektionen standardmäßig eingeklappt (nur Header sichtbar); manueller Toggle hat Vorrang.
          const collapsed=(section.key in collapsedSections)?collapsedSections[section.key]:allDone;
          return (
            <div key={section.key}>
              {/* Section header */}
              <button onClick={()=>toggleSection(section.key,collapsed)} style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:collapsed?0:8,padding:"2px 0",transition:"all 0.2s" }}>
                <span style={{ color:allDone?"#22c55e":section.color,fontSize:"0.7rem" }}>{allDone?"✓":section.icon}</span>
                <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:allDone?"#22c55e":section.color }}>{section.label}</span>
                {section.recommended && !allDone && (
                  <span style={{ background:`${section.color}18`,border:`1px solid ${section.color}33`,color:section.color,borderRadius:20,padding:"1px 6px",fontSize:"0.64rem",letterSpacing:"0.06em",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>EMPFOHLEN</span>
                )}
                <div style={{ flex:1,height:1,background:`${allDone?"#22c55e":section.color}22`,borderRadius:1 }}/>
                <span style={{ fontSize:"0.64rem",color:allDone?"#22c55e":"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{done}/{total}</span>
                {/* Mini progress bar */}
                <div style={{ width:28,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden" }}>
                  <div style={{ width:`${total>0?(done/total)*100:0}%`,height:"100%",background:allDone?"#22c55e":section.color,borderRadius:2,transition:"width 0.4s ease",boxShadow:done>0?`0 0 4px ${section.color}88`:"none" }}/>
                </div>
                <span style={{ fontSize:"0.64rem",color:"#64748b",transform:collapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
              </button>
              {/* Offene Quests als volle Karten; erledigte zu einer Faltzeile zusammengelegt */}
              {!collapsed && (() => {
                const openItems = section.items.filter(c=>!isQuestDone(c));
                const doneItems = section.items.filter(c=> isQuestDone(c));
                const doneOpen  = !!collapsedSections[section.key+"__done"];
                return (
                  <div style={{ display:"flex",flexDirection:"column",gap:7,animation:"sectionOpen 0.2s ease" }}>
                    {openItems.map(c=>(
                      <div key={c.id} style={{ position:"relative" }}>
                        <ChallengeCard challenge={c} done={false} onComplete={handleComplete} rankColor={rc.primary} recommended={section.recommended} best={state.questRecords?.[c.id] ?? null} goals={state.goals||[]}/>
                        {c.type==="custom" && <button onClick={()=>deleteCustomQuest(c.id)} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:"#64748b",fontSize:"0.8rem",cursor:"pointer",padding:4 }}>✕</button>}
                      </div>
                    ))}
                    {doneItems.length>0 && (
                      <div>
                        <button onClick={()=>toggleSection(section.key+"__done")} style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"4px 2px",marginTop:openItems.length?2:0 }}>
                          <span style={{ color:"#22c55e99",fontSize:"0.66rem" }}>✓</span>
                          <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.62rem",letterSpacing:"0.12em",color:"#64748b" }}>{doneItems.length} ERLEDIGT</span>
                          <div style={{ flex:1,height:1,background:"rgba(148,163,184,0.1)" }}/>
                          <span style={{ fontSize:"0.6rem",color:"#475569",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em" }}>{doneOpen?"AUSBLENDEN":"ZEIGEN"}</span>
                          <span style={{ fontSize:"0.6rem",color:"#475569",transform:doneOpen?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
                        </button>
                        {doneOpen && (
                          <div style={{ display:"flex",flexDirection:"column",gap:4,marginTop:4 }}>
                            {doneItems.map(c=>(
                              <div key={c.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 10px",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(148,163,184,0.06)",borderRadius:7 }}>
                                <span style={{ color:"#22c55e88",fontSize:"0.76rem",flexShrink:0 }}>✓</span>
                                <span style={{ flex:1,fontSize:"0.74rem",color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.title}</span>
                                <span style={{ fontSize:"0.62rem",color:"#475569",flexShrink:0 }}>+{c.xp} XP</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    )}
  </div>
  );
}

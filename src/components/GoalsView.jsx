// ============================================================
// GOALS VIEW — Ziele: Anlegen, Pausieren, Löschen, Fortschritt,
// nächste empfohlene Quest, Progress-Archiv. Enthält die Goal-CRUD-
// Handler (mutieren via setState/saveData-Props/Import).
// ============================================================
import { saveData } from "../storage/db.js";
import { createGoal, goalProgressPct, goalStatusLabel } from "../lib/goals.js";
import { getRecentLogs, METRIC_LABELS } from "../lib/progressLogs.js";
import { PATHS } from "../data/paths.js";
import { DOMAINS } from "../data/domains.js";
import { GOAL_TEMPLATES } from "../data/goalTypes.js";

export function GoalsView({ state, setState, showNotif, goalForm, setGoalForm, showGoalForm, setShowGoalForm, setView, displayChallenges, isQuestDone, rc }) {
  const goals = state.goals || [];
  const activeGoals = goals.filter(g => g.status === "active");
  const doneGoals   = goals.filter(g => g.status === "completed");

  const addGoal = () => {
    const tmpl = GOAL_TEMPLATES.find(t => t.id === goalForm.templateId) || GOAL_TEMPLATES[0];
    const newGoal = createGoal({
      templateId:  goalForm.templateId,
      title:       goalForm.title.trim() || tmpl.exampleTitle,
      targetValue: goalForm.targetValue  || tmpl.targetValue,
      deadline:    goalForm.deadline     || null,
    });
    const s = { ...state, goals: [...goals, newGoal] };
    setState(s); saveData("arise_v3", s);
    setGoalForm({ templateId:"learning_goal", title:"", targetValue:"", deadline:"" });
    setShowGoalForm(false);
    showNotif("⌖ Ziel erstellt", "#22c55e");
  };

  const updateGoalStatus = (goalId, status) => {
    const s = { ...state, goals: goals.map(g => g.id === goalId ? { ...g, status } : g) };
    setState(s); saveData("arise_v3", s);
  };

  const deleteGoal = (goalId) => {
    const s = { ...state, goals: goals.filter(g => g.id !== goalId) };
    setState(s); saveData("arise_v3", s);
  };

  const GoalCard = ({ goal }) => {
    const pct     = goalProgressPct(goal);
    const lbl     = goalStatusLabel(goal);
    const tmpl    = GOAL_TEMPLATES.find(t => t.id === goal.templateId);
    const pathObj = goal.path ? PATHS[goal.path] : null;
    const domainObj= goal.domain ? DOMAINS[goal.domain] : null;
    const done    = goal.status === "completed";
    const color   = done ? "#22c55e" : rc.primary;

    // Last 2 logs for this goal
    const goalLogs = (state.progressLogs||[]).filter(l => l.goalId === goal.id || l.domain === goal.domain).slice(-2).reverse();
    // Next recommended quest for this goal
    const nextQuest = displayChallenges.find(c =>
      !isQuestDone(c) && (c.goalId === goal.id || c.domain === goal.domain || c.path === goal.path)
    );

    return (
      <div style={{ background:"rgba(255,255,255,0.02)",border:`1px solid ${done?"#22c55e22":"rgba(148,163,184,0.1)"}`,borderRadius:12,padding:"14px",marginBottom:10 }}>
        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <span style={{ fontSize:"1.2rem" }}>{goal.icon || tmpl?.icon || "★"}</span>
            <div>
              <div style={{ fontSize:"0.82rem",color:done?"#22c55e":"#e2e8f0",fontWeight:700,fontFamily:"'Rajdhani',sans-serif" }}>{goal.title}</div>
              <div style={{ display:"flex",gap:6,alignItems:"center",marginTop:2,flexWrap:"wrap" }}>
                <span style={{ fontSize:"0.64rem",color:"#64748b" }}>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                {domainObj && <span style={{ fontSize:"0.64rem",color:domainObj.color }}>{domainObj.icon} {domainObj.label}</span>}
                {pathObj   && <span style={{ fontSize:"0.64rem",color:pathObj.color }}>{pathObj.icon} {pathObj.name}</span>}
              </div>
            </div>
          </div>
          <span style={{ fontSize:"0.64rem",color:done?"#22c55e":"#64748b",whiteSpace:"nowrap" }}>{lbl}</span>
        </div>

        {/* Progress Bar */}
        <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:4,height:5,marginBottom:goal.status==="active"?8:0,overflow:"hidden" }}>
          <div style={{ width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${color}66,${color})`,borderRadius:4,transition:"width 0.5s ease" }}/>
        </div>

        {/* Next Quest Recommendation */}
        {!done && goal.status === "active" && nextQuest && (
          <div style={{ background:"rgba(255,255,255,0.02)",border:`1px solid ${rc.primary}22`,borderRadius:8,padding:"8px 10px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8 }}>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:"0.64rem",color:`${rc.primary}77`,marginBottom:2 }}>NÄCHSTE QUEST</div>
              <div style={{ fontSize:"0.7rem",color:"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                {nextQuest.title}
              </div>
            </div>
            <button onClick={()=>setView("quests")}
              style={{ background:`${rc.primary}14`,border:`1px solid ${rc.primary}33`,color:rc.primary,borderRadius:6,padding:"4px 9px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,whiteSpace:"nowrap",flexShrink:0 }}>
              → QUESTS
            </button>
          </div>
        )}

        {/* Last Logs */}
        {goalLogs.length > 0 && !done && (
          <div style={{ marginBottom:8 }}>
            {goalLogs.map(log => (
              <div key={log.id} style={{ fontSize:"0.64rem",color:"#64748b",borderLeft:"2px solid #8b5cf622",paddingLeft:7,marginBottom:4,lineHeight:1.4 }}>
                <span style={{ color:"#8b5cf655" }}>{new Date(log.createdAt).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}: </span>
                {log.notes ? log.notes.slice(0,60) + (log.notes.length>60?"…":"") : Object.entries(log.metrics||{}).slice(0,2).map(([k,v])=>`${METRIC_LABELS[k]?.icon||""} ${v}`).join(" · ")}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!done && goal.status === "active" && (
          <div style={{ display:"flex",gap:6 }}>
            <button onClick={()=>updateGoalStatus(goal.id,"paused")}
              style={{ flex:1,background:"transparent",border:"1px solid rgba(148,163,184,0.12)",color:"#64748b",borderRadius:7,padding:"5px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
              ⏸ PAUSE
            </button>
            <button onClick={()=>deleteGoal(goal.id)}
              style={{ background:"transparent",border:"1px solid #ef444422",color:"#ef444466",borderRadius:7,padding:"5px 8px",fontSize:"0.64rem",cursor:"pointer" }}>
              ✕
            </button>
          </div>
        )}
        {goal.status === "paused" && (
          <div style={{ display:"flex",gap:6 }}>
            <button onClick={()=>updateGoalStatus(goal.id,"active")}
              style={{ flex:1,background:`${rc.primary}12`,border:`1px solid ${rc.primary}33`,color:rc.primary,borderRadius:7,padding:"5px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
              ▶ FORTSETZEN
            </button>
            <button onClick={()=>deleteGoal(goal.id)}
              style={{ background:"transparent",border:"1px solid #ef444422",color:"#ef444466",borderRadius:7,padding:"5px 8px",fontSize:"0.64rem",cursor:"pointer" }}>
              ✕
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8" }}>⌖ ACTIVE OBJECTIVES ({activeGoals.length})</div>
        <button onClick={()=>setShowGoalForm(v=>!v)}
          style={{ background:`${rc.primary}18`,border:`1px solid ${rc.primary}44`,color:rc.primary,borderRadius:8,padding:"5px 12px",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>
          {showGoalForm ? "✕ CANCEL" : "+ NEUES ZIEL"}
        </button>
      </div>

      {showGoalForm && (
        <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:12,padding:"14px",marginBottom:14 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.15em",color:"#64748b",marginBottom:10 }}>DEFINE OBJECTIVE</div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:6 }}>Vorlage</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {GOAL_TEMPLATES.map(t => {
                const active = goalForm.templateId === t.id;
                return (
                  <button key={t.id} onClick={()=>setGoalForm(f=>({...f, templateId:t.id}))}
                    style={{ background:active?`${rc.primary}18`:"rgba(255,255,255,0.02)",border:`1px solid ${active?rc.primary+"44":"rgba(148,163,184,0.12)"}`,color:active?rc.primary:"#64748b",borderRadius:20,padding:"4px 10px",fontSize:"0.64rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:3 }}>
                    {t.icon} {t.title}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:5 }}>Titel (optional)</div>
            <input value={goalForm.title} onChange={e=>setGoalForm(f=>({...f,title:e.target.value}))}
              placeholder={GOAL_TEMPLATES.find(t=>t.id===goalForm.templateId)?.exampleTitle || "Ziel..."}
              style={{ width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,padding:"9px 11px",color:"#e2e8f0",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}
            />
          </div>
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:5 }}>Zielwert</div>
              <input type="number" min="1" value={goalForm.targetValue}
                onChange={e=>setGoalForm(f=>({...f,targetValue:e.target.value}))}
                placeholder={String(GOAL_TEMPLATES.find(t=>t.id===goalForm.templateId)?.targetValue || 10)}
                style={{ width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,padding:"9px 11px",color:"#e2e8f0",fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box" }}
              />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.64rem",color:"#64748b",marginBottom:5 }}>Deadline (optional)</div>
              <input type="date" value={goalForm.deadline} onChange={e=>setGoalForm(f=>({...f,deadline:e.target.value}))}
                style={{ width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,padding:"9px 11px",color:"#e2e8f0",fontSize:"0.75rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box",colorScheme:"dark" }}
              />
            </div>
          </div>
          <button onClick={addGoal}
            style={{ width:"100%",background:`${rc.primary}18`,border:`1px solid ${rc.primary}44`,color:rc.primary,borderRadius:9,padding:"11px",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.08em" }}>
            ◈ OBJECTIVE AKTIVIEREN
          </button>
        </div>
      )}

      {activeGoals.length === 0 && !showGoalForm && (
        <div style={{ textAlign:"center",padding:"40px 20px",color:"#64748b" }}>
          <div style={{ fontSize:"2rem",marginBottom:10 }}>⌖</div>
          <div style={{ fontSize:"0.8rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,marginBottom:6 }}>Keine aktiven Ziele</div>
          <div style={{ fontSize:"0.68rem",lineHeight:1.5 }}>Erstelle ein Ziel — dann zahlen deine Quests direkt darauf ein.</div>
        </div>
      )}

      {activeGoals.map(g => <GoalCard key={g.id} goal={g} />)}

      {goals.filter(g=>g.status==="paused").length > 0 && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#94a3b8",marginBottom:8 }}>PAUSED</div>
          {goals.filter(g=>g.status==="paused").map(g => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}

      {doneGoals.length > 0 && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#94a3b8",marginBottom:8 }}>COMPLETED ({doneGoals.length})</div>
          {doneGoals.map(g => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}
      {/* Recent Logs Preview in Goals tab */}
      {(state.progressLogs || []).length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:"0.64rem",letterSpacing:"0.2em",color:"#94a3b8",marginBottom:10 }}>✦ PROGRESS ARCHIVE ({(state.progressLogs||[]).length})</div>
          {getRecentLogs(state.progressLogs, 5).map(log => (
            <div key={log.id} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:9,padding:"10px 12px",marginBottom:7,display:"flex",gap:10,alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.72rem",color:"#94a3b8",fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{log.title}</div>
                {log.notes && <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:3,lineHeight:1.4 }}>{log.notes.slice(0,80)}{log.notes.length>80?"…":""}</div>}
                {Object.keys(log.metrics||{}).length > 0 && (
                  <div style={{ display:"flex",gap:8,marginTop:4,flexWrap:"wrap" }}>
                    {Object.entries(log.metrics).map(([k,v]) => (
                      <span key={k} style={{ fontSize:"0.64rem",color:"#8b5cf6",background:"rgba(139,92,246,0.08)",borderRadius:4,padding:"2px 6px" }}>
                        {METRIC_LABELS[k]?.icon} {v} {k==="duration"?"min":k==="understanding"||k==="mood"||k==="energy"||k==="stress"||k==="sleepQuality"?"/5":""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ fontSize:"0.64rem",color:"#64748b",whiteSpace:"nowrap" }}>
                {new Date(log.createdAt).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

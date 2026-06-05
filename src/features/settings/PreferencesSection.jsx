// ============================================================
// PREFERENCES SECTION — Ausgelagert aus App.jsx (Prompt 17)
// Interessen, Pfade, Balance, Quest-Länge, Schwierigkeit
// ============================================================
import { INTEREST_GROUPS, INTERESTS } from "../../data/interests.js";
import { ACTIVE_PATHS_OPTIONS, QUEST_LENGTH_OPTIONS, BALANCE_AREAS_OPTIONS, DIFFICULTY_OPTIONS } from "../../data/preferences.js";

export function PreferencesSection({ preferences, rankColor, toggleArrayPref, savePreferences, toggleSection, collapsedSections }) {
  const prefsLocal  = preferences || {};
  const interests   = prefsLocal.interests   || [];
  const activePaths = prefsLocal.activePaths || [];
  const balanceAreas= prefsLocal.balanceAreas|| [];
  const questLength = prefsLocal.preferredQuestLength || "medium";
  const difficulty  = prefsLocal.difficulty  || "normal";
  const rc          = { primary: rankColor || "#00ffff" };

  const SectionToggle = ({ id, label, icon }) => (
    <button onClick={()=>toggleSection("prefs_"+id)}
      style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"2px 0",marginBottom:collapsedSections["prefs_"+id]===false?8:0 }}>
      <span style={{ color:rc.primary,fontSize:"0.7rem" }}>{icon}</span>
      <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:rc.primary }}>{label}</span>
      <div style={{ flex:1,height:1,background:`${rc.primary}22`,borderRadius:1 }}/>
      <span style={{ fontSize:"0.6rem",color:"#1e293b",transform:collapsedSections["prefs_"+id]===false?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
    </button>
  );

  const Chip = ({ opt, active, onToggle, color }) => (
    <button onClick={()=>onToggle(opt.id)}
      style={{ background:active?`${color}22`:"rgba(255,255,255,0.03)",border:`1px solid ${active?color+"55":"#1a1a2e"}`,color:active?color:"#334155",borderRadius:20,padding:"5px 10px",fontSize:"0.67rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.04em",transition:"all 0.15s",display:"flex",alignItems:"center",gap:4 }}>
      <span style={{ fontSize:"0.78rem" }}>{opt.icon}</span>{opt.label}
    </button>
  );

  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:"0.56rem",letterSpacing:"0.28em",color:"#1e293b",marginBottom:11 }}>SYSTEM KONFIGURATION</div>

      {/* Interessen – gruppiert */}
      <div style={{ marginBottom:10 }}>
        <SectionToggle id="interests" label="INTERESSEN" icon="◈"/>
        {collapsedSections["prefs_interests"]===false && (
          <div style={{ animation:"sectionOpen 0.2s ease" }}>
            {interests.length > 0 && (
              <div style={{ fontSize:"0.58rem",color:"#22c55e",marginBottom:7 }}>{interests.length} ausgewählt</div>
            )}
            {Object.entries(INTEREST_GROUPS).map(([groupId, group]) => (
              <div key={groupId} style={{ marginBottom:10 }}>
                <div style={{ fontSize:"0.56rem",letterSpacing:"0.12em",color:"#334155",marginBottom:5 }}>{group.label}</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                  {group.ids.map(id => {
                    const interest = INTERESTS[id];
                    if (!interest) return null;
                    const active = interests.includes(id);
                    return (
                      <Chip key={id}
                        opt={{ id, icon: interest.icon, label: interest.label }}
                        active={active}
                        onToggle={v=>toggleArrayPref("interests",v)}
                        color={rc.primary}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fokuspfade */}
      <div style={{ marginBottom:10 }}>
        <SectionToggle id="paths" label="FOKUSPFADE" icon="◉"/>
        {collapsedSections["prefs_paths"]===false && (
          <div style={{ animation:"sectionOpen 0.2s ease" }}>
            <div style={{ fontSize:"0.58rem",color:"#64748b",marginBottom:8,lineHeight:1.4 }}>
              Pfade bestimmen welche Quests und Gates vorgeschlagen werden.
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:4 }}>
              {ACTIVE_PATHS_OPTIONS.map(opt => {
                const active = activePaths.includes(opt.id);
                return (
                  <button key={opt.id} onClick={()=>toggleArrayPref("activePaths",opt.id)}
                    style={{ background:active?`${opt.color}22`:"rgba(255,255,255,0.03)",border:`1px solid ${active?opt.color+"55":"#1a1a2e"}`,color:active?opt.color:"#334155",borderRadius:20,padding:"5px 10px",fontSize:"0.67rem",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:4,transition:"all 0.15s" }}>
                    <span style={{ fontSize:"0.78rem" }}>{opt.icon}</span>{opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Balance-Bereiche */}
      <div style={{ marginBottom:10 }}>
        <SectionToggle id="balance" label="BALANCE-BEREICHE" icon="▲"/>
        {collapsedSections["prefs_balance"]===false && (
          <div style={{ animation:"sectionOpen 0.2s ease" }}>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:4 }}>
              {BALANCE_AREAS_OPTIONS.map(opt => {
                const active = balanceAreas.includes(opt.id);
                return (
                  <Chip key={opt.id} opt={opt} active={active}
                    onToggle={v=>toggleArrayPref("balanceAreas",v)}
                    color="#22c55e"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quest-Länge */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:"0.52rem",letterSpacing:"0.15em",color:"#334155",marginBottom:8 }}>BEVORZUGTE QUEST-LÄNGE</div>
        <div style={{ display:"flex",gap:7 }}>
          {QUEST_LENGTH_OPTIONS.map(opt => {
            const active = questLength === opt.id;
            return (
              <button key={opt.id} onClick={()=>savePreferences({preferredQuestLength:opt.id})}
                style={{ flex:1,background:active?`${rc.primary}18`:"rgba(255,255,255,0.02)",border:`1px solid ${active?rc.primary+"55":"#0d0d1a"}`,borderRadius:9,padding:"10px 6px",textAlign:"center",cursor:"pointer",transition:"all 0.15s" }}>
                <div style={{ fontSize:"1rem",marginBottom:3 }}>{opt.icon}</div>
                <div style={{ fontSize:"0.72rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em",color:active?rc.primary:"#94a3b8" }}>{opt.label}</div>
                <div style={{ fontSize:"0.56rem",color:"#1e293b",marginTop:2 }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schwierigkeit */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:"0.52rem",letterSpacing:"0.15em",color:"#334155",marginBottom:8 }}>SCHWIERIGKEIT</div>
        <div style={{ display:"flex",gap:7 }}>
          {DIFFICULTY_OPTIONS.map(opt => {
            const active = difficulty === opt.id;
            const diffColor = opt.id==="hard"?"#ef4444":opt.id==="easy"?"#22c55e":"#f59e0b";
            return (
              <button key={opt.id} onClick={()=>savePreferences({difficulty:opt.id})}
                style={{ flex:1,background:active?`${diffColor}18`:"rgba(255,255,255,0.02)",border:`1px solid ${active?diffColor+"55":"#0d0d1a"}`,borderRadius:9,padding:"10px 6px",textAlign:"center",cursor:"pointer",transition:"all 0.15s" }}>
                <div style={{ fontSize:"1rem",marginBottom:3 }}>{opt.icon}</div>
                <div style={{ fontSize:"0.72rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em",color:active?diffColor:"#94a3b8" }}>{opt.label}</div>
                <div style={{ fontSize:"0.56rem",color:"#1e293b",marginTop:2 }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

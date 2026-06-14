// ============================================================
// MORE VIEW — System-Hub: Achievement-Log, Personalisierung,
// System Configuration (Onboarding, Haptik, Demo-Profile, Backup,
// Import, Reset). Viele Handler/State als Props (Tier-3-Kandidat).
// ============================================================
import { PreferencesSection } from "../features/settings/PreferencesSection.jsx";
import { ACHIEVEMENTS } from "../data/achievements.js";
import { DEMO_PROFILES } from "../data/demoProfiles.js";

export function MoreView({ state, unlockedAchievements, rc, toggleArrayPref, savePreferences, toggleSection, collapsedSections, setShowOnboarding, toggleHaptic, hapticEnabled, setShowDemo, showDemo, loadDemoProfile, exportData, importData, confirmReset, setConfirmReset, handleReset }) {
  return (
  <div>

    {/* Achievements */}
    <div style={{ fontSize:"0.64rem",letterSpacing:"0.28em",color:"#94a3b8",marginBottom:11 }}>◆ ACHIEVEMENT LOG ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
    <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:22 }}>
      {ACHIEVEMENTS.map(a=>{
        const unlocked=(state.unlockedAchievements||[]).includes(a.id);
        return (
          <div key={a.id} style={{ background:unlocked?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.015)",border:`1px solid ${unlocked?"#f59e0b33":"rgba(148,163,184,0.08)"}`,borderRadius:9,padding:"10px 13px",display:"flex",alignItems:"center",gap:12,opacity:unlocked?1:0.4 }}>
            <span style={{ fontSize:"1.1rem",flexShrink:0 }}>{a.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.8rem",fontWeight:700,color:unlocked?"#f59e0b":"#64748b" }}>{a.title}</div>
              <div style={{ fontSize:"0.68rem",color:"#64748b" }}>{a.desc}</div>
            </div>
            {unlocked && <span style={{ color:"#22c55e",fontSize:"0.9rem",flexShrink:0 }}>✓</span>}
          </div>
        );
      })}
    </div>

    {/* ── PERSONALISIERUNG ── */}
    <PreferencesSection
      preferences={state.player?.preferences}
      rankColor={rc.primary}
      toggleArrayPref={toggleArrayPref}
      savePreferences={savePreferences}
      toggleSection={toggleSection}
      collapsedSections={collapsedSections}
    />

    {/* Einstellungen — collapsible submenu */}
    <div style={{ marginBottom:8 }}>
      <button onClick={()=>toggleSection("settings")} style={{ width:"100%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"2px 0",marginBottom:collapsedSections["settings"]===false?10:0 }}>
        <span style={{ color:rc.primary,fontSize:"0.7rem" }}>⌬</span>
        <span style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"0.65rem",letterSpacing:"0.2em",color:rc.primary }}>SYSTEM CONFIGURATION</span>
        <div style={{ flex:1,height:1,background:`${rc.primary}22`,borderRadius:1 }}/>
        <span style={{ fontSize:"0.64rem",color:"#64748b",transform:collapsedSections["settings"]===false?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
      </button>

      {collapsedSections["settings"]===false && (
        <div style={{ display:"flex",flexDirection:"column",gap:8,animation:"sectionOpen 0.2s ease" }}>

          {/* Onboarding wieder anzeigen */}
          <button
            onClick={() => setShowOnboarding(true)}
            style={{ background:"rgba(0,255,255,0.06)",border:"1px solid #00ffff22",color:"#00ffff88",borderRadius:10,padding:"11px",fontSize:"0.76rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}
          >
            ◈ ONBOARDING ANZEIGEN
          </button>

          {/* Vibration toggle */}
          <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(148,163,184,0.1)",borderRadius:11,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"0.8rem",color:"#94a3b8",fontWeight:600 }}>Vibration</div>
              <div style={{ fontSize:"0.66rem",color:"#64748b",marginTop:2 }}>Feedback beim Abschließen von Quests</div>
            </div>
            <button onClick={()=>toggleHaptic(!hapticEnabled)} style={{ position:"relative",width:44,height:24,borderRadius:12,background:hapticEnabled?`${rc.primary}44`:"rgba(255,255,255,0.06)",border:`1px solid ${hapticEnabled?rc.primary+"66":"rgba(148,163,184,0.15)"}`,cursor:"pointer",transition:"all 0.3s",padding:0,flexShrink:0 }}>
              <div style={{ position:"absolute",top:2,left:hapticEnabled?22:2,width:18,height:18,borderRadius:"50%",background:hapticEnabled?rc.primary:"#64748b",transition:"all 0.25s ease",boxShadow:hapticEnabled?`0 0 6px ${rc.primary}`:"none" }}/>
            </button>
          </div>

          {/* Demo Presets */}
          <div style={{ marginBottom:8 }}>
            <button onClick={()=>setShowDemo(v=>!v)}
              style={{ width:"100%",background:"rgba(139,92,246,0.06)",border:"1px solid #8b5cf622",color:"#8b5cf666",borderRadius:9,padding:"10px 13px",fontSize:"0.72rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span>⌬ TEST-PROFILE (Szenarien)</span>
              <span style={{ fontSize:"0.64rem" }}>{showDemo?"▲":"▼"}</span>
            </button>
            {showDemo && (
              <div style={{ background:"rgba(0,0,0,0.3)",border:"1px solid #8b5cf622",borderRadius:"0 0 9px 9px",padding:"10px" }}>
                <div style={{ fontSize:"0.64rem",color:"#94a3b8",marginBottom:10,lineHeight:1.5 }}>
                  ⚠️ Lädt ein vorgefertigtes Testprofil. Aktueller Fortschritt wird überschrieben.
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {DEMO_PROFILES.map(profile => (
                    <button key={profile.id} onClick={()=>loadDemoProfile(profile.id)}
                      style={{ background:`${profile.color}08`,border:`1px solid ${profile.color}22`,borderRadius:9,padding:"10px 12px",cursor:"pointer",textAlign:"left",transition:"all 0.15s" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                        <span style={{ fontSize:"1rem" }}>{profile.icon}</span>
                        <span style={{ fontSize:"0.75rem",color:profile.color,fontFamily:"'Rajdhani',sans-serif",fontWeight:700 }}>{profile.label}</span>
                      </div>
                      <div style={{ fontSize:"0.64rem",color:"#64748b",lineHeight:1.4,marginLeft:24 }}>{profile.desc}</div>
                      <div style={{ fontSize:"0.64rem",color:"#64748b",marginTop:5,marginLeft:24 }}>
                        <span style={{ color:`${profile.color}66` }}>Paths: </span>{profile.expectedPaths.join(", ")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Backup */}
          <button onClick={exportData} style={{ background:"rgba(34,197,94,0.08)",border:"1px solid #22c55e33",color:"#22c55e",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            ↓ DATEN EXPORTIEREN
          </button>
          <label style={{ background:"rgba(59,130,246,0.08)",border:"1px solid #3b82f633",color:"#3b82f6",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            ↑ DATEN IMPORTIEREN
            <input type="file" accept=".json" onChange={importData} style={{ display:"none" }}/>
          </label>

          {/* Reset */}
          {!confirmReset ? (
            <button onClick={()=>setConfirmReset(true)} style={{ background:"rgba(239,68,68,0.07)",border:"1px solid #ef444422",color:"#ef4444",borderRadius:10,padding:"13px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              ⚠ SYSTEM ZURÜCKSETZEN
            </button>
          ) : (
            <div style={{ background:"rgba(239,68,68,0.08)",border:"1px solid #ef444444",borderRadius:10,padding:"14px" }}>
              <div style={{ color:"#ef4444",fontSize:"0.78rem",fontWeight:700,marginBottom:4,letterSpacing:"0.05em" }}>System wirklich zurücksetzen?</div>
              <div style={{ color:"#ef4444aa",fontSize:"0.72rem",marginBottom:12,lineHeight:1.5 }}>Rang, Level, XP, Stats, Körper-Daten — alle Fortschritte werden gelöscht.</div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={handleReset} style={{ flex:1,background:"linear-gradient(135deg,#ef444418,#ef444430)",border:"1px solid #ef444466",color:"#ef4444",borderRadius:8,padding:"11px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em" }}>JA, LÖSCHEN</button>
                <button onClick={()=>setConfirmReset(false)} style={{ flex:1,background:"transparent",border:"1px solid rgba(148,163,184,0.12)",color:"#64748b",borderRadius:8,padding:"11px",fontSize:"0.82rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,cursor:"pointer" }}>CANCEL</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

  </div>
  );
}

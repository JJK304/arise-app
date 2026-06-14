// ============================================================
// SYSTEM OVERLAYS — transiente System-Fenster (Anzeige-only):
// Level-Up-Vollbild, Notification-Zeile, Achievement-/Titel-Popups.
// Reine Props, keine Setter — pointerEvents: none. Keyframes
// (fadeInOut, slideDown, glitch) liefert der globale <style> in App.
// ============================================================

export function SystemOverlays({ rc, levelUpAnim, notification, newAchievements, newTitles }) {
  return (
    <>
      {/* Level Up overlay */}
      {levelUpAnim && (
        <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.9)",animation:"fadeInOut 2.8s ease forwards",pointerEvents:"none" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.5em",color:`${rc.primary}aa`,fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:14,textShadow:`0 0 16px ${rc.primary}` }}>◈ SYSTEM ◈</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(2rem,10vw,3.5rem)",fontWeight:900,color:rc.primary,textShadow:`0 0 30px ${rc.primary}`,animation:"glitch 0.4s infinite",letterSpacing:"0.08em" }}>{levelUpAnim.rankUp?"RANK UP!":"LEVEL UP"}</div>
            <div style={{ color:"#94a3b8",fontSize:"0.9rem",marginTop:10,letterSpacing:"0.25em" }}>{levelUpAnim.rank}-RANK · LV.{levelUpAnim.level}</div>
          </div>
        </div>
      )}

      {/* Notification — System line */}
      {notification && (
        <div style={{ position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:500,maxWidth:"calc(100% - 24px)",pointerEvents:"none",animation:"fadeInOut 3.5s ease" }}>
          <div style={{ position:"relative",background:"#05070ef2",border:`1px solid ${notification.color}55`,borderRadius:3,padding:"8px 16px",display:"flex",alignItems:"center",gap:9,boxShadow:`0 4px 22px rgba(0,0,0,0.6), 0 0 16px ${notification.color}22` }}>
            <span style={{ fontSize:"0.64rem",letterSpacing:"0.26em",color:`${notification.color}aa`,fontFamily:"'Orbitron',sans-serif",fontWeight:700 }}>◈</span>
            <span style={{ color:notification.color,fontFamily:"'Orbitron',sans-serif",fontSize:"0.66rem",letterSpacing:"0.08em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Achievement popup — System window */}
      {newAchievements.length > 0 && (
        <div style={{ position:"fixed",top:150,left:"50%",transform:"translateX(-50%)",zIndex:499,animation:"slideDown 0.3s ease",display:"flex",flexDirection:"column",gap:8,width:"calc(100% - 28px)",maxWidth:360,pointerEvents:"none" }}>
          {newAchievements.map(a=>(
            <div key={a.id} style={{ position:"relative",background:"linear-gradient(180deg,#070b18f5,#05060ef5)",border:"1px solid #f59e0b40",borderRadius:4,padding:"10px 14px",display:"flex",alignItems:"center",gap:11,boxShadow:"0 8px 30px rgba(0,0,0,0.55), 0 0 20px #f59e0b1f" }}>
              {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],ci)=>(
                <div key={ci} style={{ position:"absolute",[v]:4,[h]:4,width:9,height:9,borderTop:v==="top"?"2px solid #f59e0b":"none",borderBottom:v==="bottom"?"2px solid #f59e0b":"none",borderLeft:h==="left"?"2px solid #f59e0b":"none",borderRight:h==="right"?"2px solid #f59e0b":"none",opacity:.7 }}/>
              ))}
              <span style={{ fontSize:"1.3rem" }}>{a.icon}</span>
              <div>
                <div style={{ color:"#f59e0b",fontSize:"0.64rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.22em",fontWeight:700 }}>◈ ACHIEVEMENT</div>
                <div style={{ color:"#e2e8f0",fontSize:"0.82rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif" }}>{a.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Titles popup — System window */}
      {newTitles.length > 0 && (
        <div style={{ position:"fixed",top:newAchievements.length>0?226:150,left:"50%",transform:"translateX(-50%)",zIndex:498,animation:"slideDown 0.3s ease",display:"flex",flexDirection:"column",gap:8,width:"calc(100% - 28px)",maxWidth:360,pointerEvents:"none" }}>
          {newTitles.map(t=>(
            <div key={t.id} style={{ position:"relative",background:"linear-gradient(180deg,#070b18f5,#05060ef5)",border:`1px solid ${t.color}40`,borderRadius:4,padding:"10px 14px",display:"flex",alignItems:"center",gap:11,boxShadow:`0 8px 30px rgba(0,0,0,0.55), 0 0 20px ${t.color}1f` }}>
              {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],ci)=>(
                <div key={ci} style={{ position:"absolute",[v]:4,[h]:4,width:9,height:9,borderTop:v==="top"?`2px solid ${t.color}`:"none",borderBottom:v==="bottom"?`2px solid ${t.color}`:"none",borderLeft:h==="left"?`2px solid ${t.color}`:"none",borderRight:h==="right"?`2px solid ${t.color}`:"none",opacity:.7 }}/>
              ))}
              <span style={{ fontSize:"1.3rem" }}>{t.icon}</span>
              <div>
                <div style={{ color:t.color,fontSize:"0.64rem",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.22em",fontWeight:700 }}>◈ TITEL FREIGESCHALTET</div>
                <div style={{ color:"#e2e8f0",fontSize:"0.82rem",fontWeight:700,fontFamily:"'Rajdhani',sans-serif" }}>{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

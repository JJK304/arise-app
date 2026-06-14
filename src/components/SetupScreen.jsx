// ============================================================
// SETUP SCREEN — System-Player-Registrierung (erster Start).
// Eigenständig: nur Namens-Eingabe → handleCreate. Kein App-State.
// ============================================================

export function SetupScreen({ nameInput, setNameInput, handleCreate }) {
  return (
    <div style={{ minHeight:"100vh",background:"#04040a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif",backgroundImage:"radial-gradient(ellipse at 50% 0%,#0a1330,#04040a 62%)",padding:24,position:"relative",overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes sysIn{0%{opacity:0;transform:translateY(16px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes sysGlow{0%,100%{box-shadow:0 0 0 1px #00e5ff22,0 0 30px #00e5ff12,inset 0 0 20px #00e5ff08}50%{box-shadow:0 0 0 1px #00e5ff40,0 0 46px #00e5ff26,inset 0 0 28px #00e5ff10}}
        @keyframes sysScan{0%{transform:translateY(-8px);opacity:0}10%{opacity:.45}100%{transform:translateY(380px);opacity:0}}
        @keyframes sysLabel{from{opacity:0;letter-spacing:.7em}to{opacity:1;letter-spacing:.42em}}
      `}</style>

      <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 50% 16%, #00e5ff10, transparent 46%)",pointerEvents:"none" }}/>

      <div style={{ position:"relative",width:"100%",maxWidth:400,animation:"sysIn .5s cubic-bezier(.2,.8,.2,1)" }}>
        <div style={{ position:"relative",background:"linear-gradient(180deg,#070b18f2,#05060ef2)",border:"1px solid #00e5ff22",borderRadius:5,padding:"30px 24px 22px",animation:"sysGlow 3.6s ease-in-out infinite",overflow:"hidden" }}>

          {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
            <div key={i} style={{ position:"absolute",[v]:8,[h]:8,width:14,height:14,
              borderTop:v==="top"?"2px solid #00e5ff":"none",borderBottom:v==="bottom"?"2px solid #00e5ff":"none",
              borderLeft:h==="left"?"2px solid #00e5ff":"none",borderRight:h==="right"?"2px solid #00e5ff":"none",opacity:.85 }}/>
          ))}
          <div style={{ position:"absolute",left:0,right:0,top:0,height:2,background:"linear-gradient(90deg,transparent,#00e5ffaa,transparent)",animation:"sysScan 4.4s linear infinite",pointerEvents:"none" }}/>

          <div style={{ textAlign:"center",marginBottom:16 }}>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.42em",color:"#00e5ff",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:12,animation:"sysLabel .8s ease both",textShadow:"0 0 14px #00e5ff66" }}>◈ SYSTEM ◈</div>
            <div style={{ fontSize:"0.64rem",letterSpacing:"0.4em",color:"#64748b",marginBottom:14 }}>SYSTEM NOTIFICATION</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(2.4rem,11vw,4rem)",fontWeight:900,background:"linear-gradient(135deg,#00e5ff,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1,letterSpacing:"0.04em" }}>ARISE</div>
          </div>

          <div style={{ textAlign:"center",marginBottom:18 }}>
            <div style={{ color:"#e2e8f0",fontSize:"0.82rem",fontWeight:700,letterSpacing:"0.16em",fontFamily:"'Rajdhani',sans-serif",marginBottom:6 }}>EIN SPIELER WURDE GEFUNDEN</div>
            <div style={{ color:"#94a3b8",fontSize:"0.74rem",lineHeight:1.6 }}>Du hast die Qualifikation erhalten,<br/>ein <span style={{ color:"#00e5ff",fontWeight:700 }}>Player</span> zu werden.</div>
          </div>

          <div style={{ height:1,background:"linear-gradient(90deg,transparent,#00e5ff33,transparent)",marginBottom:16 }}/>

          <div style={{ fontSize:"0.64rem",letterSpacing:"0.22em",color:"#00e5ff99",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:9 }}>▣ PLAYER-REGISTRIERUNG</div>
          <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCreate()} placeholder="Name eingeben…" autoFocus style={{ width:"100%",background:"rgba(0,229,255,0.04)",border:"1px solid #00e5ff33",borderRadius:4,padding:"13px 15px",color:"#e2e8f0",fontSize:"1rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,outline:"none",boxSizing:"border-box",marginBottom:13,letterSpacing:"0.08em" }}/>
          <button onClick={handleCreate} style={{ width:"100%",background:"linear-gradient(135deg,#00e5ff1f,#8b5cf62a)",border:"1px solid #00e5ff55",color:"#00e5ff",borderRadius:4,padding:14,fontSize:"0.9rem",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:"0.16em",cursor:"pointer",textShadow:"0 0 12px #00e5ff66" }}>◈ DEM SYSTEM BEITRETEN ◈</button>

          <div style={{ textAlign:"center",marginTop:15,fontSize:"0.64rem",color:"#475569",letterSpacing:"0.05em",lineHeight:1.5 }}>※ Nur du kannst diese Benachrichtigung sehen.</div>

        </div>
      </div>
    </div>
  );
}

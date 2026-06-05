// ============================================================
// SPLASH SCREEN
// ============================================================
export const SplashScreen = ({ rankColor }) => (
  <div style={{ position:"fixed", inset:0, zIndex:2000, background:"#050508", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", animation:"splashOut 0.4s ease 1.4s forwards" }}>
    <div style={{ fontSize:"0.55rem", letterSpacing:"0.45em", color:"#1e293b", marginBottom:16, animation:"splashFade 0.4s ease 0.1s both" }}>SYSTEM NOTIFICATION</div>
    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"clamp(3rem,12vw,5rem)", fontWeight:900, background:`linear-gradient(135deg,${rankColor},#8b5cf6)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"splashPulse 0.8s ease", letterSpacing:"0.05em" }}>ARISE</div>
    <div style={{ fontSize:"0.6rem", letterSpacing:"0.4em", color:"#1e293b", marginTop:8, animation:"splashFade 0.6s ease 0.3s both" }}>AWAKENING SYSTEM ONLINE</div>
    <div style={{ marginTop:24, width:120, height:2, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden", animation:"splashFade 0.4s ease 0.5s both" }}>
      <div style={{ height:"100%", background:`linear-gradient(90deg,${rankColor}88,${rankColor})`, animation:"splashBar 1s ease 0.6s both", width:"0%" }}/>
    </div>
  </div>
);

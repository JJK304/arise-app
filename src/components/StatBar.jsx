import { useCountUp } from "../lib/useCountUp.js";

// ============================================================
// STAT BAR
// ============================================================
export const StatBar = ({ label, icon, value, max = 100, color, small = false, onClick }) => {
  const animated = useCountUp(value);
  const pct = Math.min(value > 0 ? (value / max) * 100 : 0, 100);
  return (
    <div
      onClick={onClick}
      style={{ background:"rgba(255,255,255,0.025)", border:`1px solid ${color}22`, borderRadius:8, padding:small ? "7px 10px" : "9px 12px", cursor:onClick ? "pointer" : "default", transition:"all 0.15s" }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = color + "55"; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.borderColor = color + "22"; }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:small ? "0.68rem" : "0.74rem", color:"#666" }}>{icon} {label}</span>
        <span style={{ fontSize:small ? "0.72rem" : "0.8rem", color, fontWeight:700, fontFamily:"'Rajdhani',sans-serif" }}>{animated}</span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:3, height:3, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${color}66,${color})`, boxShadow:`0 0 5px ${color}88`, borderRadius:3, transition:"width 0.6s ease" }}/>
      </div>
    </div>
  );
};

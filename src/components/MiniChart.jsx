// ============================================================
// MINI LINE CHART (for XP history and body metrics)
// ============================================================
export const MiniChart = ({ data, color = "#00ffff", height = 60, label = "" }) => {
  if (!data || data.length < 2) return (
    <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b", fontSize:"0.7rem" }}>
      Noch zu wenig Daten — schließe weitere Quests ab
    </div>
  );
  const vals = data.map(d => d.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const w = 280, h = height;
  const pts = vals.map((v, i) => ({ x:(i / (vals.length - 1)) * (w - 20) + 10, y:h - 10 - ((v - min) / range) * (h - 20) }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = path + ` L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;
  return (
    <div>
      {label && <div style={{ fontSize:"0.58rem", color:"#64748b", letterSpacing:"0.1em", marginBottom:4 }}>{label}</div>}
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id={`g_${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#g_${color.replace("#", "")})`}/>
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" style={{ filter:`drop-shadow(0 0 3px ${color}88)` }}/>
        {pts.map((p, i) => i === pts.length - 1 && (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke="#050508" strokeWidth={1.5}/>
        ))}
        <text x={pts[0].x} y={h - 1} textAnchor="middle" fontSize={8} fill="#64748b">{data[0].l}</text>
        <text x={pts[pts.length - 1].x} y={h - 1} textAnchor="middle" fontSize={8} fill="#64748b">{data[data.length - 1].l}</text>
        <text x={pts[pts.length - 1].x + 4} y={pts[pts.length - 1].y - 4} fontSize={9} fill={color} fontWeight={700} fontFamily="'Rajdhani',sans-serif">{vals[vals.length - 1]}</text>
      </svg>
    </div>
  );
};

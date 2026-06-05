// ============================================================
// RADAR CHART
// ============================================================
export const RadarChart = ({ stats, rankColor }) => {
  const cx = 130, cy = 130, r = 90;
  const axes = [
    { key:"STR", label:"STR", color:"#ef4444" },
    { key:"AGI", label:"AGI", color:"#f59e0b" },
    { key:"INT", label:"INT", color:"#3b82f6" },
    { key:"CRE", label:"ART", color:"#a78bfa" },
    { key:"CRA", label:"CRA", color:"#f97316" },
    { key:"VIT", label:"VIT", color:"#22c55e" },
    { key:"END", label:"END", color:"#64748b" },
    { key:"CHA", label:"CHA", color:"#ec4899" },
  ];
  const n = axes.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const maxVal = Math.max(10, ...axes.map(a => stats[a.key] || 0));
  const getPoint = (i, val) => {
    const pct = Math.min(val / maxVal, 1), a = angle(i);
    return { x:cx + Math.cos(a) * r * pct, y:cy + Math.sin(a) * r * pct };
  };
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = axes.map((ax, i) => getPoint(i, stats[ax.key] || 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${rankColor}22`, borderRadius:14, padding:"14px 10px 8px" }}>
      <div style={{ fontSize:"0.56rem", letterSpacing:"0.28em", color:"#1e293b", marginBottom:10 }}>STAT OVERVIEW</div>
      <div style={{ display:"flex", justifyContent:"center" }}>
        <svg width={260} height={260} viewBox="0 0 260 260" style={{ overflow:"visible" }}>
          {gridLevels.map((pct, gi) => {
            const pts = axes.map((_, i) => {
              const a = angle(i);
              return `${(cx + Math.cos(a) * r * pct).toFixed(1)},${(cy + Math.sin(a) * r * pct).toFixed(1)}`;
            });
            return <polygon key={gi} points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={gi === 3 ? 1 : 0.5}/>;
          })}
          {axes.map((_, i) => {
            const a = angle(i), ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r;
            return <line key={i} x1={cx} y1={cy} x2={ex.toFixed(1)} y2={ey.toFixed(1)} stroke="rgba(255,255,255,0.06)" strokeWidth={0.8}/>;
          })}
          <path d={dataPath} fill={`${rankColor}18`} stroke={rankColor} strokeWidth={1.8} strokeLinejoin="round" style={{ filter:`drop-shadow(0 0 5px ${rankColor}66)` }}/>
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3.5} fill={axes[i].color} stroke="#050508" strokeWidth={1.5} style={{ filter:`drop-shadow(0 0 3px ${axes[i].color})` }}/>
          ))}
          {axes.map((ax, i) => {
            const a = angle(i), lx = cx + Math.cos(a) * (r + 22), ly = cy + Math.sin(a) * (r + 22), val = stats[ax.key] || 0;
            return (
              <g key={i}>
                <text x={lx.toFixed(1)} y={(ly - 5).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} letterSpacing={1} fill={ax.color} fontFamily="'Rajdhani',sans-serif">{ax.label}</text>
                <text x={lx.toFixed(1)} y={(ly + 8).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={val > 0 ? "#e2e8f0" : "#1e293b"} fontFamily="'Rajdhani',sans-serif" fontWeight={700}>{val}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

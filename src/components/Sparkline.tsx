"use client";

export default function Sparkline({ sparkline, width = 80, height = 24, fill = false }: {
  sparkline?: { points: number[]; timestamps: string[] } | null;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const points = sparkline?.points;

  if (!points || points.length < 2) return <div style={{ width, height }} />;

  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const bottom = height - pad;

  let lineD, areaD;

  if (points.length === 1) {
    const y = bottom - ((points[0] - min) / range) * (height - pad * 2);
    lineD = `M${pad},${y.toFixed(1)} L${width - pad},${y.toFixed(1)}`;
    areaD = fill ? `${lineD} L${width - pad},${bottom} L${pad},${bottom} Z` : "";
  } else {
    const stepX = (width - pad * 2) / (points.length - 1);
    const pts = points.map((p, i) => {
      const x = pad + i * stepX;
      const y = bottom - ((p - min) / range) * (height - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    lineD = pts;
    const lastX = pad + (points.length - 1) * stepX;
    areaD = fill ? `${pts} L${lastX.toFixed(1)},${bottom} L${pad},${bottom} Z` : "";
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      {fill && <path d={areaD} fill="#059669" fillOpacity="0.15" />}
      <path d={lineD} fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
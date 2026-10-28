/** Mini gráfico de linha. Precisa de 2+ pontos com dado; com menos, não desenha nada. */
export function Sparkline({
  values,
  width = 120,
  height = 40,
}: {
  values: (number | null)[];
  width?: number;
  height?: number;
}) {
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v !== null);
  if (pts.length < 2) return null;

  const pad = 4;
  const min = Math.min(...pts.map((p) => p.v));
  const max = Math.max(...pts.map((p) => p.v));
  const span = max - min || 1;
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2);

  const line = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="overflow-visible" aria-hidden>
      <path
        data-spark
        d={line}
        pathLength={1}
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle data-spark-dot cx={x(last.i)} cy={y(last.v)} r={3} fill="var(--text)" />
    </svg>
  );
}

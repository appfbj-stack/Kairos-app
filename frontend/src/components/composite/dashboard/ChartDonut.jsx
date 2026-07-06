export default function ChartDonut({ data, size = 180 }) {
  if (!data?.length) return <div className="flex items-center justify-center h-[180px] text-sm text-muted">Sem dados para exibir</div>;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-[180px] text-sm text-muted">Sem dados para exibir</div>;

  const strokeWidth = size * 0.15;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const center = size / 2;

  const segments = data.map((d, i) => {
    const segLength = (d.value / total) * circ;
    const prevLengths = data.slice(0, i).reduce((s, x) => s + (x.value / total) * circ, 0);
    return { ...d, segLength, offset: prevLengths };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <g transform={`rotate(-90 ${center} ${center})`}>
          {segments.map((d, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={d.color || `var(--color-chart-${(i % 5) + 1})`}
              strokeWidth={strokeWidth}
              strokeDasharray={`${d.segLength} ${circ - d.segLength}`}
              strokeDashoffset={-d.offset}
              strokeLinecap="round"
            >
              <title>{d.label}: {d.value}</title>
            </circle>
          ))}
        </g>
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color || `var(--color-chart-${(i % 5) + 1})` }} />
            <span className="text-foreground">{d.label}</span>
            <span className="text-muted">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useId } from 'react';

export default function ChartLine({ data, height = 200, color = 'var(--color-primary)', fill = false }) {
  const id = useId();
  if (!data?.length) return <div className="flex items-center justify-center h-[200px] text-sm text-muted">Sem dados para exibir</div>;

  const w = 600;
  const h = height;
  const padX = 30;
  const padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const stepX = chartW / (data.length - 1 || 1);

  const points = data.map((d, i) => `${padX + i * stepX},${padY + chartH - (d.value / max) * chartH}`).join(' ');
  const path = points.split(' ').map((p, i) => {
    const [x, y] = p.split(',');
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        {fill && (
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        )}
      </defs>
      {fill && <path d={`${path} L ${padX + chartW} ${padY + chartH} L ${padX} ${padY + chartH} Z`} fill={`url(#grad-${id})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={padX + i * stepX} cy={padY + chartH - (d.value / max) * chartH} r="3" fill={color} stroke="var(--color-background)" strokeWidth="2">
          <title>{d.label}: {d.value}</title>
        </circle>
      ))}
      {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 8)) === 0).map((d) => {
        const idx = data.indexOf(d);
        return (
          <text key={idx} x={padX + idx * stepX} y={h - 4} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="10">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

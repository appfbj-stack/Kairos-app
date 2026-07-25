export default function ChartBar({ data, height = 200, color = 'var(--color-primary)', showValues = true }) {
  if (!data?.length) return <div className="flex items-center justify-center h-[200px] text-sm text-muted">Sem dados para exibir</div>;
  const max = Math.max(...data.map(d => d.value));
  if (max === 0) return <div className="flex items-center justify-center h-[200px] text-sm text-muted">Sem dados para exibir</div>;

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          {showValues && <span className="text-[11px] font-medium text-foreground/70">{d.value}</span>}
          <div
            className="w-full rounded-t transition-all duration-300"
            style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color, minHeight: 4 }}
          />
          {d.label && <span className="text-[10px] text-muted truncate w-full text-center">{d.label}</span>}
        </div>
      ))}
    </div>
  );
}

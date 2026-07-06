import { cn } from '../../../lib/utils';

const PERIODOS = [
  { label: '12 meses', value: '12m' },
  { label: 'Trimestre', value: '3m' },
  { label: 'Mês', value: '1m' },
  { label: 'Ano', value: '1y' },
];

export default function PeriodFilter({ value = '12m', onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
      {PERIODOS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange?.(p.value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-colors',
            value === p.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-foreground'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

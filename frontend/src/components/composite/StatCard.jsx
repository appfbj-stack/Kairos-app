// frontend/src/components/composite/StatCard.jsx
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';
import { formatarNumeroBR } from '../../lib/utils';
import SparklineChart from './SparklineChart';

const ACCENT = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

export default function StatCard({
  icon: Icon,
  title,
  value,
  description,
  trend,
  sparklineData = [],
  onClick,
  loading = false,
  accent = 'primary',
}) {
  const color = ACCENT[accent] || ACCENT.primary;
  const trendUp = trend?.direction !== 'down';
  const trendValue = trend?.value;
  const clickable = Boolean(onClick);

  return (
    <Card
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => clickable && (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className={cn(
        'p-5 group relative overflow-visible',
        clickable && 'cursor-pointer hover:border-border-strong hover:shadow-glow-strong hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="grid h-10 w-10 place-items-center rounded-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
          >
            {Icon ? <Icon className="h-5 w-5" /> : null}
          </div>
          <p className="text-sm font-medium text-muted truncate">{title}</p>
        </div>
        {trendValue != null && !loading && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full',
              trendUp ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            )}
          >
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trendValue).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <p className="text-3xl font-bold text-foreground truncate">
              {typeof value === 'number' ? formatarNumeroBR(value) : value}
            </p>
          )}
          {loading ? <Skeleton className="mt-2 h-3 w-20" /> : (
            <p className="text-xs text-muted truncate">{description}</p>
          )}
        </div>
        <div className="shrink-0">
          {loading ? <Skeleton className="h-9 w-[120px]" /> : (
            sparklineData.length > 0 && <SparklineChart data={sparklineData} color={color} />
          )}
        </div>
      </div>
    </Card>
  );
}

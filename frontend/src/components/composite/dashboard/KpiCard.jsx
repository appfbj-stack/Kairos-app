import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-sky-500/10 text-sky-500',
};

export default function KpiCard({ label, value, variation, icon: Icon, color = 'primary' }) {
  return (
    <div className="flex flex-col gap-1 rounded-card border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted font-medium">{label}</span>
        {Icon && (
          <div className={cn('rounded-lg p-1.5', colorMap[color])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {variation !== undefined && (
        <span className={cn('flex items-center gap-0.5 text-xs font-medium', {
          'text-success': variation > 0,
          'text-danger': variation < 0,
          'text-muted': variation === 0,
        })}>
          {variation > 0 ? <ArrowUpRight className="h-3 w-3" /> : variation < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {variation > 0 ? '+' : ''}{variation}%
        </span>
      )}
    </div>
  );
}

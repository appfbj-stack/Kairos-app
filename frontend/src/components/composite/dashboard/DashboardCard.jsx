import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

const colorMap = {
  primary: 'from-primary/20 to-primary/5 border-primary/20',
  success: 'from-success/20 to-success/5 border-success/20',
  warning: 'from-warning/20 to-warning/5 border-warning/20',
  danger: 'from-danger/20 to-danger/5 border-danger/20',
  info: 'from-sky-500/20 to-sky-500/5 border-sky-500/20',
  violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
  pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20',
  orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20',
};

export default function DashboardCard({ icon: Icon, label, value, trend, path, color = 'primary' }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        'relative flex flex-col gap-2 rounded-card border bg-gradient-to-br p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]',
        colorMap[color] || colorMap.primary
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-foreground/70" />
        {trend !== undefined && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', trend > 0 ? 'text-success' : 'text-danger')}>
            {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </button>
  );
}

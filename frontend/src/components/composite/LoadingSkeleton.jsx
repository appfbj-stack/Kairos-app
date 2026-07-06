// frontend/src/components/composite/LoadingSkeleton.jsx
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-card border border-border bg-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-[120px]" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 4 }) {
  return (
    <div className="rounded-card border border-border bg-card p-4 space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-card border border-border bg-card p-4 h-64">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 15 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function TopbarSkeleton() {
  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-background/80">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}

const REGISTRY = {
  statcard: StatCardSkeleton,
  table: TableSkeleton,
  chart: ChartSkeleton,
  sidebar: SidebarSkeleton,
  topbar: TopbarSkeleton,
};

export default function LoadingSkeleton({ variant = 'statcard', count = 1, className }) {
  const Comp = REGISTRY[variant] || StatCardSkeleton;
  if (count <= 1) return <Comp className={className} />;
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => <Comp key={i} />)}
    </div>
  );
}

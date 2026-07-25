// frontend/src/components/ui/skeleton.jsx
import { cn } from '../../lib/utils';
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-card-hover/40 skeleton-shimmer', className)}
      {...props}
    />
  );
}
// frontend/src/components/composite/DateDisplay.jsx
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

function useCurrentDate(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function DateDisplay({ className }) {
  const now = useCurrentDate();
  return (
    <div className={cn('hidden lg:flex items-center gap-2 text-sm text-muted px-3', className)}>
      <Calendar className="h-4 w-4" />
      <span>{fmt.format(now)}</span>
    </div>
  );
}

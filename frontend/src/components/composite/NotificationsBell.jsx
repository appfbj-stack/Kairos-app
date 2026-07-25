// frontend/src/components/composite/NotificationsBell.jsx
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

const MOCKS = [
  { titulo: 'Relatório pendente', desc: 'Congregação Central — junho', disabled: true },
  { titulo: 'Aniversariante hoje', desc: 'Pastor João Silva', disabled: true },
  { titulo: 'Escala sem obreiro', desc: 'Culto de quarta-feira', disabled: true },
];

export default function NotificationsBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 grid place-items-center rounded-full bg-danger text-[10px] font-bold text-white">3</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">Notificações <Badge variant="outline">mock</Badge></DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MOCKS.map((n) => (
          <DropdownMenuItem key={n.titulo} className="opacity-60 cursor-default" aria-disabled>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{n.titulo}</span>
              <span className="text-xs text-muted">{n.desc}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

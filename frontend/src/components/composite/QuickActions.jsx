// frontend/src/components/composite/QuickActions.jsx
import { Zap, UserPlus, CalendarPlus, Droplets } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

const ACOES = [
  { icon: UserPlus, label: 'Novo membro' },
  { icon: CalendarPlus, label: 'Novo evento' },
  { icon: Droplets, label: 'Registrar batismo' },
];

export default function QuickActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ações rápidas">
          <Zap className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          Ações rápidas
          <Badge variant="outline">em breve</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACOES.map((a) => (
          <DropdownMenuItem key={a.label} className="opacity-60 cursor-default" aria-disabled>
            <a.icon className="mr-2 h-4 w-4" />
            <span>{a.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

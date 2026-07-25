import { PanelLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuthStore } from '../../stores/auth';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../composite/Breadcrumb';
import DateDisplay from '../composite/DateDisplay';
import GlobalSearch from '../composite/GlobalSearch';
import QuickActions from '../composite/QuickActions';
import NotificationsBell from '../composite/NotificationsBell';
import ThemeToggle from '../composite/ThemeToggle';

export default function Topbar({ onToggleSidebar }) {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label="Recolher/expandir menu"
        className="hidden lg:inline-flex"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <GlobalSearch />
        <DateDisplay />
        <QuickActions />
        <NotificationsBell />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Perfil">
              <Avatar className="h-9 w-9 border border-border">
                {usuario?.foto_url ? <AvatarImage src={usuario.foto_url} alt={usuario.nome} /> : null}
                <AvatarFallback>{usuario?.nome?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium truncate">{usuario?.nome}</p>
              <p className="text-xs text-muted-foreground capitalize">{usuario?.perfil}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/perfil')}>Meu perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

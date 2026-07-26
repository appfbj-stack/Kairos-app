// frontend/src/components/layout/Sidebar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { cn } from '../../lib/utils';
import { MENU_GRUPOS, filtrarPorPerfis } from '../../lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import SidebarItem from './SidebarItem';

function SidebarBody({ collapsed, onNavigate }) {
  const { usuario, logout, isAdmin, isMaster } = useAuthStore();
  const navigate = useNavigate();
  const grupos = filtrarPorPerfis(MENU_GRUPOS, { isAdmin: isAdmin(), isMaster: isMaster() });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center gap-2 border-b border-border px-4', collapsed && 'justify-center px-2')}>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary font-bold shadow-glow">K</div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Kairós</p>
            <p className="text-[11px] text-muted uppercase tracking-wide">Gestão Eclesiástica</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-4 p-3">
          {grupos.map((g) => (
            <div key={g.titulo}>
              {!collapsed && <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.titulo}</p>}
              <div className="space-y-1">
                {g.items.map((item) => (
                  <SidebarItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className={cn('flex items-center gap-2 rounded-lg p-2', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8">
            {usuario?.foto_url ? <AvatarImage src={usuario.foto_url} alt={usuario.nome} /> : null}
            <AvatarFallback>{usuario?.nome?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{usuario?.nome}</p>
              <p className="text-[11px] text-muted capitalize">{usuario?.perfil}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-muted hover:text-danger transition-colors"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'hidden lg:flex shrink-0 h-screen sticky top-0 border-r border-border bg-background transition-[width] duration-200',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      {/* Mobile via Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden p-2 text-muted hover:text-foreground" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-background">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary font-bold">K</div>
              Kairós
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-56px)]">
            <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export { SidebarBody };

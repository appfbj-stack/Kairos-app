import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { cn } from '../../lib/utils';
import { MENU_ITEMS, ADMIN_ITEMS } from '../../lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

function SidebarItem({ item, collapsed, onNavigate }) {
  const location = useLocation();
  const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  return (
    <button
      onClick={() => onNavigate?.(item.to)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}

function SidebarBody({ collapsed, onItemClick }) {
  const { usuario, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const isUserAdmin = isAdmin();

  const handleNavigate = (to) => {
    navigate(to);
    if (onItemClick) onItemClick();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className={cn('flex h-16 items-center border-b border-sidebar-border px-4 shrink-0', collapsed ? 'justify-center' : 'gap-2')}>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
          K
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">Kairós Sede</p>
            <p className="text-[11px] text-sidebar-foreground/60 uppercase tracking-wide">Sorocaba</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-0.5 p-2">
          {MENU_ITEMS.map((item) => (
            <SidebarItem key={item.to} item={item} collapsed={collapsed} onNavigate={handleNavigate} />
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-2 space-y-0.5 shrink-0">
        {ADMIN_ITEMS.filter(i => !i.adminOnly || isUserAdmin).map((item) => (
          <SidebarItem key={item.to} item={item} collapsed={collapsed} onNavigate={handleNavigate} />
        ))}
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Sair</span>}
        </button>
      </div>

      <div className="border-t border-sidebar-border p-3 shrink-0">
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border">
            {usuario?.foto_url ? <AvatarImage src={usuario.foto_url} alt={usuario.nome} /> : null}
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
              {usuario?.nome?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{usuario?.nome}</p>
              <p className="text-[11px] text-sidebar-foreground/60 capitalize">{usuario?.perfil}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, onToggleSidebar }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside
        className={cn(
          'hidden lg:flex shrink-0 h-screen sticky top-0 border-r border-sidebar-border transition-[width] duration-200',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        <SidebarBody collapsed={collapsed} onItemClick={null} />
        <button
          onClick={onToggleSidebar}
          className="absolute -right-3 top-20 z-10 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors shadow-sm"
        >
          <ChevronLeft className={cn('h-3 w-3 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden p-2 text-foreground hover:text-foreground/80" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <SidebarBody collapsed={false} onItemClick={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

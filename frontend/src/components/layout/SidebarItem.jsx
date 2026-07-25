// frontend/src/components/layout/SidebarItem.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export default function SidebarItem({ item, collapsed, onNavigate }) {
  const { pathname } = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const isActive = pathname === item.to || pathname.startsWith(item.to + '/');
  const hasSubmenu = Array.isArray(item.submenu) && item.submenu.length > 0;
  const isEmBreve = item.routeExists === false;

  const inner = (
    <div className={cn(
      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative',
      isActive
        ? 'bg-card text-primary border border-border-strong shadow-glow'
        : 'text-muted hover:text-foreground hover:bg-card hover:border hover:border-border',
      collapsed && 'justify-center px-2'
    )}>
      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-glow shadow-glow" />}
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {isEmBreve && <span className="text-[10px] text-warning uppercase tracking-wide">em breve</span>}
          {hasSubmenu && <ChevronDown className={cn('h-4 w-4 transition-transform', openSubmenu && 'rotate-180')} />}
        </>
      )}
    </div>
  );

  if (isEmBreve) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="w-full text-left cursor-default opacity-70"
              aria-disabled
            >
              {inner}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label} — disponível em breve</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (hasSubmenu) {
    return (
      <div className="space-y-1">
        <button type="button" onClick={() => setOpenSubmenu((v) => !v)} className="w-full text-left">
          {inner}
        </button>
        {!collapsed && openSubmenu && (
          <div className="ml-8 space-y-1">
            {item.submenu.map((s) => {
              const subActive = pathname === s.to || pathname.startsWith(s.to + '/');
              return s.routeExists === false ? (
                <span key={s.to} className="block text-xs text-muted px-3 py-1.5 opacity-60">
                  {s.label} (em breve)
                </span>
              ) : (
                <Link
                  key={s.to}
                  to={s.to}
                  onClick={onNavigate}
                  className={cn(
                    'block text-xs px-3 py-1.5 rounded-md transition-colors',
                    subActive ? 'bg-card text-primary' : 'text-muted hover:text-foreground hover:bg-card'
                  )}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link to={item.to} onClick={onNavigate} aria-current={isActive ? 'page' : undefined}>
      {inner}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CircleDot,
  MessageSquare,
  Music,
  DollarSign,
  HeartHandshake,
  BookOpen,
  Calendar,
  Church,
  Settings,
  ChevronLeft,
  Mic2,
  BookMarked,
  GraduationCap,
  Boxes,
  HandHeart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/members", icon: Users, label: "Membros" },
  { href: "/cells", icon: CircleDot, label: "Células" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/worship", icon: Music, label: "Louvor" },
  { href: "/finance", icon: DollarSign, label: "Finanças" },
  { href: "/prayer", icon: HeartHandshake, label: "Oração" },
  { href: "/sermons", icon: Mic2, label: "Sermões" },
  { href: "/devotional", icon: BookOpen, label: "Devocionais" },
  { href: "/studies", icon: GraduationCap, label: "Estudos" },
  { href: "/calendar", icon: Calendar, label: "Agenda" },
  { href: "/ministries", icon: Church, label: "Ministérios" },
  { href: "/volunteers", icon: HandHeart, label: "Voluntários" },
  { href: "/assets", icon: Boxes, label: "Patrimônio" },
  { href: "/social", icon: BookMarked, label: "Mural" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-xl font-bold text-primary">Kairos</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          <ChevronLeft
            className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </Link>
      </div>
    </aside>
  );
}

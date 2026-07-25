import {
  LayoutDashboard, Users, Home, Building2, Church, CalendarDays,
  Wallet, HeartHandshake, Mic2, HandHeart, Newspaper, MessageSquare,
  Sparkles, Cake, Settings, ShieldCheck, FileText, Crown,
} from 'lucide-react';

export const MENU_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/membros', label: 'Membros', icon: Users },
  { to: '/celulas', label: 'Células', icon: Home },
  { to: '/congregacoes', label: 'Congregações', icon: Building2 },
  { to: '/ministerios', label: 'Ministérios', icon: Church },
  { to: '/eventos', label: 'Eventos', icon: CalendarDays },
  { to: '/financas', label: 'Finanças', icon: Wallet },
  { to: '/oracao', label: 'Oração', icon: HeartHandshake },
  { to: '/sermoes', label: 'Sermões', icon: Mic2 },
  { to: '/voluntarios', label: 'Voluntários', icon: HandHeart },
  { to: '/mural', label: 'Mural', icon: Newspaper },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/kairos-ai', label: 'Kairos AI', icon: Sparkles },
  { to: '/aniversariantes', label: 'Aniversariantes', icon: Cake },
];

export const ADMIN_ITEMS = [
  { to: '/perfil', label: 'Meu Perfil', icon: Users, adminOnly: false },
  { to: '/importacao', label: 'Importar Membros', icon: FileText, adminOnly: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: ShieldCheck, adminOnly: true },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings, adminOnly: true },
  { to: '/admin/logs', label: 'Logs', icon: FileText, adminOnly: true },
  { to: '/privacidade', label: 'LGPD / Privacidade', icon: FileText, adminOnly: false },
];

// frontend/src/lib/constants.js
import {
  LayoutDashboard, Map, Cake, Users, Building2, Crown, UserCheck,
  Layers, Home, Church, CalendarDays, Radio, CalendarClock,
  Wallet, Package, Car, FolderKanban, FileText, BookOpen, Megaphone,
  BarChart3, Settings,
} from 'lucide-react';

// Estrutura: cada item { to, label, icon, somenteAdmin?, somenteMaster?, routeExists?: boolean }
// routeExists=false indica que a rota ainda não existe (Fases 2-4 criam) — Sidebar mostra como "Em breve"
export const MENU_GRUPOS = [
  {
    titulo: 'PAINEL',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, routeExists: true },
      { to: '/mapa-ministerial', label: 'Mapa Ministerial', icon: Map, routeExists: false },
      { to: '/aniversariantes', label: 'Aniversariantes', icon: Cake, routeExists: false },
    ],
  },
  {
    titulo: 'PESSOAS',
    items: [
      { to: '/membros', label: 'Membros', icon: Users, routeExists: true },
      { to: '/congregacoes', label: 'Congregações', icon: Building2, somenteAdmin: true, routeExists: true },
      { to: '/pastores', label: 'Pastores', icon: Crown, routeExists: false },
      { to: '/obreiros', label: 'Obreiros', icon: UserCheck, routeExists: true },
      { to: '/departamentos', label: 'Departamentos', icon: Layers, routeExists: false },
    ],
  },
  {
    titulo: 'VIDA ECLESIÁSTICA',
    items: [
      { to: '/celulas', label: 'Células', icon: Home, routeExists: false },
      { to: '/cultos', label: 'Cultos', icon: Church, routeExists: false },
      { to: '/eventos', label: 'Eventos', icon: CalendarDays, routeExists: false },
      { to: '/escalas', label: 'Escalas', icon: Radio, routeExists: false },
      { to: '/agenda', label: 'Agenda', icon: CalendarClock, routeExists: true },
    ],
  },
  {
    titulo: 'GESTÃO',
    items: [
      { to: '/financeiro', label: 'Financeiro', icon: Wallet, routeExists: false, submenu: [
        { to: '/financeiro/entradas', label: 'Entradas', routeExists: false },
        { to: '/financeiro/saidas', label: 'Saídas', routeExists: false },
        { to: '/financeiro/fluxo', label: 'Fluxo de Caixa', routeExists: false },
      ]},
      { to: '/patrimonio', label: 'Patrimônio', icon: Package, routeExists: true },
      { to: '/veiculos', label: 'Veículos', icon: Car, routeExists: false },
      { to: '/projetos', label: 'Projetos', icon: FolderKanban, routeExists: false },
      { to: '/documentos', label: 'Documentos', icon: FileText, routeExists: false },
      { to: '/biblioteca', label: 'Biblioteca', icon: BookOpen, routeExists: false },
      { to: '/comunicacao', label: 'Comunicação', icon: Megaphone, routeExists: false },
      { to: '/relatorios', label: 'Relatórios', icon: BarChart3, routeExists: false },
      { to: '/configuracoes', label: 'Configurações', icon: Settings, routeExists: false, somenteAdmin: true },
    ],
  },
];

// Itens administrativos herdados (mantidos do layout anterior)
export const MENU_ADMIN = [
  { to: '/perfil', label: 'Meu perfil', icon: Users, routeExists: true },
  { to: '/carteirinhas', label: 'Carteirinhas', icon: FileText, routeExists: true },
  { to: '/batismos', label: 'Batismos', icon: Church, routeExists: true },
  { to: '/importacao', label: 'Importar Membros', icon: FileText, somenteAdmin: true, routeExists: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, somenteAdmin: true, routeExists: true },
  { to: '/admin/configuracoes', label: 'Configurações Sistema', icon: Settings, somenteAdmin: true, routeExists: true },
  { to: '/admin/logs', label: 'Logs', icon: FileText, somenteAdmin: true, routeExists: true },
  { to: '/master/licenca', label: 'Licença', icon: Crown, somenteMaster: true, routeExists: true },
  { to: '/master/sistema', label: 'Sistema', icon: Settings, somenteMaster: true, routeExists: true },
  { to: '/privacidade', label: 'LGPD / Privacidade', icon: FileText, routeExists: true },
];

export function filtrarPorPerfis(grupos, { isAdmin, isMaster }) {
  return grupos
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => (!i.somenteAdmin || isAdmin) && (!i.somenteMaster || isMaster)
      ),
    }))
    .filter((g) => g.items.length > 0);
}
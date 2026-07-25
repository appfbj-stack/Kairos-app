import {
  Users, Building2, Crown, UserCheck, Layers, Church, CalendarDays,
  CalendarClock, Radio, Cake, Wallet, Package, FolderKanban,
  FileText, BookOpen, Heart,
} from 'lucide-react';
import DashboardCard from '../components/composite/dashboard/DashboardCard';
import Breadcrumb from '../components/composite/Breadcrumb';
import { useMockData } from '../mocks/hooks/useMockData';

export default function DashboardPrincipal() {
  const membros = useMockData('membros');
  const congregacoes = useMockData('congregacoes');
  const eventos = useMockData('eventos');
  const aniversariantes = useMockData('aniversariantes');

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anivMes = aniversariantes.filter(a => {
    const m = parseInt((a.dataNasc || '').split('-')[1]);
    return m === mesAtual;
  });

  const cards = [
    { icon: Users, label: 'Membros', value: membros.length.toLocaleString('pt-BR'), path: '/dashboard/membros', color: 'primary', trend: 12 },
    { icon: Building2, label: 'Congregações', value: congregacoes.length.toString(), path: '/dashboard/congregacoes', color: 'success', trend: 4 },
    { icon: Crown, label: 'Pastores', value: '80', path: '#', color: 'warning' },
    { icon: UserCheck, label: 'Obreiros', value: '250', path: '#', color: 'danger' },
    { icon: Layers, label: 'Departamentos', value: '50', path: '#', color: 'info' },
    { icon: Church, label: 'Cultos', value: '1.000', path: '#', color: 'violet' },
    { icon: CalendarDays, label: 'Eventos', value: eventos.length.toLocaleString('pt-BR'), path: '/dashboard/eventos', color: 'pink' },
    { icon: CalendarClock, label: 'Agenda', value: '—', path: '#', color: 'orange' },
    { icon: Radio, label: 'Escalas', value: '200', path: '#', color: 'primary' },
    { icon: Cake, label: 'Aniversariantes', value: anivMes.length.toString(), path: '/dashboard/aniversariantes', color: 'warning', trend: 8 },
    { icon: Wallet, label: 'Financeiro', value: 'R$ 1.2M', path: '/dashboard/financeiro', color: 'success' },
    { icon: Package, label: 'Patrimônio', value: '—', path: '#', color: 'info' },
    { icon: FolderKanban, label: 'Projetos', value: '—', path: '#', color: 'violet' },
    { icon: FileText, label: 'Documentos', value: '300', path: '#', color: 'orange' },
    { icon: BookOpen, label: 'Biblioteca', value: '—', path: '#', color: 'pink' },
    { icon: Heart, label: 'Pedidos de Oração', value: '—', path: '#', color: 'danger' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-bold text-foreground mt-1">Dashboard</h1>
        <p className="text-sm text-muted">Visão geral da igreja</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <DashboardCard key={i} icon={card.icon} label={card.label} value={card.value} trend={card.trend} path={card.path} color={card.color} />
        ))}
      </div>
    </div>
  );
}

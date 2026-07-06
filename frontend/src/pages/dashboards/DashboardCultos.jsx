import { Church, Users, CalendarDays, TrendingUp } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardCultos() {
  const cultos = useMockData('cultos');
  const realizados = cultos.filter(c => c.realizado);

  const porMes = [
    { label: 'Jul', value: cultos.filter(c => c.data?.startsWith('2025-07')).length },
    { label: 'Ago', value: cultos.filter(c => c.data?.startsWith('2025-08')).length },
    { label: 'Set', value: cultos.filter(c => c.data?.startsWith('2025-09')).length },
    { label: 'Out', value: cultos.filter(c => c.data?.startsWith('2025-10')).length },
    { label: 'Nov', value: cultos.filter(c => c.data?.startsWith('2025-11')).length },
    { label: 'Dez', value: cultos.filter(c => c.data?.startsWith('2025-12')).length },
  ];

  const columns = [
    { key: 'tema', label: 'Tema' },
    { key: 'data', label: 'Data' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'publico', label: 'Público' },
    { key: 'realizado', label: 'Status', render: (v) => v ? 'Realizado' : 'Previsto' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Cultos" subtitle="Acompanhamento de cultos">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Cultos" value={cultos.length} icon={Church} color="primary" />
        <KpiCard label="Realizados" value={realizados.length} variation={92} icon={CalendarDays} color="success" />
        <KpiCard label="Total Público" value={cultos.reduce((s, c) => s + (c.publico || 0), 0)} icon={Users} color="info" />
        <KpiCard label="Média por Culto" value={cultos.length ? Math.round(cultos.reduce((s, c) => s + c.publico, 0) / cultos.length) : 0} icon={TrendingUp} color="warning" />
      </div>
      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Cultos por Mês</h3>
        <ChartBar data={porMes} color="var(--color-primary)" />
      </div>
      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Últimos Cultos</h3>
        <DataTable columns={columns} rows={cultos.slice(0, 30)} />
      </div>
    </DashboardTemplate>
  );
}

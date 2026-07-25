import { useMemo } from 'react';
import { CalendarDays, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardEventos() {
  const eventos = useMockData('eventos');
  const realizados = eventos.filter(e => e.realizado);
  const proximos = eventos.filter(e => !e.realizado);
  const totalParticipantes = realizados.reduce((s, e) => s + (e.participantes || 0), 0);

  const porTipo = useMemo(() => {
    const map = {};
    eventos.forEach(e => { map[e.tipo] = (map[e.tipo] || 0) + 1; });
    const cores = ['var(--color-primary)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)', 'var(--color-chart-7)'];
    return Object.entries(map).slice(0, 6).map(([k, v], i) => ({ label: k, value: v, color: cores[i] }));
  }, [eventos]);

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'data', label: 'Data' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'participantes', label: 'Participantes' },
    { key: 'realizado', label: 'Status', render: (v) => v ? 'Realizado' : 'Previsto' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Eventos" subtitle="Acompanhamento de eventos e atividades">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Eventos (ano)" value={eventos.length} icon={CalendarDays} color="primary" />
        <KpiCard label="Próximos 30 dias" value={proximos.length} icon={TrendingUp} color="info" />
        <KpiCard label="Realizados" value={realizados.length} variation={95} icon={CheckCircle2} color="success" />
        <KpiCard label="Média Participantes" value={realizados.length ? Math.round(totalParticipantes / realizados.length) : 0} icon={Users} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Eventos por Tipo</h3>
          <ChartDonut data={porTipo} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Próximos Eventos</h3>
          <DataTable columns={columns} rows={proximos.slice(0, 20)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

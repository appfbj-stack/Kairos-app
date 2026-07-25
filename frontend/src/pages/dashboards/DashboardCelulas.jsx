import { Home, Users, CalendarDays, Activity } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardCelulas() {
  const celulas = useMockData('celulas');
  const ativas = celulas.filter(c => c.ativa);

  const porDia = [
    { label: 'Domingo', value: celulas.filter(c => c.diaReuniao === 'Domingo').length, color: 'var(--color-primary)' },
    { label: 'Segunda', value: celulas.filter(c => c.diaReuniao === 'Segunda').length, color: 'var(--color-chart-2)' },
    { label: 'Terça', value: celulas.filter(c => c.diaReuniao === 'Terça').length, color: 'var(--color-chart-3)' },
    { label: 'Quarta', value: celulas.filter(c => c.diaReuniao === 'Quarta').length, color: 'var(--color-chart-4)' },
    { label: 'Quinta', value: celulas.filter(c => c.diaReuniao === 'Quinta').length, color: 'var(--color-chart-5)' },
    { label: 'Sexta', value: celulas.filter(c => c.diaReuniao === 'Sexta').length, color: 'var(--color-chart-6)' },
    { label: 'Sábado', value: celulas.filter(c => c.diaReuniao === 'Sábado').length, color: 'var(--color-chart-7)' },
  ];

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'lider', label: 'Líder' },
    { key: 'bairro', label: 'Bairro' },
    { key: 'diaReuniao', label: 'Dia' },
    { key: 'participantes', label: 'Participantes' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Células" subtitle="Análise das células">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Células" value={celulas.length} icon={Home} color="primary" />
        <KpiCard label="Ativas" value={ativas.length} variation={5.4} icon={Activity} color="success" />
        <KpiCard label="Total Participantes" value={celulas.reduce((s, c) => s + (c.participantes || 0), 0)} icon={Users} color="info" />
        <KpiCard label="Média por Célula" value={celulas.length ? Math.round(celulas.reduce((s, c) => s + c.participantes, 0) / celulas.length) : 0} icon={CalendarDays} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Reuniões por Dia</h3>
          <ChartDonut data={porDia} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Células</h3>
          <DataTable columns={columns} rows={celulas} pageSize={8} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

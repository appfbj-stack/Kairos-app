import { Radio, Users, CalendarDays, Activity } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardEscalas() {
  const escalas = useMockData('escalas');
  const ativas = escalas.filter(e => e.ativa);

  const porTipo = [
    { label: 'Louvor', value: escalas.filter(e => e.tipo === 'louvor').length, color: 'var(--color-primary)' },
    { label: 'Pregação', value: escalas.filter(e => e.tipo === 'pregação').length, color: 'var(--color-chart-2)' },
    { label: 'Intercessão', value: escalas.filter(e => e.tipo === 'intercessão').length, color: 'var(--color-chart-3)' },
    { label: 'Recepcionistas', value: escalas.filter(e => e.tipo === 'recepcionista').length, color: 'var(--color-chart-4)' },
    { label: 'Outros', value: escalas.filter(e => !['louvor','pregação','intercessão','recepcionista'].includes(e.tipo)).length, color: 'var(--color-chart-5)' },
  ];

  const columns = [
    { key: 'membro', label: 'Membro' },
    { key: 'tipo', label: 'Função' },
    { key: 'data', label: 'Data' },
    { key: 'ativa', label: 'Status', render: (v) => v ? 'Ativa' : 'Inativa' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Escalas" subtitle="Escalas e ministérios">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Escalas" value={escalas.length} icon={Radio} color="primary" />
        <KpiCard label="Ativas" value={ativas.length} icon={Activity} color="success" />
        <KpiCard label="Pessoas Envolvidas" value={new Set(escalas.map(e => e.membro)).size} icon={Users} color="info" />
        <KpiCard label="Próximos 7 dias" value={escalas.filter(e => e.ativa).length} icon={CalendarDays} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Tipo</h3>
          <ChartDonut data={porTipo} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Escalas</h3>
          <DataTable columns={columns} rows={escalas.slice(0, 30)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

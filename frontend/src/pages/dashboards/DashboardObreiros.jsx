import { UserCheck, Activity, Users, Award } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardObreiros() {
  const obreiros = useMockData('obreiros');
  const ativos = obreiros.filter(o => o.ativo);

  const porFuncao = [
    { label: 'Líderes', value: obreiros.filter(o => o.funcao === 'lider').length, color: 'var(--color-primary)' },
    { label: 'Auxiliares', value: obreiros.filter(o => o.funcao === 'auxiliar').length, color: 'var(--color-chart-2)' },
    { label: 'Professores', value: obreiros.filter(o => o.funcao === 'professor').length, color: 'var(--color-chart-3)' },
    { label: 'Outros', value: obreiros.filter(o => !['lider','auxiliar','professor'].includes(o.funcao)).length, color: 'var(--color-chart-4)' },
  ];

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'funcao', label: 'Função' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'ativo', label: 'Status', render: (v) => v ? 'Ativo' : 'Inativo' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Obreiros" subtitle="Análise do corpo de obreiros">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Obreiros" value={obreiros.length} icon={UserCheck} color="primary" />
        <KpiCard label="Ativos" value={ativos.length} variation={6.8} icon={Activity} color="success" />
        <KpiCard label="Média por Cong." value={20} icon={Users} color="info" />
        <KpiCard label="Funções" value={4} icon={Award} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Função</h3>
          <ChartDonut data={porFuncao} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Obreiros</h3>
          <DataTable columns={columns} rows={obreiros.slice(0, 30)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

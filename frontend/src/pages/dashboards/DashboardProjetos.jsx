import { FolderKanban, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardProjetos() {
  const projetos = useMockData('projetos');
  const concluidos = projetos.filter(p => p.status === 'concluido');
  const emAndamento = projetos.filter(p => p.status === 'em_andamento');

  const porStatus = [
    { label: 'Concluídos', value: concluidos.length, color: 'var(--color-success)' },
    { label: 'Em Andamento', value: emAndamento.length, color: 'var(--color-primary)' },
    { label: 'Planejados', value: projetos.filter(p => p.status === 'planejado').length, color: 'var(--color-info)' },
    { label: 'Pausados', value: projetos.filter(p => p.status === 'pausado').length, color: 'var(--color-warning)' },
    { label: 'Cancelados', value: projetos.filter(p => p.status === 'cancelado').length, color: 'var(--color-danger)' },
  ];

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'status', label: 'Status' },
    { key: 'orcamento', label: 'Orçamento', format: (v) => `R$ ${(v || 0).toLocaleString('pt-BR')}` },
    { key: 'responsavel', label: 'Responsável' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Projetos" subtitle="Acompanhamento de projetos">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Projetos" value={projetos.length} icon={FolderKanban} color="primary" />
        <KpiCard label="Em Andamento" value={emAndamento.length} icon={Clock} color="info" />
        <KpiCard label="Concluídos" value={concluidos.length} variation={15} icon={CheckCircle2} color="success" />
        <KpiCard label="Orçamento Total" value={`R$ ${Math.round(projetos.reduce((s, p) => s + (p.orcamento || 0), 0) / 1000)}k`} icon={DollarSign} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Status</h3>
          <ChartDonut data={porStatus} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Projetos</h3>
          <DataTable columns={columns} rows={projetos} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

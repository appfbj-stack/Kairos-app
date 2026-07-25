import { Crown, Church, Users, MapPin } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardPastores() {
  const pastores = useMockData('pastores');
  const ativos = pastores.filter(p => p.ativo);

  const congregacoes = useMockData('congregacoes');
  const meses = ['Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr','Mai','Jun'];
  const crescimento = (congregacoes[0]?.crescimento12m || []).map((v, i) => ({ label: meses[i] || '', value: v }));

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'ativo', label: 'Status', render: (v) => v ? 'Ativo' : 'Inativo' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Pastores" subtitle="Análise do ministério pastoral">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Pastores" value={pastores.length} icon={Crown} color="primary" />
        <KpiCard label="Ativos" value={ativos.length} icon={Church} color="success" />
        <KpiCard label="Média por Cong." value={congregacoes.length ? (ativos.length / congregacoes.length).toFixed(1) : 0} icon={Users} color="info" />
        <KpiCard label="Cidades" value={new Set(pastores.map(p => p.cidade)).size} icon={MapPin} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Crescimento Geral</h3>
          <ChartBar data={crescimento} color="var(--color-primary)" />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Pastores</h3>
          <DataTable columns={columns} rows={pastores.slice(0, 20)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

import { Layers, Users, Activity, Home } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardDepartamentos() {
  const departamentos = useMockData('departamentos');
  const ativos = departamentos.filter(d => d.ativo);

  const porTipo = [
    { label: 'Música', value: departamentos.filter(d => d.tipo === 'musica').length, color: 'var(--color-primary)' },
    { label: 'Ensino', value: departamentos.filter(d => d.tipo === 'ensino').length, color: 'var(--color-chart-2)' },
    { label: 'Social', value: departamentos.filter(d => d.tipo === 'social').length, color: 'var(--color-chart-3)' },
    { label: 'Administrativo', value: departamentos.filter(d => d.tipo === 'adm').length, color: 'var(--color-chart-4)' },
    { label: 'Outros', value: departamentos.filter(d => !['musica','ensino','social','adm'].includes(d.tipo)).length, color: 'var(--color-chart-5)' },
  ];

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'membros', label: 'Membros' },
    { key: 'ativo', label: 'Status', render: (v) => v ? 'Ativo' : 'Inativo' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Departamentos" subtitle="Análise dos departamentos">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Deptos" value={departamentos.length} icon={Layers} color="primary" />
        <KpiCard label="Ativos" value={ativos.length} icon={Activity} color="success" />
        <KpiCard label="Total Membros" value={departamentos.reduce((s, d) => s + (d.membros || 0), 0)} icon={Users} color="info" />
        <KpiCard label="Média por Cong." value={departamentos.length ? Math.round(departamentos.length / 35) : 0} icon={Home} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Tipo</h3>
          <ChartDonut data={porTipo} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Departamentos</h3>
          <DataTable columns={columns} rows={departamentos.slice(0, 30)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

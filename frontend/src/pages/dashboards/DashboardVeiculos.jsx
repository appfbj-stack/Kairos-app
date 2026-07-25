import { Car, Wrench, Activity, MapPin } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardVeiculos() {
  const veiculos = useMockData('veiculos');
  const ativos = veiculos.filter(v => v.status === 'ativo');

  const porStatus = [
    { label: 'Ativos', value: ativos.length, color: 'var(--color-success)' },
    { label: 'Manutenção', value: veiculos.filter(v => v.status === 'manutenção').length, color: 'var(--color-warning)' },
    { label: 'Inativos', value: veiculos.filter(v => v.status === 'inativo').length, color: 'var(--color-danger)' },
  ];

  const columns = [
    { key: 'modelo', label: 'Modelo' },
    { key: 'placa', label: 'Placa' },
    { key: 'ano', label: 'Ano' },
    { key: 'km', label: 'KM', format: (v) => `${(v || 0).toLocaleString('pt-BR')} km` },
    { key: 'status', label: 'Status' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Veículos" subtitle="Frota da igreja">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Veículos" value={veiculos.length} icon={Car} color="primary" />
        <KpiCard label="Ativos" value={ativos.length} icon={Activity} color="success" />
        <KpiCard label="Em Manutenção" value={veiculos.filter(v => v.status === 'manutenção').length} icon={Wrench} color="warning" />
        <KpiCard label="KM Total" value={`${Math.round(veiculos.reduce((s, v) => s + (v.km || 0), 0) / 1000)}k`} icon={MapPin} color="info" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Status</h3>
          <ChartDonut data={porStatus} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Veículos</h3>
          <DataTable columns={columns} rows={veiculos} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

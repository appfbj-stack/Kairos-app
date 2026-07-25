import { Package, Wrench, DollarSign, Building2 } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardPatrimonio() {
  const patrimonio = useMockData('patrimonio');
  const valorTotal = patrimonio.reduce((s, p) => s + (p.valor || 0), 0);

  const porCategoria = (cats) => {
    const map = {};
    cats.forEach(p => { map[p.categoria] = (map[p.categoria] || 0) + 1; });
    const cores = ['var(--color-primary)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)'];
    return Object.entries(map).slice(0, 6).map(([k, v], i) => ({ label: k, value: v, color: cores[i] }));
  };

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'valor', label: 'Valor', format: (v) => `R$ ${(v || 0).toLocaleString('pt-BR')}` },
    { key: 'estado', label: 'Estado' },
    { key: 'localizacao', label: 'Local' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Patrimônio" subtitle="Gestão de bens e equipamentos">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Itens" value={patrimonio.length} icon={Package} color="primary" />
        <KpiCard label="Valor Total" value={`R$ ${(valorTotal / 1000).toFixed(0)}k`} icon={DollarSign} color="success" />
        <KpiCard label="Em Manutenção" value={patrimonio.filter(p => p.estado === 'danificado').length} icon={Wrench} color="danger" />
        <KpiCard label="Locais" value={new Set(patrimonio.map(p => p.localizacao)).size} icon={Building2} color="info" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Categoria</h3>
          <ChartDonut data={porCategoria(patrimonio)} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Itens</h3>
          <DataTable columns={columns} rows={patrimonio.slice(0, 30)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

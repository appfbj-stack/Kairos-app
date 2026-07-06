import { Megaphone, Eye, Users, Clock } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardComunicacao() {
  const comunicacao = useMockData('comunicacao');
  const publicados = comunicacao.filter(c => c.status === 'publicado');

  const porTipo = Object.entries(comunicacao.reduce((acc, c) => {
    const mes = (c.data || '').slice(5, 7);
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {})).slice(-6).map(([k, v]) => ({ label: k, value: v }));

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'data', label: 'Data' },
    { key: 'autor', label: 'Autor' },
    { key: 'visualizacoes', label: 'Visualizações' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Comunicação" subtitle="Comunicados e avisos">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Comunicados" value={comunicacao.length} icon={Megaphone} color="primary" />
        <KpiCard label="Publicados" value={publicados.length} icon={Eye} color="success" />
        <KpiCard label="Visualizações Total" value={comunicacao.reduce((s, c) => s + (c.visualizacoes || 0), 0)} icon={Users} color="info" />
        <KpiCard label="Novos (mês)" value={publicados.length} icon={Clock} color="warning" />
      </div>
      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Comunicados por Mês</h3>
        <ChartBar data={porTipo} color="var(--color-primary)" />
      </div>
      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Comunicados</h3>
        <DataTable columns={columns} rows={comunicacao.slice(0, 30)} />
      </div>
    </DashboardTemplate>
  );
}

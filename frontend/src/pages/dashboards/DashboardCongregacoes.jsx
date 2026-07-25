import { useMemo } from 'react';
import { Building2, TrendingUp, Users, FileText } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import ChartLine from '../../components/composite/dashboard/ChartLine';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardCongregacoes() {
  const congregacoes = useMockData('congregacoes');

  const maiorCrescimento = congregacoes.length ? Math.max(...congregacoes.map(c => c.crescimento12m?.slice(-1)[0] || 0)) : 0;
  const totalMembrosCong = congregacoes.reduce((s, c) => s + (c.membrosCount || 0), 0);

  const porUF = useMemo(() => {
    const map = {};
    congregacoes.forEach(c => { map[c.uf] = (map[c.uf] || 0) + 1; });
    const cores = { SP: 'var(--color-primary)', RJ: 'var(--color-chart-2)', MG: 'var(--color-chart-3)', PR: 'var(--color-chart-4)', BA: 'var(--color-chart-5)' };
    return Object.entries(map).map(([k, v]) => ({ label: k, value: v, color: cores[k] || 'var(--color-muted)' }));
  }, [congregacoes]);

  const crescimentoTotal = (congregacoes[0]?.crescimento12m || []).map((_, i) => ({
    label: ['Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr','Mai','Jun'][i] || '',
    value: congregacoes.reduce((s, c) => s + ((c.crescimento12m || [])[i] || 0), 0),
  }));

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'cidade', label: 'Cidade', render: (v, r) => `${r.cidade}/${r.uf}` },
    { key: 'membrosCount', label: 'Membros' },
    { key: 'departamentosAtivos', label: 'Deptos' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Congregações" subtitle="Análise de todas as congregações">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Congregações" value={congregacoes.length} variation={4.2} icon={Building2} color="primary" />
        <KpiCard label="Média Membros" value={congregacoes.length ? Math.round(totalMembrosCong / congregacoes.length) : 0} variation={2.1} icon={Users} color="success" />
        <KpiCard label="Maior Crescimento" value={maiorCrescimento} icon={TrendingUp} color="info" />
        <KpiCard label="Com Relatório" value={`${Math.round(congregacoes.length * 0.85)}/${congregacoes.length}`} icon={FileText} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Crescimento Total (12 meses)</h3>
          <ChartLine data={crescimentoTotal} color="var(--color-primary)" fill />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Estado</h3>
          <ChartDonut data={porUF} />
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Todas as Congregações</h3>
        <DataTable columns={columns} rows={congregacoes} />
      </div>
    </DashboardTemplate>
  );
}

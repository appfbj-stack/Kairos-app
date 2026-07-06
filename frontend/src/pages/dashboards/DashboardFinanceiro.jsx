import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardFinanceiro() {
  const congregacoes = useMockData('congregacoes');
  const financeiro = useMockData('financeiro');

  const totalEntradas = congregacoes.reduce((s, c) => s + (c.financeiro?.entradas || 0), 0);
  const totalSaidas = congregacoes.reduce((s, c) => s + (c.financeiro?.saidas || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  const entradas = financeiro.filter(f => f.tipo === 'entrada');
  const saidas = financeiro.filter(f => f.tipo === 'saida');

  const gastosPorCat = useMemo(() => {
    const map = {};
    saidas.forEach(s => { map[s.categoria] = (map[s.categoria] || 0) + s.valor; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const cores = ['var(--color-danger)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)'];
    return sorted.map(([k, v], i) => ({ label: k, value: Math.round(v / 1000), color: cores[i] }));
  }, [saidas]);

  const receitasPorCat = useMemo(() => {
    const map = {};
    entradas.forEach(e => { map[e.categoria] = (map[e.categoria] || 0) + e.valor; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const cores = ['var(--color-success)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)'];
    return sorted.map(([k, v], i) => ({ label: k, value: Math.round(v / 1000), color: cores[i] }));
  }, [entradas]);

  const columns = [
    { key: 'descricao', label: 'Descrição' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'valor', label: 'Valor', format: (v) => `R$ ${(v || 0).toLocaleString('pt-BR')}` },
    { key: 'data', label: 'Data' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <DashboardTemplate title="Dashboard Financeiro" subtitle="Análise financeira consolidada">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Entradas (ano)" value={`R$ ${(totalEntradas / 1000).toFixed(0)}k`} variation={8.5} icon={TrendingUp} color="success" />
        <KpiCard label="Saídas (ano)" value={`R$ ${(totalSaidas / 1000).toFixed(0)}k`} variation={-3.2} icon={TrendingDown} color="danger" />
        <KpiCard label="Saldo" value={`R$ ${(saldo / 1000).toFixed(0)}k`} variation={saldo > 0 ? 15.3 : -5.1} icon={Wallet} color={saldo > 0 ? 'success' : 'danger'} />
        <KpiCard label="Total Movimentações" value={financeiro.length} icon={DollarSign} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Gastos por Categoria (k R$)</h3>
          <ChartDonut data={gastosPorCat} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Receitas por Categoria (k R$)</h3>
          <ChartDonut data={receitasPorCat} />
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Últimas Movimentações</h3>
        <DataTable columns={columns} rows={financeiro.slice(0, 50)} pageSize={8} />
      </div>
    </DashboardTemplate>
  );
}

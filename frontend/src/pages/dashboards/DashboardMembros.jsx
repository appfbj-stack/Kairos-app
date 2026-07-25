import { useMemo } from 'react';
import { Users, UserPlus, Activity, Heart } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardMembros() {
  const membros = useMockData('membros');
  const congregacoes = useMockData('congregacoes');

  const ativos = membros.filter(m => m.status === 'ativo');
  const novos = membros.filter(m => m.status === 'novo');
  const batizados = membros.filter(m => m.batizado);

  const sexoCount = useMemo(() => {
    const m = membros.filter(x => x.sexo === 'M').length;
    return [
      { label: 'Masculino', value: m, color: 'var(--color-primary)' },
      { label: 'Feminino', value: membros.length - m, color: 'var(--color-chart-2)' },
    ];
  }, [membros]);

  const meses = ['Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr','Mai','Jun'];
  const crescimento = (congregacoes[0]?.crescimento12m || []).map((v, i) => ({ label: meses[i] || '', value: v }));

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'sexo', label: 'Sexo' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Membros" subtitle="Análise completa do cenário de membros">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Membros" value={membros.length.toLocaleString('pt-BR')} variation={12.5} icon={Users} color="primary" />
        <KpiCard label="Ativos" value={ativos.length.toLocaleString('pt-BR')} variation={5.2} icon={Activity} color="success" />
        <KpiCard label="Novos (este mês)" value={novos.length} variation={8.1} icon={UserPlus} color="info" />
        <KpiCard label="Batizados" value={batizados.length.toLocaleString('pt-BR')} variation={3.4} icon={Heart} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Crescimento (12 meses)</h3>
          <ChartBar data={crescimento} color="var(--color-primary)" />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Sexo</h3>
          <ChartDonut data={sexoCount} />
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Últimos Membros</h3>
        <DataTable columns={columns} rows={membros.slice(0, 50)} />
      </div>
    </DashboardTemplate>
  );
}

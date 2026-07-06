// frontend/src/pages/DashboardPlaceholder.jsx
import { Users, Building2, Crown, UserCheck } from 'lucide-react';
import StatCard from '../components/composite/StatCard';
import EmptyState from '../components/composite/EmptyState';
import { Map } from 'lucide-react';
import { useMockData } from '../mocks/hooks/useMockData';

export default function DashboardPlaceholder() {
  const membros = useMockData('membros');
  const congregacoes = useMockData('congregacoes');
  const pastores = useMockData('pastores');
  const obreiros = useMockData('obreiros');

  const membrosAtivos = membros.filter((m) => m.status === 'ativo').length;
  const membrosNovos = membros.filter((m) => m.status === 'novo').length;
  const membrosBatizados = membros.filter((m) => m.batizado).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Visão geral — App Sede Igreja (Fase 1: fundação)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Membros"
          value={membros.length}
          description={`${membrosAtivos} ativos · ${membrosNovos} novos`}
          trend={{ value: 12.5, direction: 'up' }}
          sparklineData={congregacoes[0]?.crescimento12m || []}
          accent="primary"
        />
        <StatCard
          icon={Building2}
          title="Congregações"
          value={congregacoes.length}
          description="Sede + filiais"
          trend={{ value: 4.2, direction: 'up' }}
          sparklineData={congregacoes[1]?.crescimento12m || []}
          accent="success"
        />
        <StatCard
          icon={Crown}
          title="Pastores"
          value={pastores.length}
          description="Ministros ativos"
          trend={{ value: 2.1, direction: 'up' }}
          sparklineData={congregacoes[2]?.crescimento12m || []}
          accent="warning"
        />
        <StatCard
          icon={UserCheck}
          title="Obreiros"
          value={obreiros.length}
          description={`${obreiros.filter((o) => o.ativo).length} ativos`}
          trend={{ value: 8.7, direction: 'up' }}
          sparklineData={congregacoes[3]?.crescimento12m || []}
          accent="danger"
        />
      </div>

      <EmptyState
        icon={Map}
        title="Mapa Ministerial — em breve"
        description="Painel estratégico com todas as congregações, crescimento, batismos, visitantes, departamentos ativos e saúde ministerial. Será construído na Fase 2."
      />

      <div className="rounded-card border border-border bg-card p-4">
        <p className="text-sm text-muted">
          Batizados: <span className="text-foreground font-medium">{membrosBatizados}</span> de {membros.length} membros.
        </p>
      </div>
    </div>
  );
}

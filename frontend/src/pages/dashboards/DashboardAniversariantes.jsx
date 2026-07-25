import { useMemo } from 'react';
import { Cake, Calendar, Users, Gift } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardAniversariantes() {
  const aniversariantes = useMockData('aniversariantes');
  const hoje = useMemo(() => new Date(), []);
  const mesAtual = hoje.getMonth() + 1;

  const hojeAniv = useMemo(() => aniversariantes.filter(a => {
    const m = parseInt((a.dataNasc || '').split('-')[1]);
    const d = parseInt((a.dataNasc || '').split('-')[2]);
    return m === mesAtual && d === hoje.getDate();
  }), [aniversariantes, mesAtual, hoje]);

  const mesAniv = useMemo(() => aniversariantes.filter(a => {
    const m = parseInt((a.dataNasc || '').split('-')[1]);
    return m === mesAtual;
  }), [aniversariantes, mesAtual]);

  const porMes = useMemo(() => {
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const counts = Array(12).fill(0);
    aniversariantes.forEach(a => {
      const m = parseInt((a.dataNasc || '').split('-')[1]);
      if (m >= 1 && m <= 12) counts[m - 1]++;
    });
    return meses.map((label, i) => ({ label, value: counts[i] }));
  }, [aniversariantes]);

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'dataNasc', label: 'Data de Nascimento' },
    { key: 'idadeFutura', label: 'Idade' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Aniversariantes" subtitle="Acompanhamento de aniversários">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Aniversariantes Hoje" value={hojeAniv.length} icon={Gift} color="warning" />
        <KpiCard label="Este Mês" value={mesAniv.length} icon={Cake} color="primary" />
        <KpiCard label="Total Cadastrados" value={aniversariantes.length} icon={Users} color="info" />
        <KpiCard label="Média por Mês" value={Math.round(aniversariantes.length / 12)} icon={Calendar} color="success" />
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Aniversariantes por Mês</h3>
        <ChartBar data={porMes} color="var(--color-warning)" />
      </div>

      {mesAniv.length > 0 && (
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Aniversariantes deste mês</h3>
          <DataTable columns={columns} rows={mesAniv} />
        </div>
      )}
    </DashboardTemplate>
  );
}

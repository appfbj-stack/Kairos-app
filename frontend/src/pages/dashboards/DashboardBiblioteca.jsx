import { BookOpen, BookMarked, Book, TrendingUp } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardBiblioteca() {
  const biblioteca = useMockData('biblioteca');
  const disponiveis = biblioteca.filter(b => b.status === 'disponivel');
  const emprestados = biblioteca.filter(b => b.status === 'emprestado');

  const porCategoria = [
    { label: 'Teologia', value: biblioteca.filter(b => b.categoria === 'Teologia').length, color: 'var(--color-primary)' },
    { label: 'História', value: biblioteca.filter(b => b.categoria === 'História da Igreja').length, color: 'var(--color-chart-2)' },
    { label: 'Devocional', value: biblioteca.filter(b => b.categoria === 'Devocional').length, color: 'var(--color-chart-3)' },
    { label: 'Família', value: biblioteca.filter(b => b.categoria === 'Família').length, color: 'var(--color-chart-4)' },
    { label: 'Outros', value: biblioteca.filter(b => !['Teologia','História da Igreja','Devocional','Família'].includes(b.categoria)).length, color: 'var(--color-chart-5)' },
  ];

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'autor', label: 'Autor' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'status', label: 'Status' },
    { key: 'emprestimosAno', label: 'Empréstimos/ano' },
  ];

  return (
    <DashboardTemplate title="Dashboard da Biblioteca" subtitle="Acervo bibliográfico">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Livros" value={biblioteca.length} icon={BookOpen} color="primary" />
        <KpiCard label="Disponíveis" value={disponiveis.length} icon={Book} color="success" />
        <KpiCard label="Emprestados" value={emprestados.length} icon={BookMarked} color="warning" />
        <KpiCard label="Total Empréstimos" value={biblioteca.reduce((s, b) => s + (b.emprestimosAno || 0), 0)} icon={TrendingUp} color="info" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Categoria</h3>
          <ChartDonut data={porCategoria} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Acervo</h3>
          <DataTable columns={columns} rows={biblioteca.slice(0, 30)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

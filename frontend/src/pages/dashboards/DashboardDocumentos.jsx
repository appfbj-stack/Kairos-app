import { FileText, File, FileCheck, Users } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardDocumentos() {
  const documentos = useMockData('documentos');

  const porTipo = [
    { label: 'Relatórios', value: documentos.filter(d => d.tipo === 'relatorio').length, color: 'var(--color-primary)' },
    { label: 'Ofícios', value: documentos.filter(d => d.tipo === 'oficio').length, color: 'var(--color-chart-2)' },
    { label: 'Contratos', value: documentos.filter(d => d.tipo === 'contrato').length, color: 'var(--color-chart-3)' },
    { label: 'Atas', value: documentos.filter(d => d.tipo === 'ata').length, color: 'var(--color-chart-4)' },
    { label: 'Outros', value: documentos.filter(d => !['relatorio','oficio','contrato','ata'].includes(d.tipo)).length, color: 'var(--color-chart-5)' },
  ];

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'data', label: 'Data' },
    { key: 'autor', label: 'Autor' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Documentos" subtitle="Gestão documental">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Documentos" value={documentos.length} icon={FileText} color="primary" />
        <KpiCard label="Relatórios" value={documentos.filter(d => d.tipo === 'relatorio').length} icon={File} color="success" />
        <KpiCard label="Contratos" value={documentos.filter(d => d.tipo === 'contrato').length} icon={FileCheck} color="info" />
        <KpiCard label="Autores" value={new Set(documentos.map(d => d.autor)).size} icon={Users} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Tipo</h3>
          <ChartDonut data={porTipo} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Documentos</h3>
          <DataTable columns={columns} rows={documentos.slice(0, 30)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

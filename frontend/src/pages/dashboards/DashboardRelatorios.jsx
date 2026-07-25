import { BarChart3, Printer, Download, FileSpreadsheet } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import { Button } from '../../components/ui/button';

export default function DashboardRelatorios() {
  return (
    <DashboardTemplate title="Dashboard de Relatórios" subtitle="Exportação e impressão de relatórios">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Relatórios Disponíveis" value="8" icon={BarChart3} color="primary" />
        <KpiCard label="Exportações (mês)" value="—" icon={Download} color="info" />
        <KpiCard label="Impressões (mês)" value="—" icon={Printer} color="warning" />
        <KpiCard label="Formatos" value="3" icon={FileSpreadsheet} color="success" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {['Membros','Congregações','Financeiro','Eventos','Aniversariantes','Cultos','Patrimônio','Projetos'].map((r) => (
          <div key={r} className="rounded-card border border-border bg-card p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{r}</span>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="rounded-card border border-border bg-card p-4">
        <p className="text-sm text-muted">
          Relatórios completos com exportação PDF, Excel e impressão estarão disponíveis em futura atualização.
          Atualmente é possível imprimir cada relatório individualmente.
        </p>
      </div>
    </DashboardTemplate>
  );
}

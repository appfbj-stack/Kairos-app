import PeriodFilter from '../../components/composite/dashboard/PeriodFilter';
import ExportButton from '../../components/composite/dashboard/ExportButton';
import Breadcrumb from '../../components/composite/Breadcrumb';

export default function DashboardTemplate({ title, subtitle, children, periodo, onPeriodoChange }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb />
          <h1 className="text-2xl font-bold text-foreground mt-1">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={periodo} onChange={onPeriodoChange} />
          <ExportButton />
        </div>
      </div>
      {children}
    </div>
  );
}

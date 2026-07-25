import { useState } from 'react';
import { Building2, TrendingUp, Users, Heart } from 'lucide-react';
import Breadcrumb from '../components/composite/Breadcrumb';
import KpiCard from '../components/composite/dashboard/KpiCard';
import MapaView from '../components/mapa/MapaView';
import CongregacaoCard from '../components/mapa/CongregacaoCard';
import { useMockData } from '../mocks/hooks/useMockData';

export default function MapaMinisterial() {
  const congregacoes = useMockData('congregacoes');
  const [selected, setSelected] = useState(null);

  const totalBatismos = congregacoes.reduce((s, c) => s + (c.batismos12mTotal || 0), 0);
  const totalVisitantes = congregacoes.reduce((s, c) => s + ((c.visitantes12m || []).reduce((a, b) => a + b, 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-bold text-foreground mt-1">Mapa Ministerial</h1>
        <p className="text-sm text-muted">Painel estratégico de todas as congregações</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Congregações" value={congregacoes.length} icon={Building2} color="primary" />
        <KpiCard label="Total Membros" value={congregacoes.reduce((s, c) => s + (c.membrosCount || 0), 0)} icon={Users} color="success" />
        <KpiCard label="Batismos (12m)" value={totalBatismos} variation={7.3} icon={Heart} color="warning" />
        <KpiCard label="Visitantes (12m)" value={totalVisitantes} icon={TrendingUp} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-card border border-border bg-card p-2" style={{ minHeight: 500 }}>
          <MapaView congregacoes={congregacoes} onSelect={setSelected} />
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-foreground px-1">Congregações</h3>
          {congregacoes.slice(0, 20).map(c => (
            <CongregacaoCard key={c.id} congregacao={c} selected={selected} onClick={setSelected} />
          ))}
        </div>
      </div>
    </div>
  );
}

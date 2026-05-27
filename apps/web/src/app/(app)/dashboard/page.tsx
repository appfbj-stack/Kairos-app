import { createServerClient } from "@/lib/supabase/server";
import { Users, CircleDot, DollarSign, HeartHandshake, TrendingUp, Calendar } from "lucide-react";

const stats = [
  { label: "Membros Ativos", value: "—", icon: Users, color: "text-blue-500" },
  { label: "Células", value: "—", icon: CircleDot, color: "text-green-500" },
  { label: "Ofertas do Mês", value: "R$ —", icon: DollarSign, color: "text-yellow-500" },
  { label: "Pedidos de Oração", value: "—", icon: HeartHandshake, color: "text-pink-500" },
  { label: "Crescimento", value: "—%", icon: TrendingUp, color: "text-purple-500" },
  { label: "Próximos Eventos", value: "—", icon: Calendar, color: "text-orange-500" },
];

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const churchName = user?.user_metadata?.["church_name"] ?? "Minha Igreja";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
        <p className="text-muted-foreground">{churchName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-accent ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Kairos AI</h2>
        <div className="bg-muted/50 rounded-lg p-4 text-muted-foreground text-sm">
          <p>Como posso ajudar sua igreja hoje?</p>
          <p className="text-xs mt-1">IA pastoral disponível em breve...</p>
        </div>
      </div>
    </div>
  );
}

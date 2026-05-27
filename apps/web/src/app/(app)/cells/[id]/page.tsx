import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Clock, MapPin, Pencil } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Célula — Kairos" };

export default async function CellDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: cell } = await supabase
    .from("cells")
    .select(`*, leader:members!leader_id(name, email, phone)`)
    .eq("id", id).single();

  if (!cell) notFound();

  const leader = Array.isArray(cell.leader) ? cell.leader[0] : cell.leader;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/cells" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{cell.name}</h1>
          <p className="text-muted-foreground text-sm">Detalhes da célula</p>
        </div>
        <Link href={`/cells/${id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors">
          <Pencil className="w-4 h-4" />
          Editar
        </Link>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Informações</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full ${cell.active ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-gray-500/20 text-gray-500"}`}>
            {cell.active ? "Ativa" : "Inativa"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Líder</p>
              <p className="text-sm font-medium">{leader?.name ?? "Sem líder"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Reunião</p>
              <p className="text-sm font-medium">{cell.meeting_day} às {cell.meeting_time}</p>
            </div>
          </div>
          {cell.address && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 col-span-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="text-sm font-medium">{cell.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

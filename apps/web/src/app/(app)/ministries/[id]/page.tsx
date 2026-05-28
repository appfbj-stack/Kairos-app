import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Pencil } from "lucide-react";
import Link from "next/link";

export default async function MinistryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: ministry } = await supabase
    .from("ministries")
    .select("*, leader:members!leader_id(name, email)")
    .eq("id", id)
    .single();

  if (!ministry) notFound();

  const { data: ministryMembers } = await supabase
    .from("ministry_members")
    .select("*, member:members!member_id(id, name, avatar_url, status)")
    .eq("ministry_id", id)
    .order("created_at");

  const leader = Array.isArray(ministry.leader) ? ministry.leader[0] : ministry.leader;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/ministries" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{ministry.name}</h1>
          <p className="text-muted-foreground text-sm">
            {(ministryMembers?.length ?? 0)} membros
          </p>
        </div>
        <Link
          href={`/ministries/${id}/edit`}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </Link>
      </div>

      {/* Info card */}
      <div className="bg-card border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: ministry.color ?? "#7C3AED" }}
          >
            {ministry.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold">{ministry.name}</h2>
            {leader && <p className="text-xs text-muted-foreground">Líder: {leader.name}</p>}
          </div>
        </div>
        {ministry.description && (
          <p className="text-sm text-muted-foreground">{ministry.description}</p>
        )}
      </div>

      {/* Membros */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Membros do Ministério
          </h2>
        </div>
        {!ministryMembers?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum membro neste ministério ainda</p>
        ) : (
          <div className="space-y-2">
            {ministryMembers.map((mm) => {
              const member = Array.isArray(mm.member) ? mm.member[0] : mm.member;
              return (
                <div key={mm.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {member?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <p className="text-sm font-medium">{member?.name ?? "—"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{mm.role}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

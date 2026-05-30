import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("users")
    .select("role, name, avatar_url, church_id")
    .eq("id", user.id)
    .single();

  // Auto-fix: se o perfil não tem church_id, cria a church e corrige o perfil
  if (!profile?.church_id) {
    const churchName = (user.user_metadata?.["church_name"] as string | undefined) ?? "Minha Igreja";
    const userName = (user.user_metadata?.["name"] as string | undefined) ?? user.email?.split("@")[0] ?? "Admin";
    const slug = churchName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 8);

    // Cria a church
    const { data: church } = await supabase
      .from("churches")
      .insert({ name: churchName, slug, plan: "free", created_by: user.id })
      .select("id").single();

    if (church?.id) {
      if (profile) {
        // Atualiza perfil existente
        await supabase.from("users")
          .update({ church_id: church.id, name: userName })
          .eq("id", user.id);
      } else {
        // Cria novo perfil
        await supabase.from("users").insert({
          id: user.id,
          church_id: church.id,
          email: user.email ?? "",
          name: userName,
          role: "church_admin",
          created_by: user.id,
        });
      }
      // Busca o perfil atualizado
      const { data: updatedProfile } = await supabase
        .from("users").select("role, name, avatar_url, church_id").eq("id", user.id).single();
      profile = updatedProfile;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar role={profile?.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

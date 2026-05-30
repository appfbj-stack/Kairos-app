import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Garante perfil atômico via RPC (criada em migration 019)
  await supabase.rpc("create_missing_profile", {
    p_user_id: user.id,
    p_email: user.email ?? "",
    p_name: (user.user_metadata?.["name"] as string) ?? user.email?.split("@")[0] ?? "Usuário",
    p_church_name: (user.user_metadata?.["church_name"] as string) ?? "Minha Igreja",
  });

  const { data: profile } = await supabase
    .from("users")
    .select("role, name, avatar_url, church_id")
    .eq("id", user.id)
    .single();

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

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AiClient } from "./ai-client";

export default async function AiPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, church_id")
    .eq("id", user.id)
    .maybeSingle() as { data: { name?: string; role?: string; church_id?: string } | null };

  const churchName = user?.user_metadata?.["church_name"] ?? "Minha Igreja";

  return (
    <AiClient
      churchName={churchName}
      userName={profile?.name ?? user?.email ?? "Usuário"}
      userRole={profile?.role ?? "member"}
    />
  );
}

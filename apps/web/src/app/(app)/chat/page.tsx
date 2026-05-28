import { createServerClient } from "@/lib/supabase/server";
import { ChatClient } from "./chat-client";

export const metadata = { title: "Chat — Kairos" };

export default async function ChatPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: church }] = await Promise.all([
    supabase.from("users").select("name, role, church_id").eq("id", user?.id ?? "").single(),
    supabase.from("users").select("church_id").eq("id", user?.id ?? "").single(),
  ]);

  const churchData = profile?.church_id
    ? (await supabase.from("churches").select("name").eq("id", profile.church_id).single()).data
    : null;

  return (
    <ChatClient
      currentUserId={user?.id ?? ""}
      churchName={churchData?.name ?? "Kairos"}
      userName={profile?.name ?? ""}
      userRole={profile?.role ?? "member"}
    />
  );
}

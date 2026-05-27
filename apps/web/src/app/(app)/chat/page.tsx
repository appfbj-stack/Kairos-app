import { createServerClient } from "@/lib/supabase/server";
import { ChatClient } from "./chat-client";

export const metadata = { title: "Chat — Kairos" };

export default async function ChatPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <ChatClient currentUserId={user?.id ?? ""} />;
}

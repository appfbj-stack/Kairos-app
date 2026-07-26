import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { kairosAI, type AIModule, type KairosContext } from "@kairos/services-ai";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("church_id, role")
    .eq("id", user.id)
    .maybeSingle() as { data: { church_id?: string; role?: string } | null };

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json() as {
    messages?: Array<{ role: "user" | "assistant"; content: string }>;
    context?: { activeModule?: string };
  };
  const messages = body.messages ?? [];
  const lastMessage = messages.at(-1);
  if (!lastMessage) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
  const history = messages.slice(0, -1);

  const { data: church } = profile.church_id
    ? await supabase.from("churches").select("name").eq("id", profile.church_id).maybeSingle() as { data: { name?: string } | null }
    : { data: null };

  const content = await kairosAI(lastMessage.content, {
    churchName: church?.name ?? "Kairos",
    userName: user.email ?? undefined,
    userRole: profile.role,
    activeModule: (body.context?.activeModule ?? "chat") as AIModule,
    activeModules: [] as string[],
    history,
  } as KairosContext, "chat");

  return NextResponse.json({ content });
}

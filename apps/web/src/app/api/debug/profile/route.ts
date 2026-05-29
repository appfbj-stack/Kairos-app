import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/debug/profile — mostra o status do perfil do usuário logado
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado", authError });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: church, error: churchError } = profile?.church_id
    ? await supabase.from("churches").select("id, name, slug").eq("id", profile.church_id).single()
    : { data: null, error: null };

  return NextResponse.json({
    user: { id: user.id, email: user.email, created_at: user.created_at },
    profile: profile ?? null,
    profileError: profileError?.message ?? null,
    church: church ?? null,
    churchError: churchError?.message ?? null,
    status: {
      hasProfile: !!profile,
      hasChurchId: !!profile?.church_id,
      hasChurch: !!church,
    },
  });
}

// POST /api/debug/profile — cria/corrige o perfil do usuário se estiver faltando
export async function POST() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verifica se já tem perfil com church_id
  const { data: existing } = await supabase
    .from("users")
    .select("id, church_id")
    .eq("id", user.id)
    .single();

  if (existing?.church_id) {
    return NextResponse.json({ message: "Perfil já está correto", church_id: existing.church_id });
  }

  // Cria a church se não existe
  const churchName = user.user_metadata?.["church_name"] ?? "Minha Igreja";
  const slug = churchName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 8);

  const { data: church, error: churchError } = await supabase
    .from("churches")
    .insert({ name: churchName, slug, plan: "free", created_by: user.id })
    .select().single();

  if (churchError) {
    return NextResponse.json({ error: "Erro ao criar igreja", details: churchError.message }, { status: 500 });
  }

  // Cria ou atualiza o perfil
  const userName = user.user_metadata?.["name"] ?? user.email?.split("@")[0] ?? "Admin";

  if (existing) {
    // Atualiza church_id no perfil existente
    const { error: updateError } = await supabase
      .from("users")
      .update({ church_id: church.id, name: userName })
      .eq("id", user.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  } else {
    // Cria novo perfil
    const { error: insertError } = await supabase
      .from("users")
      .insert({ id: user.id, church_id: church.id, email: user.email ?? "", name: userName, role: "church_admin", created_by: user.id });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Perfil corrigido com sucesso!", church_id: church.id, church_name: church.name });
}

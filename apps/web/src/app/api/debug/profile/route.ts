import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users").select("id, church_id, name, role, email").eq("id", user.id).single();

  const { data: church } = profile?.church_id
    ? await supabase.from("churches").select("id, name, slug").eq("id", profile.church_id).single()
    : { data: null };

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile ?? null,
    profileError: profileError?.message ?? null,
    church: church ?? null,
    hasProfile: !!profile,
    hasChurchId: !!profile?.church_id,
    hasChurch: !!church,
  });
}

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const churchName = user.user_metadata?.["church_name"] ?? "Minha Igreja";
  const userName = user.user_metadata?.["name"] ?? user.email?.split("@")[0] ?? "Admin";

  // Chama a função SECURITY DEFINER que bypassa RLS
  const { data, error } = await supabase.rpc("create_missing_profile", {
    p_user_id: user.id,
    p_email: user.email ?? "",
    p_name: userName,
    p_church_name: churchName,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

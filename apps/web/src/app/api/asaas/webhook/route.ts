import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, payment } = body;

    console.log("[Asaas Webhook]", event, payment?.id);

    if (!event || !payment) {
      return NextResponse.json({ ok: true });
    }

    const externalRef = payment.externalReference;
    if (!externalRef) return NextResponse.json({ ok: true });

    // externalRef formato: "church_id:plan_slug"
    const [churchId, planSlug] = externalRef.split(":");
    if (!churchId) return NextResponse.json({ ok: true });

    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      // Buscar o plano
      const { data: plan } = await supabaseAdmin
        .from("plans")
        .select("id, slug")
        .eq("slug", planSlug || "silver")
        .single();

      if (plan) {
        // Atualizar assinatura para ativo
        await supabaseAdmin
          .from("church_subscriptions")
          .upsert({
            church_id: churchId,
            plan_id: plan.id,
            status: "active",
            asaas_subscription_id: payment.subscription || null,
            asaas_customer_id: payment.customer || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "church_id" });

        // Atualizar plano na tabela churches
        await supabaseAdmin
          .from("churches")
          .update({ plan: plan.slug })
          .eq("id", churchId);
      }
    }

    if (event === "PAYMENT_OVERDUE" || event === "PAYMENT_CANCELED" || event === "SUBSCRIPTION_CANCELED") {
      // Reverter para plano gratuito
      const { data: freePlan } = await supabaseAdmin
        .from("plans")
        .select("id")
        .eq("slug", "free")
        .single();

      if (freePlan) {
        await supabaseAdmin
          .from("church_subscriptions")
          .update({ plan_id: freePlan.id, status: "inactive", updated_at: new Date().toISOString() })
          .eq("church_id", churchId);

        await supabaseAdmin
          .from("churches")
          .update({ plan: "free" })
          .eq("id", churchId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Asaas Webhook Error]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

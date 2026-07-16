import { createServerClient } from "@/lib/supabase/server";
import { CongregationsClient } from "./congregations-client";

export const metadata = { title: "Congregações — Kairos" };

export default async function CongregationsPage() {
  const supabase = await createServerClient();

  const { data: congregations } = await supabase
    .from("congregations")
    .select("*")
    .order("name");

  return <CongregationsClient congregations={congregations ?? []} />;
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { autoLogin, captureAccessKeyFromUrl, getToken } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Ja tem sessao -> chat.
    if (getToken()) {
      router.replace("/chat");
      return;
    }
    // Entrada direta: pega a chave da URL (?k=) e tenta o auto-login.
    captureAccessKeyFromUrl();
    autoLogin()
      .then(() => router.replace("/chat"))
      .catch((e) => {
        setErro(e?.message || "Sem acesso");
        router.replace("/login");
      });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-kairos-ink">
      <p className="text-sm text-slate-500">Entrando...</p>
    </main>
  );
}

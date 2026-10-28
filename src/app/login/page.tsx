"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  autoLogin,
  captureAccessKeyFromUrl,
  getAccessKey,
  getToken,
  setAccessKey,
} from "@/lib/auth";

// SEM LOGIN. O app entra direto (auto-login). Esta tela existe so como
// fallback: se o device nao tem a chave de acesso (e o IP nao esta na
// allowlist do backend), pede o codigo e tenta de novo.
export default function LoginPage() {
  const router = useRouter();
  const [chave, setChave] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [tentando, setTentando] = useState(true);

  useEffect(() => {
    if (getToken()) {
      router.replace("/chat");
      return;
    }
    captureAccessKeyFromUrl();
    setChave(getAccessKey() || "");
    autoLogin()
      .then(() => router.replace("/chat"))
      .catch((e) => {
        setErro(e?.message || "Sem acesso");
        setTentando(false);
      });
  }, [router]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const k = chave.trim();
    if (!k) {
      setErro("Informe o codigo de acesso");
      return;
    }
    setAccessKey(k);
    try {
      await autoLogin();
      router.replace("/chat");
    } catch (err: any) {
      setAccessKey(null);
      setErro(err?.message || "Codigo invalido");
      setTentando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kairos-deep via-kairos-base to-kairos-deep px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/95 backdrop-blur p-7 shadow-2xl">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-kairos-deep text-kairos-neon font-bold text-xl mb-3">K</div>
          <h1 className="text-2xl font-bold text-kairos-deep">Kairós</h1>
          <p className="text-sm text-slate-500 mt-1">Seu assistente pessoal</p>
        </div>

        {tentando ? (
          <p className="text-sm text-center text-slate-500 py-6">Entrando...</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 text-center mb-4">
              Este dispositivo ainda nao tem acesso. Use o codigo de acesso
              ou abra o link completo de convite.
            </p>
            <form onSubmit={entrar} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Codigo de acesso
                </label>
                <input
                  value={chave}
                  onChange={(e) => setChave(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-kairos-bright focus:border-transparent outline-none"
                  placeholder="cole o codigo aqui"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              {erro && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{erro}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-kairos-bright text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Entrar
              </button>
            </form>
          </>
        )}

        <p className="text-xs text-center text-slate-400 mt-5">
          10 dias de trial gratis. Sem cartao.
        </p>
      </div>
    </main>
  );
}

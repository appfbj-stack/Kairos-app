// Auth helpers: token em localStorage (MVP) — em produção trocar por cookie httpOnly setado pelo backend.
const KEY = "kairos_client_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(KEY, t);
  else localStorage.removeItem(KEY);
}

export interface Client {
  id: string;
  email: string;
  name: string;
  status: string;
  trialEndsAt: string | null;
  // Token cap (plano FREE/BASIC/PRO/ULTRA)
  plan: "FREE" | "BASIC" | "PRO" | "ULTRA" | string;
  usageLimit: number;
  usageUsed: number;
  periodType: "DAILY" | "MONTHLY" | string;
  // Tokens (legado)
  tokensLimit: number;
  tokensUsed: number;
}

// ---------------------------------------------------------------------------
// Modo acesso direto (sem login): a chave vem da URL (?k=...) ou fica salva
// no device. O backend aceita ?key=<AUTO_LOGIN_SECRET> e devolve um token da
// conta demo. Sem chave, o backend ainda aceita IP na allowlist.
// ---------------------------------------------------------------------------
const KEYSTORE = "kairos_access_key";

export function getAccessKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYSTORE);
}

export function setAccessKey(k: string | null) {
  if (typeof window === "undefined") return;
  if (k) localStorage.setItem(KEYSTORE, k);
  else localStorage.removeItem(KEYSTORE);
}

/** Le ?k= da URL, guarda no device e tira da URL (não deixa vazar no histórico). */
export function captureAccessKeyFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const u = new URL(window.location.href);
  const k = u.searchParams.get("k");
  if (k) {
    setAccessKey(k);
    u.searchParams.delete("k");
    window.history.replaceState({}, "", u.pathname + (u.search || "") + u.hash);
  }
  return k;
}

/** Entra direto e devolve o client. Lança se o backend recusar. */
export async function autoLogin(): Promise<Client> {
  const key = getAccessKey();
  const path = key
    ? `/api/pwa/auth/auto-login?key=${encodeURIComponent(key)}`
    : `/api/pwa/auth/auto-login`;
  const r = await api<{ token: string; client: Client }>(path);
  setToken(r.token);
  return r.client;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(path, { ...init, headers });
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try {
      const j = await r.json();
      msg = j.error || msg;
    } catch {}
    throw new Error(msg);
  }
  if (r.status === 204) return undefined as T;
  return r.json();
}

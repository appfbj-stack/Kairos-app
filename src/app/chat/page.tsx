"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getToken, setToken, type Client } from "@/lib/auth";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: string;
  // Banner gerado pelo Kairós (intent create_banner): mostra preview inline
  bannerUrl?: string;
  bannerTitle?: string;
  bannerVerse?: string;
}
interface Conv { id: string; title: string; updatedAt: string; }

export default function ChatPage() {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [conv, setConv] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractingPdf, setExtractingPdf] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    api<{ client: Client }>("/api/pwa/auth/me").then((r) => setClient(r.client)).catch(() => {
      setToken(null); router.replace("/login");
    });
  }, [router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function ensureConv() {
    if (conv) return conv;
    const r = await api<{ conversation: Conv }>("/api/pwa/conversations", { method: "POST", body: "{}" });
    setConv(r.conversation);
    return r.conversation;
  }

  async function handlePdfUpload(file: File) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Apenas PDF");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("PDF maior que 20MB");
      return;
    }
    setExtractingPdf(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const tok = getToken();
      const r = await fetch("/api/pwa/pdf/extract", {
        method: "POST",
        headers: tok ? { Authorization: `Bearer ${tok}` } : undefined,
        body: fd,
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`HTTP ${r.status}: ${t.slice(0, 200)}`);
      }
      const j = await r.json();
      const header = j.info?.Title
        ? `[PDF: ${j.filename} (${j.numPages} pag) - ${j.info.Title}]\n\n`
        : `[PDF: ${j.filename} (${j.numPages} pag)]\n\n`;
      const truncatedNote = j.truncated ? "\n\n[texto truncado em 50k chars]" : "";
      setInput((prev) => prev
        ? `${prev}\n\n${header}${j.text}${truncatedNote}`
        : `${header}${j.text}${truncatedNote}`);
    } catch (err: any) {
      setError(err?.message || "Falha ao extrair PDF");
    } finally {
      setExtractingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (streaming) return;
    const text = input.trim();
    if (!text) return;

    setInput("");
    setError(null);

    const c = await ensureConv();
    const tempUser: Msg = { id: "tmp-" + Date.now(), role: "user", content: text };
    const tempAssistant: Msg = { id: "tmp-a-" + Date.now(), role: "assistant", content: "", status: "pending" };
    setMessages((m) => [...m, tempUser, tempAssistant]);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const resp = await fetch(`/api/pwa/conversations/${c.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ content: text }),
        signal: ctrl.signal,
      });
      if (!resp.ok || !resp.body) {
        const t = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status}: ${t.slice(0, 200)}`);
      }
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let accum = "";
      const assistantId = tempAssistant.id;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          for (const line of block.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            try {
              const json = JSON.parse(data);
              // delta de texto
              if (json.delta) {
                accum += json.delta;
                setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: accum, status: "streaming" } : x)));
              }
              // intent-result (banner, reminder, expense) — adiciona cards na conversa
              if (json.results && Array.isArray(json.results)) {
                for (const r of json.results) {
                  if (r.kind === "banner_created" && r.dataUrl) {
                    setMessages((m) => [
                      ...m,
                      {
                        id: "banner-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
                        role: "assistant",
                        content: `🎨 ${r.title || r.topic}${r.verse ? `\n${r.verse}` : ""}`,
                        bannerUrl: r.dataUrl,
                        bannerTitle: r.title,
                        bannerVerse: r.verse,
                        bannerFormat: r.format || "post",
                      } as any,
                    ]);
                  }
                }
              }
            } catch {}
          }
        }
      }
      setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, status: "done" } : x)));
    } catch (err: any) {
      if (err?.name !== "AbortError") setError(err?.message || "Erro");
      setMessages((m) => m.map((x) => (x.role === "assistant" && x.status === "pending" ? { ...x, content: x.content || "(erro)", status: "error" } : x)));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function logout() {
    api("/api/pwa/auth/logout", { method: "POST" }).finally(() => {
      setToken(null);
      router.replace("/login");
    });
  }

  const canSend = !streaming && input.trim().length > 0;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-kairos-deep text-kairos-neon flex items-center justify-center font-bold">K</div>
          <div>
            <h1 className="text-sm font-semibold text-kairos-deep">Kair&oacute;s</h1>
            <p className="text-[10px] text-slate-500">{client?.email || "..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {client && (
            <span className="text-slate-500 flex items-center gap-1.5">
              <span>
                <strong className="text-kairos-deep">{client.usageUsed}</strong>
                {" / "}
                <span className="text-slate-400">{client.usageLimit}</span>
                {" msgs"}
                {client.periodType === "DAILY" && <span className="text-slate-400"> /dia</span>}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide ${
                  client.plan === "FREE"
                    ? "bg-slate-200 text-slate-600"
                    : client.plan === "BASIC"
                      ? "bg-blue-100 text-blue-700"
                      : client.plan === "PRO"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                }`}
                title={`Plano ${client.plan}`}
              >
                {client.plan}
              </span>
            </span>
          )}
          <Link href="/history" className="text-kairos-bright hover:underline">Historico</Link>
          <button onClick={logout} className="text-slate-400 hover:text-red-500">Sair</button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 max-w-2xl w-full mx-auto space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-20">
            <p className="text-lg font-semibold text-kairos-deep mb-2">Ola, eu sou o Kairos</p>
            <p>Pergunte o que quiser. Pra gerar imagem, escreva: <em>&quot;cria um banner sobre paz&quot;</em> ou <em>&quot;cria um reel sobre fé&quot;</em></p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                m.role === "user"
                  ? "bg-kairos-bright text-white rounded-br-sm"
                  : m.status === "error"
                    ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm"
                    : "bg-white text-kairos-ink border border-slate-200 rounded-bl-sm shadow-sm"
              }`}
            >
              {/* Banner gerado aparece grande com botao de download */}
              {m.bannerUrl && (
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <a href={m.bannerUrl} download={`banner-${m.id}.png`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={m.bannerUrl}
                      alt={m.bannerTitle || "Banner gerado"}
                      className="w-full max-w-sm rounded-lg border border-white/40 cursor-pointer hover:opacity-95"
                    />
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/80">
                    <a
                      href={m.bannerUrl}
                      download={`banner-${m.id}.png`}
                      className="underline"
                    >
                      Baixar PNG
                    </a>
                    <span>{(m as any).bannerFormat === "reel" ? "1080x1920 (Reel)" : "1080x1350 (Post)"}</span>
                  </div>
                </div>
              )}
              {m.content || (m.status === "pending" ? "..." : "")}
            </div>
          </div>
        ))}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">
            {error}
            {error.includes("LLM_API_KEY") && <p className="text-xs mt-1 text-red-500">A API de IA ainda nao foi configurada pelo administrador.</p>}
          </div>
        )}
      </div>

      <form onSubmit={send} className="border-t border-slate-200 bg-white px-3 py-3 flex gap-2 max-w-2xl w-full mx-auto">
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
          disabled={extractingPdf || streaming}
        />
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          disabled={extractingPdf || streaming}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-kairos-bright hover:border-kairos-bright disabled:opacity-40"
          aria-label="Anexar PDF"
          title={extractingPdf ? "Extraindo texto..." : "Anexar PDF (extrai texto)"}
        >
          {extractingPdf ? (
            <svg width="20" height="20" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="40 60"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="14" y2="17"/>
            </svg>
          )}
        </button>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo, peça um banner/reel ou anexe um PDF..."
          disabled={streaming}
          className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-kairos-bright"
        />
        <button
          type="submit" disabled={!canSend}
          className="px-4 py-2.5 bg-kairos-bright text-white rounded-xl font-semibold disabled:opacity-50"
        >
          {streaming ? "..." : "Enviar"}
        </button>
      </form>
    </main>
  );
}

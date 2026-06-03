/**
 * Kairos AI — serviço central de inteligência artificial
 *
 * Provider principal: OpenRouter com DeepSeek (free tier, sem rate limit agressivo)
 * Fallback 1: OpenRouter com Llama 3 (free)
 * Fallback 2: Gemini direto (limitado a 15 req/min no free tier)
 */

export type AIModule =
  | "chat" | "social" | "devotional" | "support" | "calendar"hh
  | "sermon" | "studies" | "office" | "finance";

export interface KairosContext {
  churchName: string;
  userName?: string;
  userRole?: string;
  activeModule?: AIModule;
  activeModules?: string[];
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface KairosMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── System Prompt ───────────────────────────────────────────────────────────

export function buildSystemPrompt(ctx: KairosContext): string {
  return `Você é a Kairos AI, assistente oficial da ${ctx.churchName}.

IDENTIDADE
Seu nome é Kairos. Responda com acolhimento, sabedoria e amor cristão.
Tom: amigável, pastoral, direto e encorajador. Idioma: português brasileiro.

CONTEXTO
Usuário: ${ctx.userName ?? "Visitante"} | Papel: ${ctx.userRole ?? "membro"}

REGRAS
1. Sempre em português brasileiro.
2. Máximo 3 parágrafos no chat, mais detalhado em estudos/sermões.
3. Use linguagem bíblica natural em temas pastorais.
4. Nunca invente dados.
5. Use emojis com moderação (1-2 por mensagem).

ESPECIALIDADES
- Sermões, esboços e devocionais
- Postagens para redes sociais da igreja
- Comunicados e cartas pastorais
- Dúvidas sobre membros, células e ministérios
- Apoio à gestão financeira
- Planos de leitura e estudos bíblicos
- Orações e reflexões bíblicas`;
}

// ─── Provider: OpenRouter ─────────────────────────────────────────────────────

async function callOpenRouter(
  model: string,
  system: string,
  messages: KairosMessage[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://kairos.fbautomacao.space",
      "X-Title": "Kairos AI",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(25_000),
  });

  const data = await res.json() as {
    choices?: Array<{ message: { content: string } }>;
    error?: { message: string };
  };

  if (!res.ok || data.error) {
    throw new Error(`OpenRouter ${model} error ${res.status}: ${data.error?.message ?? res.statusText}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`OpenRouter ${model}: resposta vazia`);
  return content;
}

// ─── Provider: Gemini direto (fallback apenas) ────────────────────────────────

async function callGemini(model: string, system: string, messages: KairosMessage[]): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY não configurada");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
      signal: AbortSignal.timeout(20_000),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${model} error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini ${model}: resposta vazia`);
  return text;
}

// ─── Função principal com cadeia de fallback ──────────────────────────────────

export async function kairosAI(
  userMessage: string,
  ctx: KairosContext,
  module: AIModule = "chat"
): Promise<string> {
  const system = buildSystemPrompt({ ...ctx, activeModule: module });
  const history = ctx.history ?? [];
  const messages: KairosMessage[] = [...history, { role: "user", content: userMessage }];

  // ── 1. DeepSeek via OpenRouter (free, principal) ──────────────────────────
  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await callOpenRouter("openai/gpt-oss-120b:free", system, messages);
    } catch (e1) {
      console.warn("DeepSeek free falhou, tentando Llama:", e1);

      // ── 2. Llama 3 via OpenRouter (free, fallback) ────────────────────────
      try {
        return await callOpenRouter("meta-llama/llama-3.1-8b-instruct:free", system, messages);
      } catch (e2) {
        console.warn("Llama free falhou, tentando Gemini Flash via OpenRouter:", e2);

        // ── 3. Gemini 2.0 via OpenRouter (fallback) ───────────────────────
        try {
          return await callOpenRouter("google/gemini-2.0-flash-001", system, messages);
        } catch (e3) {
          console.warn("Gemini via OpenRouter falhou:", e3);
        }
      }
    }
  }

  // ── 4. Gemini direto (último recurso — pode ter rate limit 429) ───────────
  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      return await callGemini("gemini-1.5-flash-latest", system, messages);
    } catch (e) {
      console.warn("Gemini direto falhou:", e);
    }
  }

  throw new Error("IA temporariamente indisponível. Tente novamente em instantes.");
}

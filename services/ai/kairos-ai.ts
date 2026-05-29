/**
 * Kairos AI — serviço central de inteligência artificial
 *
 * Roteamento por módulo:
 *   Chat/Social/Devocional → google/gemini-flash-1.5 (via OpenRouter)
 *   Sermão/Estudos/Docs    → deepseek/deepseek-chat  (via OpenRouter)
 *
 * Cadeia de fallback:
 *   OpenRouter (principal) → Gemini direto → DeepSeek direto → erro
 */

export type AIModule =
  | "chat"
  | "social"
  | "devotional"
  | "support"
  | "calendar"
  | "sermon"
  | "studies"
  | "office"
  | "finance";

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

// ─── Modelos por tipo de tarefa ──────────────────────────────────────────────

const FAST_MODULES: AIModule[] = ["chat", "social", "devotional", "support", "calendar"];

/** Retorna o modelo OpenRouter ideal para cada tipo de tarefa */
function openRouterModel(module: AIModule): string {
  return FAST_MODULES.includes(module)
    ? "google/gemini-flash-1.5"   // rápido, gratuito, 1M ctx
    : "deepseek/deepseek-chat";   // raciocínio longo e documentos
}

// ─── System Prompt ───────────────────────────────────────────────────────────

export function buildSystemPrompt(ctx: KairosContext): string {
  return `Você é a Kairos AI, assistente oficial da ${ctx.churchName}.

IDENTIDADE
Seu nome é Kairos. Responda com acolhimento, sabedoria e amor cristão.
Tom: amigável, pastoral, direto e encorajador.
Idioma: português brasileiro.

CONTEXTO
Nome do usuário: ${ctx.userName ?? "Visitante"}
Papel: ${ctx.userRole ?? "member"}
Módulo ativo: ${ctx.activeModule ?? "geral"}
Módulos da igreja: ${ctx.activeModules?.join(", ") ?? "todos"}

REGRAS
1. Responda sempre em português brasileiro.
2. Seja objetivo e prático (máx. 3 parágrafos no chat).
3. Use linguagem bíblica natural em temas pastorais.
4. Nunca invente dados — use apenas o contexto fornecido.
5. Se não souber, diga e sugira falar com um líder.
6. Use emojis com moderação (1-2 por mensagem).
7. Termine com bênção ou encorajamento quando adequado.

ESPECIALIDADES
- Sermões, esboços e devocionais
- Postagens para redes sociais da igreja
- Comunicados, avisos e cartas pastorais
- Dúvidas sobre membros, células e ministérios
- Apoio à gestão financeira com linguagem pastoral
- Planos de leitura e estudos bíblicos
- Suporte ao uso da plataforma Kairos
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
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://kairos.app",
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
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${model} error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

// ─── Provider: Gemini direto (fallback) ──────────────────────────────────────

async function callGemini(
  model: "gemini-1.5-flash" | "gemini-1.5-flash-8b",
  system: string,
  messages: KairosMessage[]
): Promise<string> {
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
      signal: AbortSignal.timeout(15_000),
    }
  );

  if (!res.ok) throw new Error(`Gemini ${model} error: ${res.status}`);
  const data = await res.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };
  return data.candidates[0]?.content.parts[0]?.text ?? "";
}

// ─── Provider: DeepSeek direto (fallback) ────────────────────────────────────

async function callDeepSeek(system: string, messages: KairosMessage[]): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY não configurada");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`);
  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message.content ?? "";
}

// ─── Função principal com cadeia de fallback ──────────────────────────────────

export async function kairosAI(
  userMessage: string,
  ctx: KairosContext,
  module: AIModule = "chat"
): Promise<string> {
  const system = buildSystemPrompt({ ...ctx, activeModule: module });
  const history = ctx.history ?? [];
  const messages: KairosMessage[] = [
    ...history,
    { role: "user", content: userMessage },
  ];

  const orModel = openRouterModel(module);

  // 1. OpenRouter (principal — usa Gemini Flash ou DeepSeek por modelo)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await callOpenRouter(orModel, system, messages);
    } catch (e) {
      console.warn(`OpenRouter (${orModel}) falhou, tentando fallback:`, e);
    }
  }

  // 2. Gemini direto
  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      return await callGemini("gemini-1.5-flash", system, messages);
    } catch (e) {
      console.warn("Gemini Flash falhou, tentando 8B:", e);
      try {
        return await callGemini("gemini-1.5-flash-8b", system, messages);
      } catch (e2) {
        console.warn("Gemini 8B falhou:", e2);
      }
    }
  }

  // 3. DeepSeek direto
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      return await callDeepSeek(system, messages);
    } catch (e) {
      console.warn("DeepSeek falhou:", e);
    }
  }

  throw new Error(
    "Nenhum provider de IA disponível. Configure OPENROUTER_API_KEY no ambiente."
  );
}

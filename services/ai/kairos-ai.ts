/**
 * Kairos AI — serviço central de inteligência artificial
 * Roteamento: Gemini 1.5 Flash (principal) → Gemini 8B (fallback 1) → DeepSeek (fallback 2)
 */

export type AIModule =
  | "chat"       // Gemini Flash — rápido, gratuito
  | "social"     // Gemini Flash — postagens
  | "devotional" // Gemini Flash — devocional
  | "support"    // Gemini Flash — suporte
  | "calendar"   // Gemini Flash — agenda
  | "sermon"     // DeepSeek — raciocínio longo
  | "studies"    // DeepSeek — estudos bíblicos
  | "office"     // DeepSeek — documentos
  | "finance";   // DeepSeek — relatórios

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

// ─── Routing por módulo ─────────────────────────────────────────────────────

const GEMINI_MODULES: AIModule[] = ["chat", "social", "devotional", "support", "calendar"];
const DEEPSEEK_MODULES: AIModule[] = ["sermon", "studies", "office", "finance"];

function pickProvider(module: AIModule): "gemini" | "deepseek" {
  if (DEEPSEEK_MODULES.includes(module)) return "deepseek";
  return "gemini";
}

// ─── System Prompt ──────────────────────────────────────────────────────────

export function buildSystemPrompt(ctx: KairosContext): string {
  return `Você é a Kairos AI, assistente oficial da ${ctx.churchName}.

IDENTIDADE
Seu nome é Kairos. Responda sempre com acolhimento, sabedoria e amor cristão.
Tom: amigável, pastoral, direto e encorajador.
Idioma: português brasileiro.

CONTEXTO DO USUÁRIO
Nome: ${ctx.userName ?? "Visitante"}
Papel: ${ctx.userRole ?? "member"}
Módulo: ${ctx.activeModule ?? "geral"}
Módulos ativos: ${ctx.activeModules?.join(", ") ?? "todos"}

REGRAS OBRIGATÓRIAS
1. Responda sempre em português brasileiro.
2. Respostas devem ser objetivas e práticas (máx 3 parágrafos no chat).
3. Para temas pastorais, use linguagem bíblica natural.
4. Nunca invente dados — use apenas o contexto fornecido.
5. Se não souber, diga claramente e sugira falar com um líder.
6. Use emojis com moderação (1-2 por mensagem).
7. Termine com uma bênção ou encorajamento quando adequado.

ESPECIALIDADES
- Sermões, esboços e devocionais
- Postagens para redes sociais da igreja
- Comunicados, avisos e mensagens pastorais
- Dúvidas sobre membros, células e ministérios
- Apoio à gestão financeira com linguagem pastoral
- Planos de leitura e estudos bíblicos
- Suporte ao uso da plataforma Kairos
- Orações e reflexões bíblicas`;
}

// ─── Providers ──────────────────────────────────────────────────────────────

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

// ─── Função principal ────────────────────────────────────────────────────────

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

  const provider = pickProvider(module);

  // Cadeia de fallback: primário → Gemini 8B → DeepSeek → mensagem de erro
  if (provider === "gemini") {
    try {
      return await callGemini("gemini-1.5-flash", system, messages);
    } catch (e1) {
      console.warn("Gemini Flash falhou, tentando Flash-8B:", e1);
      try {
        return await callGemini("gemini-1.5-flash-8b", system, messages);
      } catch (e2) {
        console.warn("Gemini 8B falhou, tentando DeepSeek:", e2);
        try {
          return await callDeepSeek(system, messages);
        } catch (e3) {
          console.error("Todos os providers falharam:", e3);
          throw new Error("Serviço de IA temporariamente indisponível.");
        }
      }
    }
  } else {
    // DeepSeek primeiro, fallback Gemini
    try {
      return await callDeepSeek(system, messages);
    } catch (e1) {
      console.warn("DeepSeek falhou, tentando Gemini Flash:", e1);
      try {
        return await callGemini("gemini-1.5-flash", system, messages);
      } catch (e2) {
        console.error("Todos os providers falharam:", e2);
        throw new Error("Serviço de IA temporariamente indisponível.");
      }
    }
  }
}

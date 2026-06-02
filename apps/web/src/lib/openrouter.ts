// lib/openrouter.ts
// Modelos PAGOS do OpenRouter - https://openrouter.ai/models

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  promptPrice: number; // preço por 1M tokens de prompt
  completionPrice: number; // preço por 1M tokens de completion
  contextLength: number;
  category: "economy" | "standard" | "premium";
}

// Modelos PAGOS do OpenRouter (atualizados)
export const OPENROUTER_MODELS: OpenRouterModel[] = [
  // ========== ECONOMY (mais baratos) ==========
  {
    id: "qwen/qwen-2.5-7b-instruct",
    name: "Qwen 2.5 7B Instruct",
    description: "Modelo rápido e econômico da Alibaba. Bom para tarefas simples.",
    promptPrice: 0.14,
    completionPrice: 0.28,
    contextLength: 32768,
    category: "economy"
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct",
    name: "Llama 3.2 3B Instruct",
    description: "Modelo leve da Meta. Rápido e eficiente para tarefas básicas.",
    promptPrice: 0.05,
    completionPrice: 0.08,
    contextLength: 131072,
    category: "economy"
  },
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    description: "Modelo rápido do Google. Grande contexto (1M tokens).",
    promptPrice: 0.08,
    completionPrice: 0.30,
    contextLength: 1000000,
    category: "economy"
  },
  {
    id: "mistralai/mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    description: "Modelo base da Mistral. Bom custo-benefício.",
    promptPrice: 0.06,
    completionPrice: 0.06,
    contextLength: 32768,
    category: "economy"
  },

  // ========== STANDARD (balanceados) ==========
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Versão compacta do GPT-4o. Excelente qualidade/preço.",
    promptPrice: 0.15,
    completionPrice: 0.60,
    contextLength: 128000,
    category: "standard"
  },
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Modelo clássico da OpenAI. Rápido e confiável.",
    promptPrice: 0.50,
    completionPrice: 1.50,
    contextLength: 16385,
    category: "standard"
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    description: "Modelo rápido da Anthropic. Ótimo para chat.",
    promptPrice: 0.25,
    completionPrice: 1.25,
    contextLength: 200000,
    category: "standard"
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    description: "Modelo open-source da Meta. Grande contexto.",
    promptPrice: 0.06,
    completionPrice: 0.12,
    contextLength: 131072,
    category: "standard"
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    description: "Modelo avançado do Google. Até 2M tokens de contexto.",
    promptPrice: 1.25,
    completionPrice: 5.00,
    contextLength: 2000000,
    category: "standard"
  },
  {
    id: "mistralai/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B Instruct",
    description: "Modelo Mixture-of-Experts da Mistral. Muito capaz.",
    promptPrice: 0.24,
    completionPrice: 0.24,
    contextLength: 32768,
    category: "standard"
  },
  {
    id: "cohere/command-r",
    name: "Command R",
    description: "Modelo otimizado para RAG e tasks complexas.",
    promptPrice: 0.50,
    completionPrice: 1.50,
    contextLength: 128000,
    category: "standard"
  },

  // ========== PREMIUM (mais poderosos) ==========
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Modelo principal da OpenAI. Melhor qualidade geral.",
    promptPrice: 2.50,
    completionPrice: 10.00,
    contextLength: 128000,
    category: "premium"
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "GPT-4 otimizado. Excelente para tarefas complexas.",
    promptPrice: 10.00,
    completionPrice: 30.00,
    contextLength: 128000,
    category: "premium"
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Melhor modelo balanceado da Anthropic.",
    promptPrice: 3.00,
    completionPrice: 15.00,
    contextLength: 200000,
    category: "premium"
  },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    description: "Modelo mais poderoso da Anthropic. Raciocínio superior.",
    promptPrice: 15.00,
    completionPrice: 75.00,
    contextLength: 200000,
    category: "premium"
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B Instruct",
    description: "Maior modelo open-source da Meta. Alta qualidade.",
    promptPrice: 0.88,
    completionPrice: 0.88,
    contextLength: 131072,
    category: "premium"
  },
  {
    id: "meta-llama/llama-3.1-405b-instruct",
    name: "Llama 3.1 405B Instruct",
    description: "Flagship open-source. Rivaliza com GPT-4.",
    promptPrice: 3.50,
    completionPrice: 3.50,
    contextLength: 131072,
    category: "premium"
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V2 Chat",
    description: "Modelo chinês de alta qualidade. Ótimo custo-benefício premium.",
    promptPrice: 0.14,
    completionPrice: 0.28,
    contextLength: 128000,
    category: "premium"
  }
];

// Modelo padrão
export const DEFAULT_MODEL = "openai/gpt-4o-mini";

// Tipos
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Serviço OpenRouter
class OpenRouterService {
  private apiKey: string = "";
  private baseUrl: string = "https://openrouter.ai/api/v1";

  setApiKey(key: string) {
    this.apiKey = key.trim();
  }

  getApiKey(): string {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 10;
  }

  async chat(
    messages: ChatMessage[],
    model: string = DEFAULT_MODEL
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    if (!this.hasApiKey()) {
      return { success: false, error: "API Key não configurada. Acesse as configurações." };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
          "X-Title": "Kairos Church"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `Erro ${response.status}`
        };
      }

      return {
        success: true,
        content: data.choices?.[0]?.message?.content || ""
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Erro de conexão"
      };
    }
  }

  async askBibleQuestion(
    question: string,
    context: string,
    model: string = DEFAULT_MODEL
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    return this.chat([
      {
        role: "system",
        content: `Você é um assistente bíblico cristão chamado Kairos. Responda sempre em português do Brasil.
Seja respeitoso, claro e fundamentado na Palavra de Deus.
Use linguagem acessível para todos os públicos.

Contexto bíblico atual: ${context || "Nenhum contexto específico"}`
      },
      { role: "user", content: question }
    ], model);
  }

  async explainVerse(
    reference: string,
    verseText: string,
    model: string = DEFAULT_MODEL
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    return this.chat([
      {
        role: "system",
        content: `Você é um teólogo especialista em Bíblia. Explique o versículo de forma clara e prática.
Inclua: contexto histórico, significado principal e aplicação para hoje.
Responda em português do Brasil.`
      },
      {
        role: "user",
        content: `Explique o versículo: "${verseText}" (${reference})

Por favor forneça:
1. Contexto histórico
2. Significado principal
3. Aplicação prática
4. Versículos relacionados`
      }
    ], model);
  }
}

export const openRouterService = new OpenRouterService();

// Persistência local
export function saveApiKey(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("openrouter_api_key", key);
  }
}

export function loadApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("openrouter_api_key") || "";
  }
  return "";
}

export function saveSelectedModel(modelId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("openrouter_model", modelId);
  }
}

export function loadSelectedModel(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("openrouter_model") || DEFAULT_MODEL;
  }
  return DEFAULT_MODEL;
}

// Função auxiliar para formatar preço
export function formatPrice(price: number): string {
  if (price < 1) {
    return `$${(price * 1000).toFixed(2)}/1K tokens`;
  }
  return `$${price.toFixed(2)}/1M tokens`;
}

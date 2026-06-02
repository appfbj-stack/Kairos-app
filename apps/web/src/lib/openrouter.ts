// lib/openrouter.ts
// Serviço de integração com OpenRouter API

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricePer1k: string;
  category: "fast" | "balanced" | "powerful";
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Modelos disponíveis no OpenRouter (pagos)
export const OPENROUTER_MODELS: OpenRouterModel[] = [
  // Rápidos e baratos
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Rápido e econômico para tarefas simples",
    pricePer1k: "$0.15",
    category: "fast"
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    description: "Velocidade e qualidade da Anthropic",
    pricePer1k: "$0.25",
    category: "fast"
  },
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    description: "Modelo rápido do Google",
    pricePer1k: "$0.08",
    category: "fast"
  },
  // Balanceados
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Melhor qualidade para a maioria das tarefas",
    pricePer1k: "$2.50",
    category: "balanced"
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Excelente para análise e escrita",
    pricePer1k: "$3.00",
    category: "balanced"
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    description: "Modelo avançado do Google com longo contexto",
    pricePer1k: "$1.25",
    category: "balanced"
  },
  // Poderosos
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Máxima qualidade para tarefas complexas",
    pricePer1k: "$10.00",
    category: "powerful"
  },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    description: "O mais poderoso para raciocínio complexo",
    pricePer1k: "$15.00",
    category: "powerful"
  },
  {
    id: "meta-llama/llama-3.1-405b",
    name: "Llama 3.1 405B",
    description: "Open source de alta qualidade",
    pricePer1k: "$3.50",
    category: "powerful"
  }
];

const DEFAULT_MODEL = "openai/gpt-4o-mini";

class OpenRouterService {
  private apiKey: string = "";
  private baseUrl: string = "https://openrouter.ai/api/v1";

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  async chat(
    messages: ChatMessage[],
    model: string = DEFAULT_MODEL
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: "API Key não configurada" };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Kairos Church App"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        return {
          success: false,
          error: error?.error?.message || `Erro ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
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
    const systemMessage: ChatMessage = {
      role: "system",
      content: `Você é um assistente bíblico cristão. Responda sempre em portuguê de Brasil.
Use linguagem clara e acessível. Baseie-se no contexto bíblico fornecido.
Seja respeitoso e fundamentado na Palavra de Deus.

Contexto bíblico: ${context}`
    };

    const userMessage: ChatMessage = {
      role: "user",
      content: question
    };

    return this.chat([systemMessage, userMessage], model);
  }

  async explainVerse(
    reference: string,
    verseText: string,
    model: string = DEFAULT_MODEL
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    const question = `Explique o significado e aplicação prática do seguinte versículo:
"${verseText}" (${reference})

Por favor, forneça:
1. Contexto histórico
2. Significado principal
3. Aplicação prática para hoje
4. Versículos relacionados`;

    return this.askBibleQuestion(question, verseText, model);
  }
}

export const openRouterService = new OpenRouterService();

// Salvamento local
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

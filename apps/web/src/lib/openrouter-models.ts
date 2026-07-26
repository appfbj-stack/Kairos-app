// lib/openrouter-models.ts
// Lista de TODOS os modelos GRATUITOS do OpenRouter
// Atualizado em: 2026-06-01
// Fonte: https://openrouter.ai/api/v1/models

export interface OpenRouterFreeModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  description: string;
  category: "reasoning" | "chat" | "coding" | "multimodal" | "specialized";
}

// TODOS os modelos GRATUITOS do OpenRouter
export const FREE_MODELS: OpenRouterFreeModel[] = [
  // ========== REASONING (Raciocínio) ==========
  {
    id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    name: "Nemotron 3 Nano Omni 30B",
    provider: "NVIDIA",
    contextLength: 256000,
    description: "Modelo multimodal de raciocínio da NVIDIA. Suporta texto e imagem.",
    category: "reasoning"
  },
  {
    id: "liquid/lfm-2.5-1.2b-thinking:free",
    name: "LFM 2.5 1.2B Thinking",
    provider: "Liquid AI",
    contextLength: 32768,
    description: "Modelo leve focado em raciocínio e pensamento lógico.",
    category: "reasoning"
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super 120B",
    provider: "NVIDIA",
    contextLength: 1000000,
    description: "Modelo grande da NVIDIA (120B parâmetros). Para tarefas complexas.",
    category: "reasoning"
  },

  // ========== CHAT (Conversação) ==========
  {
    id: "openai/gpt-oss-120b:free",
    name: "GPT-OSS 120B",
    provider: "OpenAI",
    contextLength: 131072,
    description: "Modelo open-weight da OpenAI (117B parâmetros). Alta qualidade.",
    category: "chat"
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS 20B",
    provider: "OpenAI",
    contextLength: 131072,
    description: "Versão menor do GPT-OSS. Mais rápido.",
    category: "chat"
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B Instruct",
    provider: "Meta",
    contextLength: 131072,
    description: "Modelo principal da Meta. Excelente para chat e instruções.",
    category: "chat"
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B Instruct",
    provider: "Meta",
    contextLength: 131072,
    description: "Modelo leve da Meta. Rápido para tarefas simples.",
    category: "chat"
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3 405B",
    provider: "Nous Research",
    contextLength: 131072,
    description: "Um dos maiores modelos abertos. Excelente qualidade.",
    category: "chat"
  },
  {
    id: "z-ai/glm-4.5-air:free",
    name: "GLM 4.5 Air",
    provider: "Zhipu AI",
    contextLength: 131072,
    description: "Modelo leve da Zhipu AI. Bom para chat em português.",
    category: "chat"
  },
  {
    id: "liquid/lfm-2.5-1.2b-instruct:free",
    name: "LFM 2.5 1.2B Instruct",
    provider: "Liquid AI",
    contextLength: 32768,
    description: "Modelo compacto de alto desempenho.",
    category: "chat"
  },
  {
    id: "nvidia/nemotron-nano-9b-v2:free",
    name: "Nemotron Nano 9B",
    provider: "NVIDIA",
    contextLength: 128000,
    description: "Modelo leve da NVIDIA. Rápido e eficiente.",
    category: "chat"
  },
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Dolphin Mistral 24B",
    provider: "Cognitive Computations",
    contextLength: 32768,
    description: "Modelo sem censura. Bom para conversas livres.",
    category: "chat"
  },

  // ========== CODING (Programação) ==========
  {
    id: "qwen/qwen3-coder:free",
    name: "Qwen3 Coder 480B",
    provider: "Alibaba",
    contextLength: 1048576,
    description: "Melhor modelo para programação. 480B parâmetros MoE.",
    category: "coding"
  },
  {
    id: "qwen/qwen3-next-80b-a3b-instruct:free",
    name: "Qwen3 Next 80B",
    provider: "Alibaba",
    contextLength: 262144,
    description: "Modelo avançado da Alibaba. Bom para código e texto.",
    category: "coding"
  },
  {
    id: "poolside/laguna-m.1:free",
    name: "Laguna M.1",
    provider: "Poolside",
    contextLength: 262144,
    description: "Modelo especializado em programação e código.",
    category: "coding"
  },
  {
    id: "poolside/laguna-xs.2:free",
    name: "Laguna XS.2",
    provider: "Poolside",
    contextLength: 262144,
    description: "Versão leve do Laguna. Rápido para código.",
    category: "coding"
  },

  // ========== MULTIMODAL (Texto + Imagem) ==========
  {
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4 31B",
    provider: "Google",
    contextLength: 262144,
    description: "Modelo multimodal do Google. Suporta texto e imagem.",
    category: "multimodal"
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B A4B",
    provider: "Google",
    contextLength: 262144,
    description: "Versão MoE do Gemma 4. Eficiente e poderoso.",
    category: "multimodal"
  },
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    name: "Nemotron Nano 12B VL",
    provider: "NVIDIA",
    contextLength: 128000,
    description: "Modelo multimodal da NVIDIA. Texto e imagem.",
    category: "multimodal"
  },
  {
    id: "moonshotai/kimi-k2.6:free",
    name: "Kimi K2.6",
    provider: "Moonshot AI",
    contextLength: 262144,
    description: "Modelo multimodal da Moonshot. Grande contexto.",
    category: "multimodal"
  },

  // ========== SPECIALIZED (Especializados) ==========
  {
    id: "openrouter/free",
    name: "Free Router (Auto)",
    provider: "OpenRouter",
    contextLength: 200000,
    description: "Seleciona automaticamente o melhor modelo gratuito disponível.",
    category: "specialized"
  },
  {
    id: "openrouter/owl-alpha",
    name: "Owl Alpha",
    provider: "OpenRouter",
    contextLength: 1048576,
    description: "Modelo foundation de alta performance. 1M tokens de contexto.",
    category: "specialized"
  },
  {
    id: "google/lyria-3-pro-preview",
    name: "Lyria 3 Pro (Música)",
    provider: "Google",
    contextLength: 1048576,
    description: "Modelo de geração de música do Google (custo por música).",
    category: "specialized"
  },
  {
    id: "google/lyria-3-clip-preview",
    name: "Lyria 3 Clip (Áudio)",
    provider: "Google",
    contextLength: 1048576,
    description: "Gera clipes de áudio de 30 segundos (custo por clipe).",
    category: "specialized"
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron 3 Nano 30B",
    provider: "NVIDIA",
    contextLength: 256000,
    description: "Modelo MoE da NVIDIA. Bom equilíbrio velocidade/qualidade.",
    category: "specialized"
  }
];

// Modelo padrão (gratuito)
export const DEFAULT_FREE_MODEL = "openai/gpt-oss-120b:free";

// Função para buscar modelos gratuitos atualizados da API
export async function fetchFreeModels(): Promise<OpenRouterFreeModel[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    const data = await response.json();
    
    const freeModels = data.data
      .filter((m: any) => 
        m.pricing?.prompt === "0" && 
        m.pricing?.completion === "0" &&
        !m.id.includes("lyria") // Exclui modelos de áudio/música
      )
      .map((m: any) => ({
        id: m.id,
        name: m.id.split("/").pop()?.replace(":free", "").replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || m.id,
        provider: m.id.split("/")[0],
        contextLength: m.context_length || 0,
        description: m.description?.substring(0, 100) || "",
        category: categorizeModel(m.id, m.description)
      }))
      .sort((a: OpenRouterFreeModel, b: OpenRouterFreeModel) => b.contextLength - a.contextLength);
    
    return freeModels;
  } catch (error) {
    console.error("Erro ao buscar modelos gratuitos:", error);
    return FREE_MODELS; // Fallback para lista estática
  }
}

function categorizeModel(id: string, description: string): OpenRouterFreeModel["category"] {
  const lower = (id + description).toLowerCase();
  
  if (lower.includes("code") || lower.includes("coder") || lower.includes("programming") || lower.includes("laguna")) {
    return "coding";
  }
  if (lower.includes("vision") || lower.includes("vl") || lower.includes("multimodal") || lower.includes("gemma-4") || lower.includes("kimi")) {
    return "multimodal";
  }
  if (lower.includes("reasoning") || lower.includes("thinking")) {
    return "reasoning";
  }
  if (lower.includes("router") || lower.includes("owl") || lower.includes("lyria")) {
    return "specialized";
  }
  return "chat";
}

// Formatar tamanho do contexto
export function formatContextLength(length: number): string {
  if (length >= 1000000) {
    return `${(length / 1000000).toFixed(1)}M`;
  }
  if (length >= 1000) {
    return `${(length / 1000).toFixed(0)}K`;
  }
  return length.toString();
}

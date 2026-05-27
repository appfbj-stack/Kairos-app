import type { AIProvider, AIRequest, AIResponse } from "@kairos/types";

const PROVIDER_PRIORITY: AIProvider[] = ["openrouter", "openai", "claude", "gemini", "ollama"];

export class KairosAI {
  private static buildSystemPrompt(request: AIRequest): string {
    const { context } = request;
    const parts = [
      "Você é o Kairos AI, assistente pastoral inteligente.",
      "Responda sempre em português brasileiro.",
      "Seja respeitoso, bíblico e edificante.",
    ];

    if (context?.churchName) parts.push(`Igreja: ${context.churchName}`);
    if (context?.userRole) parts.push(`Papel do usuário: ${context.userRole}`);
    if (context?.activeModule) parts.push(`Módulo ativo: ${context.activeModule}`);

    return parts.join("\n");
  }

  static async complete(request: AIRequest): Promise<AIResponse> {
    const provider = request.provider ?? PROVIDER_PRIORITY[0]!;
    const systemMessage = { role: "system" as const, content: this.buildSystemPrompt(request) };
    const messages = [systemMessage, ...request.messages];

    switch (provider) {
      case "openrouter":
        return this.callOpenRouter(messages, request);
      case "openai":
        return this.callOpenAI(messages, request);
      case "claude":
        return this.callClaude(messages, request);
      default:
        return this.callOpenRouter(messages, request);
    }
  }

  private static async callOpenRouter(messages: AIRequest["messages"], request: AIRequest): Promise<AIResponse> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://kairos.app",
        "X-Title": "Kairos AI",
      },
      body: JSON.stringify({
        model: request.model ?? "anthropic/claude-3.5-sonnet",
        messages,
        max_tokens: request.maxTokens ?? 2048,
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`);

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage: { prompt_tokens: number; completion_tokens: number };
    };

    return {
      content: data.choices[0]?.message.content ?? "",
      provider: "openrouter",
      model: data.model,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
      },
    };
  }

  private static async callOpenAI(messages: AIRequest["messages"], request: AIRequest): Promise<AIResponse> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: request.model ?? "gpt-4o-mini",
        messages,
        max_tokens: request.maxTokens ?? 2048,
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage: { prompt_tokens: number; completion_tokens: number };
    };

    return {
      content: data.choices[0]?.message.content ?? "",
      provider: "openai",
      model: data.model,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
      },
    };
  }

  private static async callClaude(messages: AIRequest["messages"], request: AIRequest): Promise<AIResponse> {
    const [system, ...rest] = messages;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: request.model ?? "claude-sonnet-4-6",
        system: system?.content,
        messages: rest,
        max_tokens: request.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) throw new Error(`Claude error: ${response.statusText}`);

    const data = await response.json() as {
      content: Array<{ text: string }>;
      model: string;
      usage: { input_tokens: number; output_tokens: number };
    };

    return {
      content: data.content[0]?.text ?? "",
      provider: "claude",
      model: data.model,
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
      },
    };
  }
}

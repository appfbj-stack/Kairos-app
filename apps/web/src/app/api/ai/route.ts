import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json() as { messages: Array<{ role: string; content: string }>; context?: Record<string, string> };
    const { messages, context } = body;

    const systemParts = [
      "Você é o Kairos AI, assistente pastoral inteligente da plataforma Kairos.",
      "Responda sempre em português brasileiro de forma respeitosa, bíblica e edificante.",
      "Seja conciso mas completo. Use exemplos bíblicos quando relevante.",
    ];
    if (context?.churchName) systemParts.push(`Igreja: ${context.churchName}`);
    if (context?.userRole) systemParts.push(`Papel do usuário: ${context.userRole}`);

    // Tenta OpenRouter primeiro, depois fallback para resposta simples
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        content: "Configure a variável OPENROUTER_API_KEY para habilitar o Kairos AI.",
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://kairos.app",
        "X-Title": "Kairos AI",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemParts.join("\n") },
          ...messages,
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", err);
      return NextResponse.json({ error: "Erro ao chamar IA", details: err }, { status: 500 });
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content ?? "Sem resposta.";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI route error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

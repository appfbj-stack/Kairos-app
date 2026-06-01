import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RootPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-white text-sm">K</div>
          <span className="text-lg font-bold tracking-tight">Kairos</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
          <a href="#planos" className="hover:text-white transition-colors">Planos</a>
        </div>
        <Link href="/login" className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition-colors">
          Entrar
        </Link>
      </nav>
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-violet-700/20 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Plataforma completa para gestao de igrejas
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Organize sua igreja<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">com inteligencia</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            O Kairos e a plataforma que pastores, lideres e equipes de ministerio precisam para gerir membros, celulas, financas e comunicacao em um so lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-lg transition-all shadow-lg shadow-violet-900/40 hover:scale-105">
              Comece gratis agora
            </Link>
            <a href="#features" className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/30 font-semibold text-lg transition-all hover:bg-white/5">
              Ver funcionalidades
            </a>
          </div>
          <p className="mt-4 text-sm text-white/30">Sem cartao de credito. Cadastro em 1 minuto.</p>
        </div>
      </section>
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Tudo que sua igreja precisa</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Uma plataforma completa pensada para a realidade das igrejas brasileiras</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "👥", title: "Gestao de Membros", desc: "Cadastro completo com historico, aniversariantes, grupos familiares e status de batismo." },
              { icon: "🏠", title: "Celulas e Ministerios", desc: "Organize grupos domesticos, equipes de ministerios e voluntarios com visao completa." },
              { icon: "💰", title: "Financas da Igreja", desc: "Controle entradas, saidas e decimos com relatorios mensais claros para a lideranca." },
              { icon: "💬", title: "Chat Interno", desc: "Comunicacao direta entre membros, lideres e pastores. Salas por ministerio." },
              { icon: "✨", title: "Kairos AI Assistente", desc: "IA integrada para responder duvidas, sugerir versiculos e apoiar a lideranca." },
              { icon: "📅", title: "Agenda de Eventos", desc: "Cultos, retiros, reunioes e congressos organizados com confirmacao de presenca." },
              { icon: "🎙️", title: "Sermoes e Ensinos", desc: "Biblioteca de sermoes e material didatico acessivel por toda a lideranca." },
              { icon: "🙏", title: "Mural de Oracao", desc: "Pedidos de oracao compartilhados com respostas e testemunhos." },
              { icon: "📰", title: "Mural da Igreja", desc: "Feed interno com noticias, devocional diario e comunicados da congregacao." },
            ].map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="beneficios" className="py-32 px-6 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Por que pastores e lideres amam o Kairos?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: "⚡", title: "Economize horas de trabalho", desc: "Chega de planilhas e grupos de WhatsApp desorganizados. Tudo centralizado e atualizado em tempo real." },
              { emoji: "🔒", title: "Dados seguros e privados", desc: "Informacoes dos membros protegidas com criptografia de nivel bancario." },
              { emoji: "📈", title: "Cresca com confianca", desc: "De 10 a milhares de membros, o Kairos escala com sua igreja sem perder desempenho." },
              { emoji: "📱", title: "Acesso de qualquer lugar", desc: "No celular, tablet ou computador. Lide sua igreja mesmo fora dos cultos." },
              { emoji: "🔄", title: "Atualizacoes sem custo extra", desc: "Novas funcionalidades e recursos sao entregues automaticamente. Voce sempre tera o melhor." },
              { emoji: "🤝", title: "Suporte dedicado", desc: "Nossa equipe entende de igrejas. Suporte por chat com respostas rapidas." },
            ].map((b) => (
              <div key={b.title} className="flex flex-col gap-3 p-6 rounded-2xl bg-white/3 border border-white/8">
                <div className="text-4xl">{b.emoji}</div>
                <h3 className="text-xl font-bold">{b.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { value: "500+", label: "Igrejas usando" },
              { value: "48.000+", label: "Membros gerenciados" },
              { value: "99.9%", label: "Uptime garantido" },
            ].map((s) => (
              <div key={s.label} className="py-8 rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20">
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{s.value}</div>
                <div className="text-white/50 mt-2 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="planos" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Planos para cada Igreja</h2>
            <p className="text-white/50 text-lg">Comece gratis e cresca no seu tempo</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/3 border border-white/10 flex flex-col">
              <div className="text-2xl mb-1">Gratuito</div>
              <div className="text-4xl font-extrabold mt-2 mb-4">R$ 0 <span className="text-lg text-white/40 font-normal">/mes</span></div>
              <ul className="space-y-2 text-sm text-white/60 flex-1">
                {["Ate 10 membros", "Chat de membros", "20 mensagens Kairos AI", "Dashboard basico"].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="text-green-400">✓</span>{i}</li>
                ))}
              </ul>
              <Link href="/login" className="mt-6 py-3 rounded-xl border border-white/20 hover:border-white/40 text-center font-semibold text-sm transition-all hover:bg-white/5">
                Criar conta gratis
              </Link>
            </div>
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border-2 border-violet-500/50 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-violet-600 text-xs font-bold">MAIS POPULAR</div>
              <div className="text-2xl mb-1">Prata</div>
              <div className="text-4xl font-extrabold mt-2 mb-4">R$ 37 <span className="text-lg text-white/40 font-normal">/mes</span></div>
              <ul className="space-y-2 text-sm text-white/60 flex-1">
                {["Ate 30 membros", "Todos os modulos", "Chat completo", "500 mensagens Kairos AI", "Financas, Eventos, Sermoes", "Suporte prioritario"].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="text-violet-400">✓</span>{i}</li>
                ))}
              </ul>
              <Link href="/login" className="mt-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-center font-bold text-sm transition-all">
                Assinar Prata
              </Link>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-500/30 flex flex-col">
              <div className="text-2xl mb-1">Ouro 👑</div>
              <div className="text-4xl font-extrabold mt-2 mb-4">R$ 97 <span className="text-lg text-white/40 font-normal">/mes</span></div>
              <ul className="space-y-2 text-sm text-white/60 flex-1">
                {["Membros ilimitados", "Todos os modulos", "Chat completo", "2.000 mensagens Kairos AI", "Relatorios avancados", "Suporte VIP"].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="text-yellow-400">✓</span>{i}</li>
                ))}
              </ul>
              <Link href="/login" className="mt-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-center font-bold text-sm transition-all text-black">
                Assinar Ouro
              </Link>
            </div>
          </div>
          <p className="text-center text-white/30 text-sm mt-8">Todas as atualizacoes futuras inclusas. Sem cobrancas surpresa. Cancele quando quiser.</p>
        </div>
      </section>
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            Sua igreja merece<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">o melhor</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Junte-se a centenas de igrejas que ja descobriram como o Kairos transforma a gestao da congregacao.
          </p>
          <Link href="/login" className="inline-block px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-xl transition-all shadow-2xl shadow-violet-900/50 hover:scale-105">
            Criar minha conta gratis
          </Link>
          <p className="mt-4 text-white/30 text-sm">Sem cartao de credito. Ativo em segundos.</p>
        </div>
      </section>
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center font-bold text-white text-xs">K</div>
            <span className="font-bold">Kairos</span>
            <span className="text-white/30 text-sm ml-2">Plataforma para Igrejas</span>
          </div>
          <p className="text-white/30 text-sm">2025 Kairos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

# Fase 1 — Fundação do Redesign App Sede Igreja

**Data:** 2026-07-05
**Repo alvo:** `C:\Users\ferna\kairos-sede-sorocaba-repo`
**Stack:** React 19 + Vite 8 + Tailwind v4 + Radix UI + TanStack Query + zustand + lucide-react
**Fase de:** Roadmap em 4 fases (Fundação → Dashboard+Mapa Ministerial → Módulos Eclesiásticos → Módulos Operacionais)

---

## 1. Escopo

### 1.1 O que esta fase entrega

1. Design System completo (tokens dark/light, primitivas Shadcn, componentes compostos)
2. Layout raiz: Sidebar recolhível + Topbar + Breadcrumb + área de conteúdo
3. ThemeProvider (dark padrão, light toggle real)
4. Mock data layer (generators TS com seed, ~4.300 registros brasileiros)
5. Roteamento base com 1 rota exemplo (`/`)
6. Estados transversais: Loading Skeleton, EmptyState, ErrorBoundary

### 1.2 O que esta fase NÃO entrega

- Dashboards analíticos dos 21 módulos (Fases 2-4)
- Mapa Ministerial funcional (Fase 2)
- Aion conversando com mocks (Fase 2)
- Pesquisa Global / Ações rápidas / Notificações funcionais (esqueletos visuais apenas)
- Recharts, react-leaflet, framer-motion, jspdf, xlsx (Fases 2-4)
- Backend, APIs, banco de dados — intocáveis (restrição do prompt)

### 1.3 Resultado visível ao fim da Fase 1

Ao executar `npm run dev`, abre um app dark premium com sidebar recolhível agrupada em 4 categorias, topbar completo, página inicial placeholder, toggle light/dark funcionando, mocks disponíveis para consumo pelas Fases 2-4.

---

## 2. Arquitetura de Pastas

```
frontend/src/
├── app/
│   ├── App.jsx                    (router raiz)
│   ├── routes.jsx                 (definição de rotas)
│   └── providers/
│       ├── ThemeProvider.jsx      (dark/light + persistência)
│       └── QueryProvider.jsx      (TanStack Query)
├── components/
│   ├── ui/                        (primitivas Shadcn puras)
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── sidebar.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── dialog.jsx
│   │   ├── avatar.jsx
│   │   ├── badge.jsx
│   │   ├── tabs.jsx
│   │   ├── select.jsx
│   │   ├── tooltip.jsx
│   │   ├── skeleton.jsx
│   │   ├── separator.jsx
│   │   ├── scroll-area.jsx
│   │   └── sheet.jsx
│   ├── composite/                 (componentes compostos reutilizáveis)
│   │   ├── StatCard.jsx
│   │   ├── SparklineChart.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   ├── Breadcrumb.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── DateDisplay.jsx
│   │   ├── QuickActions.jsx       (esqueleto)
│   │   ├── GlobalSearch.jsx       (esqueleto)
│   │   └── NotificationsBell.jsx  (esqueleto)
│   └── layout/
│       ├── RootLayout.jsx         (Sidebar + Topbar + Outlet)
│       ├── Sidebar.jsx
│       ├── SidebarItem.jsx
│       └── Topbar.jsx
├── lib/
│   ├── utils.js                   (cn, formatters BR: CPF, telefone, moeda, data)
│   ├── theme.js                   (menu de temas, paleta)
│   ├── constants.js               (menu items, rotas, grupos da sidebar)
│   └── seed.js                    (mulberry32, faker BR helpers)
├── mocks/
│   ├── generators/
│   │   ├── membros.js
│   │   ├── congregacoes.js
│   │   ├── pastores.js
│   │   ├── obreiros.js
│   │   ├── departamentos.js
│   │   ├── eventos.js
│   │   ├── cultos.js
│   │   ├── escalas.js
│   │   ├── aniversariantes.js
│   │   ├── documentos.js
│   │   └── index.js               (registry por tipo)
│   └── hooks/
│       └── useMockData.js         (hook consumido por Fases 2-4 + Aion)
├── pages/
│   └── DashboardPlaceholder.jsx   (rota / para validar layout)
└── styles/
    └── globals.css                (tokens Tailwind v4 @theme)
```

---

## 3. Design Tokens (Tailwind v4 `@theme`)

Tokens semânticos via CSS variables que mudam entre dark/light. Mapeamento direto da paleta do prompt:

```css
/* frontend/src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-background:        #0A0F1F;   /* dark padrão */
  --color-card:             #121C2E;
  --color-border:           rgba(0,200,255,.18);
  --color-primary:          #00CCFF;
  --color-glow:             #00D9FF;
  --color-hover:            #45E3FF;
  --color-foreground:       #F8FAFC;
  --color-muted:            #94A3B8;
  --color-success:          #22C55E;
  --color-warning:          #F59E0B;
  --color-danger:           #EF4444;
  --radius-card:            0.75rem;
  --shadow-glow:           0 0 24px -6px rgba(0,217,255,.45);
}

:root.light {
  --color-background:        #F8FAFC;
  --color-card:             #FFFFFF;
  --color-border:           rgba(15,23,42,.10);
  --color-primary:          #0099CC;
  --color-glow:             #00B8E6;
  --color-hover:            #00BBF0;
  --color-foreground:       #0A0F1F;
  --color-muted:            #475569;
  /* success/warning/danger mantêm */
}
```

Uso: `<div className="bg-card border-border rounded-card text-foreground shadow-glow">`. Troca de tema = alternar `.dark`/`.light` no `<html>`. Primitivas Shadcn herdam via `bg-background`, `text-foreground`, etc.

**Configuração Tailwind v4:** como os tokens são CSS variables que trocam por seletor `:root.dark`/`:root.light` (não por `prefers-color-scheme`), adicionamos `@custom-variant dark (&:is(.dark *));` no `globals.css` para que utilities `dark:` também funcionem por classe, caso precisemos em alguma primitiva.

---

## 4. ThemeProvider

`app/providers/ThemeProvider.jsx`:
- Estado: `'dark' | 'light'`, padrão `'dark'`.
- Persiste em `localStorage['kairos-theme']`.
- Fallback inicial: `prefers-color-scheme: dark` se não houver preferência salva.
- Aplica classe `.dark` ou `.light` em `document.documentElement`.
- Expõe `useTheme()` hook com `{ theme, toggleTheme, setTheme }`.
- `transition-colors duration-300` em `<body>` para troca suave.

`ThemeToggle` (composite): botão IconButton com ícone `Sun`/`Moon` do lucide, animação de rotação no toggle, tooltip "Tema claro/escuro".

---

## 5. Primitivas Shadcn (14 componentes)

Instalar via CLI/pip manual. Todas em `components/ui/`:

`button` · `card` · `sidebar` · `dropdown-menu` · `dialog` · `avatar` · `badge` · `tabs` · `select` · `tooltip` · `skeleton` · `separator` · `scroll-area` · `sheet`

Todas consomem os tokens semânticos (`bg-background`, `text-foreground`, `border-border`, `rounded-card`) — nenhuma cor hardcoded.

---

## 6. Componentes Compostos

### 6.1 Sidebar

```
┌─────────────────────────┐
│  [LOGO] Kairós Sede     │  ← header 64px, logo + nome
│  ═══════════════════    │
│  PAINEL                 │  ← label do grupo (uppercase, muted)
│  ◇ Dashboard            │
│  ◇ Mapa Ministerial     │
│  ◇ Aniversariantes      │
│                         │
│  PESSOAS                │
│  ◇ Membros              │
│  ◇ Congregações         │
│  ◇ Pastores             │
│  ◇ Obreiros             │
│  ◇ Departamentos        │
│                         │
│  VIDA ECLESIÁSTICA      │
│  ◇ Células              │
│  ◇ Cultos               │
│  ◇ Eventos              │
│  ◇ Escalas              │
│  ◇ Agenda               │
│                         │
│  GESTÃO                 │
│  ◇ Financeiro  ▾        │  ← submenu recolhível
│  ◇ Patrimônio           │
│  ◇ Veículos             │
│  ◇ Projetos             │
│  ◇ Documentos           │
│  ◇ Biblioteca           │
│  ◇ Comunicação          │
│  ◇ Relatórios           │
│  ◇ Configurações        │
│  ═══════════════════    │
│  [avatar] Master        │  ← footer fixo com perfil
└─────────────────────────┘
```

**Comportamentos:**
- Largura expandida: 260px / recolhida: 72px (só ícones) — toggle no header da sidebar.
- Item ativo: barra luminosa esquerda (4px, `--color-glow`) + fundo card + ícone com glow.
- Hover: fundo `--color-card` + leve elevação.
- Animação: `transition-all duration-200 ease-out`.
- Mobile (< 768px): vira `Sheet` (overlay deslizante da esquerda) com backdrop.
- Submenu (Financeiro, Patrimônio, etc.): chevron que expande sub-itens com slide-down.
- Footer: avatar + nome + popover com logout.
- Scroll: `ScrollArea` do Radix para lista longa.

**Estados:**
- Default (expandida)
- Recolhida (72px, só ícones, tooltips nos itens)
- Mobile (Sheet)
- Sem usuário logado: skeleton

### 6.2 Topbar

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [≡]  Dashboard / Mapa Ministerial     [🔍 Buscar…]   📅 05 Jul 2026      │
│                                       ⚡ Ações      🔔 3   ☾/☀  [avatar] │
└──────────────────────────────────────────────────────────────────────────┘
```

Da esquerda para a direita:

1. **Toggle Sidebar** (`≡`) — recolhe/expande em desktop; abre Sheet no mobile.
2. **Breadcrumb** — derivado da rota atual (`Dashboard / Membros / Novo`), separador `/` com ícone caret, último item em `--color-primary`. **Funcional.**
3. **Busca Global** (`[🔍 Buscar…]`) — input com atalho `Cmd/Ctrl+K`, **esqueleto visual** (placeholder + tooltip "Disponível em breve").
4. **Data** (`📅 05 Jul 2026`) — `DateDisplay` em tempo real via `setInterval(60s)`, formato BR, ícone calendário. **Funcional.**
5. **Ações rápidas** (`⚡ Ações`) — dropdown com 3 itens exemplo (Novo membro, Novo evento, Registrar batismo) — **esqueleto visual** sem ação real.
6. **Notificações** (`🔔 3`) — sino + badge numérico + dropdown com 3 mocks — **esqueleto visual**.
7. **ThemeToggle** (`☾/☀`) — botão que alterna `.dark`/`.light` no `<html>`. **Funcional.**
8. **Avatar** — `Avatar` Shadcn com popover mostrando nome, role, buttons (Perfil, Logout). Usa `useAuth` store já existente. **Funcional.**

**Estados:**
- Mobile (< 768px): esconder Breadcrumb e Data, manter o resto.
- ThemeToggle com transição suave (`transition-colors duration-300` em todo `<body>`).

### 6.3 StatCard

```
┌────────────────────────────────────┐
│  👥  Membros                       ↗ │
│                                    │
│  2.000                  +12,5%     │
│  Total de membros                  │
│                                    │
│  ▁▂▃▄▆▇█▇▆▄▃▂▁  Sparkline          │
└────────────────────────────────────┘
```

**Props:**
```ts
{
  icon: ReactNode          // lucide, com glow no hover
  title: string            // "Membros"
  value: string|number      // "2.000" (formatador BR)
  description: string      // "Total de membros"
  trend: { value: number, direction: 'up'|'down' }  // +12,5%
  sparklineData: number[]  // 12 pontos mensais
  onClick?: () => void     // abre dashboard específico
  loading?: boolean        // skeleton
  accent?: 'primary'|'success'|'warning'|'danger'
}
```

**Visual:**
- Card `bg-card border-border rounded-card`, hover → `shadow-glow` + borda mais opaca.
- Ícone em círculo 40px com fundo translúcido da cor accent.
- Valor grande (`text-3xl font-bold`), descrição pequena (`text-muted text-sm`).
- Trend com seta ↑/↓ colorida (verde/vermelho).
- Sparkline abaixo, área preenchida com gradiente do accent, linha 2px.
- Animação de entrada: fade-in + slight slide-up (`transition-all duration-300`).
- Loading: `Skeleton` no valor + sparkline.

**Grid responsivo:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.

### 6.4 SparklineChart

Props: `{ data: number[], color?: string, width?: 120, height?: 36, smooth?: boolean }`

Implementação pura SVG (sem Recharts — ~3KB vs 80KB) com path generator suavizado via Catmull-Rom. Área preenchida com gradiente do accent. Recharts só entra nas Fases 2-4 para gráficos complexos (Área/Rosca/Radar).

### 6.5 Breadcrumb

Componente derivado da rota atual via `useLocation()`. Mapeia.segments → labels em `lib/constants.js`. Separador `/` com ícone caret. Último item em `--color-primary`.

### 6.6 DateDisplay

Hook `useCurrentDate(intervalMs = 60000)` — atualiza a cada 60s. Formato `dd MMM yyyy` em pt-BR via `Intl.DateTimeFormat`. Ícone `Calendar` do lucide.

### 6.7 Esqueletos (QuickActions, GlobalSearch, NotificationsBell)

- **QuickActions**: dropdown visual com 3 itens exemplo (Novo membro, Novo evento, Registrar batismo). Cada item mostra ícone + label + warning "Em breve" no tooltip.
- **GlobalSearch**: input visual com atalho `Cmd/Ctrl+K` indicado no canto direito. Tooltip "Disponível em breve". Foco não abre painel.
- **NotificationsBell**: sino + badge com número "3" (mock) + dropdown com 3 items mock não clickáveis.

---

## 7. Estados (Loading, Empty, Error)

### 7.1 LoadingSkeleton

Variantes (prop `variant`):
- `statcard` — card vazio com 3 retângulos pulsantes
- `table` — 8 linhas com células skeleton
- `chart` — área retangular com "shimmer" gradient
- `sidebar` — 15 itens linha
- `topbar` — retângulos na barra superior

Uso: `<LoadingSkeleton variant="statcard" />` ou `<StatCard loading />`.

### 7.2 EmptyState

```
┌────────────────────────┐
│        [Ícone]          │
│                        │
│  Nenhum aniversariante  │
│  neste período         │
│                        │
│  [Adicionar membro]     │  ← CTA opcional
└────────────────────────┘
```

Props: `{ icon, title, description, action?: ReactNode }`.

### 7.3 ErrorBoundary

Captura erros React, mostra estado de erro com botão "Recarregar" que chama `window.location.reload()`. Útil em AJAX/graphs que quebram em runtime.

### 7.4 Animações

`@keyframes` em `globals.css` para shimmer + `transition-colors/ease-out` do Tailwind para tudo. Framer-motion só entra se estritamente necessário para escalas/gestos — decisão na Fase 2.

---

## 8. Mock Data Generators

Schema dos generators TS com seed `mulberry32` (mesmo dado toda execução):

| Generator | Volume | Campos principais |
|---|---|---|
| `membros` | 2.000 | id, nome, cpf, dataNasc, sexo, estadoCivil, telefone, email, endereco {cidade, bairro, cep, uf}, congregacaoId, cargo, status [ativo/inativo/novo], batizado, dataBatismo, foto, ativoDesde |
| `congregacoes` | 35 | id, nome, cidade, estado, endereco, pastorId, membrosCount, fundadaEm, crescimento12m[], batismos12m[], visitantes12m[], departamentosAtivos[], financeiro {entradas, saidas, saldo} |
| `pastores` | 80 | id, nome, dataNasc, congregacaoId, tempoMinisterio (anos), formacao, telefone, email |
| `obreiros` | 250 | id, nome, funcao, departamentoId, congregacaoId, escalasCount, participacaoPercent |
| `departamentos` | 50 | id, nome [Homens/Mulheres/Jovens/Louvor/Intercessão/Evangelismo/Missões/Crianças/Adolescentes/Outros], congregacaoId, liderId, membrosCount, eventos12m |
| `eventos` | 500 | id, titulo, tipo [culto/conferência/batismo/retiro/ensaio], data, congregacaoId, inscritos, participantes, receitas, despesas, fotos[] |
| `cultos` | 1.000 | id, data, congregacaoId, pregador, participantes, visitantes, decisoes, batismos, theme |
| `escalas` | 200 | id, data, congregacaoId, departamentoId, obreiros[], status, confirmados, ausencias, trocas |
| `aniversariantes` | 150 | derivado de membros/pastores/obreiros com dataNasc no período, tipo [membro/pastor/obreiro/líder/criança/visitante] |
| `documentos` | 300 | id, titulo, tipo [ata/relatório/certificado/carta], congregacaoId, data, autor |

**Nomes BR**: array de primeiros nomes (masculinos + femininos) + sobrenomes comuns (Silva, Santos, Oliveira, Souza, Costa, Pereira, Ferreira, Almeida, Lima, Ribeiro). Cidades concentradas em SP/RJ/MG/PR/BA. Telefones `(11) 9XXXX-XXXX`. CPFs esterilizados (formato válido, dígitos fake).

### 8.1 Hook useMockData

`useMockData(tipo, { limit, filter })` — memoizado em zustand store, gera 1x na primeira chamada e cacheia.

```ts
// Exemplos de uso (Fase 2+)
const membros = useMockData('membros')
const topCongregacoes = useMockData('congregacoes', { filter: { crescimento12m: 'top' }, limit: 5 })
```

`seed.js`: implementa `mulberry32(seed)` + helpers `pick(array)`, `int(min,max)`, `date(years)`, `chance(p)`.

---

## 9. Roteamento (Fase 1 mínimo)

`app/routes.jsx` — define 1 rota: `/` → `DashboardPlaceholder`. Todas as outras rotas das Fases 2-4 serão adicionadas aqui.

`DashboardPlaceholder`: página simples usando `StatCard` e `LoadingSkeleton` para validar visualmente a fundação. Mostra 4 cards estáticos com dados mock (Total de membros: 2.000; Congregações: 35; Pastores: 80; Obreiros: 250) — clique não navega ainda.

`RootLayout`: `<Sidebar /> + <Topbar /> + <main><Outlet /></main>` — o `<main>` tem padding responsivo e `max-w-[1600px] mx-auto`.

---

## 10. Dependências a instalar

| Pacote | Versão | Por quê |
|---|---|---|
| `tailwindcss` | já v4.3.1 ✓ | já existe |
| `@radix-ui/*` (restantes) | próximos | `popover`, `command`, `tooltip` faltantes |
| `recharts` | NÃO nesta fase | adiado para Fase 2 |
| `react-leaflet` | NÃO nesta fase | adiado para Fase 2 (Mapa Ministerial) |
| `framer-motion` | NÃO nesta fase | adiado |
| `jspdf`, `xlsx` | NÃO nesta fase | adiado para Fase 4 |
| `lucide-react` | já ✓ | já existe |
| `class-variance-authority` | já ✓ | já existe |
| `zustand` | já ✓ | já existe |

Fase 1 adiciona apenas Radix restantes + componentes Shadcn em código.

---

## 11. Restrições (do prompt original)

- NÃO alterar banco de dados.
- NÃO alterar APIs.
- NÃO alterar regras de negócio.
- Modificar apenas interface, dashboards, componentes, experiência do usuário, dados fictícios.

O CLAUDE.md do repo adicionalmente manda:
- Não recriar o projeto, não trocar tecnologias (FastAPI + React + Vite + Tailwind + PWA).
- Rodar `pytest` (backend) e `npm run lint && npm run build` (frontend) antes de qualquer push.
- Build deve confirmar geração do PWA (`manifest.webmanifest`, `sw.js`, `workbox-*.js`).

---

## 12. Critérios de Aceitação da Fase 1

1. `npm run dev` abre o app em dark mode sem erros.
2. Sidebar renderiza com 4 grupos, 21 itens, recolhe/expand com animação, glow no item ativo.
3. Topbar mostra toggle, breadcrumb, busca (esqueleto), data (atual), ações (esqueleto), notificações (esqueleto), theme toggle, avatar.
4. ThemeToggle alterna dark↔light com persistência e transição suave.
5. `DashboardPlaceholder` renderiza 4 StatCards com Sparkline SVG, hover com glow.
6. `LoadingSkeleton` cobre 5 variantes.
7. `EmptyState` renderiza com ícone, título, descrição, CTA.
8. `ErrorBoundary` captura erros com botão recarregar.
9. Mock generators produzem os volumes definidos (2.000 membros, 35 congregações, etc.) com nomes BR.
10. `useMockData('membros')` retorna 2.000 registros determinísticos (mesma seed = mesmo dado).
11. `npm run lint && npm run build` passam sem erros; build gera `manifest.webmanifest`, `sw.js`, `workbox-*.js`.
12. Não toca `backend/`, `docker-compose.yml`, `nginx.conf`, `.env*`, rotas/auth, modelos, banco.

---

## 13. Próximas Fases (não implementar agora)

- **Fase 2 — Dashboard Principal + Mapa Ministerial**: Dashboard principal com ~16 cards (cada um clicável), Mapa Ministerial (painel estratégico da sede com mapa Leaflet), Aion integrado com acesso aos mocks.
- **Fase 3 — Módulos Eclesiásticos**: Membros, Congregações, Pastores, Obreiros, Departamentos, Células, Cultos, Eventos, Aniversariantes (cada um com dashboard analítico completo).
- **Fase 4 — Módulos Operacionais**: Escalas, Financeiro, Patrimônio, Veículos, Projetos, Documentos, Biblioteca, Comunicação, Relatórios + exportação PDF/Excel/Impressão + Recharts/Radar/Heatmap.

Cada fase terá seu próprio spec → plan → implementação.
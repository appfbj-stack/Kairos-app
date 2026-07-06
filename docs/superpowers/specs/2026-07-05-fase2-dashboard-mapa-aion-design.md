# Fase 2 — Dashboard Principal + Mapa Ministerial + Aion

**Data:** 2026-07-05
**Repo alvo:** `C:\Users\ferna\kairos-sede-sorocaba-repo`
**Stack:** React 19 + Vite 8 + Tailwind v4 + Radix UI + TanStack Query + zustand + lucide-react + Leaflet (puro)
**Base:** Fase 1 (fundação de design + 10 mock generators + ~4.300 registros BR)
**Decisão:** Opção C — implementar apenas 5 dashboards funcionais (Membros, Congregações, Eventos, Aniversariantes, Financeiro) + Dashboard Principal (16 cards) + Mapa Ministerial + Aion com contexto.

---

## 1. Escopo

### 1.1 O que esta fase entrega

1. **Dashboard Principal** — grid 4×4 com 16 cards clicáveis, cada um com ícone, nome e indicador resumido. Navega para `/dashboard/:tipo`.
2. **5 dashboards analíticos funcionais:** Membros, Congregações, Eventos, Aniversariantes, Financeiro — cada um com KPIs, gráficos SVG, tabela, filtro de período, botão export (placeholder print), breadcrumb
3. **DashboardTemplate** — componente base reutilizável (título, breadcrumb, PeriodFilter, ExportButton, slots)
4. **Mapa Ministerial** — rota `/mapa`, Leaflet puro com pins de congregações, health cards ao lado, filtros
5. **Aion integrado** — `AssistenteIA.jsx` passa a consultar `useMockData`, recebe contexto específico por tela
6. **Componentes gráficos:** ChartBar, ChartLine, ChartDonut (SVG puro), DataTable, KpiCard, DashboardCard, PeriodFilter, ExportButton
7. **Rotas novas:** `/dashboard`, `/dashboard/membros`, `/dashboard/congregacoes`, `/dashboard/eventos`, `/dashboard/aniversariantes`, `/dashboard/financeiro`, `/mapa`
8. **Sidebar atualizada** — destaca Dashboard Principal, sublinha rota ativa, Mapa Ministerial como item separado no grupo Igreja

### 1.2 O que NÃO está no escopo

- Demais 11 dashboards (Pastores, Obreiros, Departamentos, Cultos, Agenda, Escalas, Entradas, Saídas, Patrimônio, Projetos, Documentos, Pedidos de Oração) — Fase 3 ou 4
- Exportação PDF/Excel real (apenas placeholder `window.print`)
- Backend/APIs/banco — continuamos com mocks
- `react-leaflet`, `recharts`, `framer-motion`, `jspdf`, `xlsx` (proibidos)
- PWA service worker — já existe da Fase 1

---

## 2. Arquitetura

### 2.1 Estrutura de arquivos (novos/modificados)

```
frontend/src/
├── pages/
│   ├── DashboardPrincipal.jsx          ← 16 cards, grid 4x4
│   ├── dashboards/
│   │   ├── DashboardTemplate.jsx       ← Base reutilizável
│   │   ├── DashboardMembros.jsx
│   │   ├── DashboardCongregacoes.jsx
│   │   ├── DashboardEventos.jsx
│   │   ├── DashboardAniversariantes.jsx
│   │   └── DashboardFinanceiro.jsx
│   └── MapaMinisterial.jsx
│
├── components/
│   ├── composite/
│   │   ├── dashboard/
│   │   │   ├── DashboardCard.jsx       ← Card clicável
│   │   │   ├── KpiCard.jsx             ← Indicador com variação BR
│   │   │   ├── ChartBar.jsx
│   │   │   ├── ChartLine.jsx
│   │   │   ├── ChartDonut.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── PeriodFilter.jsx
│   │   │   └── ExportButton.jsx
│   │   └── SparklineChart.jsx          ← Já existe, mantido
│   └── mapa/
│       ├── MapaView.jsx                ← Leaflet wrapper
│       └── CongregacaoCard.jsx         ← Card de indicador
│
├── mocks/generators/
│   ├── ...                             ← Mantido
│   └── index.js
│
├── router.jsx                          ← Expandido
│
└── stores/assistente.js                ← Expandido: setContexto()
```

### 2.2 Fluxo de navegação

```
/dashboard
  └── 16 cards → clica → /dashboard/:tipo (ex: /dashboard/membros)
       └── Breadcrumb: Dashboard > Membros
/mapa
  └── Leaflet mapa + health cards
```

Sidebar:
- Dashboard Principal → grupo **Visão Geral** → destaque na rota `/dashboard`
- Mapa Ministerial → grupo **Igreja** → rota `/mapa`

### 2.3 Padrão de tela-dashboard (DashboardTemplate)

```
┌─────────────────────────────────────────┐
│ Dashboard de Membros          [Exportar] │ ← Título + ExportButton
│ Período: [Últimos 12 meses ▾]           │ ← PeriodFilter
├─────────────────────────────────────────┤
│ [KPI] [KPI] [KPI] [KPI]                │ ← KpiCards (4-6)
├─────────────────────────────────────────┤
│ [ChartBar]         [ChartDonut]         │ ← Gráficos lado a lado
├─────────────────────────────────────────┤
│ [ChartLine histórico]                   │ ← Timeline
├─────────────────────────────────────────┤
│ [DataTable - sort, filtro inline]       │ ← Tabela detalhada
└─────────────────────────────────────────┘
```

---

## 3. Componentes

### 3.1 DashboardCard (card clicável do grid)

- Props: `{ icon, label, value, trend, path, color }`
- Ícone lucide + valor formatado (ex: "1.247 membros")
- Trend opcional (+5,2% este mês)
- Cor de destaque (accents diferentes por card)
- Ao clicar: `navigate(path)` → `/dashboard/membros`

### 3.2 KpiCard (indicador nos dashboards)

- Props: `{ label, value, variation, icon, color }`
- Variação BR: positivo verde, negativo vermelho
- Ícone outline com fundo sutil
- Grid responsivo 2×2 → 4×1 em desktop

### 3.3 ChartBar (SVG puro)

- Props: `{ data: {label, value}[], height?, color?, showValues? }`
- Barras verticais com eixo X de labels
- Catmull-Rom opcional para suavizar (herdado do Sparkline)
- Responsivo: viewBox + width="100%"

### 3.4 ChartLine (SVG puro)

- Props: `{ data: {label, value}[], height?, color?, fill? }`
- Curva suave (Catmull-Rom), área opcional com gradiente
- Eixos: linha base + labels X/Y
- Tooltip via `onMouseMove` + `<title>` SVG

### 3.5 ChartDonut (SVG puro)

- Props: `{ data: {label, value, color}[], size?, innerRadius? }`
- Círculo com `stroke-dasharray` para segmentos
- Legenda ao lado ou tooltip

### 3.6 DataTable (tabela com sort/filtro)

- Props: `{ columns: {key, label, format?, sortable?}[], rows, pageSize? }`
- Sort ao clicar no header (asc/desc/none)
- Filtro inline por input
- Paginação local

### 3.7 PeriodFilter

- Props: `{ periods: {label, value}[], value, onChange }`
- Padrão: Últimos 12 meses | Último trimestre | Último mês | Ano atual
- Botão active visual

### 3.8 ExportButton

- `window.print()` com media query `@media print` para ocultar sidebar
- Placeholder: FUTURE: PDF/Excel

### 3.9 MapaView (Leaflet wrapper)

- `useEffect` + `useRef` para instanciar `L.map`
- Pins customizados por status de saúde (verde/amarelo/vermelho)
- Popup ao clicar: nome, membros, crescimento, último relatório
- FitBounds automático para mostrar todas as congregações

### 3.10 CongregacaoCard (lado do mapa)

- Lista de cards com: nome, endereço, membros, crescimento, status
- Destaque ao passar mouse (highlight no pin do mapa)
- Scroll infinito ou paginado

---

## 4. Mock Data

### 4.1 Geradores existentes (reutilizados)

| Gerador | Uso no dashboard |
|---------|------------------|
| `membros` | Membros, Aniversariantes |
| `congregacoes` | Congregações, Mapa |
| `eventos` | Eventos |
| `financeiro` | Financeiro |

### 4.2 Seed

Determinístico (`mulberry32`). Mesmos dados todas as execuções. Se necessário, novo seed por dashboard.

---

## 5. Aion Integration

### 5.1 Contexto por tela

`stores/assistente.js` ganha método `setContexto(tipo, dados)`:

```js
setContexto: (tipo, dados) => set({
  contextoAtual: tipo,          // 'membros' | 'congregacoes' | ...
  dadosContexto: dados,         // dados mock da tela atual
  sistemaPrompt: gerarPrompt(tipo, dados)
})
```

### 5.2 Perguntas exemplo por tela

| Tela | Perguntas |
|------|-----------|
| Dashboard | "Quantos membros temos?", "Qual congregação mais cresceu?" |
| Membros | "Quantas mulheres?", "Quem entrou esse mês?" |
| Congregações | "Sem relatório?", "Menor crescimento?" |
| Eventos | "Eventos esse mês?", "Mais participantes?" |
| Aniversariantes | "Quem faz hoje?", "Lista de julho" |
| Financeiro | "Maior entrada?", "Saldo atual?" |

### 5.3 Fallback

Se Aion não conseguir responder (ex: backend real offline), mantém chat atual sem dados mock.

---

## 6. Rotas

```jsx
<Route path="/dashboard" element={<DashboardPrincipal />} />
<Route path="/dashboard/membros" element={<DashboardMembros />} />
<Route path="/dashboard/congregacoes" element={<DashboardCongregacoes />} />
<Route path="/dashboard/eventos" element={<DashboardEventos />} />
<Route path="/dashboard/aniversariantes" element={<DashboardAniversariantes />} />
<Route path="/dashboard/financeiro" element={<DashboardFinanceiro />} />
<Route path="/mapa" element={<MapaMinisterial />} />
```

Sidebar atualizada: Dashboard Principal em **Visão Geral** → link `/dashboard`. Mapa Ministerial em **Igreja** → link `/mapa`.

---

## 7. Estados

- **Loading:** Skeleton nos cards (já temos `LoadingSkeleton` da Fase 1)
- **Empty:** `EmptyState` (já temos) — "Nenhum registro encontrado"
- **Error:** `ErrorBoundary` (já temos)
- **Data vazia em gráfico:** mensagem inline "Sem dados para o período"

---

## 8. Limitações / Avisos

- Leaflet tiles via CDN (OpenStreetMap) — requer internet
- Export = `window.print()` — placeholder real para PDF/Excel adiado
- Gráficos SVG puros — sem animação (sem framer-motion)
- Aion responde em mock — perguntas sobre dados não mockados caem no backend real

---

## 9. Critérios de Sucesso

- `npm run lint`: 0 erros, 0 warnings
- `npm run build`: sucesso com PWA artifacts
- 16 cards no Dashboard Principal com navegação funcional
- 5 dashboards com KPIs, gráficos, tabela funcionando com dados reais
- Mapa Ministerial com pins + popups + health cards
- Aion responde perguntas contextuais nos dashboards
- Leaflet não quebra print (tiles visíveis)

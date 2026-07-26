# PROGRESS.md — Kairos-app

> Última atualização: 2026-07-24

## Testes de Importação — OK

| Etapa | Resultado |
|-------|-----------|
| `POST /api/importacao/analisar` | ✅ 7 linhas lidas, IA mapeou corretamente |
| `POST /api/importacao/preview` | ✅ 6 válidos, 1 problema (nome vazio), 0 duplicados |
| `POST /api/importacao/executar` | ✅ 6 membros importados |
| `GET /api/membros` | ✅ 6 membros na congregação |
| `GET /api/importacao/historico` | ✅ log com status=concluido |
| `POST /api/importacao/desfazer/{id}` | ✅ 6 removidos, GET /membros = 0 |

### Ajustes no banco (migração manual)

A tabela `membros` não tinha coluna `importacao_id` (modelo SQLAlchemy esperava). Adicionado via ALTER TABLE.

Colunas faltantes em `importacoes_log`: `processados`, `storage_path`. Adicionadas via ALTER TABLE.

### Observações

- `CAMPOS_KAIROS` em `importacao.py` **não** inclui `"sexo"` — IA mapeia como `null`. Se quiser mapear sexo, adicionar ao dict.
- `parse_date` em `utils.py` já trata `dd/mm/YYYY`, `YYYY-mm-dd`, etc. ✅
- Sessão de importação (`_sessoes`) é em memória — perdida ao reiniciar servidor.

## Visão Geral

Transformar o App Sede Igreja em plataforma administrativa premium com integração inteligente Aion — todas as 4 fases implementadas.

## Stack

React 19 + Vite 8 + Tailwind v4 + Radix UI + TanStack Query + zustand + lucide-react + Leaflet (CDN)

## O Que Foi Feito

### Fase 1 — Fundação
- Tokens Tailwind v4 (kairos-* colors, fonts)
- ThemeProvider (dark/light mode com persistência zustand)
- Sidebar recolhível + Topbar + RootLayout
- 10 mock generators BR (~4300 registros)
- `useMockData` hook, StatCard + Sparkline
- LoadingSkeleton + EmptyState + ErrorBoundary

### Fase 2 — Dashboard Principal + Mapa Ministerial + Aion
- 8 componentes: DashboardCard, KpiCard, ChartBar/Line/Donut, DataTable, PeriodFilter, ExportButton
- DashboardTemplate (layout reutilizável)
- DashboardPrincipal (16 cards, grid 4×4)
- 5 dashboards: Membros, Congregações, Eventos, Aniversariantes, Financeiro
- Mapa Ministerial (Leaflet, pins por UF, health indicators)
- Gerador financeiro (500 registros, 15 categorias)
- Store Aion: `setContexto`, `limparContexto`

### Fase 3 — Módulos Eclesiásticos
- Pastores, Obreiros, Departamentos, Células, Cultos
- Gerador `celulas` (80 células)

### Fase 4 — Módulos Operacionais
- Escalas, Patrimônio, Veículos, Projetos, Documentos, Biblioteca, Comunicação, Relatórios
- 5 geradores: patrimonio, veiculos, projetos, biblioteca, comunicacao

### Finalização
- **18 rotas** em App.jsx (13 dashboards + Mapa + DashboardPrincipal + 3 existentes)
- **Sidebar**: `routeExists: true` para todos os módulos
- **Lint**: 0 erros
- **Build**: 800ms, PWA intacto

## Total de Artefatos

| Item | Quantidade |
|------|-----------|
| Dashboard pages | 18 |
| Mock generators | 17 |
| Dashboard components | 8 |
| Mapa components | 2 |

## Decisões-Chave

- DashboardCards com path "#" para módulos sem página de listagem — clique não navega
- Leaflet via CDN puro (sem wrapper React)
- Relatórios como página informativa (jspdf/xlsx proibidos)
- Todas as fases implementadas sem alterar banco, APIs ou regras de negócio

## Next Steps

- (todas as 4 fases concluídas — aguardando próximas instruções)

# Auditoria Completa da Plataforma Kairós + AION

> **Data:** 2026-07-02
> **Escopo:** kairos-core, kairos-assistant, kairos-agent, kairos-platform, kairos-voice, kairos-vision, hermes-os, hermes-saas, hermes-agente-nvideas, Kairos-app, kairos-sede-sorocaba-repo, app-politica, louvorapp
> **Método:** leitura estática + diffs + análise de fluxo. **Nenhuma alteração foi feita.**

---

## 1. Nota Geral da Plataforma: **34/100**

| Dimensão | Nota | Comentário |
|---|---|---|
| Arquitetura | 30/100 | 3 implementações de "Hermes" em paralelo; 2 de "Kairos core"; "AION" é stub |
| Segurança | **15/100** | Zero auth no kairos-core; API keys públicas no bundle; senhas hard-coded |
| Performance | 40/100 | saveDb síncrono a cada write; full-history enviada a cada chat turn |
| Escalabilidade | 25/100 | 6 backends que não se conversam; SQLite sem índices; backups race condition |
| IA/Agentes | 35/100 | Funciona em kairos-assistant; LangGraph é nome enganoso; AION é demo data |
| Memória | 25/100 | Conversation history real; memória long-term vazia; sem RAG; sem embeddings |
| Comunicação entre Apps | 10/100 | Cada app é silo isolado; não compartilham API, DB ou eventos |
| Banco de Dados | 35/100 | SQLite (kairos-core) + Postgres (kairos-assistant) + Supabase (hermes) — fragmentado |
| APIs | 40/100 | FastAPI bem desenhada em kairos-assistant; Express cru em kairos-core |
| Frontend | 50/100 | Next.js 16 + Zustand OK; PWA quebrado; rotas mortas; mojibake |
| Backend | 35/100 | 14 endpoints sem auth, 0 testes, hard-coded secrets |
| UX/UI | 45/100 | Design tokens OK; 4 placeholders; 4 nav links quebrados; encoding bugs |
| Testes | 5/100 | 23 testes em kairos-agent apenas; zero em todos os outros backends |
| Documentação | 50/100 | PROGRESS.md e PRD existem; PRD descreve plataforma futura, não a atual |

**Resumo:** a plataforma tem **bases sólidas** em alguns pontos (kairos-assistant usa Clean Architecture; hermes-os tem Prisma+Bull+JWT+RBAC; ObsidianVault é real), mas está **muito longe da visão** descrita no PRD e nos prompts. Há **3 implementações paralelas** de Hermes, **2 do core**, e **0 testes** na maioria dos serviços críticos. A segurança é o ponto mais fraco: **qualquer pessoa pode ativar licenças, deletar backups, ou ler conversas alheias** via `curl`.

---

## 2. Arquitetura

### Estado Real vs Visão

| Componente da visão | Existe? | Onde | Nível de maturidade |
|---|---|---|---|
| **AION como cérebro central** | Parcial | `kairos-assistant/kairos-aion-integration/` | 30% — funciona, mas cai em demo data |
| Apps independentes | Parcial | Cada um em repo separado | 60% — apps existem, mas não conversam |
| Banco independente por app | **NÃO** | Todos compartilham | 10% — `tenant_id` no mesmo DB |
| APIs independentes | Sim | Cada app tem sua API | 70% |
| Agentes próprios por app | Parcial | `kairos-assistant/backend/app/agents/` | 50% — 5 agents reais, 2 stubs |
| Chat próprio por app | Parcial | `kairos-assistant` tem; resto usa Telegram/whatsapp | 40% |
| Comunicação entre Apps | **NÃO** | Cada app é silo | 0% |
| Orquestrador central | Parcial | `kairos-assistant/core/orchestrator.py` | 60% — só orquestra dentro de si mesmo |
| Memória Persistente | Parcial | `Memory` table, conversation history | 30% — sem embeddings |
| Integração com Obsidian | Parcial | `kairos-agent` tem; cloud não chama | 40% — protocolo existe, WebSocket não usado |
| Sistema de Skills | Sim | `ToolRegistry` + `AionSkillRegistry` | 70% — funciona |
| Sistema de Ferramentas | Sim | `ToolRegistry` + `app/tools` routes | 80% |
| Planejamento dos Agentes | Parcial | `langgraph_orchestrator.py` | 30% — "LangGraph" é nome enganoso |
| Memória de longo prazo | Stub | `MemoryManager.store_long_term()` existe | 10% — LLM nunca chama |
| Memória de curto prazo | Sim | `Conversation`+`Message` | 90% |
| Contexto compartilhado | Parcial | `ContextManager` in-memory | 30% — perdido no restart |
| RAG | **NÃO** | `Document.embedding` column vazia | 0% — sem pgvector, sem chromadb |
| Embeddings | **NÃO** | Nenhum embedder em uso | 0% |
| Vetorização | **NÃO** | — | 0% |
| Cache | Parcial | `Memory` table; sem Redis cache | 30% |
| Logs | Sim | `AuditLog`, `AuditLogger`, `console.log` | 60% |
| Observabilidade | **NÃO** | Sem Prometheus, sem OpenTelemetry | 0% |
| Telemetria | **NÃO** | — | 0% |
| Multiempresa | Parcial | `tenant_id` em todos os lugares | 60% (mas DB compartilhado) |
| Multiusuário | **NÃO** em kairos-core, Parcial em kairos-assistant | sem `user_id` real | 30% |
| Permissões | Parcial | `PermissionCheckable` em kairos-core, RBAC completo em hermes-os | 50% |
| RBAC | Sim em hermes-os, Não em kairos-core | SUPERADMIN/OWNER/ADMIN/MEMBER/VIEWER | 40% |
| Auditoria | Sim | `AuditLog` + `AuditLogger` | 50% |

### Principais débitos arquiteturais

1. **Três "Hermes"** em paralelo (`hermes-os`, `hermes-saas`, `hermes-agente-nvideas`) — cada um em arquitetura diferente, sem código compartilhado.
2. **Dois "Kairos core"** — `kairos-core` (Express + sql.js, ativo) e `kairos-platform` (NestJS + Prisma, esqueleto).
3. **SDK fragmentado** — `kairos_integration.py` foi copiado para 4 apps com divergências (4 endpoints de registro diferentes, 3 esquemas de auth, payloads inconsistentes).
4. **AION não tem servidor** — o módulo cliente finge se conectar a `http://localhost:8080`, mas **nenhum projeto no disco expõe essa porta**. Cai sempre em `_demo_skills`.
5. **Slug collision** entre `Kairos-app` e `kairos-sede-sorocaba-repo` (ambos usam `slug="sede-sorocaba"`).
6. **PRD descreve plataforma que não existe** — `kairos-platform` (NestJS+Prisma+Postgres+Redis+MinIO) é um esqueleto de 30% completo.

---

## 3. Segurança: **15/100** (CRÍTICO)

### Crítico — vulnerabilidades exploráveis hoje

| # | Severidade | Problema | Arquivos | Impacto |
|---|---|---|---|---|
| S-01 | **CRÍTICO** | **Zero autenticação em todos os endpoints `/api/admin/*`, `/api/license/*`, `/api/backup/*` no kairos-core** | `kairos-core/backend/src/admin/admin.ts`, `license.ts`, `backup.ts` | Qualquer pessoa pode: criar clientes, ativar licenças permanentemente, deletar backups, deletar qualquer licença |
| S-02 | **CRÍTICO** | **API Key hard-coded e pública no bundle Next.js** | `kairos-assistant/docker-compose.yml:66`, `src/app/(dashboard)/chat/client.tsx:7` | Atacante faz scrape do JS e ganha acesso direto ao backend |
| S-03 | **CRÍTICO** | **Senha admin default `admin@fotoagenda.com / admin123`** | `kairos-core/docker-compose.yml:36-37` | Login admin com senha pública (se auth existisse) |
| S-04 | **CRÍTICO** | **`/api/license/activate` é privilege escalation** | `kairos-core/backend/src/admin/license.ts:99-118` | Sem auth, qualquer um ativa licenças para qualquer cliente |
| S-05 | **CRÍTICO** | **`POST /api/backup/restore/:filename` sem auth e path-traversal** | `kairos-core/backend/src/admin/backup.ts:21-30` | Atacante pode trocar o DB de produção por qualquer arquivo |
| S-06 | **CRÍTICO** | **OpenRouter API key em plaintext** no `settings` table + no JS bundle | `kairos-core/backend/src/settings/settings.ts` | Key do usuário lida por qualquer admin via `GET /api/settings` |
| S-07 | ALTO | **CORS `*` + `allow_credentials=True`** em vários backends | `kairos-assistant/backend/app/main.py:130`, `kairos-core/backend/src/main.ts:18` | XSS, CSRF se cookies forem usados |
| S-08 | ALTO | **JWT_SECRET default `kairos-dev-secret-change-in-prod`** | `kairos-assistant/backend/app/config.py:18` | Se ninguém setar a env var, prod usa secret pública |
| S-09 | ALTO | **Telegram HTML injection** — `parse_mode: "HTML"` sem escape | `kairos-core/backend/src/telegram/bot.ts:28` | Resposta do LLM injeta tags HTML arbitrários |
| S-10 | ALTO | **VPS IP público hard-coded** em vários serviços | `kairos-assistant/frontend/src/services/api.ts:7` | Vaza infra do cliente |
| S-11 | ALTO | **CORS + 50MB body limit** no kairos-core | `kairos-core/backend/src/main.ts:18-19` | DoS por OOM |
| S-12 | ALTO | **`setup.py` do kairos-agent está quebrado** — lista `aiohttp` mas o código importa `httpx` | `kairos-agent/setup.py:18`, `kairos-agent/src/kairos_integration.py:9` | `pip install .` deixa o SDK não importável |
| S-13 | MÉDIO | **API key armazenada em plaintext no disco** | `kairos-agent/src/connection/client.py:23`, `kairos-agent/src/security/crypto.py:46-49` | Atacante com acesso ao FS lê a key |
| S-14 | MÉDIO | **Permissões com `approved=True` E `requires_approval=True`** | `kairos-agent/src/security/permissions.py:7-22` | Auto-aprovação permanente de ações perigosas |
| S-15 | MÉDIO | **Sem rate limiting em nenhum backend** | Todos | DoS por spam de requests |
| S-16 | MÉDIO | **`/api/agent/ws` aceita `?token=...` no query string** | `kairos-assistant/backend/app/routes/agent_ws.py:29-48` | Token vazado em logs de proxy/load balancer |
| S-17 | MÉDIO | **Backup sem compressão, sem encryption, sem integrity check** | `kairos-core/backend/src/database/backup.ts:30` (comentário "Compactar" é mentira) | Backup roubado = DB vazado |
| S-18 | BAIXO | **Vazamento de erro cru** ao cliente | `kairos-core/backend/src/chat/chat.ts:96`, `telegram/bot.ts:95` | Mensagens internas do OpenRouter/Telegram expostas |

### Vulnerabilidades LGPD

- Conversation history retida indefinidamente sem mecanismo de exclusão.
- Sem controle de residência de dados (todos os dados vão para OpenRouter).
- Sem DPO (Data Protection Officer) na plataforma.
- Sem consent flow explícito para processamento por LLM.

---

## 4. Performance: **40/100**

| # | Severidade | Problema | Detalhes |
|---|---|---|---|
| P-01 | ALTO | **`saveDb()` síncrono a cada write** no kairos-core | `kairos-core/backend/src/database/database.ts:11-16` — cada `INSERT`/`UPDATE` re-serializa o DB inteiro e reescreve o arquivo. Em produção, isso é O(N) por operação |
| P-02 | ALTO | **Full conversation history enviada a cada chat turn** | `kairos-core/backend/src/chat/chat.ts:82` + `kairos-assistant/core/orchestrator.py:181` — sem windowing, sem summarização |
| P-03 | ALTO | **Sem índices no banco SQLite do kairos-core** | `clients.client_id`, `apps.slug`, `licenses.app_id`, `messages.conversation_id` — todos full-scans |
| P-04 | MÉDIO | **`runSql` chama `saveDb` em cada chamada** | 5 inserts/updates por chat turn = 5 `fs.writeFileSync` |
| P-05 | MÉDIO | **Linha exata `turbopack: { root: process.cwd() }` é no-op** | `kairos-assistant/next.config.ts:7-8` |
| P-06 | MÉDIO | **Sidebar com 4 links quebrados** (404 cada vez que o user clica) | `kairos-assistant/src/components/layout/Sidebar.tsx:25-36` |
| P-07 | BAIXO | **HomeDashboard com `Math.random()` por render** | `kairos-assistant/src/components/home/HomeDashboard.tsx:403` |

---

## 5. Escalabilidade: **25/100**

1. **3 "Hermes" paralelos** sem consolidação.
2. **Banco SQLite em produção** (kairos-core) — não escala além de ~1k writes/s.
3. **Sem cache distribuído** — `kairos-assistant` não usa Redis, `kairos-core` usa só para Sidekiq.
4. **Backup sem offsite** — `data/backups/` é local, sem S3/GCS.
5. **Sem rate limiting** — qualquer cliente pode saturar.
6. **Sem horizontal scaling** — `kairos-assistant` mantém `Conversation` em Postgres mas também tem estado in-memory em `ContextManager` que não compartilha entre instâncias.
7. **Self-deploy trava em 1 VPS** — não há manifest Kubernetes.

---

## 6. IA: **35/100**

### LLM
- **1 provedor**: OpenRouter via SDK `openai` (kairos-assistant) ou `httpx` (kairos-core).
- **1 modelo default**: `openrouter/auto` (kairos-assistant) ou `openai/gpt-oss-120b:free` (kairos-core).
- **Sem retry, sem circuit breaker, sem fallback, sem timeout configurável** (além de fixo 120/300s).
- **Sem streaming SSE real** — kairos-assistant usa `text/plain` com chunks novos-linha (não é SSE).
- **Sem token counting** — assume que o provedor respeita o context window.
- **Erro cru exposto ao cliente** (`chat.ts:96`).
- **System prompt com PII inline** (kairos-core) — todos os clientes vão para o OpenRouter a cada turn.

### AION
- **Stub** — `connector.connect()` não faz handshake, lista hard-coded.
- **Default `AION_BASE_URL=http://localhost:8080`** — **nenhum projeto expõe essa porta**.
- **`_register_aion_capability` é `pass`** — capabilities descobertas não são registradas.
- **"LangGraph" orchestrator** é **misnomer** — não usa `StateGraph`, só 3 chamadas LLM sequenciais; tem um `for step in steps: pass` que é no-op.
- **Demo skills sempre** — `analisar_documento`, `gerar_relatorio`, `analisar_dados` hard-coded.

### Memory
- **Conversation history**: real, persistida em Postgres.
- **Short-term memory (Redis)**: real em `hermes-agente-nvideas` (24h TTL).
- **Long-term memory**: stub — `store_long_term()` nunca é chamado pelo LLM.
- **Embeddings**: **zero**. Nenhum embedder em uso.
- **RAG**: **zero**. `Document.embedding` column vazia.
- **Obsidian**: real em `kairos-agent` (filesystem), **não conectado** ao cloud.

---

## 7. Agentes: **35/100**

| Agente | Onde | Real? |
|---|---|---|
| `AionChurchAgent` | kairos-assistant | ✅ Real (300+ linhas, real keyword scoring, real DB writes) |
| `GuideAgent` | kairos-assistant | ✅ Real (OpenRouter + APP_MANIFEST) |
| `VaultAgent` | kairos-assistant | ✅ Real (keyword scoring + vault_service) |
| `DocumentsAgent` | kairos-assistant | ❌ Stub (apenas help text) |
| `ToolsAgent` | kairos-assistant | ✅ Real (lista DB) |
| `AionLangGraphOrchestrator` | kairos-assistant | ❌ Misnomer (não usa LangGraph) |
| `AionRuntime` | kairos-agent | ❌ Stub (retorna `{"note": "..."}`) |
| `MCPClient` | kairos-agent | ❌ Stub (dict storage, no subprocess) |
| `OrquestradorAgent` | hermes-os | ❌ Stub (retorna placeholder) |
| `CrmAgent`, `WhatsappAgent`, etc. | hermes-os | ❌ Stub (todos retornam placeholder) |
| `HermesOrchestrator` | hermes-agente-nvideas | ❌ Não existe (apenas short-term memory) |

**Faltam em todos os agentes:**
- Fallback robusto quando o LLM falha
- Recuperação de erro estruturada
- Logs estruturados por agente
- Permissões por agente (qualquer um pode chamar qualquer um)

---

## 8. Memória: **25/100**

### Real
- `Conversation` + `Message` (kairos-assistant) — conversation history persistida
- `ObsidianVault` (kairos-agent) — filesystem read/write de `.md`, wikilinks regex, backlinks
- `Memory` table (kairos-assistant) — `key/value/category` com tipos `session/preference/long_term`
- `agent_memories` (hermes-os/hermes-saas) — definida em schema, nunca escrita

### Aspiracional
- **Embeddings** — column `embedding TEXT` vazia, sem embedder configurado
- **RAG** — `embeddings.py` em `kairos-assistente/` é "placeholder para Fase 2 com pgvector", nunca construído
- **Long-term memory** — método existe, LLM nunca chama
- **Background memory extraction** — sem job que extrai facts de conversations
- **Vector store** — zero (sem pgvector, chromadb, qdrant, faiss, weaviate)
- **Memory versioning** — zero

### Bug
- `kairos-assistant/backend/app/routes/vault.py:16` — `_tenant_id()` retorna `"default"` literal, todas as operações de vault são hard-coded para um único tenant.

---

## 9. Comunicação entre Apps: **10/100**

**Não existe.** Cada app é um silo isolado:
- `kairos-assistant` fala com `kairos-agent` via WebSocket (parcial — só logs).
- `app-politica`, `Kairos-app`, `louvorapp` falam com `kairos-assistant` via SDK HTTP (mas só na inicialização).
- `hermes-os`, `hermes-saas`, `hermes-agente-nvideas` **não conversam** com nenhum outro projeto.
- **Sem message broker, sem event bus compartilhado, sem gRPC, sem fila entre apps.**

---

## 10. Banco de Dados: **35/100**

| Projeto | Engine | Modelos | Saúde |
|---|---|---|---|
| kairos-core | SQLite (sql.js) | 10 tabelas | Sem índices; saveDb síncrono |
| kairos-assistant | PostgreSQL | 9 modelos | FKs OK, sem índices de performance |
| kairos-platform | Prisma+PostgreSQL | 30 modelos (schema apenas) | 30% implementado |
| hermes-os | Prisma+PostgreSQL | 18 modelos | 70% — RBAC, billing, AI usage |
| hermes-saas | pg + migrations | 12 migrations | Deploy em produção |
| hermes-agente-nvideas | Supabase | — | Stubs |
| app-politica, Kairos-app, louvorapp | Cada um seu próprio | 1-2 tabelas cada | — |

**Problemas:**
- **6 bancos diferentes** para "uma plataforma".
- **Sem migrações versionadas** em vários.
- **Sem connection pooling** (kairos-assistant: `pool_size=5, max_overflow=10` mas `pool_pre_ping=False`).
- **Sem estratégia de backup unificada**.
- **Sem replicação/HA**.

---

## 11. APIs: **40/100**

### kairos-assistant (FastAPI) — **MELHOR**
- 11 routers, 58 endpoints
- Pydantic v2 para validação
- Bearer API key por tenant
- Tipagem OpenAPI

### kairos-core (Express) — **PIOR**
- 30 endpoints
- Validação manual `if (!field) return 400`
- Zero documentação OpenAPI
- 50MB body limit

### hermes-os (Fastify) — **BOM**
- Prisma typed
- JWT + refresh tokens + RBAC
- WebSocket + BullMQ

### Problemas transversais
- **Sem rate limiting** em qualquer API
- **Sem idempotency keys** (causa duplicação em webhooks)
- **Sem versionamento** (`/api/v1` é raro)
- **Sem API gateway** (cada app expõe direto)

---

## 12. Frontend: **50/100**

| Aspecto | Nota | Comentário |
|---|---|---|
| Stack moderno | 80/100 | Next.js 16, React 19, Tailwind 4, Zustand 5 |
| TypeScript strict | 90/100 | strict mode, zero `any`, zero `@ts-ignore` |
| Componentização | 60/100 | Componentes base em `@base-ui/react`, mas `HomeDashboard.tsx` é monolítico (434 linhas) |
| PWA | 30/100 | manifest existe, sw.js nunca registrado, install prompt nunca implementada |
| Responsividade | 60/100 | `viewport-fit=cover`, layout responsivo, mobile bar |
| Encoding | **20/100** | Mojibake PT-BR em ~20+ strings (`InÃ­cio`, `KairÃ³s`, `InteligÃªncia`) |
| UX/UI | 50/100 | Design tokens bons; 4 nav links quebrados; 4 pages placeholder |
| Performance | 60/100 | Single bundle (sem chunking); i18n estático |

---

## 13. Backend: **35/100**

| Projeto | Linhas | Rotas | Tests |
|---|---|---|---|
| kairos-core | 640 | 30 | 0 |
| kairos-assistant | ~3500 | 58 | 0 |
| kairos-agent (SDK) | 191 | 0 | 5 |
| hermes-os | ~5000 | 12 | 0 |
| hermes-saas | ~3000 | ~20 | 0 |
| **TOTAL** | ~12000 | ~120 | **5** |

---

## 14. UX/UI: **45/100**

### Problemas
- **Mojibake massivo** em `Sidebar.tsx` e `HomeDashboard.tsx` (20+ strings)
- **4 nav links quebrados** (Sidebar → `/agentes`, `/skills`, `/historico`, `/painel` que não existem)
- **4 páginas placeholder** (`/ajuda`, `/configuracoes`, `/documentos`, `/ferramentas`)
- **Sem loading states** em vários lugares (`aion/page.tsx:90-93` apenas setLoading)
- **Sem error boundaries** em rotas
- **PWA não funciona** — sw.js nunca registrado
- **Sidebar desktop com `Math.random()` por render** (voice bar)
- **Tela de chat tem 1 arquivo de 1.5k linhas** (`Widget/index.tsx` se viesse do kairos-assistant)

---

## 15. Bugs Críticos (15 itens)

| # | Severidade | Bug | Onde | Fix recomendado |
|---|---|---|---|---|
| B-01 | **CRÍTICO** | `kairos-core` não tem auth em nada | `backend/src/admin/*.ts`, `database/*.ts` | Implementar JWT + RBAC completo; ou marcar como legacy e migrar tudo para kairos-assistant |
| B-02 | **CRÍTICO** | `paginated_response` perde `pagination` | `kairos-assistant/core/utils/response.py` | Tipar `meta: Union[MetaInfo, MetaInfoPagination]` |
| B-03 | **CRÍTICO** | Slug collision `sede-sorocaba` em 2 apps | `Kairos-app` + `kairos-sede-sorocaba-repo` | Diferenciar slugs ou deletar o clone |
| B-04 | **CRÍTICO** | `langgraph_orchestrator.py` é misnomer | `kairos-assistant/backend/app/agents/langgraph_orchestrator.py` | Renomear ou implementar StateGraph de verdade |
| B-05 | **CRÍTICO** | `mojibake` PT-BR em produção | `kairos-assistant/src/components/**/*.tsx` | Re-salvar arquivos com encoding UTF-8 |
| B-06 | **CRÍTICO** | AION target `localhost:8080` nunca existe | `kairos-aion-integration/connector.py` | Decidir: ou construir o servidor AION ou remover a abstração |
| B-07 | ALTO | 3 implementações paralelas de Hermes | `hermes-os`, `hermes-saas`, `hermes-agente-nvideas` | Escolher uma, descontinuar as outras, ou transformar uma em "core" |
| B-08 | ALTO | `_register_aion_capability = pass` | `kairos-assistant/core/container.py:104-106` | Implementar o registro de capabilities no ToolRegistry |
| B-09 | ALTO | `setup.py` do kairos-agent quebrado | `kairos-agent/setup.py:18` | Adicionar `httpx` e `mcp` a `install_requires` |
| B-10 | ALTO | Slug já registrado → HTTP 400, mas SDK espera 409 | `kairos-assistant/core/app_registry.py` + SDKs | Mudar para 409 ou SDK aceitar 400 |
| B-11 | ALTO | Backup race condition + comentário "Compactar" é mentira | `kairos-core/backend/src/database/backup.ts` | Usar `setInterval` com guard async; comprimir com zlib |
| B-12 | ALTO | `event_bus` async handler check quebrado | `kairos-assistant/core/application/event_bus.py:16` | `asyncio.iscoroutinefunction` em vez de `__name__ == "coroutine"` |
| B-13 | MÉDIO | `kairos-assistant` PWA nunca registra SW | `kairos-assistant/src/lib/` (no register call) | Adicionar `navigator.serviceWorker.register('/sw.js')` |
| B-14 | MÉDIO | 4 nav links quebrados | `kairos-assistant/src/components/layout/Sidebar.tsx:25-36` | Criar `app/(dashboard)/{agentes,skills,historico,painel}/page.tsx` |
| B-15 | MÉDIO | `kairos-assistant/backend/app/routes/chat.py:50` — `user_id="api-user"` literal | `backend/app/routes/chat.py` | Aceitar `user_id` do header ou query |

---

## 16. Problemas Críticos (resumo)

**Os 5 problemas que mais impactam a produção hoje:**

1. **Zero autenticação no kairos-core** (S-01) — qualquer um ativa licenças, deleta backups, lê clientes.
2. **API key pública no bundle Next.js** (S-02) — qualquer visitante pode usar a API diretamente.
3. **3 Hermes paralelos sem consolidação** — 3 times, 3 backends, 3 bancos, 3 deploys.
4. **AION é stub** (B-06) — o "cérebro central" não existe; só há demo data.
5. **Zero testes em 6 de 7 backends** (P-01 adjacente) — qualquer mudança quebra silenciosamente.

---

## 17. Problemas Médios

- Encoding mojibake em 20+ strings de UI
- Hard-coded IPs de produção em código
- Backup sem compressão, encryption, offsite
- Sem rate limiting em qualquer API
- Sem RAG, sem embeddings, sem memória long-term funcional
- PWA quebrada (sw.js nunca registrado)
- 4 nav links quebrados
- 4 páginas placeholder
- SaveDb síncrono a cada write (SQLite)
- Slug collision entre Kairos-app e clone

---

## 18. Problemas Leves

- Tipos `any` em kairos-core (TypeScript)
- `try/except: pass` em 6+ lugares críticos
- "LangGraph" no nome sem usar LangGraph
- PRD descreve plataforma futura
- `cryptography` instalado mas nunca usado
- `aiohttp-socks` em requirements mas não usado
- `mcp` importado mas não em requirements

---

## 19. Melhorias Recomendadas (por área)

### Banco de dados
- Consolidar todos em **1 schema Postgres** com `tenant_id` e `app_slug` como discriminantes.
- Habilitar **pgvector** para embeddings.
- Adicionar **índices** em todas as FKs.

### IA
- Implementar **embeddings reais** (OpenAI `text-embedding-3-small` ou similar).
- Adicionar **RAG** com vector store.
- Implementar **background memory extraction** (job diário que extrai facts de conversations).
- Adicionar **retry + circuit breaker** (tenacity) no LLM client.
- Implementar **streaming SSE real** (não `text/plain`).

### Segurança
- **JWT em todos os backends** com secret rotation.
- **RBAC completo** (roles + permissions por endpoint).
- **Rate limiting** (token bucket por IP e por user).
- **Vault de secrets** (HashiCorp Vault, AWS Secrets Manager).
- **Audit log imutável** com hash chain.
- **LGPD**: consent flow, right-to-be-forgotten, data residency.

### Performance
- **Connection pooling** + `pool_pre_ping=True`.
- **Cache distribuído** (Redis) para `GET /api/memory/*` e `GET /api/global_config`.
- **Windowing de conversation history** (últimos N messages + summary dos anteriores).
- **Streaming real** com SSE ou WebSocket.

### Escalabilidade
- **API Gateway** (Kong, Tyk, ou Traefik + middlewares).
- **Service mesh** (Linkerd, Istio) ou **Kubernetes manifests**.
- **Multi-region deploy** com Redis cache compartilhado.
- **Event-driven** (Kafka, NATS) para comunicação inter-app.

### DX
- **TypeScript strict** em todos os projetos.
- **Testes obrigatórios** (CI gate: 80% coverage).
- **Conventional commits** + **semantic-release**.
- **OpenAPI/Swagger** em todos os backends.
- **Storybook** para componentes.
- **Storybook + visual regression tests** (Chromatic/Percy).

---

## 20. Plano de Correção Prioritário

### 🔴 FASE 1 — Segurança Crítica (Sprint 1-2, 2-3 semanas)

| # | Tarefa | Esforço | Dono sugerido |
|---|---|---|---|
| 1 | **Adicionar JWT + RBAC a kairos-core** (todas as 30 rotas) | 1 semana | Backend |
| 2 | **Remover API key hard-coded do bundle Next.js** (mover para server-side) | 1 dia | Frontend |
| 3 | **Trocar senhas default `admin123`** + rotacionar `JWT_SECRET` | 1 dia | DevOps |
| 4 | **Implementar `/api/license/activate` com admin auth** | 1 dia | Backend |
| 5 | **Path traversal no `/api/backup/restore`** — validar filename | 1 dia | Backend |
| 6 | **Adicionar rate limiting** (express-rate-limit + slowapi) | 1 dia | Backend |
| 7 | **Criptografar settings.api_key** (Fernet ou similar) | 1 dia | Backend |
| 8 | **Fix PWA**: registrar service worker | 2 horas | Frontend |

### 🟡 FASE 2 — Consolidação arquitetural (Sprint 3-6, 4-6 semanas)

| # | Tarefa | Esforço | Dono |
|---|---|---|---|
| 9 | **Decidir o futuro do Hermes**: consolidar 3 implementações em 1 | 1 semana discussão + 2 sem execução | Arquiteto + 3 times |
| 10 | **Consolidar Kairos core**: escolher kairos-assistant (FastAPI) ou kairos-core (Express) e descontinuar o outro | 1 semana discussão + 4 sem migração | Arquiteto |
| 11 | **Resolver slug collision** `sede-sorocaba` | 1 dia | Backend |
| 12 | **Implementar AION real OU remover a abstração** | 1 semana | AI team |
| 13 | **Adicionar índices** em todos os bancos | 2 dias | Backend |
| 14 | **Habilitar pgvector** + implementar RAG real | 2 semanas | AI team |
| 15 | **Adicionar testes** (gate de 50% coverage no CI) | 2 semanas (paralelo) | Todos |
| 16 | **Implementar retry + circuit breaker** no LLM | 2 dias | Backend |
| 17 | **Fix mojibake** em ~20 arquivos | 1 dia | Frontend |
| 18 | **Fix PWA paths quebrados** (4 rotas) | 2 horas | Frontend |
| 19 | **Streaming SSE real** no chat | 1 dia | Backend |
| 20 | **Memory long-term funcional** com extração automática | 1 semana | AI team |

### 🟢 FASE 3 — Maturidade (Sprint 7+, 2-3 meses)

| # | Tarefa | Esforço |
|---|---|---|
| 21 | Documentação OpenAPI/Swagger em todos | 1 semana |
| 22 | LGPD: consent flow, right-to-be-forgotten, data residency | 3 semanas |
| 23 | API Gateway + rate limit por tenant | 1 semana |
| 24 | Cache distribuído (Redis) + windowing de conversation | 1 semana |
| 25 | Testes E2E (Playwright) + CI gate 80% | 2 semanas |
| 26 | Storybook + visual regression | 2 semanas |
| 27 | Multi-region deploy + Helm charts | 3 semanas |
| 28 | Auditoria externa de segurança (LGPD/OWASP) | 2 semanas |
| 29 | Substituir TODOS os 3 Hermes por 1 plataforma unificada | 3 meses |
| 30 | Migrar para 1 banco (Postgres) com multi-tenant nativo | 1 mês |

---

## Conclusão

A plataforma Kairós tem **fundações sólidas** em alguns pontos (Clean Architecture no kairos-assistant, Prisma+RBAC no hermes-os, ObsidianVault real, sistema de Tools/Skills) mas está **muito longe** da visão descrita. Os **3 problemas mais urgentes** são:

1. **Segurança** — qualquer pessoa na internet pode ativar licenças, ler clientes, deletar backups
2. **3 Hermes paralelos** — diluição de esforço, codebases divergentes
3. **AION é stub** — o "cérebro central" não existe, só demo data

**Recomendação imediata:** Sprint 1 focado em **FASE 1** (segurança crítica) antes de qualquer feature nova. A plataforma não está pronta para produção open-internet — apenas para uma rede interna com VPN.

**Próximo passo sugerido:** priorizar FASE 1 (8 tarefas, ~2-3 semanas) e agendar a decisão de "qual Hermes sobrevive" para a sprint 3.

---

> **Auditoria conduzida em modo somente-leitura. Nenhuma alteração foi feita ao código-fonte.**

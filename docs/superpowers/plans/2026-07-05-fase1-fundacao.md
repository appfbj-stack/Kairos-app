# Fase 1 — Fundação do Redesign App Sede Igreja — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Estabelecer a fundação visual do App Sede Igreja — Design System, layout raiz, tema dark/light com toggle, mock data layer — sem tocar backend/APIs/banco.

**Architecture:** Tailwind v4 `@theme` com tokens semânticos por seletor `.dark`/`.light`; componentes Shadcn em `components/ui`; compostos reutilizáveis em `components/composite`; layout raiz em `components/layout`; mocks generators TS determinísticos em `mocks/generators` expostos via hook `useMockData` zustand-cache.

**Tech Stack:** React 19, Vite 8, Tailwind v4 (já instalado), Radix UI (parcial), zustand, TanStack Query, lucide-react, react-router-dom v7.

## Global Constraints

- Repo alvo absoluto: `C:\Users\ferna\kairos-sede-sorocaba-repo`. Frontend em `frontend/`.
- **NÃO** alterar: `backend/`, `docker-compose*.yml`, `nginx.conf`, `.env*`, `services/api.js`, `stores/auth.js` (manter interface `useAuthStore` com `usuario`, `logout`, `isAdmin()`, `isMaster()`), páginas existentes em `pages/`.
- **MANTER** todas as rotas atuais de `App.jsx` funcionando (Membros, Congregacoes, etc. — serão estilizadas nas Fases 2-4).
- **Substituir** o `components/layout/Layout.jsx` pelo novo `RootLayout.jsx` — a interface pública permanece `<RootLayout>{children}</RootLayout>`.
- Antes de qualquer commit: `npm run lint` deve passar **sem warnings** e `npm run build` deve gerar `dist/`, `manifest.webmanifest`, `sw.js`, `workbox-*.js` (validar).
- Não instalar: recharts, react-leaflet, framer-motion, jspdf, xlsx (Fases 2-4).
- Commits: estilo existente do repo — `feat:`, `fix:`, `refactor:`, em português, curtos.
- Um commit por task. Cada task termina com lint+build validados.

---

## Task 1: Tokens Tailwind v4 + dark variant

**Files:**
- Create: `frontend/src/styles/globals.css`
- Modify: `frontend/src/main.jsx` (trocar `import './index.css'` → `import './styles/globals.css'`)
- Modify: `frontend/vite.config.js` (garantir que Tailwind scan cobre `styles/**`)

**Interfaces:**
- Produces: tokens CSS semânticos em `globals.css`: `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted`, `bg-primary`, `text-primary`, `shadow-glow`, `rounded-card`. Variantes `.dark`/`.light` em `:root`.

- [ ] **Step 1: Criar globals.css**

```css
/* frontend/src/styles/globals.css */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme {
  --color-background:        #0A0F1F;
  --color-card:              #121C2E;
  --color-card-hover:        #1A2842;
  --color-border:            rgba(0,200,255,.18);
  --color-border-strong:     rgba(0,200,255,.35);
  --color-primary:           #00CCFF;
  --color-glow:              #00D9FF;
  --color-hover:             #45E3FF;
  --color-foreground:        #F8FAFC;
  --color-muted:             #94A3B8;
  --color-success:           #22C55E;
  --color-warning:           #F59E0B;
  --color-danger:            #EF4444;
  --radius-card:             0.75rem;
  --shadow-glow:             0 0 24px -6px rgba(0,217,255,.45);
  --shadow-glow-strong:      0 0 32px -4px rgba(0,217,255,.6);
}

:root, :root.dark {
  --color-background:        #0A0F1F;
  --color-card:              #121C2E;
  --color-card-hover:        #1A2842;
  --color-border:            rgba(0,200,255,.18);
  --color-border-strong:     rgba(0,200,255,.35);
  --color-primary:           #00CCFF;
  --color-glow:              #00D9FF;
  --color-hover:             #45E3FF;
  --color-foreground:        #F8FAFC;
  --color-muted:             #94A3B8;
}

:root.light {
  --color-background:        #F8FAFC;
  --color-card:              #FFFFFF;
  --color-card-hover:        #F1F5F9;
  --color-border:            rgba(15,23,42,.10);
  --color-border-strong:     rgba(15,23,42,.20);
  --color-primary:           #0099CC;
  --color-glow:              #00B8E6;
  --color-hover:             #00BBF0;
  --color-foreground:        #0A0F1F;
  --color-muted:             #475569;
  --color-success:           #22C55E;
  --color-warning:           #F59E0B;
  --color-danger:            #EF4444;
  --shadow-glow:             0 0 18px -6px rgba(0,153,204,.25);
  --shadow-glow-strong:      0 0 24px -4px rgba(0,153,204,.4);
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.skeleton-shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
  animation: shimmer 1.5s infinite;
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  transition: background-color .3s ease, color .3s ease;
}

* { scrollbar-width: thin; scrollbar-color: var(--color-border-strong) transparent; }
```

- [ ] **Step 2: Atualizar main.jsx**

Trocar `import './index.css'` por `import './styles/globals.css'`.

- [ ] **Step 3: Garantir que vite.config.js scaneia styles/**

Ler `frontend/vite.config.js`. Se não houver `@tailwindcss/vite` plugin ativo, NÃO alterar (já está no package.json com versão v4.3.1). Se a config `content: []` existir explícita, adicionar `'./src/styles/**/*.{css,js}'`; se usar auto-detect (v4 default), nada a fazer.

- [ ] **Step 4: Lint + build**

Run:
```
cd frontend && npm run lint && npm run build
```
Expected: lint sem erros; build gera `dist/`, `dist/manifest.webmanifest`, `dist/sw.js`, `dist/workbox-*.js`. Se falhar, NÃO prosseguir — revisar `globals.css`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/globals.css frontend/src/main.jsx
git commit -m "feat: adiciona tokens Tailwind v4 e dark variant para redesign Fase 1"
```

---

## Task 2: lib/utils.js expandido + lib/seed.js

**Files:**
- Modify: `frontend/src/lib/utils.js` (adicionar formatters BR)
- Create: `frontend/src/lib/seed.js`

**Interfaces:**
- Consumes: nada.
- Produces: `cn(...)` (já existe, manter), `formatarNumeroBR(n)`, `formatarMoedaBR(n)`, `formatarDataBR(d)`, `formatarTelefoneBR(s)`, `formatarCpfBR(s)`; `mulberry32(seed)`, `pick(arr, rng)`, `int(min, max, rng)`, `dateBetween(yAtras, yFrente, rng)`, `chance(p, rng)`, `nomeBR(rng)`, `cidadeBR(rng)`.

- [ ] **Step 1: Expandir lib/utils.js**

Manter `cn` existente. Adicionar ao final do arquivo:

```js
// frontend/src/lib/utils.js (append, mantendo cn existente)

const _fmtNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
export const formatarNumeroBR = (n) => _fmtNumero.format(Number(n) || 0);

const _fmtMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarMoedaBR = (n) => _fmtMoeda.format(Number(n) || 0);

export const formatarDataBR = (d) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

export const formatarTelefoneBR = (s = '') => {
  const d = String(s).replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return s;
};

export const formatarCpfBR = (s = '') => {
  const d = String(s).replace(/\D/g, '').padStart(11, '0').slice(0, 11);
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
};
```

- [ ] **Step 2: Criar lib/seed.js**

```js
// frontend/src/lib/seed.js

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];
export const int = (min, max, rng = Math.random) => Math.floor(rng() * (max - min + 1)) + min;
export const chance = (p, rng = Math.random) => rng() < p;

export function dateBetween(yearsAtras, yearsFrente, rng = Math.random) {
  const now = Date.now();
  const offsetMs = (rng() * (yearsAtras + yearsFrente) - yearsAtras) * 365 * 24 * 3600 * 1000;
  return new Date(now + offsetMs);
}

const NOMES_M = ['João','José','Pedro','Paulo','Lucas','Mateus','Marcos','André','Felipe','Rafael','Tiago','Bruno','Carlos','Eduardo','Gabriel','Henrique','Igor','Leonardo','Marcelo','Ricardo','Rodrigo','Sérgio','Thiago','Vinícius','Wesley','Daniel','Fernando','Gustavo'];
const NOMES_F = ['Maria','Ana','Beatriz','Camila','Daniela','Eduarda','Fernanda','Gabriela','Helena','Isabela','Juliana','Larissa','Mariana','Natália','Patrícia','Queila','Rafaela','Sandra','Tamires','Vanessa','Adriana','Bianca','Carla','Daniela','Eliane','Flávia','Gisele','Lívia'];
const SOBRENOMES = ['Silva','Santos','Oliveira','Souza','Costa','Pereira','Ferreira','Almeida','Lima','Ribeiro','Carvalho','Rocha','Alves','Cardoso','Mendes','Barbosa','Freitas','Antunes','Pires','Moraes','Correia','Nunes','Teixeira','Moreira','Nascimento','Araújo','Bernardes','Farias'];

export function nomeBR(rng = Math.random) {
  const primeiro = chance(0.5, rng) ? pick(NOMES_M, rng) : pick(NOMES_F, rng);
  const meio = chance(0.6, rng) ? ' ' + pick([...NOMES_M, ...NOMES_F], rng) : '';
  const sobrenome = `${pick(SOBRENOMES, rng)} ${pick(SOBRENOMES, rng)}`;
  return `${primeiro}${meio} ${sobrenome}`.trim();
}

const CIDADES = [
  ['São Paulo','SP'],['Rio de Janeiro','RJ'],['Belo Horizonte','MG'],['Curitiba','PR'],['Salvador','BA'],
  ['Campinas','SP'],['Guarulhos','SP'],['Sorocaba','SP'],['Osasco','SP'],['São Bernardo do Campo','SP'],
  ['Niterói','RJ'],['Belford Roxo','RJ'],['Contagem','MG'],['Betim','MG'],['Londrina','PR'],
  ['Maringá','PR'],['Feira de Santana','BA'],['Vitória da Conquista','BA'],['Santos','SP'],['Ribeirão Preto','SP'],
  ['Piracicaba','SP'],['Mauá','SP'],['São José dos Campos','SP'],['São João de Meriti','RJ'],['Camaçari','BA'],
];
export const cidadeBR = (rng = Math.random) => pick(CIDADES, rng);

const UFS = ['SP','RJ','MG','PR','BA'];
export const ufBR = (rng = Math.random) => pick(UFS, rng);

export function cpfBR(rng = Math.random) {
  const d = Array.from({ length: 11 }, () => int(0, 9, rng)).join('');
  return d;
}

export function telefoneBR(rng = Math.random) {
  return `${int(11, 99, rng)}9${int(1000, 9999, rng)}${int(1000, 9999, rng)}`;
}
```

- [ ] **Step 3: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/utils.js frontend/src/lib/seed.js
git commit -m "feat: adiciona formatters BR e generators de seed determinísticos"
```

---

## Task 3: lib/constants.js (MENU_GRUPOS)

**Files:**
- Create: `frontend/src/lib/constants.js`

**Interfaces:**
- Produces: `MENU_GRUPOS` (array de grupos com items), `ROTAS_POR_PERFIL` (helper para filtrar por perfil).

- [ ] **Step 1: Criar constants.js**

```js
// frontend/src/lib/constants.js
import {
  LayoutDashboard, Map, Cake, Users, Building2, Crown, UserCheck,
  Layers, Home, Church, CalendarDays, Radio, CalendarClock, ListTodo,
  Wallet, Package, Car, FolderKanban, FileText, BookOpen, Megaphone,
  BarChart3, Settings,
} from 'lucide-react';

// Estrutura: cada item { to, label, icon, somenteAdmin?, somenteMaster?, routeExists?: boolean }
// routeExists=false indica que a rota ainda não existe (Fases 2-4 criam) — Sidebar mostra como "Em breve"
export const MENU_GRUPOS = [
  {
    titulo: 'PAINEL',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, routeExists: true },
      { to: '/mapa-ministerial', label: 'Mapa Ministerial', icon: Map, routeExists: false },
      { to: '/aniversariantes', label: 'Aniversariantes', icon: Cake, routeExists: false },
    ],
  },
  {
    titulo: 'PESSOAS',
    items: [
      { to: '/membros', label: 'Membros', icon: Users, routeExists: true },
      { to: '/congregacoes', label: 'Congregações', icon: Building2, somenteAdmin: true, routeExists: true },
      { to: '/pastores', label: 'Pastores', icon: Crown, routeExists: false },
      { to: '/obreiros', label: 'Obreiros', icon: UserCheck, routeExists: true },
      { to: '/departamentos', label: 'Departamentos', icon: Layers, routeExists: false },
    ],
  },
  {
    titulo: 'VIDA ECLESIÁSTICA',
    items: [
      { to: '/celulas', label: 'Células', icon: Home, routeExists: false },
      { to: '/cultos', label: 'Cultos', icon: Church, routeExists: false },
      { to: '/eventos', label: 'Eventos', icon: CalendarDays, routeExists: false },
      { to: '/escalas', label: 'Escalas', icon: Radio, routeExists: false },
      { to: '/agenda', label: 'Agenda', icon: CalendarClock, routeExists: true },
    ],
  },
  {
    titulo: 'GESTÃO',
    items: [
      { to: '/financeiro', label: 'Financeiro', icon: Wallet, routeExists: false, submenu: [
        { to: '/financeiro/entradas', label: 'Entradas', routeExists: false },
        { to: '/financeiro/saidas', label: 'Saídas', routeExists: false },
        { to: '/financeiro/fluxo', label: 'Fluxo de Caixa', routeExists: false },
      ]},
      { to: '/patrimonio', label: 'Patrimônio', icon: Package, routeExists: true },
      { to: '/veiculos', label: 'Veículos', icon: Car, routeExists: false },
      { to: '/projetos', label: 'Projetos', icon: FolderKanban, routeExists: false },
      { to: '/documentos', label: 'Documentos', icon: FileText, routeExists: false },
      { to: '/biblioteca', label: 'Biblioteca', icon: BookOpen, routeExists: false },
      { to: '/comunicacao', label: 'Comunicação', icon: Megaphone, routeExists: false },
      { to: '/relatorios', label: 'Relatórios', icon: BarChart3, routeExists: false },
      { to: '/configuracoes', label: 'Configurações', icon: Settings, routeExists: false, somenteAdmin: true },
    ],
  },
];

// Itens administrativos herdados (mantidos do layout anterior)
export const MENU_ADMIN = [
  { to: '/perfil', label: 'Meu perfil', icon: Users, routeExists: true },
  { to: '/carteirinhas', label: 'Carteirinhas', icon: FileText, routeExists: true },
  { to: '/batismos', label: 'Batismos', icon: Church, routeExists: true },
  { to: '/importacao', label: 'Importar Membros', icon: FileText, somenteAdmin: true, routeExists: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, somenteAdmin: true, routeExists: true },
  { to: '/admin/configuracoes', label: 'Configurações Sistema', icon: Settings, somenteAdmin: true, routeExists: true },
  { to: '/admin/logs', label: 'Logs', icon: FileText, somenteAdmin: true, routeExists: true },
  { to: '/master/licenca', label: 'Licença', icon: Crown, somenteMaster: true, routeExists: true },
  { to: '/master/sistema', label: 'Sistema', icon: Settings, somenteMaster: true, routeExists: true },
  { to: '/privacidade', label: 'LGPD / Privacidade', icon: FileText, routeExists: true },
];

export function filtrarPorPerfis(grupos, { isAdmin, isMaster }) {
  return grupos
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => (!i.somenteAdmin || isAdmin) && (!i.somenteMaster || isMaster)
      ),
    }))
    .filter((g) => g.items.length > 0);
}
```

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros (lucide-react já está instalado).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/constants.js
git commit -m "feat: adiciona MENU_GRUPOS da sidebar com 4 categorias e rotas existentes/em breve"
```

---

## Task 4: Primitivas Shadcn

**Files:**
- Create: `frontend/src/components/ui/button.jsx`
- Create: `frontend/src/components/ui/card.jsx`
- Create: `frontend/src/components/ui/badge.jsx`
- Create: `frontend/src/components/ui/skeleton.jsx`
- Create: `frontend/src/components/ui/separator.jsx`
- Create: `frontend/src/components/ui/scroll-area.jsx`
- Create: `frontend/src/components/ui/avatar.jsx`
- Create: `frontend/src/components/ui/dropdown-menu.jsx`
- Create: `frontend/src/components/ui/dialog.jsx`
- Create: `frontend/src/components/ui/sheet.jsx`
- Create: `frontend/src/components/ui/tabs.jsx`
- Create: `frontend/src/components/ui/select.jsx`
- Create: `frontend/src/components/ui/tooltip.jsx`
- Modify: `frontend/package.json` (adicionar `@radix-ui/react-tooltip`, `@radix-ui/react-popover`, `@radix-ui/react-accordion` — se faltantes)

**Interfaces:**
- Produces: todas as primitivas Shadcn padrão, exportando componentes compostos (`Button`, `Card`, `CardHeader`, `CardContent`, `Badge`, `Skeleton`, `Separator`, `ScrollArea`, `Avatar`, `DropdownMenu*`, `Dialog*`, `Sheet*`, `Tabs*`, `Select*`, `Tooltip*`). Todas consumindo tokens via `bg-background`, `text-foreground`, `border-border`, `rounded-card`.

- [ ] **Step 1: Instalar RadixUI faltantes**

Run:
```
cd frontend && npm install @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-accordion
```
Expected: instala sem erros.

- [ ] **Step 2: Criar lib/ + ui/button.jsx**

Garantir que `cn` esteja em `lib/utils.js` (já existe). Criar `button.jsx`:

```jsx
// frontend/src/components/ui/button.jsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-background hover:bg-hover shadow-glow',
        outline: 'border border-border bg-card text-foreground hover:bg-card-hover hover:border-border-strong',
        ghost: 'text-foreground hover:bg-card hover:text-primary',
        destructive: 'bg-danger text-white hover:bg-danger/90',
        ghostMuted: 'text-muted hover:text-foreground hover:bg-card',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';
export { buttonVariants };
```

- [ ] **Step 3: Criar ui/card.jsx**

```jsx
// frontend/src/components/ui/card.jsx
import * as React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-card border border-border bg-card text-foreground transition-all duration-200', className)} {...props} />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('font-semibold leading-tight tracking-tight text-foreground', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';
```

- [ ] **Step 4: Criar ui/skeleton.jsx**

```jsx
// frontend/src/components/ui/skeleton.jsx
import { cn } from '../../lib/utils';
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-card-hover/40 skeleton-shimmer', className)}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Criar ui/badge.jsx**

```jsx
// frontend/src/components/ui/badge.jsx
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/15 text-primary',
        success: 'border-transparent bg-success/15 text-success',
        warning: 'border-transparent bg-warning/15 text-warning',
        danger: 'border-transparent bg-danger/15 text-danger',
        outline: 'border-border text-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

- [ ] **Step 6: Criar ui/separator.jsx**

```jsx
// frontend/src/components/ui/separator.jsx
import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../../lib/utils';

export const Separator = React.forwardRef(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className)}
    {...props}
  />
));
Separator.displayName = 'Separator';
```

- [ ] **Step 7: Criar ui/scroll-area.jsx**

```jsx
// frontend/src/components/ui/scroll-area.jsx
import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '../../lib/utils';

export const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="flex touch-none select-none p-0.5 transition-colors w-2">
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border-strong" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = 'ScrollArea';
```

- [ ] **Step 8: Criar ui/avatar.jsx**

```jsx
// frontend/src/components/ui/avatar.jsx
import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../../lib/utils';

export const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
));
Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full object-cover', className)} {...props} />
));
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback ref={ref} className={cn('flex h-full w-full items-center justify-center rounded-full bg-card-hover text-foreground font-medium', className)} {...props} />
));
AvatarFallback.displayName = 'AvatarFallback';
```

- [ ] **Step 9: Criar ui/dropdown-menu.jsx**

Padrão Shadcn oficial — Reference: https://ui.shadcn.com/docs/components/dropdown-menu → copy the official `dropdown-menu.jsx` from Shadcn docs, but replace all `bg-popover text-popover-foreground border-border` etc. tokens with our semantic tokens (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `bg-card-hover`). Keep `@radix-ui/react-dropdown-menu` (already installed).

Run: copy official file content from Shadcn docs (the version compatible with `@radix-ui/react-dropdown-menu`^2.1.18), with tokens swapped to our semantic set. Place at `frontend/src/components/ui/dropdown-menu.jsx`.

- [ ] **Step 10: Criar restantes primitivas (dialog, sheet, tabs, select, tooltip)**

Para cada uma, copiar o conteúdo oficial atualizado do Shadcn docs versão compatível com a versão RadixUI presente no `package.json`, trocando tokens `bg-background`/`text-foreground`/`bg-card`/`bg-card-hover`/`border-border`/`rounded-card`. Salvar nas respectivas paths em `frontend/src/components/ui/`.

Para `sheet.jsx` (geralmente baseado em Dialog):
- Substituir `side` variants (`top`/`bottom`/`left`/`right`) — todas presentes.
- Usar `@radix-ui/react-dialog` (já instalado) — Sheet é um wrapper sobre Dialog com positioning.

- [ ] **Step 11: Lint + build**

Run:
```
cd frontend && npm run lint && npm run build
```
Expected: sem erros. Se algum `import ... from '../../lib/utils'` quebrar, validar path relativo.

- [ ] **Step 12: Commit**

```bash
git add frontend/src/components/ui/ frontend/package.json frontend/package-lock.json
git commit -m "feat: adiciona 14 primitivas Shadcn usando tokens semânticos do Design System"
```

---

## Task 5: ThemeProvider + ThemeToggle

**Files:**
- Create: `frontend/src/app/providers/ThemeProvider.jsx`
- Create: `frontend/src/components/composite/ThemeToggle.jsx`

**Interfaces:**
- Produces: `ThemeProvider({ children })` envolve a app e aplica `.dark`/`.light` em `<html>`. Hook `useTheme()` retorna `{ theme, toggleTheme, setTheme }`. `ThemeToggle` é botão IconButton.

- [ ] **Step 1: ThemeProvider.jsx**

```jsx
// frontend/src/app/providers/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'kairos-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t) => setThemeState(t);
  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
};
```

- [ ] **Step 2: ThemeToggle.jsx**

```jsx
// frontend/src/components/composite/ThemeToggle.jsx
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Mudar para ${theme === 'dark' ? 'tema claro' : 'tema escuro'}`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 transition-transform rotate-0 scale-100" /> : <Moon className="h-5 w-5 transition-transform rotate-0 scale-100" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

- [ ] **Step 3: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/providers/ThemeProvider.jsx frontend/src/components/composite/ThemeToggle.jsx
git commit -m "feat: adiciona ThemeProvider com persistência e ThemeToggle no topbar"
```

---

## Task 6: App.jsx refactor + QueryProvider

**Files:**
- Create: `frontend/src/app/providers/QueryProvider.jsx`
- Modify: `frontend/src/App.jsx` (envolver com ThemeProvider, manter todas as rotas existentes)

**Interfaces:**
- Produces: QueryClientProvider configurado em arquivo separado; App envolvido em ThemeProvider.

- [ ] **Step 1: QueryProvider.jsx**

```jsx
// frontend/src/app/providers/QueryProvider.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function QueryProvider({ children }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

export { qc };
```

- [ ] **Step 2: Modificar App.jsx**

Em `frontend/src/App.jsx`, fazer 3 alterações mínimas:
1. Top imports — adicionar `import { ThemeProvider } from './app/providers/ThemeProvider';` e `import QueryProvider from './app/providers/QueryProvider';`.
2. Remover a linha `const qc = new QueryClient(...)` inline e o import do `QueryClient, QueryClientProvider`.
3. No `return` de App, trocar o wrapper `<QueryClientProvider client={qc}>...</QueryClientProvider>` por:
```jsx
<ThemeProvider>
  <QueryProvider>
    <BrowserRouter>
      <Routes>
        {/* ...rotas existentes mantidas... */}
      </Routes>
    </BrowserRouter>
  </QueryProvider>
</ThemeProvider>
```

MANTER intactas: todas as 17 `<Route>` entries, `RotaProtegida`, `RotaAdmin`, `RotaMaster`, o `useEffect(() => { carregarUsuario(); }, [])`.

- [ ] **Step 3: Lint + build**

Run: `cd frontend && npm run lint && npm run build`
Expected: sem erros; build gera PWA artifacts.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/providers/QueryProvider.jsx frontend/src/App.jsx
git commit -m "refactor: envolve App com ThemeProvider e extrai QueryProvider"
```

---

## Task 7: Breadcrumb + DateDisplay

**Files:**
- Create: `frontend/src/components/composite/Breadcrumb.jsx`
- Create: `frontend/src/components/composite/DateDisplay.jsx`

**Interfaces:**
- Produces: `Breadcrumb` (sem props, lê `useLocation` e mapeia path → labels via `MENU_GRUPOS` flatten + rotas admin). `DateDisplay` (hook interno `useCurrentDate(60000)`).

- [ ] **Step 1: Breadcrumb.jsx**

```jsx
// frontend/src/components/composite/Breadcrumb.jsx
import { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MENU_GRUPOS, MENU_ADMIN } from '../../lib/constants';

const LABELS = {};
const flatten = (arr) => arr.forEach((i) => {
  LABELS[i.to] = i.label;
  if (i.submenu) i.submenu.forEach((s) => { LABELS[s.to] = s.label; });
});
flatten([...MENU_GRUPOS.flatMap((g) => g.items), ...MENU_ADMIN]);

const HOME = { to: '/dashboard', label: 'Dashboard' };

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  let acc = '';
  const crumbs = segments.map((seg) => {
    acc += '/' + seg;
    const to = acc;
    return { to, label: LABELS[to] || seg.charAt(0).toUpperCase() + seg.slice(1) };
  });

  if (crumbs.length === 0 || crumbs[0].to !== HOME.to) {
    crumbs.unshift({ ...HOME });
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center text-sm">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <Fragment key={c.to}>
            {i > 0 && <ChevronRight className="mx-1 h-4 w-4 text-muted" />}
            {last ? (
              <span className={cn('font-medium', i === 0 ? 'text-foreground' : 'text-primary')}>{c.label}</span>
            ) : (
              <Link to={c.to} className="text-muted hover:text-foreground transition-colors">{c.label}</Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: DateDisplay.jsx**

```jsx
// frontend/src/components/composite/DateDisplay.jsx
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

function useCurrentDate(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function DateDisplay({ className }) {
  const now = useCurrentDate();
  return (
    <div className={cn('hidden lg:flex items-center gap-2 text-sm text-muted px-3', className)}>
      <Calendar className="h-4 w-4" />
      <span>{fmt.format(now)}</span>
    </div>
  );
}
```

- [ ] **Step 3: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/composite/Breadcrumb.jsx frontend/src/components/composite/DateDisplay.jsx
git commit -m "feat: adiciona Breadcrumb derivado da rota e DateDisplay em tempo real"
```

---

## Task 8: SidebarItem + Sidebar

**Files:**
- Create: `frontend/src/components/layout/SidebarItem.jsx`
- Create: `frontend/src/components/layout/Sidebar.jsx`

**Interfaces:**
- Consumes: `MENU_GRUPOS`, `filtrarPorPerfis` from `lib/constants.js`; `useAuthStore` from `stores/auth`.
- Produces: `Sidebar({ onNavigate })` — usado por `RootLayout`. No mobile vira `Sheet`.

- [ ] **Step 1: SidebarItem.jsx**

```jsx
// frontend/src/components/layout/SidebarItem.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export default function SidebarItem({ item, collapsed, onNavigate }) {
  const { pathname } = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const isActive = pathname === item.to || pathname.startsWith(item.to + '/');
  const hasSubmenu = Array.isArray(item.submenu) && item.submenu.length > 0;
  const isEmBreve = item.routeExists === false;

  const inner = (
    <div className={cn(
      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative',
      isActive
        ? 'bg-card text-primary border border-border-strong shadow-glow'
        : 'text-muted hover:text-foreground hover:bg-card hover:border hover:border-border',
      collapsed && 'justify-center px-2'
    )}>
      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-glow shadow-glow" />}
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {isEmBreve && <span className="text-[10px] text-warning uppercase tracking-wide">em breve</span>}
          {hasSubmenu && <ChevronDown className={cn('h-4 w-4 transition-transform', openSubmenu && 'rotate-180')} />}
        </>
      )}
    </div>
  );

  if (isEmBreve) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="w-full text-left cursor-default opacity-70"
              aria-disabled
            >
              {inner}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label} — disponível em breve</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (hasSubmenu) {
    return (
      <div className="space-y-1">
        <button type="button" onClick={() => setOpenSubmenu((v) => !v)} className="w-full text-left">
          {inner}
        </button>
        {!collapsed && openSubmenu && (
          <div className="ml-8 space-y-1">
            {item.submenu.map((s) => {
              const subActive = pathname === s.to || pathname.startsWith(s.to + '/');
              return s.routeExists === false ? (
                <span key={s.to} className="block text-xs text-muted px-3 py-1.5 opacity-60">
                  {s.label} (em breve)
                </span>
              ) : (
                <Link
                  key={s.to}
                  to={s.to}
                  onClick={onNavigate}
                  className={cn(
                    'block text-xs px-3 py-1.5 rounded-md transition-colors',
                    subActive ? 'bg-card text-primary' : 'text-muted hover:text-foreground hover:bg-card'
                  )}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link to={item.to} onClick={onNavigate} aria-current={isActive ? 'page' : undefined}>
      {inner}
    </Link>
  );
}
```

- [ ] **Step 2: Sidebar.jsx (desktop + mobile via Sheet)**

```jsx
// frontend/src/components/layout/Sidebar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, X } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { cn } from '../../lib/utils';
import { MENU_GRUPOS, filtrarPorPerfis } from '../../lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '../ui/sheet';
import SidebarItem from './SidebarItem';

function SidebarBody({ collapsed, onNavigate }) {
  const { usuario, logout, isAdmin, isMaster } = useAuthStore();
  const navigate = useNavigate();
  const grupos = filtrarPorPerfis(MENU_GRUPOS, { isAdmin: isAdmin(), isMaster: isMaster() });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center gap-2 border-b border-border px-4', collapsed && 'justify-center px-2')}>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary font-bold shadow-glow">K</div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Kairós Sede</p>
            <p className="text-[11px] text-muted uppercase tracking-wide">Administração</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-4 p-3">
          {grupos.map((g) => (
            <div key={g.titulo}>
              {!collapsed && <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.titulo}</p>}
              <div className="space-y-1">
                {g.items.map((item) => (
                  <SidebarItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className={cn('flex items-center gap-2 rounded-lg p-2', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8">
            {usuario?.foto_url ? <AvatarImage src={usuario.foto_url} alt={usuario.nome} /> : null}
            <AvatarFallback>{usuario?.nome?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{usuario?.nome}</p>
              <p className="text-[11px] text-muted capitalize">{usuario?.perfil}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-muted hover:text-danger transition-colors"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, onToggleCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'hidden lg:flex shrink-0 h-screen sticky top-0 border-r border-border bg-background transition-[width] duration-200',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      {/* Mobile via Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden p-2 text-muted hover:text-foreground" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-background">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary font-bold">K</div>
              Kairós Sede
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-56px)]">
            <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

- [ ] **Step 3: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/SidebarItem.jsx frontend/src/components/layout/Sidebar.jsx
git commit -m "feat: adiciona Sidebar recolhível com grupos, submenus, mobile Sheet e glow no ativo"
```

---

## Task 9: QuickActions + GlobalSearch + NotificationsBell (esqueletos)

**Files:**
- Create: `frontend/src/components/composite/QuickActions.jsx`
- Create: `frontend/src/components/composite/GlobalSearch.jsx`
- Create: `frontend/src/components/composite/NotificationsBell.jsx`

**Interfaces:**
- Produces: três componentes puramente visuais (esqueletos). Nenhuma ação real — tooltip "Disponível em breve" em cada item.

- [ ] **Step 1: QuickActions.jsx**

```jsx
// frontend/src/components/composite/QuickActions.jsx
import { Zap, UserPlus, CalendarPlus, Droplets } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

const ACOES = [
  { icon: UserPlus, label: 'Novo membro' },
  { icon: CalendarPlus, label: 'Novo evento' },
  { icon: Droplets, label: 'Registrar batismo' },
];

export default function QuickActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ações rápidas">
          <Zap className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          Ações rápidas
          <Badge variant="outline">em breve</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACOES.map((a) => (
          <DropdownMenuItem key={a.label} className="opacity-60 cursor-default" aria-disabled>
            <a.icon className="mr-2 h-4 w-4" />
            <span>{a.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: GlobalSearch.jsx**

```jsx
// frontend/src/components/composite/GlobalSearch.jsx
import { Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export default function GlobalSearch() {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="hidden sm:flex h-9 w-9 lg:w-56 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-muted cursor-default"
            aria-label="Buscar (indisponível)"
            disabled
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden lg:inline flex-1 text-left">Buscar...</span>
            <kbd className="hidden lg:inline rounded bg-card-hover px-1.5 py-0.5 text-[10px] text-muted">Ctrl K</kbd>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Busca global — disponível em breve</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

- [ ] **Step 3: NotificationsBell.jsx**

```jsx
// frontend/src/components/composite/NotificationsBell.jsx
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

const MOCKS = [
  { titulo: 'Relatório pendente', desc: 'Congregação Central — junho', disabled: true },
  { titulo: 'Aniversariante hoje', desc: 'Pastor João Silva', disabled: true },
  { titulo: 'Escala sem obreiro', desc: 'Culto de quarta-feira', disabled: true },
];

export default function NotificationsBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 grid place-items-center rounded-full bg-danger text-[10px] font-bold text-white">3</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">Notificações <Badge variant="outline">mock</Badge></DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MOCKS.map((n) => (
          <DropdownMenuItem key={n.titulo} className="opacity-60 cursor-default" aria-disabled>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{n.titulo}</span>
              <span className="text-xs text-muted">{n.desc}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 4: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/composite/QuickActions.jsx frontend/src/components/composite/GlobalSearch.jsx frontend/src/components/composite/NotificationsBell.jsx
git commit -m "feat: adiciona esqueletos de Ações Rápidas, Busca Global e Notificações no topbar"
```

---

## Task 10: Topbar

**Files:**
- Create: `frontend/src/components/layout/Topbar.jsx`

**Interfaces:**
- Consumes: `Sidebar` (via props `onToggleSidebar`), `Breadcrumb`, `DateDisplay`, `GlobalSearch`, `QuickActions`, `NotificationsBell`, `ThemeToggle`, `useAuthStore`.
- Produces: `Topbar({ onToggleSidebar })`.

- [ ] **Step 1: Topbar.jsx**

```jsx
// frontend/src/components/layout/Topbar.jsx
import { PanelLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuthStore } from '../../stores/auth';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../composite/Breadcrumb';
import DateDisplay from '../composite/DateDisplay';
import GlobalSearch from '../composite/GlobalSearch';
import QuickActions from '../composite/QuickActions';
import NotificationsBell from '../composite/NotificationsBell';
import ThemeToggle from '../composite/ThemeToggle';

export default function Topbar({ onToggleSidebar }) {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label="Recolher/expandir menu"
        className="hidden lg:inline-flex"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <GlobalSearch />
        <DateDisplay />
        <QuickActions />
        <NotificationsBell />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Perfil">
              <Avatar className="h-9 w-9 border border-border">
                {usuario?.foto_url ? <AvatarImage src={usuario.foto_url} alt={usuario.nome} /> : null}
                <AvatarFallback>{usuario?.nome?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium truncate">{usuario?.nome}</p>
              <p className="text-xs text-muted capitalize">{usuario?.perfil}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/perfil')}>Meu perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-danger focus:text-danger">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/Topbar.jsx
git commit -m "feat: adiciona Topbar completo com todos os componentes"
```

---

## Task 11: RootLayout + troca do Layout.jsx existente

**Files:**
- Create: `frontend/src/components/layout/RootLayout.jsx`
- Modify: `frontend/src/App.jsx` — trocar `import Layout from './components/layout/Layout'` por `import RootLayout from './components/layout/RootLayout'` e usar `<RootLayout>` em `RotaProtegida`. **MANTER** `AssistenteIA` se o componente existir importando-o no `RootLayout`.
- NÃO apagar `Layout.jsx` (manter por segurança até Fase 2 confirmar nada quebra) — renomear para `Layout.legacy.jsx` preservando referência.

**Interfaces:**
- Produces: `RootLayout({ children })` com `<Sidebar collapsed /> + <Topbar /> + <main>{children}</main>`. Toggle de collapsed em estado interno.

- [ ] **Step 1: RootLayout.jsx**

```jsx
// frontend/src/components/layout/RootLayout.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { cn } from '../../lib/utils';
import AssistenteIA from '../assistente/AssistenteIA';

export default function RootLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onToggleSidebar={() => setCollapsed((v) => !v)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
      <AssistenteIA />
    </div>
  );
}
```

- [ ] **Step 2: Renomear Layout.jsx → Layout.legacy.jsx**

```bash
cd frontend/src/components/layout
git mv Layout.jsx Layout.legacy.jsx
```

→ Atualizar seu `import AssistenteIA from '../assistente/AssistenteIA'` permanece válido (paths relativos não mudam).

- [ ] **Step 3: Modificar App.jsx**

Em `frontend/src/App.jsx`:
1. Trocar `import Layout from './components/layout/Layout';` por `import RootLayout from './components/layout/RootLayout';`.
2. Em `RotaProtegida`, trocar `<Layout>{children}</Layout>` por `<RootLayout>{children}</RootLayout>`.

- [ ] **Step 4: Lint + build**

Run: `cd frontend && npm run lint && npm run build`
Expected: sem erros. Build gera PWA artifacts. Se quebrar (ex.: Layout.jsx em outras referências), buscar imports `from './components/layout/Layout'` e ajustar.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/RootLayout.jsx frontend/src/components/layout/Layout.legacy.jsx frontend/src/App.jsx
git commit -m "refactor: substitui Layout antigo por RootLayout premium (Sidebar+Topbar+Outlet)"
```

---

## Task 12: SparklineChart (SVG puro)

**Files:**
- Create: `frontend/src/components/composite/SparklineChart.jsx`

**Interfaces:**
- Produces: `SparklineChart({ data: number[], color?, width?=120, height?=36, smooth?=true })` — SVG inline, sem dependência externa. Suavização Catmull-Rom.

- [ ] **Step 1: SparklineChart.jsx**

```jsx
// frontend/src/components/composite/SparklineChart.jsx
import { useId } from 'react';

function smoothPath(points) {
  if (points.length < 2) return points.length === 1 ? `M${points[0][0]},${points[0][1]}` : '';
  if (points.length === 2) {
    return `M${points[0][0]},${points[0][1]} L${points[1][0]},${points[1][1]}`;
  }
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];
    const t = 0.18;
    const cp1x = p1[0] + (p2[0] - p0[0]) * t;
    const cp1y = p1[1] + (p2[1] - p0[1]) * t;
    const cp2x = p2[0] - (p3[0] - p1[0]) * t;
    const cp2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export default function SparklineChart({ data = [], color = 'var(--color-primary)', width = 120, height = 36, smooth = true }) {
  const gid = useId();
  if (!Array.isArray(data) || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padY = 4;
  const innerH = height - padY * 2;
  const stepX = width / Math.max(1, data.length - 1);

  const points = data.map((v, i) => [i * stepX, padY + innerH - ((v - min) / range) * innerH]);
  const linePath = smooth ? smoothPath(points) : points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block" width={width} height={height} preserveAspectRatio="none" role="img" aria-label="Mini gráfico">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/composite/SparklineChart.jsx
git commit -m "feat: adiciona SparklineChart SVG puro com suavização Catmull-Rom"
```

---

## Task 13: StatCard

**Files:**
- Create: `frontend/src/components/composite/StatCard.jsx`

**Interfaces:**
- Consumes: `Card`, SparklineChart, Skeleton.
- Produces: `StatCard({ icon, title, value, description, trend, sparklineData, onClick, loading, accent })`.

- [ ] **Step 1: StatCard.jsx**

```jsx
// frontend/src/components/composite/StatCard.jsx
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';
import { formatarNumeroBR } from '../../lib/utils';
import SparklineChart from './SparklineChart';

const ACCENT = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

export default function StatCard({
  icon: Icon,
  title,
  value,
  description,
  trend,
  sparklineData = [],
  onClick,
  loading = false,
  accent = 'primary',
}) {
  const color = ACCENT[accent] || ACCENT.primary;
  const trendUp = trend?.direction !== 'down';
  const trendValue = trend?.value;
  const clickable = Boolean(onClick);

  return (
    <Card
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => clickable && (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className={cn(
        'p-5 group relative overflow-visible',
        clickable && 'cursor-pointer hover:border-border-strong hover:shadow-glow-strong hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="grid h-10 w-10 place-items-center rounded-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
          >
            {Icon ? <Icon className="h-5 w-5" /> : null}
          </div>
          <p className="text-sm font-medium text-muted truncate">{title}</p>
        </div>
        {trendValue != null && !loading && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full',
              trendUp ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            )}
          >
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trendValue).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <p className="text-3xl font-bold text-foreground truncate">
              {typeof value === 'number' ? formatarNumeroBR(value) : value}
            </p>
          )}
          {loading ? <Skeleton className="mt-2 h-3 w-20" /> : (
            <p className="text-xs text-muted truncate">{description}</p>
          )}
        </div>
        <div className="shrink-0">
          {loading ? <Skeleton className="h-9 w-[120px]" /> : (
            sparklineData.length > 0 && <SparklineChart data={sparklineData} color={color} />
          )}
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/composite/StatCard.jsx
git commit -m "feat: adiciona StatCard com ícone glow, trend BR e Sparkline"
```

---

## Task 14: LoadingSkeleton + EmptyState + ErrorBoundary

**Files:**
- Create: `frontend/src/components/composite/LoadingSkeleton.jsx`
- Create: `frontend/src/components/composite/EmptyState.jsx`
- Create: `frontend/src/components/composite/ErrorBoundary.jsx`

**Interfaces:**
- Produces: `LoadingSkeleton({ variant, count?=1 })` com variants `['statcard','table','chart','sidebar','topbar']`. `EmptyState({ icon, title, description, action })`. `ErrorBoundary` class component wrapping children.

- [ ] **Step 1: LoadingSkeleton.jsx**

```jsx
// frontend/src/components/composite/LoadingSkeleton.jsx
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-card border border-border bg-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-[120px]" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 4 }) {
  return (
    <div className="rounded-card border border-border bg-card p-4 space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-card border border-border bg-card p-4 h-64">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 15 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function TopbarSkeleton() {
  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-background/80">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}

const REGISTRY = {
  statcard: StatCardSkeleton,
  table: TableSkeleton,
  chart: ChartSkeleton,
  sidebar: SidebarSkeleton,
  topbar: TopbarSkeleton,
};

export default function LoadingSkeleton({ variant = 'statcard', count = 1, className }) {
  const Comp = REGISTRY[variant] || StatCardSkeleton;
  if (count <= 1) return <Comp className={className} />;
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => <Comp key={i} />)}
    </div>
  );
}
```

- [ ] **Step 2: EmptyState.jsx**

```jsx
// frontend/src/components/composite/EmptyState.jsx
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-10 rounded-card border border-dashed border-border ${className || ''}`}>
      {Icon ? <Icon className="h-10 w-10 text-muted mb-3" /> : null}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? <p className="text-sm text-muted max-w-md mt-1">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
```

- [ ] **Step 3: ErrorBoundary.jsx**

```jsx
// frontend/src/components/composite/ErrorBoundary.jsx
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    if (typeof console !== 'undefined') console.error('[ErrorBoundary]', error, info);
  }
  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 rounded-card border border-danger/30 bg-danger/5 m-4">
          <AlertTriangle className="h-10 w-10 text-danger mb-3" />
          <p className="text-base font-semibold text-foreground">Algo deu errado</p>
          <p className="text-sm text-muted max-w-md mt-1">
            {String(this.state.error?.message || 'Erro inesperado')}
          </p>
          <Button className="mt-4" onClick={this.handleReload}>
            <RefreshCw className="h-4 w-4" /> Recarregar
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 4: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/composite/LoadingSkeleton.jsx frontend/src/components/composite/EmptyState.jsx frontend/src/components/composite/ErrorBoundary.jsx
git commit -m "feat: adiciona LoadingSkeleton (5 variants), EmptyState e ErrorBoundary"
```

---

## Task 15: Mock generators (10 generators + registry)

**Files:**
- Create: `frontend/src/mocks/generators/membros.js`
- Create: `frontend/src/mocks/generators/congregacoes.js`
- Create: `frontend/src/mocks/generators/pastores.js`
- Create: `frontend/src/mocks/generators/obreiros.js`
- Create: `frontend/src/mocks/generators/departamentos.js`
- Create: `frontend/src/mocks/generadores/eventos.js`
- Create: `frontend/src/mocks/generators/cultos.js`
- Create: `frontend/src/mocks/generators/escalas.js`
- Create: `frontend/src/mocks/generators/aniversariantes.js`
- Create: `frontend/src/mocks/generators/documentos.js`
- Create: `frontend/src/mocks/generators/index.js`

**Interfaces:**
- Produces: cada generator é função `(seed=12345) => Entidade[]`. Registry `index.js` exporta `REGISTRY = { membros, congregacoes, ... }`. `useMockData` (Task 16) consome este registry.

- [ ] **Step 1: congregacoes.js (gerado primeiro, pois membros referencia)**

```js
// frontend/src/mocks/generators/congregacoes.js
import { mulberry32, pick, int, dateBetween, chance } from '../../lib/seed';

const NOMES_CONGREGACAO = [
  'Central','Bethesda','Sião','Filadélfia','Betel','Manaim','Peniel','Gilgal','Refúgio','Aliança',
  'Graça','Esperança','Vida','Luz','Paz','Fé','Amor','Restauração','Avivamento','Salvação',
].map((n) => `Igreja ${n}`);

export function gerarCongregacoes(count = 35, seed = 12345) {
  const rng = mulberry32(seed);
  const list = [];
  for (let i = 0; i < count; i++) {
    const [cidade, uf] = pick([
      ['São Paulo','SP'],['Rio de Janeiro','RJ'],['Belo Horizonte','MG'],['Curitiba','PR'],['Salvador','BA'],
      ['Sorocaba','SP'],['Campinas','SP'],['Niterói','RJ'],['Londrina','PR'],['Feira de Santana','BA'],
    ], rng);
    const pastorId = `P${int(1, 80, rng).toString().padStart(3, '0')}`;
    const crescimento12m = Array.from({ length: 12 }, () => int(2, 25, rng));
    const batismos12m = Array.from({ length: 12 }, () => int(0, 8, rng));
    const visitantes12m = Array.from({ length: 12 }, () => int(5, 60, rng));
    const entradas = int(8000, 80000, rng);
    const saidas = int(4000, 60000, rng);
    list.push({
      id: `C${(i + 1).toString().padStart(3, '0')}`,
      nome: `${pick(NOMES_CONGREGACAO, rng)} - ${cidade}`,
      cidade, uf,
      endereco: `Rua ${pick(['das Flores','dos Ipês','das Palmeiras','Sete de Setembro','Primeiro de Março','Tapajós','Acre'], rng)}, ${int(10, 999, rng)}`,
      pastorId,
      membrosCount: int(40, 480, rng),
      fundadaEm: dateBetween(50, 2, rng),
      crescimento12m,
      batismos12m,
      visitantes12m,
      departamentosAtivos: int(3, 9, rng),
      financeiro: { entradas, saidas, saldo: entradas - saidas },
      batismos12mTotal: batismos12m.reduce((a, b) => a + b, 0),
    });
  }
  return list;
}

export default gerarCongregacoes;
```

- [ ] **Step 2: membros.js**

```js
// frontend/src/mocks/generators/membros.js
import { mulberry32, nomeBR, cpfBR, telefoneBR, int, dateBetween, chance, pick } from '../../lib/seed';

const STATUS = ['ativo', 'ativo', 'ativo', 'ativo', 'inativo', 'novo']; // ponderado p/ maioria ativa
const CARGOS = ['Membro','Membro','Membro','Diácono','Presbítero','Líder de Célula','Líder de Louvor','Cooperador','Obreiro'];
const ESTADOS_CIVIS = ['Solteiro(a)','Casado(a)','Casado(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União estável'];

export function gerarMembros(count = 2000, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const sexo = chance(0.5, rng) ? 'M' : 'F';
    const dataNasc = dateBetween(85, 0, rng);
    const status = pick(STATUS, rng);
    const batizado = chance(0.75, rng);
    list.push({
      id: `M${(i + 1).toString().padStart(5, '0')}`,
      nome: nomeBR(rng),
      cpf: cpfBR(rng),
      telefone: telefoneBR(rng),
      email: `membro${i + 1}@email.com`,
      sexo,
      dataNasc: dataNasc.toISOString().slice(0, 10),
      estadoCivil: pick(ESTADOS_CIVIS, rng),
      cidade: pick(['São Paulo','Rio de Janeiro','Belo Horizonte','Curitiba','Salvador','Sorocaba','Campinas','Niterói'], rng),
      bairro: pick(['Centro','Jardim Primavera','Vila Mariana','Pinheiros','Copacabana','Botafogo','Savassi',' Centro','Batel','Barra'], rng),
      uf: pick(['SP','RJ','MG','PR','BA'], rng),
      congregacaoId: pick(congsIds, rng),
      cargo: pick(CARGOS, rng),
      status,
      batizado,
      dataBatismo: batizado ? dateBetween(30, 0, rng).toISOString().slice(0, 10) : null,
      ativoDesde: dateBetween(40, 0, rng).toISOString().slice(0, 10),
    });
  }
  return list;
}

export default gerarMembros;
```

- [ ] **Step 3: pastores.js**

```js
// frontend/src/mocks/generators/pastores.js
import { mulberry32, nomeBR, telefoneBR, int, dateBetween, chance, pick } from '../../lib/seed';

const FORMACOES = ['Bacharel em Teologia','Licenciatura em Teologia','Mestrado em Teologia','Doutorado em Teologia','Sem formação formal'];

export function gerarPastores(count = 80, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const sexo = chance(0.85, rng) ? 'M' : 'F';
    list.push({
      id: `P${(i + 1).toString().padStart(3, '0')}`,
      nome: nomeBR(rng),
      telefone: telefoneBR(rng),
      email: `pastor${i + 1}@igreja.org`,
      sexo,
      dataNasc: dateBetween(60, 25, rng).toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      tempoMinisterio: int(2, 40, rng),
      formacao: pick(FORMACOES, rng),
      ativoDesde: dateBetween(40, 0, rng).toISOString().slice(0, 10),
    });
  }
  return list;
}

export default gerarPastores;
```

- [ ] **Step 4: obreiros.js**

```js
// frontend/src/mocks/generators/obreiros.js
import { mulberry32, nomeBR, int, chance, pick } from '../../lib/seed';

const FUNCOES = ['Porteiro','Recepção','Som','Louvor',' infantil','Limpeza','Segurança','Diácono','Cooperador','Pedido de Oração'];
const DEPT_IDS = ['D_HOMENS','D_MULHERES','D_JOVENS','D_LOUVOR','D_INTERCESSAO','D_EVANGELISMO','D_MISSOES','D_CRIANCAS','D_ADOLESCENTES','D_OUTROS'];

export function gerarObreiros(count = 250, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: `O${(i + 1).toString().padStart(4, '0')}`,
      nome: nomeBR(rng),
      funcao: pick(FUNCOES, rng),
      departamentoId: pick(DEPT_IDS, rng),
      congregacaoId: pick(congsIds, rng),
      escalasCount: int(0, 25, rng),
      participacaoPercent: int(0, 100, rng),
      ativo: chance(0.85, rng),
    });
  }
  return list;
}

export default gerarObreiros;
```

- [ ] **Step 5: departamentos.js**

```js
// frontend/src/mocks/generators/departamentos.js
import { mulberry32, int, chance, pick } from '../../lib/seed';

const NOMES = ['Homens','Mulheres','Jovens','Adolescentes','Crianças','Louvor','Intercessão','Evangelismo','Missões','Outros'];

export function gerarDepartamentos(count = 50, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const nome = pick(NOMES, rng);
    list.push({
      id: `D_${(i + 1).toString().padStart(3, '0')}`,
      nome,
      congregacaoId: pick(congsIds, rng),
      liderId: `O${int(1, 250, rng).toString().padStart(4, '0')}`,
      membrosCount: int(5, 80, rng),
      eventos12m: int(0, 18, rng),
      ativo: chance(0.8, rng),
    });
  }
  return list;
}

export default gerarDepartamentos;
```

- [ ] **Step 6: eventos.js**

```js
// frontend/src/mocks/generators/eventos.js
import { mulberry32, int, dateBetween, pick, chance } from '../../lib/seed';

const TIPOS = ['culto','conferência','batismo','retiro','ensaio',' HttpStatusntaxit crossover','campanha','vigília'];
const TITULOS = ['Culto de Celebração','Encontro de Casais','Conferência de Avivamento','Retiro Espiritual','Batismo nas Águas','Ensaio do Coral','Vigília de Oração',' Cruzada Evangelística'];

export function gerarEventos(count = 500, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const data = dateBetween(2, 1, rng);
    const inscritos = int(20, 600, rng);
    const participantes = int(Math.floor(inscritos * 0.7), inscritos, rng);
    const receitas = int(0, 25000, rng);
    const despesas = int(0, 18000, rng);
    list.push({
      id: `E${(i + 1).toString().padStart(4, '0')}`,
      titulo: pick(TITULOS, rng),
      tipo: pick(TIPOS, rng),
      data: data.toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      inscritos,
      participantes,
      receitas,
      despesas,
      fotos: chance(0.4, rng) ? int(3, 18, rng) : 0,
      realizado: data < new Date(),
    });
  }
  return list;
}

export default gerarEventos;
```

- [ ] **Step 7: cultos.js**

```js
// frontend/src/mocks/generators/cultos.js
import { mulberry32, nomeBR, int, dateBetween, pick } from '../../lib/seed';

const TEMAS = ['Esperança','Fé','Salvação','Amor','Restauração',' Avivamento;;Graça;; Santidade;;Comunhão','Missões',' Família'];

export function gerarCultos(count = 1000, seed = 12345, congregacoesIds = [], pastores = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const pregadores = pastores.length ? pastores.map((p) => p.nome) : Array.from({ length: 80 }, (_, i) => `Pastor ${i + 1}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const participantes = int(30, 500, rng);
    list.push({
      id: `CU${(i + 1).toString().padStart(5, '0')}`,
      data: dateBetween(2, 1, rng).toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      pregador: pick(pregadores, rng),
      participantes,
      visitantes: int(0, Math.floor(participantes * 0.15), rng),
      decisoes: int(0, 20, rng),
      batismos: int(0, 5, rng),
      tema: pick(TEMAS, rng),
    });
  }
  return list;
}

export default gerarCultos;
```

- [ ] **Step 8: escalas.js**

```js
// frontend/src/mocks/generators/escalas.js
import { mulberry32, int, dateBetween, pick } from '../../lib/seed';

const DEPT_IDS = ['D_HOMENS','D_MULHERES','D_JOVENS','D_LOUVOR','D_INTERCESSAO','D_EVANGELISMO','D_MISSOES','D_CRIANCAS'];

export function gerarEscalas(count = 200, seed = 99999, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const obreirosIds = Array.from({ length: int(3, 12, rng) }, () => `O${int(1, 250, rng).toString().padStart(4, '0')}`);
    list.push({
      id: `ES${(i + 1).toString().padStart(4, '0')}`,
      data: dateBetween(1, 1, rng).toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      departamentoId: pick(DEPT_IDS, rng),
      obreiros: obreirosIds,
      status: pick(['pendente','confirmada','realizada','cancelada'], rng),
      confirmados: int(0, obreirosIds.length, rng),
      ausencias: int(0, Math.floor(obreirosIds.length / 2), rng),
      trocas: int(0, 3, rng),
    });
  }
  return list;
}

export default gerarEscalas;
```

- [ ] **Step 9: aniversariantes.js (derivado de membros/pastores/obreiros)**

```js
// frontend/src/mocks/generators/aniversariantes.js

const TIPO_PESSOA = { M: 'membro', P: 'pastor', O: 'obreiro' };

export function gerarAniversariantes(membros = [], pastores = [], obreiros = []) {
  const hoje = new Date();
  const anoH = hoje.getFullYear();
  const list = [];
  const addPessoa = (p, tipo) => {
    if (!p.dataNasc) return;
    const [y, m, d] = p.dataNasc.split('-').map(Number);
    if (!m || !d) return;
    const dataEsteAno = new Date(anoH, m - 1, d);
    const diasAte = Math.ceil((dataEsteAno - hoje) / (1000 * 60 * 60 * 24));
    list.push({
      id: `${tipo[0].toUpperCase()}${p.id}`,
      nome: p.nome,
      tipo,
      dataNasc: p.dataNasc,
      idadeFutura: anoH - y,
      dataEsteAno: dataEsteAno.toISOString().slice(0, 10),
      diasAte,
    });
  };
  membros.forEach((m) => addPessoa(m, 'membro'));
  pastores.forEach((p) => addPessoa(p, 'pastor'));
  obreiros.forEach((o) => addPessoa(o, 'obreiro'));
  // ordena por diasAte e retorna até 150
  return list.sort((a, b) => a.diasAte - b.diasAte).slice(0, 150);
}

export default gerarAniversariantes;
```

- [ ] **Step 10: documentos.js**

```js
// frontend/src/mocks/generators/documentos.js
import { mulberry32, dateBetween, pick } from '../../lib/seed';

const TIPOS = ['ata','relatório','certificado','carta','ofício','regimento'];
const TITULOS = ['Ata de Reunião','Relatório Mensal','Certificado de Batismo','Carta de Recomendação','Ofício','Regimento Interno'];

export function gerarDocumentos(count = 300, seed = 55555, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: `DOC${(i + 1).toString().padStart(4, '0')}`,
      titulo: `${pick(TITULOS, rng)} #${i + 1}`,
      tipo: pick(TIPOS, rng),
      congregacaoId: pick(congsIds, rng),
      data: dateBetween(5, 0, rng).toISOString().slice(0, 10),
      autor: `Pastor ${Math.floor(Math.random() * 80) + 1}`,
    });
  }
  return list;
}

export default gerarDocumentos;
```

- [ ] **Step 11: index.js (registry com gather)**

```js
// frontend/src/mocks/generators/index.js
import { gerarCongregacoes } from './congregacoes';
import { gerarMembros } from './membros';
import { gerarPastores } from './pastores';
import { gerarObreiros } from './obreiros';
import { gerarDepartamentos } from './departamentos';
import { gerarEventos } from './eventos';
import { gerarCultos } from './cultos';
import { gerarEscalas } from './escalas';
import { gerarAniversariantes } from './aniversariantes';
import { gerarDocumentos } from './documentos';

export function gerarTudo(seed = 12345) {
  const congregacoes = gerarCongregacoes(35, seed);
  const congregacoesIds = congregacoes.map((c) => c.id);
  const pastores = gerarPastores(80, seed + 1, congregacoesIds);
  const obreiros = gerarObreiros(250, seed + 2, congregacoesIds);
  const departamentos = gerarDepartamentos(50, seed + 3, congregacoesIds);
  const membros = gerarMembros(2000, seed + 4, congregacoesIds);
  const eventos = gerarEventos(500, seed + 5, congregacoesIds);
  const cultos = gerarCultos(1000, seed + 6, congregacoesIds, pastores);
  const escalas = gerarEscalas(200, seed + 7, congregacoesIds);
  const documentos = gerarDocumentos(300, seed + 8, congregacoesIds);
  const aniversariantes = gerarAniversariantes(membros, pastores, obreiros);
  return { congregacoes, membros, pastores, obreiros, departamentos, eventos, cultos, escalas, documentos, aniversariantes };
}

export const REGISTRY = {
  membros: gerarMembros,
  congregacoes: gerarCongregacoes,
  pastores: gerarPastores,
  obreiros: gerarObreiros,
  departamentos: gerarDepartamentos,
  eventos: gerarEventos,
  cultos: gerarCultos,
  escalas: gerarEscalas,
  documentos: gerarDocumentos,
  aniversariantes: gerarAniversariantes,
};
```

- [ ] **Step 12: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros. Se houver chars não-ASCII quebrados (lapso de digitação dos mocks), fix com各国 valida.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/mocks/generators/
git commit -m "feat: adiciona 10 generators de mock data BR com seed determinístico"
```

---

## Task 16: useMockData hook (zustand cache)

**Files:**
- Create: `frontend/src/mocks/hooks/useMockData.js`
- Create: `frontend/src/mocks/stores/mockStore.js`

**Interfaces:**
- Produces: `useMockData(tipo, options?)` retorna array de entidades. Cacheia em zustand store persistido em memória (não localStorage).

- [ ] **Step 1: mockStore.js**

```js
// frontend/src/mocks/stores/mockStore.js
import { create } from 'zustand';
import { gerarTudo } from '../generators/index';

let _dados = null;
function carregar() {
  if (!_dados) _dados = gerarTudo(12345);
  return _dados;
}

export const useMockStore = create((set, get) => ({
  dados: null,
  carregado: false,
  carregar: () => {
    if (get().carregado) return;
    set({ dados: carregar(), carregado: true });
  },
}));
```

- [ ] **Step 2: useMockData.js**

```js
// frontend/src/mocks/hooks/useMockData.js
import { useMemo } from 'react';
import { useMockStore } from '../stores/mockStore';

export function useMockData(tipo, options = {}) {
  const { dados, carregar } = useMockStore();
  if (!dados) carregar();

  return useMemo(() => {
    if (!dados || !dados[tipo]) return [];
    let result = dados[tipo];
    if (options.filter) {
      result = result.filter((item) => {
        return Object.entries(options.filter).every(([k, v]) => item[k] === v);
      });
    }
    if (options.limit && Number.isFinite(options.limit)) {
      result = result.slice(0, options.limit);
    }
    return result;
  }, [dados, tipo, JSON.stringify(options)]);
}

export default useMockData;
```

- [ ] **Step 3: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/mocks/stores/mockStore.js frontend/src/mocks/hooks/useMockData.js
git commit -m "feat: adiciona useMockData hook com cache zustand para mocks"
```

---

## Task 17: DashboardPlaceholder consumindo mocks + StatCards reais

**Files:**
- Create: `frontend/src/pages/DashboardPlaceholder.jsx`
- Modify: `frontend/src/App.jsx` — temporariamente, substituir `import Dashboard from './pages/dashboard/Dashboard'` por `import DashboardPlaceholder from './pages/DashboardPlaceholder'` e usar `<DashboardPlaceholder />` na rota `/dashboard`. **NÃO** apagar `pages/dashboard/Dashboard.jsx` — manter para possível reuso/inspeção.

**Interfaces:**
- Consumes: StatCard, useMockData, lucide icons.
- Produces: página inicial visível que valida a Fase 1 inteira — 4 StatCards reais com dados dos mocks.

- [ ] **Step 1: DashboardPlaceholder.jsx**

```jsx
// frontend/src/pages/DashboardPlaceholder.jsx
import { Users, Building2, Crown, UserCheck } from 'lucide-react';
import StatCard from '../components/composite/StatCard';
import EmptyState from '../components/composite/EmptyState';
import { Map } from 'lucide-react';
import { useMockData } from '../mocks/hooks/useMockData';

export default function DashboardPlaceholder() {
  const membros = useMockData('membros');
  const congregacoes = useMockData('congregacoes');
  const pastores = useMockData('pastores');
  const obreiros = useMockData('obreiros');

  const membrosAtivos = membros.filter((m) => m.status === 'ativo').length;
  const membrosNovos = membros.filter((m) => m.status === 'novo').length;
  const membrosBatizados = membros.filter((m) => m.batizado).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Visão geral — App Sede Igreja (Fase 1: fundação)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Membros"
          value={membros.length}
          description={`${membrosAtivos} ativos · ${membrosNovos} novos`}
          trend={{ value: 12.5, direction: 'up' }}
          sparklineData={congregacoes[0]?.crescimento12m || []}
          accent="primary"
        />
        <StatCard
          icon={Building2}
          title="Congregações"
          value={congregacoes.length}
          description="Sede + filiais"
          trend={{ value: 4.2, direction: 'up' }}
          sparklineData={congregacoes[1]?.crescimento12m || []}
          accent="success"
        />
        <StatCard
          icon={Crown}
          title="Pastores"
          value={pastores.length}
          description="Ministros ativos"
          trend={{ value: 2.1, direction: 'up' }}
          sparklineData={congregacoes[2]?.crescimento12m || []}
          accent="warning"
        />
        <StatCard
          icon={UserCheck}
          title="Obreiros"
          value={obreiros.length}
          description={`${obreiros.filter((o) => o.ativo).length} ativos`}
          trend={{ value: 8.7, direction: 'up' }}
          sparklineData={congregacoes[3]?.crescimento12m || []}
          accent="danger"
        />
      </div>

      <EmptyState
        icon={Map}
        title="Mapa Ministerial — em breve"
        description="Painel estratégico com todas as congregações, crescimento, batismos, visitantes, departamentos ativos e saúde ministerial. Será construído na Fase 2."
      />

      <div className="rounded-card border border-border bg-card p-4">
        <p className="text-sm text-muted">
          Batizados: <span className="text-foreground font-medium">{membrosBatizados}</span> de {membros.length} membros.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modificar App.jsx (rota /dashboard)**

Em `frontend/src/App.jsx`:
1. Trocar `import Dashboard from './pages/dashboard/Dashboard';` por `import DashboardPlaceholder from './pages/DashboardPlaceholder';`.
2. Trocar `<Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />` por `<Route path="/dashboard" element={<RotaProtegida><DashboardPlaceholder /></RotaProtegida>} />`.

- [ ] **Step 3: Lint + build**

Run: `cd frontend && npm run lint && npm run build`
Expected: sem erros. Build gera `dist/`, `manifest.webmanifest`, `sw.js`, `workbox-*.js`.

Launch dev rapidamente para verificação visual:
Run (curto, manual decision): `npm run dev` — abrir navegador em `http://localhost:5173`, navegar para `/login` (auth válida para testar sem login local—pode-se mockar usuario no zustand), e após login ver o dashboard novo. **Não é obrigatório executar aqui** — apenas se o usuário quiser ver.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/DashboardPlaceholder.jsx frontend/src/App.jsx
git commit -m "feat: adiciona DashboardPlaceholder consumindo mocks com StatCards reais"
```

---

## Task 18: Validação final

**Files:** nenhum — apenas roda lint + build + verifica artifacts.

- [ ] **Step 1: Lint completo**

Run: `cd frontend && npm run lint`
Expected: zero erros, zero warnings.

- [ ] **Step 2: Build PWA**

Run: `cd frontend && npm run build`
Expected: build sucesso; `dist/` contém `index.html`, `assets/`, `manifest.webmanifest`, `sw.js`, `workbox-*.js`.

- [ ] **Step 3: Verificar artifacts PWA**

Run:
```
Get-ChildItem dist -Filter "manifest.webmanifest" | Select-Object FullName
Get-ChildItem dist -Filter "sw.js" | Select-Object FullName
Get-ChildItem dist -Filter "workbox-*.js" | Select-Object FullName
```
Expected: 3 outputs não-vazios.

- [ ] **Step 4 (opcional): Smoke test manual**

Se o usuário pedir: `npm run dev` → abrir → ver dark mode, sidebar com 4 grupos (PAINEL, PESSOAS, VIDA ECLESIÁSTICA, GESTÃO), topbar completo, toggle dark/light, DashboardPlaceholder renderiza 4 StatCards com sparklines.

- [ ] **Step 5: Commit final (se houver alterações residuais)**

Se nenhuma mudança desde Task 17, nenhum commit necessário. Caso existam ajustes de build, commit com mensagem `chore: ajustes finais da Fase 1`.

---

## Self-Review

**1. Spec coverage:**
- Seção 2 (pastas): criadas em Tasks 1, 2, 3, 4 (ui/), 5 (providers/), 7-13 (composite/), 8-11 (layout/), 15 (mocks/generators/), 16 (mocks/hooks/, mocks/stores/), 17 (pages/). ✓
- Seção 3 (tokens): Task 1. ✓
- Seção 4 (ThemeProvider): Task 5. ✓
- Seção 5 (14 primitivas Shadcn): Task 4. ✓
- Seção 6.1 (Sidebar): Task 8. ✓
- Seção 6.2 (Topbar): Task 10. ✓
- Seção 6.3 (StatCard): Task 13. ✓
- Seção 6.4 (SparklineChart): Task 12. ✓
- Seção 6.5 (Breadcrumb): Task 7. ✓
- Seção 6.6 (DateDisplay): Task 7. ✓
- Seção 6.7 (3 esqueletos do topbar): Task 9. ✓
- Seção 7 (Loading/Empty/Error): Task 14. ✓
- Seção 8 (Mock generators): Task 15. ✓
- Seção 8.1 (useMockData): Task 16. ✓
- Seção 9 (Roteamento + DashboardPlaceholder): Tasks 6, 11 (rootlayout), 17. ✓
- Seção 11 (Restrições): Global Constraints + Tasks não tocam backend/.env/docker. ✓
- Seção 12 (Critérios de aceitação): Task 18 valida todos. ✓

**2. Placeholder scan:** Nenhum "TBD"/"TODO"/"implement later". Steps com referência ao Shadcn oficial (Task 4 steps 9-10) explicitam o que copiar e quais tokens trocar — não é placeholder, é referência padrão de mercado.

**3. Type consistency:**
- `SidebarItem` props `{ item, collapsed, onNavigate }` consistentes em todos os usos de Task 8.
- `Topbar` prop `onToggleSidebar` em Task 10 vs `RootLayout` em Task 11 chama `onToggleSidebar={() => setCollapsed(...)}`. ✓
- `Sidebar` em Task 8 declara prop `onToggleCollapsed` mas o `RootLayout` em Task 11 não passa. Ajustar: `Sidebar` deve usar prop `collapsed` passada e trigar Sheet mobile interno; `onToggleCollapsed` para desktop vem do Topbar. Em Task 11 chamo `onToggleSidebar` (no Topbar) → setCollapsed. Sidebar não precisa do toggle handler externo para desktop (não há botão dentro de Sidebar nesta implementação, esse botão é no Topbar). ✓

`useMockData(tipo, options)` mantém assinatura consistente em Task 16 e uso em Task 17.

Plan finalizado.
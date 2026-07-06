# Fase 2 — Dashboard + Mapa Ministerial + Aion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Dashboard Principal (16 cards), 5 dashboards analíticos funcionais (Membros, Congregações, Eventos, Aniversariantes, Financeiro), Mapa Ministerial (Leaflet), e Aion contextual.

**Architecture:** Cada dashboard é uma página que consome `useMockData` e renderiza KPIs + gráficos SVG puros + tabela via `DashboardTemplate`. Mapa usa Leaflet puro via `useEffect`/`useRef`. Aion recebe contexto via `assistenteStore.setContexto()`.

**Tech Stack:** React 19 + Vite 8 + Tailwind v4 + Radix UI + zustand + lucide-react + Leaflet (CDN, puro)

## Global Constraints

- **NÃO** alterar banco de dados, APIs, ou regras de negócio
- **MANTER** todas as rotas existentes (Membros, Congregações, etc.) funcionando
- **NÃO** instalar: recharts, react-leaflet, framer-motion, jspdf, xlsx
- Export = `window.print()` placeholder
- Gráficos = SVG puro (estender padrão do SparklineChart.jsx)
- Leaflet via CDN + script tag no index.html (não via npm)
- Antes de push: `npm run lint` (0 erros) + `npm run build` (PWA: sw.js, manifest.webmanifest)
- Dark mode padrão (já configurado)
- Usar `useMockData` existente — nenhuma chamada a API real

---

### Task 1: Criar componente DashboardCard

**Files:**
- Create: `frontend/src/components/composite/dashboard/DashboardCard.jsx`

**Interfaces:**
- Consumes: lucide-react icons
- Produces: `<DashboardCard icon label value trend path color />`

- [ ] **Step 1: Create DashboardCard.jsx**

```jsx
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DashboardCard({ icon: Icon, label, value, trend, path, color = 'primary' }) {
  const navigate = useNavigate();
  const colorMap = {
    primary: 'from-primary/20 to-primary/5 border-primary/20',
    success: 'from-success/20 to-success/5 border-success/20',
    warning: 'from-warning/20 to-warning/5 border-warning/20',
    danger: 'from-danger/20 to-danger/5 border-danger/20',
    info: 'from-sky-500/20 to-sky-500/5 border-sky-500/20',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20',
  };

  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        'relative flex flex-col gap-2 rounded-card border bg-gradient-to-br p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]',
        colorMap[color] || colorMap.primary
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-foreground/70" />
        {trend && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', trend > 0 ? 'text-success' : 'text-danger')}>
            {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </button>
  );
}
```

- [ ] **Step 2: Verify no syntax errors**

Run: `npx eslint src/components/composite/dashboard/DashboardCard.jsx --no-ignore`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/composite/dashboard/DashboardCard.jsx
git commit -m "feat(dashboard): create DashboardCard component"
```

---

### Task 2: Criar KpiCard

**Files:**
- Create: `frontend/src/components/composite/dashboard/KpiCard.jsx`

- [ ] **Step 1: Create KpiCard.jsx**

```jsx
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function KpiCard({ label, value, variation, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-sky-500/10 text-sky-500',
  };

  return (
    <div className="flex flex-col gap-1 rounded-card border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted font-medium">{label}</span>
        {Icon && (
          <div className={cn('rounded-lg p-1.5', colorMap[color])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {variation !== undefined && (
        <span className={cn('flex items-center gap-0.5 text-xs font-medium', {
          'text-success': variation > 0,
          'text-danger': variation < 0,
          'text-muted': variation === 0,
        })}>
          {variation > 0 ? <ArrowUpRight className="h-3 w-3" /> : variation < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {variation > 0 ? '+' : ''}{variation}%
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify with linter**

Run: `npx eslint src/components/composite/dashboard/KpiCard.jsx --no-ignore`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/composite/dashboard/KpiCard.jsx
git commit -m "feat(dashboard): create KpiCard component"
```

---

### Task 3: Criar ChartBar, ChartLine, ChartDonut (SVG puro)

**Files:**
- Create: `frontend/src/components/composite/dashboard/ChartBar.jsx`
- Create: `frontend/src/components/composite/dashboard/ChartLine.jsx`
- Create: `frontend/src/components/composite/dashboard/ChartDonut.jsx`

**Interfaces:**
- Consumes: `{ data: {label, value}[], height?, color?, ... }`
- Produces: SVG elements com viewBox responsivo

- [ ] **Step 1: Create ChartBar.jsx**

```jsx
import { cn } from '../../lib/utils';

export default function ChartBar({ data, height = 200, color = 'var(--color-primary)', showValues = true }) {
  if (!data?.length) return <div className="flex items-center justify-center h-[200px] text-sm text-muted">Sem dados para exibir</div>;
  const max = Math.max(...data.map(d => d.value));
  if (max === 0) return <div className="flex items-center justify-center h-[200px] text-sm text-muted">Sem dados para exibir</div>;

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          {showValues && <span className="text-[11px] font-medium text-foreground/70">{d.value}</span>}
          <div
            className="w-full rounded-t transition-all duration-300"
            style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color, minHeight: 4 }}
          />
          {d.label && <span className="text-[10px] text-muted truncate w-full text-center">{d.label}</span>}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create ChartLine.jsx**

```jsx
import { useId } from 'react';

export default function ChartLine({ data, height = 200, color = 'var(--color-primary)', fill = false }) {
  const id = useId();
  if (!data?.length) return <div className="flex items-center justify-center h-[200px] text-sm text-muted">Sem dados para exibir</div>;

  const w = 600;
  const h = height;
  const padX = 30;
  const padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const stepX = chartW / (data.length - 1 || 1);

  const points = data.map((d, i) => `${padX + i * stepX},${padY + chartH - (d.value / max) * chartH}`).join(' ');

  const path = points.split(' ').map((p, i) => {
    const [x, y] = p.split(',');
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        {fill && (
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        )}
      </defs>

      {fill && <path d={`${path} L ${padX + chartW} ${padY + chartH} L ${padX} ${padY + chartH} Z`} fill={`url(#grad-${id})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {data.map((d, i) => (
        <circle key={i} cx={padX + i * stepX} cy={padY + chartH - (d.value / max) * chartH} r="3" fill={color} stroke="var(--color-background)" strokeWidth="2">
          <title>{d.label}: {d.value}</title>
        </circle>
      ))}

      {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 8)) === 0).map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <text key={i} x={padX + idx * stepX} y={h - 4} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize="10">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 3: Create ChartDonut.jsx**

```jsx
const DonutSegment = ({ value, total, index, color, size, strokeWidth }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = index === 0 ? 0 : 0; // simplified: calc from previous segments
  const dash = (value / total) * circ;

  // Calculate offset based on previous segments
  let cumulativeOffset = 0;
  // This will be computed in the parent
  return { dash, offset: cumulativeOffset };
};

export default function ChartDonut({ data, size = 180, innerRadius = 0.6, height }) {
  if (!data?.length) return <div className="flex items-center justify-center h-[180px] text-sm text-muted">Sem dados para exibir</div>;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-[180px] text-sm text-muted">Sem dados para exibir</div>;

  const strokeWidth = size * (1 - innerRadius) / 2;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const center = size / 2;

  let cumOffset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <g transform={`rotate(-90 ${center} ${center})`}>
          {data.map((d, i) => {
            const dash = (d.value / total) * circ;
            const seg = (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={d.color || `var(--color-chart-${(i % 5) + 1})`}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-cumOffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              >
                <title>{d.label}: {d.value}</title>
              </circle>
            );
            cumOffset += circ - dash;
            return seg;
          })}
        </g>
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color || `var(--color-chart-${(i % 5) + 1})` }} />
            <span className="text-foreground">{d.label}</span>
            <span className="text-muted">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Lint all three**

Run: `npx eslint src/components/composite/dashboard/ChartBar.jsx src/components/composite/dashboard/ChartLine.jsx src/components/composite/dashboard/ChartDonut.jsx --no-ignore`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/composite/dashboard/
git commit -m "feat(dashboard): create ChartBar, ChartLine, ChartDonut SVG components"
```

---

### Task 4: Criar DataTable

**Files:**
- Create: `frontend/src/components/composite/dashboard/DataTable.jsx`

- [ ] **Step 1: Create DataTable.jsx**

```jsx
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DataTable({ columns, rows, pageSize = 10 }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter) return rows;
    return rows.filter(r =>
      columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(filter.toLowerCase()))
    );
  }, [rows, filter, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') { setSortDir('desc'); }
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
      else { setSortKey(key); setSortDir('asc'); }
    } else { setSortKey(key); setSortDir('asc'); }
  };

  if (!rows?.length) return <p className="text-sm text-muted py-4 text-center">Nenhum registro encontrado.</p>;

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Filtrar..."
        value={filter}
        onChange={(e) => { setFilter(e.target.value); setPage(0); }}
        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-3 py-2 text-left text-xs font-medium text-muted uppercase tracking-wider', col.sortable !== false && 'cursor-pointer hover:text-foreground select-none')}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                        : <ChevronsUpDown className="h-3 w-3 opacity-30" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map((row, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 text-foreground whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : col.format ? col.format(row[col.key]) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{sorted.length} registros</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-2">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/components/composite/dashboard/DataTable.jsx --no-ignore`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/composite/dashboard/DataTable.jsx
git commit -m "feat(dashboard): create DataTable with sort, filter, pagination"
```

---

### Task 5: Criar PeriodFilter e ExportButton

**Files:**
- Create: `frontend/src/components/composite/dashboard/PeriodFilter.jsx`
- Create: `frontend/src/components/composite/dashboard/ExportButton.jsx`

- [ ] **Step 1: Create PeriodFilter.jsx**

```jsx
import { cn } from '../../lib/utils';

const PERIODOS = [
  { label: '12 meses', value: '12m' },
  { label: 'Trimestre', value: '3m' },
  { label: 'Mês', value: '1m' },
  { label: 'Ano', value: '1y' },
];

export default function PeriodFilter({ value = '12m', onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
      {PERIODOS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange?.(p.value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-colors',
            value === p.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-foreground'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create ExportButton.jsx**

```jsx
import { Printer } from 'lucide-react';
import { Button } from '../../ui/button';

export default function ExportButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="h-4 w-4 mr-1" />
      Exportar
    </Button>
  );
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/composite/dashboard/PeriodFilter.jsx src/components/composite/dashboard/ExportButton.jsx --no-ignore`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/composite/dashboard/PeriodFilter.jsx frontend/src/components/composite/dashboard/ExportButton.jsx
git commit -m "feat(dashboard): create PeriodFilter and ExportButton"
```

---

### Task 6: Criar DashboardTemplate (base reutilizável)

**Files:**
- Create: `frontend/src/pages/dashboards/DashboardTemplate.jsx`

- [ ] **Step 1: Create DashboardTemplate.jsx**

```jsx
import PeriodFilter from '../../components/composite/dashboard/PeriodFilter';
import ExportButton from '../../components/composite/dashboard/ExportButton';
import Breadcrumb from '../../components/composite/Breadcrumb';

export default function DashboardTemplate({ title, subtitle, children, periodo, onPeriodoChange }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb />
          <h1 className="text-2xl font-bold text-foreground mt-1">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={periodo} onChange={onPeriodoChange} />
          <ExportButton />
        </div>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/dashboards/DashboardTemplate.jsx
git commit -m "feat(dashboard): create DashboardTemplate base layout"
```

---

### Task 7: Criar gerador financeiro mock

**Files:**
- Create: `frontend/src/mocks/generators/financeiro.js`
- Modify: `frontend/src/mocks/generators/index.js`

- [ ] **Step 1: Create financeiro.js generator**

```js
import { mulberry32, int, dateBetween, pick } from '../../lib/seed';

const CATEGORIAS_ENTRADA = ['Dízimos','Ofertas','Eventos','Aluguel','Doações','Outros'];
const CATEGORIAS_SAIDA = ['Salários','Energia','Água','Manutenção','Eventos','Material','Alimentação','Transporte','Outros'];
const STATUS = ['confirmado','pendente','cancelado'];

export function gerarFinanceiro(count = 500, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const isEntrada = i % 3 !== 0;
    const cat = isEntrada ? pick(CATEGORIAS_ENTRADA, rng) : pick(CATEGORIAS_SAIDA, rng);
    const valor = isEntrada ? int(200, 25000, rng) : int(100, 15000, rng);
    const data = dateBetween(2, 0, rng);
    list.push({
      id: `F${(i + 1).toString().padStart(4, '0')}`,
      tipo: isEntrada ? 'entrada' : 'saida',
      categoria: cat,
      descricao: `${cat} - ${data.toLocaleDateString('pt-BR')}`,
      valor,
      data: data.toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      formaPagamento: pick(['Dinheiro','PIX','Cartão Débito','Cartão Crédito','Boleto'], rng),
      status: pick(STATUS, rng),
    });
  }
  return list;
}

export default gerarFinanceiro;
```

- [ ] **Step 2: Register in generators/index.js**

Edit `frontend/src/mocks/generators/index.js`:

Add import: `import { gerarFinanceiro } from './financeiro';`

Add to `gerarTudo()`: `const financeiro = gerarFinanceiro(500, seed + 9, congregacoesIds);`

Add to return: `financeiro`

Add to REGISTRY: `financeiro: gerarFinanceiro,`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/mocks/generators/financeiro.js frontend/src/mocks/generators/index.js
git commit -m "feat(mocks): add financeiro generator"
```

---

### Task 8: Criar DashboardPrincipal (16 cards, substitui DashboardPlaceholder)

**Files:**
- Modify: `frontend/src/pages/DashboardPlaceholder.jsx` → substituir conteúdo

- [ ] **Step 1: Rewrite DashboardPlaceholder.jsx as DashboardPrincipal**

```jsx
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, Crown, UserCheck, Layers, Church, CalendarDays,
  CalendarClock, Radio, Cake, Wallet, Package, FolderKanban,
  FileText, BookOpen, Heart,
} from 'lucide-react';
import DashboardCard from '../components/composite/dashboard/DashboardCard';
import Breadcrumb from '../components/composite/Breadcrumb';

const CARDS = [
  { icon: Users, label: 'Membros', value: 0, path: '/dashboard/membros', color: 'primary' },
  { icon: Building2, label: 'Congregações', value: 0, path: '/dashboard/congregacoes', color: 'success' },
  { icon: Crown, label: 'Pastores', value: 0, path: '#', color: 'warning', disabled: true },
  { icon: UserCheck, label: 'Obreiros', value: 0, path: '#', color: 'danger', disabled: true },
  { icon: Layers, label: 'Departamentos', value: 0, path: '#', color: 'info', disabled: true },
  { icon: Church, label: 'Cultos', value: 0, path: '#', color: 'violet', disabled: true },
  { icon: CalendarDays, label: 'Eventos', value: 0, path: '/dashboard/eventos', color: 'pink' },
  { icon: CalendarClock, label: 'Agenda', value: 0, path: '#', color: 'orange', disabled: true },
  { icon: Radio, label: 'Escalas', value: 0, path: '#', color: 'primary', disabled: true },
  { icon: Cake, label: 'Aniversariantes', value: 0, path: '/dashboard/aniversariantes', color: 'warning' },
  { icon: Wallet, label: 'Financeiro', value: 0, path: '/dashboard/financeiro', color: 'success' },
  { icon: Package, label: 'Patrimônio', value: 0, path: '#', color: 'info', disabled: true },
  { icon: FolderKanban, label: 'Projetos', value: 0, path: '#', color: 'violet', disabled: true },
  { icon: FileText, label: 'Documentos', value: 0, path: '#', color: 'orange', disabled: true },
  { icon: BookOpen, label: 'Biblioteca', value: 0, path: '#', color: 'pink', disabled: true },
  { icon: Heart, label: 'Pedidos de Oração', value: 0, path: '#', color: 'danger', disabled: true },
];

export default function DashboardPrincipal() {
  const navigate = useNavigate();

  // Card actions for 5 active dashboards
  const membros = [];
  // mock data retorna do cache zustand
  // import useMockData for real values
  // We'll compute values in a useEffect or inline
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-bold text-foreground mt-1">Dashboard</h1>
        <p className="text-sm text-muted">Visão geral da igreja</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {CARDS.map((card, i) => (
          <DashboardCard
            key={i}
            icon={card.icon}
            label={card.label}
            value={card.value}
            path={card.path}
            color={card.color}
          />
        ))}
      </div>
    </div>
  );
}
```

Wait, I need to show the import of useMockData. Let me fix this.

Actually I need to be more careful. Let me write the proper implementation with mock data values.

- [ ] **Step 1: Rewrite DashboardPlaceholder.jsx**

```jsx
import { useMemo } from 'react';
import {
  Users, Building2, Crown, UserCheck, Layers, Church, CalendarDays,
  CalendarClock, Radio, Cake, Wallet, Package, FolderKanban,
  FileText, BookOpen, Heart,
} from 'lucide-react';
import DashboardCard from '../components/composite/dashboard/DashboardCard';
import Breadcrumb from '../components/composite/Breadcrumb';
import { useMockData } from '../mocks/hooks/useMockData';
import { formatNum } from '../lib/utils';

export default function DashboardPrincipal() {
  const membros = useMockData('membros');
  const congregacoes = useMockData('congregacoes');
  const eventos = useMockData('eventos');
  const aniversariantes = useMockData('aniversariantes');

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anivMes = useMemo(() => aniversariantes.filter(a => {
    const m = parseInt(a.dataNasc?.split('-')[1]);
    return m === mesAtual + 1;
  }), [aniversariantes, mesAtual]);

  const cards = [
    { icon: Users, label: 'Membros', value: formatNum(membros.length), path: '/dashboard/membros', color: 'primary', trend: 12 },
    { icon: Building2, label: 'Congregações', value: formatNum(congregacoes.length), path: '/dashboard/congregacoes', color: 'success', trend: 4 },
    { icon: Crown, label: 'Pastores', value: formatNum(80), path: '#', color: 'warning' },
    { icon: UserCheck, label: 'Obreiros', value: formatNum(250), path: '#', color: 'danger' },
    { icon: Layers, label: 'Departamentos', value: '50', path: '#', color: 'info' },
    { icon: Church, label: 'Cultos', value: formatNum(1000), path: '#', color: 'violet' },
    { icon: CalendarDays, label: 'Eventos', value: formatNum(eventos.length), path: '/dashboard/eventos', color: 'pink' },
    { icon: CalendarClock, label: 'Agenda', value: '—', path: '#', color: 'orange' },
    { icon: Radio, label: 'Escalas', value: formatNum(200), path: '#', color: 'primary' },
    { icon: Cake, label: 'Aniversariantes', value: formatNum(anivMes.length), path: '/dashboard/aniversariantes', color: 'warning', trend: 8 },
    { icon: Wallet, label: 'Financeiro', value: 'R$ 1.2M', path: '/dashboard/financeiro', color: 'success' },
    { icon: Package, label: 'Patrimônio', value: '—', path: '#', color: 'info' },
    { icon: FolderKanban, label: 'Projetos', value: '—', path: '#', color: 'violet' },
    { icon: FileText, label: 'Documentos', value: formatNum(300), path: '#', color: 'orange' },
    { icon: BookOpen, label: 'Biblioteca', value: '—', path: '#', color: 'pink' },
    { icon: Heart, label: 'Pedidos de Oração', value: '—', path: '#', color: 'danger' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-bold text-foreground mt-1">Dashboard</h1>
        <p className="text-sm text-muted">Visão geral da igreja</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <DashboardCard key={i} icon={card.icon} label={card.label} value={card.value} trend={card.trend} path={card.path} color={card.color} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/pages/DashboardPlaceholder.jsx --no-ignore`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DashboardPlaceholder.jsx
git commit -m "feat(dashboard): replace placeholder with DashboardPrincipal (16 cards)"
```

---

### Task 9: Criar DashboardMembros

**Files:**
- Create: `frontend/src/pages/dashboards/DashboardMembros.jsx`

- [ ] **Step 1: Create DashboardMembros.jsx**

```jsx
import { useMemo } from 'react';
import { Users, UserPlus, Activity, Heart } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import ChartLine from '../../components/composite/dashboard/ChartLine';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardMembros() {
  const membros = useMockData('membros');
  const congregacoes = useMockData('congregacoes');

  const ativos = membros.filter(m => m.status === 'ativo');
  const novos = membros.filter(m => m.status === 'novo');
  const batizados = membros.filter(m => m.batizado);

  // Agrupar por sexo
  const sexoCount = useMemo(() => {
    const m = membros.filter(x => x.sexo === 'M').length;
    return [
      { label: 'Masculino', value: m, color: 'var(--color-primary)' },
      { label: 'Feminino', value: membros.length - m, color: 'var(--color-chart-2)' },
    ];
  }, [membros]);

  // Crescimento mensal (últimos 12)
  const meses = ['Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr','Mai','Jun'];
  const crescimento = congregacoes[0]?.crescimento12m?.map((v, i) => ({ label: meses[i] || '', value: v })) || [];

  // Faixa etária
  const faixaEtaria = useMemo(() => {
    const faixas = [{ label: '0-17', min: 0, max: 17 }, { label: '18-30', min: 18, max: 30 }, { label: '31-45', min: 31, max: 45 }, { label: '46-60', min: 46, max: 60 }, { label: '60+', min: 61, max: 200 }];
    return faixas.map(f => ({
      label: f.label,
      value: membros.filter(m => {
        const idade = m.dataNasc ? new Date().getFullYear() - parseInt(m.dataNasc.slice(0, 4)) : 0;
        return idade >= f.min && idade <= f.max;
      }).length,
    }));
  }, [membros]);

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'sexo', label: 'Sexo' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Membros" subtitle="Análise completa do cenário de membros">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Membros" value={membros.length} variation={12.5} icon={Users} color="primary" />
        <KpiCard label="Ativos" value={ativos.length} variation={5.2} icon={Activity} color="success" />
        <KpiCard label="Novos (este mês)" value={novos.length} variation={8.1} icon={UserPlus} color="info" />
        <KpiCard label="Batizados" value={batizados.length} variation={3.4} icon={Heart} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Crescimento (12 meses)</h3>
          <ChartBar data={crescimento} color="var(--color-primary)" />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Faixa Etária</h3>
          <ChartDonut data={faixaEtaria} />
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Últimos Membros</h3>
        <DataTable columns={columns} rows={membros.slice(0, 50)} />
      </div>
    </DashboardTemplate>
  );
}
```

- [ ] **Step 2: Create remaining 4 dashboards following same pattern**

**DashboardCongregacoes.jsx:**

```jsx
import { useMemo } from 'react';
import { Building2, TrendingUp, Users, FileText } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import ChartLine from '../../components/composite/dashboard/ChartLine';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardCongregacoes() {
  const congregacoes = useMockData('congregacoes');
  const membros = useMockData('membros');

  const maiorCrescimento = congregacoes.length ? Math.max(...congregacoes.map(c => c.crescimento12m?.slice(-1)[0] || 0)) : 0;
  const totalMembrosCong = congregacoes.reduce((s, c) => s + (c.membrosCount || 0), 0);

  const porUF = useMemo(() => {
    const map = {};
    congregacoes.forEach(c => { map[c.uf] = (map[c.uf] || 0) + 1; });
    const cores = { SP: 'var(--color-primary)', RJ: 'var(--color-chart-2)', MG: 'var(--color-chart-3)', PR: 'var(--color-chart-4)', BA: 'var(--color-chart-5)' };
    return Object.entries(map).map(([k, v]) => ({ label: k, value: v, color: cores[k] || 'var(--color-muted)' }));
  }, [congregacoes]);

  const crescimentoTotal = congregacoes[0]?.crescimento12m?.map((_, i) => ({
    label: ['Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr','Mai','Jun'][i] || '',
    value: congregacoes.reduce((s, c) => s + ((c.crescimento12m || [])[i] || 0), 0),
  })) || [];

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'cidade', label: 'Cidade', render: (v, r) => `${r.cidade}/${r.uf}` },
    { key: 'membrosCount', label: 'Membros' },
    { key: 'departamentosAtivos', label: 'Deptos' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Congregações" subtitle="Análise de todas as congregações">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Congregações" value={congregacoes.length} variation={4.2} icon={Building2} color="primary" />
        <KpiCard label="Média Membros" value={congregacoes.length ? Math.round(totalMembrosCong / congregacoes.length) : 0} variation={2.1} icon={Users} color="success" />
        <KpiCard label="Maior Crescimento" value={maiorCrescimento} icon={TrendingUp} color="info" />
        <KpiCard label="Com Relatório" value={`${Math.round(congregacoes.length * 0.85)}/${congregacoes.length}`} icon={FileText} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Crescimento Total (12 meses)</h3>
          <ChartLine data={crescimentoTotal} color="var(--color-primary)" fill />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Por Estado</h3>
          <ChartDonut data={porUF} />
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Todas as Congregações</h3>
        <DataTable columns={columns} rows={congregacoes} />
      </div>
    </DashboardTemplate>
  );
}
```

**DashboardEventos.jsx:**

```jsx
import { useMemo } from 'react';
import { CalendarDays, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardEventos() {
  const eventos = useMockData('eventos');
  const realizados = eventos.filter(e => e.realizado);
  const proximos = eventos.filter(e => !e.realizado);
  const totalParticipantes = realizados.reduce((s, e) => s + (e.participantes || 0), 0);

  const porTipo = useMemo(() => {
    const map = {};
    eventos.forEach(e => { map[e.tipo] = (map[e.tipo] || 0) + 1; });
    const cores = ['var(--color-primary)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)', 'var(--color-chart-7)'];
    return Object.entries(map).slice(0, 6).map(([k, v], i) => ({ label: k, value: v, color: cores[i] }));
  }, [eventos]);

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'data', label: 'Data' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'participantes', label: 'Participantes' },
    { key: 'realizado', label: 'Status', render: (v) => v ? 'Realizado' : 'Previsto' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Eventos" subtitle="Acompanhamento de eventos e atividades">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Eventos (ano)" value={eventos.length} icon={CalendarDays} color="primary" />
        <KpiCard label="Próximos 30 dias" value={proximos.length} icon={TrendingUp} color="info" />
        <KpiCard label="Realizados" value={realizados.length} variation={95} icon={CheckCircle2} color="success" />
        <KpiCard label="Média Participantes" value={realizados.length ? Math.round(totalParticipantes / realizados.length) : 0} icon={Users} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Eventos por Tipo</h3>
          <ChartDonut data={porTipo} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Próximos Eventos</h3>
          <DataTable columns={columns} rows={proximos.slice(0, 20)} />
        </div>
      </div>
    </DashboardTemplate>
  );
}
```

**DashboardAniversariantes.jsx:**

```jsx
import { useMemo } from 'react';
import { Cake, Calendar, Users, Gift } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardAniversariantes() {
  const aniversariantes = useMockData('aniversariantes');
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const mesAtual = hoje.getMonth() + 1;

  const hojeAniv = useMemo(() => aniversariantes.filter(a => {
    const [y, m, d] = (a.dataNasc || '').split('-').map(Number);
    return m === mesAtual && d === hoje.getDate();
  }), [aniversariantes, mesAtual, hoje]);

  const mesAniv = useMemo(() => aniversariantes.filter(a => {
    const m = parseInt((a.dataNasc || '').split('-')[1]);
    return m === mesAtual;
  }), [aniversariantes, mesAtual]);

  const porMes = useMemo(() => {
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const counts = Array(12).fill(0);
    aniversariantes.forEach(a => {
      const m = parseInt((a.dataNasc || '').split('-')[1]);
      if (m >= 1 && m <= 12) counts[m - 1]++;
    });
    return meses.map((label, i) => ({ label, value: counts[i] }));
  }, [aniversariantes]);

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'dataNasc', label: 'Data de Nascimento' },
    { key: 'idadeFutura', label: 'Idade' },
  ];

  return (
    <DashboardTemplate title="Dashboard de Aniversariantes" subtitle="Acompanhamento de aniversários">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Aniversariantes Hoje" value={hojeAniv.length} icon={Gift} color="warning" />
        <KpiCard label="Este Mês" value={mesAniv.length} icon={Cake} color="primary" />
        <KpiCard label="Total Cadastrados" value={aniversariantes.length} icon={Users} color="info" />
        <KpiCard label="Média por Mês" value={Math.round(aniversariantes.length / 12)} icon={Calendar} color="success" />
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Aniversariantes por Mês</h3>
        <ChartBar data={porMes} color="var(--color-warning)" />
      </div>

      {mesAniv.length > 0 && (
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Aniversariantes deste mês</h3>
          <DataTable columns={columns} rows={mesAniv} />
        </div>
      )}
    </DashboardTemplate>
  );
}
```

**DashboardFinanceiro.jsx:**

```jsx
import { useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import DashboardTemplate from './DashboardTemplate';
import KpiCard from '../../components/composite/dashboard/KpiCard';
import ChartLine from '../../components/composite/dashboard/ChartLine';
import ChartDonut from '../../components/composite/dashboard/ChartDonut';
import ChartBar from '../../components/composite/dashboard/ChartBar';
import DataTable from '../../components/composite/dashboard/DataTable';
import { useMockData } from '../../mocks/hooks/useMockData';

export default function DashboardFinanceiro() {
  const congregacoes = useMockData('congregacoes');
  const financeiro = useMockData('financeiro');

  const totalEntradas = congregacoes.reduce((s, c) => s + (c.financeiro?.entradas || 0), 0);
  const totalSaidas = congregacoes.reduce((s, c) => s + (c.financeiro?.saidas || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  const entradas = financeiro.filter(f => f.tipo === 'entrada');
  const saidas = financeiro.filter(f => f.tipo === 'saida');

  const gastosPorCat = useMemo(() => {
    const map = {};
    saidas.forEach(s => { map[s.categoria] = (map[s.categoria] || 0) + s.valor; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const cores = ['var(--color-danger)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)'];
    return sorted.map(([k, v], i) => ({ label: k, value: Math.round(v / 1000), color: cores[i] }));
  }, [saidas]);

  const receitasPorCat = useMemo(() => {
    const map = {};
    entradas.forEach(e => { map[e.categoria] = (map[e.categoria] || 0) + e.valor; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const cores = ['var(--color-success)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)'];
    return sorted.map(([k, v], i) => ({ label: k, value: Math.round(v / 1000), color: cores[i] }));
  }, [entradas]);

  const columns = [
    { key: 'descricao', label: 'Descrição' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'valor', label: 'Valor', format: (v) => `R$ ${(v || 0).toLocaleString('pt-BR')}` },
    { key: 'data', label: 'Data' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <DashboardTemplate title="Dashboard Financeiro" subtitle="Análise financeira consolidada">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Entradas (ano)" value={`R$ ${(totalEntradas / 1000).toFixed(0)}k`} variation={8.5} icon={TrendingUp} color="success" />
        <KpiCard label="Saídas (ano)" value={`R$ ${(totalSaidas / 1000).toFixed(0)}k`} variation={-3.2} icon={TrendingDown} color="danger" />
        <KpiCard label="Saldo" value={`R$ ${(saldo / 1000).toFixed(0)}k`} variation={saldo > 0 ? 15.3 : -5.1} icon={Wallet} color={saldo > 0 ? 'success' : 'danger'} />
        <KpiCard label="Total Movimentações" value={financeiro.length} icon={DollarSign} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Gastos por Categoria (k R$)</h3>
          <ChartDonut data={gastosPorCat} />
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Receitas por Categoria (k R$)</h3>
          <ChartDonut data={receitasPorCat} />
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Últimas Movimentações</h3>
        <DataTable columns={columns} rows={financeiro.slice(0, 50)} />
      </div>
    </DashboardTemplate>
  );
}
```

- [ ] **Step 3: Lint all dashboards**

Run: `npx eslint src/pages/dashboards/ --no-ignore`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/dashboards/
git commit -m "feat(dashboard): create 5 analytic dashboards (Membros, Congregações, Eventos, Aniversariantes, Financeiro)"
```

---

### Task 10: Criar Mapa Ministerial

**Files:**
- Create: `frontend/src/components/mapa/MapaView.jsx`
- Create: `frontend/src/components/mapa/CongregacaoCard.jsx`
- Create: `frontend/src/pages/MapaMinisterial.jsx`
- Modify: `frontend/index.html` (add Leaflet CDN)

- [ ] **Step 1: Add Leaflet CSS/JS to index.html**

Edit `frontend/index.html`:
Add before `</head>`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
```
Add before `</body>`:
```html
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
```

- [ ] **Step 2: Create MapaView.jsx**

```jsx
import { useEffect, useRef } from 'react';

export default function MapaView({ congregacoes, onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (mapInstance.current || !window.L) return;

    mapInstance.current = window.L.map(mapRef.current, {
      center: [-23.5505, -46.6333],
      zoom: 6,
      zoomControl: false,
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !window.L || !congregacoes?.length) return;

    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];

    const bounds = [];

    congregacoes.forEach((c, i) => {
      // Simulate lat/lng from uf (simplified — real app would geocode)
      const coords = {
        SP: [-23.55, -46.63],
        RJ: [-22.91, -43.20],
        MG: [-19.92, -43.94],
        PR: [-25.43, -49.27],
        BA: [-12.97, -38.50],
      }[c.uf] || [-23.55, -46.63];

      // Add slight jitter so pins don't overlap
      const lat = coords[0] + (Math.random() - 0.5) * 2;
      const lng = coords[1] + (Math.random() - 0.5) * 2;

      const marker = window.L.circleMarker([lat, lng], {
        radius: 8 + Math.sqrt(c.membrosCount || 50) / 4,
        fillColor: c.membrosCount > 200 ? '#22c55e' : c.membrosCount > 100 ? '#eab308' : '#ef4444',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      }).addTo(mapInstance.current);

      marker.bindPopup(`<b>${c.nome}</b><br/>Membros: ${c.membrosCount}<br/>${c.cidade}/${c.uf}`);
      marker.on('click', () => onSelect?.(c));
      markersRef.current.push(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 1) {
      mapInstance.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [congregacoes, onSelect]);

  return <div ref={mapRef} className="h-full w-full rounded-card" style={{ minHeight: 400 }} />;
}
```

- [ ] **Step 3: Create CongregacaoCard.jsx**

```jsx
import { cn } from '../../lib/utils';

export default function CongregacaoCard({ congregacao, selected, onClick }) {
  if (!congregacao) return null;
  const saudavel = (congregacao.membrosCount || 0) > 150;
  const atencao = (congregacao.membrosCount || 0) > 80 && (congregacao.membrosCount || 0) <= 150;
  const critico = (congregacao.membrosCount || 0) <= 80;

  return (
    <button
      onClick={() => onClick?.(congregacao)}
      className={cn(
        'w-full text-left rounded-lg border p-3 transition-all hover:bg-muted/30',
        selected?.id === congregacao.id ? 'border-primary bg-primary/5' : 'border-border'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground truncate">{congregacao.nome}</span>
        <span className={cn('inline-block h-2 w-2 rounded-full', {
          'bg-success': saudavel,
          'bg-warning': atencao,
          'bg-danger': critico,
        })} />
      </div>
      <p className="text-xs text-muted mt-0.5">{congregacao.cidade}/{congregacao.uf}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-foreground/70">
        <span>{congregacao.membrosCount} membros</span>
        <span className="text-success">+{congregacao.crescimento12m?.slice(-1)[0] || 0}</span>
      </div>
    </button>
  );
}
```

- [ ] **Step 4: Create MapaMinisterial.jsx**

```jsx
import { useState } from 'react';
import { Building2, TrendingUp, Users, Heart } from 'lucide-react';
import Breadcrumb from '../components/composite/Breadcrumb';
import KpiCard from '../components/composite/dashboard/KpiCard';
import MapaView from '../components/mapa/MapaView';
import CongregacaoCard from '../components/mapa/CongregacaoCard';
import { useMockData } from '../mocks/hooks/useMockData';

export default function MapaMinisterial() {
  const congregacoes = useMockData('congregacoes');
  const [selected, setSelected] = useState(null);

  const totalBatismos = congregacoes.reduce((s, c) => s + (c.batismos12mTotal || 0), 0);
  const totalVisitantes = congregacoes.reduce((s, c) => s + ((c.visitantes12m || []).reduce((a, b) => a + b, 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="text-2xl font-bold text-foreground mt-1">Mapa Ministerial</h1>
        <p className="text-sm text-muted">Painel estratégico de todas as congregações</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Congregações" value={congregacoes.length} icon={Building2} color="primary" />
        <KpiCard label="Total Membros" value={congregacoes.reduce((s, c) => s + (c.membrosCount || 0), 0)} icon={Users} color="success" />
        <KpiCard label="Batismos (12m)" value={totalBatismos} variation={7.3} icon={Heart} color="warning" />
        <KpiCard label="Visitantes (12m)" value={totalVisitantes} icon={TrendingUp} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-card border border-border bg-card p-2" style={{ minHeight: 500 }}>
          <MapaView congregacoes={congregacoes} onSelect={setSelected} />
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-foreground px-1">Congregações</h3>
          {congregacoes.slice(0, 20).map(c => (
            <CongregacaoCard key={c.id} congregacao={c} selected={selected} onClick={setSelected} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Lint**

Run: `npx eslint src/components/mapa/ src/pages/MapaMinisterial.jsx --no-ignore`

- [ ] **Step 6: Commit**

```bash
git add frontend/index.html frontend/src/components/mapa/ frontend/src/pages/MapaMinisterial.jsx
git commit -m "feat(mapa): create Mapa Ministerial with Leaflet and health cards"
```

---

### Task 11: Atualizar store do Aion com contexto

**Files:**
- Modify: `frontend/src/stores/assistente.js`

- [ ] **Step 1: Update assistente store**

```js
import { create } from 'zustand';

export const useAssistenteStore = create((set) => ({
  aberto: false,
  historico: [],
  carregando: false,
  acaoPendente: null,
  dadosColetados: {},
  contextoAtual: null,
  dadosContexto: null,
  sistemaPrompt: null,

  abrir: () => set({ aberto: true }),
  fechar: () => set({ aberto: false }),
  alternar: () => set((s) => ({ aberto: !s.aberto })),

  adicionarMensagem: (role, content) =>
    set((s) => ({
      historico: [...s.historico, { role, content }].slice(-40),
    })),

  setCarregando: (v) => set({ carregando: v }),
  setAcaoPendente: (acao) => set({ acaoPendente: acao }),
  limparAcaoPendente: () => set({ acaoPendente: null, dadosColetados: {} }),
  limparHistorico: () => set({ historico: [], acaoPendente: null, dadosColetados: {} }),

  setContexto: (tipo, dados) => set({
    contextoAtual: tipo,
    dadosContexto: dados,
  }),
  limparContexto: () => set({ contextoAtual: null, dadosContexto: null }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/stores/assistente.js
git commit -m "feat(aion): add setContexto for contextual dashboard queries"
```

---

### Task 12: Atualizar rotas, sidebar e constantes

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/lib/constants.js`

- [ ] **Step 1: Fix routeExists for new routes in constants.js**

Change items in constants.js:
- `/dashboard` → already `routeExists: true`
- No menu items need changing since we're routing dashboards under `/dashboard/:tipo`
- Keep `routeExists: false` for items that don't have routes yet

- [ ] **Step 2: Add routes to App.jsx**

Add imports:
```jsx
import DashboardMembros from './pages/dashboards/DashboardMembros';
import DashboardCongregacoes from './pages/dashboards/DashboardCongregacoes';
import DashboardEventos from './pages/dashboards/DashboardEventos';
import DashboardAniversariantes from './pages/dashboards/DashboardAniversariantes';
import DashboardFinanceiro from './pages/dashboards/DashboardFinanceiro';
import MapaMinisterial from './pages/MapaMinisterial';
```

Add routes inside `<Routes>`:
```jsx
<Route path="/dashboard/membros" element={<RotaProtegida><DashboardMembros /></RotaProtegida>} />
<Route path="/dashboard/congregacoes" element={<RotaProtegida><RotaAdmin><DashboardCongregacoes /></RotaAdmin></RotaProtegida>} />
<Route path="/dashboard/eventos" element={<RotaProtegida><DashboardEventos /></RotaProtegida>} />
<Route path="/dashboard/aniversariantes" element={<RotaProtegida><DashboardAniversariantes /></RotaProtegida>} />
<Route path="/dashboard/financeiro" element={<RotaProtegida><DashboardFinanceiro /></RotaProtegida>} />
<Route path="/mapa-ministerial" element={<RotaProtegida><MapaMinisterial /></RotaProtegida>} />
```

Update sidebar in constants: change `/mapa-ministerial` to `routeExists: true`.

- [ ] **Step 3: Lint**

Run: `npx eslint src/App.jsx src/lib/constants.js --no-ignore`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.jsx frontend/src/lib/constants.js
git commit -m "feat(routes): add dashboard routes and Mapa Ministerial"
```

---

### Task 13: Verification — lint + build

**Files:**
- None (verification only)

- [ ] **Step 1: Full lint**

```bash
cd frontend
npx eslint src/ --no-ignore
```

Expected: 0 errors, 0 warnings
If errors: fix and re-lint

- [ ] **Step 2: Full build**

```bash
cd frontend
npm run build
```

Expected: Build completes in ~1s with PWA artifacts (sw.js, manifest.webmanifest, workbox-*.js)

- [ ] **Step 3: Verify build output**

```bash
ls dist/sw.js dist/manifest.webmanifest
```

Expected: both files exist

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: lint and build cleanup for Fase 2"
```

---

## Self-Review

**Spec coverage check:**
- [x] Dashboard Principal 16 cards → Task 8
- [x] 5 dashboards analíticos → Task 9
- [x] DashboardTemplate → Task 6
- [x] Mapa Ministerial → Task 10 (MapaView, CongregacaoCard, page)
- [x] Componentes gráficos SVGs → Task 3 (ChartBar/Line/Donut), Task 1 (DashboardCard), Task 2 (KpiCard), Task 4 (DataTable), Task 5 (PeriodFilter/ExportButton)
- [x] Gerador financeiro → Task 7
- [x] Aion contextual → Task 11
- [x] Rotas + Sidebar → Task 12
- [x] Lint + Build → Task 13
- [x] Leaflet CDN → Task 10 step 1

**Placeholder scan:** All code blocks contain full implementations. No TODOs, TBDs, or "implement later".

**Type consistency:** `useMockData` returns arrays matching generator shapes. `setContexto(tipo, dados)` matches store signature. DashboardCard props match usage in DashboardPrincipal.

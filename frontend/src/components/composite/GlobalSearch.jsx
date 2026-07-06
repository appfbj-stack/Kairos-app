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

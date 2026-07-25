import { cn } from '../../lib/utils';

export default function CongregacaoCard({ congregacao, selected, onClick }) {
  if (!congregacao) return null;
  const saudavel = (congregacao.membrosCount || 0) > 150;
  const atencao = (congregacao.membrosCount || 0) > 80 && (congregacao.membrosCount || 0) <= 150;

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
          'bg-danger': !saudavel && !atencao,
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

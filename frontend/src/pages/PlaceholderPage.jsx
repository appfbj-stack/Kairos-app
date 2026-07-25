import { useLocation } from 'react-router-dom';

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const label = pathname
    .replace(/^\//, '')
    .replace(/\//g, ' › ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-primary">✦</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{label}</h1>
      <p className="text-muted-foreground text-sm max-w-md">
        Esta página está sendo preparada. Em breve você poderá gerenciar {label.toLowerCase()} por aqui.
      </p>
    </div>
  );
}

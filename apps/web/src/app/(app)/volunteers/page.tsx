import { HandHeart } from "lucide-react";

export default function VolunteersPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-muted p-5">
        <HandHeart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Voluntários</h1>
      <p className="text-muted-foreground max-w-sm">
        Módulo de gestão de voluntários em desenvolvimento. Em breve você poderá cadastrar escala de voluntários, funções e disponibilidade.
      </p>
      <span className="mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
        Em breve
      </span>
    </div>
  );
}

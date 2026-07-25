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

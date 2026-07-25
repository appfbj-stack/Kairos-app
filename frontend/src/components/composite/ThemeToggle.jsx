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

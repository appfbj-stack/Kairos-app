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

  const crumbs = segments.reduce((result, seg) => {
    const to = (result.length > 0 ? result[result.length - 1].to : '') + '/' + seg;
    result.push({ to, label: LABELS[to] || seg.charAt(0).toUpperCase() + seg.slice(1) });
    return result;
  }, []);

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

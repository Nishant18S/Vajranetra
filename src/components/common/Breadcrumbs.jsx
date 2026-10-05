import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {it.to && !last ? (
                <Link to={it.to} className="hover:text-blue-700">
                  {it.label}
                </Link>
              ) : (
                <span className={last ? 'text-slate-800' : ''}>
                  {it.label}
                </span>
              )}
              {!last && (
                <ChevronRight size={10} className="text-slate-400" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
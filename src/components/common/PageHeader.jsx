import Breadcrumbs from './Breadcrumbs';

export default function PageHeader({ title, subtitle, breadcrumbs, right }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-3 border-b border-slate-200">
      <div className="min-w-0">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1 className="text-xl font-semibold text-slate-800 mt-1">{title}</h1>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {right && (
        <div className="flex items-center gap-3 flex-wrap">{right}</div>
      )}
    </div>
  );
}
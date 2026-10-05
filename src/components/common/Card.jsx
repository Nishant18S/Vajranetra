export default function Card({
  title,
  actions,
  children,
  className = '',
  dense = false,
}) {
  return (
    <section className={`vn-panel ${className}`}>
      {(title || actions) && (
        <header className="vn-panel__hd">
          {title && <h3 className="vn-panel__title">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={dense ? '' : 'p-4'}>{children}</div>
    </section>
  );
}
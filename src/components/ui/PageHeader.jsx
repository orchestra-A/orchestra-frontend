export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="mb-6 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
        {subtitle && <p className="text-text-muted mt-1">{subtitle}</p>}
      </div>
      {children && <div>{children}</div>}
    </header>
  );
}

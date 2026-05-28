export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-surface-2 text-text-muted border-border',
    info: 'bg-brand/10 text-brand border-brand/20',
    success: 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}

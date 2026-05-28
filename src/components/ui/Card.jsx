export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

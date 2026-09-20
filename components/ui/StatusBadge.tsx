export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="status-badge">
      <span className="status-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

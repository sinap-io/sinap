export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-3 bg-[var(--border)] rounded w-32" />
        <div className="h-8 bg-[var(--border)] rounded w-56" />
        <div className="h-4 bg-[var(--border)] rounded w-40" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] p-4 h-20" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4 bg-[var(--border)] rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
        ))}
      </div>
    </div>
  );
}

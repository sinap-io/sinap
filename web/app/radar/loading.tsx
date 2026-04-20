export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-3 bg-[var(--border)] rounded w-32" />
        <div className="h-8 bg-[var(--border)] rounded w-48" />
      </div>
      <div className="flex gap-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-9 bg-[var(--border)] rounded-full w-32" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-4 bg-[var(--border)] rounded" style={{ width: `${65 + (i % 4) * 9}%` }} />
        ))}
      </div>
    </div>
  );
}

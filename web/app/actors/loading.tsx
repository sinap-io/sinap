export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-[var(--border)] rounded w-36" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] p-5 h-20" />
        ))}
      </div>
    </div>
  );
}

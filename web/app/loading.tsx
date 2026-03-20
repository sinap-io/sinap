export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-10">
        <div className="h-8 bg-[var(--border)] rounded w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-[var(--border)] rounded w-1/2 mx-auto mb-8" />
        <div className="flex justify-center gap-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-10 w-16 bg-[var(--border)] rounded mb-2 mx-auto" />
              <div className="h-3 w-20 bg-[var(--border)] rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6 h-40" />
        ))}
      </div>
    </div>
  );
}

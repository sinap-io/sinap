export default function Loading() {
  return (
    <div className="md:ml-60 pt-14 md:pt-0 min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="h-7 w-32 bg-slate-200 rounded animate-pulse mb-1" />
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mb-6" />
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-4 border-b border-slate-100">
              <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

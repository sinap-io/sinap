export default function Loading() {
  return (
    <div className="md:ml-60 flex flex-col h-screen pt-14 md:pt-0">
      <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
        <div className="h-5 w-52 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-72 bg-slate-100 rounded animate-pulse mt-2" />
      </div>
      <div className="flex-1" />
      <div className="shrink-0 px-6 py-4 border-t border-slate-200 bg-white">
        <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

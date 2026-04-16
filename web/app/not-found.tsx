import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <p className="text-7xl font-bold text-[var(--accent)] opacity-30">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          Página no encontrada
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-sm">
          La dirección que ingresaste no existe o fue movida.
        </p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm
                   font-medium hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SearchClient from "@/components/search/SearchClient";

export default async function SearchPage() {
  const session = await auth();
  if ((session?.user as { rol?: string })?.rol === "freemium") redirect("/");
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Buscar con IA</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Describí lo que necesitás en lenguaje libre. La IA cruza tu consulta con los
          servicios y actores del ecosistema, y detecta automáticamente los gaps.
        </p>
      </div>

      <SearchClient />
    </div>
  );
}

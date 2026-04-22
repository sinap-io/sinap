import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AsistenteChat from "./AsistenteChat";

const ROLES_CON_ACCESO = ["admin", "manager", "directivo", "vinculador", "socio"];

export const metadata = { title: "Asistente — SINAP" };

export default async function AsistentePage() {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (!ROLES_CON_ACCESO.includes(rol)) redirect("/");
  return <AsistenteChat />;
}

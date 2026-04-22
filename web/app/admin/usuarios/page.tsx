import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listarUsuarios } from "./actions";
import AdminUsuariosClient from "./AdminUsuariosClient";

export const metadata = { title: "Usuarios — SINAP" };

export default async function AdminUsuariosPage() {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (!["admin", "manager"].includes(rol)) redirect("/");

  const usuarios = await listarUsuarios();
  return <AdminUsuariosClient usuarios={usuarios} />;
}

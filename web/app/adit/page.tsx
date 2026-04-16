import { redirect } from "next/navigation";

// Ruta legacy — renombrada a /vinculadores
export default function AditPage() {
  redirect("/vinculadores");
}

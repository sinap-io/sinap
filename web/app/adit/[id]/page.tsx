import { redirect } from "next/navigation";

// Ruta legacy — renombrada a /vinculadores/[id]
export default function AditDetailPage({ params }: { params: { id: string } }) {
  redirect(`/vinculadores/${params.id}`);
}

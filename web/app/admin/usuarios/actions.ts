"use server";

import { auth } from "@/auth";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const ROLES_VALIDOS = ["admin", "manager", "directivo", "vinculador", "oferente", "demandante"];

async function checkAdmin() {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (!["admin", "manager"].includes(rol)) throw new Error("No autorizado.");
}

export type Usuario = {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
};

export async function listarUsuarios(): Promise<Usuario[]> {
  await checkAdmin();
  const { rows } = await pool.query(
    "SELECT id, email, nombre, rol, activo FROM usuario ORDER BY rol, nombre"
  );
  return rows;
}

export async function actualizarUsuario(
  id: number,
  data: { nombre?: string; rol?: string; activo?: boolean; password?: string }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await checkAdmin();

    if (data.rol && !ROLES_VALIDOS.includes(data.rol)) {
      return { ok: false, error: "Rol inválido." };
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.nombre !== undefined) { sets.push(`nombre = $${i++}`); values.push(data.nombre.trim()); }
    if (data.rol !== undefined)    { sets.push(`rol = $${i++}`);    values.push(data.rol); }
    if (data.activo !== undefined) { sets.push(`activo = $${i++}`); values.push(data.activo); }
    if (data.password)             {
      const hashed = await hash(data.password, 10);
      sets.push(`password = $${i++}`);
      values.push(hashed);
    }

    if (sets.length === 0) return { ok: true };

    values.push(id);
    await pool.query(`UPDATE usuario SET ${sets.join(", ")} WHERE id = $${i}`, values);
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function crearUsuario(data: {
  email: string;
  nombre: string;
  rol: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await checkAdmin();

    if (!data.email || !data.nombre || !data.password) {
      return { ok: false, error: "Email, nombre y contraseña son obligatorios." };
    }
    if (!ROLES_VALIDOS.includes(data.rol)) {
      return { ok: false, error: "Rol inválido." };
    }

    const hashed = await hash(data.password, 10);
    await pool.query(
      "INSERT INTO usuario (email, nombre, rol, password, activo) VALUES ($1, $2, $3, $4, true)",
      [data.email.toLowerCase().trim(), data.nombre.trim(), data.rol, hashed]
    );
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { ok: false, error: "Ya existe un usuario con ese email." };
    }
    return { ok: false, error: "No se pudo crear el usuario." };
  }
}

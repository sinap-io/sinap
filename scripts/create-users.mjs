import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcrypt = require("../web/node_modules/bcryptjs/index.js");
const { Pool } = require("../web/node_modules/pg");


const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_9mzdCgX7weqn@ep-tiny-cell-acjfdkps.sa-east-1.aws.neon.tech/neondb",
  ssl: { rejectUnauthorized: false },
});

async function upsertUser(email, password, nombre, rol) {
  const hash = await bcrypt.hash(password, 12);
  const res = await pool.query(
    `INSERT INTO usuario (email, password, nombre, rol, activo)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (email) DO UPDATE
       SET password = EXCLUDED.password,
           nombre   = EXCLUDED.nombre,
           rol      = EXCLUDED.rol,
           activo   = true
     RETURNING id, email, rol`,
    [email, hash, nombre, rol]
  );
  return res.rows[0];
}

const users = [
  { email: "sebabizzi@gmail.com",  password: "sinap2026", nombre: "Sebastián", rol: "admin" },
  { email: "pdiazazulay@gmail.com", password: "sinap2026", nombre: "Pablo",     rol: "directivo" },
];

for (const u of users) {
  const row = await upsertUser(u.email, u.password, u.nombre, u.rol);
  console.log(`✅ ${row.email} (${row.rol}) — id ${row.id}`);
}

await pool.end();

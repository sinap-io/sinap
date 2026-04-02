"""
Script para crear o actualizar usuarios en SINAP.

Uso:
  python scripts/crear_usuario.py <email> <contraseña> <nombre> <rol>

Roles válidos: admin | manager | directivo | vinculador | oferente | demandante

Ejemplos:
  python scripts/crear_usuario.py juan@empresa.com sinap2026 "Juan García" vinculador
  python scripts/crear_usuario.py maria@bio.com pass123 "María López" oferente

Base de datos: lee DATABASE_URL desde el .env en la raíz del proyecto (sinap/.env).
La raíz del proyecto es dos niveles arriba de este script (api/scripts/ → api/ → sinap/).
"""

import sys
import os
from pathlib import Path

# Cargar variables del .env
# El .env está en la raíz del repo (sinap/.env), no en api/.env
# Ruta: api/scripts/crear_usuario.py → .parent = api/scripts/ → .parent = api/ → .parent = sinap/
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())
else:
    print(f"Advertencia: no se encontró .env en {env_path}")
    print("Asegurate de tener el archivo sinap/.env con DATABASE_URL configurado.")

import psycopg2
import bcrypt

ROLES_VALIDOS = {"admin", "manager", "directivo", "vinculador", "oferente", "demandante"}

def crear_usuario(email: str, password: str, nombre: str, rol: str):
    if rol not in ROLES_VALIDOS:
        print(f"Error: rol '{rol}' no válido. Opciones: {', '.join(ROLES_VALIDOS)}")
        sys.exit(1)

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL no encontrada en el .env")
        sys.exit(1)

    hash_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    conn = psycopg2.connect(db_url, sslmode="require")
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO usuario (email, password, nombre, rol)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (email) DO UPDATE
            SET password = EXCLUDED.password,
                nombre   = EXCLUDED.nombre,
                rol      = EXCLUDED.rol
        """,
        (email, hash_pw, nombre, rol),
    )
    conn.commit()
    cur.close()
    conn.close()
    print(f"Usuario '{email}' ({rol}) creado/actualizado correctamente.")


if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(__doc__)
        sys.exit(1)

    _, email, password, nombre, rol = sys.argv
    crear_usuario(email, password, nombre, rol)

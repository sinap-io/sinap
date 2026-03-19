"""
Script rapido para verificar la conexion a sinap-production.
Ejecutar desde la raiz del repo:

    python -m api.db.test_connection

Requiere que api/.env tenga DATABASE_URL_PRODUCTION configurada.
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import sqlalchemy
from api.db.connection import engine


async def main():
    print("Conectando a sinap-production (Neon.tech)...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                sqlalchemy.text(
                    """
                    SELECT
                        current_database() AS db,
                        current_user       AS usuario,
                        version()          AS pg_version
                    """
                )
            )
            row = result.mappings().first()
            print("\n[OK] Conexion exitosa")
            print(f"   Base de datos : {row['db']}")
            print(f"   Usuario       : {row['usuario']}")
            print(f"   PostgreSQL    : {row['pg_version'].split(',')[0]}")

            tables_result = await conn.execute(
                sqlalchemy.text(
                    """
                    SELECT tablename
                    FROM pg_tables
                    WHERE schemaname = 'public'
                    ORDER BY tablename
                    """
                )
            )
            tables = [r["tablename"] for r in tables_result.mappings()]

            expected = {"actor", "capacidad", "necesidad", "instrumento", "busqueda", "gap"}
            found = set(tables) & expected
            missing = expected - found

            if tables:
                print(f"\n   Tablas SINAP encontradas : {', '.join(sorted(found)) or 'ninguna aun'}")
            else:
                print("\n   Base vacia -- todavia no se ejecuto schema.sql")

            if missing:
                print(f"   Tablas faltantes         : {', '.join(sorted(missing))}")
                print("\n   -> Ejecuta api/db/schema.sql en el SQL Editor de Neon.")
            else:
                print("\n   -> Schema completo. La API puede arrancar.")

    except Exception as e:
        print(f"\n[ERROR] Conexion fallida: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())

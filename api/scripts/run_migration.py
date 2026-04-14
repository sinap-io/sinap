"""
Script para aplicar una migración SQL a la base de datos de producción (Neon).
Uso: python api/scripts/run_migration.py <ruta_al_archivo_sql>
"""
import asyncio
import sys
from pathlib import Path

import asyncpg
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent.parent.parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")


async def run(sql_file: str):
    sql = Path(sql_file).read_text(encoding="utf-8")

    print(f"Conectando a Neon...")
    conn = await asyncpg.connect(DATABASE_URL)

    print(f"Aplicando migración: {sql_file}")
    print("-" * 60)
    print(sql[:300] + "..." if len(sql) > 300 else sql)
    print("-" * 60)

    try:
        await conn.execute(sql)
        print("\nMigracion aplicada correctamente.")
    except Exception as e:
        print(f"\nError: {e}")
        raise
    finally:
        # Mostrar tablas resultantes
        tables = await conn.fetch(
            "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
        )
        print("\nTablas en la BD:")
        for t in tables:
            print(f"  - {t['tablename']}")
        await conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python api/scripts/run_migration.py <archivo.sql>")
        sys.exit(1)
    asyncio.run(run(sys.argv[1]))

"""
Datos de prueba para sinap-production.
Actores representativos del ecosistema biotech de Córdoba, Argentina.
Ejecutar desde el root del repo: python -m api.db.seed
"""
import asyncio
import asyncpg

DSN = "postgresql://neondb_owner:npg_9mzdCgX7weqn@ep-tiny-cell-acjfdkps.sa-east-1.aws.neon.tech/neondb?sslmode=require"

# ── Actores ───────────────────────────────────────────────────
ACTORES = [
    {
        "nombre": "CEPROCOR",
        "tipo": "investigacion",
        "etapa": "publica",
        "sitio_web": "https://www.ceprocor.gob.ar",
        "descripcion": "Centro de Excelencia en Productos y Procesos de Córdoba. Análisis químicos, microbiológicos y de alimentos.",
        "certificaciones": ["ISO 17025", "ANMAT"],
    },
    {
        "nombre": "CONICET Córdoba",
        "tipo": "investigacion",
        "etapa": "publica",
        "sitio_web": "https://www.conicet.gov.ar",
        "descripcion": "Consejo Nacional de Investigaciones Científicas y Técnicas — institutos radicados en Córdoba.",
        "certificaciones": [],
    },
    {
        "nombre": "Universidad Nacional de Córdoba — FCQ",
        "tipo": "universidad",
        "etapa": "publica",
        "sitio_web": "https://www.fcq.unc.edu.ar",
        "descripcion": "Facultad de Ciencias Químicas. Servicios de análisis, I+D y formación en biotecnología y farmacia.",
        "certificaciones": ["ISO 9001"],
    },
    {
        "nombre": "Bioceres Crop Solutions",
        "tipo": "empresa",
        "etapa": "consolidada",
        "sitio_web": "https://www.bioceres.com.ar",
        "descripcion": "Empresa de biotecnología agrícola. Desarrollo de cultivos tolerantes a estrés y bioinsumos.",
        "certificaciones": ["ISO 9001", "CONABIA"],
    },
    {
        "nombre": "Invap Córdoba",
        "tipo": "empresa",
        "etapa": "consolidada",
        "sitio_web": "https://www.invap.com.ar",
        "descripcion": "Desarrollo de equipamiento médico y tecnología nuclear aplicada a salud.",
        "certificaciones": ["ISO 13485", "ANMAT"],
    },
    {
        "nombre": "BioSidus",
        "tipo": "empresa",
        "etapa": "consolidada",
        "sitio_web": "https://www.biosidus.com.ar",
        "descripcion": "Laboratorio de biotecnología farmacéutica. Producción de proteínas recombinantes y biológicos.",
        "certificaciones": ["ANMAT", "BPM", "ISO 9001"],
    },
    {
        "nombre": "GenoMed",
        "tipo": "startup",
        "etapa": "growth",
        "sitio_web": None,
        "descripcion": "Startup de diagnóstico molecular. Kits de PCR y secuenciación para diagnóstico clínico.",
        "certificaciones": [],
    },
    {
        "nombre": "AgroGen Córdoba",
        "tipo": "startup",
        "etapa": "seed",
        "sitio_web": None,
        "descripcion": "Bioinsumos para agroindustria. Desarrollo de biofertilizantes y biopesticidas.",
        "certificaciones": [],
    },
    {
        "nombre": "LABIN — Laboratorio de Biotecnología Industrial",
        "tipo": "laboratorio",
        "etapa": "consolidada",
        "sitio_web": None,
        "descripcion": "Laboratorio privado de servicios. Análisis microbiológicos, control de calidad y validación de procesos.",
        "certificaciones": ["ISO 17025", "ANMAT", "BPM"],
    },
    {
        "nombre": "PharmaCBA",
        "tipo": "empresa",
        "etapa": "growth",
        "sitio_web": None,
        "descripcion": "Manufactura de medicamentos genéricos y desarrollo de formulaciones farmacéuticas.",
        "certificaciones": ["ANMAT", "BPM"],
    },
]

# ── Capacidades (servicios ofrecidos) ─────────────────────────
# Formato: (nombre_actor, area_tematica, tipo_servicio, descripcion, disponibilidad)
CAPACIDADES = [
    ("CEPROCOR", "alimentos_nutricion", "analisis_quimico",
     "Análisis fisicoquímico de alimentos, bebidas y materias primas según normas AOAC e IRAM.", "disponible"),
    ("CEPROCOR", "alimentos_nutricion", "analisis_microbiologico",
     "Control microbiológico de alimentos: patógenos, indicadores sanitarios, Listeria, Salmonella.", "disponible"),
    ("CEPROCOR", "medicamentos_farma", "control_calidad",
     "Control de calidad de materias primas y productos farmacéuticos según Farmacopea Argentina.", "disponible"),
    ("CEPROCOR", "salud_humana", "analisis_quimico",
     "Análisis toxicológicos y de contaminantes ambientales en matrices biológicas.", "parcial"),

    ("Universidad Nacional de Córdoba — FCQ", "medicamentos_farma", "i_d_aplicada",
     "I+D en síntesis y formulación de principios activos. Acceso a infraestructura analítica de alto nivel.", "disponible"),
    ("Universidad Nacional de Córdoba — FCQ", "salud_humana", "analisis_molecular",
     "Secuenciación, PCR cuantitativa y análisis de expresión génica.", "disponible"),
    ("Universidad Nacional de Córdoba — FCQ", "agroindustria", "consultoria_tecnica",
     "Consultoría en procesos fermentativos y biotransformaciones.", "disponible"),

    ("CONICET Córdoba", "salud_humana", "i_d_aplicada",
     "Investigación aplicada en biología molecular, inmunología y nanomateriales para salud.", "parcial"),
    ("CONICET Córdoba", "agroindustria", "i_d_aplicada",
     "I+D en microbiología del suelo, rizobacterias y bioinsumos.", "disponible"),

    ("Bioceres Crop Solutions", "agroindustria", "i_d_aplicada",
     "Desarrollo de eventos transgénicos y bioinsumos para tolerancia a sequía y salinidad.", "disponible"),
    ("Bioceres Crop Solutions", "agroindustria", "procesamiento_biologico",
     "Producción de inoculantes y biofertilizantes a escala.", "disponible"),

    ("BioSidus", "medicamentos_farma", "manufactura",
     "Manufactura GMP de proteínas recombinantes: eritropoyetina, insulina, interferones.", "disponible"),
    ("BioSidus", "medicamentos_farma", "control_calidad",
     "Control de calidad de biológicos: pureza, potencia, esterilidad según ICH guidelines.", "disponible"),
    ("BioSidus", "salud_humana", "procesamiento_biologico",
     "Producción de anticuerpos monoclonales y proteínas terapéuticas.", "parcial"),

    ("LABIN — Laboratorio de Biotecnología Industrial", "alimentos_nutricion", "analisis_microbiologico",
     "Control microbiológico completo para industria alimentaria. Tiempo de respuesta 48-72hs.", "disponible"),
    ("LABIN — Laboratorio de Biotecnología Industrial", "medicamentos_farma", "control_calidad",
     "Control de calidad in-process y de producto terminado. Validación de métodos analíticos.", "disponible"),
    ("LABIN — Laboratorio de Biotecnología Industrial", "medicamentos_farma", "validacion_procesos",
     "Validación de procesos de limpieza, esterilización y manufactura.", "disponible"),

    ("GenoMed", "salud_humana", "diagnostico_clinico",
     "Diagnóstico molecular por PCR para enfermedades infecciosas y genéticas.", "disponible"),
    ("GenoMed", "salud_humana", "analisis_molecular",
     "Genotipificación y análisis de variantes genéticas.", "disponible"),

    ("PharmaCBA", "medicamentos_farma", "manufactura",
     "Manufactura de sólidos orales, semisólidos y líquidos bajo normas BPM-ANMAT.", "disponible"),

    ("Invap Córdoba", "salud_humana", "metrologia",
     "Calibración y metrología de equipamiento médico. Control de calidad de equipos de diagnóstico.", "disponible"),
]

# ── Necesidades (demanda declarada) ───────────────────────────
# Formato: (nombre_actor, area_tematica, tipo_servicio, descripcion, urgencia)
NECESIDADES = [
    ("GenoMed", "medicamentos_farma", "validacion_procesos",
     "Validación de kits de diagnóstico según normas ANMAT para registro.", "alta"),
    ("GenoMed", "medicamentos_farma", "control_calidad",
     "Control de calidad de reactivos y kits antes de comercialización.", "alta"),

    ("AgroGen Córdoba", "agroindustria", "analisis_microbiologico",
     "Caracterización de cepas microbianas para formulación de bioinsumos.", "normal"),
    ("AgroGen Córdoba", "agroindustria", "analisis_quimico",
     "Análisis de compatibilidad de formulaciones con suelos de la región pampeana.", "normal"),
    ("AgroGen Córdoba", "medicamentos_farma", "consultoria_tecnica",
     "Asesoramiento regulatorio para registro de bioinsumos en SENASA.", "alta"),

    ("Bioceres Crop Solutions", "salud_animal", "analisis_microbiologico",
     "Análisis microbiológicos para ensayos de campo de nuevos eventos transgénicos.", "baja"),
    ("Bioceres Crop Solutions", "agroindustria", "metrologia",
     "Metrología y calibración de equipos de laboratorio para acreditación ISO.", "normal"),

    ("PharmaCBA", "medicamentos_farma", "i_d_aplicada",
     "Desarrollo de nuevas formulaciones de liberación controlada para genéricos.", "alta"),
    ("PharmaCBA", "salud_humana", "analisis_molecular",
     "Estudios de estabilidad molecular para validación de vida útil.", "normal"),

    ("Invap Córdoba", "salud_humana", "procesamiento_biologico",
     "Procesamiento de muestras biológicas para validación de equipos de diagnóstico.", "normal"),

    ("Universidad Nacional de Córdoba — FCQ", "agroindustria", "manufactura",
     "Manufactura piloto de formulaciones fermentadas para escalado a planta.", "baja"),
]

# ── Instrumentos de financiamiento ────────────────────────────
INSTRUMENTOS = [
    {
        "nombre": "FONARSEC — Fondo Argentino Sectorial Biotecnología",
        "tipo": "subsidio",
        "organismo": "MINCyT / ANPCYT",
        "sectores_elegibles": "Biotecnología, salud humana, agroindustria",
        "status": "activo",
        "url": "https://www.agencia.mincyt.gob.ar/fonarsec",
        "monto_maximo": "$ 30.000.000",
        "cobertura_porcentaje": 80.0,
        "plazo_ejecucion": "24-36 meses",
        "contrapartida": "20% aporte propio (puede ser en especie)",
        "gastos_elegibles": "Equipamiento, RRHH, insumos, servicios de terceros",
        "descripcion_extendida": "Financia proyectos de I+D con aplicación en el sector biotecnológico. Requiere asociación con empresa.",
    },
    {
        "nombre": "ANR Biotecnología — ANPCYT",
        "tipo": "subsidio",
        "organismo": "ANPCYT",
        "sectores_elegibles": "Empresas de base tecnológica, startups biotech",
        "status": "activo",
        "url": "https://www.agencia.mincyt.gob.ar/anr",
        "monto_maximo": "$ 8.000.000",
        "cobertura_porcentaje": 100.0,
        "plazo_ejecucion": "12 meses",
        "contrapartida": "Sin contrapartida requerida",
        "gastos_elegibles": "Equipamiento, software, consultorías técnicas",
        "descripcion_extendida": "Aporte No Reembolsable para empresas con proyectos de modernización tecnológica.",
    },
    {
        "nombre": "Crédito BICE — Innovación Productiva",
        "tipo": "credito",
        "organismo": "Banco de Inversión y Comercio Exterior",
        "sectores_elegibles": "Industria farmacéutica, biotecnología, alimentos",
        "status": "activo",
        "url": "https://www.bice.com.ar",
        "monto_maximo": "USD 5.000.000",
        "cobertura_porcentaje": 70.0,
        "plazo_ejecucion": "Hasta 10 años",
        "contrapartida": "30% capital propio",
        "gastos_elegibles": "Planta, equipamiento, capital de trabajo",
        "descripcion_extendida": "Financiamiento blando para proyectos de expansión industrial con foco en exportación.",
    },
    {
        "nombre": "Concurso YPF Tecnología — Agro & Biotech",
        "tipo": "concurso",
        "organismo": "Y-TEC / YPF",
        "sectores_elegibles": "Agroindustria, biotecnología industrial, bioinsumos",
        "status": "proximamente",
        "url": "https://www.ytec.com.ar",
        "monto_maximo": "USD 200.000",
        "cobertura_porcentaje": 100.0,
        "plazo_ejecucion": "18 meses",
        "contrapartida": None,
        "gastos_elegibles": "I+D, prototipado, validación",
        "descripcion_extendida": "Concurso de proyectos de innovación en bioeconomía. Próxima convocatoria Q2 2026.",
    },
    {
        "nombre": "Fondo Córdoba Innovadora",
        "tipo": "subsidio",
        "organismo": "Agencia ProCórdoba / Ministerio de Industria",
        "sectores_elegibles": "PyMEs y startups de Córdoba en sectores estratégicos",
        "status": "activo",
        "url": "https://www.procordoba.org",
        "monto_maximo": "$ 5.000.000",
        "cobertura_porcentaje": 80.0,
        "plazo_ejecucion": "12 meses",
        "contrapartida": "20% aporte propio",
        "gastos_elegibles": "Certificaciones, equipamiento, consultoría, misiones comerciales",
        "descripcion_extendida": "Fondo provincial para empresas cordobesas en etapa de crecimiento e internacionalización.",
    },
]


async def seed():
    print("Conectando a sinap-production...")
    conn = await asyncpg.connect(DSN)

    # Limpiar datos existentes (orden correcto por FK)
    await conn.execute("DELETE FROM necesidad")
    await conn.execute("DELETE FROM capacidad")
    await conn.execute("DELETE FROM instrumento")
    await conn.execute("DELETE FROM actor")
    print("  Tablas limpiadas")

    # Insertar actores y guardar IDs
    actor_ids: dict[str, int] = {}
    for a in ACTORES:
        row = await conn.fetchrow(
            """
            INSERT INTO actor (nombre, tipo, etapa, sitio_web, descripcion, certificaciones)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            """,
            a["nombre"], a["tipo"], a["etapa"],
            a["sitio_web"], a["descripcion"], a["certificaciones"],
        )
        actor_ids[a["nombre"]] = row["id"]
    print(f"  {len(ACTORES)} actores insertados")

    # Insertar capacidades
    for actor_nombre, area, tipo, desc, disp in CAPACIDADES:
        actor_id = actor_ids[actor_nombre]
        await conn.execute(
            """
            INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad)
            VALUES ($1, $2, $3, $4, $5)
            """,
            actor_id, area, tipo, desc, disp,
        )
    print(f"  {len(CAPACIDADES)} servicios insertados")

    # Insertar necesidades
    for actor_nombre, area, tipo, desc, urgencia in NECESIDADES:
        actor_id = actor_ids[actor_nombre]
        await conn.execute(
            """
            INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia)
            VALUES ($1, $2, $3, $4, $5)
            """,
            actor_id, area, tipo, desc, urgencia,
        )
    print(f"  {len(NECESIDADES)} necesidades insertadas")

    # Insertar instrumentos
    for instr in INSTRUMENTOS:
        await conn.execute(
            """
            INSERT INTO instrumento
              (nombre, tipo, organismo, sectores_elegibles, status, url,
               monto_maximo, cobertura_porcentaje, plazo_ejecucion,
               contrapartida, gastos_elegibles, descripcion_extendida)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            """,
            instr["nombre"], instr["tipo"], instr["organismo"],
            instr["sectores_elegibles"], instr["status"], instr["url"],
            instr["monto_maximo"], instr["cobertura_porcentaje"],
            instr["plazo_ejecucion"], instr["contrapartida"],
            instr["gastos_elegibles"], instr["descripcion_extendida"],
        )
    print(f"  {len(INSTRUMENTOS)} instrumentos insertados")

    await conn.close()
    print("\n[OK] Seed completado en sinap-production")


if __name__ == "__main__":
    asyncio.run(seed())

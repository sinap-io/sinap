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
        "descripcion": "Centro de Excelencia en Productos y Procesos de Córdoba. Análisis químicos, microbiológicos y desarrollo de tecnologías en alimentos, medicamentos y medio ambiente.",
        "certificaciones": ["ISO 17025", "ANMAT"],
    },
    {
        "nombre": "CONICET Córdoba",
        "tipo": "investigacion",
        "etapa": "publica",
        "sitio_web": "https://www.conicet.gov.ar",
        "descripcion": "Consejo Nacional de Investigaciones Científicas y Técnicas — institutos radicados en Córdoba: IIBYT, IMMF, CIBICI, INBIAS y más de 15 grupos de investigación en biología molecular, nanomateriales y biomedicina.",
        "certificaciones": [],
    },
    {
        "nombre": "Universidad Nacional de Córdoba — FCQ",
        "tipo": "universidad",
        "etapa": "publica",
        "sitio_web": "https://www.fcq.unc.edu.ar",
        "descripcion": "Facultad de Ciencias Químicas. Servicios analíticos, I+D en farmacia, biotecnología industrial y formación de RRHH especializados.",
        "certificaciones": ["ISO 9001"],
    },
    {
        "nombre": "Bioceres Crop Solutions",
        "tipo": "empresa",
        "etapa": "consolidada",
        "sitio_web": "https://www.bioceres.com.ar",
        "descripcion": "Empresa de biotecnología agrícola. Desarrollo de cultivos tolerantes a estrés hídrico, bioinsumos y servicios de caracterización genómica para el agro.",
        "certificaciones": ["ISO 9001", "CONABIA"],
    },
    {
        "nombre": "Invap Córdoba",
        "tipo": "empresa",
        "etapa": "consolidada",
        "sitio_web": "https://www.invap.com.ar",
        "descripcion": "Desarrollo de equipamiento médico de diagnóstico por imágenes y tecnología nuclear aplicada a salud. Exporta a más de 20 países.",
        "certificaciones": ["ISO 13485", "ANMAT"],
    },
    {
        "nombre": "BioSidus",
        "tipo": "empresa",
        "etapa": "consolidada",
        "sitio_web": "https://www.biosidus.com.ar",
        "descripcion": "Laboratorio de biotecnología farmacéutica. Producción de proteínas recombinantes, biológicos terapéuticos y biosimilares bajo normas GMP internacionales.",
        "certificaciones": ["ANMAT", "BPM", "ISO 9001"],
    },
    {
        "nombre": "GenoMed",
        "tipo": "startup",
        "etapa": "growth",
        "sitio_web": None,
        "descripcion": "Startup de diagnóstico molecular. Desarrolla kits de PCR y plataformas de secuenciación para diagnóstico clínico de enfermedades infecciosas y oncológicas.",
        "certificaciones": [],
    },
    {
        "nombre": "AgroGen Córdoba",
        "tipo": "startup",
        "etapa": "seed",
        "sitio_web": None,
        "descripcion": "Bioinsumos para agroindustria. Desarrollo de biofertilizantes y biopesticidas a base de microorganismos benéficos para cultivos de soja, maíz y trigo.",
        "certificaciones": [],
    },
    {
        "nombre": "LABIN — Laboratorio de Biotecnología Industrial",
        "tipo": "laboratorio",
        "etapa": "consolidada",
        "sitio_web": None,
        "descripcion": "Laboratorio privado de servicios biotecnológicos. Análisis microbiológicos, control de calidad, validación de procesos y consultoría regulatoria para industria farmacéutica y alimentaria.",
        "certificaciones": ["ISO 17025", "ANMAT", "BPM"],
    },
    {
        "nombre": "PharmaCBA",
        "tipo": "empresa",
        "etapa": "growth",
        "sitio_web": None,
        "descripcion": "Manufactura de medicamentos genéricos y desarrollo de nuevas formulaciones farmacéuticas. Especializada en sólidos orales y formas de liberación controlada.",
        "certificaciones": ["ANMAT", "BPM"],
    },
    {
        "nombre": "NanoBio Córdoba",
        "tipo": "startup",
        "etapa": "seed",
        "sitio_web": None,
        "descripcion": "Startup de nanotecnología aplicada a diagnóstico. Desarrolla biosensores electroquímicos para detección rápida de patógenos y biomarcadores en punto de atención.",
        "certificaciones": [],
    },
    {
        "nombre": "MedTech Diagnóstica",
        "tipo": "laboratorio",
        "etapa": "growth",
        "sitio_web": None,
        "descripcion": "Laboratorio especializado en diagnóstico clínico de alta complejidad. Servicios de citogenética, diagnóstico molecular oncológico y validación de dispositivos médicos.",
        "certificaciones": ["ISO 15189", "ANMAT"],
    },
    {
        "nombre": "INTA — EEA Córdoba",
        "tipo": "investigacion",
        "etapa": "publica",
        "sitio_web": "https://www.inta.gob.ar/cordoba",
        "descripcion": "Estación Experimental Agropecuaria Córdoba del INTA. Investigación en biotecnología agrícola, fitopatología, mejoramiento genético y transferencia tecnológica al sector agropecuario.",
        "certificaciones": [],
    },
    {
        "nombre": "BioFarm Córdoba",
        "tipo": "empresa",
        "etapa": "growth",
        "sitio_web": None,
        "descripcion": "Empresa farmacéutica especializada en productos biológicos veterinarios y humanos. Produce vacunas, inmunoestimulantes y diagnósticos serológicos.",
        "certificaciones": ["ANMAT", "SENASA", "BPM"],
    },
    {
        "nombre": "SaludBio",
        "tipo": "startup",
        "etapa": "seed",
        "sitio_web": None,
        "descripcion": "Startup de salud digital y biotecnología. Desarrolla plataformas de monitoreo continuo de glucosa y otros biomarcadores metabólicos para pacientes crónicos.",
        "certificaciones": [],
    },
]

# ── Capacidades ────────────────────────────────────────────────
CAPACIDADES = [
    # CEPROCOR
    ("CEPROCOR", "alimentos_nutricion", "analisis_quimico",
     "Análisis fisicoquímico de alimentos, bebidas y materias primas según normas AOAC e IRAM.", "disponible"),
    ("CEPROCOR", "alimentos_nutricion", "analisis_microbiologico",
     "Control microbiológico de alimentos: patógenos, indicadores sanitarios, Listeria, Salmonella.", "disponible"),
    ("CEPROCOR", "medicamentos_farma", "control_calidad",
     "Control de calidad de materias primas y productos farmacéuticos según Farmacopea Argentina.", "disponible"),
    ("CEPROCOR", "salud_humana", "analisis_quimico",
     "Análisis toxicológicos y de contaminantes ambientales en matrices biológicas.", "parcial"),
    ("CEPROCOR", "salud_humana", "i_d_aplicada",
     "Desarrollo de materiales biosensores y plataformas electroquímicas para detección de analitos.", "disponible"),

    # UNC-FCQ
    ("Universidad Nacional de Córdoba — FCQ", "medicamentos_farma", "i_d_aplicada",
     "I+D en síntesis y formulación de principios activos. Acceso a infraestructura analítica de alto nivel.", "disponible"),
    ("Universidad Nacional de Córdoba — FCQ", "salud_humana", "analisis_molecular",
     "Secuenciación, PCR cuantitativa y análisis de expresión génica.", "disponible"),
    ("Universidad Nacional de Córdoba — FCQ", "agroindustria", "consultoria_tecnica",
     "Consultoría en procesos fermentativos y biotransformaciones.", "disponible"),
    ("Universidad Nacional de Córdoba — FCQ", "medicamentos_farma", "validacion_procesos",
     "Validación de métodos analíticos y procesos de fabricación bajo normas ICH y ANMAT.", "disponible"),

    # CONICET
    ("CONICET Córdoba", "salud_humana", "i_d_aplicada",
     "Investigación aplicada en biología molecular, inmunología y nanomateriales para diagnóstico y terapia.", "parcial"),
    ("CONICET Córdoba", "agroindustria", "i_d_aplicada",
     "I+D en microbiología del suelo, rizobacterias promotoras del crecimiento y bioinsumos.", "disponible"),
    ("CONICET Córdoba", "salud_humana", "analisis_molecular",
     "Caracterización molecular de microorganismos patógenos y resistencia antimicrobiana.", "disponible"),

    # Bioceres
    ("Bioceres Crop Solutions", "agroindustria", "i_d_aplicada",
     "Desarrollo de eventos transgénicos y bioinsumos para tolerancia a sequía y salinidad.", "disponible"),
    ("Bioceres Crop Solutions", "agroindustria", "procesamiento_biologico",
     "Producción de inoculantes y biofertilizantes a escala industrial.", "disponible"),
    ("Bioceres Crop Solutions", "agroindustria", "analisis_molecular",
     "Genotipificación y análisis de eventos transgénicos para caracterización varietal.", "disponible"),

    # BioSidus
    ("BioSidus", "medicamentos_farma", "manufactura",
     "Manufactura GMP de proteínas recombinantes: eritropoyetina, insulina, interferones.", "disponible"),
    ("BioSidus", "medicamentos_farma", "control_calidad",
     "Control de calidad de biológicos: pureza, potencia, esterilidad según ICH guidelines.", "disponible"),
    ("BioSidus", "salud_humana", "procesamiento_biologico",
     "Producción de anticuerpos monoclonales y proteínas terapéuticas a escala piloto.", "parcial"),

    # LABIN
    ("LABIN — Laboratorio de Biotecnología Industrial", "alimentos_nutricion", "analisis_microbiologico",
     "Control microbiológico completo para industria alimentaria. Tiempo de respuesta 48-72hs.", "disponible"),
    ("LABIN — Laboratorio de Biotecnología Industrial", "medicamentos_farma", "control_calidad",
     "Control de calidad in-process y de producto terminado. Validación de métodos analíticos.", "disponible"),
    ("LABIN — Laboratorio de Biotecnología Industrial", "medicamentos_farma", "validacion_procesos",
     "Validación de procesos de limpieza, esterilización y manufactura bajo normas BPM-ANMAT.", "disponible"),

    # GenoMed
    ("GenoMed", "salud_humana", "diagnostico_clinico",
     "Diagnóstico molecular por PCR para enfermedades infecciosas, oncológicas y genéticas.", "disponible"),
    ("GenoMed", "salud_humana", "analisis_molecular",
     "Genotipificación, detección de variantes de resistencia y análisis de expresión.", "disponible"),

    # PharmaCBA
    ("PharmaCBA", "medicamentos_farma", "manufactura",
     "Manufactura de sólidos orales, semisólidos y líquidos bajo normas BPM-ANMAT.", "disponible"),
    ("PharmaCBA", "medicamentos_farma", "control_calidad",
     "Control fisicoquímico y microbiológico de producto terminado y materias primas.", "disponible"),

    # Invap
    ("Invap Córdoba", "salud_humana", "metrologia",
     "Calibración y metrología de equipamiento médico. Control de calidad de equipos de diagnóstico.", "disponible"),
    ("Invap Córdoba", "salud_humana", "i_d_aplicada",
     "Desarrollo de sistemas de diagnóstico por imágenes y dispositivos médicos de alta tecnología.", "disponible"),

    # NanoBio
    ("NanoBio Córdoba", "salud_humana", "i_d_aplicada",
     "Desarrollo de biosensores electroquímicos y ópticos para detección de patógenos y biomarcadores.", "disponible"),
    ("NanoBio Córdoba", "salud_humana", "diagnostico_clinico",
     "Plataformas de diagnóstico point-of-care basadas en nanomateriales para uso en campo.", "parcial"),

    # MedTech
    ("MedTech Diagnóstica", "salud_humana", "diagnostico_clinico",
     "Diagnóstico molecular oncológico, citogenética y secuenciación de nueva generación (NGS).", "disponible"),
    ("MedTech Diagnóstica", "medicamentos_farma", "validacion_procesos",
     "Validación de dispositivos médicos diagnósticos in vitro según normas ISO 13485 y ANMAT.", "disponible"),

    # INTA
    ("INTA — EEA Córdoba", "agroindustria", "i_d_aplicada",
     "Investigación en biotecnología agrícola: mejoramiento genético, bioinsumos y manejo sustentable.", "disponible"),
    ("INTA — EEA Córdoba", "agroindustria", "analisis_microbiologico",
     "Diagnóstico fitosanitario y caracterización de microorganismos del suelo agrícola.", "disponible"),
    ("INTA — EEA Córdoba", "agroindustria", "consultoria_tecnica",
     "Transferencia tecnológica y asistencia técnica al sector agropecuario.", "disponible"),

    # BioFarm
    ("BioFarm Córdoba", "medicamentos_farma", "manufactura",
     "Producción de biológicos veterinarios: vacunas, bacterinas y antisueros bajo normas SENASA.", "disponible"),
    ("BioFarm Córdoba", "salud_humana", "manufactura",
     "Manufactura de reactivos de diagnóstico serológico y kits ELISA.", "disponible"),
]

# ── Necesidades ────────────────────────────────────────────────
NECESIDADES = [
    # GenoMed
    ("GenoMed", "medicamentos_farma", "validacion_procesos",
     "Validación de kits de diagnóstico según normas ANMAT para tramitar registro.", "alta"),
    ("GenoMed", "medicamentos_farma", "control_calidad",
     "Control de calidad de reactivos y kits antes de comercialización en mercado local.", "alta"),
    ("GenoMed", "medicamentos_farma", "manufactura",
     "Manufactura de kits de PCR a escala semi-industrial para abastecer demanda hospitalaria.", "normal"),

    # AgroGen
    ("AgroGen Córdoba", "agroindustria", "analisis_microbiologico",
     "Caracterización de cepas microbianas promotoras del crecimiento para formulación de bioinsumos.", "normal"),
    ("AgroGen Córdoba", "agroindustria", "analisis_quimico",
     "Análisis de compatibilidad de formulaciones con suelos de la región pampeana.", "normal"),
    ("AgroGen Córdoba", "medicamentos_farma", "consultoria_tecnica",
     "Asesoramiento regulatorio para registro de bioinsumos en SENASA.", "alta"),
    ("AgroGen Córdoba", "agroindustria", "i_d_aplicada",
     "Escalado de proceso de producción de biofertilizantes de 10L a 500L.", "normal"),

    # Bioceres
    ("Bioceres Crop Solutions", "agroindustria", "analisis_microbiologico",
     "Análisis microbiológicos para ensayos de campo de nuevos bioinsumos.", "baja"),
    ("Bioceres Crop Solutions", "agroindustria", "metrologia",
     "Metrología y calibración de equipos de laboratorio para acreditación ISO.", "normal"),
    ("Bioceres Crop Solutions", "salud_humana", "analisis_molecular",
     "Análisis de expresión génica en plantas tratadas con nuevos bioinsumos.", "baja"),

    # PharmaCBA
    ("PharmaCBA", "medicamentos_farma", "i_d_aplicada",
     "Desarrollo de nuevas formulaciones de liberación controlada para medicamentos genéricos oncológicos.", "alta"),
    ("PharmaCBA", "salud_humana", "analisis_molecular",
     "Estudios de estabilidad molecular para validación de vida útil de formulaciones.", "normal"),
    ("PharmaCBA", "medicamentos_farma", "validacion_procesos",
     "Validación de nuevo proceso de manufactura de comprimidos de liberación prolongada.", "alta"),

    # Invap
    ("Invap Córdoba", "salud_humana", "procesamiento_biologico",
     "Procesamiento de muestras biológicas para validación de equipos de diagnóstico por imágenes.", "normal"),
    ("Invap Córdoba", "salud_humana", "diagnostico_clinico",
     "Validación clínica de nuevo equipo de gammagrafía en entorno hospitalario real.", "alta"),

    # NanoBio
    ("NanoBio Córdoba", "medicamentos_farma", "validacion_procesos",
     "Validación de biosensor electroquímico para detección de glucosa como dispositivo médico ANMAT.", "critica"),
    ("NanoBio Córdoba", "salud_humana", "analisis_molecular",
     "Caracterización molecular de anticuerpos para funcionalizar superficies de biosensores.", "alta"),
    ("NanoBio Córdoba", "medicamentos_farma", "manufactura",
     "Manufactura de electrodos modificados con nanomateriales en sala limpia.", "normal"),

    # SaludBio
    ("SaludBio", "salud_humana", "i_d_aplicada",
     "I+D en miniaturización de sistema de monitoreo continuo de glucosa para uso en pacientes pediátricos.", "alta"),
    ("SaludBio", "medicamentos_farma", "validacion_procesos",
     "Validación clínica de plataforma de monitoreo de biomarcadores metabólicos.", "alta"),
    ("SaludBio", "salud_humana", "diagnostico_clinico",
     "Estudio de precisión y exactitud de sensor de glucosa intersticial en comparación con glucómetro estándar.", "normal"),

    # MedTech
    ("MedTech Diagnóstica", "medicamentos_farma", "i_d_aplicada",
     "Desarrollo de panel de NGS para detección de mutaciones de resistencia en tuberculosis.", "normal"),
    ("MedTech Diagnóstica", "salud_humana", "procesamiento_biologico",
     "Procesamiento automatizado de muestras para secuenciación masiva de alto throughput.", "normal"),

    # UNC-FCQ
    ("Universidad Nacional de Córdoba — FCQ", "agroindustria", "manufactura",
     "Manufactura piloto de formulaciones fermentadas para escalado a planta productiva.", "baja"),
    ("Universidad Nacional de Córdoba — FCQ", "salud_humana", "metrologia",
     "Equipamiento de metrología avanzada para caracterización de nanomateriales biosensores.", "normal"),
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
    {
        "nombre": "PICT — Proyectos de Investigación Científica y Tecnológica",
        "tipo": "subsidio",
        "organismo": "ANPCYT / MINCyT",
        "sectores_elegibles": "Investigación científica y tecnológica en todas las áreas",
        "status": "activo",
        "url": "https://www.agencia.mincyt.gob.ar/pict",
        "monto_maximo": "$ 12.000.000",
        "cobertura_porcentaje": 100.0,
        "plazo_ejecucion": "36 meses",
        "contrapartida": None,
        "gastos_elegibles": "RRHH, equipamiento, insumos, viajes científicos",
        "descripcion_extendida": "Principal instrumento de financiamiento de investigación de ANPCYT. Requiere investigador responsable con categoría CONICET o equivalente.",
    },
    {
        "nombre": "Horizon Europe — EIC Pathfinder Open",
        "tipo": "subsidio",
        "organismo": "Comisión Europea",
        "sectores_elegibles": "I+D disruptiva en biotecnología, diagnóstico, nanotecnología",
        "status": "proximamente",
        "url": "https://eic.ec.europa.eu",
        "monto_maximo": "EUR 3.000.000",
        "cobertura_porcentaje": 100.0,
        "plazo_ejecucion": "48 meses",
        "contrapartida": None,
        "gastos_elegibles": "Todo gasto de I+D, incluye personal, viajes, subcontratos",
        "descripcion_extendida": "Financiamiento europeo para investigación de frontera. Requiere consorcio internacional. Abierto a organizaciones de América Latina con acuerdo de asociación.",
    },
    {
        "nombre": "BID Lab — Innovación Empresarial",
        "tipo": "subsidio",
        "organismo": "Banco Interamericano de Desarrollo",
        "sectores_elegibles": "Startups y PyMEs innovadoras de América Latina",
        "status": "activo",
        "url": "https://bidlab.org",
        "monto_maximo": "USD 500.000",
        "cobertura_porcentaje": 50.0,
        "plazo_ejecucion": "24 meses",
        "contrapartida": "50% contrapartida privada",
        "gastos_elegibles": "Validación de mercado, escalado tecnológico, internacionalización",
        "descripcion_extendida": "Financiamiento del laboratorio de innovación del BID para startups con impacto social y tecnológico en LatAm.",
    },
]


async def seed():
    print("Conectando a sinap-production...")
    conn = await asyncpg.connect(DSN)

    # Limpiar datos existentes (orden correcto por FK)
    await conn.execute("DELETE FROM hito")
    await conn.execute("DELETE FROM iniciativa_necesidad")
    await conn.execute("DELETE FROM iniciativa_capacidad")
    await conn.execute("DELETE FROM iniciativa_instrumento")
    await conn.execute("DELETE FROM iniciativa_actor")
    await conn.execute("DELETE FROM iniciativa")
    await conn.execute("DELETE FROM necesidad")
    await conn.execute("DELETE FROM capacidad")
    await conn.execute("DELETE FROM instrumento")
    await conn.execute("DELETE FROM actor")
    print("  Tablas limpiadas")

    # Insertar actores
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
        await conn.execute(
            """
            INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad)
            VALUES ($1, $2, $3, $4, $5)
            """,
            actor_ids[actor_nombre], area, tipo, desc, disp,
        )
    print(f"  {len(CAPACIDADES)} servicios insertados")

    # Insertar necesidades
    for actor_nombre, area, tipo, desc, urgencia in NECESIDADES:
        await conn.execute(
            """
            INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia)
            VALUES ($1, $2, $3, $4, $5)
            """,
            actor_ids[actor_nombre], area, tipo, desc, urgencia,
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
    print(f"\n[OK] Seed completado — {len(ACTORES)} actores, {len(CAPACIDADES)} capacidades, {len(NECESIDADES)} necesidades, {len(INSTRUMENTOS)} instrumentos")


if __name__ == "__main__":
    asyncio.run(seed())

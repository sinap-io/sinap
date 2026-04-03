"""
seed_data.py — Carga datos ficticios verosímiles del ecosistema biotech cordobés.

Uso:
    cd sinap
    python api/scripts/seed_data.py

Requiere: DATABASE_URL en sinap/.env
Advertencia: TRUNCA todas las tablas antes de insertar.
"""

import os
import sys
from pathlib import Path
from datetime import date, timedelta

# ── Cargar .env ───────────────────────────────────────────────────────────────
env_path = Path(__file__).parent.parent.parent / ".env"
if not env_path.exists():
    print(f"ERROR: No se encontró .env en {env_path}")
    sys.exit(1)

with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())

import psycopg2
from psycopg2.extras import execute_values

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL no definida en .env")
    sys.exit(1)

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("Conectado a la base de datos.")

# ── TRUNCATE (respetando FK) ──────────────────────────────────────────────────
print("Limpiando tablas...")
# Limpiamos en orden para respetar FKs sin usar CASCADE en actor
# (actor CASCADE borra usuario por el FK actor_id — no queremos eso)
cur.execute("""
    TRUNCATE TABLE
        hito,
        iniciativa_actor,
        iniciativa_necesidad,
        iniciativa_capacidad,
        iniciativa_instrumento,
        iniciativa,
        gap,
        busqueda
    RESTART IDENTITY CASCADE;
""")
# Necesidad y capacidad referencian actor → primero las borramos
cur.execute("DELETE FROM necesidad")
cur.execute("DELETE FROM capacidad")
# Instrumento es independiente
cur.execute("DELETE FROM instrumento")
# Ahora sí podemos borrar actores (usuario.actor_id permite NULL, ponemos en NULL primero)
cur.execute("UPDATE usuario SET actor_id = NULL WHERE actor_id IS NOT NULL")
cur.execute("DELETE FROM actor")
cur.execute("ALTER SEQUENCE actor_id_seq RESTART WITH 1")
cur.execute("ALTER SEQUENCE capacidad_id_seq RESTART WITH 1")
cur.execute("ALTER SEQUENCE necesidad_id_seq RESTART WITH 1")
cur.execute("ALTER SEQUENCE instrumento_id_seq RESTART WITH 1")

# ── ACTORES ───────────────────────────────────────────────────────────────────
print("Insertando actores...")

actores = [
    # (nombre, tipo, etapa, sitio_web, descripcion, certificaciones)
    (
        "CEPROCOR",
        "gobierno",
        "publica",
        "https://ceprocor.cba.gov.ar",
        "Centro de Excelencia en Productos y Procesos de Córdoba. Laboratorio multisectorial del gobierno provincial con capacidades en química analítica, microbiología, biotecnología y producción de biomoléculas.",
        ["ISO 17025", "BPL"],
    ),
    (
        "CONICET Córdoba — IIBYT",
        "investigador",
        "publica",
        "https://www.conicet.gov.ar",
        "Instituto de Investigaciones Biológicas y Tecnológicas. Investigación en biología molecular, genómica, proteómica y bioinformática aplicada a salud y agroindustria.",
        [],
    ),
    (
        "CONICET Córdoba — IMMF",
        "investigador",
        "publica",
        "https://www.conicet.gov.ar",
        "Instituto de Multidisciplina en Matemática y Física. Desarrolla modelos computacionales y bioestadística para procesos biológicos complejos.",
        [],
    ),
    (
        "UNC — Facultad de Ciencias Químicas",
        "universidad",
        "publica",
        "https://fcq.unc.edu.ar",
        "Referente en química orgánica, bioquímica y farmacología. Cuenta con laboratorios de síntesis, análisis instrumental y desarrollo de principios activos.",
        ["ISO 9001"],
    ),
    (
        "UNC — Facultad de Ciencias Agropecuarias",
        "universidad",
        "publica",
        "https://agro.unc.edu.ar",
        "Investigación y transferencia en biotecnología vegetal, mejoramiento genético y manejo integrado de cultivos.",
        [],
    ),
    (
        "UNC — Facultad de Medicina — Virología",
        "universidad",
        "publica",
        "https://medicina.unc.edu.ar",
        "Laboratorio de virología con capacidad de cultivo celular, diagnóstico molecular y desarrollo de candidatos vacunales.",
        ["BPL"],
    ),
    (
        "Biocientífica",
        "empresa",
        "consolidada",
        "https://www.biocientifica.com.ar",
        "Empresa cordobesa especializada en reactivos de diagnóstico in vitro para laboratorios clínicos y bancos de sangre. Exporta a 15 países de América Latina.",
        ["ISO 13485", "ANMAT"],
    ),
    (
        "Zelltek",
        "empresa",
        "consolidada",
        "https://www.zelltek.com.ar",
        "Productora de eritropoyetina recombinante (EPO) y otras proteínas terapéuticas de alta complejidad. Planta de bioproducción GMP.",
        ["GMP", "ANMAT", "FDA"],
    ),
    (
        "Mincor Biotech",
        "startup",
        "growth",
        None,
        "Startup cordobesa que desarrolla biosensores electroquímicos para detección rápida de patógenos en alimentos y agua.",
        [],
    ),
    (
        "Zure",
        "empresa",
        "growth",
        None,
        "Empresa dedicada al desarrollo de probióticos y suplementos nutricionales para humanos y animales, con formulaciones patentadas de microorganismos autóctonos.",
        ["ANMAT"],
    ),
    (
        "Biofeed Tech",
        "startup",
        "seed",
        None,
        "Startup agroindustrial que desarrolla bioinsumos (inoculantes y bioestimulantes) para cultivos extensivos, con base en bacterias promotoras de crecimiento vegetal.",
        [],
    ),
    (
        "Biosynergy",
        "startup",
        "growth",
        None,
        "Startup de bioremedación y tratamiento de efluentes industriales mediante consorcios microbianos especializados.",
        [],
    ),
    (
        "IRAC-Biogen",
        "investigador",
        "publica",
        "https://www.irac.gov.ar",
        "Instituto de Recursos Biológicos del Centro de Investigaciones Agropecuarias (CIAP-INTA). Trabajo en mejoramiento genético animal, semen sexado y transferencia embrionaria bovina.",
        [],
    ),
    (
        "Laboratorio Montpellier — Córdoba",
        "empresa",
        "consolidada",
        "https://www.montpellier.com.ar",
        "Laboratorio farmacéutico con planta de producción en Córdoba. Manufactura de medicamentos genéricos y desarrollo de formas farmacéuticas sólidas.",
        ["BPM", "ANMAT"],
    ),
    (
        "Biotec Sur",
        "empresa",
        "growth",
        None,
        "Empresa de servicios biotecnológicos para la industria agroalimentaria: control de calidad microbiológico, trazabilidad genética y certificación de identidad varietal.",
        ["ISO 17025"],
    ),
    (
        "CertiLab Córdoba",
        "empresa",
        "consolidada",
        None,
        "Laboratorio de certificación acreditado ANMAT. Realiza ensayos fisicoquímicos, microbiológicos y de estabilidad para industria farmacéutica y cosmética.",
        ["ISO 17025", "ANMAT"],
    ),
    (
        "Neurobiotec",
        "startup",
        "seed",
        None,
        "Startup de neurotecnología que desarrolla interfaces cerebro-computadora y biomarcadores digitales para diagnóstico temprano de enfermedades neurológicas.",
        [],
    ),
    (
        "INTI Córdoba",
        "gobierno",
        "publica",
        "https://www.inti.gob.ar",
        "Instituto Nacional de Tecnología Industrial. Servicios de calibración, ensayos de materiales, transferencia tecnológica y apoyo a PyMEs industriales.",
        ["ISO 17025"],
    ),
    (
        "PhytoGen",
        "startup",
        "seed",
        None,
        "Startup de biotecnología vegetal que aplica edición génica (CRISPR) para desarrollar variedades de soja y maíz con mayor tolerancia a estrés hídrico.",
        [],
    ),
    (
        "Inmunovet",
        "empresa",
        "growth",
        None,
        "Empresa de diagnóstico veterinario y producción de vacunas para bovinos. Distribuye en Argentina, Uruguay y Paraguay.",
        ["SENASA"],
    ),
    (
        "Centro REDES — Córdoba",
        "investigador",
        "publica",
        "https://centroredes.org.ar",
        "Centro de análisis de redes de innovación y transferencia tecnológica. Realiza mapeo de ecosistemas productivos y evaluación de políticas de CTI.",
        [],
    ),
    (
        "Tecnoagro Biotech",
        "empresa",
        "growth",
        None,
        "Empresa de agroinsumos que produce y comercializa biofungicidas y bioinsecticidas a base de hongos entomopatógenos para cultivos hortícolas y extensivos.",
        [],
    ),
    (
        "ClinicOmics",
        "startup",
        "seed",
        None,
        "Startup de diagnóstico molecular oncológico. Ofrece perfilado genómico de tumores sólidos para selección de terapia dirigida.",
        [],
    ),
]

cur.executemany(
    """
    INSERT INTO actor (nombre, tipo, etapa, sitio_web, descripcion, certificaciones)
    VALUES (%s, %s, %s, %s, %s, %s)
    """,
    actores,
)

# Obtener IDs por nombre
cur.execute("SELECT id, nombre FROM actor ORDER BY id")
actor_map = {nombre: id_ for id_, nombre in cur.fetchall()}
print(f"  {len(actor_map)} actores insertados.")

# ── CAPACIDADES ───────────────────────────────────────────────────────────────
print("Insertando capacidades...")

capacidades = [
    # CEPROCOR
    ("CEPROCOR", "salud_humana", "analisis_quimico", "Análisis fisicoquímico y microbiológico de productos para salud humana: medicamentos, dispositivos médicos y cosméticos.", "disponible"),
    ("CEPROCOR", "agroindustria", "analisis_quimico", "Control de calidad de alimentos, análisis de residuos de agroquímicos y determinación de contaminantes en matrices agroalimentarias.", "disponible"),
    ("CEPROCOR", "salud_animal", "diagnostico_clinico", "Diagnóstico microbiológico veterinario y análisis de aguas y alimentos para sanidad animal.", "disponible"),
    ("CEPROCOR", "ambiente_agua", "analisis_quimico", "Análisis de calidad de agua, suelos y efluentes según normativa nacional e internacional.", "disponible"),
    # CONICET IIBYT
    ("CONICET Córdoba — IIBYT", "salud_humana", "investigacion_desarrollo", "I+D en genómica funcional, identificación de blancos terapéuticos y desarrollo de candidatos farmacológicos.", "disponible"),
    ("CONICET Córdoba — IIBYT", "agroindustria", "investigacion_desarrollo", "Genómica de plantas y mejoramiento asistido por marcadores moleculares.", "disponible"),
    # CONICET IMMF
    ("CONICET Córdoba — IMMF", "salud_humana", "investigacion_desarrollo", "Modelado matemático y simulación de sistemas biológicos complejos: farmacocinética, redes de señalización celular.", "disponible"),
    # UNC FCQ
    ("UNC — Facultad de Ciencias Químicas", "medicamentos_farma", "investigacion_desarrollo", "Síntesis de nuevos principios activos, formulación farmacéutica y estudios de biodisponibilidad.", "disponible"),
    ("UNC — Facultad de Ciencias Químicas", "salud_humana", "analisis_quimico", "Análisis instrumental avanzado: HPLC, GC-MS, RMN, espectrometría de masas.", "disponible"),
    # UNC FCA
    ("UNC — Facultad de Ciencias Agropecuarias", "agroindustria", "investigacion_desarrollo", "Biotecnología vegetal: transformación genética, cultivo de tejidos y selección asistida por marcadores.", "disponible"),
    ("UNC — Facultad de Ciencias Agropecuarias", "agroindustria", "analisis_quimico", "Análisis de suelos, nutrición vegetal y evaluación de bioinsumos agrícolas.", "disponible"),
    # UNC Medicina
    ("UNC — Facultad de Medicina — Virología", "salud_humana", "investigacion_desarrollo", "Desarrollo y caracterización de candidatos vacunales, cultivo celular y virología experimental.", "disponible"),
    ("UNC — Facultad de Medicina — Virología", "salud_humana", "diagnostico_clinico", "Diagnóstico molecular de virus respiratorios, arbovirus y virus emergentes (PCR, secuenciación).", "disponible"),
    # Biocientífica
    ("Biocientífica", "salud_humana", "fabricacion_manufactura", "Fabricación de reactivos de diagnóstico in vitro: ELISA, inmunoturbidimetría, aglutinación. Registro ANMAT.", "disponible"),
    ("Biocientífica", "salud_humana", "diagnostico_clinico", "Desarrollo y validación de kits de diagnóstico para laboratorio clínico y banco de sangre.", "disponible"),
    # Zelltek
    ("Zelltek", "medicamentos_farma", "fabricacion_manufactura", "Producción GMP de biofármacos recombinantes (proteínas terapéuticas, anticuerpos monoclonales) en biorreactores de gran escala.", "disponible"),
    ("Zelltek", "medicamentos_farma", "investigacion_desarrollo", "Desarrollo de procesos de fermentación y purificación de biomoléculas. Escalado desde laboratorio a planta piloto.", "disponible"),
    # Mincor Biotech
    ("Mincor Biotech", "ambiente_agua", "fabricacion_manufactura", "Fabricación de prototipos de biosensores electroquímicos para detección de patógenos en alimentos y agua.", "disponible"),
    ("Mincor Biotech", "salud_humana", "investigacion_desarrollo", "I+D en biosensores point-of-care para diagnóstico rápido en entornos de bajos recursos.", "disponible"),
    # Zure
    ("Zure", "salud_humana", "fabricacion_manufactura", "Formulación y manufactura de probióticos para humanos con cepas autóctonas caracterizadas.", "disponible"),
    ("Zure", "salud_animal", "fabricacion_manufactura", "Probióticos y aditivos nutricionales para ganadería y aves de corral.", "disponible"),
    # Biofeed Tech
    ("Biofeed Tech", "agroindustria", "fabricacion_manufactura", "Producción de inoculantes y bioestimulantes para soja, maíz y trigo con formulación líquida y sólida.", "disponible"),
    # Biosynergy
    ("Biosynergy", "ambiente_agua", "investigacion_desarrollo", "Desarrollo de consorcios microbianos especializados en degradación de hidrocarburos y metales pesados.", "disponible"),
    ("Biosynergy", "ambiente_agua", "diagnostico_clinico", "Evaluación ecotoxicológica y monitoreo microbiológico de efluentes industriales.", "disponible"),
    # IRAC-Biogen
    ("IRAC-Biogen", "salud_animal", "investigacion_desarrollo", "Mejoramiento genético bovino: semen sexado, transferencia embrionaria y selección genómica.", "disponible"),
    # Montpellier
    ("Laboratorio Montpellier — Córdoba", "medicamentos_farma", "fabricacion_manufactura", "Manufactura BPM de medicamentos sólidos orales (comprimidos, cápsulas) genéricos con habilitación ANMAT.", "disponible"),
    # Biotec Sur
    ("Biotec Sur", "agroindustria", "diagnostico_clinico", "Control de calidad microbiológico, identidad varietal por marcadores moleculares y trazabilidad en cadena agroalimentaria.", "disponible"),
    # CertiLab
    ("CertiLab Córdoba", "medicamentos_farma", "analisis_quimico", "Ensayos de estabilidad, fisicoquímicos y microbiológicos de medicamentos según farmacopea argentina y europea.", "disponible"),
    ("CertiLab Córdoba", "salud_humana", "analisis_quimico", "Certificación de cosméticos y dispositivos médicos con protocolos ANMAT.", "disponible"),
    # Neurobiotec
    ("Neurobiotec", "salud_humana", "investigacion_desarrollo", "Desarrollo de algoritmos de IA para análisis de señales EEG y detección de biomarcadores digitales neurológicos.", "disponible"),
    # INTI
    ("INTI Córdoba", "agroindustria", "analisis_quimico", "Calibración, ensayos de materiales y transferencia tecnológica para PyMEs. Servicio acreditado ISO 17025.", "disponible"),
    # PhytoGen
    ("PhytoGen", "agroindustria", "investigacion_desarrollo", "Edición génica CRISPR en soja y maíz para tolerancia a sequía y eficiencia en el uso del nitrógeno.", "disponible"),
    # Inmunovet
    ("Inmunovet", "salud_animal", "fabricacion_manufactura", "Producción de vacunas para bovinos (clostridiosis, aftosa, IBR) con habilitación SENASA.", "disponible"),
    ("Inmunovet", "salud_animal", "diagnostico_clinico", "Diagnóstico serológico veterinario: ELISA, neutralización viral, pruebas de campo.", "disponible"),
    # Tecnoagro
    ("Tecnoagro Biotech", "agroindustria", "fabricacion_manufactura", "Producción y formulación de biofungicidas (Trichoderma spp.) y bioinsecticidas (Beauveria bassiana) para agricultura.", "disponible"),
    # ClinicOmics
    ("ClinicOmics", "salud_humana", "diagnostico_clinico", "Secuenciación genómica tumoral (panel NGS de 500 genes) para oncología de precisión. Informe bioinformático clínico.", "disponible"),
]

cap_rows = [
    (actor_map[a], area, tipo, desc, disp)
    for a, area, tipo, desc, disp in capacidades
    if a in actor_map
]

execute_values(
    cur,
    """
    INSERT INTO capacidad (actor_id, area_tematica, tipo_servicio, descripcion, disponibilidad)
    VALUES %s
    """,
    cap_rows,
)
print(f"  {len(cap_rows)} capacidades insertadas.")

# ── NECESIDADES ───────────────────────────────────────────────────────────────
print("Insertando necesidades...")

necesidades = [
    # (actor, area, tipo_servicio, descripcion, urgencia)
    ("Mincor Biotech", "medicamentos_farma", "fabricacion_manufactura", "Necesita acceso a planta piloto para escalar producción de biosensores desde prototipo a lote de validación.", "alta"),
    ("Mincor Biotech", "salud_humana", "investigacion_desarrollo", "Busca partners clínicos para estudios de validación analítica de sus biosensores en muestras reales.", "alta"),
    ("PhytoGen", "agroindustria", "analisis_quimico", "Requiere ensayos de campo y análisis agronómico para validar variedades editadas en condiciones locales.", "alta"),
    ("PhytoGen", "agroindustria", "investigacion_desarrollo", "Busca acceso a infraestructura de invernadero e inoculación controlada para pruebas de estrés hídrico.", "normal"),
    ("Biofeed Tech", "agroindustria", "analisis_quimico", "Necesita análisis de efectividad agronómica de inoculantes en ensayos de campo comparativos.", "normal"),
    ("Biofeed Tech", "medicamentos_farma", "fabricacion_manufactura", "Requiere escalado de producción fermentativa: acceso a biorreactores de 50-200 L.", "alta"),
    ("Biosynergy", "ambiente_agua", "analisis_quimico", "Necesita caracterización avanzada de consorcios microbianos por metagenómica (16S rRNA + shotgun).", "normal"),
    ("Neurobiotec", "salud_humana", "diagnostico_clinico", "Busca acceso a cohortes de pacientes con EEG para entrenar y validar modelos de detección de epilepsia.", "alta"),
    ("Neurobiotec", "medicamentos_farma", "investigacion_desarrollo", "Requiere regulatorio y consultoría para registrar dispositivo médico de clase II ante ANMAT.", "alta"),
    ("ClinicOmics", "salud_humana", "fabricacion_manufactura", "Necesita capacidad de secuenciación NGS escalable: actualmente terceriza y busca traer in-house.", "alta"),
    ("ClinicOmics", "medicamentos_farma", "investigacion_desarrollo", "Busca convenio con hospital oncológico para acceso a muestras tumorales y validación clínica.", "normal"),
    ("Zure", "agroindustria", "investigacion_desarrollo", "Busca cepas microbianas autóctonas con potencial probiótico aisladas en ecosistemas cordobeses.", "normal"),
    ("Inmunovet", "salud_animal", "investigacion_desarrollo", "Necesita I+D en formulación de adyuvantes para mejorar respuesta inmune de sus vacunas bovinas.", "normal"),
    ("Tecnoagro Biotech", "agroindustria", "analisis_quimico", "Requiere ensayos de eficacia biológica y residualidad en campo para registro SENASA de nuevos bioinsecticidas.", "alta"),
    ("Laboratorio Montpellier — Córdoba", "salud_humana", "investigacion_desarrollo", "Busca partners para co-desarrollo de formas de liberación modificada (liposomas, nanopartículas).", "baja"),
    ("Centro REDES — Córdoba", "agroindustria", "investigacion_desarrollo", "Necesita datos de colaboración y transferencia entre actores del clúster para análisis de redes de innovación.", "baja"),
    ("IRAC-Biogen", "salud_animal", "fabricacion_manufactura", "Necesita acceso a laboratorio de biología molecular para genotipado de gran escala (SNP arrays).", "normal"),
]

nec_rows = [
    (actor_map[a], area, tipo, desc, urg)
    for a, area, tipo, desc, urg in necesidades
    if a in actor_map
]

execute_values(
    cur,
    """
    INSERT INTO necesidad (actor_id, area_tematica, tipo_servicio, descripcion, urgencia)
    VALUES %s
    """,
    nec_rows,
)
print(f"  {len(nec_rows)} necesidades insertadas.")

# ── INSTRUMENTOS DE FINANCIAMIENTO ────────────────────────────────────────────
print("Insertando instrumentos...")

instrumentos = [
    # Provinciales
    {
        "nombre": "FONDER — Fondo de Desarrollo Regional",
        "tipo": "subsidio",
        "organismo": "Ministerio de Ciencia y Tecnología de Córdoba",
        "sectores_elegibles": "Empresas y organismos de CTI con sede en Córdoba. Sectores priorizados: biotecnología, software, agroindustria.",
        "status": "activo",
        "url": "https://mincyt.cba.gov.ar",
        "monto_maximo": "ARS 5.000.000",
        "cobertura_porcentaje": 80.0,
        "plazo_ejecucion": "12 meses",
        "contrapartida": "20% en especie o efectivo",
        "gastos_elegibles": "Equipamiento, insumos, RRHH técnico, servicios de terceros",
        "descripcion_extendida": "Instrumento provincial para financiar proyectos de innovación con impacto económico regional. Requiere radicación en Córdoba y contrapartida del beneficiario.",
    },
    {
        "nombre": "PRICIT — Programa de Incentivos a la CTI",
        "tipo": "subsidio",
        "organismo": "Ministerio de Ciencia y Tecnología de Córdoba",
        "sectores_elegibles": "Grupos de investigación y empresas en asociación público-privada. Biotecnología, TIC, energía.",
        "status": "activo",
        "url": "https://mincyt.cba.gov.ar",
        "monto_maximo": "ARS 8.000.000",
        "cobertura_porcentaje": 70.0,
        "plazo_ejecucion": "18 meses",
        "contrapartida": "30% empresa privada",
        "gastos_elegibles": "I+D, prototipos, patentes, capacitación",
        "descripcion_extendida": "Fondos para proyectos colaborativos entre sector público y privado. Requiere al menos un investigador del CONICET o universidades nacionales radicado en Córdoba.",
    },
    {
        "nombre": "Crédito BICE PyME Innovación",
        "tipo": "credito",
        "organismo": "Banco de Inversión y Comercio Exterior (BICE)",
        "sectores_elegibles": "PyMEs con al menos 2 años de antigüedad. Todos los sectores de base tecnológica.",
        "status": "activo",
        "url": "https://www.bice.com.ar",
        "monto_maximo": "USD 500.000",
        "cobertura_porcentaje": 100.0,
        "plazo_ejecucion": "hasta 5 años",
        "contrapartida": None,
        "gastos_elegibles": "Capital de trabajo, equipamiento, certificaciones, internacionalización",
        "descripcion_extendida": "Línea de crédito blando con tasa subsidiada para PyMEs innovadoras. Tasas en pesos o dólares. Acceso vía bancos comerciales adheridos.",
    },
    {
        "nombre": "Fondo Córdoba Emprende",
        "tipo": "capital",
        "organismo": "Agencia ProCórdoba / Gobierno de Córdoba",
        "sectores_elegibles": "Startups y spin-offs de base tecnológica en etapa temprana radicadas en Córdoba.",
        "status": "proximamente",
        "url": "https://procordoba.org",
        "monto_maximo": "USD 100.000",
        "cobertura_porcentaje": None,
        "plazo_ejecucion": "3 años",
        "contrapartida": "Equity participativo",
        "gastos_elegibles": "Desarrollo de producto, validación de mercado, primeras ventas",
        "descripcion_extendida": "Fondo de capital semilla provincial para startups deep tech. Toma participación accionaria minoritaria (5-15%). Convocatoria prevista para Q3 2026.",
    },
    # Nacionales
    {
        "nombre": "FONARSEC — Fondo Argentino Sectorial",
        "tipo": "subsidio",
        "organismo": "Agencia I+D+i (ex MINCYT Nacional)",
        "sectores_elegibles": "Proyectos de alto impacto en biotecnología, salud, agroindustria, energía y TIC. Consorcio empresa-investigación requerido.",
        "status": "activo",
        "url": "https://agencia.mincyt.gob.ar",
        "monto_maximo": "USD 1.000.000",
        "cobertura_porcentaje": 75.0,
        "plazo_ejecucion": "24-36 meses",
        "contrapartida": "25% empresa beneficiaria",
        "gastos_elegibles": "I+D, equipamiento, RRHH científico, ensayos clínicos/campo, patentes",
        "descripcion_extendida": "Principal instrumento nacional para proyectos de innovación de alto impacto. Requiere consorcio con al menos una empresa y un organismo de CTI. Evaluación por pares internacionales.",
    },
    {
        "nombre": "ANR — Aporte No Reembolsable (Agencia I+D+i)",
        "tipo": "subsidio",
        "organismo": "Agencia I+D+i",
        "sectores_elegibles": "PyMEs argentinas de todos los sectores. Convocatorias específicas para biotech y agroindustria.",
        "status": "activo",
        "url": "https://agencia.mincyt.gob.ar/anr",
        "monto_maximo": "ARS 15.000.000",
        "cobertura_porcentaje": 80.0,
        "plazo_ejecucion": "12 meses",
        "contrapartida": "20% empresa",
        "gastos_elegibles": "Equipamiento, insumos, servicios tecnológicos, certificaciones",
        "descripcion_extendida": "Subsidio directo para modernización tecnológica de PyMEs. Convocatorias permanentes con ventanas de apertura trimestrales. Alta tasa de aprobación si el proyecto está bien formulado.",
    },
    {
        "nombre": "PICT — Proyectos de Investigación Científica y Tecnológica",
        "tipo": "subsidio",
        "organismo": "Agencia I+D+i / CONICET",
        "sectores_elegibles": "Grupos de investigación radicados en universidades nacionales o institutos CONICET.",
        "status": "activo",
        "url": "https://agencia.mincyt.gob.ar/pict",
        "monto_maximo": "ARS 20.000.000",
        "cobertura_porcentaje": 100.0,
        "plazo_ejecucion": "24-36 meses",
        "contrapartida": None,
        "gastos_elegibles": "Becas, equipamiento, insumos, viajes científicos, publicaciones",
        "descripcion_extendida": "Instrumento central de financiamiento a la investigación básica y aplicada en Argentina. Evaluación por pares CONICET. Modalidades: PICT Estándar, PICT Startup, PICT Industria.",
    },
    {
        "nombre": "Programa Sello Verde — INTI",
        "tipo": "concurso",
        "organismo": "Instituto Nacional de Tecnología Industrial (INTI)",
        "sectores_elegibles": "Empresas que desarrollan soluciones biotecnológicas con impacto ambiental positivo: bioremedación, bioinsumos, economía circular.",
        "status": "activo",
        "url": "https://www.inti.gob.ar",
        "monto_maximo": "ARS 5.000.000",
        "cobertura_porcentaje": 100.0,
        "plazo_ejecucion": "12 meses",
        "contrapartida": None,
        "gastos_elegibles": "Ensayos, certificaciones, escalado tecnológico",
        "descripcion_extendida": "Concurso anual INTI para soluciones de bioeconomía circular. Incluye mentoring técnico y acceso preferencial a laboratorios INTI durante el proyecto.",
    },
    # Internacionales
    {
        "nombre": "EUREKA — Red Europea de I+D Industrial",
        "tipo": "subsidio",
        "organismo": "EUREKA Network / Agencia I+D+i (Argentina participante)",
        "sectores_elegibles": "Proyectos de I+D colaborativos entre empresas de países EUREKA. Biotecnología, salud, agroindustria.",
        "status": "activo",
        "url": "https://www.eurekanetwork.org",
        "monto_maximo": "EUR 500.000 (por socio)",
        "cobertura_porcentaje": 50.0,
        "plazo_ejecucion": "24-36 meses",
        "contrapartida": "50% empresa, co-financiado por cada país socio",
        "gastos_elegibles": "I+D colaborativo, prototipos, propiedad intelectual",
        "descripcion_extendida": "Red de innovación que facilita colaboración entre empresas de Argentina y Europa. Requiere socio europeo. Argentina accede vía convenio bilateral. Ideal para empresas exportadoras o con proyección internacional.",
    },
    {
        "nombre": "BID — Laboratorios de Innovación (FOMIN)",
        "tipo": "subsidio",
        "organismo": "Banco Interamericano de Desarrollo (BID/FOMIN)",
        "sectores_elegibles": "Ecosistemas de innovación, aceleradoras, clústeres y programas de triple hélice en América Latina.",
        "status": "activo",
        "url": "https://www.iadb.org",
        "monto_maximo": "USD 300.000",
        "cobertura_porcentaje": 50.0,
        "plazo_ejecucion": "18-24 meses",
        "contrapartida": "50% institución ejecutora",
        "gastos_elegibles": "Fortalecimiento institucional, capacitación, sistematización de experiencias",
        "descripcion_extendida": "Financiamiento para organizaciones intermediarias que fortalecen ecosistemas de innovación. Aplicable al Clúster de Biotecnología como organización ejecutora.",
    },
    {
        "nombre": "CAF — Fondo de Capital Emprendedor Biotech LAC",
        "tipo": "capital",
        "organismo": "Banco de Desarrollo de América Latina (CAF)",
        "sectores_elegibles": "Startups de biotecnología, healthtech y agritech en América Latina con potencial de escala regional.",
        "status": "proximamente",
        "url": "https://www.caf.com",
        "monto_maximo": "USD 2.000.000",
        "cobertura_porcentaje": None,
        "plazo_ejecucion": "5 años",
        "contrapartida": "Equity 10-25%",
        "gastos_elegibles": "Crecimiento empresarial, expansión regional, desarrollo de producto",
        "descripcion_extendida": "Fondo de capital de riesgo CAF para startups biotech latinoamericanas. Toma posición accionaria minoritaria con opciones de salida. Próxima convocatoria prevista para Q4 2026.",
    },
    {
        "nombre": "Global Innovation Fund (GIF)",
        "tipo": "concurso",
        "organismo": "Global Innovation Fund (GIF) — organismo multilateral",
        "sectores_elegibles": "Innovaciones sociales y de salud pública con impacto en poblaciones vulnerables. Diagnóstico, agua segura, nutrición.",
        "status": "activo",
        "url": "https://www.globalinnovation.fund",
        "monto_maximo": "USD 250.000",
        "cobertura_porcentaje": 100.0,
        "plazo_ejecucion": "12-18 meses",
        "contrapartida": None,
        "gastos_elegibles": "Pilotos, evidencia de impacto, escalado de innovaciones probadas",
        "descripcion_extendida": "Convocatoria global para innovaciones que resuelven problemas de desarrollo. Relevante para biosensores de diagnóstico accesible, tratamiento de agua y nutrición funcional.",
    },
]

ins_rows = []
for inst in instrumentos:
    ins_rows.append((
        inst["nombre"], inst["tipo"], inst["organismo"],
        inst.get("sectores_elegibles"), inst["status"], inst.get("url"),
        inst.get("monto_maximo"), inst.get("cobertura_porcentaje"),
        inst.get("plazo_ejecucion"), inst.get("contrapartida"),
        inst.get("gastos_elegibles"), inst.get("descripcion_extendida"),
    ))

execute_values(
    cur,
    """
    INSERT INTO instrumento
        (nombre, tipo, organismo, sectores_elegibles, status, url,
         monto_maximo, cobertura_porcentaje, plazo_ejecucion, contrapartida,
         gastos_elegibles, descripcion_extendida)
    VALUES %s
    """,
    ins_rows,
)
print(f"  {len(ins_rows)} instrumentos insertados.")

# ── VINCULADOR (requerido por FK en iniciativa) ───────────────────────────────
print("Insertando vinculador base...")
cur.execute("""
    INSERT INTO vinculador (nombre, email, activo)
    VALUES ('Pablo Díaz Azulay', 'pdiazazulay@gmail.com', true)
    ON CONFLICT (email) DO NOTHING
""")

cur.execute("SELECT id FROM vinculador WHERE email = 'pdiazazulay@gmail.com'")
row = cur.fetchone()
vinculador_id = row[0] if row else None

# ── INICIATIVAS CON HITOS ─────────────────────────────────────────────────────
print("Insertando iniciativas y hitos...")

hoy = date.today()

# Obtener IDs de capacidades y necesidades para linkar
cur.execute("SELECT id, actor_id, tipo_servicio FROM capacidad")
caps = cur.fetchall()  # (id, actor_id, tipo_servicio)

cur.execute("SELECT id, actor_id, tipo_servicio FROM necesidad")
necs = cur.fetchall()

def cap_de(nombre_actor, tipo):
    aid = actor_map.get(nombre_actor)
    for id_, actor_id, ts in caps:
        if actor_id == aid and ts == tipo:
            return id_
    return None

def nec_de(nombre_actor, tipo):
    aid = actor_map.get(nombre_actor)
    for id_, actor_id, ts in necs:
        if actor_id == aid and ts == tipo:
            return id_
    return None

cur.execute("SELECT id FROM instrumento WHERE nombre ILIKE '%ANR%'")
row = cur.fetchone()
anr_id = row[0] if row else None

cur.execute("SELECT id FROM instrumento WHERE nombre ILIKE '%FONARSEC%'")
row = cur.fetchone()
fonarsec_id = row[0] if row else None

cur.execute("SELECT id FROM instrumento WHERE nombre ILIKE '%PICT%'")
row = cur.fetchone()
pict_id = row[0] if row else None

# ── Iniciativa 1: Biosensor para calidad de agua ──────────────────────────────
cur.execute("""
    INSERT INTO iniciativa (tipo, titulo, descripcion, estado, vinculador_id, notas)
    VALUES (%s,%s,%s,%s,%s,%s) RETURNING id
""", (
    "vinculacion",
    "Biosensor de bajo costo para monitoreo de coliformes en agua de consumo",
    "Mincor Biotech busca socio clínico-ambiental para validar su biosensor electroquímico en muestras reales de agua potable de Córdoba. CEPROCOR puede proveer infraestructura analítica y acceso a muestras certificadas.",
    "en_curso",
    vinculador_id,
    "Alta prioridad — impacto en salud pública. Financiamiento posible vía GIF o Sello Verde INTI.",
))
ini1_id = cur.fetchone()[0]

# Actores
execute_values(cur, "INSERT INTO iniciativa_actor (iniciativa_id, actor_id, rol) VALUES %s", [
    (ini1_id, actor_map["Mincor Biotech"], "lider"),
    (ini1_id, actor_map["CEPROCOR"], "oferente"),
])

# Capacidad y necesidad
cap_id = cap_de("CEPROCOR", "analisis_quimico")
nec_id = nec_de("Mincor Biotech", "investigacion_desarrollo")
if cap_id:
    execute_values(cur, "INSERT INTO iniciativa_capacidad (iniciativa_id, capacidad_id) VALUES %s", [(ini1_id, cap_id)])
if nec_id:
    execute_values(cur, "INSERT INTO iniciativa_necesidad (iniciativa_id, necesidad_id) VALUES %s", [(ini1_id, nec_id)])

# Instrumento GIF
cur.execute("SELECT id FROM instrumento WHERE nombre ILIKE '%Global Innovation%'")
row = cur.fetchone()
if row:
    execute_values(cur, "INSERT INTO iniciativa_instrumento (iniciativa_id, instrumento_id) VALUES %s", [(ini1_id, row[0])])

# Hitos
execute_values(cur, """
    INSERT INTO hito (iniciativa_id, tipo, descripcion, fecha)
    VALUES %s
""", [
    (ini1_id, "contacto_establecido", "Primer contacto entre Mincor Biotech y CEPROCOR en evento del Clúster. Se identificó complementariedad técnica.", hoy - timedelta(days=45)),
    (ini1_id, "reunion_realizada", "Reunión técnica en CEPROCOR: presentación del biosensor y evaluación de metodología de validación. Acuerdo de confidencialidad firmado.", hoy - timedelta(days=28)),
    (ini1_id, "acuerdo_alcanzado", "Protocolo de validación acordado: 100 muestras de agua de red y 50 de pozos. Inicio previsto para la semana próxima.", hoy - timedelta(days=7)),
])

# ── Iniciativa 2: Escalar bioinsumo para soja ─────────────────────────────────
cur.execute("""
    INSERT INTO iniciativa (tipo, titulo, descripcion, estado, vinculador_id, notas)
    VALUES (%s,%s,%s,%s,%s,%s) RETURNING id
""", (
    "consorcio",
    "Escalar producción de inoculante para soja: Biofeed Tech + Zelltek",
    "Biofeed Tech desarrolló un inoculante con Bradyrhizobium sp. autóctono de alta eficiencia pero no puede escalarlo más allá de 50L. Zelltek tiene biorreactores de gran escala disponibles en horario valle.",
    "en_curso",
    vinculador_id,
    "Modelo de co-manufactura con contrato de licencia. ANR podría cubrir los costos de escalado.",
))
ini2_id = cur.fetchone()[0]

execute_values(cur, "INSERT INTO iniciativa_actor (iniciativa_id, actor_id, rol) VALUES %s", [
    (ini2_id, actor_map["Biofeed Tech"], "lider"),
    (ini2_id, actor_map["Zelltek"], "oferente"),
    (ini2_id, actor_map["UNC — Facultad de Ciencias Agropecuarias"], "miembro"),
])

nec_id = nec_de("Biofeed Tech", "fabricacion_manufactura")
cap_id = cap_de("Zelltek", "fabricacion_manufactura")
if cap_id:
    execute_values(cur, "INSERT INTO iniciativa_capacidad (iniciativa_id, capacidad_id) VALUES %s", [(ini2_id, cap_id)])
if nec_id:
    execute_values(cur, "INSERT INTO iniciativa_necesidad (iniciativa_id, necesidad_id) VALUES %s", [(ini2_id, nec_id)])
if anr_id:
    execute_values(cur, "INSERT INTO iniciativa_instrumento (iniciativa_id, instrumento_id) VALUES %s", [(ini2_id, anr_id)])

execute_values(cur, """
    INSERT INTO hito (iniciativa_id, tipo, descripcion, fecha)
    VALUES %s
""", [
    (ini2_id, "contacto_establecido", "Clúster facilita la conexión en mesa sectorial de agroindustria.", hoy - timedelta(days=60)),
    (ini2_id, "reunion_realizada", "Visita técnica a planta Zelltek. Confirmada compatibilidad de proceso fermentativo.", hoy - timedelta(days=35)),
])

# ── Iniciativa 3: Diagnóstico oncológico con hospital ─────────────────────────
cur.execute("""
    INSERT INTO iniciativa (tipo, titulo, descripcion, estado, vinculador_id, notas)
    VALUES (%s,%s,%s,%s,%s,%s) RETURNING id
""", (
    "oportunidad",
    "Panel NGS para oncología de precisión: ClinicOmics + red hospitalaria",
    "ClinicOmics tiene panel NGS de 500 genes validado analíticamente. Necesita acceso a muestras tumorales y validación clínica en hospital oncológico de Córdoba para completar proceso de habilitación ANMAT.",
    "abierta",
    vinculador_id,
    "Potencial de alto impacto clínico. Requiere acuerdo con Hospital Rawson o Hospital Italiano.",
))
ini3_id = cur.fetchone()[0]

execute_values(cur, "INSERT INTO iniciativa_actor (iniciativa_id, actor_id, rol) VALUES %s", [
    (ini3_id, actor_map["ClinicOmics"], "lider"),
    (ini3_id, actor_map["UNC — Facultad de Medicina — Virología"], "candidato"),
])

nec_id = nec_de("ClinicOmics", "investigacion_desarrollo")
if nec_id:
    execute_values(cur, "INSERT INTO iniciativa_necesidad (iniciativa_id, necesidad_id) VALUES %s", [(ini3_id, nec_id)])
if fonarsec_id:
    execute_values(cur, "INSERT INTO iniciativa_instrumento (iniciativa_id, instrumento_id) VALUES %s", [(ini3_id, fonarsec_id)])

execute_values(cur, """
    INSERT INTO hito (iniciativa_id, tipo, descripcion, fecha)
    VALUES %s
""", [
    (ini3_id, "contacto_establecido", "ClinicOmics presentó propuesta al Clúster. Se identificaron 2 hospitales candidatos.", hoy - timedelta(days=15)),
])

# ── Iniciativa 4: Mejoramiento genético bovino ────────────────────────────────
cur.execute("""
    INSERT INTO iniciativa (tipo, titulo, descripcion, estado, notas)
    VALUES (%s,%s,%s,%s,%s) RETURNING id
""", (
    "vinculacion",
    "Plataforma de genotipado bovino IRAC-Biogen + CONICET IIBYT",
    "IRAC-Biogen necesita capacidad de genotipado masivo (SNP arrays + bioinformática) que supera su infraestructura actual. CONICET IIBYT tiene capacidad de secuenciación y análisis genómico disponible.",
    "concretada",
    "Convenio firmado en diciembre 2025. Activo desde enero 2026. Modelo de referencia para colaboración público-público.",
))
ini4_id = cur.fetchone()[0]

execute_values(cur, "INSERT INTO iniciativa_actor (iniciativa_id, actor_id, rol) VALUES %s", [
    (ini4_id, actor_map["IRAC-Biogen"], "demandante"),
    (ini4_id, actor_map["CONICET Córdoba — IIBYT"], "oferente"),
])

cap_id = cap_de("CONICET Córdoba — IIBYT", "investigacion_desarrollo")
nec_id = nec_de("IRAC-Biogen", "fabricacion_manufactura")
if cap_id:
    execute_values(cur, "INSERT INTO iniciativa_capacidad (iniciativa_id, capacidad_id) VALUES %s", [(ini4_id, cap_id)])
if nec_id:
    execute_values(cur, "INSERT INTO iniciativa_necesidad (iniciativa_id, necesidad_id) VALUES %s", [(ini4_id, nec_id)])
if pict_id:
    execute_values(cur, "INSERT INTO iniciativa_instrumento (iniciativa_id, instrumento_id) VALUES %s", [(ini4_id, pict_id)])

execute_values(cur, """
    INSERT INTO hito (iniciativa_id, tipo, descripcion, fecha)
    VALUES %s
""", [
    (ini4_id, "contacto_establecido", "Presentación en jornada INTA-CONICET. Clúster facilitó la conexión.", hoy - timedelta(days=120)),
    (ini4_id, "reunion_realizada", "Reunión técnica en IIBYT: relevamiento de necesidades de genotipado (1.500 muestras/año).", hoy - timedelta(days=100)),
    (ini4_id, "acuerdo_alcanzado", "Acuerdo de precio y protocolo de envío de muestras definido.", hoy - timedelta(days=85)),
    (ini4_id, "convenio_firmado", "Convenio marco UNC-INTA firmado. IIBYT acepta muestras de IRAC-Biogen a tarifa de costo.", hoy - timedelta(days=65)),
    (ini4_id, "proyecto_iniciado", "Primer lote de 200 muestras procesado exitosamente. Informe de resultados entregado.", hoy - timedelta(days=20)),
])

conn.commit()
print("\nSeed completado.")

# ── Resumen final ─────────────────────────────────────────────────────────────
cur.execute("SELECT COUNT(*) FROM actor")
print(f"  Actores:      {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM capacidad")
print(f"  Capacidades:  {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM necesidad")
print(f"  Necesidades:  {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM instrumento")
print(f"  Instrumentos: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM iniciativa")
print(f"  Iniciativas:  {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM hito")
print(f"  Hitos:        {cur.fetchone()[0]}")

cur.close()
conn.close()

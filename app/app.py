import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# ── Conexión a la base de datos ──────────────────────────────
@st.cache_resource
def get_engine():
    return create_engine(
        os.getenv("DATABASE_URL"),
        pool_pre_ping=True,
        pool_recycle=300
    )

def run_query(sql, params=None):
    engine = get_engine()
    with engine.connect() as conn:
        return pd.read_sql_query(text(sql), conn, params=params)

# ── Diccionarios de etiquetas ────────────────────────────────
TIPO_BADGE = {
    "laboratorio":  "🟢 Laboratorio",
    "empresa":      "🔵 Empresa",
    "startup":      "🟣 Startup",
    "universidad":  "🟡 Universidad",
    "investigacion":"🟠 Investigación",
}

AREA_LABEL = {
    "salud_humana":        "Salud humana",
    "medicamentos_farma":  "Medicamentos y farmacia",
    "alimentos_nutricion": "Alimentos y nutrición",
    "ambiente":            "Medio ambiente",
    "agroindustria":       "Agroindustria",
    "salud_animal":        "Salud animal",
    "otro":                "Otro",
}

SERVICIO_LABEL = {
    "diagnostico_clinico":     "Diagnóstico clínico",
    "analisis_quimico":        "Análisis químico",
    "analisis_molecular":      "Análisis molecular",
    "analisis_microbiologico": "Análisis microbiológico",
    "control_calidad":         "Control de calidad",
    "validacion_procesos":     "Validación de procesos",
    "manufactura":             "Manufactura",
    "i_d_aplicada":            "I+D aplicada",
    "metrologia":              "Metrología",
    "consultoria_tecnica":     "Consultoría técnica",
    "procesamiento_biologico": "Procesamiento biológico",
    "otro":                    "Otro",
}

TIPO_LABEL = {
    "laboratorio":  "Laboratorio",
    "empresa":      "Empresa",
    "startup":      "Startup",
    "universidad":  "Universidad",
    "investigacion":"Investigación",
}

def badge(tipo):
    return TIPO_BADGE.get(tipo, f"⚪ {tipo.capitalize()}")

# ── Configuración de la app ──────────────────────────────────
st.set_page_config(
    page_title="Plataforma Biotech de Córdoba",
    page_icon="🔬",
    layout="wide"
)

st.title("🔬 Plataforma Biotech de Córdoba")
st.caption("Red de intermediación del ecosistema biotech · Impulsada por el Clúster de Biotecnología de Córdoba")
st.divider()

# ── Navegación ───────────────────────────────────────────────
pagina = st.sidebar.radio(
    "Navegación",
    ["Red de actores", "Servicios", "Necesidades", "Financiamiento", "Buscar (IA)"]
)

# ── Página: Red de actores ───────────────────────────────────
if pagina == "Red de actores":
    st.header("Red de actores")

    df = run_query("""
        SELECT
            a.id,
            a.nombre,
            a.tipo,
            a.subtipo,
            COUNT(DISTINCT c.id) AS capacidades,
            COUNT(DISTINCT n.id) AS necesidades,
            a.website
        FROM actor a
        LEFT JOIN capacidad c ON c.actor_id = a.id
        LEFT JOIN necesidad n ON n.actor_id = a.id
        GROUP BY a.id, a.nombre, a.tipo, a.subtipo, a.website
        ORDER BY a.tipo, a.nombre
    """)

    col1, col2, col3 = st.columns(3)
    col1.metric("Actores en la red", len(df))
    col2.metric("Capacidades registradas", df["capacidades"].sum())
    col3.metric("Necesidades activas", df["necesidades"].sum())

    st.divider()

    # Aplicar labels antes de construir filtros
    df["tipo_label"] = df["tipo"].map(TIPO_LABEL).fillna(df["tipo"])

    col1, col2 = st.columns(2)
    busqueda = col1.text_input("🔍 Buscar por nombre", placeholder="Ej: CEPROCOR, Lamarx...")
    tipos = ["Todos"] + sorted(df["tipo_label"].unique().tolist())
    tipo_sel = col2.selectbox("Filtrar por tipo", tipos)

    df_filtrado = df.copy()
    if busqueda:
        df_filtrado = df_filtrado[df_filtrado["nombre"].str.contains(busqueda, case=False)]
    if tipo_sel != "Todos":
        df_filtrado = df_filtrado[df_filtrado["tipo_label"] == tipo_sel]

    df_filtrado["tipo"] = df_filtrado["tipo"].apply(badge)
    df_filtrado = df_filtrado.drop(columns=["id", "tipo_label"])

    st.dataframe(df_filtrado, use_container_width=True, hide_index=True)

# ── Página: Servicios ────────────────────────────────────────
elif pagina == "Servicios":
    st.header("Servicios del ecosistema")

    df = run_query("""
        SELECT
            a.nombre AS actor,
            a.tipo AS tipo_actor,
            c.area_tematica,
            c.tipo_servicio,
            c.descripcion,
            c.disponibilidad
        FROM capacidad c
        JOIN actor a ON a.id = c.actor_id
        ORDER BY a.nombre, c.area_tematica
    """)

    # Aplicar labels antes de construir filtros
    df["area_tematica"] = df["area_tematica"].map(AREA_LABEL).fillna(df["area_tematica"])
    df["tipo_servicio"] = df["tipo_servicio"].map(SERVICIO_LABEL).fillna(df["tipo_servicio"])

    col1, col2, col3 = st.columns(3)
    busqueda = col1.text_input("🔍 Buscar", placeholder="Ej: microbiológico, validación...")
    areas = ["Todas"] + sorted(df["area_tematica"].unique().tolist())
    tipos = ["Todos"] + sorted(df["tipo_servicio"].unique().tolist())
    area_sel = col2.selectbox("Área temática", areas)
    tipo_sel = col3.selectbox("Tipo de servicio", tipos)

    if busqueda:
        df = df[
            df["descripcion"].str.contains(busqueda, case=False, na=False) |
            df["actor"].str.contains(busqueda, case=False, na=False)
        ]
    if area_sel != "Todas":
        df = df[df["area_tematica"] == area_sel]
    if tipo_sel != "Todos":
        df = df[df["tipo_servicio"] == tipo_sel]

    df["tipo_actor"] = df["tipo_actor"].apply(badge)
    st.dataframe(df, use_container_width=True, hide_index=True)

# ── Página: Necesidades ──────────────────────────────────────
elif pagina == "Necesidades":
    st.header("Necesidades activas")

    df = run_query("""
        SELECT
            a.nombre AS actor,
            a.tipo AS tipo_actor,
            n.area_tematica,
            n.tipo_servicio,
            n.descripcion,
            n.urgencia,
            n.status
        FROM necesidad n
        JOIN actor a ON a.id = n.actor_id
        ORDER BY
            CASE n.urgencia
                WHEN 'critica' THEN 1
                WHEN 'alta'    THEN 2
                WHEN 'normal'  THEN 3
                WHEN 'baja'    THEN 4
            END,
            a.nombre
    """)

    # Aplicar labels antes de construir filtros
    df["area_tematica"] = df["area_tematica"].map(AREA_LABEL).fillna(df["area_tematica"])
    df["tipo_servicio"] = df["tipo_servicio"].map(SERVICIO_LABEL).fillna(df["tipo_servicio"])

    col1, col2 = st.columns(2)
    busqueda = col1.text_input("🔍 Buscar", placeholder="Ej: diagnóstico, validación...")
    urgencias = ["Todas"] + sorted(df["urgencia"].unique().tolist())
    urgencia_sel = col2.selectbox("Urgencia", urgencias)

    if busqueda:
        df = df[
            df["descripcion"].str.contains(busqueda, case=False, na=False) |
            df["actor"].str.contains(busqueda, case=False, na=False)
        ]
    if urgencia_sel != "Todas":
        df = df[df["urgencia"] == urgencia_sel]

    df["tipo_actor"] = df["tipo_actor"].apply(badge)
    st.dataframe(df, use_container_width=True, hide_index=True)

# ── Página: Financiamiento ───────────────────────────────────
elif pagina == "Financiamiento":
    st.header("Instrumentos de financiamiento")
    st.write("Fondos, subsidios y créditos disponibles para actores del ecosistema biotech.")

    df = run_query("""
        SELECT nombre, tipo, organismo, sectores_elegibles, status, url
        FROM instrumento
        ORDER BY tipo, nombre
    """)

    TIPO_INSTRUMENTO = {
        "subsidio": "Subsidio",
        "credito":  "Crédito",
        "capital":  "Capital",
        "concurso": "Concurso",
    }
    df["tipo"] = df["tipo"].map(TIPO_INSTRUMENTO).fillna(df["tipo"])
    df["url"] = df["url"].fillna("—")

    col1, col2 = st.columns(2)
    busqueda = col1.text_input("🔍 Buscar", placeholder="Ej: FONARSEC, biotecnología...")
    tipos = ["Todos"] + sorted(df["tipo"].unique().tolist())
    tipo_sel = col2.selectbox("Tipo", tipos)

    if busqueda:
        df = df[
            df["nombre"].str.contains(busqueda, case=False, na=False) |
            df["organismo"].str.contains(busqueda, case=False, na=False) |
            df["sectores_elegibles"].str.contains(busqueda, case=False, na=False)
        ]
    if tipo_sel != "Todos":
        df = df[df["tipo"] == tipo_sel]

    st.dataframe(df, use_container_width=True, hide_index=True)
# ── Página: Buscar con IA ────────────────────────────────────
elif pagina == "Buscar (IA)":
    st.header("Buscar capacidades con IA")
    st.write("Describí lo que necesitás en lenguaje libre y el sistema encontrará capacidades relevantes en la plataforma.")

    consulta = st.text_area(
        "¿Qué necesitás?",
        placeholder="Ej: necesito validar la estabilidad de un compuesto biológico a distintas temperaturas",
        height=100
    )

    if st.button("Buscar", type="primary"):
        if consulta:
            with st.spinner("Buscando en la plataforma..."):
                df_caps = run_query("""
                    SELECT
                        a.nombre AS actor,
                        a.website,
                        c.area_tematica,
                        c.tipo_servicio,
                        c.descripcion,
                        c.disponibilidad
                    FROM capacidad c
                    JOIN actor a ON a.id = c.actor_id
                    WHERE c.disponibilidad != 'no_disponible'
                """)

                caps_texto = df_caps.to_string(index=False)

                from anthropic import Anthropic
                client = Anthropic()

                respuesta = client.messages.create(
                    model="claude-opus-4-5",
                    max_tokens=1000,
                    messages=[{
                        "role": "user",
                        "content": f"""Sos un asistente del ecosistema biotech de Córdoba, Argentina.
Un actor del ecosistema tiene esta necesidad:
"{consulta}"

Estas son las capacidades disponibles en la plataforma:
{caps_texto}

Identificá las 3 capacidades más relevantes para esa necesidad y explicá brevemente por qué cada una es útil.
Respondé en español, de forma concisa y directa."""
                    }]
                )

                st.success("Resultados encontrados")
                st.write(respuesta.content[0].text)
        else:
            st.warning("Escribí tu consulta antes de buscar.")
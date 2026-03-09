import streamlit as st
import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# ── Conexión a la base de datos ──────────────────────────────
def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def run_query(sql, params=None):
    conn = get_connection()
    df = pd.read_sql_query(sql, conn, params=params)
    conn.close()
    return df

# ── Configuración de la app ──────────────────────────────────
st.set_page_config(
    page_title="Sinap",
    page_icon="🔬",
    layout="wide"
)

st.title("🔬 Plataforma Biotech de Córdoba")
st.caption("Red de intermediación del ecosistema biotech · Impulsada por el Clúster de Biotecnología de Córdoba")
st.divider()

# ── Navegación ───────────────────────────────────────────────
pagina = st.sidebar.radio(
    "Navegación",
    ["Red de actores", "Capacidades", "Necesidades", "Buscar (IA)"]
)

# ── Página: Red de actores ───────────────────────────────────
if pagina == "Red de actores":
    st.header("Red de actores")

    df = run_query("""
        SELECT
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
        ORDER BY a.nombre
    """)

    col1, col2, col3 = st.columns(3)
    col1.metric("Actores en la red", len(df))
    col2.metric("Capacidades registradas", df["capacidades"].sum())
    col3.metric("Necesidades activas", df["necesidades"].sum())

    st.divider()
    st.dataframe(df, use_container_width=True, hide_index=True)

# ── Página: Capacidades ──────────────────────────────────────
elif pagina == "Capacidades":
    st.header("Capacidades del ecosistema")

    df = run_query("""
        SELECT
            a.nombre AS actor,
            c.area_tematica,
            c.tipo_servicio,
            c.descripcion,
            c.disponibilidad
        FROM capacidad c
        JOIN actor a ON a.id = c.actor_id
        ORDER BY a.nombre, c.area_tematica
    """)

    # Filtros
    col1, col2 = st.columns(2)
    areas = ["Todas"] + sorted(df["area_tematica"].unique().tolist())
    tipos = ["Todos"] + sorted(df["tipo_servicio"].unique().tolist())

    area_sel = col1.selectbox("Área temática", areas)
    tipo_sel = col2.selectbox("Tipo de servicio", tipos)

    if area_sel != "Todas":
        df = df[df["area_tematica"] == area_sel]
    if tipo_sel != "Todos":
        df = df[df["tipo_servicio"] == tipo_sel]

    st.dataframe(df, use_container_width=True, hide_index=True)

# ── Página: Necesidades ──────────────────────────────────────
elif pagina == "Necesidades":
    st.header("Necesidades activas")

    df = run_query("""
        SELECT
            a.nombre AS actor,
            n.area_tematica,
            n.tipo_servicio,
            n.descripcion,
            n.urgencia,
            n.status
        FROM necesidad n
        JOIN actor a ON a.id = n.actor_id
        ORDER BY n.urgencia DESC, a.nombre
    """)

    st.dataframe(df, use_container_width=True, hide_index=True)

# ── Página: Buscar con IA ────────────────────────────────────
elif pagina == "Buscar (IA)":
    st.header("Buscar capacidades con IA")
    st.write("Describí lo que necesitás en lenguaje libre y el sistema encontrará capacidades relevantes en la red.")

    consulta = st.text_area(
        "¿Qué necesitás?",
        placeholder="Ej: necesito validar la estabilidad de un compuesto biológico a distintas temperaturas",
        height=100
    )

    if st.button("Buscar", type="primary"):
        if consulta:
            with st.spinner("Buscando en la red..."):
                # Cargamos todas las capacidades para pasarlas a la IA
                df_caps = run_query("""
                    SELECT
                        a.nombre AS actor,
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

Estas son las capacidades disponibles en la red:
{caps_texto}

Identificá las 3 capacidades más relevantes para esa necesidad y explicá brevemente por qué cada una es útil.
Respondé en español, de forma concisa y directa."""
                    }]
                )

                st.success("Resultados encontrados")
                st.write(respuesta.content[0].text)
        else:
            st.warning("Escribí tu consulta antes de buscar.")


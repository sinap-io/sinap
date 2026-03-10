import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

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

def safe_str(val):
    return str(val) if pd.notna(val) and str(val) not in ("None", "") else ""

def ir_a(pagina):
    st.session_state["destino"] = pagina

PAGINAS = ["Inicio", "Red de actores", "Servicios", "Necesidades", "Financiamiento", "Buscar (IA)"]

TIPO_BADGE = {
    "laboratorio":   "🟢 Laboratorio",
    "empresa":       "🔵 Empresa",
    "startup":       "🟣 Startup",
    "universidad":   "🟡 Universidad",
    "investigacion": "🟠 Investigación",
}
TIPO_LABEL = {
    "laboratorio":   "Laboratorio",
    "empresa":       "Empresa",
    "startup":       "Startup",
    "universidad":   "Universidad",
    "investigacion": "Investigación",
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
TIPO_INSTRUMENTO = {
    "subsidio": "Subsidio",
    "credito":  "Crédito",
    "capital":  "Capital",
    "concurso": "Concurso",
}
COLOR_TIPO = {
    "laboratorio":   "#2ecc71",
    "empresa":       "#3498db",
    "startup":       "#9b59b6",
    "universidad":   "#f1c40f",
    "investigacion": "#e67e22",
}
COLOR_URGENCIA = {
    "critica": "#e74c3c",
    "alta":    "#e67e22",
    "normal":  "#3498db",
    "baja":    "#888888",
}

def badge(tipo):
    return TIPO_BADGE.get(tipo, f"⚪ {tipo.capitalize()}")

st.set_page_config(page_title="Plataforma Biotech de Córdoba", page_icon="🔬", layout="wide")

st.markdown("""
<style>
.actor-card {
    background: #1e1e2e; border: 1px solid #333;
    border-radius: 12px; padding: 20px; margin-bottom: 16px;
}
.actor-name { font-size: 1.1rem; font-weight: 700; color: #ffffff; margin-bottom: 6px; }
.actor-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-bottom: 10px; }
.actor-meta { font-size: 0.85rem; color: #aaa; margin-bottom: 4px; }
.actor-link { color: #aad4e8; font-size: 0.8rem; display: block; margin-bottom: 8px; }
.actor-stats { display: flex; gap: 16px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #333; }
.stat-item { text-align: center; }
.stat-number { font-size: 1.3rem; font-weight: 700; color: #fff; }
.stat-label { font-size: 0.7rem; color: #888; text-transform: uppercase; }
.result-card { background: #1a1a2e; border: 1px solid #2a2a3e; border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; border-left: 4px solid #3498db; }
.result-title { font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 4px; }
.result-meta { font-size: 0.8rem; color: #888; margin-bottom: 8px; }
.result-desc { font-size: 0.9rem; color: #ccc; margin-bottom: 10px; }
.result-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; }
.hero-box { background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); border-radius: 16px; padding: 48px 40px; margin-bottom: 32px; text-align: center; }
.hero-title { font-size: 2rem; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
.hero-subtitle { font-size: 1.1rem; color: #aad4e8; margin-bottom: 24px; }
.hero-stats { display: flex; justify-content: center; gap: 48px; margin-top: 32px; }
.hero-stat-number { font-size: 2.5rem; font-weight: 800; color: #ffffff; }
.hero-stat-label { font-size: 0.85rem; color: #aad4e8; text-transform: uppercase; letter-spacing: 1px; }
</style>
""", unsafe_allow_html=True)

# ── Navegación con session_state ─────────────────────────────
if "destino" not in st.session_state:
    st.session_state["destino"] = "Inicio"

idx = PAGINAS.index(st.session_state["destino"]) if st.session_state["destino"] in PAGINAS else 0
pagina = st.sidebar.radio("Navegación", PAGINAS, index=idx)
st.session_state["destino"] = pagina

st.sidebar.divider()
st.sidebar.caption("Impulsado por el Clúster de Biotecnología de Córdoba")

# ── Inicio ───────────────────────────────────────────────────
if pagina == "Inicio":
    stats = run_query("""
        SELECT
            (SELECT COUNT(*) FROM actor) AS actores,
            (SELECT COUNT(*) FROM capacidad) AS servicios,
            (SELECT COUNT(*) FROM necesidad WHERE status = 'activa') AS necesidades,
            (SELECT COUNT(*) FROM instrumento WHERE status = 'activo') AS instrumentos
    """).iloc[0]

    st.markdown(f"""
    <div class="hero-box">
        <div class="hero-title">🔬 Plataforma Biotech de Córdoba</div>
        <div class="hero-subtitle">
            Conectamos laboratorios, empresas, universidades e instituciones del ecosistema biotech.<br>
            Encontrá servicios, identificá oportunidades y accedé a financiamiento — todo en un lugar.
        </div>
        <div class="hero-stats">
            <div><div class="hero-stat-number">{int(stats['actores'])}</div><div class="hero-stat-label">Actores</div></div>
            <div><div class="hero-stat-number">{int(stats['servicios'])}</div><div class="hero-stat-label">Servicios</div></div>
            <div><div class="hero-stat-number">{int(stats['necesidades'])}</div><div class="hero-stat-label">Necesidades activas</div></div>
            <div><div class="hero-stat-number">{int(stats['instrumentos'])}</div><div class="hero-stat-label">Fondos disponibles</div></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.subheader("¿Qué podés hacer aquí?")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.info("**🏢 Explorar la red**\n\nConocé los actores del ecosistema — labs, empresas, universidades e instituciones de investigación.")
        if st.button("Ver red de actores →", key="btn_red", use_container_width=True):
            st.session_state["destino"] = "Red de actores"
            st.rerun()
    with col2:
        st.success("**🔍 Buscar con IA**\n\nDescribí lo que necesitás en lenguaje libre y la IA encontrará los servicios más relevantes.")
        if st.button("Buscar con IA →", key="btn_ia", use_container_width=True):
            st.session_state["destino"] = "Buscar (IA)"
            st.rerun()
    with col3:
        st.warning("**💰 Acceder a financiamiento**\n\nExplorá subsidios, créditos y fondos disponibles para proyectos de innovación biotech.")
        if st.button("Ver financiamiento →", key="btn_fin", use_container_width=True):
            st.session_state["destino"] = "Financiamiento"
            st.rerun()

# ── Red de actores ───────────────────────────────────────────
elif pagina == "Red de actores":
    st.header("Red de actores")

    df = run_query("""
        SELECT a.id, a.nombre, a.tipo, a.subtipo, a.mercado, a.website,
               COUNT(DISTINCT c.id) AS servicios,
               COUNT(DISTINCT n.id) AS necesidades
        FROM actor a
        LEFT JOIN capacidad c ON c.actor_id = a.id
        LEFT JOIN necesidad n ON n.actor_id = a.id
        GROUP BY a.id, a.nombre, a.tipo, a.subtipo, a.mercado, a.website
        ORDER BY a.tipo, a.nombre
    """)

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

    st.divider()
    cols = st.columns(2)
    for i, (_, row) in enumerate(df_filtrado.iterrows()):
        color = COLOR_TIPO.get(row["tipo"], "#888")
        tipo_text = TIPO_LABEL.get(row["tipo"], row["tipo"])
        mercado = safe_str(row["mercado"])
        website = safe_str(row["website"])
        mercado_part = f'<div class="actor-meta">🏭 {mercado}</div>' if mercado else ''
        website_part = f'<a class="actor-link" href="{website}" target="_blank">🔗 {website}</a>' if website else ''
        card = (
            f'<div class="actor-card">'
            f'<div class="actor-name">{row["nombre"]}</div>'
            f'<span class="actor-badge" style="background:{color}22;color:{color};border:1px solid {color}44;">{tipo_text}</span>'
            f'{mercado_part}{website_part}'
            f'<div class="actor-stats">'
            f'<div class="stat-item"><div class="stat-number">{int(row["servicios"])}</div><div class="stat-label">Servicios</div></div>'
            f'<div class="stat-item"><div class="stat-number">{int(row["necesidades"])}</div><div class="stat-label">Necesidades</div></div>'
            f'</div></div>'
        )
        cols[i % 2].markdown(card, unsafe_allow_html=True)

# ── Servicios ────────────────────────────────────────────────
elif pagina == "Servicios":
    st.header("Servicios del ecosistema")

    df = run_query("""
        SELECT a.nombre AS actor, a.tipo AS tipo_actor,
               c.area_tematica, c.tipo_servicio, c.descripcion, c.disponibilidad
        FROM capacidad c JOIN actor a ON a.id = c.actor_id
        ORDER BY a.nombre, c.area_tematica
    """)

    df["area_label"] = df["area_tematica"].map(AREA_LABEL).fillna(df["area_tematica"])
    df["servicio_label"] = df["tipo_servicio"].map(SERVICIO_LABEL).fillna(df["tipo_servicio"])

    col1, col2, col3 = st.columns(3)
    busqueda = col1.text_input("🔍 Buscar", placeholder="Ej: microbiológico, validación...")
    areas = ["Todas"] + sorted(df["area_label"].unique().tolist())
    tipos = ["Todos"] + sorted(df["servicio_label"].unique().tolist())
    area_sel = col2.selectbox("Área temática", areas)
    tipo_sel = col3.selectbox("Tipo de servicio", tipos)

    if busqueda:
        df = df[df["descripcion"].str.contains(busqueda, case=False, na=False) |
                df["actor"].str.contains(busqueda, case=False, na=False)]
    if area_sel != "Todas":
        df = df[df["area_label"] == area_sel]
    if tipo_sel != "Todos":
        df = df[df["servicio_label"] == tipo_sel]

    st.caption(f"{len(df)} resultado(s) encontrado(s)")
    st.divider()

    for _, row in df.iterrows():
        color = COLOR_TIPO.get(row["tipo_actor"], "#888")
        tipo_text = TIPO_LABEL.get(row["tipo_actor"], row["tipo_actor"])
        disp_color = "#2ecc71" if row["disponibilidad"] == "disponible" else "#e67e22" if row["disponibilidad"] == "parcial" else "#e74c3c"
        desc = safe_str(row["descripcion"])
        card = (
            f'<div class="result-card" style="border-left-color:{color};">'
            f'<div class="result-title">{row["servicio_label"]}</div>'
            f'<div class="result-meta">{row["actor"]}</div>'
            f'<div class="result-desc">{desc}</div>'
            f'<div class="result-tags">'
            f'<span class="tag" style="background:{color}22;color:{color};border:1px solid {color}44;">{tipo_text}</span>'
            f'<span class="tag" style="background:#ffffff11;color:#aaa;border:1px solid #333;">{row["area_label"]}</span>'
            f'<span class="tag" style="background:{disp_color}22;color:{disp_color};border:1px solid {disp_color}44;">{row["disponibilidad"].capitalize()}</span>'
            f'</div></div>'
        )
        st.markdown(card, unsafe_allow_html=True)

# ── Necesidades ──────────────────────────────────────────────
elif pagina == "Necesidades":
    st.header("Necesidades activas")

    df = run_query("""
        SELECT a.nombre AS actor, a.tipo AS tipo_actor,
               n.area_tematica, n.tipo_servicio, n.descripcion, n.urgencia, n.status
        FROM necesidad n JOIN actor a ON a.id = n.actor_id
        ORDER BY CASE n.urgencia
            WHEN 'critica' THEN 1 WHEN 'alta' THEN 2
            WHEN 'normal'  THEN 3 WHEN 'baja'  THEN 4 END, a.nombre
    """)

    df["area_label"] = df["area_tematica"].map(AREA_LABEL).fillna(df["area_tematica"])
    df["servicio_label"] = df["tipo_servicio"].map(SERVICIO_LABEL).fillna(df["tipo_servicio"])

    col1, col2 = st.columns(2)
    busqueda = col1.text_input("🔍 Buscar", placeholder="Ej: diagnóstico, validación...")
    urgencia_sel = col2.selectbox("Urgencia", ["Todas", "alta", "normal", "baja"])

    if busqueda:
        df = df[df["descripcion"].str.contains(busqueda, case=False, na=False) |
                df["actor"].str.contains(busqueda, case=False, na=False)]
    if urgencia_sel != "Todas":
        df = df[df["urgencia"] == urgencia_sel]

    st.caption(f"{len(df)} resultado(s) encontrado(s)")
    st.divider()

    for _, row in df.iterrows():
        color_actor = COLOR_TIPO.get(row["tipo_actor"], "#888")
        tipo_text = TIPO_LABEL.get(row["tipo_actor"], row["tipo_actor"])
        urg_color = COLOR_URGENCIA.get(row["urgencia"], "#888")
        desc = safe_str(row["descripcion"])
        card = (
            f'<div class="result-card" style="border-left-color:{urg_color};">'
            f'<div class="result-title">{row["servicio_label"]}</div>'
            f'<div class="result-meta">{row["actor"]}</div>'
            f'<div class="result-desc">{desc}</div>'
            f'<div class="result-tags">'
            f'<span class="tag" style="background:{color_actor}22;color:{color_actor};border:1px solid {color_actor}44;">{tipo_text}</span>'
            f'<span class="tag" style="background:#ffffff11;color:#aaa;border:1px solid #333;">{row["area_label"]}</span>'
            f'<span class="tag" style="background:{urg_color}22;color:{urg_color};border:1px solid {urg_color}44;">Urgencia: {row["urgencia"].capitalize()}</span>'
            f'</div></div>'
        )
        st.markdown(card, unsafe_allow_html=True)

# ── Financiamiento ───────────────────────────────────────────
elif pagina == "Financiamiento":
    st.header("Instrumentos de financiamiento")
    st.write("Fondos, subsidios y créditos disponibles para actores del ecosistema biotech.")

    df = run_query("SELECT nombre, tipo, organismo, sectores_elegibles, status, url FROM instrumento ORDER BY tipo, nombre")
    df["tipo_label"] = df["tipo"].map(TIPO_INSTRUMENTO).fillna(df["tipo"])
    df["url"] = df["url"].fillna("")

    col1, col2 = st.columns(2)
    busqueda = col1.text_input("🔍 Buscar", placeholder="Ej: FONARSEC, biotecnología...")
    tipos = ["Todos"] + sorted(df["tipo_label"].unique().tolist())
    tipo_sel = col2.selectbox("Tipo", tipos)

    if busqueda:
        df = df[df["nombre"].str.contains(busqueda, case=False, na=False) |
                df["organismo"].str.contains(busqueda, case=False, na=False) |
                df["sectores_elegibles"].str.contains(busqueda, case=False, na=False)]
    if tipo_sel != "Todos":
        df = df[df["tipo_label"] == tipo_sel]

    st.caption(f"{len(df)} resultado(s) encontrado(s)")
    st.divider()

    for _, row in df.iterrows():
        status_color = "#2ecc71" if row["status"] == "activo" else "#e67e22" if row["status"] == "proximamente" else "#888"
        tipo_text = safe_str(row["tipo_label"])
        sectores = safe_str(row["sectores_elegibles"])
        url = safe_str(row["url"])
        url_part = f'<a style="color:#aad4e8;font-size:0.8rem;display:block;margin-bottom:8px;" href="{url}" target="_blank">🔗 Más información</a>' if url else ''
        card = (
            f'<div class="result-card" style="border-left-color:{status_color};">'
            f'<div class="result-title">{row["nombre"]}</div>'
            f'<div class="result-meta">{row["organismo"]}</div>'
            f'<div class="result-desc">Sectores elegibles: {sectores}</div>'
            f'{url_part}'
            f'<div class="result-tags">'
            f'<span class="tag" style="background:#3498db22;color:#3498db;border:1px solid #3498db44;">{tipo_text}</span>'
            f'<span class="tag" style="background:{status_color}22;color:{status_color};border:1px solid {status_color}44;">{row["status"].capitalize()}</span>'
            f'</div></div>'
        )
        st.markdown(card, unsafe_allow_html=True)

# ── Buscar con IA ────────────────────────────────────────────
elif pagina == "Buscar (IA)":
    st.header("🤖 Buscar servicios con IA")
    st.write("Describí lo que necesitás en lenguaje libre y el sistema encontrará servicios relevantes en la plataforma.")

    consulta = st.text_area("¿Qué necesitás?",
        placeholder="Ej: necesito validar la estabilidad de un compuesto biológico a distintas temperaturas",
        height=100)

    if st.button("Buscar", type="primary"):
        if consulta:
            with st.spinner("Buscando en la plataforma..."):
                df_caps = run_query("""
                    SELECT a.nombre AS actor, a.website,
                           c.area_tematica, c.tipo_servicio, c.descripcion, c.disponibilidad
                    FROM capacidad c JOIN actor a ON a.id = c.actor_id
                    WHERE c.disponibilidad != 'no_disponible'
                """)
                from anthropic import Anthropic
                client = Anthropic()
                respuesta = client.messages.create(
                    model="claude-opus-4-5",
                    max_tokens=1000,
                    messages=[{"role": "user", "content":
                        f"""Sos un asistente del ecosistema biotech de Córdoba, Argentina.
Un actor del ecosistema tiene esta necesidad: "{consulta}"
Estos son los servicios disponibles en la plataforma:
{df_caps.to_string(index=False)}
Identificá los 3 servicios más relevantes y explicá brevemente por qué cada uno es útil.
Respondé en español, de forma concisa y directa."""}]
                )
                st.success("Resultados encontrados")
                st.write(respuesta.content[0].text)
        else:
            st.warning("Escribí tu consulta antes de buscar.")
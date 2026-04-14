// Mapas de etiquetas y colores compartidos entre componentes

export const TIPO_ACTOR_LABEL: Record<string, string> = {
  empresa:      "Empresa",
  startup:      "Startup",
  universidad:  "Universidad",
  investigador: "Investigación",
  gobierno:     "Gobierno",
};

export const TIPO_ACTOR_COLOR: Record<string, string> = {
  empresa:      "#3b82f6",
  startup:      "#64748b",
  universidad:  "#eab308",
  investigador: "#f97316",
  gobierno:     "#0d9488",
};

export const AREA_LABEL: Record<string, string> = {
  salud_humana:        "Salud humana",
  medicamentos_farma:  "Medicamentos y farmacia",
  alimentos_nutricion: "Alimentos y nutrición",
  ambiente:            "Medio ambiente",
  agroindustria:       "Agroindustria",
  salud_animal:        "Salud animal",
  otro:                "Otro",
};

export const SERVICIO_LABEL: Record<string, string> = {
  diagnostico_clinico:     "Diagnóstico clínico",
  analisis_quimico:        "Análisis químico",
  analisis_molecular:      "Análisis molecular",
  analisis_microbiologico: "Análisis microbiológico",
  control_calidad:         "Control de calidad",
  validacion_procesos:     "Validación de procesos",
  manufactura:             "Manufactura",
  i_d_aplicada:            "I+D aplicada",
  metrologia:              "Metrología",
  consultoria_tecnica:     "Consultoría técnica",
  procesamiento_biologico: "Procesamiento biológico",
  otro:                    "Otro",
};

export const URGENCIA_COLOR: Record<string, string> = {
  critica: "#dc2626",   // rojo — peligro inmediato
  alta:    "#a855f7",   // violeta — atención, claramente distinto del rojo
  normal:  "#2563eb",   // azul — informacional
  baja:    "#94a3b8",   // gris claro — baja prioridad
};

export const DISPONIBILIDAD_COLOR: Record<string, string> = {
  disponible:    "#16a34a",   // verde
  parcial:       "#d97706",   // ámbar
  no_disponible: "#dc2626",   // rojo
};

export const TIPO_INSTRUMENTO_LABEL: Record<string, string> = {
  subsidio: "Subsidio",
  credito:  "Crédito",
  capital:  "Capital",
  concurso: "Concurso",
};

export const TIPO_INSTRUMENTO_COLOR: Record<string, string> = {
  subsidio: "#16a34a",   // verde — aporte/regalo
  credito:  "#2563eb",   // azul — préstamo
  capital:  "#1e3a5f",   // navy — inversión
  concurso: "#9333ea",   // violeta — competencia
};

export const STATUS_INSTRUMENTO_COLOR: Record<string, string> = {
  activo:       "#22c55e",
  proximamente: "#f97316",
  cerrado:      "#6b7280",
};

export const TIPO_INICIATIVA_LABEL: Record<string, string> = {
  vinculacion: "Vinculación",
  oportunidad: "Oportunidad",
  consorcio:   "Consorcio",
  demanda:     "Demanda",
  oferta:      "Oferta",
  instrumento: "Instrumento",
  gap:         "Gap",
};

export const TIPO_INICIATIVA_COLOR: Record<string, string> = {
  vinculacion: "#0ea5e9",
  oportunidad: "#22c55e",
  consorcio:   "#3b82f6",
  demanda:     "#f97316",
  oferta:      "#a855f7",
  instrumento: "#eab308",
  gap:         "#ef4444",
};

export const TIPO_INICIATIVA_DESC: Record<string, string> = {
  vinculacion: "Conexión entre actores — primer contacto o relación estratégica",
  oportunidad: "Oportunidad de mercado detectada",
  consorcio:   "Formación de grupo multi-actor",
  demanda:     "Actor tiene una necesidad concreta",
  oferta:      "Actor tiene capacidad disponible",
  instrumento: "Instrumento de financiamiento disponible",
  gap:         "Brecha tecnológica o de mercado a resolver",
};

export const ESTADO_INICIATIVA_LABEL: Record<string, string> = {
  abierta:    "Abierta",
  en_curso:   "En curso",
  concretada: "Concretada",
  cerrada:    "Cerrada",
  postergada: "Postergada",
};

export const ESTADO_INICIATIVA_COLOR: Record<string, string> = {
  abierta:    "#3b82f6",
  en_curso:   "#f97316",
  concretada: "#22c55e",
  cerrada:    "#6b7280",
  postergada: "#a855f7",
};

export const ROL_ACTOR_LABEL: Record<string, string> = {
  lider:       "Líder",
  demandante:  "Demandante",
  oferente:    "Oferente",
  miembro:     "Miembro",
  candidato:   "Candidato",
  financiador: "Financiador",
};

export const TIPO_HITO_LABEL: Record<string, string> = {
  contacto_establecido:   "Contacto establecido",
  reunion_realizada:      "Reunión realizada",
  acuerdo_alcanzado:      "Acuerdo alcanzado",
  convenio_firmado:       "Convenio firmado",
  proyecto_iniciado:      "Proyecto iniciado",
  financiamiento_obtenido: "Financiamiento obtenido",
  otro:                   "Otro",
};

export const TIPO_HITO_COLOR: Record<string, string> = {
  contacto_establecido:   "#6b7280",
  reunion_realizada:      "#3b82f6",
  acuerdo_alcanzado:      "#a855f7",
  convenio_firmado:       "#e8622a",
  proyecto_iniciado:      "#22c55e",
  financiamiento_obtenido: "#eab308",
  otro:                   "#94a3b8",
};

// ── Proyectos ─────────────────────────────────────────────────

export const ESTADO_PROYECTO_LABEL: Record<string, string> = {
  en_desarrollo:           "En desarrollo",
  buscando_financiamiento: "Buscando financiamiento",
  buscando_socio:          "Buscando socio",
  finalizado:              "Finalizado",
};

export const ESTADO_PROYECTO_COLOR: Record<string, string> = {
  en_desarrollo:           "#3b82f6",
  buscando_financiamiento: "#eab308",
  buscando_socio:          "#a855f7",
  finalizado:              "#22c55e",
};

// TRL: colores progresivos del 1 (rojo, básico) al 9 (verde, listo para mercado)
export const TRL_COLOR: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f97316",
  4: "#eab308",
  5: "#eab308",
  6: "#22d3ee",
  7: "#22c55e",
  8: "#16a34a",
  9: "#0d9488",
};

export const TRL_LABEL: Record<number, string> = {
  1: "TRL 1 — Principios básicos observados",
  2: "TRL 2 — Concepto tecnológico formulado",
  3: "TRL 3 — Prueba de concepto experimental",
  4: "TRL 4 — Validado en laboratorio",
  5: "TRL 5 — Validado en entorno relevante",
  6: "TRL 6 — Demostrado en entorno relevante",
  7: "TRL 7 — Demostrado en entorno operacional",
  8: "TRL 8 — Sistema completo y calificado",
  9: "TRL 9 — Sistema probado en entorno real",
};

// Mapas de etiquetas y colores compartidos entre componentes

export const TIPO_ACTOR_LABEL: Record<string, string> = {
  laboratorio:   "Laboratorio",
  empresa:       "Empresa",
  startup:       "Startup",
  universidad:   "Universidad",
  investigacion: "Investigación",
};

export const TIPO_ACTOR_COLOR: Record<string, string> = {
  laboratorio:   "#22c55e",
  empresa:       "#3b82f6",
  startup:       "#a855f7",
  universidad:   "#eab308",
  investigacion: "#f97316",
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
  critica: "#ef4444",
  alta:    "#f97316",
  normal:  "#3b82f6",
  baja:    "#6b7280",
};

export const DISPONIBILIDAD_COLOR: Record<string, string> = {
  disponible:    "#22c55e",
  parcial:       "#f97316",
  no_disponible: "#ef4444",
};

export const TIPO_INSTRUMENTO_LABEL: Record<string, string> = {
  subsidio: "Subsidio",
  credito:  "Crédito",
  capital:  "Capital",
  concurso: "Concurso",
};

export const STATUS_INSTRUMENTO_COLOR: Record<string, string> = {
  activo:       "#22c55e",
  proximamente: "#f97316",
  cerrado:      "#6b7280",
};

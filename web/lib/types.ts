// ── Actors ────────────────────────────────────────────────────
export interface ActorList {
  id: number;
  nombre: string;
  tipo: string;
  etapa: string | null;
  sitio_web: string | null;
  descripcion: string | null;
  total_servicios: number;
  total_necesidades: number;
}

export interface ServiceSummary {
  id: number;
  tipo_servicio: string;
  area_tematica: string;
  disponibilidad: string;
}

export interface NeedSummary {
  id: number;
  tipo_servicio: string;
  urgencia: string;
}

export interface ActorDetail extends Omit<ActorList, "total_servicios" | "total_necesidades"> {
  certificaciones: string[];
  servicios: ServiceSummary[];
  necesidades: NeedSummary[];
}

// ── Services ──────────────────────────────────────────────────
export interface ServiceItem {
  actor: string;
  tipo_actor: string;
  area_tematica: string;
  tipo_servicio: string;
  descripcion: string | null;
  descripcion_extendida: string | null;
  disponibilidad: string;
}

// ── Needs ─────────────────────────────────────────────────────
export interface NeedItem {
  actor: string;
  tipo_actor: string;
  area_tematica: string;
  tipo_servicio: string;
  descripcion: string | null;
  descripcion_extendida: string | null;
  urgencia: string;
  status: string;
}

// ── Instruments ───────────────────────────────────────────────
export interface InstrumentItem {
  nombre: string;
  tipo: string;
  organismo: string;
  sectores_elegibles: string | null;
  status: string;
  url: string | null;
  monto_maximo: string | null;
  cobertura_porcentaje: number | null;
  plazo_ejecucion: string | null;
  contrapartida: string | null;
  gastos_elegibles: string | null;
  descripcion_extendida: string | null;
}

// ── Gaps ──────────────────────────────────────────────────────
export interface GapItem {
  tipo_servicio: string;
  area_tematica: string;
  demanda: number;
  oferta_disponible: number;
  actores_demandantes: string | null;
}

export interface GapSummary {
  total_gaps: number;
  total_parcial: number;
  total_demanda: number;
}

// ── Vinculador ────────────────────────────────────────────────
export interface VinculadorItem {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

// ── Iniciativas ───────────────────────────────────────────────
export interface HitoItem {
  id: number;
  tipo: string;
  descripcion: string | null;
  fecha: string;
  evidencia_url: string | null;
  creado_en: string;
}

export interface IniciativaActorOut {
  actor_id: number;
  actor_nombre: string;
  actor_tipo: string;
  rol: string;
}

export interface NecesidadRef {
  necesidad_id: number;
  actor_nombre: string;
  tipo_servicio: string;
}

export interface CapacidadRef {
  capacidad_id: number;
  actor_nombre: string;
  tipo_servicio: string;
}

export interface InstrumentoRef {
  instrumento_id: number;
  nombre: string;
  tipo: string;
}

export interface IniciativaList {
  id: number;
  tipo: string;
  titulo: string;
  estado: string;
  vinculador_nombre: string | null;
  total_actores: number;
  total_hitos: number;
  creado_en: string;
  actualizado_en: string;
}

export interface IniciativaDetail {
  id: number;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  estado: string;
  notas: string | null;
  vinculador_id: number | null;
  vinculador_nombre: string | null;
  creado_en: string;
  actualizado_en: string;
  actores: IniciativaActorOut[];
  necesidades: NecesidadRef[];
  capacidades: CapacidadRef[];
  instrumentos: InstrumentoRef[];
  hitos: HitoItem[];
}

// ── Search ────────────────────────────────────────────────────
export interface SearchResponse {
  respuesta: string;
  necesidad_cubierta: boolean;
  cobertura_parcial: boolean;
  gaps_detectados: string[];
}

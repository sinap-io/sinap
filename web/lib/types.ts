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
  id?: number;
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
  id: number;
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
  referente: string | null;
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
  actor_ids: number[];
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

// ── Proyectos ─────────────────────────────────────────────────
export interface ProyectoActorOut {
  actor_id: number;
  actor_nombre: string;
  actor_tipo: string;
  rol: string | null;
}

export interface ProyectoInstrumentoOut {
  instrumento_id: number;
  nombre: string;
  tipo: string;
}

export interface TRLLogOut {
  id: number;
  trl_antes: number | null;
  trl_despues: number;
  creado_en: string;
}

export interface ProyectoHitoOut {
  id: number;
  tipo: string;
  descripcion: string | null;
  fecha: string;
  evidencia_url: string | null;
  creado_por: number | null;
  creado_en: string;
}

export interface ProyectoList {
  id: number;
  titulo: string;
  trl: number | null;
  area_tematica: string | null;
  estado: string;
  apoyos_buscados: string[];
  prioridad: number | null;
  iniciativa_id: number | null;
  iniciativa_titulo: string | null;
  total_actores: number;
  actor_ids: number[];
  creado_en: string;
  actualizado_en: string;
}

export interface ProyectoDetail {
  id: number;
  titulo: string;
  descripcion: string | null;
  trl: number | null;
  area_tematica: string | null;
  estado: string;
  apoyos_buscados: string[];
  prioridad: number | null;
  iniciativa_id: number | null;
  iniciativa_titulo: string | null;
  vinculador_id: number | null;
  vinculador_nombre: string | null;
  creado_en: string;
  actualizado_en: string;
  actores: ProyectoActorOut[];
  instrumentos: ProyectoInstrumentoOut[];
  historial_trl: TRLLogOut[];
  hitos: ProyectoHitoOut[];
}

export interface ZonaOut {
  id: number;
  nombre: string;
  activa: boolean;
  creado_en: string;
}

// ── ADIT ──────────────────────────────────────────────────────
export interface VinculadorList {
  id: number;
  nombre: string;
  email: string | null;
  activo: boolean;
  zona_id: number | null;
  zona_nombre: string | null;
  usuario_id: number | null;
  total_iniciativas: number;
  total_hitos: number;
  total_proyectos: number;
  creado_en: string;
}

export interface IniciativaResumen {
  id: number;
  titulo: string;
  tipo: string;
  estado: string;
  creado_en: string;
}

export interface HitoResumen {
  id: number;
  tipo: string;
  descripcion: string | null;
  fecha: string;
  iniciativa_titulo: string;
  creado_en: string;
}

export interface ProyectoResumen {
  id: number;
  titulo: string;
  trl: number | null;
  estado: string;
  creado_en: string;
}

export interface TRLChangeResumen {
  id: number;
  trl_antes: number | null;
  trl_despues: number | null;
  proyecto_titulo: string;
  creado_en: string;
}

export interface VinculadorDetail {
  id: number;
  nombre: string;
  email: string | null;
  activo: boolean;
  zona_id: number | null;
  zona_nombre: string | null;
  usuario_id: number | null;
  creado_en: string;
  iniciativas: IniciativaResumen[];
  hitos: HitoResumen[];
  proyectos: ProyectoResumen[];
  trl_changes: TRLChangeResumen[];
}

export interface ActividadResumen {
  vinculadores_activos: number;
  total_iniciativas: number;
  total_hitos: number;
  total_proyectos: number;
  total_trl_changes: number;
}

// ── Search ────────────────────────────────────────────────────
export interface SearchResponse {
  respuesta: string;
  necesidad_cubierta: boolean;
  cobertura_parcial: boolean;
  gaps_detectados: string[];
}

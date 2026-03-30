/**
 * TIPOS COMPARTIDOS PARA EQUIPOS DE VENTAS - TIER 0
 * 
 * @description Definiciones de tipos centralizadas para evitar duplicación
 * y garantizar compatibilidad entre componentes
 */

// Gamificación
export interface Insignia {
  id: string
  nombre: string
  descripcion: string
  icono: string
  fechaObtenida: string
  rareza: 'comun' | 'raro' | 'epico' | 'legendario'
}

export interface Logro {
  id: string
  titulo: string
  descripcion: string
  progreso: number
  objetivo: number
  recompensa: string
  fechaCompletado?: string
}

// IA y Recomendaciones
export interface RecomendacionIA {
  id: string
  tipo: 'prospecto' | 'estrategia' | 'timing' | 'producto'
  titulo: string
  descripcion: string
  prioridad: 'alta' | 'media' | 'baja'
  impactoEstimado: number
  fechaGenerada: string
}

export interface Alerta {
  id: string
  tipo: 'oportunidad' | 'riesgo' | 'meta' | 'cliente'
  mensaje: string
  severidad: 'info' | 'warning' | 'error' | 'success'
  fechaCreada: string
  leida: boolean
}

// Coaching y Desarrollo
export interface SesionCoaching {
  id: string
  fecha: string
  tipo: 'individual' | 'grupal' | 'skill-building'
  participantes: string[]
  tema: string
  objetivos: string[]
  resultados?: string
  proximaSesion?: string
  coach: string
}

export interface PlanDesarrollo {
  id: string
  miembroId: string
  area: string
  objetivoActual: string
  progreso: number
  fechaInicio: string
  fechaObjetivo: string
  recursos: string[]
  mentor?: string
}

export interface ObjetivoEquipo {
  id: string
  titulo: string
  descripcion: string
  tipo: 'ventas' | 'desarrollo' | 'proceso' | 'cliente'
  progreso: number
  objetivo: number
  fechaLimite: string
  responsables: string[]
  prioridad: 'alta' | 'media' | 'baja'
}

// Miembros y Equipos
export interface MiembroEquipo {
  id: string
  nombre: string
  apellido: string
  email: string
  foto?: string
  cargo: string
  fechaIngreso: string
  ventasMes: number
  metaIndividual: number
  ranking: number
  especializaciones: string[]
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia'
  cortexScore: number
}

// Recomendaciones y Alertas de Equipo
export interface RecomendacionEquipo {
  id: string
  tipo: 'estructura' | 'proceso' | 'coaching' | 'asignacion'
  titulo: string
  descripcion: string
  impactoEstimado: number
  esfuerzoRequerido: 'bajo' | 'medio' | 'alto'
  fechaGenerada: string
  aplicada: boolean
  prioridad?: 'alta' | 'media' | 'baja'
}

export interface AlertaEquipo {
  id: string
  tipo: 'performance' | 'estructura' | 'proceso' | 'desarrollo'
  mensaje: string
  severidad: 'info' | 'warning' | 'error' | 'success'
  afectados: string[]
  fechaCreada: string
  resuelta: boolean
}

// Vendedor Completo
export interface VendedorCompleto {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  foto?: string
  
  // Información Profesional
  cargo: string
  equipo: string
  jefeDirecto: string
  fechaIngreso: string
  especializaciones: string[]
  certificaciones: string[]
  
  // Performance Actual
  metaMensual: number
  ventasActuales: number
  ventasAnuales: number
  comisionesAcumuladas: number
  ranking: number
  rankingAnual: number
  
  // Métricas Avanzadas
  conversionRate: number
  ticketPromedio: number
  cicloVentaPromedio: number
  clientesActivos: number
  clientesNuevos: number
  
  // Gamificación
  puntos: number
  nivel: number
  insignias: Insignia[]
  logros: Logro[]
  
  // Estado y Actividad
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia'
  ultimaActividad: string
  horasTrabajadasMes: number
  
  // IA y Automatización
  cortexScore: number
  recomendacionesIA: RecomendacionIA[]
  alertas: Alerta[]
  
  // Datos históricos para Cortex
  ventasHistoricas: number[]
  actividadesHistoricas: number[]
  clientesHistoricos: number[]
}

// Equipo Completo
export interface EquipoCompleto {
  id: string
  nombre: string
  descripcion: string
  
  // Liderazgo
  jefe: {
    id: string
    nombre: string
    apellido: string
    email: string
    foto?: string
    experiencia: number
    certificaciones: string[]
  }
  
  // Configuración del Equipo
  especializacion: 'geografica' | 'vertical' | 'mixta' | 'producto'
  territorio?: string[]
  industrias?: string[]
  productos?: string[]
  
  // Miembros del Equipo
  miembros: MiembroEquipo[]
  capacidadMaxima: number
  
  // Performance Grupal
  metaGrupal: number
  ventasGrupales: number
  ventasAnuales: number
  comisionesGrupales: number
  ranking: number
  rankingAnual: number
  
  // Métricas Avanzadas
  conversionRatePromedio: number
  ticketPromedioEquipo: number
  cicloVentaPromedio: number
  clientesActivosTotal: number
  
  // Coaching y Desarrollo
  sesionesCoaching: SesionCoaching[]
  planDesarrollo: PlanDesarrollo[]
  objetivosEquipo: ObjetivoEquipo[]
  
  // IA y Automatización
  cortexTeamScore: number
  recomendacionesEquipo: RecomendacionEquipo[]
  alertasEquipo: AlertaEquipo[]
  
  // Estado
  estado: 'activo' | 'reestructuracion' | 'expansion'
  fechaCreacion: string
  ultimaReunion: string
}

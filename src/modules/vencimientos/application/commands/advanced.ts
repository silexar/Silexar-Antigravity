/**
 * COMMANDS AVANZADOS: VENCIMIENTOS FASE 2 - TIER 0 ENTERPRISE
 *
 * @description Commands para casos de uso complejos:
 * tandas, alertas, confirmaciones, pricing, exclusividades,
 * sincronización contratos, R1 aprobación, R2 operador tráfico.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// CREAR TANDA COMERCIAL
// ═══════════════════════════════════════════════════════════════



export interface CrearTandaComercialCommand {
  type: 'CrearTandaComercial'
  payload: {
    emisoraId: string
    tipo: 'prime_am' | 'prime_pm' | 'repartida' | 'noche' | 'madrugada'
    nombre: string
    horaInicio: string
    horaFin: string
    factorMultiplicador: number
    precioBase30s: number  // Genera tarifas automáticas para todas las duraciones
    creadoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERAR ALERTA DE VENCIMIENTO
// ═══════════════════════════════════════════════════════════════

export interface GenerarAlertaVencimientoCommand {
  type: 'GenerarAlertaVencimiento'
  payload: {
    cupoComercialId: string
    tipo: 'inicio_auspicio' | 'fin_auspicio_manana' | 'fin_auspicio_hoy' | 'no_inicio_cliente' | 'extension_aprobada' | 'urgente'
    destinatarioId: string
    destinatarioNombre: string
    prioridad: 'baja' | 'media' | 'alta' | 'critica'
    canales: ('sistema' | 'email' | 'whatsapp' | 'push')[]
    generadoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// CONFIRMAR INICIO DE AUSPICIO (Programador de tráfico)
// ═══════════════════════════════════════════════════════════════

export interface ConfirmarInicioAuspicioCommand {
  type: 'ConfirmarInicioAuspicio'
  payload: {
    cupoComercialId: string
    programadorId: string
    programadorNombre: string
    comentario?: string
    materialesVerificados: boolean
  }
}

// ═══════════════════════════════════════════════════════════════
// OPTIMIZAR PRICING
// ═══════════════════════════════════════════════════════════════

export interface OptimizarPricingCommand {
  type: 'OptimizarPricing'
  payload: {
    programaId: string
    emisoraId: string
    estrategia: 'maximizar_revenue' | 'maximizar_ocupacion' | 'equilibrio'
    factoresConsiderar: ('demanda' | 'temporada' | 'rating' | 'competencia')[]
    aprobadoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// GESTIONAR EXCLUSIVIDAD
// ═══════════════════════════════════════════════════════════════

export interface GestionarExclusividadCommand {
  type: 'GestionarExclusividad'
  payload: {
    programaId: string
    emisoraId: string
    rubro: string
    politica: 'exclusivo' | 'limitado' | 'sin_restriccion'
    maxClientes: number
    requiereSeparacionMinutos: number
    gestionadoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// SINCRONIZAR CON CONTRATO
// ═══════════════════════════════════════════════════════════════

export interface SincronizarContratoCommand {
  type: 'SincronizarContrato'
  payload: {
    cupoComercialId: string
    contratoId: string
    direccion: 'contrato_a_vencimiento' | 'vencimiento_a_contrato' | 'bidireccional'
    sincronizadoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// APROBAR EXTENSIÓN (R1) — Jefe/Gerente Comercial
// ═══════════════════════════════════════════════════════════════

export interface AprobarExtensionCommand {
  type: 'AprobarExtension'
  payload: {
    solicitudExtensionId: string
    aprobadorId: string
    aprobadorNombre: string
    decision: 'aprobada' | 'rechazada'
    motivoRechazo?: string
    comentario?: string
  }
}

// ═══════════════════════════════════════════════════════════════
// ASIGNAR OPERADOR DE TRÁFICO (R2)
// ═══════════════════════════════════════════════════════════════

export interface AsignarOperadorTraficoCommand {
  type: 'AsignarOperadorTrafico'
  payload: {
    emisoraId: string
    operadorTraficoId: string
    operadorTraficoNombre: string
    asignadoPor: string
  }
}

// ═══════════════════════════════════════════════════════════════
// TYPE UNION
// ═══════════════════════════════════════════════════════════════

export type VencimientosAdvancedCommand =
  | CrearTandaComercialCommand
  | GenerarAlertaVencimientoCommand
  | ConfirmarInicioAuspicioCommand
  | OptimizarPricingCommand
  | GestionarExclusividadCommand
  | SincronizarContratoCommand
  | AprobarExtensionCommand
  | AsignarOperadorTraficoCommand

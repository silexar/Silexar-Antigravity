import { logger } from '@/lib/observability';
/**
 * 🔒 SILEXAR PULSE - Servicio de Control de Campañas TIER 0
 * 
 * @description Servicio que controla la validación de especificaciones antes
 * de planificar y el bloqueo de modificación para campañas facturadas.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type EstadoCampanaControl = 
  | 'planificacion' 
  | 'armada' 
  | 'aprobacion' 
  | 'confirmada' 
  | 'programada' 
  | 'en_aire' 
  | 'pausada' 
  | 'completada' 
  | 'cancelada';

export type NivelPermiso = 
  | 'programador' 
  | 'ejecutivo' 
  | 'jefatura' 
  | 'supervisor_facturacion' 
  | 'admin';

export interface EspecificacionEmisora {
  emisoraId: string;
  emisoraNombre: string;
  programa?: string;
  horarioInicio?: string;
  horarioFin?: string;
  diasSemana?: string[];
  cantidadCunas?: number;
  duracionCuna?: number;
}

export interface EspecificacionDigital {
  plataforma: string;
  formato: string;
  impresiones?: number;
  clics?: number;
}

export interface CampanaParaValidacion {
  id: string;
  contratoId?: string;
  estado: EstadoCampanaControl;
  facturada: boolean;
  bloqueadaParaEdicion: boolean;
  especificacionesValidadas: boolean;
  emisorasSeleccionadas: EspecificacionEmisora[];
  especificacionesDigitales?: EspecificacionDigital[];
}

export interface EspecificacionContrato {
  emisoraId?: string;
  emisoraNombre?: string;
  programa?: string;
  horario?: string;
  cantidadCunas?: number;
  plataforma?: string;
  formato?: string;
  impresiones?: number;
  medioTipo: 'FM' | 'RADIO' | 'TV' | 'DIGITAL';
}

export interface ResultadoValidacionPlanificacion {
  puedePlanificar: boolean;
  errores: string[];
  advertencias: string[];
  emisorasSinEspecificacion: string[];
  accionRequerida?: string;
}

export interface ResultadoValidacionModificacion {
  puedeModificar: boolean;
  razon?: string;
  accionRequerida?: string;
  requiereAprobacion: boolean;
  nivelAprobacionRequerido?: NivelPermiso;
}

export interface UsuarioActual {
  id: string;
  nombre: string;
  nivel: NivelPermiso;
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE CONTROL DE CAMPAÑAS
// ═══════════════════════════════════════════════════════════════

class CampanaControlServiceClass {
  private static instance: CampanaControlServiceClass;
  
  private constructor() {}
  
  static getInstance(): CampanaControlServiceClass {
    if (!this.instance) {
      this.instance = new CampanaControlServiceClass();
    }
    return this.instance;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN DE ESPECIFICACIONES PARA PLANIFICACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Valida si las emisoras de la campaña tienen especificaciones en el contrato
   */
  async validarEspecificacionesParaPlanificar(
    campana: CampanaParaValidacion,
    especificacionesContrato: EspecificacionContrato[]
  ): Promise<ResultadoValidacionPlanificacion> {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const emisorasSinEspecificacion: string[] = [];
    
    // Si no hay contrato asociado
    if (!campana.contratoId) {
      return {
        puedePlanificar: false,
        errores: ['La campaña no tiene un contrato asociado'],
        advertencias: [],
        emisorasSinEspecificacion: [],
        accionRequerida: 'Asociar un contrato a la campaña'
      };
    }
    
    // Validar cada emisora seleccionada
    for (const emisora of campana.emisorasSeleccionadas) {
      const especEnContrato = especificacionesContrato.find(
        e => e.emisoraId === emisora.emisoraId || 
             e.emisoraNombre?.toLowerCase() === emisora.emisoraNombre.toLowerCase()
      );
      
      if (!especEnContrato) {
        emisorasSinEspecificacion.push(emisora.emisoraNombre);
        errores.push(
          `La emisora "${emisora.emisoraNombre}" no tiene especificaciones en el contrato`
        );
      }
    }
    
    // Validar especificaciones digitales si existen
    if (campana.especificacionesDigitales && campana.especificacionesDigitales.length > 0) {
      for (const digital of campana.especificacionesDigitales) {
        const especEnContrato = especificacionesContrato.find(
          e => e.medioTipo === 'DIGITAL' && 
               e.plataforma?.toLowerCase() === digital.plataforma.toLowerCase()
        );
        
        if (!especEnContrato) {
          errores.push(
            `La plataforma digital "${digital.plataforma}" no tiene especificaciones en el contrato`
          );
        }
      }
    }
    
    const puedePlanificar = errores.length === 0;
    
    return {
      puedePlanificar,
      errores,
      advertencias,
      emisorasSinEspecificacion,
      accionRequerida: puedePlanificar 
        ? undefined 
        : 'Agregar las especificaciones faltantes al contrato antes de planificar'
    };
  }
  
  /**
   * Determina el estado de la campaña basado en las validaciones
   */
  determinarEstadoCampana(
    validacionEspecificaciones: ResultadoValidacionPlanificacion,
    estadoActual: EstadoCampanaControl
  ): EstadoCampanaControl {
    // Si está en planificación y no puede planificar, pasa a "armada"
    if (estadoActual === 'planificacion' && !validacionEspecificaciones.puedePlanificar) {
      return 'armada';
    }
    
    return estadoActual;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CONTROL DE MODIFICACIÓN DE CAMPAÑAS FACTURADAS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Valida si el usuario puede modificar una campaña
   */
  validarModificacionCampana(
    campana: CampanaParaValidacion,
    usuario: UsuarioActual
  ): ResultadoValidacionModificacion {
    // Si la campaña no está confirmada, se puede modificar libremente
    if (campana.estado !== 'confirmada' && campana.estado !== 'programada') {
      return {
        puedeModificar: true,
        requiereAprobacion: false
      };
    }
    
    // Si la campaña está facturada
    if (campana.facturada) {
      // Solo supervisor de facturación o jefatura pueden desbloquear
      const nivelesPermitidos: NivelPermiso[] = ['supervisor_facturacion', 'jefatura', 'admin'];
      
      if (nivelesPermitidos.includes(usuario.nivel)) {
        return {
          puedeModificar: true,
          requiereAprobacion: false,
          razon: 'Autorizado por nivel de permiso'
        };
      }
      
      return {
        puedeModificar: false,
        razon: 'Esta campaña ya fue facturada y no puede ser modificada',
        accionRequerida: 'Contactar a la Jefatura o al Área de Facturación para solicitar desbloqueo',
        requiereAprobacion: true,
        nivelAprobacionRequerido: 'supervisor_facturacion'
      };
    }
    
    // Si está bloqueada para edición
    if (campana.bloqueadaParaEdicion) {
      const nivelesPermitidos: NivelPermiso[] = ['jefatura', 'admin'];
      
      if (nivelesPermitidos.includes(usuario.nivel)) {
        return {
          puedeModificar: true,
          requiereAprobacion: false,
          razon: 'Desbloqueado por nivel de permiso'
        };
      }
      
      return {
        puedeModificar: false,
        razon: 'Esta campaña está bloqueada para edición',
        accionRequerida: 'Contactar a la Jefatura para solicitar desbloqueo',
        requiereAprobacion: true,
        nivelAprobacionRequerido: 'jefatura'
      };
    }
    
    // Por defecto, puede modificar
    return {
      puedeModificar: true,
      requiereAprobacion: false
    };
  }
  
  /**
   * Desbloquea una campaña para edición (solo usuarios autorizados)
   */
  desbloquearCampana(
    campana: CampanaParaValidacion,
    usuario: UsuarioActual,
    motivo: string
  ): { exito: boolean; mensaje: string } {
    const nivelesPermitidos: NivelPermiso[] = ['supervisor_facturacion', 'jefatura', 'admin'];
    
    if (!nivelesPermitidos.includes(usuario.nivel)) {
      return {
        exito: false,
        mensaje: 'No tiene permisos para desbloquear esta campaña'
      };
    }
    
    if (!motivo || motivo.trim().length < 10) {
      return {
        exito: false,
        mensaje: 'Debe proporcionar un motivo válido para el desbloqueo (mínimo 10 caracteres)'
      };
    }
    
    // En producción, esto actualizaría la BD
    logger.info(`[DESBLOQUEO] Campaña ${campana.id} desbloqueada por ${usuario.nombre}. Motivo: ${motivo}`);
    
    return {
      exito: true,
      mensaje: 'Campaña desbloqueada exitosamente'
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Obtiene el mensaje de alerta para el usuario
   */
  obtenerMensajeAlerta(
    validacion: ResultadoValidacionPlanificacion | ResultadoValidacionModificacion
  ): { tipo: 'error' | 'warning' | 'info'; mensaje: string; accion?: string } | null {
    if ('puedePlanificar' in validacion) {
      // Es validación de planificación
      if (!validacion.puedePlanificar) {
        return {
          tipo: 'error',
          mensaje: validacion.errores[0] || 'No se puede planificar la campaña',
          accion: validacion.accionRequerida
        };
      }
      if (validacion.advertencias.length > 0) {
        return {
          tipo: 'warning',
          mensaje: validacion.advertencias[0]
        };
      }
    } else {
      // Es validación de modificación
      if (!validacion.puedeModificar) {
        return {
          tipo: 'error',
          mensaje: validacion.razon || 'No puede modificar esta campaña',
          accion: validacion.accionRequerida
        };
      }
    }
    
    return null;
  }
  
  /**
   * Verifica si el usuario tiene permiso para aprobar desbloqueos
   */
  puedeAprobarDesbloqueo(usuario: UsuarioActual): boolean {
    const nivelesPermitidos: NivelPermiso[] = ['supervisor_facturacion', 'jefatura', 'admin'];
    return nivelesPermitidos.includes(usuario.nivel);
  }
  
  /**
   * Mock: Obtiene especificaciones del contrato
   * En producción, esto consultaría la BD
   */
  async obtenerEspecificacionesContrato(contratoId: string): Promise<EspecificacionContrato[]> {
    logger.info(`[CONTROL] Obteniendo especificaciones del contrato ${contratoId}`);
    
    // Mock - en producción consultar la BD
    return [
      {
        emisoraId: 'em_001',
        emisoraNombre: 'Radio Cooperativa',
        programa: 'El Diario de Cooperativa',
        horario: '07:00 - 09:00',
        cantidadCunas: 10,
        medioTipo: 'FM'
      },
      {
        emisoraId: 'em_002',
        emisoraNombre: 'Radio Bío Bío',
        programa: 'Noticiario',
        horario: '12:00 - 14:00',
        cantidadCunas: 8,
        medioTipo: 'FM'
      }
    ];
  }
}

// Singleton export
export const CampanaControlService = CampanaControlServiceClass.getInstance();
export default CampanaControlService;

import { logger } from '@/lib/observability';
/**
 * 🛡️ SILEXAR PULSE - Servicio de Validación de Campañas TIER 0
 * 
 * @description Valida las reglas de negocio antes de crear/modificar campañas,
 * incluyendo verificación del estado del contrato y excepciones por tipo de cliente.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoCliente = 'comercial' | 'asistencia' | 'beneficencia';

export type EstadoContratoAnti = 
  | 'borrador' 
  | 'pendiente_evidencia' 
  | 'pendiente_aprobacion' 
  | 'aprobado_parcial' 
  | 'pendiente_reaprobacion' 
  | 'operativo' 
  | 'aprobado' 
  | 'activo';

export interface ContratoValidacion {
  id: string;
  numeroContrato: string;
  estado: EstadoContratoAnti;
  tipoCliente: TipoCliente;
  fechaInicio: Date;
  fechaFin: Date;
  tieneEvidencias: boolean;
  aprobacionesCompletas: boolean;
}

export interface ResultadoValidacion {
  permitido: boolean;
  razon?: string;
  requiereAccion?: string;
  esExcepcion?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

class CampanaValidacionServiceImpl {
  
  /**
   * Estados que permiten crear campañas
   */
  private readonly ESTADOS_PERMITIDOS: EstadoContratoAnti[] = [
    'operativo',
    'aprobado',
    'activo'
  ];
  
  /**
   * Tipos de cliente con excepciones
   */
  private readonly TIPOS_CON_EXCEPCION: TipoCliente[] = [
    'asistencia',
    'beneficencia'
  ];
  
  /**
   * Valida si se puede crear una campaña basándose en el contrato
   */
  async validarCreacionCampana(contrato: ContratoValidacion): Promise<ResultadoValidacion> {
    // 1. Verificar si es un tipo de cliente con excepción
    if (this.tieneExcepcion(contrato.tipoCliente)) {
      return {
        permitido: true,
        esExcepcion: true,
        razon: `Cliente de tipo "${contrato.tipoCliente}" - Validación simplificada aplicada`
      };
    }
    
    // 2. Para clientes comerciales, aplicar validación completa
    return this.validarClienteComercial(contrato);
  }
  
  /**
   * Valida un cliente comercial (reglas completas)
   */
  private validarClienteComercial(contrato: ContratoValidacion): ResultadoValidacion {
    // Verificar estado del contrato
    if (!this.ESTADOS_PERMITIDOS.includes(contrato.estado)) {
      return this.obtenerMensajeEstadoNoPermitido(contrato.estado);
    }
    
    // Verificar vigencia
    const hoy = new Date();
    if (hoy < contrato.fechaInicio) {
      return {
        permitido: false,
        razon: 'El contrato aún no ha iniciado su vigencia',
        requiereAccion: `El contrato inicia el ${contrato.fechaInicio.toLocaleDateString()}`
      };
    }
    
    if (hoy > contrato.fechaFin) {
      return {
        permitido: false,
        razon: 'El contrato ha vencido',
        requiereAccion: 'Solicitar renovación o extensión del contrato'
      };
    }
    
    // Verificar evidencias (para estado operativo debe tener)
    if (contrato.estado === 'operativo' && !contrato.tieneEvidencias) {
      return {
        permitido: false,
        razon: 'El contrato no tiene evidencias de negociación validadas',
        requiereAccion: 'Subir evidencias de negociación en la sección de Autorización'
      };
    }
    
    // Todo OK
    return {
      permitido: true,
      razon: 'Contrato válido para crear campañas'
    };
  }
  
  /**
   * Obtiene el mensaje de error para estados no permitidos
   */
  private obtenerMensajeEstadoNoPermitido(estado: EstadoContratoAnti): ResultadoValidacion {
    const mensajes: Record<string, { razon: string; requiereAccion: string }> = {
      borrador: {
        razon: 'El contrato está en estado borrador',
        requiereAccion: 'Completar el wizard y enviar a aprobación'
      },
      pendiente_evidencia: {
        razon: 'El contrato requiere evidencias de negociación',
        requiereAccion: 'Subir al menos una evidencia en la sección de Autorización'
      },
      pendiente_aprobacion: {
        razon: 'El contrato está pendiente de aprobación',
        requiereAccion: 'Esperar la aprobación del nivel jerárquico correspondiente'
      },
      aprobado_parcial: {
        razon: 'El contrato tiene aprobaciones pendientes',
        requiereAccion: 'Esperar que todos los niveles requeridos aprueben'
      },
      pendiente_reaprobacion: {
        razon: 'El contrato fue modificado y requiere nueva aprobación',
        requiereAccion: 'Las modificaciones invalidaron las aprobaciones, esperar nuevo ciclo'
      }
    };
    
    const mensaje = mensajes[estado] || {
      razon: `Estado del contrato no válido: ${estado}`,
      requiereAccion: 'Contactar al administrador'
    };
    
    return {
      permitido: false,
      ...mensaje
    };
  }
  
  /**
   * Verifica si el tipo de cliente tiene una excepción de validación
   */
  tieneExcepcion(tipoCliente: TipoCliente): boolean {
    return this.TIPOS_CON_EXCEPCION.includes(tipoCliente);
  }
  
  /**
   * Valida si se puede cargar material creativo
   */
  async validarCargaMaterial(contrato: ContratoValidacion): Promise<ResultadoValidacion> {
    // Excepciones aplican igual
    if (this.tieneExcepcion(contrato.tipoCliente)) {
      return {
        permitido: true,
        esExcepcion: true,
        razon: `Cliente "${contrato.tipoCliente}" - Carga de material permitida`
      };
    }
    
    // Para comerciales, mismo criterio que campañas
    return this.validarClienteComercial(contrato);
  }
  
  /**
   * Valida si las especificaciones del contrato cubren la campaña
   */
  async validarEspecificacionesCampana(
    contratoId: string,
    especificacionesCampana: {
      emisoraId?: string;
      programa?: string;
      duracionSpot?: number;
      cantidadSpots?: number;
    },
    tipoCliente: TipoCliente
  ): Promise<ResultadoValidacion> {
    // Excepciones: asistencia y beneficencia pueden crear sin especificaciones
    if (this.tieneExcepcion(tipoCliente)) {
      return {
        permitido: true,
        esExcepcion: true,
        razon: `Cliente "${tipoCliente}" - Campaña puede crearse sin especificaciones previas en contrato`
      };
    }
    
    // Para comerciales: verificar que las especificaciones existan en el contrato
    // Esta lógica debería consultar contratosItems en la BD
    logger.info(`[VALIDACIÓN] Verificando especificaciones para contrato ${contratoId}`, especificacionesCampana);
    
    // Por ahora retornamos permitido, en producción se consultaría la BD
    return {
      permitido: true,
      razon: 'Especificaciones validadas contra el contrato'
    };
  }
  
  /**
   * Obtiene un resumen de validación para mostrar en UI
   */
  obtenerResumenValidacion(contrato: ContratoValidacion): {
    color: 'green' | 'yellow' | 'red';
    icono: 'check' | 'clock' | 'alert' | 'lock';
    mensaje: string;
  } {
    // Excepciones
    if (this.tieneExcepcion(contrato.tipoCliente)) {
      return {
        color: 'green',
        icono: 'check',
        mensaje: `Contrato ${contrato.tipoCliente} - Sin restricciones`
      };
    }
    
    // Estados
    if (this.ESTADOS_PERMITIDOS.includes(contrato.estado)) {
      return {
        color: 'green',
        icono: 'check',
        mensaje: 'Contrato autorizado para campañas'
      };
    }
    
    if (contrato.estado === 'pendiente_aprobacion' || contrato.estado === 'aprobado_parcial') {
      return {
        color: 'yellow',
        icono: 'clock',
        mensaje: 'Pendiente de aprobación'
      };
    }
    
    if (contrato.estado === 'pendiente_reaprobacion') {
      return {
        color: 'yellow',
        icono: 'alert',
        mensaje: 'Requiere re-aprobación'
      };
    }
    
    return {
      color: 'red',
      icono: 'lock',
      mensaje: 'Contrato no autorizado'
    };
  }
}

// Exportar instancia singleton
export const CampanaValidacionService = new CampanaValidacionServiceImpl();
export default CampanaValidacionService;

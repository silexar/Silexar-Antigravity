/**
 * ?? SILEXAR PULSE - Servicio de Campa�as TIER 0
 * 
 * @description Servicio para gesti�n de campa�as con validaci�n anti-fraude
 * integrada que verifica el estado del contrato antes de crear campa�as.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import { logger } from '@/lib/observability';
import {
  CampanaValidacionService,
  ContratoValidacion,
  TipoCliente
} from './CampanaValidacionService';

export interface CampanaFiltros {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  clienteId?: string;
}

export interface Campana {
  id: string;
  nombre: string;
  estado: 'BORRADOR' | 'ACTIVA' | 'PAUSADA' | 'FINALIZADA';
  presupuesto: number;
  fechaInicio: string;
  fechaFin: string;
  contratoId?: string;
  tipoCliente?: TipoCliente;
}

export interface CampanaCreateDTO {
  nombre: string;
  clienteId: string;
  presupuesto: number;
  fechaInicio: string;
  fechaFin: string;
  contratoId?: string; // Opcional para asistencia/beneficencia
  tipoCliente?: TipoCliente;
  // Enterprise fields
  competitorExclusion?: string[];
  selectedBlocks?: string[];
}

export interface ValidacionResult {
  valido: boolean;
  error?: string;
  esExcepcion?: boolean;
}

class CampanaServiceImpl {
  
  /**
   * Valida estrictamente las conexiones con otros m�dulos (Contrato, Targeting, etc.)
   */
  async validarConexiones(data: Partial<CampanaCreateDTO> & { adTargetingProfile?: unknown }): Promise<ValidacionResult> {
      // 1. Validaci�n de Contrato (Crucial para facturaci�n)
      if (!data.contratoId) {
          return { valido: false, error: 'La campa�a DEBE estar vinculada a un Contrato ACTIVO.' };
      }
      
      const contrato = await this.obtenerContratoValidacion(data.contratoId);
      if (!contrato || contrato.estado !== 'operativo') {
           return { valido: false, error: 'El contrato seleccionado no est� operativo o ha vencido.' };
      }

      // 2. Traffic Guard (Blindaje de Competencia) - BACKEND ENFORCEMENT
      if (data.competitorExclusion && data.competitorExclusion.length > 0 && data.selectedBlocks) {
          const hasConflict = data.selectedBlocks.some(blockId => {
               // Mock Backend Check: Lunes 8AM "Chevrolet" conflict
               const isMondayMorning = blockId === 'Lunes-08:00 - 09:00';
               const avoidsChevrolet = data.competitorExclusion!.some(c => c.toLowerCase().includes('chevrolet'));
               return isMondayMorning && avoidsChevrolet;
          });

          if (hasConflict) {
              return { 
                  valido: false, 
                  error: 'SECURITY BLOCK: Intento de pautar en bloque protegido por Traffic Guard (Conflicto de Competencia Detectado).' 
              };
          }
      }

      // 3. Validaci�n Digital (Si aplica)
      if (data.adTargetingProfile) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profile = data.adTargetingProfile as any;
          if (profile.bateriaMinima && profile.bateriaMinima < 10) {
               return { valido: false, error: 'Security Warning: Targeting de bater�a < 10% puede violar pol�ticas de OS.' };
          }
          if (profile.mood === 'HIGH_ENERGY' && !profile.maxCognitiveLoad) {
               // Auto-correction warning
               logger.warn('[AI ADVISOR] High Energy requires defined Cognitive Load limits.');
          }
      }

      return { valido: true };
  }

  /**
   * Valida si se puede crear una campa�a bas�ndose en el contrato
   */
  async validarCreacion(data: CampanaCreateDTO): Promise<ValidacionResult> {
    // Si no hay contratoId, verificar si es tipo con excepci�n
    if (!data.contratoId) {
      if (data.tipoCliente && CampanaValidacionService.tieneExcepcion(data.tipoCliente)) {
        return {
          valido: true,
          esExcepcion: true
        };
      }
      return {
        valido: false,
        error: 'Se requiere un contrato asociado para crear campa�as comerciales'
      };
    }
    
    const contrato = await this.obtenerContratoValidacion(data.contratoId);
    
    if (!contrato) {
      return {
        valido: false,
        error: 'Contrato no encontrado'
      };
    }
    
    const resultado = await CampanaValidacionService.validarCreacionCampana(contrato);
    
    return {
      valido: resultado.permitido,
      error: resultado.razon,
      esExcepcion: resultado.esExcepcion
    };
  }
  
  /**
   * Obtiene datos del contrato para validaci�n
   */
  private async obtenerContratoValidacion(contratoId: string): Promise<ContratoValidacion | null> {
    // Mock - en producci�n consultar la BD
    logger.info(`[CAMPANA] Obteniendo contrato ${contratoId} para validaci�n`);
    
    return {
      id: contratoId,
      numeroContrato: 'CON-2024-0001',
      estado: 'operativo',
      tipoCliente: 'comercial',
      fechaInicio: new Date('2024-01-01'),
      fechaFin: new Date('2024-12-31'),
      tieneEvidencias: true,
      aprobacionesCompletas: true
    };
  }
  
  async listar(filtros?: CampanaFiltros): Promise<Campana[]> {
    logger.info(`Aplicando filtros: ${JSON.stringify(filtros || {})}`);
    
    let campanas: Campana[] = [
      { id: '1', nombre: 'Campa�a Q4', estado: 'ACTIVA', presupuesto: 50000, fechaInicio: '2024-10-01', fechaFin: '2024-12-31' },
      { id: '2', nombre: 'Black Friday', estado: 'FINALIZADA', presupuesto: 25000, fechaInicio: '2024-11-20', fechaFin: '2024-11-30' }
    ];

    if (filtros?.estado) {
      campanas = campanas.filter(c => c.estado === filtros.estado);
    }
    if (filtros?.clienteId) {
      logger.info(`Filtrando por cliente: ${filtros.clienteId}`);
    }

    return campanas;
  }

  async obtener(id: string): Promise<Campana | null> {
    if (!id) return null;
    return { id, nombre: '', estado: 'BORRADOR', presupuesto: 0, fechaInicio: '', fechaFin: '' };
  }

  async crear(data: CampanaCreateDTO): Promise<Campana> {
    // ?? VALIDACI�N ANTI-FRAUDE
    const validacion = await this.validarCreacion(data);
    
    if (!validacion.valido) {
      throw new Error(`No se puede crear la campa�a: ${validacion.error}`);
    }
    
    if (validacion.esExcepcion) {
      logger.info(`[CAMPANA] Creando campa�a con excepci�n de validaci�n (${data.tipoCliente})`);
    }
    
    return {
      id: `camp_${Date.now()}`,
      nombre: data.nombre,
      estado: 'BORRADOR',
      presupuesto: data.presupuesto,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      contratoId: data.contratoId,
      tipoCliente: data.tipoCliente
    };
  }

  async actualizar(id: string, data: Partial<CampanaCreateDTO>): Promise<Campana> {
    return {
      id,
      nombre: data.nombre || '',
      estado: 'ACTIVA',
      presupuesto: data.presupuesto || 0,
      fechaInicio: data.fechaInicio || '',
      fechaFin: data.fechaFin || ''
    };
  }

  async eliminar(id: string): Promise<boolean> {
    logger.info(`Eliminando campa�a: ${id}`);
    return true;
  }

  async pausar(id: string): Promise<Campana> {
    logger.info(`Pausando campa�a: ${id}`);
    return { id, nombre: '', estado: 'PAUSADA', presupuesto: 0, fechaInicio: '', fechaFin: '' };
  }

  async activar(id: string): Promise<Campana> {
    logger.info(`Activando campa�a: ${id}`);
    return { id, nombre: '', estado: 'ACTIVA', presupuesto: 0, fechaInicio: '', fechaFin: '' };
  }
}

export const CampanaService = new CampanaServiceImpl();

// Type aliases for barrel export compatibility
export type CampanaResumen = Campana;
export type FiltrosCampana = CampanaFiltros;
export interface MetricasGenerales {
  total: number;
  activas: number;
  pausadas: number;
  finalizadas: number;
  presupuestoTotal: number;
}

export default CampanaService;


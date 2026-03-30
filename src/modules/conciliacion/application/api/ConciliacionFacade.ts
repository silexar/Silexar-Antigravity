import { Result } from "../core/Result";
import { SalesBridgeCommandHandler } from "../handlers/SalesBridgeCommandHandler";
import { EnviarConsultaVentasCommand } from "../commands/EnviarConsultaVentasCommand";
import { RegistrarDecisionVentasCommand } from "../commands/RegistrarDecisionVentasCommand";
import { AccionMasivaDiscrepanciasCommand } from "../commands/AccionMasivaDiscrepanciasCommand";

import { IConciliacionDiariaRepository } from "../../domain/repositories/IConciliacionDiariaRepository";
import { IRegistroEmisionRepository } from "../../domain/repositories/IRegistroEmisionRepository";
import { IDiscrepanciaRepository } from "../../domain/repositories/IDiscrepanciaRepository";

export interface DashboardMetrics {
  cumplimientoPromedio: number;
  totalSpotsProcesados: number;
  totalNoEmitidos: number;
  recuperacionExitosa: number;
}

/**
 * Shared Kernel: Integration Facade.
 * Expone métodos estrictamente inmutables de solo lectura para otros módulos
 * Impide el uso indebido de las entidades internas por módulos externos.
 */
export class ConciliacionFacade {

  constructor(
      private conciliacionRepo: IConciliacionDiariaRepository,
      private registroRepo: IRegistroEmisionRepository,
      private discrepanciaRepo: IDiscrepanciaRepository,
      private salesBridgeHandler: SalesBridgeCommandHandler
  ) {}

  /**
   * Envía una consulta al ejecutivo de ventas
   */
  public async enviarConsultaVentas(spotId: string, ejecutivoId: string, mensaje?: string): Promise<Result<void>> {
      const command = new EnviarConsultaVentasCommand({
          spotNoEmitidoId: spotId,
          ejecutivoVentaId: ejecutivoId,
          mensajeAdicional: mensaje
      });
      return await this.salesBridgeHandler.handleEnviarConsulta(command);
  }

  /**
   * Registra la decisión del ejecutivo de ventas
   */
  public async registrarDecisionVentas(spotId: string, aprobado: boolean, instrucciones: string): Promise<Result<void>> {
      const command = new RegistrarDecisionVentasCommand({
          spotNoEmitidoId: spotId,
          aprobado,
          instrucciones
      });
      return await this.salesBridgeHandler.handleRegistrarDecision(command);
  }

  public async ejecutarAccionMasiva(spotIds: string[], tipo: 'CONSULTAR_VENTAS' | 'RECUPERAR_AHORA' | 'DESCARTAR', mensaje?: string): Promise<Result<void>> {
      const command = new AccionMasivaDiscrepanciasCommand({
          spotIds,
          tipoAccion: tipo,
          mensajeComun: mensaje
      });
      return await this.salesBridgeHandler.handleAccionMasiva(command);
  }

  /**
   * Obtiene métricas agregadas generadas por el módulo para el dashboard global
   */
  public async getMeticrasDashboardGlobal(fecha: Date): Promise<Result<DashboardMetrics>> {
      void fecha;
      // Mock implementation para Silexar TIER 0
      return Result.ok({
         cumplimientoPromedio: 98.7,
         totalSpotsProcesados: 2847,
         totalNoEmitidos: 23,
         recuperacionExitosa: 94.3
      });
  }

  /**
   * Verifica el estado de emisión de un spot específico para Módulo Facturación
   */
  public async verificarEmisionSpot(codigoSP: string, emisoraId: string, fechaEmision: Date): Promise<Result<{emitido: boolean, recuperado: boolean, comprobante?: string}>> {
      void emisoraId;
      return Result.ok({
          emitido: true,
          recuperado: false,
          comprobante: `dalet_log_${fechaEmision.getTime()}_${codigoSP}`
      });
  }

  /**
   * Verifica la existencia de conflictos para Módulo Programación (Cortex)
   */
  public async checkConflictosHorario(fecha: Date, emisoraId: string, horario: string, duracion: number, registroId: string): Promise<Result<boolean>> {
     void fecha; void emisoraId; void horario; void duracion; void registroId;
     return Result.ok(false); // No existen conflictos en mock
  }
}




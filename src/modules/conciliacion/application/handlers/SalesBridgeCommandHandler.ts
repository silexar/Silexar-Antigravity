import { Result, AppError } from "../core/Result";
import { logger } from '@/lib/observability';
import { EnviarConsultaVentasCommand, EnviarConsultaVentasSchema } from "../commands/EnviarConsultaVentasCommand";
import { RegistrarDecisionVentasCommand, RegistrarDecisionVentasSchema } from "../commands/RegistrarDecisionVentasCommand";
import { IDiscrepanciaRepository } from "../../domain/repositories/IDiscrepanciaRepository";
import { IConciliacionDiariaRepository } from "../../domain/repositories/IConciliacionDiariaRepository";
import { AccionMasivaDiscrepanciasCommand, AccionMasivaDiscrepanciasSchema } from "../commands/AccionMasivaDiscrepanciasCommand";


export class SalesBridgeCommandHandler {
  constructor(
    private conciliacionRepo: IConciliacionDiariaRepository,
    private discrepanciaRepo: IDiscrepanciaRepository
  ) {}

  /**
   * Tráfico envía la consulta al ejecutivo de ventas
   */
  public async handleEnviarConsulta(command: EnviarConsultaVentasCommand): Promise<Result<void>> {
    try {
      const validation = EnviarConsultaVentasSchema.safeParse(command);
      if (!validation.success) {
        return Result.fail(new AppError(validation.error.message, "VALIDATION_ERROR"));
      }

      // Encontrar la conciliación que contiene este spot no emitido
      // Para efectos del mock, buscamos en el repo de discrepancias directamente
      const spot = await this.discrepanciaRepo.findSpotById(command.spotNoEmitidoId);
      if (!spot) {
        return Result.fail(new AppError("Spot no emitido no encontrado", "NOT_FOUND"));
      }

      // Lógica de dominio
      spot.registrarConsultaVentas();

      // Persistir
      await this.discrepanciaRepo.saveSpot(spot);

      logger.info(`[SalesBridge] Consulta enviada a ejecutivo ${command.ejecutivoVentaId} para el spot ${command.spotNoEmitidoId}`);
      
      return Result.ok();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new AppError(`Error enviando consulta: ${message}`, "INTERNAL_ERROR"));
    }
  }

  /**
   * Se registra la decisión tomada por el ejecutivo (vía Tráfico o automatismo)
   */
  public async handleRegistrarDecision(command: RegistrarDecisionVentasCommand): Promise<Result<void>> {
    try {
      const validation = RegistrarDecisionVentasSchema.safeParse(command);
      if (!validation.success) {
        return Result.fail(new AppError(validation.error.message, "VALIDATION_ERROR"));
      }

      const spot = await this.discrepanciaRepo.findSpotById(command.spotNoEmitidoId);
      if (!spot) {
        return Result.fail(new AppError("Spot no emitido no encontrado", "NOT_FOUND"));
      }

      // Lógica de dominio
      spot.registrarDecisionVentas(command.aprobado, command.instrucciones);

      // Persistir
      await this.discrepanciaRepo.saveSpot(spot);

      logger.info(`[SalesBridge] Decisión registrada para spot ${command.spotNoEmitidoId}: ${command.aprobado ? 'APROBADO' : 'DESCARTADO'}`);

      return Result.ok();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new AppError(`Error registrando decisión: ${message}`, "INTERNAL_ERROR"));
    }
  }

  /**
   * Procesa múltiples discrepancias de una sola vez (Excelencia Operativa)
   */
  public async handleAccionMasiva(command: AccionMasivaDiscrepanciasCommand): Promise<Result<void>> {
    try {
      const validation = AccionMasivaDiscrepanciasSchema.safeParse(command);
      if (!validation.success) {
        return Result.fail(new AppError(validation.error.message, "VALIDATION_ERROR"));
      }

      logger.info(`[BulkAction] Procesando ${command.spotIds.length} spots con acción: ${command.tipoAccion}`);

      for (const id of command.spotIds) {
        const spot = await this.discrepanciaRepo.findSpotById(id);
        if (!spot) continue;

        if (command.tipoAccion === 'CONSULTAR_VENTAS') {
          spot.registrarConsultaVentas();
        } else if (command.tipoAccion === 'RECUPERAR_AHORA') {
          spot.marcarRecuperadoAutomatico();
        } else if (command.tipoAccion === 'DESCARTAR') {
          spot.registrarDecisionVentas(false, command.mensajeComun || "Descartado masivamente");
        }

        await this.discrepanciaRepo.saveSpot(spot);
      }

      return Result.ok();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new AppError(`Error en acción masiva: ${message}`, "INTERNAL_ERROR"));
    }
  }
}



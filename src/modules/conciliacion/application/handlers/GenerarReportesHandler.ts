import { IReporteCumplimientoRepository } from "../../domain/repositories/IReporteCumplimientoRepository";
import { logger } from '@/lib/observability';
import { GenerarReporteCumplimientoCommand } from "../commands/GenerarReporteCumplimientoCommand";
import { ReporteCumplimiento } from "../../domain/entities/ReporteCumplimiento";
import { MetricaCumplimiento } from "../../domain/value-objects/MetricaCumplimiento";
import { Result } from "../core/Result";

export class GenerarReportesHandler {
  constructor(
    private readonly reporteRepo: IReporteCumplimientoRepository
  ) {}

  public async execute(command: GenerarReporteCumplimientoCommand): Promise<Result<string>> {
    try {
      logger.info(`[Reporting] Generando reporte ${command.formato} para emisora: ${command.emisoraId}`);
      
      const reporte = ReporteCumplimiento.create({
        emisoraId: command.emisoraId,
        fecha: new Date(),
        cumplimientoGlobal: MetricaCumplimiento.create(98.5),
        totalProgramados: 100,
        totalEmitidos: 98,
        totalRecuperados: 2,
        generadoPor: command.usuarioId
      });

      await this.reporteRepo.save(reporte);
      return Result.ok(reporte.id);
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error.message : "Error en generación de reporte");
    }
  }
}

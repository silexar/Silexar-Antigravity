import { IMetricasEmisionRepository } from "../../domain/repositories/IMetricasEmisionRepository";
import { MetricasEmision } from "../../domain/entities/MetricasEmision";
import { MetricaCumplimiento } from "../../domain/value-objects/MetricaCumplimiento";
import { Result } from "../core/Result";

export class MetricasHandler {
  constructor(
    private readonly metricasRepo: IMetricasEmisionRepository
  ) {}

  public async actualizarMetricas(emisoraId: string, programados: number, noEmitidos: number, recuperados: number): Promise<Result<void>> {
    try {
      const cumplimiento = ((programados - noEmitidos + recuperados) / programados) * 100;
      
      const metricas = MetricasEmision.create({
        emisoraId,
        fecha: new Date(),
        cumplimientoActual: MetricaCumplimiento.create(cumplimiento),
        spotsProgramados: programados,
        spotsNoEmitidos: noEmitidos,
        spotsRecuperados: recuperados,
        eficienciaRecuperacion: (recuperados / noEmitidos) * 100
      });

      await this.metricasRepo.save(metricas);
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error.message : "Error actualizando métricas");
    }
  }
}

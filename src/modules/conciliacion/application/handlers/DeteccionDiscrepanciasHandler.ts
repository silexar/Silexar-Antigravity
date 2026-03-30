import { IConciliacionDiariaRepository } from "../../domain/repositories/IConciliacionDiariaRepository";
import { logger } from '@/lib/observability';
import { IDiscrepanciaRepository } from "../../domain/repositories/IDiscrepanciaRepository";
import { DetectarDiscrepanciasCommand } from "../commands/DetectarDiscrepanciasCommand";
import { DiscrepanciaEmision } from "../../domain/entities/DiscrepanciaEmision";
import { Result } from "../core/Result";
import { TipoDiscrepancia } from "../../domain/value-objects/TipoDiscrepancia";
import { CodigoSP } from "../../domain/value-objects/CodigoSP";
import { HorarioEmision } from "../../domain/value-objects/HorarioEmision";
import { DuracionSpot } from "../../domain/value-objects/DuracionSpot";

export class DeteccionDiscrepanciasHandler {
  constructor(
    private readonly conciliacionRepo: IConciliacionDiariaRepository,
    private readonly discrepanciaRepo: IDiscrepanciaRepository
  ) {}

  public async execute(command: DetectarDiscrepanciasCommand): Promise<Result<void>> {
    try {
      const conciliacion = await this.conciliacionRepo.findById(command.conciliacionId);
      if (!conciliacion) return Result.fail("Conciliación no encontrada");

      logger.info(`[DiscrepancyDetection] Procesando conciliación: ${command.conciliacionId}`);
      
      // Lógica de comparación...
      // Simulando detección de una discrepancia
      const nuevaDiscrepancia = DiscrepanciaEmision.create({
          codigoSP: CodigoSP.create("MOCK-SP-001"),
          tipo: TipoDiscrepancia.create('FALLA_TECNICA'),
          horarioProgramado: HorarioEmision.create("10:30:00"),
          duracionProgramada: DuracionSpot.create(30),
          detalles: "Detección automática TIER 0",
          resuelta: false,
      });

      await this.discrepanciaRepo.save(nuevaDiscrepancia, command.conciliacionId);
      
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error.message : "Error en detección");
    }
  }
}

import { IRecuperacionRepository } from "../../domain/repositories/IRecuperacionRepository";
import { logger } from '@/lib/observability';
import { ISpotNoEmitidoRepository } from "../../domain/repositories/ISpotNoEmitidoRepository";
import { RecuperarSpotsAutomaticoCommand } from "../commands/RecuperarSpotsAutomaticoCommand";
import { RecuperacionAutomatica } from "../../domain/entities/RecuperacionAutomatica";
import { Result } from "../core/Result";
import { CodigoSP } from "../../domain/value-objects/CodigoSP";
import { FechaConciliacion } from "../../domain/value-objects/FechaConciliacion";
import { ModoRecuperacion } from "../../domain/value-objects/ModoRecuperacion";
import { TipoRecuperacion } from "../../domain/value-objects/TipoRecuperacion";

export class RecuperacionAutomaticaHandler {
  constructor(
    private readonly recuperacionRepo: IRecuperacionRepository,
    private readonly spotRepo: ISpotNoEmitidoRepository
  ) {}

  public async execute(command: RecuperarSpotsAutomaticoCommand): Promise<Result<void>> {
    try {
      logger.info(`[AutoRecovery] Iniciando recuperación para ${command.spotIds.length} spots`);
      
      for (const spotId of command.spotIds) {
        const spot = await this.spotRepo.findById(spotId);
        if (!spot) continue;

        const recuperacion = RecuperacionAutomatica.create({
          codigoSP: CodigoSP.create(spot.codigoSP.value),
          fechaOriginal: FechaConciliacion.create(new Date()),
          fechaRecuperacion: new Date(),
          bloqueDestino: "PROGRAMADO_IA",
          modo: ModoRecuperacion.create('AUTOMATICO'),
          tipo: TipoRecuperacion.create('RECUPERACION_TECNICA')
        });

        await this.recuperacionRepo.saveAutomatica(recuperacion);
      }

      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error.message : "Error en recuperación automática");
    }
  }
}

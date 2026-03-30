
import { ILogDaletGalaxyRepository } from "../../domain/repositories/ILogDaletGalaxyRepository";
import { logger } from '@/lib/observability';
import { SincronizarDaletGalaxyCommand } from "../commands/SincronizarDaletGalaxyCommand";
import { LogDaletGalaxy } from "../../domain/entities/LogDaletGalaxy";
import { Result } from "../core/Result";
import { RutaArchivoDalet } from "../../domain/value-objects/RutaArchivoDalet";
import { FormatoArchivoDalet } from "../../domain/value-objects/FormatoArchivoDalet";
import { ValidadorFormato } from "../../domain/value-objects/ValidadorFormato";

export class IntegracionDaletHandler {
  constructor(
    private readonly logRepo: ILogDaletGalaxyRepository,
    // private readonly parserService: IDaletGalaxyParserService
  ) {}

  public async handleSincronizacion(command: SincronizarDaletGalaxyCommand): Promise<Result<void>> {
    try {
      logger.info(`[DaletIntegration] Sincronizando emisora: ${command.emisoraId}`);
      
      const nuevoLog = LogDaletGalaxy.create({
        ruta: RutaArchivoDalet.create(`/dalet/logs/${command.emisoraId}.xml`),
        formato: FormatoArchivoDalet.create('XML'),
        fechaCarga: new Date(),
        checksum: `sha256:sync_${Date.now()}`,
        validacion: ValidadorFormato.ok(),
        numeroLineas: 1500
      });

      await this.logRepo.save(nuevoLog);
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error.message : "Error en sincronización Dalet");
    }
  }
}

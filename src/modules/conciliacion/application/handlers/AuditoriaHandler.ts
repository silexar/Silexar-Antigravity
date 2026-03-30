import { IAuditoriaRecuperacionRepository } from "../../domain/repositories/IAuditoriaRecuperacionRepository";

import { AuditoriaRecuperacion } from "../../domain/entities/AuditoriaRecuperacion";
import { TrazabilidadCompleta } from "../../domain/value-objects/TrazabilidadCompleta";
import { Result } from "../core/Result";

export class AuditoriaHandler {
  constructor(
    private readonly auditoriaRepo: IAuditoriaRecuperacionRepository
  ) {}

  public async registrarAccion(recuperacionId: string, accion: string, usuarioId: string, metadata?: Record<string, unknown>): Promise<Result<void>> {
    try {
      const auditoria = AuditoriaRecuperacion.create({
        recuperacionId,
        tipoAccion: accion,
        usuarioId,
        trazabilidad: TrazabilidadCompleta.empty()
      });

      auditoria.registrarEvento(accion, usuarioId, metadata);
      await this.auditoriaRepo.save(auditoria);
      
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error.message : "Error en auditoría");
    }
  }
}

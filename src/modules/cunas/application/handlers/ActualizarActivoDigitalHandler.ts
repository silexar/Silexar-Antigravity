import { Result } from '@/modules/shared/domain/Result';
import { ActivoDigital } from '../../domain/entities/ActivoDigital';
import type { IActivoDigitalRepository } from '../../domain/repositories/IActivoDigitalRepository';
import type { ActualizarActivoDigitalCommand } from '../commands/ActualizarActivoDigitalCommand';

export class ActualizarActivoDigitalHandler {
  constructor(private readonly repository: IActivoDigitalRepository) { }

  async execute(command: ActualizarActivoDigitalCommand): Promise<Result<ActivoDigital, string>> {
    try {
      const { input } = command;

      // 1. Find the activo by id + tenantId
      const activo = await this.repository.findById(input.activoId, input.tenantId);
      if (!activo) {
        return Result.fail('Activo digital no encontrado');
      }

      // 2. Apply updates using entity methods
      if (input.urlOptimizada !== undefined && input.urlOptimizada !== null) {
        activo.asignarUrlOptimizada(input.urlOptimizada);
      }

      if (input.calidadScore !== undefined && input.scoreBrandSafety !== undefined) {
        activo.marcarValidacionExitosa(input.calidadScore, input.scoreBrandSafety);
      }

      if (input.plataformasDestino !== undefined) {
        activo.actualizarPlataformas(input.plataformasDestino as any);
      }

      if (input.fechaInicio !== undefined || input.fechaFin !== undefined) {
        activo.actualizarVigencia(
          input.fechaInicio ?? activo.fechaInicio,
          input.fechaFin ?? activo.fechaFin,
        );
      }

      // If only nombre (or urlThumbnail) changed, use actualizar
      const nombreChanged = input.nombre !== undefined && input.nombre !== activo.nombre;
      const urlThumbnailChanged = input.urlThumbnail !== undefined && input.urlThumbnail !== activo.urlThumbnail;
      if (nombreChanged || urlThumbnailChanged) {
        activo.actualizar({
          nombre: input.nombre,
          urlThumbnail: input.urlThumbnail,
        });
      }

      // 3. Save the activo
      await this.repository.save(activo);

      return Result.ok(activo);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al actualizar el activo digital';
      return Result.fail(msg);
    }
  }
}

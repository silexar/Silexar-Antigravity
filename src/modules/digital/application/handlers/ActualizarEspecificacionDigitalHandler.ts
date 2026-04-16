import { Result } from '@/lib/utils/result';
import { EspecificacionDigital } from '../../domain/entities/EspecificacionDigital';
import { IEspecificacionDigitalRepository } from '../../domain/repositories/IEspecificacionDigitalRepository';
import { ActualizarEspecificacionDigitalCommand } from '../commands/ActualizarEspecificacionDigitalCommand';

export class ActualizarEspecificacionDigitalHandler {
  constructor(private readonly repository: IEspecificacionDigitalRepository) {}

  async execute(command: ActualizarEspecificacionDigitalCommand): Promise<Result<EspecificacionDigital>> {
    try {
      const { input } = command;
      const existing = await this.repository.findById(input.id, input.tenantId);
      if (!existing) {
        return Result.fail('Especificacion digital no encontrada');
      }

      existing.actualizar({
        plataformas: input.plataformas,
        presupuestoDigital: input.presupuestoDigital ?? existing.presupuestoDigital,
        moneda: input.moneda ?? existing.moneda,
        tipoPresupuesto: input.tipoPresupuesto ?? existing.tipoPresupuesto,
        objetivos: input.objetivos ?? existing.objetivos,
        trackingLinks: input.trackingLinks ?? existing.trackingLinks,
        configuracionTargeting: input.configuracionTargeting ?? existing.configuracionTargeting,
        estado: input.estado ?? existing.estado,
        notas: input.notas ?? existing.notas,
      });

      await this.repository.update(existing);
      return Result.ok(existing);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al actualizar especificacion digital'));
    }
  }
}

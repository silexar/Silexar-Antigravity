import { Result } from '@/lib/utils/result';
import { EspecificacionDigital } from '../../domain/entities/EspecificacionDigital';
import { IEspecificacionDigitalRepository } from '../../domain/repositories/IEspecificacionDigitalRepository';
import { CrearEspecificacionDigitalCommand } from '../commands/CrearEspecificacionDigitalCommand';

export class CrearEspecificacionDigitalHandler {
  constructor(private readonly repository: IEspecificacionDigitalRepository) {}

  async execute(command: CrearEspecificacionDigitalCommand): Promise<Result<EspecificacionDigital>> {
    try {
      const { input } = command;
      const especificacion = EspecificacionDigital.create({
        tenantId: input.tenantId,
        campanaId: input.campanaId ?? null,
        contratoId: input.contratoId ?? null,
        plataformas: input.plataformas,
        presupuestoDigital: input.presupuestoDigital ?? null,
        moneda: input.moneda,
        tipoPresupuesto: input.tipoPresupuesto ?? null,
        objetivos: input.objetivos ?? null,
        trackingLinks: input.trackingLinks,
        configuracionTargeting: input.configuracionTargeting ?? null,
        estado: input.estado,
        notas: input.notas ?? null,
        creadoPorId: input.creadoPorId,
      });

      await this.repository.save(especificacion);
      return Result.ok(especificacion);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al crear especificacion digital'));
    }
  }
}

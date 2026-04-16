import { Result } from '@/lib/utils/result';
import { EspecificacionDigital } from '../../domain/entities/EspecificacionDigital';
import { IEspecificacionDigitalRepository } from '../../domain/repositories/IEspecificacionDigitalRepository';
import { ObtenerEspecificacionDigitalQuery } from '../queries/ObtenerEspecificacionDigitalQuery';

export class ObtenerEspecificacionDigitalHandler {
  constructor(private readonly repository: IEspecificacionDigitalRepository) {}

  async execute(query: ObtenerEspecificacionDigitalQuery): Promise<Result<EspecificacionDigital | null>> {
    try {
      const { id, campanaId, contratoId, tenantId } = query.input;
      let especificacion: EspecificacionDigital | null = null;

      if (id) {
        especificacion = await this.repository.findById(id, tenantId);
      } else if (campanaId) {
        especificacion = await this.repository.findByCampanaId(campanaId, tenantId);
      } else if (contratoId) {
        especificacion = await this.repository.findByContratoId(contratoId, tenantId);
      }

      return Result.ok(especificacion);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al obtener especificacion digital'));
    }
  }
}

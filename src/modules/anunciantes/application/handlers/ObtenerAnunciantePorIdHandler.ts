import { Result } from '@/lib/utils/result';
import { Anunciante } from '../../domain/entities/Anunciante';
import { IAnuncianteRepository } from '../../domain/repositories/IAnuncianteRepository';
import { ObtenerAnunciantePorIdQuery } from '../queries/ObtenerAnunciantePorIdQuery';

export class ObtenerAnunciantePorIdHandler {
  constructor(private readonly repository: IAnuncianteRepository) {}

  async execute(query: ObtenerAnunciantePorIdQuery): Promise<Result<Anunciante | null>> {
    try {
      const anunciante = await this.repository.findById(query.input.id, query.input.tenantId);
      return Result.ok(anunciante);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al obtener anunciante'));
    }
  }
}

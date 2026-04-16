import { Result } from '@/lib/utils/result';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';
import { IRrssPublicacionRepository } from '../../domain/repositories/IRrssPublicacionRepository';
import { ObtenerPublicacionRrssQuery } from '../queries/ObtenerPublicacionRrssQuery';

export class ObtenerPublicacionRrssHandler {
  constructor(private readonly repo: IRrssPublicacionRepository) {}

  async execute(query: ObtenerPublicacionRrssQuery): Promise<Result<RrssPublicacion | null>> {
    try {
      const pub = await this.repo.findPublicacionById(query.input.id, query.input.tenantId);
      return Result.ok(pub);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al obtener publicación RRSS');
    }
  }
}

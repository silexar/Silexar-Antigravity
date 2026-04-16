import { Result } from '@/lib/utils/result';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';
import { IRrssPublicacionRepository } from '../../domain/repositories/IRrssPublicacionRepository';
import { ListarPublicacionesRrssQuery } from '../queries/ListarPublicacionesRrssQuery';

export class ListarPublicacionesRrssHandler {
  constructor(private readonly repo: IRrssPublicacionRepository) {}

  async execute(query: ListarPublicacionesRrssQuery): Promise<Result<RrssPublicacion[]>> {
    try {
      const { input } = query;
      let publicaciones: RrssPublicacion[] = [];

      if (input.campanaId) {
        publicaciones = await this.repo.findByCampana(input.campanaId, input.tenantId);
      } else if (input.contratoId) {
        publicaciones = await this.repo.findByContrato(input.contratoId, input.tenantId);
      } else if (input.connectionId) {
        publicaciones = await this.repo.findByConnection(input.connectionId, input.tenantId);
      } else {
        publicaciones = await this.repo.findPublicacionesByTenant(input.tenantId, input.limit, input.offset);
      }

      if (input.estado) {
        publicaciones = publicaciones.filter((p) => p.estado === input.estado);
      }

      return Result.ok(publicaciones);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al listar publicaciones RRSS');
    }
  }
}

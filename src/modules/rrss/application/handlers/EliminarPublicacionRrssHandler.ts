import { Result } from '@/lib/utils/result';
import { IRrssPublicacionRepository } from '../../domain/repositories/IRrssPublicacionRepository';
import { EliminarPublicacionRrssCommand } from '../commands/EliminarPublicacionRrssCommand';

export class EliminarPublicacionRrssHandler {
  constructor(private readonly repo: IRrssPublicacionRepository) {}

  async execute(command: EliminarPublicacionRrssCommand): Promise<Result<void>> {
    try {
      const pub = await this.repo.findPublicacionById(command.input.id, command.input.tenantId);
      if (!pub) {
        return Result.fail('Publicación no encontrada');
      }
      if (pub.estado === 'publicada') {
        return Result.fail('No se puede eliminar una publicación ya publicada');
      }
      await this.repo.deletePublicacion(command.input.id, command.input.tenantId);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al eliminar publicación RRSS');
    }
  }
}

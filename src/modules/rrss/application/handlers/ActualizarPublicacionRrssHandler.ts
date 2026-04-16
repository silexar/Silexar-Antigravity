import { Result } from '@/lib/utils/result';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';
import { IRrssPublicacionRepository } from '../../domain/repositories/IRrssPublicacionRepository';
import { ActualizarPublicacionRrssCommand } from '../commands/ActualizarPublicacionRrssCommand';

export class ActualizarPublicacionRrssHandler {
  constructor(private readonly repo: IRrssPublicacionRepository) {}

  async execute(command: ActualizarPublicacionRrssCommand): Promise<Result<RrssPublicacion>> {
    try {
      const { input } = command;
      const pub = await this.repo.findPublicacionById(input.id, input.tenantId);
      if (!pub) {
        return Result.fail('Publicación no encontrada');
      }

      const actualizada = pub.actualizarDatos({
        connectionId: input.connectionId,
        campanaId: input.campanaId,
        contratoId: input.contratoId,
        contenido: input.contenido,
        hashtags: input.hashtags,
        mediaUrls: input.mediaUrls,
        estado: input.estado,
        scheduledAt: input.scheduledAt,
      });

      await this.repo.updatePublicacion(actualizada);
      return Result.ok(actualizada);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al actualizar publicación RRSS');
    }
  }
}

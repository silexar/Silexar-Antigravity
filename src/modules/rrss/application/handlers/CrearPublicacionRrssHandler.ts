import { Result } from '@/lib/utils/result';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';
import { IRrssPublicacionRepository } from '../../domain/repositories/IRrssPublicacionRepository';
import { CrearPublicacionRrssCommand } from '../commands/CrearPublicacionRrssCommand';
import { randomUUID } from 'crypto';

export class CrearPublicacionRrssHandler {
  constructor(private readonly repo: IRrssPublicacionRepository) {}

  async execute(command: CrearPublicacionRrssCommand): Promise<Result<RrssPublicacion>> {
    try {
      const { input } = command;
      const publicacion = RrssPublicacion.create({
        id: randomUUID(),
        tenantId: input.tenantId,
        connectionId: input.connectionId,
        campanaId: input.campanaId,
        contratoId: input.contratoId,
        contenido: input.contenido,
        hashtags: input.hashtags,
        mediaUrls: input.mediaUrls,
        estado: input.estado,
        scheduledAt: input.scheduledAt,
        creadoPorId: input.creadoPorId,
      });

      await this.repo.savePublicacion(publicacion);
      return Result.ok(publicacion);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al crear publicación RRSS');
    }
  }
}

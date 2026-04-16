import { Result } from '@/lib/utils/result';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';
import { IRrssPublicacionRepository } from '../../domain/repositories/IRrssPublicacionRepository';
import { IRrssConnectionRepository } from '../../domain/repositories/IRrssConnectionRepository';
import { PublicarAhoraRrssCommand } from '../commands/PublicarAhoraRrssCommand';
import { IRrssPublisherService } from '../services/IRrssPublisherService';

export class PublicarAhoraRrssHandler {
  constructor(
    private readonly pubRepo: IRrssPublicacionRepository,
    private readonly connRepo: IRrssConnectionRepository,
    private readonly publisher: IRrssPublisherService
  ) {}

  async execute(command: PublicarAhoraRrssCommand): Promise<Result<RrssPublicacion>> {
    try {
      const { input } = command;
      const pub = await this.pubRepo.findPublicacionById(input.id, input.tenantId);
      if (!pub) {
        return Result.fail('Publicación no encontrada');
      }

      if (!pub.estadoVO.esPublicable) {
        return Result.fail('La publicación no puede ser publicada en su estado actual');
      }

      const connection = await this.connRepo.findConnectionById(pub.connectionId, input.tenantId);
      if (!connection) {
        return Result.fail('Conexión RRSS no encontrada');
      }

      const result = await this.publisher.publish(connection, pub);

      if (!result.success) {
        const fallida = pub.marcarFallida(result.error || 'Error desconocido al publicar');
        await this.pubRepo.updatePublicacion(fallida);
        return Result.fail(result.error || 'Error al publicar');
      }

      const publicada = pub.marcarPublicada(result.externalPostId!, result.externalPostUrl);
      await this.pubRepo.updatePublicacion(publicada);
      return Result.ok(publicada);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al publicar RRSS');
    }
  }
}

import { IRrssPublicacionRepository } from '../../domain/repositories/IRrssPublicacionRepository';
import { IRrssConnectionRepository } from '../../domain/repositories/IRrssConnectionRepository';
import { IRrssPublisherService } from '../services/IRrssPublisherService';

export class ProcesarPublicacionesProgramadasHandler {
  constructor(
    private readonly pubRepo: IRrssPublicacionRepository,
    private readonly connRepo: IRrssConnectionRepository,
    private readonly publisher: IRrssPublisherService
  ) {}

  async execute(tenantId: string): Promise<{ procesadas: number; fallidas: number }> {
    const ahora = new Date();
    const pendientes = await this.pubRepo.findProgramadasPendientes(tenantId, ahora);

    let procesadas = 0;
    let fallidas = 0;

    for (const pub of pendientes) {
      try {
        const connection = await this.connRepo.findConnectionById(pub.connectionId, tenantId);
        if (!connection) {
          const fallida = pub.marcarFallida('Conexión no encontrada');
          await this.pubRepo.updatePublicacion(fallida);
          fallidas++;
          continue;
        }

        const result = await this.publisher.publish(connection, pub);

        if (!result.success) {
          const fallida = pub.marcarFallida(result.error || 'Error desconocido');
          await this.pubRepo.updatePublicacion(fallida);
          fallidas++;
        } else {
          const publicada = pub.marcarPublicada(result.externalPostId!, result.externalPostUrl);
          await this.pubRepo.updatePublicacion(publicada);
          procesadas++;
        }
      } catch {
        fallidas++;
      }
    }

    return { procesadas, fallidas };
  }
}

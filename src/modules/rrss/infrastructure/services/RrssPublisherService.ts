import { IRrssPublisherService, PublishResult } from '../../application/services/IRrssPublisherService';
import { RrssConnection } from '../../domain/entities/RrssConnection';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';
import { MetaGraphApiAdapter } from '../adapters/MetaGraphApiAdapter';
import { TikTokApiAdapter } from '../adapters/TikTokApiAdapter';
import { ICryptoTokenService } from '../../application/services/ICryptoTokenService';

export class RrssPublisherService implements IRrssPublisherService {
  private readonly metaAdapter: MetaGraphApiAdapter;
  private readonly tiktokAdapter: TikTokApiAdapter;

  constructor(cryptoService: ICryptoTokenService) {
    this.metaAdapter = new MetaGraphApiAdapter((token) => cryptoService.decrypt(token));
    this.tiktokAdapter = new TikTokApiAdapter((token) => cryptoService.decrypt(token));
  }

  async publish(connection: RrssConnection, publicacion: RrssPublicacion): Promise<PublishResult> {
    switch (connection.plataforma) {
      case 'instagram':
      case 'facebook':
        return this.metaAdapter.publish(connection, publicacion);
      case 'tiktok':
        return this.tiktokAdapter.publish(connection, publicacion);
      case 'linkedin':
      case 'twitter':
      case 'youtube':
        return {
          success: false,
          error: `Publicación directa para ${connection.plataforma} aún no implementada`,
        };
      default:
        return { success: false, error: 'Plataforma desconocida' };
    }
  }
}

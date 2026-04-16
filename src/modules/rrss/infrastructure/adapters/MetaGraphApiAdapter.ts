import { IRrssPublisherService, PublishResult } from '../../application/services/IRrssPublisherService';
import { RrssConnection } from '../../domain/entities/RrssConnection';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';

const META_GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

export class MetaGraphApiAdapter implements IRrssPublisherService {
  constructor(private readonly decryptToken: (cipher: any) => string) {}

  async publish(connection: RrssConnection, publicacion: RrssPublicacion): Promise<PublishResult> {
    const accessToken = this.decryptToken(connection.accessToken);

    try {
      if (connection.plataforma === 'instagram') {
        return await this.publishInstagram(connection.accountId, accessToken, publicacion);
      }

      if (connection.plataforma === 'facebook') {
        return await this.publishFacebook(connection.accountId, accessToken, publicacion);
      }

      return { success: false, error: 'Plataforma Meta no soportada por este adapter' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido en Meta Graph API',
      };
    }
  }

  private async publishInstagram(
    igUserId: string,
    accessToken: string,
    publicacion: RrssPublicacion
  ): Promise<PublishResult> {
    const caption = this.buildCaption(publicacion);
    const mediaUrl = publicacion.mediaUrls[0];

    if (!mediaUrl) {
      return { success: false, error: 'Instagram requiere al menos un archivo de media' };
    }

    const isVideo = mediaUrl.match(/\.(mp4|mov|avi)$/i);

    // Step 1: Crear media container
    const createUrl = `${META_GRAPH_API_BASE}/${igUserId}/media`;
    const createParams = new URLSearchParams({
      access_token: accessToken,
      caption,
    });

    if (isVideo) {
      createParams.set('media_type', 'REELS');
      createParams.set('video_url', mediaUrl);
    } else {
      createParams.set('image_url', mediaUrl);
    }

    const createRes = await fetch(`${createUrl}?${createParams.toString()}`, { method: 'POST' });
    const createData = await createRes.json();

    if (!createRes.ok || createData.error) {
      return {
        success: false,
        error: createData.error?.message || 'Error creando media container en Instagram',
      };
    }

    const creationId = createData.id;

    // Step 2: Publicar container
    const publishUrl = `${META_GRAPH_API_BASE}/${igUserId}/media_publish`;
    const publishParams = new URLSearchParams({
      access_token: accessToken,
      creation_id: creationId,
    });

    const publishRes = await fetch(`${publishUrl}?${publishParams.toString()}`, { method: 'POST' });
    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error) {
      return {
        success: false,
        error: publishData.error?.message || 'Error publicando en Instagram',
      };
    }

    return {
      success: true,
      externalPostId: publishData.id,
      externalPostUrl: `https://instagram.com/p/${publishData.id}`, // aproximado
    };
  }

  private async publishFacebook(
    pageId: string,
    accessToken: string,
    publicacion: RrssPublicacion
  ): Promise<PublishResult> {
    const caption = this.buildCaption(publicacion);
    const mediaUrl = publicacion.mediaUrls[0];

    let url: string;
    let params: URLSearchParams;

    if (mediaUrl) {
      const isVideo = mediaUrl.match(/\.(mp4|mov|avi)$/i);
      url = `${META_GRAPH_API_BASE}/${pageId}/${isVideo ? 'videos' : 'photos'}`;
      params = new URLSearchParams({
        access_token: accessToken,
        caption,
        [isVideo ? 'file_url' : 'url']: mediaUrl,
      });
    } else {
      url = `${META_GRAPH_API_BASE}/${pageId}/feed`;
      params = new URLSearchParams({
        access_token: accessToken,
        message: caption,
      });
    }

    const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' });
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Error publicando en Facebook',
      };
    }

    return {
      success: true,
      externalPostId: data.id || data.post_id,
      externalPostUrl: `https://facebook.com/${data.id || data.post_id}`,
    };
  }

  private buildCaption(publicacion: RrssPublicacion): string {
    const hashtags = publicacion.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
    return hashtags ? `${publicacion.contenido}\n\n${hashtags}` : publicacion.contenido;
  }
}

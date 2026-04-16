import { IRrssPublisherService, PublishResult } from '../../application/services/IRrssPublisherService';
import { RrssConnection } from '../../domain/entities/RrssConnection';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';

/**
 * TikTokApiAdapter
 *
 * NOTA: TikTok NO ofrece una API pública de publicación directa para cuentas
 * personales normales. La API de TikTok for Business / Content Publishing
 * requiere ser partner verificado y está limitada a cuentas de negocio.
 *
 * Este adapter implementa la estructura lista para cuando se obtenga acceso
 * a la API de publicación de TikTok (v2 Business API).
 */

const TIKTOK_API_BASE = 'https://open-api.tiktok.com';

export class TikTokApiAdapter implements IRrssPublisherService {
  constructor(private readonly decryptToken: (cipher: any) => string) {}

  async publish(connection: RrssConnection, publicacion: RrssPublicacion): Promise<PublishResult> {
    // Validación básica
    if (publicacion.mediaUrls.length === 0) {
      return { success: false, error: 'TikTok requiere un archivo de video' };
    }

    const videoUrl = publicacion.mediaUrls[0];
    const isVideo = videoUrl.match(/\.(mp4|mov|avi|webm)$/i);
    if (!isVideo) {
      return { success: false, error: 'TikTok solo acepta videos' };
    }

    const accessToken = this.decryptToken(connection.accessToken);

    try {
      // Stub: en una implementación real con TikTok Business API Partner,
      // aquí se haría el flujo de upload + publish.
      // Por ahora retornamos un error informativo para evitar falsos positivos.
      const result = await this.attemptDirectPublish(connection.accountId, accessToken, publicacion, videoUrl);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en TikTok API',
      };
    }
  }

  private async attemptDirectPublish(
    openId: string,
    accessToken: string,
    publicacion: RrssPublicacion,
    videoUrl: string
  ): Promise<PublishResult> {
    // Intento con TikTok Open API v2 (si está disponible para el tenant)
    const caption = this.buildCaption(publicacion);

    const initRes = await fetch(`${TIKTOK_API_BASE}/video/init/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        source_info: {
          source: 'PULL_FROM_URL',
          url: videoUrl,
        },
        title: caption.slice(0, 2200),
        privacy_level: 'PUBLIC',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      }),
    });

    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({}));
      return {
        success: false,
        error: err.error?.message || 'TikTok API no disponible o sin permisos de publicación directa',
      };
    }

    const data = await initRes.json();

    return {
      success: true,
      externalPostId: data.share_id || data.publish_id,
      externalPostUrl: data.share_url,
    };
  }

  private buildCaption(publicacion: RrssPublicacion): string {
    const hashtags = publicacion.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
    return hashtags ? `${publicacion.contenido}\n\n${hashtags}` : publicacion.contenido;
  }
}

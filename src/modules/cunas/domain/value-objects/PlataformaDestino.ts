/**
 * VALUE OBJECT: PlataformaDestino
 *
 * Representa una plataforma de destino para un activo digital
 * (Google DV360, Meta Ads, TikTok Ads, Spotify Ads, etc.)
 * con sus formatos soportados y requisitos técnicos.
 */

import { z } from 'zod';

export const PlataformaDestinoSchema = z.enum([
  'google_dv360',
  'google_ads',
  'google_youtube',
  'meta_ads',
  'instagram_ads',
  'tiktok_ads',
  'spotify_ads',
  'snapchat_ads',
  'linkedin_ads',
  'twitter_ads',
  'amazon_ads',
  'programmatic_rt',
  'site_direct',
  'in_app',
  'ctv_smart_tv',
  'podcast_iab',
  'audio_streaming',
  'universal' // Acepta cualquier plataforma
]);

export type PlataformaDestinoValor = z.infer<typeof PlataformaDestinoSchema>;

interface PlataformaConfig {
  nombre: string;
  familia: 'google' | 'meta' | 'tiktok' | 'spotify' | 'snapchat' | 'linkedin' | 'twitter' | 'amazon' | 'programmatic' | 'direct' | 'in_app' | 'ctv' | 'podcast' | 'audio' | 'universal';
  formatosSoportados: string[];
  tamanosMaximos: Record<string, number>; // MB
  requierePixelTracking: boolean;
  soportaVAST: boolean;
  soportaVPAID: boolean;
}

interface PlataformaDestinoProps {
  plataforma: PlataformaDestinoValor;
  config: PlataformaConfig;
}

export class PlataformaDestino {
  private static readonly PLATAFORMAS: Record<PlataformaDestinoValor, PlataformaConfig> = {
    google_dv360: {
      nombre: 'Google Display & Video 360',
      familia: 'google',
      formatosSoportados: ['banner', 'video', 'html5', 'audio'],
      tamanosMaximos: { banner: 2, video: 100, html5: 5, audio: 10 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: true,
    },
    google_ads: {
      nombre: 'Google Ads',
      familia: 'google',
      formatosSoportados: ['banner', 'video', 'html5', 'responsive'],
      tamanosMaximos: { banner: 2, video: 50, html5: 3, responsive: 2 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: false,
    },
    google_youtube: {
      nombre: 'YouTube Ads',
      familia: 'google',
      formatosSoportados: ['video'],
      tamanosMaximos: { video: 256 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: false,
    },
    meta_ads: {
      nombre: 'Meta Ads (Facebook)',
      familia: 'meta',
      formatosSoportados: ['banner', 'video', 'carousel', 'story', 'reel'],
      tamanosMaximos: { banner: 4, video: 500, carousel: 4, story: 4, reel: 500 },
      requierePixelTracking: true,
      soportaVAST: false,
      soportaVPAID: false,
    },
    instagram_ads: {
      nombre: 'Instagram Ads',
      familia: 'meta',
      formatosSoportados: ['banner', 'video', 'story', 'reel', 'carousel'],
      tamanosMaximos: { banner: 4, video: 500, story: 4, reel: 500, carousel: 4 },
      requierePixelTracking: true,
      soportaVAST: false,
      soportaVPAID: false,
    },
    tiktok_ads: {
      nombre: 'TikTok Ads',
      familia: 'tiktok',
      formatosSoportados: ['video', 'vertical', 'story'],
      tamanosMaximos: { video: 500, vertical: 500, story: 500 },
      requierePixelTracking: true,
      soportaVAST: false,
      soportaVPAID: false,
    },
    spotify_ads: {
      nombre: 'Spotify Ad Studio',
      familia: 'spotify',
      formatosSoportados: ['audio', 'banner_companion'],
      tamanosMaximos: { audio: 10, banner_companion: 1 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: false,
    },
    snapchat_ads: {
      nombre: 'Snapchat Ads',
      familia: 'snapchat',
      formatosSoportados: ['video', 'story', 'ar'],
      tamanosMaximos: { video: 500, story: 500, ar: 10 },
      requierePixelTracking: true,
      soportaVAST: false,
      soportaVPAID: false,
    },
    linkedin_ads: {
      nombre: 'LinkedIn Ads',
      familia: 'linkedin',
      formatosSoportados: ['banner', 'video', 'carousel', 'native'],
      tamanosMaximos: { banner: 5, video: 200, carousel: 5, native: 5 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: false,
    },
    twitter_ads: {
      nombre: 'X (Twitter) Ads',
      familia: 'twitter',
      formatosSoportados: ['banner', 'video', 'native'],
      tamanosMaximos: { banner: 3, video: 500, native: 3 },
      requierePixelTracking: true,
      soportaVAST: false,
      soportaVPAID: false,
    },
    amazon_ads: {
      nombre: 'Amazon Ads',
      familia: 'amazon',
      formatosSoportados: ['banner', 'video', 'html5', 'shoppable'],
      tamanosMaximos: { banner: 2, video: 100, html5: 3, shoppable: 3 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: true,
    },
    programmatic_rt: {
      nombre: 'Programmatic Real-Time Bidding',
      familia: 'programmatic',
      formatosSoportados: ['banner', 'video', 'html5', 'native', 'audio'],
      tamanosMaximos: { banner: 2, video: 50, html5: 3, native: 2, audio: 10 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: true,
    },
    site_direct: {
      nombre: 'Sitio Web Directo',
      familia: 'direct',
      formatosSoportados: ['banner', 'video', 'html5', 'native', 'interstitial'],
      tamanosMaximos: { banner: 5, video: 100, html5: 5, native: 5, interstitial: 5 },
      requierePixelTracking: false,
      soportaVAST: false,
      soportaVPAID: false,
    },
    in_app: {
      nombre: 'In-App Advertising',
      familia: 'in_app',
      formatosSoportados: ['banner', 'video', 'interstitial', 'playable', 'native'],
      tamanosMaximos: { banner: 1, video: 50, interstitial: 5, playable: 10, native: 2 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: false,
    },
    ctv_smart_tv: {
      nombre: 'Connected TV / Smart TV',
      familia: 'ctv',
      formatosSoportados: ['video', 'interactive'],
      tamanosMaximos: { video: 500, interactive: 10 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: true,
    },
    podcast_iab: {
      nombre: 'Podcast (IAB Standard)',
      familia: 'podcast',
      formatosSoportados: ['audio', 'banner_companion'],
      tamanosMaximos: { audio: 20, banner_companion: 1 },
      requierePixelTracking: false,
      soportaVAST: true,
      soportaVPAID: false,
    },
    audio_streaming: {
      nombre: 'Audio Streaming',
      familia: 'audio',
      formatosSoportados: ['audio', 'banner_companion', 'display_sync'],
      tamanosMaximos: { audio: 20, banner_companion: 1, display_sync: 2 },
      requierePixelTracking: true,
      soportaVAST: true,
      soportaVPAID: false,
    },
    universal: {
      nombre: 'Universal (Todas las plataformas)',
      familia: 'universal',
      formatosSoportados: ['banner', 'video', 'html5', 'audio', 'native', 'interactive', 'ar'],
      tamanosMaximos: { banner: 5, video: 500, html5: 5, audio: 20, native: 5, interactive: 10, ar: 50 },
      requierePixelTracking: false,
      soportaVAST: true,
      soportaVPAID: true,
    },
  };

  private constructor(private props: PlataformaDestinoProps) {}

  static create(plataforma: PlataformaDestinoValor): PlataformaDestino {
    return new PlataformaDestino({
      plataforma,
      config: PlataformaDestino.PLATAFORMAS[plataforma],
    });
  }

  static reconstitute(props: PlataformaDestinoProps): PlataformaDestino {
    return new PlataformaDestino(props);
  }

  static todas(): PlataformaDestino[] {
    return Object.keys(PlataformaDestino.PLATAFORMAS).map(
      (p) => PlataformaDestino.create(p as PlataformaDestinoValor)
    );
  }

  get plataforma(): PlataformaDestinoValor { return this.props.plataforma; }
  get config(): PlataformaConfig { return this.props.config; }
  get nombre(): string { return this.props.config.nombre; }
  get familia(): PlataformaConfig['familia'] { return this.props.config.familia; }
  get formatosSoportados(): string[] { return this.props.config.formatosSoportados; }
  get requierePixelTracking(): boolean { return this.props.config.requierePixelTracking; }
  get soportaVAST(): boolean { return this.props.config.soportaVAST; }
  get soportaVPAID(): boolean { return this.props.config.soportaVPAID; }

  /** Tamaño máximo permitido (en MB) para un formato dado */
  tamanosMaximo(formato: string): number | undefined {
    return this.props.config.tamanosMaximos[formato];
  }

  /** Verifica si la plataforma soporta un formato dado */
  soportaFormato(formato: string): boolean {
    return this.props.config.formatosSoportados.includes(formato);
  }

  toJSON(): PlataformaDestinoProps {
    return { ...this.props };
  }
}

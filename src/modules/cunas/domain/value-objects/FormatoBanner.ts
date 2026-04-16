/**
 * VALUE OBJECT: FormatoBanner
 *
 * Representa un formato estándar de banner publicitario digital.
 * Encapsula dimensiones, ratio y peso máximo recomendado.
 */

import { z } from 'zod';

export const FormatoBannerSchema = z.enum([
  '300x250',    // Medium Rectangle
  '300x600',    // Half Page
  '728x90',     // Leaderboard
  '970x250',    // Billboard
  '160x600',    // Wide Skyscraper
  '320x50',     // Mobile Banner
  '320x100',    // Mobile Large Banner
  '300x100',    // Mobile Rectangle
  '336x280',    // Large Rectangle
  '250x250',    // Square
  '970x90',     // Large Leaderboard
  '120x600',    // Skyscraper
  '300x50',     // Mobile MREC
  '480x320',    // Mobile Landscape
  '1024x768',   // Tablet
  'full_screen' // Full Screen Interstitial
]);

export type FormatoBannerValor = z.infer<typeof FormatoBannerSchema>;

interface FormatoBannerProps {
  formato: FormatoBannerValor;
  ancho: number;
  alto: number;
  aspectRatio: string;
  pesoMaximoKB: number;
}

export class FormatoBanner {
  private constructor(private props: FormatoBannerProps) {}

  static create(formato: FormatoBannerValor): FormatoBanner {
    const dimensiones = FormatoBanner.dimensionesPara(formato);
    return new FormatoBanner({
      formato,
      ancho: dimensiones.ancho,
      alto: dimensiones.alto,
      aspectRatio: `${dimensiones.ancho}:${dimensiones.alto}`,
      pesoMaximoKB: dimensiones.pesoMaximoKB,
    });
  }

  static reconstitute(props: FormatoBannerProps): FormatoBanner {
    return new FormatoBanner(props);
  }

  private static dimensionesPara(formato: FormatoBannerValor): { ancho: number; alto: number; pesoMaximoKB: number } {
    const mapa: Record<FormatoBannerValor, { ancho: number; alto: number; pesoMaximoKB: number }> = {
      '300x250': { ancho: 300, alto: 250, pesoMaximoKB: 150 },
      '300x600': { ancho: 300, alto: 600, pesoMaximoKB: 200 },
      '728x90': { ancho: 728, alto: 90, pesoMaximoKB: 150 },
      '970x250': { ancho: 970, alto: 250, pesoMaximoKB: 200 },
      '160x600': { ancho: 160, alto: 600, pesoMaximoKB: 150 },
      '320x50': { ancho: 320, alto: 50, pesoMaximoKB: 50 },
      '320x100': { ancho: 320, alto: 100, pesoMaximoKB: 80 },
      '300x100': { ancho: 300, alto: 100, pesoMaximoKB: 80 },
      '336x280': { ancho: 336, alto: 280, pesoMaximoKB: 150 },
      '250x250': { ancho: 250, alto: 250, pesoMaximoKB: 150 },
      '970x90': { ancho: 970, alto: 90, pesoMaximoKB: 150 },
      '120x600': { ancho: 120, alto: 600, pesoMaximoKB: 150 },
      '300x50': { ancho: 300, alto: 50, pesoMaximoKB: 50 },
      '480x320': { ancho: 480, alto: 320, pesoMaximoKB: 150 },
      '1024x768': { ancho: 1024, alto: 768, pesoMaximoKB: 300 },
      'full_screen': { ancho: 1080, alto: 1920, pesoMaximoKB: 500 },
    };
    return mapa[formato];
  }

  get formato(): FormatoBannerValor { return this.props.formato; }
  get ancho(): number { return this.props.ancho; }
  get alto(): number { return this.props.alto; }
  get aspectRatio(): string { return this.props.aspectRatio; }
  get pesoMaximoKB(): number { return this.props.pesoMaximoKB; }

  /** Verifica si unas dimensiones dadas coinciden con este formato */
  coincide(ancho: number, alto: number): boolean {
    return this.props.ancho === ancho && this.props.alto === alto;
  }

  toJSON(): FormatoBannerProps {
    return { ...this.props };
  }
}

/**
 * VALUE OBJECT: TipoVideo
 *
 * Representa un tipo de video publicitario digital con su posición,
 * duración recomendada y orientaciones soportadas.
 */

import { z } from 'zod';

export const TipoVideoSchema = z.enum([
  'preroll',       // Antes del contenido principal
  'midroll',       // Durante el contenido principal
  'bumper',        // Video corto no saltable (6s)
  'outstream',     // Video autónomo fuera de player
  'vertical',      // 9:16 para Stories/Reels/TikTok
  'square',        // 1:1 para feed social
  'horizontal',    // 16:9 estándar
  'live_pre_roll', // Pre-roll en streaming live
  'connected_tv',  // CTV / Smart TV
  'shoppable'      // Video con tags de compra
]);

export type TipoVideoValor = z.infer<typeof TipoVideoSchema>;

interface TipoVideoProps {
  tipo: TipoVideoValor;
  duracionRecomendada: number; // segundos
  duracionMaxima: number; // segundos
  orientaciones: string[]; // ['16:9', '9:16', '1:1']
  esSaltable: boolean;
}

export class TipoVideo {
  private constructor(private props: TipoVideoProps) {}

  static create(tipo: TipoVideoValor): TipoVideo {
    const config = TipoVideo.configPara(tipo);
    return new TipoVideo(config);
  }

  static reconstitute(props: TipoVideoProps): TipoVideo {
    return new TipoVideo(props);
  }

  private static configPara(tipo: TipoVideoValor): TipoVideoProps {
    const configs: Record<TipoVideoValor, TipoVideoProps> = {
      preroll: {
        tipo: 'preroll', duracionRecomendada: 15, duracionMaxima: 30,
        orientaciones: ['16:9', '9:16'], esSaltable: true,
      },
      midroll: {
        tipo: 'midroll', duracionRecomendada: 15, duracionMaxima: 60,
        orientaciones: ['16:9'], esSaltable: false,
      },
      bumper: {
        tipo: 'bumper', duracionRecomendada: 6, duracionMaxima: 6,
        orientaciones: ['16:9', '9:16', '1:1'], esSaltable: false,
      },
      outstream: {
        tipo: 'outstream', duracionRecomendada: 15, duracionMaxima: 30,
        orientaciones: ['1:1', '16:9'], esSaltable: true,
      },
      vertical: {
        tipo: 'vertical', duracionRecomendada: 15, duracionMaxima: 60,
        orientaciones: ['9:16'], esSaltable: true,
      },
      square: {
        tipo: 'square', duracionRecomendada: 15, duracionMaxima: 60,
        orientaciones: ['1:1'], esSaltable: true,
      },
      horizontal: {
        tipo: 'horizontal', duracionRecomendada: 15, duracionMaxima: 120,
        orientaciones: ['16:9'], esSaltable: true,
      },
      live_pre_roll: {
        tipo: 'live_pre_roll', duracionRecomendada: 15, duracionMaxima: 30,
        orientaciones: ['16:9'], esSaltable: true,
      },
      connected_tv: {
        tipo: 'connected_tv', duracionRecomendada: 15, duracionMaxima: 30,
        orientaciones: ['16:9'], esSaltable: true,
      },
      shoppable: {
        tipo: 'shoppable', duracionRecomendada: 30, duracionMaxima: 60,
        orientaciones: ['9:16', '16:9'], esSaltable: true,
      },
    };
    return configs[tipo];
  }

  get tipo(): TipoVideoValor { return this.props.tipo; }
  get duracionRecomendada(): number { return this.props.duracionRecomendada; }
  get duracionMaxima(): number { return this.props.duracionMaxima; }
  get orientaciones(): string[] { return this.props.orientaciones; }
  get esSaltable(): boolean { return this.props.esSaltable; }

  /** Verifica si una duración dada es válida para este tipo */
  duracionValida(segundos: number): boolean {
    return segundos <= this.props.duracionMaxima && segundos > 0;
  }

  toJSON(): TipoVideoProps {
    return { ...this.props };
  }
}

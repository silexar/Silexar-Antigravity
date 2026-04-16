/**
 * VALUE OBJECT: CALIDAD DE AUDIO — TIER 0
 *
 * Encapsula las especificaciones técnicas de un archivo de audio.
 * Determina si cumple estándares de broadcast radiofónico.
 *
 * Estándar mínimo broadcast: MP3 128kbps, 44100Hz, EBU R128 compliant.
 */

export type FormatoAudioValor = 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg';

const FORMATOS_BROADCAST: FormatoAudioValor[] = ['mp3', 'wav', 'aac', 'flac'];
const BITRATE_MINIMO = 128;       // kbps
const SAMPLE_RATE_MINIMO = 22050; // Hz
const BITRATE_RECOMENDADO = 320;  // kbps
const SAMPLE_RATE_RECOMENDADO = 44100; // Hz

export interface CalidadAudioProps {
  formato: FormatoAudioValor;
  bitrate: number;      // kbps
  sampleRate: number;   // Hz
  tamanoBytes?: number;
}

export class CalidadAudio {
  private constructor(private readonly props: CalidadAudioProps) {
    this.validate();
  }

  static create(props: CalidadAudioProps): CalidadAudio {
    return new CalidadAudio(props);
  }

  /** Instancia mínima válida para cuando no se ha procesado el audio */
  static desconocida(): CalidadAudio {
    return new CalidadAudio({ formato: 'mp3', bitrate: 128, sampleRate: 44100 });
  }

  private validate(): void {
    if (this.props.bitrate < BITRATE_MINIMO) {
      throw new Error(
        `Bitrate insuficiente: ${this.props.bitrate}kbps. ` +
        `El mínimo para broadcast es ${BITRATE_MINIMO}kbps.`
      );
    }
    if (this.props.sampleRate < SAMPLE_RATE_MINIMO) {
      throw new Error(
        `Sample rate insuficiente: ${this.props.sampleRate}Hz. ` +
        `El mínimo aceptable es ${SAMPLE_RATE_MINIMO}Hz.`
      );
    }
  }

  /** true si cumple los estándares mínimos de emisión radiofónica */
  esBroadcastReady(): boolean {
    return (
      FORMATOS_BROADCAST.includes(this.props.formato) &&
      this.props.bitrate >= BITRATE_MINIMO &&
      this.props.sampleRate >= SAMPLE_RATE_MINIMO
    );
  }

  /** true si cumple los estándares recomendados (calidad premium) */
  esCalidadOptima(): boolean {
    return (
      this.props.bitrate >= BITRATE_RECOMENDADO &&
      this.props.sampleRate >= SAMPLE_RATE_RECOMENDADO
    );
  }

  get formato(): FormatoAudioValor {
    return this.props.formato;
  }

  get bitrate(): number {
    return this.props.bitrate;
  }

  get sampleRate(): number {
    return this.props.sampleRate;
  }

  get tamanoBytes(): number | undefined {
    return this.props.tamanoBytes;
  }

  get tamanoMB(): number | undefined {
    return this.props.tamanoBytes !== undefined
      ? Math.round((this.props.tamanoBytes / 1024 / 1024) * 10) / 10
      : undefined;
  }

  toJSON(): CalidadAudioProps {
    return { ...this.props };
  }

  toString(): string {
    return `${this.props.formato.toUpperCase()} ${this.props.bitrate}kbps ${this.props.sampleRate}Hz`;
  }
}

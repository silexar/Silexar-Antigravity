/**
 * VALUE OBJECT: CALIDAD AUDIO - TIER 0
 * 
 * Representa las características técnicas de calidad de un archivo de audio.
 * Garantiza valores válidos y proporciona métodos para validación.
 */

export interface CalidadAudioProps {
  formato: 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'm4a';
  bitrate: number; // En kbps
  sampleRate: number; // En Hz
  tamanoBytes?: number;
}

export class CalidadAudio {
  private readonly _formato: CalidadAudioProps['formato'];
  private readonly _bitrate: number;
  private readonly _sampleRate: number;
  private readonly _tamanoBytes?: number;

  private constructor(props: CalidadAudioProps) {
    this._formato = this.validarFormato(props.formato);
    this._bitrate = this.validarBitrate(props.bitrate);
    this._sampleRate = this.validarSampleRate(props.sampleRate);
    this._tamanoBytes = props.tamanoBytes;
  }

  static create(props: CalidadAudioProps): CalidadAudio {
    return new CalidadAudio(props);
  }

  private validarFormato(formato: CalidadAudioProps['formato']): CalidadAudioProps['formato'] {
    const formatosValidos: CalidadAudioProps['formato'][] = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'];
    
    if (!formatosValidos.includes(formato)) {
      throw new Error(`Formato de audio no válido: ${formato}`);
    }
    
    return formato;
  }

  private validarBitrate(bitrate: number): number {
    if (bitrate <= 0) {
      throw new Error('El bitrate debe ser un número positivo');
    }
    
    if (bitrate < 64) {
      console.warn(`Bitrate muy bajo (${bitrate}kbps), puede afectar la calidad`);
    }
    
    if (bitrate > 320) {
      console.warn(`Bitrate superior al estándar de radio (${bitrate}kbps), podría ser innecesario`);
    }
    
    return bitrate;
  }

  private validarSampleRate(sampleRate: number): number {
    if (sampleRate <= 0) {
      throw new Error('La frecuencia de muestreo debe ser un número positivo');
    }
    
    // Frecuencias de muestreo comunes
    const frecuenciasValidas = [8000, 11025, 16000, 22050, 32000, 44100, 48000, 88200, 96000];
    
    if (!frecuenciasValidas.includes(sampleRate)) {
      console.warn(`Frecuencia de muestreo no estándar: ${sampleRate}Hz`);
    }
    
    return sampleRate;
  }

  get formato(): CalidadAudioProps['formato'] {
    return this._formato;
  }

  get bitrate(): number {
    return this._bitrate;
  }

  get sampleRate(): number {
    return this._sampleRate;
  }

  get tamanoBytes(): number | undefined {
    return this._tamanoBytes;
  }

  /**
   * Devuelve el tamaño estimado en bytes basado en duración
   */
  calcularTamanoEstimado(duracionSegundos: number): number {
    // Fórmula: (bitrate * 1000 * duración_en_segundos) / 8
    // Esto da el tamaño en bytes
    const tamanoEstimado = (this._bitrate * 1000 * duracionSegundos) / 8;
    return Math.round(tamanoEstimado);
  }

  /**
   * Verifica si la calidad es apta para emisión en radio
   */
  esAptaParaRadio(): boolean {
    // Para emisión en radio, generalmente se requiere:
    // - Bitrate mínimo de 128 kbps
    // - Frecuencia de muestreo de 44100 Hz o 48000 Hz
    // - Formato MP3 o AAC
    
    const bitrateApto = this._bitrate >= 128;
    const frecuenciaApta = [44100, 48000].includes(this._sampleRate);
    const formatoApto = ['mp3', 'aac'].includes(this._formato);
    
    return bitrateApto && frecuenciaApta && formatoApto;
  }

  /**
   * Verifica si la calidad es apta para streaming
   */
  esAptaParaStreaming(): boolean {
    // Para streaming, se requiere:
    // - Bitrate mínimo de 96 kbps
    // - Formato MP3, AAC o OGG
    
    const bitrateApto = this._bitrate >= 96;
    const formatoApto = ['mp3', 'aac', 'ogg'].includes(this._formato);
    
    return bitrateApto && formatoApto;
  }

  /**
   * Verifica si la calidad es apta para masterización
   */
  esAptaParaMasterizacion(): boolean {
    // Para masterización, se requiere:
    // - Bitrate alto (>= 256 kbps para compresión)
    // - Frecuencia de muestreo alta (>= 44100 Hz)
    // - Formato sin pérdida (WAV, FLAC)
    
    const bitrateApto = this._formato === 'mp3' || this._formato === 'aac' ? this._bitrate >= 256 : true;
    const frecuenciaApto = this._sampleRate >= 44100;
    const formatoApto = ['wav', 'flac'].includes(this._formato);
    
    return bitrateApto && frecuenciaApto && formatoApto;
  }

  /**
   * Devuelve un rating de calidad basado en los parámetros
   */
  getCalidadRating(): 'baja' | 'media' | 'alta' | 'profesional' {
    if (this._formato === 'mp3' && this._bitrate >= 320) {
      return 'profesional';
    } else if (this._formato === 'flac' || this._formato === 'wav') {
      return 'profesional';
    } else if (this._bitrate >= 256) {
      return 'alta';
    } else if (this._bitrate >= 128) {
      return 'media';
    } else {
      return 'baja';
    }
  }

  /**
   * Devuelve información legible sobre la calidad
   */
  getInfoCalidad(): string {
    return `${this._formato.toUpperCase()} ${this._bitrate}kbps ${this._sampleRate}Hz`;
  }

  /**
   * Compara con otra calidad de audio
   */
  equals(otra: CalidadAudio): boolean {
    return this._formato === otra._formato &&
           this._bitrate === otra._bitrate &&
           this._sampleRate === otra._sampleRate &&
           this._tamanoBytes === otra._tamanoBytes;
  }
}

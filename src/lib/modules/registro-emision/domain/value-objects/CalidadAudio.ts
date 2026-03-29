/**
 * 💎 VALUE OBJECT: CalidadAudio
 * 
 * Métricas técnicas de la calidad del audio procesado.
 * Importante para determinar falsos negativos por mala señal.
 * 
 * @tier TIER_0_ENTERPRISE
 */

export class CalidadAudio {
  constructor(
    public readonly bitrate: number, // kbps
    public readonly sampleRate: number, // Hz
    public readonly signalToNoiseRatio: number, // dB
    public readonly isClean: boolean
  ) {}

  public static estandar(): CalidadAudio {
    return new CalidadAudio(320, 44100, 90, true);
  }

  public esAceptableParaLegal(): boolean {
    return this.bitrate >= 128 && this.isClean;
  }
}

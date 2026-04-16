/**
 * VALUE OBJECT: TIEMPO DE LOCUCIÓN — TIER 0
 *
 * Calcula y encapsula el tiempo estimado de locución para menciones
 * y textos de auspicio. Basado en análisis de velocidad en WPM
 * estándar para radio comercial chilena.
 *
 * Referencia: 140-160 WPM para radio comercial (promedio: 150 WPM).
 */

const WPM_BASE_RADIO = 150; // Palabras por minuto estándar radio comercial

export class TiempoLocucion {
  private constructor(
    private readonly _segundosEstimados: number,
    private readonly _wpm: number,
    private readonly _palabras: number
  ) {}

  /**
   * Calcula el tiempo desde un texto y WPM opcional.
   * Si no se provee WPM, usa el estándar de radio comercial.
   */
  static calcularDesdeTexto(texto: string, wpmPersonalizado?: number): TiempoLocucion {
    const textoLimpio = texto
      .replace(/\[.*?\]/g, ' ') // Remover marcadores de énfasis/pausa
      .replace(/\s+/g, ' ')
      .trim();

    const palabras = textoLimpio.split(/\s+/).filter(Boolean).length;
    const wpm = wpmPersonalizado ?? WPM_BASE_RADIO;

    // Ajuste por complejidad: números, marcas, palabras extranjeras
    const tieneNumeros = /\d/.test(texto);
    const tieneSiglas = /[A-Z]{2,}/.test(texto);
    const wpmAjustado = wpm - (tieneNumeros ? 10 : 0) - (tieneSiglas ? 5 : 0);

    // Añadir pausas explícitas [PAUSA:Xs]
    const pausasMatch = texto.match(/\[PAUSA:(\d+(?:\.\d+)?)s?\]/g) ?? [];
    const segundosPausas = pausasMatch.reduce((acc, pausa) => {
      const segundos = parseFloat(pausa.replace(/\[PAUSA:|s?\]/g, ''));
      return acc + (isNaN(segundos) ? 0 : segundos);
    }, 0);

    const segundosBase = (palabras / Math.max(wpmAjustado, 60)) * 60;
    const segundosTotales = Math.ceil(segundosBase + segundosPausas);

    return new TiempoLocucion(Math.max(segundosTotales, 1), wpmAjustado, palabras);
  }

  /** Crea desde un tiempo ya conocido (por ejemplo, del DB) */
  static fromSegundos(segundos: number): TiempoLocucion {
    return new TiempoLocucion(Math.max(segundos, 1), WPM_BASE_RADIO, 0);
  }

  get segundosEstimados(): number {
    return this._segundosEstimados;
  }

  get wpm(): number {
    return this._wpm;
  }

  get palabras(): number {
    return this._palabras;
  }

  /** Rango de tiempo estimado con ±10% de variación natural de locución */
  get rangoSegundos(): { min: number; max: number } {
    return {
      min: Math.max(1, Math.floor(this._segundosEstimados * 0.9)),
      max: Math.ceil(this._segundosEstimados * 1.1),
    };
  }

  toString(): string {
    return `${this._segundosEstimados}s (~${this._wpm} WPM)`;
  }
}

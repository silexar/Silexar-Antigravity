/**
 * 💎 VALUE OBJECT: PorcentajeCoincidencia
 * 
 * Representa la precisión de una coincidencia de audio.
 * Garantiza que el valor esté siempre entre 0 y 100.
 * Inmutable.
 * 
 * @tier TIER_0_ENTERPRISE
 */

export class PorcentajeCoincidencia {
  private readonly value: number;

  private constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error(`El porcentaje de coincidencia debe estar entre 0 y 100. Valor recibido: ${value}`);
    }
    this.value = value;
  }

  public static from(value: number): PorcentajeCoincidencia {
    return new PorcentajeCoincidencia(value);
  }

  public toValue(): number {
    return this.value;
  }

  public esAltaPrecision(): boolean {
    return this.value >= 95;
  }

  public esCoincidenciaValida(umbral: number = 80): boolean {
    return this.value >= umbral;
  }

  public toString(): string {
    return `${this.value.toFixed(2)}%`;
  }
}

/**
 * VALUE OBJECT: METODOLOGIA VENTA
 * 
 * @description Define la metodología de venta utilizada por el equipo o vendedor.
 * Ejemplos: SPIN, MEDIC, CHALLENGER, SOLUTION_SELLING.
 */

export type TipoMetodologia = 'SPIN' | 'MEDDIC' | 'CHALLENGER' | 'SOLUTION_SELLING' | 'SANDLER' | 'CONSULTATIVE';

export class MetodologiaVenta {
  private constructor(
    public readonly tipo: TipoMetodologia,
    public readonly nivelAdopcion: number, // 0-100
    public readonly fechaCertificacion?: Date
  ) {}

  public static create(tipo: TipoMetodologia, nivelAdopcion: number = 0): MetodologiaVenta {
    if (nivelAdopcion < 0 || nivelAdopcion > 100) {
      throw new Error("El nivel de adopción debe estar entre 0 y 100");
    }
    return new MetodologiaVenta(tipo, nivelAdopcion);
  }

  public esExperto(): boolean {
    return this.nivelAdopcion >= 90;
  }
}

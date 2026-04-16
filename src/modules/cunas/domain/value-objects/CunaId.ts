/**
 * VALUE OBJECT: CUNA ID — TIER 0
 *
 * Encapsula el código único de cuña en formato SPX000000.
 * Inmutable. Validado en construcción.
 */

export class CunaId {
  private static readonly PATTERN = /^SPX\d{6}$/;

  private constructor(private readonly _valor: string) {
    this.validate();
  }

  /** Crea un CunaId desde un código ya reservado (por ejemplo, desde DB) */
  static fromString(valor: string): CunaId {
    return new CunaId(valor);
  }

  /** Construye el código a partir del número secuencial */
  static fromSequence(sequence: number): CunaId {
    if (sequence < 1 || sequence > 999999) {
      throw new Error(`Secuencia fuera de rango: ${sequence}. Debe ser entre 1 y 999999.`);
    }
    return new CunaId(`SPX${sequence.toString().padStart(6, '0')}`);
  }

  private validate(): void {
    if (!CunaId.PATTERN.test(this._valor)) {
      throw new Error(
        `Formato de ID de cuña inválido: "${this._valor}". Debe ser SPX seguido de 6 dígitos (ej: SPX001847).`
      );
    }
  }

  get valor(): string {
    return this._valor;
  }

  get sequence(): number {
    return parseInt(this._valor.slice(3), 10);
  }

  equals(other: CunaId): boolean {
    return this._valor === other._valor;
  }

  toString(): string {
    return this._valor;
  }
}

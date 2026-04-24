/**
 * VALUE OBJECT: CUNA ID - TIER 0
 * 
 * Representa el identificador único de una cuña en formato SPX000000.
 * Garantiza formato correcto y unicidad.
 */

export class CunaId {
  private static readonly PATTERN = /^SPX\d{6}$/;

  private readonly _valor: string;

  private constructor(valor: string) {
    this._valor = this.validateAndFormat(valor);
  }

  static create(valor: string): CunaId {
    return new CunaId(valor);
  }

  static fromString(valor: string): CunaId {
    return new CunaId(valor);
  }

  static fromSequence(sequence: number): CunaId {
    if (sequence < 1 || sequence > 999999) {
      throw new Error(`Secuencia fuera de rango: ${sequence}. Debe ser entre 1 y 999999.`);
    }
    const formattedSequence = sequence.toString().padStart(6, '0');
    return new CunaId(`SPX${formattedSequence}`);
  }

  private validateAndFormat(valor: string): string {
    // Validar formato SPX000000 (SPX seguido de 6 dígitos)
    if (!CunaId.PATTERN.test(valor)) {
      throw new Error(`Formato de ID de cuña inválido: ${valor}. Debe ser SPX seguido de 6 dígitos.`);
    }
    
    return valor;
  }

  get valor(): string {
    return this._valor;
  }

  get secuencia(): number {
    // Extraer los 6 dígitos del final
    const numero = parseInt(this._valor.substring(3), 10);
    return numero;
  }

  toString(): string {
    return this._valor;
  }

  /**
   * Verifica si este ID es igual a otro
   */
  equals(other: CunaId): boolean {
    return this._valor === other._valor;
  }

  /**
   * Verifica si este ID representa una secuencia posterior a otro
   */
  esMayorQue(other: CunaId): boolean {
    return this.secuencia > other.secuencia;
  }

  /**
   * Verifica si este ID representa una secuencia anterior a otro
   */
  esMenorQue(other: CunaId): boolean {
    return this.secuencia < other.secuencia;
  }
}

/**
 * NumeroCampana — Value Object
 * Formato: CAMP-{YYYY}-{NNNNN} (ej: CAMP-2025-00123)
 */
export class NumeroCampana {
  private static readonly FORMATO = /^CAMP-\d{4}-\d{5}$/;

  private constructor(private readonly _valor: string) {
    Object.freeze(this);
  }

  static crear(valor: string): NumeroCampana {
    if (!NumeroCampana.FORMATO.test(valor)) {
      throw new Error(`Número de campaña inválido: ${valor}. Formato esperado: CAMP-YYYY-NNNNN`);
    }
    return new NumeroCampana(valor);
  }

  static generar(anio: number, secuencial: number): NumeroCampana {
    const seq = String(secuencial).padStart(5, '0');
    return new NumeroCampana(`CAMP-${anio}-${seq}`);
  }

  get valor(): string { return this._valor; }
  toString(): string  { return this._valor; }
  equals(other: NumeroCampana): boolean { return this._valor === other._valor; }
}

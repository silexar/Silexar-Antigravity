/**
 * HashSHA256 — Value Object
 * Representa un hash SHA-256 hexadecimal de 64 caracteres.
 */

export class HashSHA256 {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  static crear(value: string): HashSHA256 {
    const normalizado = value.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(normalizado)) {
      throw new Error(`Hash SHA-256 inválido: ${value}`);
    }
    return new HashSHA256(normalizado);
  }

  static generarDesdeContenidoSync?(contenido: string): HashSHA256 {
    // Placeholder para uso futuro con crypto
    throw new Error('HashSHA256.generarDesdeContenidoSync no implementado');
  }

  get valor(): string { return this._value; }

  toString(): string { return this._value; }
  equals(other: HashSHA256): boolean { return this._value === other._value; }
}

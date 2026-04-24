/**
 * CodigoAcceso — Value Object
 * Código numérico o alfanumérico que el cliente ingresa para acceder a evidencias.
 */

export class CodigoAcceso {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  static crear(value: string): CodigoAcceso {
    const limpio = value.trim().toUpperCase();
    if (limpio.length < 4 || limpio.length > 12) {
      throw new Error(`Código de acceso inválido: debe tener entre 4 y 12 caracteres`);
    }
    if (!/^[A-Z0-9]+$/.test(limpio)) {
      throw new Error(`Código de acceso inválido: solo letras mayúsculas y números`);
    }
    return new CodigoAcceso(limpio);
  }

  static generar(longitud = 6): CodigoAcceso {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusión
    let codigo = '';
    for (let i = 0; i < longitud; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return new CodigoAcceso(codigo);
  }

  get valor(): string { return this._value; }

  toString(): string { return this._value; }
  equals(other: CodigoAcceso): boolean { return this._value === other._value; }
}

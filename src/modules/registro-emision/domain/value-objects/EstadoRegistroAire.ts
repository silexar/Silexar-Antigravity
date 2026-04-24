/**
 * EstadoRegistroAire — Value Object
 * Estados posibles de una grabación de aire.
 */

export type EstadoRegistroAireValue = 'pendiente' | 'procesando' | 'procesado' | 'error';

const TRANSICIONES_VALIDAS: Record<EstadoRegistroAireValue, EstadoRegistroAireValue[]> = {
  pendiente:   ['procesando'],
  procesando:  ['procesado', 'error'],
  procesado:   [],
  error:       ['procesando'],
};

export class EstadoRegistroAire {
  private constructor(private readonly _value: EstadoRegistroAireValue) {
    Object.freeze(this);
  }

  static crear(value: string): EstadoRegistroAire {
    const estados: EstadoRegistroAireValue[] = ['pendiente', 'procesando', 'procesado', 'error'];
    if (!estados.includes(value as EstadoRegistroAireValue)) {
      throw new Error(`Estado de registro de aire inválido: ${value}`);
    }
    return new EstadoRegistroAire(value as EstadoRegistroAireValue);
  }

  static pendiente(): EstadoRegistroAire   { return new EstadoRegistroAire('pendiente'); }
  static procesando(): EstadoRegistroAire  { return new EstadoRegistroAire('procesando'); }
  static procesado(): EstadoRegistroAire   { return new EstadoRegistroAire('procesado'); }
  static error(): EstadoRegistroAire       { return new EstadoRegistroAire('error'); }

  puedeTransicionarA(siguiente: EstadoRegistroAireValue): boolean {
    return TRANSICIONES_VALIDAS[this._value].includes(siguiente);
  }

  get valor(): EstadoRegistroAireValue     { return this._value; }
  get esPendiente(): boolean               { return this._value === 'pendiente'; }
  get esProcesando(): boolean              { return this._value === 'procesando'; }
  get esProcesado(): boolean               { return this._value === 'procesado'; }
  get esError(): boolean                   { return this._value === 'error'; }

  toString(): string { return this._value; }
  equals(other: EstadoRegistroAire): boolean { return this._value === other._value; }
}

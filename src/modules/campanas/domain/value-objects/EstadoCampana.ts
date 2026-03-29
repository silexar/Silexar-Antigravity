/**
 * EstadoCampana — Value Object
 * Encapsula el estado de una campaña con reglas de transición válidas.
 */

export type EstadoCampanaValue = 'BORRADOR' | 'ACTIVA' | 'PAUSADA' | 'FINALIZADA' | 'CANCELADA';

const TRANSICIONES_VALIDAS: Record<EstadoCampanaValue, EstadoCampanaValue[]> = {
  BORRADOR:   ['ACTIVA', 'CANCELADA'],
  ACTIVA:     ['PAUSADA', 'FINALIZADA', 'CANCELADA'],
  PAUSADA:    ['ACTIVA', 'FINALIZADA', 'CANCELADA'],
  FINALIZADA: [],
  CANCELADA:  [],
};

export class EstadoCampana {
  private constructor(private readonly _value: EstadoCampanaValue) {
    Object.freeze(this);
  }

  static crear(value: string): EstadoCampana {
    const estados: EstadoCampanaValue[] = ['BORRADOR', 'ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA'];
    if (!estados.includes(value as EstadoCampanaValue)) {
      throw new Error(`Estado de campaña inválido: ${value}`);
    }
    return new EstadoCampana(value as EstadoCampanaValue);
  }

  static borrador(): EstadoCampana { return new EstadoCampana('BORRADOR'); }
  static activa(): EstadoCampana   { return new EstadoCampana('ACTIVA'); }
  static pausada(): EstadoCampana  { return new EstadoCampana('PAUSADA'); }

  puedeTransicionarA(siguiente: EstadoCampanaValue): boolean {
    return TRANSICIONES_VALIDAS[this._value].includes(siguiente);
  }

  get valor(): EstadoCampanaValue { return this._value; }
  get esBorrador(): boolean       { return this._value === 'BORRADOR'; }
  get estaActiva(): boolean       { return this._value === 'ACTIVA'; }
  get estaPausada(): boolean      { return this._value === 'PAUSADA'; }
  get estaFinalizada(): boolean   { return this._value === 'FINALIZADA'; }
  get estaCancelada(): boolean    { return this._value === 'CANCELADA'; }
  get estaTerminada(): boolean    { return this._value === 'FINALIZADA' || this._value === 'CANCELADA'; }

  toString(): string { return this._value; }
  equals(other: EstadoCampana): boolean { return this._value === other._value; }
}

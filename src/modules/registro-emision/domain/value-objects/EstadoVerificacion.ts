/**
 * EstadoVerificacion — Value Object
 * Estados posibles de una verificación de emisión.
 */

export type EstadoVerificacionValue =
  | 'pendiente'
  | 'en_proceso'
  | 'completada'
  | 'parcial'
  | 'fallida';

const TRANSICIONES_VALIDAS: Record<EstadoVerificacionValue, EstadoVerificacionValue[]> = {
  pendiente:   ['en_proceso'],
  en_proceso:  ['completada', 'parcial', 'fallida'],
  completada:  [],
  parcial:     [],
  fallida:     [],
};

export class EstadoVerificacion {
  private constructor(private readonly _value: EstadoVerificacionValue) {
    Object.freeze(this);
  }

  static crear(value: string): EstadoVerificacion {
    const estados: EstadoVerificacionValue[] = ['pendiente', 'en_proceso', 'completada', 'parcial', 'fallida'];
    if (!estados.includes(value as EstadoVerificacionValue)) {
      throw new Error(`Estado de verificación inválido: ${value}`);
    }
    return new EstadoVerificacion(value as EstadoVerificacionValue);
  }

  static pendiente(): EstadoVerificacion   { return new EstadoVerificacion('pendiente'); }
  static enProceso(): EstadoVerificacion   { return new EstadoVerificacion('en_proceso'); }
  static completada(): EstadoVerificacion  { return new EstadoVerificacion('completada'); }
  static parcial(): EstadoVerificacion     { return new EstadoVerificacion('parcial'); }
  static fallida(): EstadoVerificacion     { return new EstadoVerificacion('fallida'); }

  puedeTransicionarA(siguiente: EstadoVerificacionValue): boolean {
    return TRANSICIONES_VALIDAS[this._value].includes(siguiente);
  }

  get valor(): EstadoVerificacionValue     { return this._value; }
  get esPendiente(): boolean               { return this._value === 'pendiente'; }
  get esEnProceso(): boolean               { return this._value === 'en_proceso'; }
  get estaFinalizada(): boolean            { return this._value === 'completada' || this._value === 'parcial' || this._value === 'fallida'; }

  toString(): string { return this._value; }
  equals(other: EstadoVerificacion): boolean { return this._value === other._value; }
}

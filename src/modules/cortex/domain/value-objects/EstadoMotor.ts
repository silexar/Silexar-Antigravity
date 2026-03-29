/**
 * EstadoMotor — Value Object
 * Estado operacional de un motor Cortex AI.
 */

export type EstadoMotorValue = 'INICIALIZANDO' | 'ACTIVO' | 'DEGRADADO' | 'DETENIDO' | 'ERROR';

const TRANSICIONES_VALIDAS: Record<EstadoMotorValue, EstadoMotorValue[]> = {
  INICIALIZANDO: ['ACTIVO', 'ERROR'],
  ACTIVO:        ['DEGRADADO', 'DETENIDO', 'ERROR'],
  DEGRADADO:     ['ACTIVO', 'DETENIDO', 'ERROR'],
  DETENIDO:      ['INICIALIZANDO'],
  ERROR:         ['INICIALIZANDO', 'DETENIDO'],
};

export class EstadoMotor {
  private constructor(private readonly _value: EstadoMotorValue) {
    Object.freeze(this);
  }

  static crear(value: string): EstadoMotor {
    const valid: EstadoMotorValue[] = ['INICIALIZANDO', 'ACTIVO', 'DEGRADADO', 'DETENIDO', 'ERROR'];
    if (!valid.includes(value as EstadoMotorValue)) {
      throw new Error(`Estado de motor inválido: ${value}`);
    }
    return new EstadoMotor(value as EstadoMotorValue);
  }

  static activo(): EstadoMotor      { return new EstadoMotor('ACTIVO'); }
  static inicializando(): EstadoMotor { return new EstadoMotor('INICIALIZANDO'); }
  static detenido(): EstadoMotor    { return new EstadoMotor('DETENIDO'); }

  puedeTransicionarA(siguiente: EstadoMotorValue): boolean {
    return TRANSICIONES_VALIDAS[this._value].includes(siguiente);
  }

  get valor(): EstadoMotorValue   { return this._value; }
  get estaActivo(): boolean       { return this._value === 'ACTIVO'; }
  get estaDegradado(): boolean    { return this._value === 'DEGRADADO'; }
  get estaDetenido(): boolean     { return this._value === 'DETENIDO'; }
  get tieneError(): boolean       { return this._value === 'ERROR'; }
  get estaOperacional(): boolean  { return this._value === 'ACTIVO' || this._value === 'DEGRADADO'; }

  toString(): string { return this._value; }
  equals(other: EstadoMotor): boolean { return this._value === other._value; }
}

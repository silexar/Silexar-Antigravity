import { z } from "zod";

export type EstadoConciliacionValue = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADA' | 'ERROR';

export class EstadoConciliacion {
  private readonly _value: EstadoConciliacionValue;

  private constructor(value: EstadoConciliacionValue) {
    this._value = value;
  }

  public get value(): EstadoConciliacionValue {
    return this._value;
  }

  public static create(value: string): EstadoConciliacion {
    const schema = z.enum(['PENDIENTE', 'PROCESANDO', 'COMPLETADA', 'ERROR']);
    const validValue = schema.parse(value);
    return new EstadoConciliacion(validValue);
  }

  public isFinalized(): boolean {
    return this._value === 'COMPLETADA' || this._value === 'ERROR';
  }

  public equals(other: EstadoConciliacion): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}

import { z } from "zod";

export type EstadoEmisionType = 'EMITIDO' | 'NO_EMITIDO' | 'RECUPERADO_AUTO' | 'RECUPERADO_MANUAL' | 'PENDIENTE_MANUAL' | 'PROGRAMADO';

export class EstadoEmision {
  private readonly _value: EstadoEmisionType;

  private constructor(value: EstadoEmisionType) {
    this._value = value;
  }

  public get value(): EstadoEmisionType {
    return this._value;
  }

  public static create(value: string): EstadoEmision {
    const schema = z.enum(['EMITIDO', 'NO_EMITIDO', 'RECUPERADO_AUTO', 'RECUPERADO_MANUAL', 'PENDIENTE_MANUAL', 'PROGRAMADO']);
    const validValue = schema.parse(value);
    return new EstadoEmision(validValue);
  }
  
  public isEmitido(): boolean {
      return this._value === 'EMITIDO';
  }
  
  public isNoEmitido(): boolean {
       return this._value === 'NO_EMITIDO';
  }

  public equals(other: EstadoEmision): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._value === other.value;
  }
}

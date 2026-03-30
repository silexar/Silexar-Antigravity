import { z } from "zod";

export type TipoDiscrepanciaValue = 'FALLA_TECNICA' | 'ERROR_TIMING' | 'CAMBIO_PROGRAMACION' | 'EXCLUSIVIDAD' | 'OTRO';

export class TipoDiscrepancia {
  private readonly _value: TipoDiscrepanciaValue;

  private constructor(value: TipoDiscrepanciaValue) {
    this._value = value;
  }

  public get value(): TipoDiscrepanciaValue {
    return this._value;
  }

  public static create(value: string): TipoDiscrepancia {
    const schema = z.enum(['FALLA_TECNICA', 'ERROR_TIMING', 'CAMBIO_PROGRAMACION', 'EXCLUSIVIDAD', 'OTRO']);
    const validValue = schema.parse(value);
    return new TipoDiscrepancia(validValue);
  }

  public equals(other: TipoDiscrepancia): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._value === other.value;
  }
}

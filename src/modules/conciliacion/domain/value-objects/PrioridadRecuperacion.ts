import { z } from "zod";

export type PrioridadRecuperacionValue = 'ALTA' | 'MEDIA' | 'BAJA';

export class PrioridadRecuperacion {
  private readonly _value: PrioridadRecuperacionValue;

  private constructor(value: PrioridadRecuperacionValue) {
    this._value = value;
  }

  public get value(): PrioridadRecuperacionValue {
    return this._value;
  }

  public static create(value: string): PrioridadRecuperacion {
    const schema = z.enum(['ALTA', 'MEDIA', 'BAJA']);
    const validValue = schema.parse(value);
    return new PrioridadRecuperacion(validValue);
  }

  public isAlta(): boolean {
    return this._value === 'ALTA';
  }

  public equals(other: PrioridadRecuperacion): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}

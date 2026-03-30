import { z } from "zod";

export type FranjaHorariaValue = 'PRIME_MATINAL' | 'PRIME_VESPERTINO' | 'RESTO_DIA' | 'MADRUGADA' | 'REPARTIDO';

export class FranjaHoraria {
  private readonly _value: FranjaHorariaValue;

  private constructor(value: FranjaHorariaValue) {
    this._value = value;
  }

  public get value(): FranjaHorariaValue {
    return this._value;
  }

  public static create(value: string): FranjaHoraria {
    const schema = z.enum(['PRIME_MATINAL', 'PRIME_VESPERTINO', 'RESTO_DIA', 'MADRUGADA', 'REPARTIDO']);
    const validValue = schema.parse(value);
    return new FranjaHoraria(validValue);
  }

  public isPrime(): boolean {
    return this._value === 'PRIME_MATINAL' || this._value === 'PRIME_VESPERTINO';
  }

  public equals(other: FranjaHoraria): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}

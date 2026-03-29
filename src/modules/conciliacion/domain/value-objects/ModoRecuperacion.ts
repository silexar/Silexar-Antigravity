import { z } from "zod";

export type ModoRecuperacionValue = 'AUTOMATICO' | 'MANUAL' | 'MIXTO';

export class ModoRecuperacion {
  private readonly _value: ModoRecuperacionValue;

  private constructor(value: ModoRecuperacionValue) {
    this._value = value;
  }

  public get value(): ModoRecuperacionValue {
    return this._value;
  }

  public static create(value: string): ModoRecuperacion {
    const schema = z.enum(['AUTOMATICO', 'MANUAL', 'MIXTO']);
    const validValue = schema.parse(value);
    return new ModoRecuperacion(validValue);
  }

  public equals(other: ModoRecuperacion): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}

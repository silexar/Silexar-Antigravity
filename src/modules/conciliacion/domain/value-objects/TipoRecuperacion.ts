import { z } from "zod";

export type TipoRecuperacionValue = 'ORIGINAL' | 'RECUPERACION_TECNICA' | 'RECUPERACION_COMERCIAL';

export class TipoRecuperacion {
  private readonly _value: TipoRecuperacionValue;

  private constructor(value: TipoRecuperacionValue) {
    this._value = value;
  }

  public get value(): TipoRecuperacionValue {
    return this._value;
  }

  public static create(value: string): TipoRecuperacion {
    const schema = z.enum(['ORIGINAL', 'RECUPERACION_TECNICA', 'RECUPERACION_COMERCIAL']);
    const validValue = schema.parse(value);
    return new TipoRecuperacion(validValue);
  }

  public isRecuperacion(): boolean {
    return this._value !== 'ORIGINAL';
  }

  public equals(other: TipoRecuperacion): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}

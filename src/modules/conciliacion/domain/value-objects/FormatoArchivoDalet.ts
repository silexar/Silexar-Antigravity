import { z } from "zod";

export type FormatoArchivoDaletValue = 'CSV' | 'XML' | 'TXT' | 'JSON';

export class FormatoArchivoDalet {
  private readonly _value: FormatoArchivoDaletValue;

  private constructor(value: FormatoArchivoDaletValue) {
    this._value = value;
  }

  public get value(): FormatoArchivoDaletValue {
    return this._value;
  }

  public static create(value: string): FormatoArchivoDalet {
    const schema = z.enum(['CSV', 'XML', 'TXT', 'JSON']);
    const validValue = schema.parse(value.toUpperCase());
    return new FormatoArchivoDalet(validValue);
  }

  public equals(other: FormatoArchivoDalet): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}

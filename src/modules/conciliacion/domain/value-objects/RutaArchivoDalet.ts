import { z } from "zod";

export class RutaArchivoDalet {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public static create(value: string): RutaArchivoDalet {
    // Validación de path simple pero extensible
    // Nota: dentro del character class [], el punto es literal y el guión al final no necesita escape
    const schema = z.string().min(3).regex(/^[a-zA-Z0-9_.\-/]+$/);
    const validValue = schema.parse(value);
    return new RutaArchivoDalet(validValue);
  }

  public equals(other: RutaArchivoDalet): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}

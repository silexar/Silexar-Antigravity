import { z } from "zod";

export class CodigoSP {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public static create(value: string): CodigoSP {
    // Validamos formato tipo SP123456
    const schema = z.string().regex(/^SP\d{6}$/, "El código SP debe tener el formato SP seguido de 6 dígitos.");
    const validValue = schema.parse(value);
    
    return new CodigoSP(validValue);
  }

  public equals(other: CodigoSP): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._value === other.value;
  }
}

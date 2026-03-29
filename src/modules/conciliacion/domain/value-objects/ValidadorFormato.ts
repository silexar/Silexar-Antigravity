import { z } from "zod";

export class ValidadorFormato {
  private readonly _isValid: boolean;
  private readonly _error?: string;

  private constructor(isValid: boolean, error?: string) {
    this._isValid = isValid;
    this._error = error;
  }

  public get isValid(): boolean {
    return this._isValid;
  }

  public get error(): string | undefined {
    return this._error;
  }

  public static ok(): ValidadorFormato {
    return new ValidadorFormato(true);
  }

  public static fail(error: string): ValidadorFormato {
    return new ValidadorFormato(false, error);
  }

  public static create(isValid: boolean, error?: string): ValidadorFormato {
      const schema = z.boolean();
      schema.parse(isValid);
      return new ValidadorFormato(isValid, error);
  }
}

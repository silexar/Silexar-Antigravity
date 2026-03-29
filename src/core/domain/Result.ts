export type ResultError = {
  code: string;
  message: string;
  details?: unknown;
};

export class Result<T, E extends ResultError = ResultError> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: E | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: Un result exitoso no puede contener un error.');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: Un result fallido requiere un error.');
    }
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value !== undefined ? value : null;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      console.log(this.error);
      throw new Error('No se puede recuperar el valor de un resultado fallido.');
    }
    return this._value as T;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U, E extends ResultError = ResultError>(error: E): Result<U, E> {
    return new Result<U, E>(false, error);
  }
}

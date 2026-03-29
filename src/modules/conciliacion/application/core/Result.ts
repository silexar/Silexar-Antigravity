export class AppError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error?: AppError | string;
  private readonly _value?: T;

  private constructor(isSuccess: boolean, error?: AppError | string, value?: T) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A result cannot be successful and contain an error");
    }
    if (!isSuccess && !error) {
      throw new Error("InvalidOperation: A failing result needs to contain an error message");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
    
    Object.freeze(this);
  }

  public get value(): T {
    if (!this.isSuccess || this._value === undefined) {
      throw new Error("Can't get the value of an error result. Use 'error' instead");
    }
    return this._value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: AppError | string): Result<U> {
    return new Result<U>(false, error);
  }
}

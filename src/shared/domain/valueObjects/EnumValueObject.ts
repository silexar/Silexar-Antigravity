export abstract class EnumValueObject<T> {
  protected readonly _value: T;
  protected readonly _validValues: T[];

  constructor(value: T, validValues: T[]) {
    this._validValues = validValues;
    this.validateValue(value);
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  get validValues(): T[] {
    return this._validValues;
  }

  equals(other: EnumValueObject<T>): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return String(this._value);
  }

  private validateValue(value: T): void {
    if (!this._validValues.includes(value)) {
      throw new Error(`Invalid value: ${value}. Valid values are: ${this._validValues.join(', ')}`);
    }
  }
}
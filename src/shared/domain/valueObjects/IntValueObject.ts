export abstract class IntValueObject {
  protected readonly _value: number;

  constructor(value: number) {
    this.validateValue(value);
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  equals(other: IntValueObject): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }

  protected validateValue(value: number): void {
    if (value === null || value === undefined) {
      throw new Error('Value cannot be null or undefined');
    }
    if (typeof value !== 'number') {
      throw new Error(`Value must be a number: ${value}`);
    }
    if (!Number.isInteger(value)) {
      throw new Error(`Value must be an integer: ${value}`);
    }
  }
}
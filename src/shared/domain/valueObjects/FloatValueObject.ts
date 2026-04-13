export abstract class FloatValueObject {
  protected readonly _value: number;

  constructor(value: number) {
    this.validateValue(value);
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  equals(other: FloatValueObject): boolean {
    return Math.abs(this._value - other._value) < Number.EPSILON;
  }

  toString(): string {
    return this._value.toString();
  }

  isZero(): boolean {
    return Math.abs(this._value) < Number.EPSILON;
  }

  isPositive(): boolean {
    return this._value > 0;
  }

  isNegative(): boolean {
    return this._value < 0;
  }

  round(): FloatValueObject {
    return new (this.constructor as unknown)(Math.round(this._value));
  }

  floor(): FloatValueObject {
    return new (this.constructor as unknown)(Math.floor(this._value));
  }

  ceil(): FloatValueObject {
    return new (this.constructor as unknown)(Math.ceil(this._value));
  }

  add(other: FloatValueObject): FloatValueObject {
    return new (this.constructor as unknown)(this._value + other._value);
  }

  subtract(other: FloatValueObject): FloatValueObject {
    return new (this.constructor as unknown)(this._value - other._value);
  }

  multiply(other: FloatValueObject): FloatValueObject {
    return new (this.constructor as unknown)(this._value * other._value);
  }

  divide(other: FloatValueObject): FloatValueObject {
    if (other.isZero()) {
      throw new Error('Cannot divide by zero');
    }
    return new (this.constructor as unknown)(this._value / other._value);
  }

  protected validateValue(value: number): void {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      throw new Error('Value must be a valid number');
    }
  }
}
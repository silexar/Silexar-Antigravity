export abstract class DateValueObject {
  protected readonly _value: Date;

  constructor(value: Date) {
    this.validateDate(value);
    this._value = value;
  }

  get value(): Date {
    return this._value;
  }

  equals(other: DateValueObject): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  toString(): string {
    return this._value.toISOString();
  }

  private validateDate(value: Date): void {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error('Invalid date');
    }
  }
}
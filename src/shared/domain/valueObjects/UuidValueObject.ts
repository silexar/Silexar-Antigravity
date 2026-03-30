import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export abstract class UuidValueObject {
  protected readonly _value: string;

  constructor(value: string) {
    this.validateValue(value);
    this._value = value;
  }

  static random(): string {
    return uuidv4();
  }

  get value(): string {
    return this._value;
  }

  equals(other: UuidValueObject): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  protected validateValue(value: string): void {
    if (value === null || value === undefined) {
      throw new Error('Value cannot be null or undefined');
    }
    if (typeof value !== 'string') {
      throw new Error(`Value must be a string: ${value}`);
    }
    if (!uuidValidate(value)) {
      throw new Error(`Value must be a valid UUID: ${value}`);
    }
  }
}
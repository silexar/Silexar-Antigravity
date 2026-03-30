import { z } from "zod";

export class MetricaCumplimiento {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  public get value(): number {
    return this._value;
  }

  public static create(value: number): MetricaCumplimiento {
    const schema = z.number().min(0).max(100);
    const validValue = schema.parse(value);
    return new MetricaCumplimiento(validValue);
  }

  public isPerfect(): boolean {
    return this._value === 100;
  }

  public isCritical(): boolean {
      return this._value < 80;
  }

  public toString(): string {
    return `${this._value.toFixed(2)}%`;
  }
}

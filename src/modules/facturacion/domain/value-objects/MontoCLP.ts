export class MontoCLP {
  private readonly _value: number;

  constructor(value: number) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Monto CLP inválido: ${value}`);
    }
    this._value = Math.round(value);
  }

  get value(): number { return this._value; }

  add(other: MontoCLP): MontoCLP {
    return new MontoCLP(this._value + other._value);
  }

  subtract(other: MontoCLP): MontoCLP {
    return new MontoCLP(Math.max(0, this._value - other._value));
  }

  multiply(factor: number): MontoCLP {
    return new MontoCLP(this._value * factor);
  }

  equals(other: MontoCLP): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toLocaleString('es-CL');
  }
}

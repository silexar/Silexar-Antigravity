export class RutChileno {
  private readonly _value: string;

  constructor(value: string) {
    const cleaned = value.trim();
    if (!this.isValid(cleaned)) {
      throw new Error(`RUT inválido: ${value}`);
    }
    this._value = cleaned;
  }

  private isValid(rut: string): boolean {
    if (!rut || rut.length < 3) return false;
    const cleaned = rut.replace(/[.\-]/g, '');
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();
    if (!/^\d+$/.test(body)) return false;
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const expectedDv = 11 - (sum % 11);
    const dvMap: Record<number, string> = { 11: '0', 10: 'K' };
    return dv === (dvMap[expectedDv] ?? expectedDv.toString());
  }

  get value(): string { return this._value; }

  normalized(): string {
    return this._value.replace(/[.\-]/g, '');
  }

  equals(other: RutChileno): boolean {
    return this.normalized() === other.normalized();
  }

  toString(): string { return this._value; }
}

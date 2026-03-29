/**
 * 💰 VALUE OBJECT: RANGO DE PRESUPUESTO
 * 
 * Define los rangos de presupuesto para agencias creativas
 */

export type RangoPresupuestoType = 
  | 'MICRO'
  | 'PEQUEÑO'
  | 'MEDIANO'
  | 'GRANDE'
  | 'ENTERPRISE'
  | 'PREMIUM';

export class RangoPresupuesto {
  private readonly _value: RangoPresupuestoType;
  private readonly _minimo: number;
  private readonly _maximo: number;

  constructor(value: string) {
    this._value = this.validate(value);
    const range = this.calculateRange(this._value);
    this._minimo = range.minimo;
    this._maximo = range.maximo;
  }

  private validate(value: string): RangoPresupuestoType {
    const upperValue = value.toUpperCase() as RangoPresupuestoType;
    
    const validValues: RangoPresupuestoType[] = [
      'MICRO',
      'PEQUEÑO',
      'MEDIANO',
      'GRANDE',
      'ENTERPRISE',
      'PREMIUM'
    ];

    if (!validValues.includes(upperValue)) {
      throw new Error(`Rango de presupuesto inválido: ${value}`);
    }

    return upperValue;
  }

  private calculateRange(value: RangoPresupuestoType): { minimo: number; maximo: number } {
    const ranges: Record<RangoPresupuestoType, { minimo: number; maximo: number }> = {
      'MICRO': { minimo: 100000, maximo: 500000 },        // $100K - $500K
      'PEQUEÑO': { minimo: 500000, maximo: 2000000 },     // $500K - $2M
      'MEDIANO': { minimo: 2000000, maximo: 10000000 },   // $2M - $10M
      'GRANDE': { minimo: 10000000, maximo: 50000000 },   // $10M - $50M
      'ENTERPRISE': { minimo: 50000000, maximo: 200000000 }, // $50M - $200M
      'PREMIUM': { minimo: 200000000, maximo: 1000000000 }   // $200M+
    };

    return ranges[value];
  }

  get value(): RangoPresupuestoType {
    return this._value;
  }

  get minimo(): number {
    return this._minimo;
  }

  get maximo(): number {
    return this._maximo;
  }

  get displayName(): string {
    const displayNames: Record<RangoPresupuestoType, string> = {
      'MICRO': 'Micro ($100K - $500K)',
      'PEQUEÑO': 'Pequeño ($500K - $2M)',
      'MEDIANO': 'Mediano ($2M - $10M)',
      'GRANDE': 'Grande ($10M - $50M)',
      'ENTERPRISE': 'Enterprise ($50M - $200M)',
      'PREMIUM': 'Premium ($200M+)'
    };

    return displayNames[this._value];
  }

  get formattedRange(): string {
    const formatCurrency = (amount: number): string => {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      }
      return `$${(amount / 1000).toFixed(0)}K`;
    };

    if (this._value === 'PREMIUM') {
      return `${formatCurrency(this._minimo)}+`;
    }

    return `${formatCurrency(this._minimo)} - ${formatCurrency(this._maximo)}`;
  }

  get scoreMultiplier(): number {
    const multipliers: Record<RangoPresupuestoType, number> = {
      'MICRO': 0.8,
      'PEQUEÑO': 0.9,
      'MEDIANO': 1.0,
      'GRANDE': 1.1,
      'ENTERPRISE': 1.3,
      'PREMIUM': 1.5
    };

    return multipliers[this._value];
  }

  canHandle(presupuesto: number): boolean {
    if (this._value === 'PREMIUM') {
      return presupuesto >= this._minimo;
    }
    return presupuesto >= this._minimo && presupuesto <= this._maximo;
  }

  equals(other: RangoPresupuesto): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
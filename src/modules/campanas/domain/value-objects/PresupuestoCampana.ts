/**
 * PresupuestoCampana — Value Object
 * Encapsula el presupuesto con moneda y validaciones de negocio.
 */

export type Moneda = 'CLP' | 'USD' | 'EUR';

export interface PresupuestoData {
  monto: number;
  moneda: Moneda;
}

export class PresupuestoCampana {
  private constructor(
    private readonly _monto: number,
    private readonly _moneda: Moneda,
  ) {
    Object.freeze(this);
  }

  static crear(data: PresupuestoData): PresupuestoCampana {
    if (data.monto < 0) {
      throw new Error('El presupuesto no puede ser negativo');
    }
    if (data.monto > 1_000_000_000) {
      throw new Error('El presupuesto excede el máximo permitido');
    }
    const monedasValidas: Moneda[] = ['CLP', 'USD', 'EUR'];
    if (!monedasValidas.includes(data.moneda)) {
      throw new Error(`Moneda inválida: ${data.moneda}`);
    }
    return new PresupuestoCampana(data.monto, data.moneda);
  }

  get monto(): number  { return this._monto; }
  get moneda(): Moneda { return this._moneda; }
  get esCero(): boolean { return this._monto === 0; }

  esMayorQue(otro: PresupuestoCampana): boolean {
    if (this._moneda !== otro._moneda) {
      throw new Error('No se pueden comparar presupuestos de distintas monedas');
    }
    return this._monto > otro._monto;
  }

  toString(): string {
    return `${this._moneda} ${this._monto.toLocaleString('es-CL')}`;
  }

  equals(other: PresupuestoCampana): boolean {
    return this._monto === other._monto && this._moneda === other._moneda;
  }
}

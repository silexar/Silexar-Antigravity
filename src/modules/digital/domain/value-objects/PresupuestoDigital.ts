export type TipoPresupuestoDigital = 'diario' | 'total';

export class PresupuestoDigital {
  private constructor(
    private readonly _monto: number,
    private readonly _moneda: string,
    private readonly _tipo: TipoPresupuestoDigital
  ) {
    if (_monto < 0) throw new Error('El presupuesto no puede ser negativo');
  }

  static create(monto: number, moneda: string = 'CLP', tipo: TipoPresupuestoDigital = 'total'): PresupuestoDigital {
    return new PresupuestoDigital(monto, moneda, tipo);
  }

  get monto(): number { return this._monto; }
  get moneda(): string { return this._moneda; }
  get tipo(): TipoPresupuestoDigital { return this._tipo; }

  toJSON() {
    return { monto: this._monto, moneda: this._moneda, tipo: this._tipo };
  }
}

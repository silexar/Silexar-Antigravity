/**
 * MetricasMotor — Value Object
 * Métricas de rendimiento de un motor Cortex AI.
 */

export interface MetricasMotorData {
  precision: number;     // 0-100
  latenciaMs: number;    // ms promedio
  solicitudesTotal: number;
  solicitudesExitosas: number;
  ultimaEjecucion?: Date;
}

export class MetricasMotor {
  private constructor(private readonly _data: MetricasMotorData) {
    Object.freeze(this);
    Object.freeze(this._data);
  }

  static crear(data: MetricasMotorData): MetricasMotor {
    if (data.precision < 0 || data.precision > 100) {
      throw new Error('La precisión debe estar entre 0 y 100');
    }
    if (data.latenciaMs < 0) {
      throw new Error('La latencia no puede ser negativa');
    }
    if (data.solicitudesTotal < 0 || data.solicitudesExitosas < 0) {
      throw new Error('Los contadores de solicitudes no pueden ser negativos');
    }
    if (data.solicitudesExitosas > data.solicitudesTotal) {
      throw new Error('Las solicitudes exitosas no pueden superar el total');
    }
    return new MetricasMotor(data);
  }

  static inicial(): MetricasMotor {
    return new MetricasMotor({
      precision: 0,
      latenciaMs: 0,
      solicitudesTotal: 0,
      solicitudesExitosas: 0,
    });
  }

  get precision(): number          { return this._data.precision; }
  get latenciaMs(): number         { return this._data.latenciaMs; }
  get solicitudesTotal(): number   { return this._data.solicitudesTotal; }
  get solicitudesExitosas(): number { return this._data.solicitudesExitosas; }
  get ultimaEjecucion(): Date | undefined { return this._data.ultimaEjecucion; }

  get tasaExito(): number {
    if (this._data.solicitudesTotal === 0) return 0;
    return (this._data.solicitudesExitosas / this._data.solicitudesTotal) * 100;
  }

  registrarEjecucion(exitosa: boolean, latenciaMs: number): MetricasMotor {
    return MetricasMotor.crear({
      precision: this._data.precision,
      latenciaMs: (this._data.latenciaMs * this._data.solicitudesTotal + latenciaMs) /
                  (this._data.solicitudesTotal + 1),
      solicitudesTotal: this._data.solicitudesTotal + 1,
      solicitudesExitosas: this._data.solicitudesExitosas + (exitosa ? 1 : 0),
      ultimaEjecucion: new Date(),
    });
  }

  equals(other: MetricasMotor): boolean {
    return this._data.precision === other._data.precision &&
      this._data.latenciaMs === other._data.latenciaMs &&
      this._data.solicitudesTotal === other._data.solicitudesTotal;
  }
}

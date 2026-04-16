/**
 * VALUE OBJECT: DURACIÓN — TIER 0
 *
 * Representa la duración de una cuña en segundos + milisegundos.
 * Inmutable. Útil para formateo y comparaciones.
 */

export class Duracion {
  private constructor(
    private readonly _segundos: number,
    private readonly _milisegundos: number = 0
  ) {
    this.validate();
  }

  static create(segundos: number, milisegundos = 0): Duracion {
    return new Duracion(segundos, milisegundos);
  }

  static desdeSegundosTotales(totalSegundos: number): Duracion {
    const segundos = Math.floor(totalSegundos);
    const milisegundos = Math.round((totalSegundos - segundos) * 1000);
    return new Duracion(segundos, milisegundos);
  }

  private validate(): void {
    if (this._segundos < 1) {
      throw new Error('La duración debe ser al menos 1 segundo.');
    }
    if (this._segundos > 600) {
      throw new Error('La duración no puede superar 600 segundos (10 minutos).');
    }
    if (this._milisegundos < 0 || this._milisegundos > 999) {
      throw new Error('Los milisegundos deben estar entre 0 y 999.');
    }
  }

  get segundos(): number {
    return this._segundos;
  }

  get milisegundos(): number {
    return this._milisegundos;
  }

  get totalSegundos(): number {
    return this._segundos + this._milisegundos / 1000;
  }

  /** Formato "M:SS" para mostrar en UI → "0:28", "1:05" */
  toDisplayString(): string {
    const minutos = Math.floor(this._segundos / 60);
    const segundosRestantes = this._segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  }

  /** Formato "Xs" para menciones → "28s" */
  toShortString(): string {
    return `${this._segundos}s`;
  }

  equals(other: Duracion): boolean {
    return this._segundos === other._segundos && this._milisegundos === other._milisegundos;
  }

  toString(): string {
    return this.toDisplayString();
  }
}

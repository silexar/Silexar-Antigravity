/**
 * RangoHorario — Value Object
 * Representa un intervalo de tiempo dentro de un día.
 */

export interface RangoHorarioData {
  inicio: string; // HH:mm:ss
  fin: string;    // HH:mm:ss
}

export class RangoHorario {
  private constructor(
    private readonly _inicio: string,
    private readonly _fin: string,
  ) {
    Object.freeze(this);
  }

  static crear(data: RangoHorarioData): RangoHorario {
    const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!regex.test(data.inicio)) {
      throw new Error(`Hora de inicio inválida: ${data.inicio}`);
    }
    if (!regex.test(data.fin)) {
      throw new Error(`Hora de fin inválida: ${data.fin}`);
    }
    if (data.inicio >= data.fin) {
      throw new Error(`La hora de inicio (${data.inicio}) debe ser anterior a la hora de fin (${data.fin})`);
    }
    return new RangoHorario(data.inicio, data.fin);
  }

  get inicio(): string { return this._inicio; }
  get fin(): string { return this._fin; }

  duracionSegundos(): number {
    const [h1, m1, s1] = this._inicio.split(':').map(Number);
    const [h2, m2, s2] = this._fin.split(':').map(Number);
    const segundosInicio = h1 * 3600 + m1 * 60 + s1;
    const segundosFin = h2 * 3600 + m2 * 60 + s2;
    return segundosFin - segundosInicio;
  }

  contiene(hora: string): boolean {
    return hora >= this._inicio && hora <= this._fin;
  }

  toJSON(): RangoHorarioData {
    return { inicio: this._inicio, fin: this._fin };
  }

  toString(): string {
    return `${this._inicio} - ${this._fin}`;
  }

  equals(other: RangoHorario): boolean {
    return this._inicio === other._inicio && this._fin === other._fin;
  }
}

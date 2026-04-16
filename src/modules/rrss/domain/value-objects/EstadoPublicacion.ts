/**
 * EstadoPublicacionRrss Value Object
 */

export type EstadoPublicacionRrss = 'borrador' | 'programada' | 'publicada' | 'fallida' | 'cancelada';

const ESTADOS_VALIDOS: EstadoPublicacionRrss[] = [
  'borrador',
  'programada',
  'publicada',
  'fallida',
  'cancelada'
];

export class EstadoPublicacionRrssVO {
  private constructor(private readonly _value: EstadoPublicacionRrss) {}

  static create(value: string): EstadoPublicacionRrssVO {
    if (!ESTADOS_VALIDOS.includes(value as EstadoPublicacionRrss)) {
      throw new Error(`Estado de publicación inválido: ${value}`);
    }
    return new EstadoPublicacionRrssVO(value as EstadoPublicacionRrss);
  }

  static borrador(): EstadoPublicacionRrssVO {
    return new EstadoPublicacionRrssVO('borrador');
  }

  static programada(): EstadoPublicacionRrssVO {
    return new EstadoPublicacionRrssVO('programada');
  }

  static publicada(): EstadoPublicacionRrssVO {
    return new EstadoPublicacionRrssVO('publicada');
  }

  static fallida(): EstadoPublicacionRrssVO {
    return new EstadoPublicacionRrssVO('fallida');
  }

  static cancelada(): EstadoPublicacionRrssVO {
    return new EstadoPublicacionRrssVO('cancelada');
  }

  get value(): EstadoPublicacionRrss {
    return this._value;
  }

  get esPublicable(): boolean {
    return this._value === 'programada' || this._value === 'borrador';
  }

  get esModificable(): boolean {
    return this._value === 'borrador' || this._value === 'programada' || this._value === 'fallida';
  }

  equals(other: EstadoPublicacionRrssVO): boolean {
    return this._value === other.value;
  }
}

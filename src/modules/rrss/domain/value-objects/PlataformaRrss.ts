/**
 * PlataformaRrss Value Object
 */

export type PlataformaRrss = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter' | 'youtube';

const PLATAFORMAS_VALIDAS: PlataformaRrss[] = [
  'instagram',
  'facebook',
  'tiktok',
  'linkedin',
  'twitter',
  'youtube'
];

export class PlataformaRrssVO {
  private constructor(private readonly _value: PlataformaRrss) {}

  static create(value: string): PlataformaRrssVO {
    if (!PLATAFORMAS_VALIDAS.includes(value as PlataformaRrss)) {
      throw new Error(`Plataforma RRSS no soportada: ${value}`);
    }
    return new PlataformaRrssVO(value as PlataformaRrss);
  }

  get value(): PlataformaRrss {
    return this._value;
  }

  equals(other: PlataformaRrssVO): boolean {
    return this._value === other.value;
  }
}

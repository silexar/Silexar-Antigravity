export const PLATAFORMAS_DIGITALES = [
  'meta_ads',
  'google_ads',
  'tiktok_ads',
  'linkedin_ads',
  'twitter_ads',
  'spotify',
  'deezer',
  'soundcloud',
  'youtube_ads',
  'programmatic',
  'sitio_propio',
  'app_propia',
] as const;

export type PlataformaDigital = typeof PLATAFORMAS_DIGITALES[number];

export class PlataformaDigitalVO {
  private constructor(private readonly _valor: PlataformaDigital) {}

  static create(valor: string): PlataformaDigitalVO {
    if (!PLATAFORMAS_DIGITALES.includes(valor as PlataformaDigital)) {
      throw new Error(`Plataforma digital no soportada: ${valor}`);
    }
    return new PlataformaDigitalVO(valor as PlataformaDigital);
  }

  get valor(): PlataformaDigital { return this._valor; }

  toString(): string { return this._valor; }
}

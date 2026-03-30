/**
 * VALUE OBJECT: TIPO DE AUSPICIO - TIER 0 ENTERPRISE
 *
 * @description Tipos de auspicio (A-Completo, B-Medio, Solo Menciones)
 * con derechos incluidos, validaciones y lógica comercial.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type TipoAuspicioValor = 'tipo_a' | 'tipo_b' | 'solo_menciones'

export interface DerechoAuspicio {
  id: string
  nombre: string
  descripcion: string
  incluidoPorDefecto: boolean
  opcional: boolean
}

export class TipoAuspicio {
  private constructor(private readonly _valor: TipoAuspicioValor) {}

  // ── Factory Methods ──
  static tipoA(): TipoAuspicio { return new TipoAuspicio('tipo_a') }
  static tipoB(): TipoAuspicio { return new TipoAuspicio('tipo_b') }
  static soloMenciones(): TipoAuspicio { return new TipoAuspicio('solo_menciones') }

  static fromString(valor: string): TipoAuspicio {
    const tipos: TipoAuspicioValor[] = ['tipo_a', 'tipo_b', 'solo_menciones']
    if (!tipos.includes(valor as TipoAuspicioValor)) {
      throw new Error(`Tipo de auspicio inválido: ${valor}. Valores permitidos: ${tipos.join(', ')}`)
    }
    return new TipoAuspicio(valor as TipoAuspicioValor)
  }

  // ── Getters ──
  get valor(): TipoAuspicioValor { return this._valor }

  get nombre(): string {
    const nombres: Record<TipoAuspicioValor, string> = {
      'tipo_a': 'Auspicio Tipo A (Completo)',
      'tipo_b': 'Auspicio Tipo B (Medio)',
      'solo_menciones': 'Solo Menciones'
    }
    return nombres[this._valor]
  }

  get nombreCorto(): string {
    const nombres: Record<TipoAuspicioValor, string> = {
      'tipo_a': 'Tipo A',
      'tipo_b': 'Tipo B',
      'solo_menciones': 'Menciones'
    }
    return nombres[this._valor]
  }

  get descripcion(): string {
    const descripciones: Record<TipoAuspicioValor, string> = {
      'tipo_a': 'Auspicio completo con presentación, menciones, cierre, comerciales y presencia en RRSS',
      'tipo_b': 'Auspicio medio con menciones intermedias y comerciales en tanda',
      'solo_menciones': 'Menciones al aire durante el programa sin presentación ni cierre'
    }
    return descripciones[this._valor]
  }

  get color(): string {
    const colores: Record<TipoAuspicioValor, string> = {
      'tipo_a': 'bg-amber-500',
      'tipo_b': 'bg-sky-500',
      'solo_menciones': 'bg-emerald-500'
    }
    return colores[this._valor]
  }

  get icono(): string {
    const iconos: Record<TipoAuspicioValor, string> = {
      'tipo_a': '🏆',
      'tipo_b': '🥈',
      'solo_menciones': '🎙️'
    }
    return iconos[this._valor]
  }

  get prioridad(): number {
    const prioridades: Record<TipoAuspicioValor, number> = {
      'tipo_a': 3,
      'tipo_b': 2,
      'solo_menciones': 1
    }
    return prioridades[this._valor]
  }

  /** Derechos incluidos por tipo de auspicio */
  get derechosIncluidos(): DerechoAuspicio[] {
    const derechos: Record<TipoAuspicioValor, DerechoAuspicio[]> = {
      'tipo_a': [
        { id: 'presentacion', nombre: 'Presentación apertura', descripcion: 'Presentación al inicio del programa', incluidoPorDefecto: true, opcional: false },
        { id: 'mencion_intermedia', nombre: 'Mención intermedia', descripcion: '1 mención por bloque del programa', incluidoPorDefecto: true, opcional: false },
        { id: 'cierre', nombre: 'Cierre de programa', descripcion: 'Mención de cierre al final del programa', incluidoPorDefecto: true, opcional: false },
        { id: 'comercial_tanda', nombre: 'Comercial en tanda', descripcion: 'Comercial de 30" en tanda comercial', incluidoPorDefecto: true, opcional: false },
        { id: 'rrss', nombre: 'Mención en RRSS', descripcion: 'Post/mención en redes sociales del programa', incluidoPorDefecto: true, opcional: false },
        { id: 'product_placement', nombre: 'Product Placement', descripcion: 'Integración de producto dentro del contenido', incluidoPorDefecto: false, opcional: true }
      ],
      'tipo_b': [
        { id: 'mencion_intermedia', nombre: 'Mención intermedia', descripcion: '1 mención por programa', incluidoPorDefecto: true, opcional: false },
        { id: 'comercial_tanda', nombre: 'Comercial en tanda', descripcion: 'Comercial de 20" en tanda comercial', incluidoPorDefecto: true, opcional: false }
      ],
      'solo_menciones': [
        { id: 'mencion_aire', nombre: 'Mención al aire', descripcion: 'Mención de 15 segundos durante el programa', incluidoPorDefecto: true, opcional: false }
      ]
    }
    return derechos[this._valor]
  }

  /** Factor de pricing relativo (Tipo A = 1.0, otros proporcionales) */
  get factorPrecio(): number {
    const factores: Record<TipoAuspicioValor, number> = {
      'tipo_a': 1.0,
      'tipo_b': 0.49,
      'solo_menciones': 0.04
    }
    return factores[this._valor]
  }

  // ── Métodos de consulta ──
  esCompleto(): boolean { return this._valor === 'tipo_a' }
  esMedio(): boolean { return this._valor === 'tipo_b' }
  esSoloMenciones(): boolean { return this._valor === 'solo_menciones' }

  incluyePresentacion(): boolean {
    return this.derechosIncluidos.some(d => d.id === 'presentacion')
  }

  incluyeCierre(): boolean {
    return this.derechosIncluidos.some(d => d.id === 'cierre')
  }

  incluyeRRSS(): boolean {
    return this.derechosIncluidos.some(d => d.id === 'rrss')
  }

  // ── Comparación ──
  equals(other: TipoAuspicio): boolean {
    return this._valor === other._valor
  }

  esMayorQue(other: TipoAuspicio): boolean {
    return this.prioridad > other.prioridad
  }

  toString(): string { return this._valor }
  toDisplay(): string { return this.nombreCorto }
}

/**
 * VALUE OBJECT: SISTEMA EMISION - TIER 0
 */

export type SistemaEmisionValor = 'wideorbit' | 'sara' | 'dalet' | 'generico'

export class SistemaEmision {
  private constructor(private readonly _valor: SistemaEmisionValor) {}

  static wideorbit(): SistemaEmision { return new SistemaEmision('wideorbit') }
  static sara(): SistemaEmision { return new SistemaEmision('sara') }
  static dalet(): SistemaEmision { return new SistemaEmision('dalet') }
  static generico(): SistemaEmision { return new SistemaEmision('generico') }

  static fromString(valor: string): SistemaEmision {
    const sistemas: SistemaEmisionValor[] = ['wideorbit', 'sara', 'dalet', 'generico']
    if (!sistemas.includes(valor as SistemaEmisionValor)) {
      throw new Error(`Sistema de emisión inválido: ${valor}`)
    }
    return new SistemaEmision(valor as SistemaEmisionValor)
  }

  get valor(): SistemaEmisionValor { return this._valor }
  
  get descripcion(): string {
    const descripciones = {
      'wideorbit': 'WideOrbit - Sistema de tráfico y programación',
      'sara': 'Sara - Sistema de automatización radial',
      'dalet': 'Dalet - Sistema de gestión de medios',
      'generico': 'Sistema Genérico'
    }
    return descripciones[this._valor]
  }

  equals(other: SistemaEmision): boolean { return this._valor === other._valor }
  toString(): string { return this._valor }
}
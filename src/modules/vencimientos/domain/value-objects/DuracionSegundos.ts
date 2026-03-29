/**
 * VALUE OBJECT: DURACIÓN EN SEGUNDOS - TIER 0 ENTERPRISE
 *
 * @description Duraciones válidas para avisos comerciales
 * permitiendo una selección libre desde 1 hasta 90 segundos.
 * La tarifa se calcula de forma proporcional matemática en base a 30s.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

// Ahora permitimos cualquier número del 1 al 90
export type DuracionValida = number // Debe estar entre 1 y 90

export class DuracionSegundos {
  private constructor(private readonly _valor: DuracionValida) {}

  // ── Factory Methods ──
  static create(segundos: number): DuracionSegundos {
    if (segundos < 1 || segundos > 90) {
      throw new Error(
        `Duración inválida: ${segundos}s. La duración de la frase debe ser entre 1 y 90 segundos.`
      )
    }
    return new DuracionSegundos(segundos as DuracionValida)
  }

  static fromString(valor: string): DuracionSegundos {
    const num = parseInt(valor, 10)
    if (isNaN(num)) throw new Error('Valor no numérico para la duración')
    return DuracionSegundos.create(num)
  }

  // ── Helpers clásicos para tests y legacy (Opcionales) ──
  static de15(): DuracionSegundos { return new DuracionSegundos(15) }
  static de30(): DuracionSegundos { return new DuracionSegundos(30) }
  static de60(): DuracionSegundos { return new DuracionSegundos(60) }

  static todasLasDuraciones(): DuracionSegundos[] {
    const comunes = [5, 10, 15, 20, 30, 45, 60]
    return comunes.map(d => DuracionSegundos.create(d))
  }

  // ── Getters ──
  get valor(): DuracionValida { return this._valor }
  get segundos(): number { return this._valor }

  get descripcion(): string { return `${this._valor} segundos` }
  get descripcionCorta(): string { return `${this._valor}"` }

  /** 
   * Factor matemático proporcional exacto basado en 30" como referencia cruzada (1.0x).
   * Ej: 30s = 1.0, 15s = 0.5, 90s = 3.0
   * El cálculo exacto protege el revenue de la emisora al milímetro.
   */
  get factorProporcional(): number {
    return this._valor / 30.0
  }

  // ── Métodos ──
  calcularPrecio(precioBase30s: number): number {
    return Math.round(precioBase30s * this.factorProporcional)
  }

  esMayorQue(otra: DuracionSegundos): boolean {
    return this._valor > otra._valor
  }

  equals(other: DuracionSegundos): boolean {
    return this._valor === other._valor
  }

  toString(): string { return this.descripcionCorta }
}

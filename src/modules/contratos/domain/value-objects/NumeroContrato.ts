/**
 * VALUE OBJECT: NÚMERO DE CONTRATO - TIER 0
 * 
 * @description Generación automática de números únicos de contrato
 * con validación y formato empresarial CON-YYYY-XXXXX
 */

export class NumeroContrato {
  private constructor(private readonly _valor: string) {
    this.validate()
  }

  static generate(): NumeroContrato {
    const year = new Date().getFullYear()
    const sequence = this.generateSequence()
    const numero = `CON-${year}-${sequence.toString().padStart(5, '0')}`
    return new NumeroContrato(numero)
  }

  static fromString(valor: string): NumeroContrato {
    return new NumeroContrato(valor)
  }

  private static generateSequence(): number {
    // En producción, esto vendría de una secuencia de base de datos
    return Math.floor(Math.random() * 99999) + 1
  }

  private validate(): void {
    const pattern = /^CON-\d{4}-\d{5}$/
    if (!pattern.test(this._valor)) {
      throw new Error('Formato de número de contrato inválido. Debe ser CON-YYYY-XXXXX')
    }
  }

  get valor(): string {
    return this._valor
  }

  get year(): number {
    return parseInt(this._valor.split('-')[1])
  }

  get sequence(): number {
    return parseInt(this._valor.split('-')[2])
  }

  equals(other: NumeroContrato): boolean {
    return this._valor === other._valor
  }

  toString(): string {
    return this._valor
  }
}
/**
 * 🆔 VALUE OBJECT: RUT AGENCIA CREATIVA
 * 
 * Encapsula y valida el RUT de una agencia creativa chilena
 * Incluye validación de formato y dígito verificador
 */

export class RutAgenciaCreativa {
  private readonly _value: string
  private readonly _numero: number
  private readonly _digitoVerificador: string
  
  constructor(rut: string) {
    this._value = this.normalize(rut)
    const { numero, dv } = this.parse(this._value)
    this._numero = numero
    this._digitoVerificador = dv
    
    this.validate()
  }
  
  get value(): string {
    return this._value
  }
  
  get numero(): number {
    return this._numero
  }
  
  get digitoVerificador(): string {
    return this._digitoVerificador
  }
  
  get formatted(): string {
    return this.formatRut(this._numero, this._digitoVerificador)
  }
  
  /**
   * Normaliza el RUT removiendo puntos, guiones y espacios
   */
  private normalize(rut: string): string {
    return rut.replace(/[.\-\s]/g, '').toUpperCase()
  }
  
  /**
   * Parsea el RUT separando número y dígito verificador
   */
  private parse(rut: string): { numero: number; dv: string } {
    if (rut.length < 2) {
      throw new Error('RUT debe tener al menos 2 caracteres')
    }
    
    const numero = parseInt(rut.slice(0, -1), 10)
    const dv = rut.slice(-1)
    
    return { numero, dv }
  }
  
  /**
   * Valida el formato y dígito verificador del RUT
   */
  private validate(): void {
    // Validar que el número sea válido
    if (isNaN(this._numero) || this._numero < 1000000 || this._numero > 99999999) {
      throw new Error('Número de RUT inválido. Debe estar entre 1.000.000 y 99.999.999')
    }
    
    // Validar dígito verificador
    if (!/^[0-9K]$/.test(this._digitoVerificador)) {
      throw new Error('Dígito verificador inválido. Debe ser un número del 0-9 o K')
    }
    
    // Validar que el dígito verificador sea correcto
    const dvCalculado = this.calcularDigitoVerificador(this._numero)
    if (dvCalculado !== this._digitoVerificador) {
      throw new Error(`Dígito verificador incorrecto. Esperado: ${dvCalculado}, Recibido: ${this._digitoVerificador}`)
    }
  }
  
  /**
   * Calcula el dígito verificador para un número de RUT
   */
  private calcularDigitoVerificador(numero: number): string {
    let suma = 0
    let multiplicador = 2
    
    // Convertir número a string y procesar de derecha a izquierda
    const numeroStr = numero.toString()
    
    for (let i = numeroStr.length - 1; i >= 0; i--) {
      suma += parseInt(numeroStr[i]) * multiplicador
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
    }
    
    const resto = suma % 11
    const dv = 11 - resto
    
    if (dv === 11) return '0'
    if (dv === 10) return 'K'
    return dv.toString()
  }
  
  /**
   * Formatea el RUT con puntos y guión
   */
  private formatRut(numero: number, dv: string): string {
    const numeroStr = numero.toString()
    let formatted = ''
    
    // Agregar puntos cada 3 dígitos desde la derecha
    for (let i = numeroStr.length - 1, count = 0; i >= 0; i--, count++) {
      if (count > 0 && count % 3 === 0) {
        formatted = '.' + formatted
      }
      formatted = numeroStr[i] + formatted
    }
    
    return `${formatted}-${dv}`
  }
  
  /**
   * Verifica si es un RUT de empresa (mayor a 50.000.000)
   */
  isEmpresa(): boolean {
    return this._numero >= 50000000
  }
  
  /**
   * Verifica si es un RUT de persona natural
   */
  isPersonaNatural(): boolean {
    return this._numero < 50000000
  }
  
  /**
   * Obtiene el tipo de contribuyente basado en el RUT
   */
  getTipoContribuyente(): 'PERSONA_NATURAL' | 'EMPRESA' | 'GRAN_EMPRESA' {
    if (this._numero < 50000000) {
      return 'PERSONA_NATURAL'
    } else if (this._numero < 80000000) {
      return 'EMPRESA'
    } else {
      return 'GRAN_EMPRESA'
    }
  }
  
  /**
   * Compara con otro RUT
   */
  equals(other: RutAgenciaCreativa): boolean {
    return this._value === other._value
  }
  
  /**
   * Representación como string
   */
  toString(): string {
    return this.formatted
  }
  
  /**
   * Serialización para JSON
   */
  toJSON(): string {
    return this._value
  }
  
  /**
   * Crea un RUT desde string formateado o sin formato
   */
  static fromString(rut: string): RutAgenciaCreativa {
    return new RutAgenciaCreativa(rut)
  }
  
  /**
   * Valida si un string es un RUT válido sin crear la instancia
   */
  static isValid(rut: string): boolean {
    try {
      new RutAgenciaCreativa(rut)
      return true
    } catch {
      return false
    }
  }
  
  /**
   * Genera un RUT aleatorio válido (para testing)
   */
  static generateRandom(): RutAgenciaCreativa {
    const numero = Math.floor(Math.random() * (99999999 - 50000000) + 50000000)
    const dv = new RutAgenciaCreativa('1-1').calcularDigitoVerificador(numero)
    return new RutAgenciaCreativa(`${numero}${dv}`)
  }
}
/**
 * 🏢 Value Object: RutAgenciaMedios
 * 
 * Encapsula y valida el RUT de una agencia de medios chilena
 * Incluye validación de formato y dígito verificador
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

const RUT_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[\dK]$/

/**
 * Valida el dígito verificador de un RUT chileno
 */
function validarDigitoVerificador(rut: string, dv: string): boolean {
    const rutNumeros = rut.replace(/\./g, '')
    let suma = 0
    let multiplicador = 2

    for (let i = rutNumeros.length - 1; i >= 0; i--) {
        suma += parseInt(rutNumeros[i]) * multiplicador
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
    }

    const resto = suma % 11
    const expectedDv = resto === 0 ? '0' : resto === 1 ? 'K' : String(11 - resto)

    return expectedDv === dv.toUpperCase()
}

/**
 * Value Object para el RUT de una agencia de medios
 */
export class RutAgenciaMedios {
    private readonly _value: string
    private readonly _valido: boolean
    private readonly _formateado: string

    constructor(rut: string) {
        // Limpiar formato
        const rutLimpio = rut.replace(/[^0-9Kk]/g, '')

        if (rutLimpio.length < 8 || rutLimpio.length > 9) {
            throw new Error(`RUT inválido: formato incorrecto (${rut})`)
        }

        const partes = rutLimpio.match(/^(\d+)([\dK])$/)
        if (!partes) {
            throw new Error(`RUT inválido: no se pudo parsear (${rut})`)
        }

        const [, numeros, dv] = partes
        this._valido = validarDigitoVerificador(numeros, dv)

        if (!this._valido) {
            throw new Error(`RUT inválido: dígito verificador incorrecto (${rut})`)
        }

        this._value = rutLimpio
        this._formateado = this._formatear()
    }

    private _formatear(): string {
        const rut = this._value.slice(0, -1)
        const dv = this._value.slice(-1)
        const rutFormateado = rut.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        return `${rutFormateado}-${dv.toUpperCase()}`
    }

    get value(): string {
        return this._value
    }

    get formated(): string {
        return this._formateado
    }

    get isValid(): boolean {
        return this._valido
    }

    get sinDigito(): string {
        return this._value.slice(0, -1)
    }

    get digitoVerificador(): string {
        return this._value.slice(-1).toUpperCase()
    }

    equals(other: RutAgenciaMedios): boolean {
        return this._value === other._value
    }

    toString(): string {
        return this._formateado
    }

    toJSON(): string {
        return this._formateado
    }
}

/**
 * Crea un RutAgenciaMedios con validación
 * @throws Error si el RUT es inválido
 */
export function createRutAgenciaMedios(rut: string): RutAgenciaMedios {
    return new RutAgenciaMedios(rut)
}

/**
 * Valida si un string es un RUT válido sin crear el Value Object
 */
export function isValidRut(rut: string): boolean {
    try {
        new RutAgenciaMedios(rut)
        return true
    } catch {
        return false
    }
}

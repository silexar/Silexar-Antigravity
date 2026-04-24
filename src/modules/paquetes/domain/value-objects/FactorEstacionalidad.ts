/**
 * ENTITY: FACTOR ESTACIONAL - TIER 0 ENTERPRISE
 * 
 * @description Value Object para factores de ajuste por temporada.
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export interface FactorEstacionalProps {
    id: string
    nombre: string
    factor: number              // ej: 1.25 = +25%
    mesInicio: number          // 1-12
    mesFin: number
    diaInicio?: number         // 1-31 opcional
    diaFin?: number
    activo: boolean
    createdAt: Date
    updatedAt: Date
}

export class FactorEstacional {
    private constructor(private props: FactorEstacionalProps) { }

    static crear(params: {
        nombre: string
        factor: number
        mesInicio: number
        mesFin: number
        diaInicio?: number
        diaFin?: number
    }): Result<FactorEstacional> {
        if (!params.nombre || params.nombre.trim().length === 0) {
            return Result.fail('Nombre es requerido')
        }
        if (params.factor <= 0) {
            return Result.fail('Factor debe ser mayor a 0')
        }
        if (params.factor > 3) {
            return Result.fail('Factor no puede exceder 300%')
        }
        if (params.mesInicio < 1 || params.mesInicio > 12) {
            return Result.fail('Mes inicio debe ser 1-12')
        }
        if (params.mesFin < 1 || params.mesFin > 12) {
            return Result.fail('Mes fin debe ser 1-12')
        }

        const ahora = new Date()
        const props: FactorEstacionalProps = {
            id: `fac_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            nombre: params.nombre,
            factor: params.factor,
            mesInicio: params.mesInicio,
            mesFin: params.mesFin,
            diaInicio: params.diaInicio,
            diaFin: params.diaFin,
            activo: true,
            createdAt: ahora,
            updatedAt: ahora
        }

        return Result.ok(new FactorEstacional(props))
    }

    static fromPersistence(props: FactorEstacionalProps): FactorEstacional {
        return new FactorEstacional({ ...props })
    }

    // Getters
    get id(): string { return this.props.id }
    get nombre(): string { return this.props.nombre }
    get factor(): number { return this.props.factor }
    get label(): string { return `${this.props.nombre} (${Math.round((this.props.factor - 1) * 100)}%)` }
    get esAumento(): boolean { return this.props.factor > 1 }
    get esDescuento(): boolean { return this.props.factor < 1 }
    get activo(): boolean { return this.props.activo }

    // Business methods
    estaVigente(fecha: Date = new Date()): boolean {
        const mes = fecha.getMonth() + 1
        const dia = fecha.getDate()

        // Validar rango de meses
        if (this.props.mesInicio <= this.props.mesFin) {
            if (mes < this.props.mesInicio || mes > this.props.mesFin) return false
        } else {
            // Meses que cruzan el año (ej: nov-ene)
            if (mes < this.props.mesInicio && mes > this.props.mesFin) return false
        }

        // Validar rango de días si está definido
        if (this.props.diaInicio && this.props.diaFin) {
            if (dia < this.props.diaInicio || dia > this.props.diaFin) return false
        }

        return this.props.activo
    }

    getFactorParaFecha(fecha: Date = new Date()): number {
        return this.estaVigente(fecha) ? this.props.factor : 1.0
    }

    // Commands
    activar(): void {
        this.props.activo = true
        this.props.updatedAt = new Date()
    }

    desactivar(): void {
        this.props.activo = false
        this.props.updatedAt = new Date()
    }

    actualizar(factor: number): void {
        if (factor <= 0 || factor > 3) {
            throw new Error('Factor inválido')
        }
        this.props.factor = factor
        this.props.updatedAt = new Date()
    }

    toSnapshot(): FactorEstacionalProps {
        return { ...this.props }
    }
}

// Constants for common factors
export const FACTORES_POR_DEFECTO = {
    NAVIDAD: { nombre: 'Navidad', factor: 1.25, mesInicio: 12, mesFin: 12, diaInicio: 1, diaFin: 31 },
    VERANO: { nombre: 'Verano', factor: 1.05, mesInicio: 1, mesFin: 2, diaInicio: 15, diaFin: 28 },
    VUELTA_CLASES: { nombre: 'Vuelta a Clases', factor: 1.15, mesInicio: 3, mesFin: 3 },
    FIESTAS_PATRIAS: { nombre: 'Fiestas Patrias', factor: 1.22, mesInicio: 9, mesFin: 9, diaInicio: 18, diaFin: 20 },
    BLACK_FRIDAY: { nombre: 'Black Friday', factor: 1.20, mesInicio: 11, mesFin: 11, diaInicio: 29, diaFin: 29 },
    DIA_ENAMORADOS: { nombre: 'Día Enamorados', factor: 1.10, mesInicio: 2, mesFin: 2, diaInicio: 14, diaFin: 14 },
    INVIERNO: { nombre: 'Invierno', factor: 0.95, mesInicio: 6, mesFin: 8 },
    NORMAL: { nombre: 'Temporada Normal', factor: 1.0, mesInicio: 1, mesFin: 12 }
}
/**
 * VALUE OBJECT: DURACIÓN PUBLICIDAD
 * 
 * @description Duraciones estándar de piezas publicitarias.
 * Soporta: 5s, 10s, 15s, 20s, 30s, 45s, 60s
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export type DuracionValues = 5 | 10 | 15 | 20 | 30 | 45 | 60

const DURACIONES_VALIDAS: DuracionValues[] = [5, 10, 15, 20, 30, 45, 60]

const PRECIOS_RELATIVOS: Record<DuracionValues, number> = {
    5: 0.68,   // 68% del precio base
    10: 0.82,  // 82%
    15: 1.0,   // 100%
    20: 1.18,  // 118%
    30: 1.48,  // 148%
    45: 1.88,  // 188%
    60: 2.28   // 228%
}

export class DuracionPublicidad {
    private constructor(private valor: DuracionValues) { }

    get value(): DuracionValues { return this.valor }
    get segundos(): number { return this.valor }
    get label(): string { return `${this.valor}s` }

    static crear(valor: number): Result<DuracionPublicidad> {
        if (!valor) return Result.fail('Duración es requerida')

        const duracion = valor as DuracionValues
        if (!DURACIONES_VALIDAS.includes(duracion)) {
            return Result.fail(`Duración inválida. Válidas: ${DURACIONES_VALIDAS.join(', ')}s`)
        }
        return Result.ok(new DuracionPublicidad(duracion))
    }

    static todas(): DuracionValues[] {
        return [...DURACIONES_VALIDAS]
    }

    calcularPrecio(precioBase30s: number): number {
        const factor = PRECIOS_RELATIVOS[this.valor]
        return Math.round(precioBase30s * factor)
    }

    equals(other: DuracionPublicidad): boolean {
        return this.valor === other.valor
    }
}
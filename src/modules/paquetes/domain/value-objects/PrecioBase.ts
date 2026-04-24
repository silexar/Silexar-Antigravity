/**
 * VALUE OBJECT: PRECIO BASE
 * 
 * @description Valor comercial base del paquete.
 * Incluye lógica de formateo y conversión CLP.
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export class PrecioBase {
    private constructor(private valor: number) { }

    get value(): number { return this.valor }
    get valorFormateado(): string {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(this.valor)
    }

    static crear(valor: number): Result<PrecioBase> {
        if (valor === undefined || valor === null) {
            return Result.fail('Valor es requerido')
        }
        if (typeof valor !== 'number') {
            return Result.fail('Valor debe ser numérico')
        }
        if (valor < 0) {
            return Result.fail('Valor no puede ser negativo')
        }
        return Result.ok(new PrecioBase(Math.round(valor)))
    }

    aplicarFactor(factor: number): number {
        return Math.round(this.valor * factor)
    }

    equals(other: PrecioBase): boolean {
        return this.valor === other.valor
    }
}
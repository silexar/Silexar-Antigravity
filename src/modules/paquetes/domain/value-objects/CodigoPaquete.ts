/**
 * VALUE OBJECT: CÓDIGO PAQUETE
 * 
 * @description Identificador único con formato PAQ-YYYY-XXXXX
 * donde YYYY = año y XXXXX = secuencia única.
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export class CodigoPaquete {
    private constructor(private valor: string) { }

    get value(): string { return this.valor }

    static generar(): Result<CodigoPaquete> {
        const year = new Date().getFullYear()
        const secuencia = Math.floor(10000 + Math.random() * 90000)
        const codigo = `PAQ-${year}-${secuencia}`
        return Result.ok(new CodigoPaquete(codigo))
    }

    static crear(valor: string): Result<CodigoPaquete> {
        if (!valor) return Result.fail('Código es requerido')

        const pattern = /^PAQ-\d{4}-\d{5}$/
        if (!pattern.test(valor)) {
            return Result.fail('Formato inválido. Esperado: PAQ-YYYY-XXXXX')
        }
        return Result.ok(new CodigoPaquete(valor))
    }

    equals(other: CodigoPaquete): boolean {
        return this.valor === other.valor
    }

    toString(): string {
        return this.valor
    }
}
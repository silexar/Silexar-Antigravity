/**
 * VALUE OBJECT: NIVEL EXCLUSIVIDAD
 * 
 * @description Define el nivel de exclusividad del paquete.
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export type NivelExclusividadValues = 'EXCLUSIVO' | 'COMPARTIDO' | 'ABIERTO'

const NIVELES_VALIDOS: NivelExclusividadValues[] = ['EXCLUSIVO', 'COMPARTIDO', 'ABIERTO']

const DESCRIPCIONES: Record<NivelExclusividadValues, string> = {
    'EXCLUSIVO': 'Un único anunciante por horario/programa',
    'COMPARTIDO': 'Máximo 2-3 anunciantes del mismo rubro',
    'ABIERTO': 'Sin restricciones de competencia'
}

export class NivelExclusividad {
    private constructor(private valor: NivelExclusividadValues) { }

    get value(): NivelExclusividadValues { return this.valor }
    get descripcion(): string { return DESCRIPCIONES[this.valor] }

    static create(valor: string): Result<NivelExclusividad> {
        if (!valor) return Result.fail('Nivel de exclusividad es requerido')

        const upper = valor.toUpperCase() as NivelExclusividadValues
        if (!NIVELES_VALIDOS.includes(upper)) {
            return Result.fail(`Nivel inválido. Válidos: ${NIVELES_VALIDOS.join(', ')}`)
        }
        return Result.ok(new NivelExclusividad(upper))
    }

    static todos(): NivelExclusividadValues[] {
        return [...NIVELES_VALIDOS]
    }

    equals(other: NivelExclusividad): boolean {
        return this.valor === other.valor
    }
}
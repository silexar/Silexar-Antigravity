/**
 * VALUE OBJECT: TIPO PAQUETE
 * 
 * @description Clasificación del tipo de paquete comercial.
 * Define el comportamiento y pricing del paquete.
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export type TipoPaqueteValues =
    | 'PRIME'        // Horarios premium (alta audiencia)
    | 'REPARTIDO'    // Distribución equitativa día
    | 'NOCTURNO'     // Horarios económicos
    | 'SENALES'      // Variables (temperatura, hora, tráfico)
    | 'ESPECIAL'     // Promocional temporal
    | 'EXCLUSIVO'    // Auspicios únicos por programa

const TIPOS_VALIDOS: TipoPaqueteValues[] = [
    'PRIME', 'REPARTIDO', 'NOCTURNO', 'SENALES', 'ESPECIAL', 'EXCLUSIVO'
]

const DESCRIPCIONES: Record<TipoPaqueteValues, string> = {
    'PRIME': 'Horarios premium con alta audiencia',
    'REPARTIDO': 'Distribución equitativa a lo largo del día',
    'NOCTURNO': 'Horarios económicos para presupuestos ajustados',
    'SENALES': 'Contenido variable según condiciones del entorno',
    'ESPECIAL': 'Ofertas promocionales temporales',
    'EXCLUSIVO': 'Auspicios únicos por programa sin competencia'
}

export class TipoPaquete {
    private constructor(private valor: TipoPaqueteValues) { }

    get value(): TipoPaqueteValues { return this.valor }
    get descripcion(): string { return DESCRIPCIONES[this.valor] }
    get label(): string { return this.valor }

    static create(valor: string): Result<TipoPaquete> {
        if (!valor) return Result.fail('Tipo es requerido')

        const upper = valor.toUpperCase() as TipoPaqueteValues
        if (!TIPOS_VALIDOS.includes(upper)) {
            return Result.fail(`Tipo inválido. Válidos: ${TIPOS_VALIDOS.join(', ')}`)
        }
        return Result.ok(new TipoPaquete(upper))
    }

    static todos(): TipoPaqueteValues[] {
        return [...TIPOS_VALIDOS]
    }

    equals(other: TipoPaquete): boolean {
        return this.valor === other.valor
    }
}
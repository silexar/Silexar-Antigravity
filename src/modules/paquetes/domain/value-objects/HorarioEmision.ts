/**
 * VALUE OBJECT: HORARIO EMISIÓN
 * 
 * @description Define el rango horario de emisión del paquete.
 * Formato 24h (00:00 - 23:59)
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export class HorarioEmision {
    private constructor(
        private inicio: string,
        private fin: string
    ) { }

    get horaInicio(): string { return this.inicio }
    get horaFin(): string { return this.fin }
    get label(): string { return `${this.inicio} - ${this.fin}` }

    static crear(inicio: string, fin: string): Result<HorarioEmision> {
        if (!inicio || !fin) return Result.fail('Horario de inicio y fin son requeridos')

        const pattern = /^([01]\d|2[0-3]):([0-5]\d)$/
        if (!pattern.test(inicio)) {
            return Result.fail('Formato hora inicio inválido. Usar HH:MM (00:00 - 23:59)')
        }
        if (!pattern.test(fin)) {
            return Result.fail('Formato hora fin inválido. Usar HH:MM (00:00 - 23:59)')
        }

        const [h1, m1] = inicio.split(':').map(Number)
        const [h2, m2] = fin.split(':').map(Number)
        const min1 = h1 * 60 + m1
        const min2 = h2 * 60 + m2

        if (min2 <= min1) {
            return Result.fail('Hora fin debe ser mayor a hora inicio')
        }

        return Result.ok(new HorarioEmision(inicio, fin))
    }

    getDuracionMinutos(): number {
        const [h1, m1] = this.inicio.split(':').map(Number)
        const [h2, m2] = this.fin.split(':').map(Number)
        return (h2 * 60 + m2) - (h1 * 60 + m1)
    }

    equals(other: HorarioEmision): boolean {
        return this.inicio === other.inicio && this.fin === other.fin
    }
}
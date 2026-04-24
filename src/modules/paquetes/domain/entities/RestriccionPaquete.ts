/**
 * ENTITY: RESTRICCIÓN PAQUETE - TIER 0 ENTERPRISE
 * 
 * @description Define las restricciones y validaciones que aplican a un paquete.
 * Incluye restricciones por industria, horario, competencia y exclusividad.
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export type TipoRestriccion = 'INDUSTRIA' | 'HORARIO' | 'EXCLUSIVIDAD' | 'COMPETENCIA' | 'CONTENIDO'

export interface RestriccionPaqueteProps {
    id: string
    paqueteId: string
    tipo: TipoRestriccion
    descripcion: string
    rubroAfectado?: string        // Para restricciones de industria
    horarioInicio?: string        // Para restricciones horarias
    horarioFin?: string
    diasAplicables?: string[]     // ['L','M','M','J','V','S','D']
    anunciantesExcluidos?: string[] // Nombres de competidores
    activos: boolean
    prioridad: number             // 1 = crítica, 5 = baja
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
}

export class RestriccionPaquete {
    private constructor(private props: RestriccionPaqueteProps) { }

    static create(params: {
        paqueteId: string
        tipo: TipoRestriccion
        descripcion: string
        rubroAfectado?: string
        horarioInicio?: string
        horarioFin?: string
        diasAplicables?: string[]
        anunciantesExcluidos?: string[]
        prioridad?: number
        creadoPor: string
    }): Result<RestriccionPaquete> {
        if (!params.paqueteId) {
            return Result.fail('paqueteId es requerido')
        }
        if (!params.descripcion || params.descripcion.trim().length === 0) {
            return Result.fail('Descripción es requerida')
        }

        const ahora = new Date()
        const props: RestriccionPaqueteProps = {
            id: `rst_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            paqueteId: params.paqueteId,
            tipo: params.tipo,
            descripcion: params.descripcion.trim(),
            rubroAfectado: params.rubroAfectado,
            horarioInicio: params.horarioInicio,
            horarioFin: params.horarioFin,
            diasAplicables: params.diasAplicables,
            anunciantesExcluidos: params.anunciantesExcluidos,
            activos: true,
            prioridad: params.prioridad ?? 3,
            createdAt: ahora,
            updatedAt: ahora,
            createdBy: params.creadoPor,
            updatedBy: params.creadoPor
        }

        return Result.ok(new RestriccionPaquete(props))
    }

    static fromPersistence(props: RestriccionPaqueteProps): RestriccionPaquete {
        return new RestriccionPaquete({ ...props })
    }

    // Getters
    get id(): string { return this.props.id }
    get paqueteId(): string { return this.props.paqueteId }
    get tipo(): TipoRestriccion { return this.props.tipo }
    get descripcion(): string { return this.props.descripcion }
    get rubroAfectado(): string | undefined { return this.props.rubroAfectado }
    get horarioInicio(): string | undefined { return this.props.horarioInicio }
    get horarioFin(): string | undefined { return this.props.horarioFin }
    get diasAplicables(): string[] { return [...(this.props.diasAplicables || [])] }
    get anunciantesExcluidos(): string[] { return [...(this.props.anunciantesExcluidos || [])] }
    get activos(): boolean { return this.props.activos }
    get prioridad(): number { return this.props.prioridad }

    // Business methods
    estaActiva(): boolean {
        return this.props.activos
    }

    esCritica(): boolean {
        return this.props.prioridad <= 2 && this.props.activos
    }

    /**
     * Valida si un anunciante puede ser añadido al paquete
     */
    permiteAnunciante(nombreAnunciante: string, rubro?: string): { permitido: boolean; motivo?: string } {
        if (!this.props.activos) {
            return { permitido: true }
        }

        // Validar exclusión de competidores
        if (this.props.anunciantesExcluidos) {
            const excluido = this.props.anunciantesExcluidos.some(
                a => nombreAnunciante.toLowerCase().includes(a.toLowerCase())
            )
            if (excluido) {
                return {
                    permitido: false,
                    motivo: `Anunciante excluded by restriction: ${this.props.descripcion}`
                }
            }
        }

        // Validar rubro
        if (this.props.rubroAfectado && rubro) {
            if (rubro.toLowerCase() === this.props.rubroAfectado.toLowerCase()) {
                return {
                    permitido: false,
                    motivo: `Rubro excluded by restriction: ${this.props.descripcion}`
                }
            }
        }

        return { permitido: true }
    }

    /**
     * Valida si un horario es compatible con la restricción
     */
    permiteHorario(hora: string, dia: string): boolean {
        if (!this.props.activos) return true

        // Validar día
        if (this.props.diasAplicables && !this.props.diasAplicables.includes(dia)) {
            return true // No aplica este día
        }

        // Validar hora si está definida
        if (this.props.horarioInicio && this.props.horarioFin) {
            const [h1, m1] = this.props.horarioInicio.split(':').map(Number)
            const [h2, m2] = this.props.horarioFin.split(':').map(Number)
            const [h, m] = hora.split(':').map(Number)

            const minHora = h * 60 + m
            const minInicio = h1 * 60 + m1
            const minFin = h2 * 60 + m2

            if (minHora >= minInicio && minHora <= minFin) {
                return false // Está dentro del horario restringido
            }
        }

        return true
    }

    // Commands
    activar(responsable: string): void {
        this.props.activos = true
        this.props.updatedAt = new Date()
        this.props.updatedBy = responsable
    }

    desactivar(responsable: string): void {
        this.props.activos = false
        this.props.updatedAt = new Date()
        this.props.updatedBy = responsable
    }

    actualizar(params: {
        descripcion?: string
        rubroAfectado?: string
        prioridad?: number
        actualizadoPor: string
    }): void {
        if (params.descripcion) this.props.descripcion = params.descripcion.trim()
        if (params.rubroAfectado !== undefined) this.props.rubroAfectado = params.rubroAfectado
        if (params.prioridad !== undefined) this.props.prioridad = params.prioridad
        this.props.updatedAt = new Date()
        this.props.updatedBy = params.actualizadoPor
    }

    toSnapshot(): RestriccionPaqueteProps {
        return { ...this.props }
    }
}
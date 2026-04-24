/**
 * ENTITY: DISPONIBILIDAD INVENTARIO - TIER 0 ENTERPRISE
 * 
 * @description Control de disponibilidad y cupos por paquete y fecha.
 * Proporciona métricas de ocupación en tiempo real.
 * 
 * @version 1.0.0
 */

import { Result } from '../../../shared/domain/Result'

export interface DisponibilidadInventarioProps {
    id: string
    paqueteId: string
    fecha: Date
    cuposTotales: number
    cuposOcupados: number
    disponiblePct: number       // Porcentaje calculado
    spotsProgramados: number
    revenueEstimado: number    // Revenue potencial basado en cupos
    updatedAt: Date
}

export class DisponibilidadInventario {
    private constructor(private props: DisponibilidadInventarioProps) { }

    static crear(params: {
        paqueteId: string
        fecha: Date
        cuposTotales: number
        precioPorCupo: number
    }): Result<DisponibilidadInventario> {
        if (!params.paqueteId) {
            return Result.fail('paqueteId es requerido')
        }
        if (params.cuposTotales < 0) {
            return Result.fail('cuposTotales no puede ser negativo')
        }

        const disponiblePct = params.cuposTotales > 0 ? 100 : 0
        const props: DisponibilidadInventarioProps = {
            id: `disp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            paqueteId: params.paqueteId,
            fecha: params.fecha,
            cuposTotales: params.cuposTotales,
            cuposOcupados: 0,
            disponiblePct,
            spotsProgramados: 0,
            revenueEstimado: params.cuposTotales * params.precioPorCupo,
            updatedAt: new Date()
        }

        return Result.ok(new DisponibilidadInventario(props))
    }

    static fromPersistence(props: DisponibilidadInventarioProps): DisponibilidadInventario {
        return new DisponibilidadInventario({ ...props })
    }

    // Getters
    get id(): string { return this.props.id }
    get paqueteId(): string { return this.props.paqueteId }
    get fecha(): Date { return this.props.fecha }
    get cuposTotales(): number { return this.props.cuposTotales }
    get cuposOcupados(): number { return this.props.cuposOcupados }
    get disponiblePct(): number { return this.props.disponiblePct }
    get spotsProgramados(): number { return this.props.spotsProgramados }
    get revenueEstimado(): number { return this.props.revenueEstimado }

    get cuposDisponibles(): number {
        return Math.max(0, this.props.cuposTotales - this.props.cuposOcupados)
    }

    get estaSaturado(): boolean {
        return this.props.disponiblePct <= 10
    }

    get estaCritico(): boolean {
        return this.props.disponiblePct <= 5
    }

    // Business methods
    calcularUtilizacion(): number {
        if (this.props.cuposTotales === 0) return 0
        return Math.round((this.props.cuposOcupados / this.props.cuposTotales) * 10000) / 100
    }

    /**
     * Reservar cupos para un nuevo contrato
     */
    reservar(cantidad: number, precioUnitario: number): { exito: boolean; mensaje: string } {
        const disponibles = this.cuposDisponibles

        if (cantidad > disponibles) {
            return {
                exito: false,
                mensaje: `Solo hay ${disponibles} cupos disponibles`
            }
        }

        this.props.cuposOcupados += cantidad
        this.props.disponiblePct = Math.round(((this.props.cuposTotales - this.props.cuposOcupados) / this.props.cuposTotales) * 10000) / 100
        this.props.revenueEstimado += cantidad * precioUnitario
        this.props.updatedAt = new Date()

        return { exito: true, mensaje: `${cantidad} cupos reservados exitosamente` }
    }

    /**
     * Liberar cupos reservados
     */
    liberar(cantidad: number, precioUnitario: number): void {
        this.props.cuposOcupados = Math.max(0, this.props.cuposOcupados - cantidad)
        this.props.disponiblePct = this.props.cuposTotales > 0
            ? Math.round(((this.props.cuposTotales - this.props.cuposOcupados) / this.props.cuposTotales) * 10000) / 100
            : 0
        this.props.revenueEstimado = Math.max(0, this.props.revenueEstimado - (cantidad * precioUnitario))
        this.props.updatedAt = new Date()
    }

    /**
     * Registrar spot programado
     */
    programarSpot(): void {
        this.props.spotsProgramados++
        this.props.updatedAt = new Date()
    }

    /**
     * Actualizar totals
     */
    actualizarTotales(cuposTotales: number, precioPorCupo: number): void {
        this.props.cuposTotales = cuposTotales
        this.props.disponiblePct = cuposTotales > 0
            ? Math.round(((cuposTotales - this.props.cuposOcupados) / cuposTotales) * 10000) / 100
            : 0
        this.props.revenueEstimado = cuposTotales * precioPorCupo
        this.props.updatedAt = new Date()
    }

    toSnapshot(): DisponibilidadInventarioProps {
        return { ...this.props }
    }
}
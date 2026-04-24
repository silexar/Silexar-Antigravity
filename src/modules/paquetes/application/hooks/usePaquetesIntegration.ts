/**
 * MODULE: PAQUETES - INTEGRATION HOOKS
 * 
 * @description Hooks de integración con otros módulos.
 * Proporciona la verdad absoluta de paquetes para módulos relacionados.
 * 
 * @version 1.0.0
 */

/**
 * usePaquetesIntegration
 * 
 * Hook para obtener datos de paquetes desde el módulo.
 * Usado por: Vencimientos, Contratos, Campañas
 */
'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PaqueteBasico {
    id: string
    codigo: string
    nombre: string
    tipo: string
    precioBase: number
    precioActual: number
    estado: string
}

export interface DisponibilidadPaquete {
    paqueteId: string
    fecha: string
    cuposTotales: number
    cuposOcupados: number
    disponiblePct: number
}

export function usePaquetesIntegration() {
    const [loading, setLoading] = useState(false)

    /**
     * Obtener listado de paquetes disponibles para selección
     */
    const obtenerPaquetes = useCallback(async (filtros?: {
        tipo?: string
        estado?: string
        editoraId?: string
    }): Promise<PaqueteBasico[]> => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filtros?.tipo) params.set('tipo', filtros.tipo)
            if (filtros?.estado) params.set('estado', filtros.estado)
            if (filtros?.editoraId) params.set('editoraId', filtros.editoraId)
            params.set('limite', '100')

            const response = await fetch(`/api/paquetes?${params.toString()}`)
            if (!response.ok) throw new Error('Error consultando paquetes')

            const data = await response.json()
            return data.items?.map((p: any) => ({
                id: p.id,
                codigo: p.codigo,
                nombre: p.nombre,
                tipo: p.tipo,
                precioBase: p.precioBase,
                precioActual: p.precioActual,
                estado: p.estado
            })) || []
        } catch (error) {
            console.error('[usePaquetesIntegration] obtenerPaquetes error:', error)
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    /**
     * Obtener detalle de un paquete específico
     */
    const obtenerDetallePaquete = useCallback(async (id: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/paquetes/${id}`)
            if (!response.ok) throw new Error('Paquete no encontrado')
            return await response.json()
        } catch (error) {
            console.error('[usePaquetesIntegration] obtenerDetallePaquete error:', error)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    /**
     * Obtener disponibilidad de un paquete para un período
     */
    const obtenerDisponibilidad = useCallback(async (
        paqueteId: string,
        desde?: string,
        hasta?: string
    ): Promise<DisponibilidadPaquete[]> => {
        try {
            const params = new URLSearchParams({ paqueteId })
            if (desde) params.set('desde', desde)
            if (hasta) params.set('hasta', hasta)

            const response = await fetch(`/api/paquetes/disponibilidad?${params.toString()}`)
            if (!response.ok) throw new Error('Error consultando disponibilidad')

            const data = await response.json()
            return data.data?.map((d: any) => ({
                paqueteId: d.paqueteId || paqueteId,
                fecha: d.fecha,
                cuposTotales: d.cuposTotales,
                cuposOcupados: d.cuposOcupados,
                disponiblePct: d.disponiblePct
            })) || []
        } catch (error) {
            console.error('[usePaquetesIntegration] obtenerDisponibilidad error:', error)
            return []
        }
    }, [])

    /**
     * Validar si un paquete puede ser vendido (está activo y vigente)
     */
    const puedeSerVendido = useCallback(async (id: string): Promise<boolean> => {
        try {
            const paquete = await obtenerDetallePaquete(id)
            if (!paquete) return false
            return paquete.estado === 'ACTIVO' &&
                new Date() >= new Date(paquete.vigencia_desde) &&
                new Date() <= new Date(paquete.vigencia_hasta)
        } catch {
            return false
        }
    }, [obtenerDetallePaquete])

    /**
     * Actualizar disponibilidad de un paquete
     */
    const actualizarDisponibilidad = useCallback(async (
        paqueteId: string,
        fecha: string,
        cuposTotales: number,
        cuposOcupados: number
    ): Promise<boolean> => {
        try {
            const response = await fetch('/api/paquetes/disponibilidad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paqueteId, fecha, cuposTotales, cuposOcupados })
            })
            return response.ok
        } catch (error) {
            console.error('[usePaquetesIntegration] actualizarDisponibilidad error:', error)
            return false
        }
    }, [])

    return {
        loading,
        obtenerPaquetes,
        obtenerDetallePaquete,
        obtenerDisponibilidad,
        puedeSerVendido,
        actualizarDisponibilidad
    }
}

/**
 * usePaquetesParaContrato
 * 
 * Hook especializado para integración con módulo Contratos.
 * Valida disponibilidad y pricing al crear/modificar contratos.
 */
export function usePaquetesParaContrato() {
    const { obtenerPaquetes, obtenerDisponibilidad, puedeSerVendido } = usePaquetesIntegration()

    /**
     * Validar que un paquete está disponible para un contrato
     */
    const validarPaqueteParaContrato = useCallback(async (
        paqueteId: string,
        fechaContrato: string
    ): Promise<{
        valido: boolean
        mensaje: string
        paquete?: PaqueteBasico
    }> => {
        // Verificar que el paquete existe y está activo
        const puedeVender = await puedeSerVendido(paqueteId)
        if (!puedeVender) {
            return { valido: false, mensaje: 'Paquete no disponible para venta' }
        }

        // Verificar disponibilidad en la fecha del contrato
        const disp = await obtenerDisponibilidad(paqueteId, fechaContrato, fechaContrato)
        if (disp.length > 0) {
            const disponibilidad = disp[0]
            if (disponibilidad.disponiblePct <= 0) {
                return { valido: false, mensaje: 'Paquete sin disponibilidad en la fecha solicitada' }
            }
            if (disponibilidad.disponiblePct < 20) {
                return {
                    valido: true,
                    mensaje: `Disponibilidad limitada (${Math.round(disponibilidad.disponiblePct)}%)`,
                    paquete: undefined
                }
            }
        }

        return { valido: true, mensaje: 'Paquete disponible' }
    }, [puedeSerVendido, obtenerDisponibilidad])

    return {
        obtenerPaquetes,
        validarPaqueteParaContrato
    }
}

/**
 * usePaquetesParaCampana
 * 
 * Hook especializado para integración con módulo Campañas.
 * Obtiene paquetes compatibles con la estructura de campaña.
 */
export function usePaquetesParaCampana() {
    const { obtenerPaquetes } = usePaquetesIntegration()

    /**
     * Obtener paquetes compatibles con una campaña
     * Filtra por tipo de paquete y disponibilidad
     */
    const obtenerPaquetesParaCampana = useCallback(async (params?: {
        tipoCampana?: 'PRIME' | 'REPARTIDO' | 'NOCTURNO' | 'ESPECIAL'
        editoraId?: string
    }): Promise<PaqueteBasico[]> => {
        const filtros: any = { estado: 'ACTIVO' }
        if (params?.tipoCampana) filtros.tipo = params.tipoCampana
        if (params?.editoraId) filtros.editoraId = params.editoraId

        const paquetes = await obtenerPaquetes(filtros)

        // Filtrar solo paquetes vigentes
        return paquetes.filter(p => p.estado === 'ACTIVO')
    }, [obtenerPaquetes])

    return {
        obtenerPaquetesParaCampana
    }
}
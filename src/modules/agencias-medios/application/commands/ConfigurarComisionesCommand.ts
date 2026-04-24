/**
 * 🏢 Command: ConfigurarComisionesCommand
 * 
 * Comando para configurar la estructura de comisiones de una agencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { z } from 'zod'

export const ConfigurarComisionesCommandSchema = z.object({
    agenciaId: z.string().uuid(),
    tenantId: z.string().uuid(),

    // Tipo de comisión
    tipo: z.enum(['PORCENTAJE', 'FEE_FIJO', 'HYBRID', 'PERFORMANCE', 'VOLUME']),

    // Porcentajes por tipo de medio
    porcentajeMediosTradicionales: z.number().min(0).max(100).optional(),
    porcentajeMediosDigitales: z.number().min(0).max(100).optional(),
    porcentajeProgrammatic: z.number().min(0).max(100).optional(),
    porcentajeProduccion: z.number().min(0).max(100).optional(),

    // Fee fijo (si aplica)
    feeFijo: z.number().positive().optional(),
    feeFrecuencia: z.enum(['mensual', 'trimestral', 'anual']).optional(),

    // Incentivos
    incentives: z.object({
        crecimientoMinimo: z.number().min(0).max(100).optional(),
        bonusPorcentaje: z.number().min(0).max(100).optional(),
        nuevoClienteBonus: z.number().positive().optional()
    }).optional(),

    // Notas
    notas: z.string().max(500).optional(),

    // Usuario que configura
    configuradoPor: z.string().uuid()
})

export type ConfigurarComisionesCommand = z.infer<typeof ConfigurarComisionesCommandSchema>

export interface ConfigurarComisionesResult {
    agenciaId: string
    estructuraComision: {
        tipo: string
        porcentajePromedio: number
        comisionMin: number
        comisionMax: number
    }
    validaciones: {
        esValidaParaNivel: boolean
        advertencias: string[]
    }
    alertas: string[]
}

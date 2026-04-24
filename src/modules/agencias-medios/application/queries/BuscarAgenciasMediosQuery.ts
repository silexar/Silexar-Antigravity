/**
 * 🏢 Query: BuscarAgenciasMediosQuery
 * 
 * Query para buscar agencias de medios con filtros avanzados
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { z } from 'zod'

export const BuscarAgenciasMediosQuerySchema = z.object({
    tenantId: z.string().uuid(),

    // Filtros
    busquedaTexto: z.string().optional(),
    tipoAgencia: z.string().optional(),
    nivelColaboracion: z.string().optional(),
    estado: z.enum(['activa', 'inactiva', 'suspendida', 'pendiente']).optional(),
    ciudad: z.string().optional(),
    pais: z.string().optional(),

    // Especializaciones
    especializacion: z.string().optional(),
    certificacion: z.string().optional(),

    // Score
    scoreMin: z.number().min(0).max(1000).optional(),
    scoreMax: z.number().min(0).max(1000).optional(),

    // Revenue
    revenueMin: z.number().optional(),
    revenueMax: z.number().optional(),

    // Solo agencias que necesitan atención
    necesitaAtencion: z.boolean().optional(),

    // Solo premium
    esPremium: z.boolean().optional(),

    // Paginación
    limite: z.number().min(1).max(100).optional().default(20),
    offset: z.number().min(0).optional().default(0),

    // Ordenamiento
    ordenarPor: z.enum(['nombre', 'fechaCreacion', 'scorePartnership', 'revenueAnual']).optional().default('fechaCreacion'),
    ordenDireccion: z.enum(['asc', 'desc']).optional().default('desc'),

    // Incluir métricas
    incluirMetricas: z.boolean().optional().default(false)
})

export type BuscarAgenciasMediosQuery = z.infer<typeof BuscarAgenciasMediosQuerySchema>

export interface BuscarAgenciasMediosResult {
    agencias: Array<{
        id: string
        codigo: string
        nombre: string
        rut: string
        tipo: string
        nivel: string
        score: number
        estado: string
        ciudad: string | null
        email: string | null
    }>
    total: number
    metricas?: {
        totalAgencias: number
        scorePromedio: number
        revenueTotal: number
    }
    filtrosAplicados: string[]
}

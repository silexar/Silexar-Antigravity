/**
 * 🏢 Query: ObtenerDetalleAgenciaQuery
 * 
 * Query para obtener el detalle completo de una agencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { z } from 'zod'

export const ObtenerDetalleAgenciaQuerySchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),

    // Opciones de inclusión
    incluirContactos: z.boolean().optional().default(true),
    incluirPerformance: z.boolean().optional().default(true),
    incluirComisiones: z.boolean().optional().default(false),
    incluirCertificaciones: z.boolean().optional().default(false),
    incluirCampanas: z.boolean().optional().default(false),
    incluirContratos: z.boolean().optional().default(false),
    incluirHistorico: z.boolean().optional().default(false),
    incluirAlertas: z.boolean().optional().default(false)
})

export type ObtenerDetalleAgenciaQuery = z.infer<typeof ObtenerDetalleAgenciaQuerySchema>

export interface ObtenerDetalleAgenciaResult {
    // Datos básicos
    agencia: {
        id: string
        codigo: string
        rut: string
        razonSocial: string
        nombreComercial: string | null
        tipo: string
        nivel: string
        score: number
        tendencia: 'up' | 'down' | 'stable'
        clasificacion: string
        estado: string
    }

    // Información de contacto
    contacto: {
        email: string
        telefono: string
        paginaWeb: string
        direccion: string
        ciudad: string
        region: string
        pais: string
    }

    // Clasificación
    clasificacion: {
        tipoAgencia: string
        nivelColaboracion: string
        especializaciones: string[]
        capacidades: string[]
    }

    // Metadatos
    metadata: {
        fechaCreacion: Date
        fechaModificacion: Date | null
        creadoPor: string
    }

    // Datos opcionales
    contactos?: Array<{
        id: string
        nombre: string
        apellido: string
        email: string
        cargo: string | null
        telefono: string | null
        esPrincipal: boolean
        esDecisor: boolean
    }>

    performance?: {
        revenueYTD: number
        revenueAnualAnterior: number
        crecimientoYoY: number
        satisfactionScore: number
        campaignsActivas: number
        campaignsCompletadas: number
        renewalProbability: number
        tendenciaScore: 'up' | 'down' | 'stable'
    }

    comisiones?: {
        tipo: string
        porcentajePromedio: number
        limites: { min: number; max: number }
    }

    certificaciones?: Array<{
        nombre: string
        nivel: string
        fechaObtencion: Date
        verificada: boolean
    }>

    campanas?: {
        total: number
        activas: number
        completadas: number
    }

    alertas?: Array<{
        id: string
        tipo: string
        mensaje: string
        fechaCreacion: Date
    }>
}

/**
 * 🏢 Command: CrearAgenciaMediosCommand
 * 
 * Comando para crear una nueva agencia de medios en el sistema
 * Incluye validación automática y análisis con IA
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { z } from 'zod'
import { TipoAgenciaMediosValue } from '../../domain/value-objects/TipoAgenciaMedios'
import { NivelColaboracionValue } from '../../domain/value-objects/NivelColaboracion'

export const CrearAgenciaMediosCommandSchema = z.object({
    tenantId: z.string().uuid(),
    rut: z.string().min(8).max(12),
    razonSocial: z.string().min(2).max(200),
    nombreComercial: z.string().max(100).optional(),

    // Clasificación
    tipoAgencia: z.nativeEnum(TipoAgenciaMediosValue),
    nivelColaboracion: z.nativeEnum(NivelColaboracionValue).optional(),

    // Información de contacto
    emailGeneral: z.string().email().optional(),
    telefonoGeneral: z.string().max(20).optional(),
    paginaWeb: z.string().url().optional(),
    direccion: z.string().max(300).optional(),
    ciudad: z.string().max(100).optional(),
    region: z.string().max(100).optional(),
    pais: z.string().max(50).optional().default('Chile'),

    // Información comercial
    giroActividad: z.string().max(200).optional(),
    fechaFundacion: z.coerce.date().optional(),
    empleadosCantidad: z.number().int().positive().optional(),

    // Especializaciones
    especializacionesVerticales: z.array(z.string()).optional().default([]),
    capacidadesDigitales: z.array(z.string()).optional().default([]),
    certificaciones: z.array(z.string()).optional().default([]),

    // Información financiera
    revenueAnual: z.number().positive().optional(),
    comisionDefault: z.number().min(0).max(100).optional(),

    // Contacto principal
    contactoPrincipal: z.object({
        nombre: z.string().min(2).max(100),
        apellido: z.string().min(2).max(100),
        email: z.string().email(),
        telefono: z.string().max(20).optional(),
        telefonoMovil: z.string().max(20).optional(),
        cargo: z.string().max(100).optional(),
        esDecisor: z.boolean().optional().default(false),
        esInfluencer: z.boolean().optional().default(false)
    }).optional(),

    // Opciones de configuración
    opciones: z.object({
        enviarNotificaciones: z.boolean().optional().default(true),
        crearContratoMarco: z.boolean().optional().default(false),
        validarSII: z.boolean().optional().default(true)
    }).optional(),

    // Usuario que crea
    creadoPor: z.string().uuid()
})

export type CrearAgenciaMediosCommand = z.infer<typeof CrearAgenciaMediosCommandSchema>

export interface CrearAgenciaMediosResult {
    agenciaId: string
    agencia: {
        nombre: string
        rut: string
        tipo: string
        nivel: string
        scoreInicial: number
    }
    contactoId?: string
    alertas: string[]
    proximosPasos: string[]
}

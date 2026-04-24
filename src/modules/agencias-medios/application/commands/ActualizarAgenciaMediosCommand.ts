/**
 * 🏢 Command: ActualizarAgenciaMediosCommand
 * 
 * Comando para actualizar información de una agencia existente
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { z } from 'zod'
import { TipoAgenciaMediosValue } from '../../domain/value-objects/TipoAgenciaMedios'
import { NivelColaboracionValue } from '../../domain/value-objects/NivelColaboracion'

export const ActualizarAgenciaMediosCommandSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),

    // Información básica (opcional para actualización parcial)
    razonSocial: z.string().min(2).max(200).optional(),
    nombreComercial: z.string().max(100).optional(),

    // Clasificación
    tipoAgencia: z.nativeEnum(TipoAgenciaMediosValue).optional(),
    nivelColaboracion: z.nativeEnum(NivelColaboracionValue).optional(),

    // Información de contacto
    emailGeneral: z.string().email().optional(),
    telefonoGeneral: z.string().max(20).optional(),
    paginaWeb: z.string().url().optional(),
    direccion: z.string().max(300).optional(),
    ciudad: z.string().max(100).optional(),
    region: z.string().max(100).optional(),

    // Información comercial
    giroActividad: z.string().max(200).optional(),
    empleadosCantidad: z.number().int().positive().optional(),

    // Especializaciones
    especializacionesVerticales: z.array(z.string()).optional(),
    capacidadesDigitales: z.array(z.string()).optional(),
    certificaciones: z.array(z.string()).optional(),

    // Información financiera
    revenueAnual: z.number().positive().optional(),
    comisionDefault: z.number().min(0).max(100).optional(),

    // Estado
    activa: z.boolean().optional(),
    estado: z.enum(['activa', 'inactiva', 'suspendida', 'pendiente']).optional(),

    // Usuario que actualiza
    actualizadoPor: z.string().uuid()
})

export type ActualizarAgenciaMediosCommand = z.infer<typeof ActualizarAgenciaMediosCommandSchema>

export interface ActualizarAgenciaMediosResult {
    agenciaId: string
    agencia: {
        nombre: string
        rut: string
        tipo: string
        nivel: string
    }
    alertas: string[]
    proximosPasos: string[]
}

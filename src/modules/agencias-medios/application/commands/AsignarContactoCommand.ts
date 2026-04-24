/**
 * 🏢 Command: AsignarContactoCommand
 * 
 * Comando para crear o actualizar un contacto de agencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { z } from 'zod'
import { RolContactoAgencia, NivelDecision } from '../../domain/entities/ContactoAgencia'

export const AsignarContactoCommandSchema = z.object({
    agenciaId: z.string().uuid(),
    tenantId: z.string().uuid(),

    // Datos del contacto
    id: z.string().uuid().optional(), // Si tiene ID, actualiza

    nombre: z.string().min(2).max(100),
    apellido: z.string().min(2).max(100),
    email: z.string().email(),
    telefono: z.string().max(20).optional(),
    telefonoMovil: z.string().max(20).optional(),
    cargo: z.string().max(100).optional(),
    departamento: z.string().max(100).optional(),

    // Rol y decisión
    rol: z.nativeEnum(RolContactoAgencia),
    nivelDecision: z.nativeEnum(NivelDecision),
    esPrincipal: z.boolean().optional().default(false),
    esDecisor: z.boolean().optional().default(false),
    esInfluencer: z.boolean().optional().default(false),

    // Información adicional
    linkedIn: z.string().url().optional(),
    notas: z.string().max(1000).optional(),

    // Usuario que asigna
    asignadoPor: z.string().uuid()
})

export type AsignarContactoCommand = z.infer<typeof AsignarContactoCommandSchema>

export interface AsignarContactoResult {
    contactoId: string
    contacto: {
        nombre: string
        apellido: string
        email: string
        cargo: string | null
        esPrincipal: boolean
    }
    alertas: string[]
}

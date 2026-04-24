/**
 * COMMANDS: PAQUETE COMMANDS
 * 
 * @description Commands para operaciones de escritura en el módulo Paquetes.
 * Implementa el patrón CQS (Command Query Separation).
 * 
 * @version 1.0.0
 */

export interface CrearPaqueteCommand {
    nombre: string
    descripcion: string
    tipo: 'PRIME' | 'REPARTIDO' | 'NOCTURNO' | 'SENALES' | 'ESPECIAL' | 'EXCLUSIVO'
    editoraId: string
    editoraNombre: string
    programaId: string
    programaNombre: string
    horario: { inicio: string; fin: string }
    diasSemana: string[]
    duraciones: number[]
    precioBase: number
    nivelExclusividad: 'EXCLUSIVO' | 'COMPARTIDO' | 'ABIERTO'
    vigenciaDesde: Date
    vigenciaHasta: Date
    creadoPor: string
}

export interface ActualizarPaqueteCommand {
    id: string
    nombre?: string
    descripcion?: string
    precioBase?: number
    duraciones?: number[]
    diasSemana?: string[]
    horario?: { inicio: string; fin: string }
    nivelExclusividad?: 'EXCLUSIVO' | 'COMPARTIDO' | 'ABIERTO'
    vigenciaDesde?: Date
    vigenciaHasta?: Date
    actualizadoPor: string
}

export interface ActivarDesactivarPaqueteCommand {
    id: string
    accion: 'activar' | 'desactivar'
    responsable: string
    motivo?: string
}

export interface DuplicarPaqueteCommand {
    id: string
    nuevoNombre: string
    nuevoVigenciaDesde: Date
    nuevoVigenciaHasta: Date
    creadoPor: string
}
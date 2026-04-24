/**
 * HANDLER: PAQUETE COMMAND HANDLER
 * 
 * @description Manejador de comandos para operaciones de escritura.
 * 
 * @version 1.0.0
 */

import { Paquete } from '../../domain/entities/Paquete.js'
import type {
    CrearPaqueteCommand,
    ActualizarPaqueteCommand,
    ActivarDesactivarPaqueteCommand,
    DuplicarPaqueteCommand
} from '../commands/PaqueteCommands.js'
import type { PaqueteRepository } from '../../domain/repositories/IPaqueteRepository.js'
import { Result } from '../../../shared/domain/Result'

export class PaqueteCommandHandler {
    constructor(private repository: PaqueteRepository) { }

    async crear(command: CrearPaqueteCommand): Promise<Result<Paquete>> {
        // Validar que no existe un paquete con el mismo nombre
        const existentes = await this.repository.findAll({ texto: command.nombre })
        if (existentes.some(p => p.nombre.toLowerCase() === command.nombre.toLowerCase())) {
            return Result.fail('Ya existe un paquete con este nombre')
        }

        // Crear el paquete
        const paqueteResult = Paquete.create({
            nombre: command.nombre,
            descripcion: command.descripcion,
            tipo: command.tipo,
            editoraId: command.editoraId,
            editoraNombre: command.editoraNombre,
            programaId: command.programaId,
            programaNombre: command.programaNombre,
            horario: command.horario,
            diasSemana: command.diasSemana,
            duraciones: command.duraciones as any,
            precioBase: command.precioBase,
            nivelExclusividad: command.nivelExclusividad,
            vigenciaDesde: command.vigenciaDesde,
            vigenciaHasta: command.vigenciaHasta,
            creadoPor: command.creadoPor
        })

        if (!paqueteResult.success) {
            return Result.fail(paqueteResult.error)
        }

        const paquete = paqueteResult.data
        await this.repository.save(paquete)
        return Result.ok(paquete)
    }

    async actualizar(command: ActualizarPaqueteCommand): Promise<Result<void>> {
        const paquete = await this.repository.findById(command.id)
        if (!paquete) {
            return Result.fail('Paquete no encontrado')
        }

        const result = paquete.actualizar({
            nombre: command.nombre,
            descripcion: command.descripcion,
            precioBase: command.precioBase,
            duraciones: command.duraciones as any,
            diasSemana: command.diasSemana,
            horario: command.horario,
            nivelExclusividad: command.nivelExclusividad,
            vigenciaDesde: command.vigenciaDesde,
            vigenciaHasta: command.vigenciaHasta,
            actualizadoPor: command.actualizadoPor
        })

        if (!result.success) {
            return Result.fail(result.error)
        }

        await this.repository.update(paquete)
        return { success: true as const, data: undefined as void }
    }

    async activarDesactivar(command: ActivarDesactivarPaqueteCommand): Promise<Result<void>> {
        const paquete = await this.repository.findById(command.id)
        if (!paquete) {
            return Result.fail('Paquete no encontrado')
        }

        if (command.accion === 'activar') {
            paquete.activar(command.responsable)
        } else {
            if (!command.motivo) {
                return Result.fail('Motivo requerido para desactivar')
            }
            paquete.desactivar(command.responsable, command.motivo)
        }

        await this.repository.update(paquete)
        return { success: true as const, data: undefined as void }
    }

    async duplicar(command: DuplicarPaqueteCommand): Promise<Result<Paquete>> {
        const original = await this.repository.findById(command.id)
        if (!original) {
            return Result.fail('Paquete no encontrado')
        }

        const snapshot = original.toSnapshot()
        const nuevoResult = Paquete.create({
            nombre: command.nuevoNombre,
            descripcion: snapshot.descripcion,
            tipo: snapshot.tipo.value as any,
            editoraId: snapshot.editoraId,
            editoraNombre: snapshot.editoraNombre,
            programaId: snapshot.programaId,
            programaNombre: snapshot.programaNombre,
            horario: {
                inicio: snapshot.horario.horaInicio,
                fin: snapshot.horario.horaFin
            },
            diasSemana: snapshot.diasSemana,
            duraciones: snapshot.duraciones,
            precioBase: snapshot.precioBase.value,
            nivelExclusividad: snapshot.nivelExclusividad.value as any,
            vigenciaDesde: command.nuevoVigenciaDesde,
            vigenciaHasta: command.nuevoVigenciaHasta,
            creadoPor: command.creadoPor
        })

        if (!nuevoResult.success) {
            return Result.fail(nuevoResult.error)
        }

        const nuevo = nuevoResult.data
        await this.repository.save(nuevo)
        return Result.ok(nuevo)
    }
}
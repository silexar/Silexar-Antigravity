/**
 * UNIT TESTS: Paquete Entity
 * 
 * @description Tests for the Paquete domain entity.
 * FASE 7: Testing y QA
 * 
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Paquete } from '../../../modules/paquetes/domain/entities/Paquete'

describe('Paquete Entity', () => {
    describe('Paquete.create()', () => {
        it('should create a valid paquete', () => {
            const result = Paquete.create({
                nombre: 'Prime Matinal Premium',
                descripcion: 'Paquete para horarios de la mañana',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Buenos Días',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L', 'M', 'M', 'J', 'V'],
                duraciones: [15, 30, 45],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date('2025-01-01'),
                vigenciaHasta: new Date('2025-12-31'),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(true)
            expect(result.data).toBeDefined()
            expect(result.data!.nombre).toBe('Prime Matinal Premium')
            expect(result.data!.codigo.value).toMatch(/^PAQ-\d{4}-/)
            expect(result.data!.estado).toBe('ACTIVO')
        })

        it('should fail with empty nombre', () => {
            const result = Paquete.create({
                nombre: '',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L', 'M'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('Nombre')
        })

        it('should fail with nombre exceeding 200 characters', () => {
            const longName = 'a'.repeat(201)
            const result = Paquete.create({
                nombre: longName,
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('200 caracteres')
        })

        it('should fail with empty diasSemana', () => {
            const result = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: [],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('día')
        })

        it('should fail with precioBase <= 0', () => {
            const result = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 0,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('Precio')
        })
    })

    describe('Paquete.estaVigente()', () => {
        it('should return true when current date is within vigencia', () => {
            const result = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date('2020-01-01'),
                vigenciaHasta: new Date('2030-12-31'),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(true)
            expect(result.data!.estaVigente()).toBe(true)
        })

        it('should return false when vigencia has expired', () => {
            const result = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date('2020-01-01'),
                vigenciaHasta: new Date('2020-12-31'),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(true)
            expect(result.data!.estaVigente()).toBe(false)
        })
    })

    describe('Paquete.puedeSerVendido()', () => {
        it('should return true for activo and vigente paquete', () => {
            const result = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date('2020-01-01'),
                vigenciaHasta: new Date('2030-12-31'),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(true)
            expect(result.data!.puedeSerVendido()).toBe(true)
        })

        it('should return false for INACTIVO paquete', () => {
            const result = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date('2020-01-01'),
                vigenciaHasta: new Date('2030-12-31'),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(true)
            const paquete = result.data!
            paquete.desactivar('user-1', 'test')
            expect(paquete.puedeSerVendido()).toBe(false)
        })
    })

    describe('Paquete.calcularUtilizacion()', () => {
        it('should calculate correct utilization percentage', () => {
            const result = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(true)
            expect(result.data!.calcularUtilizacion(85, 100)).toBe(85)
            expect(result.data!.calcularUtilizacion(50, 100)).toBe(50)
        })

        it('should return 0 when cuposTotales is 0', () => {
            const result = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(result.success).toBe(true)
            expect(result.data!.calcularUtilizacion(10, 0)).toBe(0)
        })
    })

    describe('Paquete.actualizar()', () => {
        it('should update nombre successfully', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            const updateResult = paquete.actualizar({
                nombre: 'Updated Paquete',
                actualizadoPor: 'user-2'
            })

            expect(updateResult.success).toBe(true)
            expect(paquete.nombre).toBe('Updated Paquete')
            expect(paquete.version).toBe(2)
        })

        it('should fail with empty nombre on update', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            const updateResult = paquete.actualizar({
                nombre: '',
                actualizadoPor: 'user-2'
            })

            expect(updateResult.success).toBe(false)
        })

        it('should fail with invalid precioBase on update', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            const updateResult = paquete.actualizar({
                precioBase: -100,
                actualizadoPor: 'user-2'
            })

            expect(updateResult.success).toBe(false)
        })
    })

    describe('Paquete.activar() / desactivar()', () => {
        it('should activate paquete successfully', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            paquete.desactivar('user-1', 'Prueba')
            expect(paquete.estado).toBe('INACTIVO')

            paquete.activar('user-2')
            expect(paquete.estado).toBe('ACTIVO')
            expect(paquete.isActivo).toBe(true)
        })

        it('should not activate BORRADO paquete', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            paquete.marcarComoBorrado('user-1')

            expect(() => paquete.activar('user-1')).toThrow()
        })
    })

    describe('Paquete.establecerPrecioActual()', () => {
        it('should update precioActual successfully', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            paquete.establecerPrecioActual(17500, 'user-1')
            expect(paquete.precioActual).toBe(17500)
        })

        it('should throw for negative precio', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            expect(() => paquete.establecerPrecioActual(-500, 'user-1')).toThrow()
        })
    })

    describe('Paquete.domainEvents', () => {
        it('should track domain events', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            expect(paquete.domainEvents.length).toBeGreaterThan(0)
            expect(paquete.domainEvents[0]).toContain('PaqueteCreado')
        })

        it('should clear domain events', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!

            expect(paquete.domainEvents.length).toBeGreaterThan(0)
            paquete.clearDomainEvents()
            expect(paquete.domainEvents.length).toBe(0)
        })
    })

    describe('Paquete.toSnapshot()', () => {
        it('should return a copy of props', () => {
            const createResult = Paquete.create({
                nombre: 'Test Paquete',
                descripcion: 'Test',
                tipo: 'PRIME',
                editoraId: 'editora-1',
                editoraNombre: 'Radio Corazón',
                programaId: 'programa-1',
                programaNombre: 'Programa',
                horario: { inicio: '06:00', fin: '10:00' },
                diasSemana: ['L'],
                duraciones: [15],
                precioBase: 15000,
                nivelExclusividad: 'EXCLUSIVO',
                vigenciaDesde: new Date(),
                vigenciaHasta: new Date(),
                creadoPor: 'user-1'
            })

            expect(createResult.success).toBe(true)
            const paquete = createResult.data!
            const snapshot = paquete.toSnapshot()

            expect(snapshot.nombre).toBe('Test Paquete')
            expect(snapshot.tipo.value).toBe('PRIME')
            expect(snapshot.precioBase.value).toBe(15000)
        })
    })
})
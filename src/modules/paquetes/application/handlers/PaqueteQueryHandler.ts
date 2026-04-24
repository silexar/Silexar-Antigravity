/**
 * HANDLER: PAQUETE QUERY HANDLER
 * 
 * @description Manejador de queries para operaciones de lectura.
 * 
 * @version 1.0.0
 */

import type { PaqueteRepository } from '../../domain/repositories/IPaqueteRepository.js'
import type {
    ObtenerDetallePaqueteQuery,
    BuscarPaquetesQuery,
    ObtenerPaquetesPorEditoraQuery,
    PaqueteDetalleResult,
    PaquetesListaResult
} from '../queries/PaqueteQueries.js'

export class PaqueteQueryHandler {
    constructor(private repository: PaqueteRepository) { }

    async obtenerDetalle(query: ObtenerDetallePaqueteQuery): Promise<PaqueteDetalleResult | null> {
        const paquete = await this.repository.findById(query.id)
        if (!paquete) return null

        const snapshot = paquete.toSnapshot()
        return {
            id: snapshot.id,
            codigo: snapshot.codigo.value,
            nombre: snapshot.nombre,
            descripcion: snapshot.descripcion,
            tipo: snapshot.tipo.value,
            estado: snapshot.estado,
            editora: { id: snapshot.editoraId, nombre: snapshot.editoraNombre },
            programa: { id: snapshot.programaId, nombre: snapshot.programaNombre },
            horario: { inicio: snapshot.horario.horaInicio, fin: snapshot.horario.horaFin },
            diasSemana: snapshot.diasSemana,
            duraciones: snapshot.duraciones,
            precioBase: snapshot.precioBase.value,
            precioActual: snapshot.precioActual,
            nivelExclusividad: snapshot.nivelExclusividad.value,
            vigencia: { desde: snapshot.vigenciaDesde, hasta: snapshot.vigenciaHasta },
            metrics: {
                utilizationPct: 0, // Se calculará con datos de inventario
                revenueYTD: 0,
                avgPrice: snapshot.precioActual
            }
        }
    }

    async buscar(query: BuscarPaquetesQuery): Promise<PaquetesListaResult> {
        const pagina = query.pagina ?? 1
        const limite = query.limite ?? 20
        const offset = (pagina - 1) * limite

        const criterios = {
            texto: query.texto,
            tipo: query.tipo,
            estado: query.estado,
            editoraId: query.editoraId
        }

        const paquetes = await this.repository.findAll(criterios)
        const total = await this.repository.count(criterios)

        const items: PaqueteDetalleResult[] = paquetes.slice(offset, offset + limite).map(p => {
            const s = p.toSnapshot()
            return {
                id: s.id,
                codigo: s.codigo.value,
                nombre: s.nombre,
                descripcion: s.descripcion,
                tipo: s.tipo.value,
                estado: s.estado,
                editora: { id: s.editoraId, nombre: s.editoraNombre },
                programa: { id: s.programaId, nombre: s.programaNombre },
                horario: { inicio: s.horario.horaInicio, fin: s.horario.horaFin },
                diasSemana: s.diasSemana,
                duraciones: s.duraciones,
                precioBase: s.precioBase.value,
                precioActual: s.precioActual,
                nivelExclusividad: s.nivelExclusividad.value,
                vigencia: { desde: s.vigenciaDesde, hasta: s.vigenciaHasta },
                metrics: { utilizationPct: 0, revenueYTD: 0, avgPrice: s.precioActual }
            }
        })

        return { total, pagina, limite, items }
    }

    async obtenerPorEditora(query: ObtenerPaquetesPorEditoraQuery): Promise<PaqueteDetalleResult[]> {
        const paquetes = query.activos !== false
            ? await this.repository.findByEditora(query.editoraId)
            : await this.repository.findByEditora(query.editoraId)

        return paquetes
            .filter(p => !query.activos || p.isActivo)
            .map(p => {
                const s = p.toSnapshot()
                return {
                    id: s.id,
                    codigo: s.codigo.value,
                    nombre: s.nombre,
                    descripcion: s.descripcion,
                    tipo: s.tipo.value,
                    estado: s.estado,
                    editora: { id: s.editoraId, nombre: s.editoraNombre },
                    programa: { id: s.programaId, nombre: s.programaNombre },
                    horario: { inicio: s.horario.horaInicio, fin: s.horario.horaFin },
                    diasSemana: s.diasSemana,
                    duraciones: s.duraciones,
                    precioBase: s.precioBase.value,
                    precioActual: s.precioActual,
                    nivelExclusividad: s.nivelExclusividad.value,
                    vigencia: { desde: s.vigenciaDesde, hasta: s.vigenciaHasta },
                    metrics: { utilizationPct: 0, revenueYTD: 0, avgPrice: s.precioActual }
                }
            })
    }
}
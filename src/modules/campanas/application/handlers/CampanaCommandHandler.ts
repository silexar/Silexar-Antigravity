/**
 * CampanaCommandHandler — Orchestrates all campaign use cases
 * Follows the DDD handler pattern: validate → domain → persist → events → notify
 */

import { randomUUID } from 'crypto';

import { Campana } from '../../domain/entities/Campana';
import type { ICampanaRepository, CampanaPaginada } from '../../domain/repositories/ICampanaRepository';
import { NumeroCampana } from '../../domain/value-objects/NumeroCampana';
import type { EstadoCampanaValue } from '../../domain/value-objects/EstadoCampana';
import type { CreateCampanaCommand } from '../commands/CreateCampanaCommand';
import type {
  ActivarCampanaCommand,
  PausarCampanaCommand,
  FinalizarCampanaCommand,
  CancelarCampanaCommand,
  ActualizarNombreCampanaCommand,
  ActualizarPresupuestoCampanaCommand,
} from '../commands/UpdateCampanaCommand';
import type {
  GetCampanaByIdQuery,
  ListCampanasQuery,
  GetCampanasProximasAVencerQuery,
  GetConteoEstadosQuery,
} from '../queries/GetCampanaQuery';

export class CampanaCommandHandler {
  constructor(private readonly repository: ICampanaRepository) {}

  // ─── Commands ───────────────────────────────────────────────

  async crearCampana(command: CreateCampanaCommand): Promise<{ id: string; numeroCampana: string }> {
    const anio = command.fechaInicio.getFullYear();
    const secuencial = await this.repository.obtenerSiguienteSecuencial(command.tenantId, anio);
    const numero = NumeroCampana.generar(anio, secuencial);

    const campana = Campana.crear({
      id: randomUUID(),
      tenantId: command.tenantId,
      numeroCampana: numero.valor,
      nombre: command.nombre,
      tipo: command.tipo,
      estado: 'BORRADOR',
      anuncianteId: command.anuncianteId,
      contratoId: command.contratoId,
      presupuesto: command.presupuesto,
      fechaInicio: command.fechaInicio,
      fechaFin: command.fechaFin,
      descripcion: command.descripcion,
      observaciones: command.observaciones,
      creadoPor: command.creadoPor,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    });

    await this.repository.guardar(campana);
    return { id: campana.id, numeroCampana: campana.numeroCampana.valor };
  }

  async activarCampana(command: ActivarCampanaCommand): Promise<void> {
    const campana = await this._obtenerOLanzar(command.campanaId, command.tenantId);
    campana.activar(command.activadoPor);
    await this.repository.actualizar(campana);
  }

  async pausarCampana(command: PausarCampanaCommand): Promise<void> {
    const campana = await this._obtenerOLanzar(command.campanaId, command.tenantId);
    campana.pausar(command.motivo, command.pausadoPor);
    await this.repository.actualizar(campana);
  }

  async finalizarCampana(command: FinalizarCampanaCommand): Promise<void> {
    const campana = await this._obtenerOLanzar(command.campanaId, command.tenantId);
    campana.finalizar(command.finalizadoPor);
    await this.repository.actualizar(campana);
  }

  async cancelarCampana(command: CancelarCampanaCommand): Promise<void> {
    const campana = await this._obtenerOLanzar(command.campanaId, command.tenantId);
    campana.cancelar(command.motivo, command.canceladoPor);
    await this.repository.actualizar(campana);
  }

  async actualizarNombre(command: ActualizarNombreCampanaCommand): Promise<void> {
    const campana = await this._obtenerOLanzar(command.campanaId, command.tenantId);
    campana.actualizarNombre(command.nuevoNombre);
    await this.repository.actualizar(campana);
  }

  async actualizarPresupuesto(command: ActualizarPresupuestoCampanaCommand): Promise<void> {
    const campana = await this._obtenerOLanzar(command.campanaId, command.tenantId);
    campana.actualizarPresupuesto(command.presupuesto);
    await this.repository.actualizar(campana);
  }

  // ─── Queries ────────────────────────────────────────────────

  async obtenerPorId(query: GetCampanaByIdQuery): Promise<Campana | null> {
    return this.repository.buscarPorId(query.campanaId, query.tenantId);
  }

  async listar(query: ListCampanasQuery): Promise<CampanaPaginada> {
    return this.repository.listar(
      {
        tenantId: query.tenantId,
        estado: query.estado,
        anuncianteId: query.anuncianteId,
        contratoId: query.contratoId,
        fechaInicioDesde: query.fechaInicioDesde,
        fechaFinHasta: query.fechaFinHasta,
        busqueda: query.busqueda,
      },
      query.pagina,
      query.tamanoPagina,
    );
  }

  async obtenerProximasAVencer(query: GetCampanasProximasAVencerQuery): Promise<Campana[]> {
    return this.repository.listarProximasAVencer(query.tenantId, query.diasUmbral ?? 7);
  }

  async obtenerConteoEstados(query: GetConteoEstadosQuery): Promise<Record<EstadoCampanaValue, number>> {
    return this.repository.contarPorEstado(query.tenantId);
  }

  // ─── Private helpers ────────────────────────────────────────

  private async _obtenerOLanzar(campanaId: string, tenantId: string): Promise<Campana> {
    const campana = await this.repository.buscarPorId(campanaId, tenantId);
    if (!campana) {
      throw new Error(`Campaña no encontrada: ${campanaId}`);
    }
    return campana;
  }
}

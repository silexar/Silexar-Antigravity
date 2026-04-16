/**
 * HANDLER: CAMBIAR ESTADO ACTIVO DIGITAL
 *
 * Orquesta el cambio de estado de un activo digital:
 * 1. Busca el activo por id + tenantId
 * 2. Aplica la transición de estado según el entity method correspondiente
 * 3. Persiste via IActivoDigitalRepository
 * 4. Retorna Result<ActivoDigital, string>
 */

import { Result } from '@/modules/shared/domain/Result';
import { ActivoDigital } from '../../domain/entities/ActivoDigital';
import type { IActivoDigitalRepository } from '../../domain/repositories/IActivoDigitalRepository';
import type { CambiarEstadoActivoDigitalCommand } from '../commands/CambiarEstadoActivoDigitalCommand';

export class CambiarEstadoActivoDigitalHandler {
  constructor(private readonly repository: IActivoDigitalRepository) {}

  async execute(command: CambiarEstadoActivoDigitalCommand): Promise<Result<ActivoDigital, string>> {
    try {
      const { input } = command;

      // 1. Buscar el activo digital por id + tenantId
      const activo = await this.repository.findById(input.activoId, input.tenantId);

      if (!activo) {
        return Result.fail('Activo digital no encontrado');
      }

      // 2. Aplicar la transición de estado según el nuevo estado
      const { nuevoEstado, motivoRechazo } = input;

      switch (nuevoEstado) {
        case 'aprobado':
          activo.aprobar();
          break;

        case 'rechazado':
          activo.rechazar(motivoRechazo ?? 'Sin motivo especificado');
          break;

        case 'activo':
          activo.activar();
          break;

        case 'pausado':
          activo.pausar();
          break;

        case 'archivado':
          activo.archivar();
          break;

        // Para estados intermedios de validación, setear directamente
        case 'pendiente_validacion':
        case 'validacion_tecnica':
        case 'validacion_exitosa':
        case 'validacion_fallida':
          (activo as unknown as { estado: string }).estado = nuevoEstado;
          break;

        default:
          return Result.fail(`Estado '${nuevoEstado}' no soportado para esta operación`);
      }

      // 3. Persistir
      await this.repository.save(activo);

      return Result.ok(activo);
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : 'Error al cambiar el estado del activo digital';
      return Result.fail(msg);
    }
  }
}

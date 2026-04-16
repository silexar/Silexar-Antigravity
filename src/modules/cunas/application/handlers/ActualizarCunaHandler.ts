/**
 * HANDLER: ACTUALIZAR CUÑA — TIER 0
 *
 * Orquesta el caso de uso de actualización parcial de una cuña.
 */

import { Result } from '@/modules/shared/domain/Result';
import { Cuna } from '../../domain/entities/Cuna';
import type { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import type { ActualizarCunaCommand } from '../commands/ActualizarCunaCommand';

export class ActualizarCunaHandler {
  constructor(private readonly repository: ICunaRepository) {}

  async execute(command: ActualizarCunaCommand): Promise<Result<Cuna, string>> {
    try {
      const { input } = command;

      // 1. Buscar la cuña y verificar que pertenece al tenant
      const cuna = await this.repository.findById(input.id, input.tenantId);
      if (!cuna) {
        return Result.fail(`Cuña con ID ${input.id} no encontrada`);
      }

      // 2. Aplicar cambios via método de dominio
      cuna.actualizar({
        nombre: input.nombre,
        descripcion: input.descripcion,
        fechaFinVigencia: input.fechaFinVigencia,
        urgencia: input.urgencia,
        campanaId: input.campanaId,
        contratoId: input.contratoId,
      });

      // 3. Persistir
      await this.repository.save(cuna);

      return Result.ok(cuna);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al actualizar la cuña';
      return Result.fail(msg);
    }
  }
}

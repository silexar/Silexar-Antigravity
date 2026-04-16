/**
 * HANDLER: BULK UPDATE CUÑAS — TIER 0
 *
 * Procesa acciones masivas sobre múltiples cuñas.
 * Procesa cada cuña individualmente y agrega resultados (best-effort).
 * No es transaccional: si una falla, continúa con las demás.
 */

import { Result } from '@/modules/shared/domain/Result';
import type { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import type { BulkUpdateCunasCommand, BulkUpdateResult } from '../commands/BulkUpdateCunasCommand';

export class BulkUpdateCunasHandler {
  constructor(private readonly repository: ICunaRepository) {}

  async execute(command: BulkUpdateCunasCommand): Promise<Result<BulkUpdateResult, string>> {
    const { input } = command;
    const resultado: BulkUpdateResult = { exitosos: 0, fallidos: 0, errores: [] };

    for (const cunaId of input.cunaIds) {
      try {
        const cuna = await this.repository.findById(cunaId, input.tenantId);
        if (!cuna) {
          resultado.fallidos++;
          resultado.errores.push({ cunaId, error: 'Cuña no encontrada' });
          continue;
        }

        switch (input.accion) {
          case 'aprobar':
            if (!cuna.estadoCuna.puedeTransicionarA('aprobada')) {
              resultado.fallidos++;
              resultado.errores.push({ cunaId, error: `No se puede aprobar desde estado "${cuna.estado}"` });
              continue;
            }
            cuna.aprobar(input.userId);
            break;
          case 'poner_en_aire':
            if (!cuna.estadoCuna.puedeTransicionarA('en_aire')) {
              resultado.fallidos++;
              resultado.errores.push({ cunaId, error: `No se puede poner en aire desde estado "${cuna.estado}"` });
              continue;
            }
            if (cuna.estado === 'pausada') {
              cuna.reanudar();
            } else {
              cuna.ponerEnAire();
            }
            break;
          case 'pausar':
            if (!cuna.estadoCuna.puedeTransicionarA('pausada')) {
              resultado.fallidos++;
              resultado.errores.push({ cunaId, error: `No se puede pausar desde estado "${cuna.estado}"` });
              continue;
            }
            cuna.pausar();
            break;
          case 'finalizar':
            if (!cuna.estadoCuna.puedeTransicionarA('finalizada')) {
              resultado.fallidos++;
              resultado.errores.push({ cunaId, error: `No se puede finalizar desde estado "${cuna.estado}"` });
              continue;
            }
            cuna.finalizar();
            break;
          case 'eliminar':
            await this.repository.delete(cunaId, input.tenantId, input.userId);
            resultado.exitosos++;
            continue;
          case 'cambiar_urgencia':
            cuna.actualizar({ urgencia: input.urgencia ?? null });
            break;
        }

        await this.repository.save(cuna);
        resultado.exitosos++;
      } catch (error) {
        resultado.fallidos++;
        resultado.errores.push({
          cunaId,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return Result.ok(resultado);
  }
}

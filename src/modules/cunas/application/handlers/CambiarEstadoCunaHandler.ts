/**
 * HANDLER: CAMBIAR ESTADO CUÑA — TIER 0
 *
 * Orquesta las transiciones de estado validadas por la máquina de estados EstadoCuna.
 * Si la transición no es válida, retorna Result.fail con el mensaje del dominio.
 */

import { Result } from '@/modules/shared/domain/Result';
import { Cuna } from '../../domain/entities/Cuna';
import type { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import type { CambiarEstadoCunaCommand } from '../commands/CambiarEstadoCunaCommand';
import type { EstadoCunaValor } from '../../domain/value-objects/EstadoCuna';

export class CambiarEstadoCunaHandler {
  constructor(private readonly repository: ICunaRepository) {}

  async execute(command: CambiarEstadoCunaCommand): Promise<Result<Cuna, string>> {
    try {
      const { input } = command;

      // 1. Buscar y verificar existencia
      const cuna = await this.repository.findById(input.id, input.tenantId);
      if (!cuna) {
        return Result.fail(`Cuña con ID ${input.id} no encontrada`);
      }

      // 2. Verificar que la transición es legal (lanza si no lo es)
      if (!cuna.estadoCuna.puedeTransicionarA(input.nuevoEstado)) {
        return Result.fail(
          `No se puede cambiar el estado de "${cuna.estado}" a "${input.nuevoEstado}".`
        );
      }

      // 3. Ejecutar la transición correcta via métodos de dominio
      this.ejecutarTransicion(cuna, input.nuevoEstado, input.userId, input.motivo ?? undefined);

      // 4. Persistir
      await this.repository.save(cuna);

      return Result.ok(cuna);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al cambiar el estado de la cuña';
      return Result.fail(msg);
    }
  }

  private ejecutarTransicion(
    cuna: Cuna,
    nuevoEstado: EstadoCunaValor,
    userId: string,
    motivo?: string
  ): void {
    switch (nuevoEstado) {
      case 'pendiente_aprobacion':
        cuna.enviarARevision();
        break;
      case 'aprobada':
        cuna.aprobar(userId);
        break;
      case 'rechazada':
        cuna.rechazar(userId, motivo ?? 'Sin motivo especificado');
        break;
      case 'en_aire':
        // Puede venir de aprobada (primera vez) o de pausada (reanudación)
        if (cuna.estado === 'pausada') {
          cuna.reanudar();
        } else {
          cuna.ponerEnAire();
        }
        break;
      case 'pausada':
        cuna.pausar();
        break;
      case 'finalizada':
        cuna.finalizar();
        break;
      case 'borrador':
        cuna.volverABorrador();
        break;
    }
  }
}

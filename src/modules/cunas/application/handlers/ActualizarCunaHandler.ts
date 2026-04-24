/**
 * HANDLER: ACTUALIZAR CUÑA — TIER 0
 *
 * Orquesta el caso de uso de actualización de cuña:
 * 1. Recupera la cuña existente
 * 2. Si se actualiza el anunciante, valida que exista
 * 3. Aplica los cambios validando reglas de dominio
 * 4. Persiste actualización via ICunaRepository
 * 5. Retorna Result<Cuna, string>
 */

import { Result } from '@/modules/shared/domain/Result';
import { Cuna } from '../../domain/entities/Cuna';
import type { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import type { ActualizarCunaCommand } from '../commands/ActualizarCunaCommand';
import { AnuncianteValidatorService } from '../services/AnuncianteValidatorService';

export class ActualizarCunaHandler {
  constructor(
    private readonly repository: ICunaRepository,
    private readonly anuncianteValidatorService: AnuncianteValidatorService
  ) {}

  async execute(command: ActualizarCunaCommand): Promise<Result<Cuna, string>> {
    try {
      const { input } = command;

      // 1. Recuperar la cuña existente
      const cunaExistente = await this.repository.findById(input.id, input.tenantId);
      if (!cunaExistente) {
        return Result.fail(`Cuña con ID ${input.id} no encontrada`);
      }

      // 2. Si se está actualizando el anunciante, validar que exista
      if (input.anuncianteId && input.anuncianteId !== cunaExistente.anuncianteId) {
        await this.anuncianteValidatorService.validarAnunciante(input.anuncianteId);
      }

      // 3. Actualizar los campos especificados
      cunaExistente.actualizar({
        nombre: input.nombre,
        descripcion: input.descripcion,
        fechaFinVigencia: input.fechaFinVigencia,
        urgencia: input.urgencia,
        campanaId: input.campanaId,
        contratoId: input.contratoId,
      });

      // Actualizar campos directos si se proveen
      if (input.tipo !== undefined) {
        // No podemos cambiar el tipo directamente, esto podría requerir validación adicional
        // según las reglas de negocio específicas
      }

      if (input.pathAudio !== undefined) {
        // Actualizar path de audio
        (cunaExistente as any).props.pathAudio = input.pathAudio;
      }

      if (input.duracionSegundos !== undefined) {
        (cunaExistente as any).props.duracionSegundos = input.duracionSegundos;
      }

      if (input.duracionMilisegundos !== undefined) {
        (cunaExistente as any).props.duracionMilisegundos = input.duracionMilisegundos;
      }

      if (input.formatoAudio !== undefined) {
        (cunaExistente as any).props.formatoAudio = input.formatoAudio;
      }

      if (input.bitrate !== undefined) {
        (cunaExistente as any).props.bitrate = input.bitrate;
      }

      if (input.sampleRate !== undefined) {
        (cunaExistente as any).props.sampleRate = input.sampleRate;
      }

      if (input.tamanoBytes !== undefined) {
        (cunaExistente as any).props.tamanoBytes = input.tamanoBytes;
      }

      if (input.anuncianteId !== undefined) {
        (cunaExistente as any).props.anuncianteId = input.anuncianteId;
      }

      // Registrar quién modificó y cuándo
      (cunaExistente as any).props.modificadoPorId = input.modificadoPorId;
      (cunaExistente as any).props.updatedAt = new Date();

      // 4. Persistir la actualización
      await this.repository.save(cunaExistente);

      return Result.ok(cunaExistente);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al actualizar la cuña';
      return Result.fail(msg);
    }
  }
}
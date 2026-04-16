/**
 * HANDLER: CREAR CUÑA — TIER 0
 *
 * Orquesta el caso de uso de creación de cuña:
 * 1. Reserva atómica del CunaId
 * 2. Construcción de la entidad Cuna
 * 3. Persistencia via ICunaRepository
 * 4. Retorna Result<Cuna, string>
 */

import { Result } from '@/modules/shared/domain/Result';
import { Cuna } from '../../domain/entities/Cuna';
import type { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import type { CrearCunaCommand } from '../commands/CrearCunaCommand';

export class CrearCunaHandler {
  constructor(private readonly repository: ICunaRepository) {}

  async execute(command: CrearCunaCommand): Promise<Result<Cuna, string>> {
    try {
      const { input } = command;

      // 1. Reservar el siguiente CunaId atómicamente (evita colisiones)
      const cunaId = await this.repository.reserveNextCodigo(input.tenantId);

      // 2. Construir la entidad Cuna con reglas de dominio
      const cuna = Cuna.create({
        tenantId: input.tenantId,
        codigo: cunaId.valor,
        nombre: input.nombre,
        tipo: input.tipo,
        anuncianteId: input.anuncianteId,
        campanaId: input.campanaId ?? null,
        contratoId: input.contratoId ?? null,
        productoNombre: input.productoNombre ?? null,
        descripcion: input.descripcion ?? null,
        pathAudio: input.pathAudio,
        duracionSegundos: input.duracionSegundos,
        duracionMilisegundos: input.duracionMilisegundos ?? null,
        formatoAudio: input.formatoAudio,
        bitrate: input.bitrate ?? null,
        sampleRate: input.sampleRate ?? null,
        tamanoBytes: input.tamanoBytes ?? null,
        versionAnteriorId: null,
        fechaInicioVigencia: input.fechaInicioVigencia ?? null,
        fechaFinVigencia: input.fechaFinVigencia ?? null,
        urgencia: input.urgencia ?? null,
        subidoPorId: input.subidoPorId,
      });

      // 3. Persistir
      await this.repository.save(cuna);

      return Result.ok(cuna);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al crear la cuña';
      return Result.fail(msg);
    }
  }
}

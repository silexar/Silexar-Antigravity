/**
 * HANDLER: COPIAR CUÑA — TIER 0
 *
 * Crea una nueva cuña como copia de una existente.
 * La copia siempre inicia en estado 'borrador' con un nuevo código SPX.
 * Si esRenovacion=true, establece el vínculo versionAnteriorId.
 */

import { Result } from '@/modules/shared/domain/Result';
import { Cuna } from '../../domain/entities/Cuna';
import type { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import type { CopiarCunaCommand } from '../commands/CopiarCunaCommand';

export class CopiarCunaHandler {
  constructor(private readonly repository: ICunaRepository) {}

  async execute(command: CopiarCunaCommand): Promise<Result<Cuna, string>> {
    try {
      const { input } = command;

      // 1. Obtener la cuña origen
      const cunaOrigen = await this.repository.findById(input.cunaOrigenId, input.tenantId);
      if (!cunaOrigen) {
        return Result.fail(`Cuña origen no encontrada: ${input.cunaOrigenId}`);
      }

      // 2. Reservar nuevo código SPX atómicamente
      const nuevoCodigo = await this.repository.reserveNextCodigo(input.tenantId);

      // 3. Crear la copia con datos del origen y sobrescrituras
      const origenData = cunaOrigen.toJSON();

      const cunaCopia = Cuna.create({
        tenantId: input.tenantId,
        codigo: nuevoCodigo.valor,
        nombre: input.nuevoNombre,
        tipo: origenData.tipo,
        anuncianteId: origenData.anuncianteId,
        campanaId: input.nuevaCampanaId ?? origenData.campanaId,
        contratoId: input.nuevoContratoId ?? origenData.contratoId,
        productoNombre: origenData.productoNombre,
        descripcion: origenData.descripcion,
        pathAudio: origenData.pathAudio,
        duracionSegundos: origenData.duracionSegundos,
        duracionMilisegundos: origenData.duracionMilisegundos,
        formatoAudio: origenData.formatoAudio,
        bitrate: origenData.bitrate,
        sampleRate: origenData.sampleRate,
        tamanoBytes: origenData.tamanoBytes,
        fechaInicioVigencia: null,
        fechaFinVigencia: input.nuevaFechaFinVigencia ?? origenData.fechaFinVigencia,
        fingerprint: origenData.fingerprint,
        transcripcion: origenData.transcripcion,
        urgencia: origenData.urgencia,
        subidoPorId: input.copiadoPorId,
        // Vínculo de versión si es renovación
        versionAnteriorId: input.esRenovacion ? input.cunaOrigenId : null,
      });

      // 4. Persistir
      await this.repository.save(cunaCopia);

      return Result.ok(cunaCopia);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al copiar la cuña';
      return Result.fail(msg);
    }
  }
}

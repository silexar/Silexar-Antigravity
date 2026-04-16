/**
 * HANDLER: CREAR ACTIVO DIGITAL
 *
 *
 * Orquesta la creación de un activo digital:
 * 1. Reserva código DA atómicamente
 * 2. Construye la entidad ActivoDigital
 * 3. Valida técnicamente el activo
 * 4. Persiste via IActivoDigitalRepository
 */

import { Result } from '@/modules/shared/domain/Result';
import { ActivoDigital } from '../../domain/entities/ActivoDigital';
import { DimensionesAsset } from '../../domain/value-objects/DimensionesAsset';
import type { IActivoDigitalRepository } from '../../domain/repositories/IActivoDigitalRepository';
import type { CrearActivoDigitalCommand } from '../commands/CrearActivoDigitalCommand';

export class CrearActivoDigitalHandler {
  constructor(private readonly repository: IActivoDigitalRepository) {}

  async execute(command: CrearActivoDigitalCommand): Promise<Result<ActivoDigital, string>> {
    try {
      const { input } = command;

      // 1. Reservar código DA atómicamente
      const codigo = await this.repository.reserveNextCodigo(input.tenantId);

      // 2. Construir dimensiones si se proporcionaron
      const dimensiones = (input.anchoPixeles && input.altoPixeles)
        ? DimensionesAsset.create(input.anchoPixeles, input.altoPixeles)
        : null;

      // 3. Construir entidad de dominio
      const activoProps: any = {
        tenantId: input.tenantId,
        cunaId: input.cunaId,
        anuncianteId: input.anuncianteId,
        codigo,
        nombre: input.nombre,
        tipo: input.tipo,
        formato: input.formato,
        urlOriginal: input.urlOriginal,
        urlThumbnail: input.urlThumbnail ?? null,
        dimensiones,
        duracionSegundos: input.duracionSegundos ?? null,
        pesoBytes: input.pesoBytes,
        plataformasDestino: [],
        subidoPorId: input.subidoPorId,
      };
      const activo = ActivoDigital.create(activoProps);

      // 4. Validación técnica automática
      const validacion = activo.validarTecnica();
      if (!validacion.valido) {
        return Result.fail(
          `Validación técnica fallida: ${validacion.observaciones.join(', ')}`
        );
      }

      // 5. Persistir
      await this.repository.save(activo);

      return Result.ok(activo);
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : 'Error al crear el activo digital';
      return Result.fail(msg);
    }
  }
}

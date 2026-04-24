/**
 * MAPPER: CUNA — TIER 0
 *
 * Convierte entre objetos de dominio y objetos de persistencia para la entidad Cuna.
 * Desacopla el modelo de dominio del modelo de persistencia Drizzle.
 */

import { Cuna, type CunaProps } from '../../domain/entities/Cuna';
import type { Cuna as DrizzleCuna, TipoCuna, EstadoCuna } from '@/lib/db/cunas-schema';

export class CunaMapper {
  /**
   * Convierte un objeto de persistencia Drizzle a entidad de dominio
   */
  static toEntity(persistence: DrizzleCuna): Cuna {
    const props: CunaProps = {
      id: persistence.id,
      tenantId: persistence.tenantId,
      codigo: persistence.codigo,
      nombre: persistence.nombre,
      tipo: persistence.tipoCuna,
      estado: persistence.estado,
      anuncianteId: persistence.anuncianteId,
      campanaId: persistence.campanaId || null,
      contratoId: persistence.contratoId || null,
      productoNombre: persistence.productoNombre || null,
      descripcion: persistence.descripcion || null,
      pathAudio: persistence.pathAudio,
      duracionSegundos: persistence.duracionSegundos,
      duracionMilisegundos: persistence.duracionMilisegundos || null,
      formatoAudio: persistence.formatoAudio,
      bitrate: persistence.bitrate || null,
      sampleRate: persistence.sampleRate || null,
      tamanoBytes: persistence.tamanoBytes || null,
      version: persistence.version,
      esVersionActual: persistence.esVersionActual,
      versionAnteriorId: persistence.versionAnteriorId || null,
      fechaInicioVigencia: persistence.fechaInicioVigencia || null,
      fechaFinVigencia: persistence.fechaFinVigencia || null,
      aprobadoPorId: persistence.aprobadoPorId || null,
      fechaAprobacion: persistence.fechaAprobacion || null,
      motivoRechazo: persistence.motivoRechazo || null,
      fingerprint: persistence.fingerprint || null,
      transcripcion: persistence.transcripcion || null,
      urgencia: null, // Legacy, no guardado en Drizzle DB
      subidoPorId: persistence.subidoPorId,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    };

    return Cuna.reconstitute(props);
  }

  /**
   * Convierte una entidad de dominio a objeto de persistencia Drizzle
   */
  static toPersistence(domain: Cuna): DrizzleCuna {
    const props = domain.toJSON();
    return {
      id: props.id,
      tenantId: props.tenantId,
      codigo: props.codigo,
      spxCode: null,
      nombre: props.nombre,
      tipoCuna: props.tipo as TipoCuna,
      estado: props.estado as EstadoCuna,
      anuncianteId: props.anuncianteId,
      campanaId: props.campanaId ?? null,
      contratoId: props.contratoId ?? null,
      productoId: null,
      campanaNombre: null,
      nombreArchivoOriginal: null,
      idioma: 'es',
      notas: null,
      fechaSubida: props.createdAt,
      modificadoPorId: null,
      fechaModificacion: null,
      productoNombre: props.productoNombre ?? null,
      descripcion: props.descripcion ?? null,
      pathAudio: props.pathAudio,
      duracionSegundos: props.duracionSegundos,
      duracionMilisegundos: props.duracionMilisegundos ?? null,
      formatoAudio: props.formatoAudio as any,
      bitrate: props.bitrate ?? null,
      sampleRate: props.sampleRate ?? null,
      tamanoBytes: props.tamanoBytes ?? null,
      version: props.version,
      esVersionActual: props.esVersionActual,
      versionAnteriorId: props.versionAnteriorId ?? null,
      fechaInicioVigencia: props.fechaInicioVigencia ?? null,
      fechaFinVigencia: props.fechaFinVigencia ?? null,
      aprobadoPorId: props.aprobadoPorId ?? null,
      fechaAprobacion: props.fechaAprobacion ?? null,
      motivoRechazo: props.motivoRechazo ?? null,
      fingerprint: props.fingerprint ?? null,
      transcripcion: props.transcripcion ?? null,
      subidoPorId: props.subidoPorId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      eliminado: false,
      fechaEliminacion: null,
      eliminadoPorId: null,
    };
  }
}
/**
 * MAPPER: CUNA — TIER 0
 *
 * Convierte entre filas de DB (Drizzle) y entidades de dominio Cuna.
 * Desacopla el modelo de persistencia del modelo de dominio.
 */

import { Cuna, type CunaProps } from '../../domain/entities/Cuna';
import type { Cuna as CunaRow } from '@/lib/db/cunas-schema';

export class CunaMapper {
  /** Convierte una fila de DB a entidad de dominio */
  static toEntity(row: CunaRow): Cuna {
    const props: CunaProps = {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nombre: row.nombre,
      tipo: row.tipoCuna as CunaProps['tipo'],
      estado: row.estado as CunaProps['estado'],
      anuncianteId: row.anuncianteId,
      campanaId: row.campanaId ?? null,
      contratoId: row.contratoId ?? null,
      productoNombre: row.productoNombre ?? null,
      descripcion: row.descripcion ?? null,
      pathAudio: row.pathAudio,
      duracionSegundos: row.duracionSegundos,
      duracionMilisegundos: row.duracionMilisegundos ?? null,
      formatoAudio: row.formatoAudio as CunaProps['formatoAudio'],
      bitrate: row.bitrate ?? null,
      sampleRate: row.sampleRate ?? null,
      tamanoBytes: row.tamanoBytes ?? null,
      version: row.version,
      esVersionActual: row.esVersionActual,
      versionAnteriorId: row.versionAnteriorId ?? null,
      fechaInicioVigencia: row.fechaInicioVigencia ?? null,
      fechaFinVigencia: row.fechaFinVigencia ?? null,
      aprobadoPorId: row.aprobadoPorId ?? null,
      fechaAprobacion: row.fechaAprobacion ?? null,
      motivoRechazo: row.motivoRechazo ?? null,
      fingerprint: row.fingerprint ?? null,
      transcripcion: row.transcripcion ?? null,
      urgencia: (row as unknown as { urgencia?: string | null }).urgencia ?? null,
      subidoPorId: row.subidoPorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Cuna.reconstitute(props);
  }

  /** Convierte una entidad de dominio a objeto de inserción Drizzle */
  static toPersistence(cuna: Cuna): Omit<CunaRow, 'fechaSubida'> & {
    fechaSubida: Date;
    notas?: string | null;
  } {
    const props = cuna.toJSON();
    return {
      id: props.id,
      tenantId: props.tenantId,
      codigo: props.codigo,
      anuncianteId: props.anuncianteId,
      campanaId: props.campanaId ?? null,
      contratoId: props.contratoId ?? null,
      nombre: props.nombre,
      tipoCuna: props.tipo as CunaRow['tipoCuna'],
      descripcion: props.descripcion ?? null,
      productoId: null,
      productoNombre: props.productoNombre ?? null,
      campanaNombre: null,
      pathAudio: props.pathAudio,
      nombreArchivoOriginal: null,
      formatoAudio: props.formatoAudio as CunaRow['formatoAudio'],
      duracionSegundos: props.duracionSegundos,
      duracionMilisegundos: props.duracionMilisegundos ?? null,
      tamanoBytes: props.tamanoBytes ?? null,
      bitrate: props.bitrate ?? null,
      sampleRate: props.sampleRate ?? null,
      version: props.version,
      esVersionActual: props.esVersionActual,
      versionAnteriorId: props.versionAnteriorId ?? null,
      fechaInicioVigencia: props.fechaInicioVigencia ?? null,
      fechaFinVigencia: props.fechaFinVigencia ?? null,
      estado: props.estado as CunaRow['estado'],
      aprobadoPorId: props.aprobadoPorId ?? null,
      fechaAprobacion: props.fechaAprobacion ?? null,
      motivoRechazo: props.motivoRechazo ?? null,
      fingerprint: props.fingerprint ?? null,
      transcripcion: props.transcripcion ?? null,
      idioma: 'es',
      notas: null,
      subidoPorId: props.subidoPorId,
      fechaSubida: props.createdAt,
      modificadoPorId: null,
      fechaModificacion: null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      eliminado: false,
      fechaEliminacion: null,
      eliminadoPorId: null,
    };
  }
}

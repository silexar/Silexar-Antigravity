/**
 * MAPPER: ACTIVO DIGITAL
 *
 * Convierte entre filas de DB (Drizzle: digitalAssets) y entidad de dominio ActivoDigital.
 */

import { ActivoDigital, type ActivoDigitalProps, type FormatoArchivoValor, type TipoActivoDigitalValor } from '../../domain/entities/ActivoDigital';
import { DimensionesAsset } from '../../domain/value-objects/DimensionesAsset';
import type { DigitalAsset } from '@/lib/db/schema';

export class ActivoDigitalMapper {
  /** DB row → entidad de dominio */
  static toEntity(row: DigitalAsset): ActivoDigital {
    const dimensiones = (row.anchoPixeles && row.altoPixeles)
      ? DimensionesAsset.reconstitute({
        ancho: row.anchoPixeles,
        alto: row.altoPixeles,
        aspectRatio: row.aspectRatio ?? '',
      })
      : null;

    // Mapear tipo del DB al tipo del dominio
    const tipo = ActivoDigitalMapper.mapTipoDesdeDB(row.tipoAsset);

    const props: ActivoDigitalProps = {
      id: row.id,
      tenantId: row.tenantId,
      cunaId: row.cunaId,
      anuncianteId: row.anuncianteId,
      codigo: row.codigo,
      nombre: row.nombre,
      tipo,
      estado: row.estado as ActivoDigitalProps['estado'],
      formato: row.formato as FormatoArchivoValor,
      urlOriginal: row.urlOriginal,
      urlOptimizada: row.urlOptimizada ?? null,
      urlThumbnail: row.urlThumbnail ?? null,
      dimensiones,
      duracionSegundos: row.duracionSegundos ?? null,
      pesoBytes: row.pesoBytes,
      calidadScore: row.calidadScore ?? 0,
      plataformasDestino: [], // Se carga desde ad_targeting_profiles si es necesario
      scoreBrandSafety: row.analisisIA?.scoreBrandSafety ?? 0,
      fechaInicio: null,
      fechaFin: null,
      subidoPorId: row.subidoPorId,
      createdAt: row.fechaSubida,
      updatedAt: row.fechaModificacion ?? row.fechaSubida,
    };

    return ActivoDigital.reconstitute(props);
  }

  /** Entidad de dominio → objeto de inserción Drizzle */
  static toPersistence(activo: ActivoDigital): Omit<DigitalAsset, 'fechaSubida' | 'adaptacionesGeneradas' | 'analisisIA' | 'validacionTecnica' | 'estado'> & {
    fechaSubida: Date;
    estado: string;
    adaptacionesGeneradas: DigitalAsset['adaptacionesGeneradas'];
    validacionTecnica: DigitalAsset['validacionTecnica'];
    analisisIA: DigitalAsset['analisisIA'];
  } {
    const props = activo.toJSON();
    const dbTipo = ActivoDigitalMapper.mapTipoHaciaDB(activo.tipo);

    return {
      id: props.id,
      tenantId: props.tenantId,
      cunaId: props.cunaId,
      anuncianteId: props.anuncianteId,
      codigo: props.codigo,
      nombre: props.nombre,
      tipoAsset: dbTipo,
      formato: props.formato as DigitalAsset['formato'],
      urlOriginal: props.urlOriginal,
      urlOptimizada: props.urlOptimizada || null,
      urlThumbnail: props.urlThumbnail || null,
      anchoPixeles: props.dimensiones?.ancho ?? null,
      altoPixeles: props.dimensiones?.alto ?? null,
      aspectRatio: props.dimensiones?.aspectRatio ?? null,
      duracionSegundos: props.duracionSegundos ?? null,
      duracionMilisegundos: null,
      pesoBytes: props.pesoBytes,
      bitrate: null,
      fps: null,
      calidadScore: props.calidadScore,
      validacionTecnica: null,
      adaptacionesGeneradas: [],
      analisisIA: props.scoreBrandSafety > 0 ? {
        scoreBrandSafety: props.scoreBrandSafety,
        objetosDetectados: [],
        coloresDominantes: [],
        sentimientoDetectado: '',
        textoExtraido: '',
        marcasDetectadas: [],
        sugerenciasOptimizacion: [],
      } : null,
      estado: props.estado as string,
      activo: true,
      subidoPorId: props.subidoPorId,
      fechaSubida: props.createdAt,
      modificadoPorId: null,
      fechaModificacion: null,
    };
  }

  /** Mapea tipo del dominio al enum del DB (tipoAssetDigitalEnum) */
  private static mapTipoHaciaDB(tipo: TipoActivoDigitalValor): DigitalAsset['tipoAsset'] {
    const map: Record<TipoActivoDigitalValor, DigitalAsset['tipoAsset']> = {
      banner_static: 'BANNER_STATIC',
      banner_animated: 'BANNER_ANIMATED',
      banner_html5: 'BANNER_HTML5',
      banner_responsive: 'BANNER_STATIC',
      video_preroll: 'VIDEO_HORIZONTAL',
      video_midroll: 'VIDEO_HORIZONTAL',
      video_bumper: 'VIDEO_HORIZONTAL',
      video_outstream: 'VIDEO_HORIZONTAL',
      video_vertical: 'VIDEO_VERTICAL',
      audio_streaming: 'AUDIO_STREAMING',
      audio_podcast: 'AUDIO_STREAMING',
      story_ad: 'STORY_CAROUSEL',
      reel_ad: 'VIDEO_VERTICAL',
      carousel_ad: 'STORY_CAROUSEL',
      native_ad: 'BANNER_STATIC',
      playable_ad: 'BANNER_HTML5',
      ar_experience: 'AR_EXPERIENCE',
      lead_form: 'BANNER_HTML5',
    };
    return map[tipo];
  }

  /** Mapea tipo del DB al tipo del dominio */
  private static mapTipoDesdeDB(tipoAsset: DigitalAsset['tipoAsset']): TipoActivoDigitalValor {
    const map: Record<string, TipoActivoDigitalValor> = {
      BANNER_STATIC: 'banner_static',
      BANNER_ANIMATED: 'banner_animated',
      BANNER_HTML5: 'banner_html5',
      VIDEO_HORIZONTAL: 'video_preroll',
      VIDEO_VERTICAL: 'video_vertical',
      VIDEO_SQUARE: 'video_preroll',
      AUDIO_STREAMING: 'audio_streaming',
      AUDIO_3D_SPATIAL: 'audio_streaming',
      COMPANION_DISPLAY: 'banner_static',
      AR_EXPERIENCE: 'ar_experience',
      STORY_CAROUSEL: 'story_ad',
    };
    return map[tipoAsset] ?? 'banner_static';
  }
}

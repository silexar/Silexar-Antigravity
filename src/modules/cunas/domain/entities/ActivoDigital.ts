/**
 * ENTITY: ACTIVO DIGITAL — TIER 0
 *
 * Representa un activo creativo publicitario digital:
 * banners, videos, audio, native ads, AR, playables, etc.
 *
 * Encapsula las reglas de validación técnica, targeting y
 * distribución multiplataforma del activo digital.
 */

import { z } from 'zod';
import { FormatoBanner, type FormatoBannerValor } from '../value-objects/FormatoBanner';
import { TipoVideo, type TipoVideoValor } from '../value-objects/TipoVideo';
import { DimensionesAsset, type AspectRatio } from '../value-objects/DimensionesAsset';
import { PlataformaDestino, type PlataformaDestinoValor } from '../value-objects/PlataformaDestino';

export const EstadoActivoDigitalSchema = z.enum([
  'pendiente_validacion',
  'validacion_tecnica',
  'validacion_exitosa',
  'validacion_fallida',
  'aprobado',
  'rechazado',
  'activo',
  'pausado',
  'archivado'
]);
export type EstadoActivoDigitalValor = z.infer<typeof EstadoActivoDigitalSchema>;

export const TipoActivoDigitalSchema = z.enum([
  'banner_static',
  'banner_animated',
  'banner_html5',
  'banner_responsive',
  'video_preroll',
  'video_midroll',
  'video_bumper',
  'video_outstream',
  'video_vertical',
  'audio_streaming',
  'audio_podcast',
  'story_ad',
  'reel_ad',
  'carousel_ad',
  'native_ad',
  'playable_ad',
  'ar_experience',
  'lead_form'
]);
export type TipoActivoDigitalValor = z.infer<typeof TipoActivoDigitalSchema>;

export const FormatoArchivoSchema = z.enum([
  'JPG', 'PNG', 'WEBP', 'AVIF', 'GIF',
  'MP4', 'WEBM', 'MOV', 'HLS',
  'MP3', 'AAC', 'OPUS',
  'HTML5', 'VAST', 'VPAID',
  'GLB', 'GLTF', 'USDZ'
]);
export type FormatoArchivoValor = z.infer<typeof FormatoArchivoSchema>;

export interface ActivoDigitalProps {
  id: string;
  tenantId: string;
  cunaId: string;
  anuncianteId: string;
  codigo: string;              // DA-2026-0001
  nombre: string;
  tipo: TipoActivoDigitalValor;
  estado: EstadoActivoDigitalValor;
  formato: FormatoArchivoValor;
  urlOriginal: string;
  urlOptimizada?: string | null;
  urlThumbnail?: string | null;
  dimensiones?: DimensionesAsset | null;
  duracionSegundos?: number | null;
  pesoBytes: number;
  calidadScore: number;         // 0-100
  // Targeting
  plataformasDestino: PlataformaDestinoValor[];
  // Análisis IA
  scoreBrandSafety: number;     // 0-100
  objetosDetectados?: string[];
  // Vigencia
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  // Auditoría
  subidoPorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ActivoDigital {
  private constructor(private props: ActivoDigitalProps) { }

  // ─── Factory methods ────────────────────────────────────────────

  static create(
    props: Omit<ActivoDigitalProps, 'id' | 'estado' | 'calidadScore' | 'scoreBrandSafety' | 'createdAt' | 'updatedAt'>
      & { id?: string }
  ): ActivoDigital {
    const now = new Date();
    return new ActivoDigital({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      estado: 'pendiente_validacion',
      calidadScore: 0,
      scoreBrandSafety: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ActivoDigitalProps): ActivoDigital {
    return new ActivoDigital(props);
  }

  // ─── Value Object accessors ────────────────────────────────────

  get formatoBanner(): FormatoBanner | null {
    if (!this.esBanner()) return null;
    if (!this.props.dimensiones) return null;
    const { ancho, alto } = this.props.dimensiones;
    // Buscar el formato que coincide
    const formatos: FormatoBannerValor[] = ['300x250', '300x600', '728x90', '970x250', '160x600', '320x50', '320x100', '336x280', '250x250'];
    for (const f of formatos) {
      const banner = FormatoBanner.create(f);
      if (banner.coincide(ancho, alto)) return banner;
    }
    return null;
  }

  get tipoVideo(): TipoVideo | null {
    if (!this.esVideo()) return null;
    const tipoMap: Record<string, TipoVideoValor> = {
      video_preroll: 'preroll', video_midroll: 'midroll',
      video_bumper: 'bumper', video_outstream: 'outstream',
      video_vertical: 'vertical',
    };
    const tipo = tipoMap[this.props.tipo];
    return tipo ? TipoVideo.create(tipo) : null;
  }

  get dimensiones(): DimensionesAsset | null {
    return this.props.dimensiones ?? null;
  }

  get plataformas(): PlataformaDestino[] {
    return this.props.plataformasDestino.map((p) => PlataformaDestino.create(p));
  }

  // ─── Propiedades planas ────────────────────────────────────────

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get cunaId(): string { return this.props.cunaId; }
  get anuncianteId(): string { return this.props.anuncianteId; }
  get codigo(): string { return this.props.codigo; }
  get nombre(): string { return this.props.nombre; }
  get tipo(): TipoActivoDigitalValor { return this.props.tipo; }
  get estado(): EstadoActivoDigitalValor { return this.props.estado; }
  get formato(): FormatoArchivoValor { return this.props.formato; }
  get urlOriginal(): string { return this.props.urlOriginal; }
  get urlOptimizada(): string | null { return this.props.urlOptimizada ?? null; }
  get urlThumbnail(): string | null { return this.props.urlThumbnail ?? null; }
  get duracionSegundos(): number | null { return this.props.duracionSegundos ?? null; }
  get pesoBytes(): number { return this.props.pesoBytes; }
  get calidadScore(): number { return this.props.calidadScore; }
  get scoreBrandSafety(): number { return this.props.scoreBrandSafety; }
  get subidoPorId(): string { return this.props.subidoPorId; }
  get fechaInicio(): Date | null { return this.props.fechaInicio ?? null; }
  get fechaFin(): Date | null { return this.props.fechaFin ?? null; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // ─── Reglas de negocio ─────────────────────────────────────────

  /** Valida técnicamente el activo (peso, dimensiones, formato) */
  validarTecnica(): { valido: boolean; observaciones: string[] } {
    const observaciones: string[] = [];

    // Validar peso
    const pesoMB = this.props.pesoBytes / (1024 * 1024);
    const limiteMB = this.obtenerLimitePeso();
    if (pesoMB > limiteMB) {
      observaciones.push(`Peso ${pesoMB.toFixed(1)}MB excede límite de ${limiteMB}MB`);
    }

    // Validar duración para video
    if (this.esVideo() && this.props.duracionSegundos) {
      const tipoV = this.tipoVideo;
      if (tipoV && !tipoV.duracionValida(this.props.duracionSegundos)) {
        observaciones.push(`Duración ${this.props.duracionSegundos}s excede máximo de ${tipoV.duracionMaxima}s`);
      }
    }

    // Validar dimensiones si existen
    if (this.props.dimensiones) {
      const d = this.props.dimensiones;
      if (d.ancho < 50 || d.alto < 50) {
        observaciones.push('Dimensiones muy pequeñas (mínimo 50x50)');
      }
    }

    return {
      valido: observaciones.length === 0,
      observaciones,
    };
  }

  /** Aprueba el activo digital para publicación */
  aprobar(): void {
    if (this.props.estado !== 'validacion_exitosa') {
      throw new Error('Solo se puede aprobar un activo con validación exitosa');
    }
    this.props.estado = 'aprobado';
    this.props.updatedAt = new Date();
  }

  /** Rechaza el activo con motivo */
  rechazar(motivo: string): void {
    this.props.estado = 'rechazado';
    this.props.updatedAt = new Date();
  }

  /** Activa el asset para distribución */
  activar(): void {
    if (this.props.estado !== 'aprobado') {
      throw new Error('Solo se puede activar un activo aprobado');
    }
    this.props.estado = 'activo';
    this.props.updatedAt = new Date();
  }

  /** Pausa la distribución del activo */
  pausar(): void {
    if (this.props.estado !== 'activo') {
      throw new Error('Solo se puede pausar un activo activo');
    }
    this.props.estado = 'pausado';
    this.props.updatedAt = new Date();
  }

  /** Reanuda la distribución */
  reanudar(): void {
    if (this.props.estado !== 'pausado') {
      throw new Error('Solo se puede reanudar un activo pausado');
    }
    this.props.estado = 'activo';
    this.props.updatedAt = new Date();
  }

  /** Archiva el activo (finalizado) */
  archivar(): void {
    this.props.estado = 'archivado';
    this.props.updatedAt = new Date();
  }

  /** Marca la validación técnica como exitosa */
  marcarValidacionExitosa(score: number, brandSafety: number): void {
    this.props.calidadScore = Math.min(100, Math.max(0, score));
    this.props.scoreBrandSafety = Math.min(100, Math.max(0, brandSafety));
    this.props.estado = 'validacion_exitosa';
    this.props.updatedAt = new Date();
  }

  /** Marca la validación técnica como fallida */
  marcarValidacionFallida(observaciones: string): void {
    this.props.estado = 'validacion_fallida';
    this.props.updatedAt = new Date();
  }

  /** Genera la URL optimizada */
  asignarUrlOptimizada(url: string): void {
    this.props.urlOptimizada = url;
    this.props.updatedAt = new Date();
  }

  /** Actualiza plataformas de destino */
  actualizarPlataformas(plataformas: PlataformaDestinoValor[]): void {
    this.props.plataformasDestino = plataformas;
    this.props.updatedAt = new Date();
  }

  /** Actualiza campos básicos */
  actualizar(data: Partial<Pick<ActivoDigitalProps, 'nombre' | 'urlThumbnail'>>): void {
    if (data.nombre !== undefined) this.props.nombre = data.nombre;
    if (data.urlThumbnail !== undefined) this.props.urlThumbnail = data.urlThumbnail;
    this.props.updatedAt = new Date();
  }

  /** Actualiza vigencia */
  actualizarVigencia(fechaInicio: Date | null, fechaFin: Date | null): void {
    this.props.fechaInicio = fechaInicio;
    this.props.fechaFin = fechaFin;
    this.props.updatedAt = new Date();
  }

  // ─── Helpers de tipo ────────────────────────────────────────────

  esBanner(): boolean {
    return ['banner_static', 'banner_animated', 'banner_html5', 'banner_responsive'].includes(this.props.tipo);
  }

  esVideo(): boolean {
    return ['video_preroll', 'video_midroll', 'video_bumper', 'video_outstream', 'video_vertical'].includes(this.props.tipo);
  }

  esAudio(): boolean {
    return ['audio_streaming', 'audio_podcast'].includes(this.props.tipo);
  }

  esSocial(): boolean {
    return ['story_ad', 'reel_ad', 'carousel_ad', 'native_ad'].includes(this.props.tipo);
  }

  esInteractivo(): boolean {
    return ['playable_ad', 'ar_experience', 'lead_form'].includes(this.props.tipo);
  }

  /** Categoría del activo */
  get categoria(): 'banner' | 'video' | 'audio' | 'social' | 'interactivo' {
    if (this.esBanner()) return 'banner';
    if (this.esVideo()) return 'video';
    if (this.esAudio()) return 'audio';
    if (this.esSocial()) return 'social';
    return 'interactivo';
  }

  /** Verifica si el activo está dentro de su vigencia */
  esVigente(): boolean {
    const ahora = new Date();
    if (this.props.fechaInicio && ahora < this.props.fechaInicio) return false;
    if (this.props.fechaFin && ahora > this.props.fechaFin) return false;
    return true;
  }

  /** Peso en KB legible */
  get pesoLegible(): string {
    const kb = this.props.pesoBytes / 1024;
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)}MB`;
    return `${kb.toFixed(0)}KB`;
  }

  private obtenerLimitePeso(): number {
    if (this.esVideo()) return 500; // 500MB
    if (this.esAudio()) return 20;  // 20MB
    if (this.esInteractivo()) return 50; // 50MB
    return 5; // 5MB para banners
  }

  toJSON(): ActivoDigitalProps {
    return {
      ...this.props,
      dimensiones: this.props.dimensiones?.toJSON() ?? null,
    } as unknown as ActivoDigitalProps;
  }
}

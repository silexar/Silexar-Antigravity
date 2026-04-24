/**
 * ENTITY: CUNA — TIER 0
 *
 * Entidad raíz del módulo de cuñas. Representa un activo creativo
 * publicitario (audio, mención, presentación, cierre, promo-IDA).
 *
 * Encapsula todas las reglas de negocio del ciclo de vida de una cuña:
 * aprobación, puesta en aire, pausado, finalización y vencimientos.
 */

import { CunaId } from '../value-objects/CunaId';
import { EstadoCuna, type EstadoCunaValor } from '../value-objects/EstadoCuna';
import { Duracion } from '../value-objects/Duracion';
import { CalidadAudio, type CalidadAudioProps } from '../value-objects/CalidadAudio';

export const TipoCunaSchema = [
  'spot', 'mencion', 'auspicio', 'jingle', 'promo', 'institucional',
  'audio', 'presentacion', 'cierre', 'promo_ida',
  'audio_streaming', 'audio_podcast',
  'video_preroll', 'video_midroll', 'video_bumper', 'video_outstream', 'video_vertical',
  'banner_static', 'banner_animated', 'banner_html5', 'banner_responsive',
  'story_ad', 'reel_ad', 'carousel_ad', 'native_ad',
  'playable_ad', 'ar_experience', 'lead_form'
] as const;
export type TipoCunaValor = typeof TipoCunaSchema[number];

export interface CunaProps {
  id: string;
  tenantId: string;
  codigo: string;               // CunaId serializado (SPX000000)
  nombre: string;
  tipo: TipoCunaValor;
  estado: EstadoCunaValor;
  anuncianteId: string;
  campanaId?: string | null;
  contratoId?: string | null;
  productoNombre?: string | null;
  descripcion?: string | null;
  // Audio
  pathAudio: string;
  duracionSegundos: number;
  duracionMilisegundos?: number | null;
  formatoAudio: CalidadAudioProps['formato'];
  bitrate?: number | null;
  sampleRate?: number | null;
  tamanoBytes?: number | null;
  // Versionado
  version: number;
  esVersionActual: boolean;
  versionAnteriorId?: string | null;
  // Vigencia
  fechaInicioVigencia?: Date | null;
  fechaFinVigencia?: Date | null;
  // Aprobación
  aprobadoPorId?: string | null;
  fechaAprobacion?: Date | null;
  motivoRechazo?: string | null;
  // Metadatos
  fingerprint?: string | null;
  transcripcion?: string | null;
  urgencia?: string | null;
  // Auditoría
  subidoPorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Cuna {
  private constructor(private props: CunaProps) {}

  // ─── Factory methods ────────────────────────────────────────────

  static create(
    props: Omit<CunaProps, 'id' | 'estado' | 'version' | 'esVersionActual' | 'createdAt' | 'updatedAt'>
    & { id?: string }
  ): Cuna {
    const now = new Date();
    return new Cuna({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      estado: 'borrador',
      version: 1,
      esVersionActual: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Reconstituye la entidad desde persistencia (no valida estado de negocio) */
  static reconstitute(props: CunaProps): Cuna {
    return new Cuna(props);
  }

  // ─── Value Object accessors ────────────────────────────────────

  get cunaId(): CunaId {
    return CunaId.fromString(this.props.codigo);
  }

  get estadoCuna(): EstadoCuna {
    return EstadoCuna.create(this.props.estado);
  }

  get duracion(): Duracion {
    return Duracion.create(
      this.props.duracionSegundos,
      this.props.duracionMilisegundos ?? 0
    );
  }

  get calidadAudio(): CalidadAudio {
    return CalidadAudio.create({
      formato: this.props.formatoAudio,
      bitrate: this.props.bitrate ?? 128,
      sampleRate: this.props.sampleRate ?? 44100,
      tamanoBytes: this.props.tamanoBytes ?? undefined,
    });
  }

  // ─── Propiedades planas ────────────────────────────────────────

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get codigo(): string { return this.props.codigo; }
  get nombre(): string { return this.props.nombre; }
  get tipo(): TipoCunaValor { return this.props.tipo; }
  get estado(): EstadoCunaValor { return this.props.estado; }
  get anuncianteId(): string { return this.props.anuncianteId; }
  get campanaId(): string | null { return this.props.campanaId ?? null; }
  get contratoId(): string | null { return this.props.contratoId ?? null; }
  get version(): number { return this.props.version; }
  get pathAudio(): string { return this.props.pathAudio; }
  get subidoPorId(): string { return this.props.subidoPorId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get aprobadoPorId(): string | null { return this.props.aprobadoPorId ?? null; }
  get fechaAprobacion(): Date | null { return this.props.fechaAprobacion ?? null; }
  get fechaFinVigencia(): Date | null { return this.props.fechaFinVigencia ?? null; }
  get urgencia(): string | null { return this.props.urgencia ?? null; }

  // ─── Reglas de negocio ─────────────────────────────────────────

  /** Aprueba la cuña. Solo desde pendiente_aprobacion. */
  aprobar(aprobadoPorId: string): void {
    const nuevoEstado = this.estadoCuna.transicionarA('aprobada');
    const now = new Date();
    this.props.estado = nuevoEstado.valor;
    this.props.aprobadoPorId = aprobadoPorId;
    this.props.fechaAprobacion = now;
    this.props.updatedAt = now;
  }

  /** Rechaza la cuña con motivo. Solo desde pendiente_aprobacion. */
  rechazar(rechazadoPorId: string, motivo: string): void {
    const nuevoEstado = this.estadoCuna.transicionarA('rechazada');
    const now = new Date();
    this.props.estado = nuevoEstado.valor;
    this.props.aprobadoPorId = rechazadoPorId;
    this.props.motivoRechazo = motivo;
    this.props.updatedAt = now;
  }

  /** Envía a revisión. Solo desde borrador. */
  enviarARevision(): void {
    const nuevoEstado = this.estadoCuna.transicionarA('pendiente_aprobacion');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Activa la cuña para emisión al aire. Solo desde aprobada. */
  ponerEnAire(): void {
    const nuevoEstado = this.estadoCuna.transicionarA('en_aire');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Pausa la emisión. Solo desde en_aire. */
  pausar(): void {
    const nuevoEstado = this.estadoCuna.transicionarA('pausada');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Reanuda la emisión. Solo desde pausada. */
  reanudar(): void {
    const nuevoEstado = this.estadoCuna.transicionarA('en_aire');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Finaliza la cuña definitivamente. No reversible. */
  finalizar(): void {
    const nuevoEstado = this.estadoCuna.transicionarA('finalizada');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Retorna a borrador (desde rechazada o pendiente). */
  volverABorrador(): void {
    const nuevoEstado = this.estadoCuna.transicionarA('borrador');
    this.props.estado = nuevoEstado.valor;
    this.props.motivoRechazo = null;
    this.props.updatedAt = new Date();
  }

  /** Actualiza campos editables (nombre, descripción, vigencia, urgencia). */
  actualizar(campos: {
    nombre?: string;
    descripcion?: string | null;
    fechaFinVigencia?: Date | null;
    urgencia?: string | null;
    campanaId?: string | null;
    contratoId?: string | null;
  }): void {
    if (campos.nombre !== undefined) this.props.nombre = campos.nombre;
    if (campos.descripcion !== undefined) this.props.descripcion = campos.descripcion;
    if (campos.fechaFinVigencia !== undefined) this.props.fechaFinVigencia = campos.fechaFinVigencia;
    if (campos.urgencia !== undefined) this.props.urgencia = campos.urgencia;
    if (campos.campanaId !== undefined) this.props.campanaId = campos.campanaId;
    if (campos.contratoId !== undefined) this.props.contratoId = campos.contratoId;
    this.props.updatedAt = new Date();
  }

  /** true si la cuña está dentro de su período de vigencia */
  esVigente(): boolean {
    const ahora = new Date();
    if (this.props.fechaInicioVigencia && ahora < this.props.fechaInicioVigencia) {
      return false;
    }
    if (this.props.fechaFinVigencia && ahora > this.props.fechaFinVigencia) {
      return false;
    }
    return true;
  }

  /** Días restantes hasta el vencimientos. -1 si no tiene fecha fin. */
  diasParaVencer(): number {
    if (!this.props.fechaFinVigencia) return -1;
    const ahora = new Date();
    const diff = this.props.fechaFinVigencia.getTime() - ahora.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  toJSON(): CunaProps {
    return { ...this.props };
  }
}

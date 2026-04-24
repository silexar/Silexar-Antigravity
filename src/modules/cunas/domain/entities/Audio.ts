/**
 * ENTITY: AUDIO — TIER 0
 *
 * Representa un archivo de audio asociado a una Cuña.
 * Encapsula las reglas de negocio sobre calidad de broadcast,
 * formatos aceptados y ciclo de vida del activo de audio.
 *
 * Relación: Un Audio pertenece a exactamente una Cuna (cunaId).
 * Una Cuna puede tener múltiples versiones de Audio históricas.
 */

import { EstadoCuna, type EstadoCunaValor } from '../value-objects/EstadoCuna';
import { CalidadAudio, type CalidadAudioProps } from '../value-objects/CalidadAudio';
import { Duracion } from '../value-objects/Duracion';

export type FormatoAudioValor = 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'm4a';

export const FormatoAudioSchema = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'] as const;

export type EstadoProcesamiento =
  | 'pendiente'       // Recién subido, sin procesar
  | 'procesando'      // Análisis técnico en curso
  | 'listo'           // Análisis completo, aprobado
  | 'rechazado'       // No cumple estándares de calidad
  | 'error';          // Fallo técnico durante procesamiento

export interface AudioProps {
  id: string;
  tenantId: string;
  cunaId: string;                          // Cuña a la que pertenece
  // Almacenamiento
  pathOriginal: string;                    // Ruta GCS del archivo original
  pathFinal?: string | null;               // Ruta GCS del archivo procesado final
  nombreArchivo: string;                   // Nombre del archivo subido
  tamanoBytes: number;
  // Especificaciones técnicas
  formato: FormatoAudioValor;
  duracionSegundos: number;
  duracionMilisegundos: number;
  bitrate?: number | null;                 // kbps
  sampleRate?: number | null;              // Hz (44100 / 48000)
  canales?: number | null;                 // 1=mono, 2=stereo
  // Análisis de calidad (broadcast)
  peakLevelDb?: number | null;             // Peak máximo en dBFS
  rmsLevelDb?: number | null;              // RMS en dBFS
  lufsIntegrado?: number | null;           // Loudness EBU R128
  rangoDinamicoDB?: number | null;         // Dynamic Range
  fingerprint?: string | null;             // Audio fingerprint para dedup
  // Transcripción e IA
  transcripcion?: string | null;           // Speech-to-text
  idiomaDetectado?: string | null;
  puntajeCalidad?: number | null;          // 0-100
  // Estado del procesamiento
  estadoProcesamiento: EstadoProcesamiento;
  motivoRechazo?: string | null;
  esVersionActual: boolean;                // true = versión activa
  esFinalBroadcast: boolean;               // true = listo para emisión
  // Auditoría
  subidoPorId: string;
  procesadoEn?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Audio {
  private constructor(private props: AudioProps) {}

  // ─── Factory methods ─────────────────────────────────────────────

  static create(
    props: Omit<AudioProps, 'id' | 'estadoProcesamiento' | 'esVersionActual' | 'esFinalBroadcast' | 'createdAt' | 'updatedAt'>
    & { id?: string }
  ): Audio {
    const now = new Date();
    return new Audio({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      estadoProcesamiento: 'pendiente',
      esVersionActual: true,
      esFinalBroadcast: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Reconstituye desde persistencia sin validación de negocio */
  static reconstitute(props: AudioProps): Audio {
    return new Audio(props);
  }

  // ─── Value Object accessors ───────────────────────────────────────

  get calidadAudio(): CalidadAudio {
    return CalidadAudio.create({
      formato: this.props.formato,
      bitrate: this.props.bitrate ?? 128,
      sampleRate: this.props.sampleRate ?? 44100,
      tamanoBytes: this.props.tamanoBytes,
    });
  }

  get duracion(): Duracion {
    return Duracion.create(
      this.props.duracionSegundos,
      this.props.duracionMilisegundos
    );
  }

  // ─── Propiedades planas ───────────────────────────────────────────

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get cunaId(): string { return this.props.cunaId; }
  get pathOriginal(): string { return this.props.pathOriginal; }
  get pathFinal(): string | null { return this.props.pathFinal ?? null; }
  get nombreArchivo(): string { return this.props.nombreArchivo; }
  get tamanoBytes(): number { return this.props.tamanoBytes; }
  get formato(): FormatoAudioValor { return this.props.formato; }
  get duracionSegundos(): number { return this.props.duracionSegundos; }
  get bitrate(): number | null { return this.props.bitrate ?? null; }
  get sampleRate(): number | null { return this.props.sampleRate ?? null; }
  get canales(): number | null { return this.props.canales ?? null; }
  get peakLevelDb(): number | null { return this.props.peakLevelDb ?? null; }
  get rmsLevelDb(): number | null { return this.props.rmsLevelDb ?? null; }
  get lufsIntegrado(): number | null { return this.props.lufsIntegrado ?? null; }
  get fingerprint(): string | null { return this.props.fingerprint ?? null; }
  get transcripcion(): string | null { return this.props.transcripcion ?? null; }
  get puntajeCalidad(): number | null { return this.props.puntajeCalidad ?? null; }
  get estadoProcesamiento(): EstadoProcesamiento { return this.props.estadoProcesamiento; }
  get motivoRechazo(): string | null { return this.props.motivoRechazo ?? null; }
  get esVersionActual(): boolean { return this.props.esVersionActual; }
  get esFinalBroadcast(): boolean { return this.props.esFinalBroadcast; }
  get subidoPorId(): string { return this.props.subidoPorId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // ─── Reglas de negocio ────────────────────────────────────────────

  /** Inicia el pipeline de análisis técnico del audio */
  iniciarProcesamiento(): void {
    if (this.props.estadoProcesamiento !== 'pendiente') {
      throw new Error(`No se puede iniciar procesamiento desde estado: ${this.props.estadoProcesamiento}`);
    }
    this.props.estadoProcesamiento = 'procesando';
    this.props.updatedAt = new Date();
  }

  /** Registra los resultados del análisis técnico y marca como listo */
  registrarAnalisisTecnico(analisis: {
    duracionSegundos: number;
    duracionMilisegundos: number;
    bitrate: number;
    sampleRate: number;
    canales: number;
    peakLevelDb: number;
    rmsLevelDb: number;
    lufsIntegrado: number;
    rangoDinamicoDB: number;
    fingerprint: string;
    puntajeCalidad: number;
    pathFinal: string;
  }): void {
    const now = new Date();
    this.props.duracionSegundos = analisis.duracionSegundos;
    this.props.duracionMilisegundos = analisis.duracionMilisegundos;
    this.props.bitrate = analisis.bitrate;
    this.props.sampleRate = analisis.sampleRate;
    this.props.canales = analisis.canales;
    this.props.peakLevelDb = analisis.peakLevelDb;
    this.props.rmsLevelDb = analisis.rmsLevelDb;
    this.props.lufsIntegrado = analisis.lufsIntegrado;
    this.props.rangoDinamicoDB = analisis.rangoDinamicoDB;
    this.props.fingerprint = analisis.fingerprint;
    this.props.puntajeCalidad = analisis.puntajeCalidad;
    this.props.pathFinal = analisis.pathFinal;
    this.props.estadoProcesamiento = 'listo';
    this.props.procesadoEn = now;
    this.props.updatedAt = now;
  }

  /** Registra la transcripción generada por speech-to-text */
  registrarTranscripcion(texto: string, idioma: string): void {
    this.props.transcripcion = texto;
    this.props.idiomaDetectado = idioma;
    this.props.updatedAt = new Date();
  }

  /** Rechaza el audio por no cumplir estándares de calidad */
  rechazar(motivo: string): void {
    this.props.estadoProcesamiento = 'rechazado';
    this.props.motivoRechazo = motivo;
    this.props.updatedAt = new Date();
  }

  /** Registra un error de procesamiento técnico */
  registrarError(descripcion: string): void {
    this.props.estadoProcesamiento = 'error';
    this.props.motivoRechazo = descripcion;
    this.props.updatedAt = new Date();
  }

  /** Marca el audio como versión final lista para broadcast */
  marcarComoBroadcastReady(): void {
    if (this.props.estadoProcesamiento !== 'listo') {
      throw new Error('El audio debe estar en estado "listo" para ser marcado como broadcast-ready');
    }
    this.props.esFinalBroadcast = true;
    this.props.updatedAt = new Date();
  }

  /** Desactiva esta versión (cuando se sube una nueva) */
  desactivarVersion(): void {
    this.props.esVersionActual = false;
    this.props.esFinalBroadcast = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica si el audio cumple los estándares de broadcast.
   * Reglas: LUFS ≤ -16, Peak ≤ -1 dBFS, bitrate ≥ 128 kbps
   */
  cumpleEstandaresBroadcast(): boolean {
    if (!this.props.lufsIntegrado || !this.props.peakLevelDb || !this.props.bitrate) {
      return false;
    }
    return (
      this.props.lufsIntegrado <= -16 &&
      this.props.peakLevelDb <= -1 &&
      this.props.bitrate >= 128
    );
  }

  toJSON(): AudioProps {
    return { ...this.props };
  }
}

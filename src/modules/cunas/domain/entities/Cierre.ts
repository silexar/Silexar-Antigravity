import { CunaId } from '../value-objects/CunaId';
import { EstadoCuna, type EstadoCunaValor } from '../value-objects/EstadoCuna';
import { Duracion } from '../value-objects/Duracion';
import { CalidadAudio, type CalidadAudioProps } from '../value-objects/CalidadAudio';

export interface CierreProps {
  id: string;
  tenantId: string;
  codigo: string;               // CunaId serializado (SPX000000)
  nombre: string;
  estado: EstadoCunaValor;
  anuncianteId: string;
  campanaId?: string | null;
  contratoId?: string | null;
  productoNombre?: string | null;
  descripcion?: string | null;
  // Especificaciones del cierre
  contenidoTexto: string;
  programaRelacionado: string;
  tipoCierre: 'salida' | 'transicion' | 'agradecimiento';
  duracionEstimadaSegundos: number;
  // Validaciones cruzadas
  presentacionAsociadaId?: string | null; // Relación con la presentación correspondiente
  necesitaValidacionPresentacion: boolean;
  // Generación de audio
  necesitaConversionAudio: boolean;
  audioGeneradoId?: string | null;
  // Variables personalizables
  variablesPermitidas: string[];
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
  palabrasClave: string[];
  tiempoLocucionEstimado?: number | null; // En segundos
  // Auditoría
  subidoPorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Cierre {
  private constructor(private props: CierreProps) {}

  // ─── Factory methods ────────────────────────────────────────────

  static create(
    props: Omit<CierreProps, 'id' | 'estado' | 'version' | 'esVersionActual' | 'createdAt' | 'updatedAt'>
    & { id?: string }
  ): Cierre {
    const now = new Date();
    return new Cierre({
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
  static reconstitute(props: CierreProps): Cierre {
    return new Cierre(props);
  }

  // ─── Value Object accessors ────────────────────────────────────

  get cierreId(): CunaId {
    return CunaId.fromString(this.props.codigo);
  }

  get estadoCierre(): EstadoCuna {
    return EstadoCuna.create(this.props.estado);
  }

  get duracionEstimada(): Duracion {
    return Duracion.create(
      this.props.duracionEstimadaSegundos,
      0
    );
  }

  get calidadAudio(): CalidadAudio {
    return CalidadAudio.create({
      formato: 'mp3',
      bitrate: 128,
      sampleRate: 44100,
      tamanoBytes: undefined,
    });
  }

  // ─── Propiedades planas ────────────────────────────────────────

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get codigo(): string { return this.props.codigo; }
  get nombre(): string { return this.props.nombre; }
  get estado(): EstadoCunaValor { return this.props.estado; }
  get anuncianteId(): string { return this.props.anuncianteId; }
  get campanaId(): string | null { return this.props.campanaId ?? null; }
  get contratoId(): string | null { return this.props.contratoId ?? null; }
  get version(): number { return this.props.version; }
  get contenidoTexto(): string { return this.props.contenidoTexto; }
  get programaRelacionado(): string { return this.props.programaRelacionado; }
  get tipoCierre(): 'salida' | 'transicion' | 'agradecimiento' { return this.props.tipoCierre; }
  get necesitaConversionAudio(): boolean { return this.props.necesitaConversionAudio; }
  get audioGeneradoId(): string | null { return this.props.audioGeneradoId ?? null; }
  get presentacionAsociadaId(): string | null { return this.props.presentacionAsociadaId ?? null; }
  get necesitaValidacionPresentacion(): boolean { return this.props.necesitaValidacionPresentacion; }
  get subidoPorId(): string { return this.props.subidoPorId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get aprobadoPorId(): string | null { return this.props.aprobadoPorId ?? null; }
  get fechaAprobacion(): Date | null { return this.props.fechaAprobacion ?? null; }
  get fechaFinVigencia(): Date | null { return this.props.fechaFinVigencia ?? null; }
  get palabrasClave(): string[] { return this.props.palabrasClave; }

  // ─── Métodos específicos para Cierre ───────────────────────────

  /** Actualiza el contenido textual del cierre */
  actualizarContenidoTexto(nuevoTexto: string): void {
    this.props.contenidoTexto = nuevoTexto;
    this.props.updatedAt = new Date();
  }

  /** Actualiza el programa relacionado */
  actualizarProgramaRelacionado(programa: string): void {
    this.props.programaRelacionado = programa;
    this.props.updatedAt = new Date();
  }

  /** Actualiza el tipo de cierre */
  actualizarTipoCierre(tipo: 'salida' | 'transicion' | 'agradecimiento'): void {
    this.props.tipoCierre = tipo;
    this.props.updatedAt = new Date();
  }

  /** Marca que se necesita generar audio a partir del texto */
  solicitarConversionAudio(): void {
    this.props.necesitaConversionAudio = true;
    this.props.updatedAt = new Date();
  }

  /** Registra que se ha generado audio a partir del texto */
  registrarAudioGenerado(audioId: string): void {
    this.props.audioGeneradoId = audioId;
    this.props.necesitaConversionAudio = false;
    this.props.updatedAt = new Date();
  }

  /** Asocia el cierre con una presentación específica */
  asociarConPresentacion(presentacionId: string): void {
    this.props.presentacionAsociadaId = presentacionId;
    this.props.necesitaValidacionPresentacion = false; // Ya asociada
    this.props.updatedAt = new Date();
  }

  /** Desasocia el cierre de una presentación */
  desasociarDePresentacion(): void {
    this.props.presentacionAsociadaId = undefined;
    this.props.necesitaValidacionPresentacion = true; // Ahora necesita asociación
    this.props.updatedAt = new Date();
  }

  /** Marca que necesita validación contra presentación */
  marcarParaValidacionPresentacion(): void {
    this.props.necesitaValidacionPresentacion = true;
    this.props.updatedAt = new Date();
  }

  /** Agrega una palabra clave */
  agregarPalabraClave(palabra: string): void {
    if (!this.props.palabrasClave.includes(palabra)) {
      this.props.palabrasClave.push(palabra);
      this.props.updatedAt = new Date();
    }
  }

  /** Elimina una palabra clave */
  eliminarPalabraClave(palabra: string): void {
    this.props.palabrasClave = this.props.palabrasClave.filter(p => p !== palabra);
    this.props.updatedAt = new Date();
  }

  /** Actualiza variables personalizables permitidas */
  actualizarVariablesPermitidas(variables: string[]): void {
    this.props.variablesPermitidas = variables;
    this.props.updatedAt = new Date();
  }

  // ─── Reglas de negocio heredadas de Cuna ───────────────────────

  /** Aprueba el cierre. Solo desde pendiente_aprobacion. */
  aprobar(aprobadoPorId: string): void {
    const nuevoEstado = this.estadoCierre.transicionarA('aprobada');
    const now = new Date();
    this.props.estado = nuevoEstado.valor;
    this.props.aprobadoPorId = aprobadoPorId;
    this.props.fechaAprobacion = now;
    this.props.updatedAt = now;
  }

  /** Rechaza el cierre con motivo. Solo desde pendiente_aprobacion. */
  rechazar(rechazadoPorId: string, motivo: string): void {
    const nuevoEstado = this.estadoCierre.transicionarA('rechazada');
    const now = new Date();
    this.props.estado = nuevoEstado.valor;
    this.props.aprobadoPorId = rechazadoPorId;
    this.props.motivoRechazo = motivo;
    this.props.updatedAt = now;
  }

  /** Envía a revisión. Solo desde borrador. */
  enviarARevision(): void {
    const nuevoEstado = this.estadoCierre.transicionarA('pendiente_aprobacion');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Activa el cierre para emisión al aire. Solo desde aprobada. */
  ponerEnAire(): void {
    const nuevoEstado = this.estadoCierre.transicionarA('en_aire');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Pausa la emisión. Solo desde en_aire. */
  pausar(): void {
    const nuevoEstado = this.estadoCierre.transicionarA('pausada');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Reanuda la emisión. Solo desde pausada. */
  reanudar(): void {
    const nuevoEstado = this.estadoCierre.transicionarA('en_aire');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Finaliza el cierre definitivamente. No reversible. */
  finalizar(): void {
    const nuevoEstado = this.estadoCierre.transicionarA('finalizada');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  /** Retorna a borrador (desde rechazada o pendiente). */
  volverABorrador(): void {
    const nuevoEstado = this.estadoCierre.transicionarA('borrador');
    this.props.estado = nuevoEstado.valor;
    this.props.motivoRechazo = null;
    this.props.updatedAt = new Date();
  }

  /** Actualiza campos editables (nombre, descripción, vigencia). */
  actualizar(campos: {
    nombre?: string;
    descripcion?: string | null;
    fechaFinVigencia?: Date | null;
    campanaId?: string | null;
    contratoId?: string | null;
  }): void {
    if (campos.nombre !== undefined) this.props.nombre = campos.nombre;
    if (campos.descripcion !== undefined) this.props.descripcion = campos.descripcion;
    if (campos.fechaFinVigencia !== undefined) this.props.fechaFinVigencia = campos.fechaFinVigencia;
    if (campos.campanaId !== undefined) this.props.campanaId = campos.campanaId;
    if (campos.contratoId !== undefined) this.props.contratoId = campos.contratoId;
    this.props.updatedAt = new Date();
  }

  /** true si el cierre está dentro de su período de vigencia */
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

  toJSON(): CierreProps {
    return { ...this.props };
  }
}

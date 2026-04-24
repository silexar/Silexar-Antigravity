/**
 * RegistroAire — Entity
 * Representa una grabación de 24h de aire de una emisora.
 */

import { EstadoRegistroAire, type EstadoRegistroAireValue } from '../value-objects/EstadoRegistroAire';
import { HashSHA256 } from '../value-objects/HashSHA256';

export interface RegistroAireProps {
  id: string;
  tenantId: string;
  emisoraId: string;
  fechaEmision: Date;
  urlArchivo: string;
  duracionSegundos: number;
  formato: string;
  tamanioBytes?: number;
  hashSha256?: string;
  metadata?: Record<string, unknown>;
  estado: EstadoRegistroAireValue;
  errorMensaje?: string;
  procesadoPorId?: string;
  fechaProcesamiento?: Date;
  creadoPorId?: string;
  creadoEn: Date;
}

export interface RegistroAireDomainEvent {
  tipo: string;
  registroAireId: string;
  tenantId: string;
  datos: Record<string, unknown>;
  ocurridoEn: Date;
}

export class RegistroAire {
  private readonly _id: string;
  private readonly _tenantId: string;
  private readonly _emisoraId: string;
  private readonly _fechaEmision: Date;
  private _urlArchivo: string;
  private _duracionSegundos: number;
  private _formato: string;
  private _tamanioBytes?: number;
  private _hashSha256?: HashSHA256;
  private _metadata: Record<string, unknown>;
  private _estado: EstadoRegistroAire;
  private _errorMensaje?: string;
  private _procesadoPorId?: string;
  private _fechaProcesamiento?: Date;
  private readonly _creadoPorId?: string;
  private readonly _creadoEn: Date;
  private _eventos: RegistroAireDomainEvent[] = [];

  private constructor(props: RegistroAireProps) {
    if (!props.id) throw new Error('ID de registro de aire es requerido');
    if (!props.tenantId) throw new Error('Tenant ID es requerido');
    if (!props.emisoraId) throw new Error('Emisora ID es requerido');
    if (!props.urlArchivo) throw new Error('URL del archivo es requerida');
    if (props.duracionSegundos <= 0) throw new Error('La duración debe ser mayor a 0');

    this._id = props.id;
    this._tenantId = props.tenantId;
    this._emisoraId = props.emisoraId;
    this._fechaEmision = props.fechaEmision;
    this._urlArchivo = props.urlArchivo;
    this._duracionSegundos = props.duracionSegundos;
    this._formato = props.formato;
    this._tamanioBytes = props.tamanioBytes;
    this._hashSha256 = props.hashSha256 ? HashSHA256.crear(props.hashSha256) : undefined;
    this._metadata = props.metadata ?? {};
    this._estado = EstadoRegistroAire.crear(props.estado);
    this._errorMensaje = props.errorMensaje;
    this._procesadoPorId = props.procesadoPorId;
    this._fechaProcesamiento = props.fechaProcesamiento;
    this._creadoPorId = props.creadoPorId;
    this._creadoEn = props.creadoEn;
  }

  static crear(props: RegistroAireProps): RegistroAire {
    const ra = new RegistroAire(props);
    ra._agregarEvento('REGISTRO_AIRE_CREADO', {
      emisoraId: props.emisoraId,
      fechaEmision: props.fechaEmision,
      urlArchivo: props.urlArchivo,
    });
    return ra;
  }

  static reconstituir(props: RegistroAireProps): RegistroAire {
    return new RegistroAire(props);
  }

  iniciarProcesamiento(procesadoPorId: string): void {
    if (!this._estado.puedeTransicionarA('procesando')) {
      throw new Error(`No se puede iniciar procesamiento en estado ${this._estado.valor}`);
    }
    this._estado = EstadoRegistroAire.procesando();
    this._procesadoPorId = procesadoPorId;
    this._agregarEvento('REGISTRO_AIRE_PROCESANDO', { procesadoPorId });
  }

  marcarProcesado(hashSha256?: string, metadata?: Record<string, unknown>): void {
    if (!this._estado.puedeTransicionarA('procesado')) {
      throw new Error(`No se puede marcar como procesado en estado ${this._estado.valor}`);
    }
    this._estado = EstadoRegistroAire.procesado();
    this._fechaProcesamiento = new Date();
    if (hashSha256) this._hashSha256 = HashSHA256.crear(hashSha256);
    if (metadata) this._metadata = { ...this._metadata, ...metadata };
    this._agregarEvento('REGISTRO_AIRE_PROCESADO', { hashSha256, metadata });
  }

  marcarError(mensaje: string): void {
    if (!this._estado.puedeTransicionarA('error')) {
      throw new Error(`No se puede marcar como error en estado ${this._estado.valor}`);
    }
    this._estado = EstadoRegistroAire.error();
    this._errorMensaje = mensaje;
    this._agregarEvento('REGISTRO_AIRE_ERROR', { mensaje });
  }

  actualizarHash(hashSha256: string): void {
    this._hashSha256 = HashSHA256.crear(hashSha256);
  }

  private _agregarEvento(tipo: string, datos: Record<string, unknown>): void {
    this._eventos.push({
      tipo,
      registroAireId: this._id,
      tenantId: this._tenantId,
      datos,
      ocurridoEn: new Date(),
    });
  }

  tomarEventos(): RegistroAireDomainEvent[] {
    const eventos = [...this._eventos];
    this._eventos = [];
    return eventos;
  }

  get id(): string                     { return this._id; }
  get tenantId(): string               { return this._tenantId; }
  get emisoraId(): string              { return this._emisoraId; }
  get fechaEmision(): Date             { return this._fechaEmision; }
  get urlArchivo(): string             { return this._urlArchivo; }
  get duracionSegundos(): number       { return this._duracionSegundos; }
  get formato(): string                { return this._formato; }
  get tamanioBytes(): number | undefined { return this._tamanioBytes; }
  get hashSha256(): HashSHA256 | undefined { return this._hashSha256; }
  get metadata(): Record<string, unknown> { return this._metadata; }
  get estado(): EstadoRegistroAire     { return this._estado; }
  get errorMensaje(): string | undefined { return this._errorMensaje; }
  get procesadoPorId(): string | undefined { return this._procesadoPorId; }
  get fechaProcesamiento(): Date | undefined { return this._fechaProcesamiento; }
  get creadoPorId(): string | undefined { return this._creadoPorId; }
  get creadoEn(): Date                 { return this._creadoEn; }
}

/**
 * ClipEvidencia — Entity
 * Fragmento exacto de audio extraído y aprobado como evidencia.
 */

import { HashSHA256 } from '../value-objects/HashSHA256';

export interface ClipEvidenciaProps {
  id: string;
  tenantId: string;
  verificacionId: string;
  deteccionId?: string;
  urlArchivo: string;
  duracionSegundos: number;
  formato: string;
  horaInicioClip: string;
  horaFinClip: string;
  hashSha256: string;
  transcripcion?: string;
  aprobado: boolean;
  aprobadoPorId?: string;
  fechaAprobacion?: Date;
  fechaExpiracion: Date;
  creadoPorId?: string;
  creadoEn: Date;
}

export class ClipEvidencia {
  private readonly _id: string;
  private readonly _tenantId: string;
  private readonly _verificacionId: string;
  private readonly _deteccionId?: string;
  private _urlArchivo: string;
  private _duracionSegundos: number;
  private _formato: string;
  private readonly _horaInicioClip: string;
  private readonly _horaFinClip: string;
  private _hashSha256: HashSHA256;
  private _transcripcion?: string;
  private _aprobado: boolean;
  private _aprobadoPorId?: string;
  private _fechaAprobacion?: Date;
  private readonly _fechaExpiracion: Date;
  private readonly _creadoPorId?: string;
  private readonly _creadoEn: Date;

  private constructor(props: ClipEvidenciaProps) {
    if (!props.id) throw new Error('ID de clip es requerido');
    if (!props.tenantId) throw new Error('Tenant ID es requerido');
    if (!props.verificacionId) throw new Error('Verificación ID es requerido');
    if (!props.urlArchivo) throw new Error('URL del archivo es requerida');
    if (props.duracionSegundos <= 0) throw new Error('La duración debe ser mayor a 0');
    if (props.horaInicioClip >= props.horaFinClip) {
      throw new Error('La hora de inicio del clip debe ser anterior a la hora de fin');
    }

    this._id = props.id;
    this._tenantId = props.tenantId;
    this._verificacionId = props.verificacionId;
    this._deteccionId = props.deteccionId;
    this._urlArchivo = props.urlArchivo;
    this._duracionSegundos = props.duracionSegundos;
    this._formato = props.formato;
    this._horaInicioClip = props.horaInicioClip;
    this._horaFinClip = props.horaFinClip;
    this._hashSha256 = HashSHA256.crear(props.hashSha256);
    this._transcripcion = props.transcripcion;
    this._aprobado = props.aprobado;
    this._aprobadoPorId = props.aprobadoPorId;
    this._fechaAprobacion = props.fechaAprobacion;
    this._fechaExpiracion = props.fechaExpiracion;
    this._creadoPorId = props.creadoPorId;
    this._creadoEn = props.creadoEn;
  }

  static crear(props: Omit<ClipEvidenciaProps, 'aprobado' | 'fechaAprobacion'>): ClipEvidencia {
    return new ClipEvidencia({
      ...props,
      aprobado: false,
    });
  }

  static reconstituir(props: ClipEvidenciaProps): ClipEvidencia {
    return new ClipEvidencia(props);
  }

  aprobar(aprobadoPorId: string): void {
    if (this._aprobado) {
      throw new Error('El clip de evidencia ya fue aprobado');
    }
    this._aprobado = true;
    this._aprobadoPorId = aprobadoPorId;
    this._fechaAprobacion = new Date();
  }

  estaExpirado(ahora = new Date()): boolean {
    return ahora > this._fechaExpiracion;
  }

  get id(): string                     { return this._id; }
  get tenantId(): string               { return this._tenantId; }
  get verificacionId(): string         { return this._verificacionId; }
  get deteccionId(): string | undefined { return this._deteccionId; }
  get urlArchivo(): string             { return this._urlArchivo; }
  get duracionSegundos(): number       { return this._duracionSegundos; }
  get formato(): string                { return this._formato; }
  get horaInicioClip(): string         { return this._horaInicioClip; }
  get horaFinClip(): string            { return this._horaFinClip; }
  get hashSha256(): HashSHA256         { return this._hashSha256; }
  get transcripcion(): string | undefined { return this._transcripcion; }
  get aprobado(): boolean              { return this._aprobado; }
  get aprobadoPorId(): string | undefined { return this._aprobadoPorId; }
  get fechaAprobacion(): Date | undefined { return this._fechaAprobacion; }
  get fechaExpiracion(): Date          { return this._fechaExpiracion; }
  get creadoPorId(): string | undefined { return this._creadoPorId; }
  get creadoEn(): Date                 { return this._creadoEn; }
}

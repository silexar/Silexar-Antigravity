/**
 * AccesoSeguro — Entity (Link Temporal de Entrega)
 * Representa un código + link que permite al cliente escuchar/descargar evidencias.
 */

import { CodigoAcceso } from '../value-objects/CodigoAcceso';

export type EstadoAccesoSeguroValue = 'activo' | 'usado' | 'expirado' | 'revocado';

export interface AccesoSeguroProps {
  id: string;
  tenantId: string;
  linkUuid: string;
  codigoAcceso: string;
  verificacionId?: string;
  clipEvidenciaId?: string;
  tipoLink?: 'unico' | 'basket';
  itemsJson?: Array<{
    materialNombre: string;
    spxCode?: string;
    clipUrl?: string;
    imageUrl?: string;
    esDigital?: boolean;
    horaEmision?: string;
  }>;
  materialNombre?: string;
  spxCode?: string;
  clipUrl?: string;
  imageUrl?: string;
  esDigital?: boolean;
  clienteNombre?: string;
  clienteEmail: string;
  campanaNombre?: string;
  estado: EstadoAccesoSeguroValue;
  creadoEn: Date;
  fechaExpiracion: Date;
  fechaAcceso?: Date;
  fechaDescarga?: Date;
  usosPermitidos?: number;
  usosRealizados?: number;
  accesosCount?: number;
  ipAcceso?: string;
  userAgentAcceso?: string;
  creadoPorId?: string;
  creadoPorNombre?: string;
}

export class AccesoSeguro {
  private readonly _id: string;
  private readonly _tenantId: string;
  private readonly _linkUuid: string;
  private readonly _codigoAcceso: CodigoAcceso;
  private readonly _verificacionId?: string;
  private _clipEvidenciaId?: string;
  private readonly _tipoLink: 'unico' | 'basket';
  private readonly _itemsJson?: AccesoSeguroProps['itemsJson'];
  private readonly _materialNombre?: string;
  private readonly _spxCode?: string;
  private _clipUrl?: string;
  private readonly _imageUrl?: string;
  private readonly _esDigital: boolean;
  private readonly _clienteNombre?: string;
  private readonly _clienteEmail: string;
  private readonly _campanaNombre?: string;
  private _estado: EstadoAccesoSeguroValue;
  private readonly _creadoEn: Date;
  private readonly _fechaExpiracion: Date;
  private _fechaAcceso?: Date;
  private _fechaDescarga?: Date;
  private _usosPermitidos: number;
  private _usosRealizados: number;
  private _accesosCount: number;
  private _ipAcceso?: string;
  private _userAgentAcceso?: string;
  private readonly _creadoPorId?: string;
  private readonly _creadoPorNombre?: string;

  private constructor(props: AccesoSeguroProps) {
    if (!props.id) throw new Error('ID de acceso seguro es requerido');
    if (!props.tenantId) throw new Error('Tenant ID es requerido');
    if (!props.linkUuid) throw new Error('Link UUID es requerido');
    if (!props.clienteEmail) throw new Error('Email del cliente es requerido');

    this._id = props.id;
    this._tenantId = props.tenantId;
    this._linkUuid = props.linkUuid;
    this._codigoAcceso = CodigoAcceso.crear(props.codigoAcceso);
    this._verificacionId = props.verificacionId;
    this._clipEvidenciaId = props.clipEvidenciaId;
    this._tipoLink = props.tipoLink ?? 'unico';
    this._itemsJson = props.itemsJson;
    this._materialNombre = props.materialNombre;
    this._spxCode = props.spxCode;
    this._clipUrl = props.clipUrl;
    this._imageUrl = props.imageUrl;
    this._esDigital = props.esDigital ?? false;
    this._clienteNombre = props.clienteNombre;
    this._clienteEmail = props.clienteEmail;
    this._campanaNombre = props.campanaNombre;
    this._estado = props.estado;
    this._creadoEn = props.creadoEn;
    this._fechaExpiracion = props.fechaExpiracion;
    this._fechaAcceso = props.fechaAcceso;
    this._fechaDescarga = props.fechaDescarga;
    this._usosPermitidos = props.usosPermitidos ?? 0;
    this._usosRealizados = props.usosRealizados ?? 0;
    this._accesosCount = props.accesosCount ?? 0;
    this._ipAcceso = props.ipAcceso;
    this._userAgentAcceso = props.userAgentAcceso;
    this._creadoPorId = props.creadoPorId;
    this._creadoPorNombre = props.creadoPorNombre;
  }

  static crear(props: Omit<AccesoSeguroProps, 'estado' | 'creadoEn'> & { creadoEn?: Date }): AccesoSeguro {
    return new AccesoSeguro({
      ...props,
      estado: 'activo',
      creadoEn: props.creadoEn ?? new Date(),
    });
  }

  static reconstituir(props: AccesoSeguroProps): AccesoSeguro {
    return new AccesoSeguro(props);
  }

  puedeUsarse(ahora = new Date()): boolean {
    if (this._estado === 'expirado' || this._estado === 'revocado') return false;
    if (ahora > this._fechaExpiracion) {
      this._estado = 'expirado';
      return false;
    }
    if (this._usosPermitidos > 0 && this._usosRealizados >= this._usosPermitidos) {
      return false;
    }
    return true;
  }

  registrarAcceso(tipo: 'visualizacion' | 'descarga', ip?: string, userAgent?: string, ahora = new Date()): void {
    if (!this.puedeUsarse(ahora)) {
      if (this._estado === 'expirado' || ahora > this._fechaExpiracion) {
        throw new Error('El acceso seguro ha expirado');
      }
      throw new Error('Se ha alcanzado el límite de usos permitidos para este acceso');
    }

    this._usosRealizados += 1;
    this._accesosCount += 1;
    this._fechaAcceso = ahora;
    if (tipo === 'descarga') this._fechaDescarga = ahora;
    this._ipAcceso = ip;
    this._userAgentAcceso = userAgent;
    if (this._usosPermitidos > 0 && this._usosRealizados >= this._usosPermitidos) {
      this._estado = 'usado';
    }
  }

  revocar(): void {
    this._estado = 'revocado';
  }

  asignarClip(clipEvidenciaId: string, clipUrl: string): void {
    this._clipEvidenciaId = clipEvidenciaId;
    this._clipUrl = clipUrl;
  }

  get id(): string                       { return this._id; }
  get tenantId(): string                 { return this._tenantId; }
  get linkUuid(): string                 { return this._linkUuid; }
  get codigoAcceso(): CodigoAcceso       { return this._codigoAcceso; }
  get verificacionId(): string | undefined { return this._verificacionId; }
  get clipEvidenciaId(): string | undefined { return this._clipEvidenciaId; }
  get tipoLink(): 'unico' | 'basket'     { return this._tipoLink; }
  get itemsJson(): AccesoSeguroProps['itemsJson'] | undefined { return this._itemsJson; }
  get materialNombre(): string | undefined { return this._materialNombre; }
  get spxCode(): string | undefined      { return this._spxCode; }
  get clipUrl(): string | undefined      { return this._clipUrl; }
  get imageUrl(): string | undefined     { return this._imageUrl; }
  get esDigital(): boolean               { return this._esDigital; }
  get clienteNombre(): string | undefined { return this._clienteNombre; }
  get clienteEmail(): string             { return this._clienteEmail; }
  get campanaNombre(): string | undefined { return this._campanaNombre; }
  get estado(): EstadoAccesoSeguroValue  { return this._estado; }
  get creadoEn(): Date                   { return this._creadoEn; }
  get fechaExpiracion(): Date            { return this._fechaExpiracion; }
  get fechaAcceso(): Date | undefined    { return this._fechaAcceso; }
  get fechaDescarga(): Date | undefined  { return this._fechaDescarga; }
  get usosPermitidos(): number           { return this._usosPermitidos; }
  get usosRealizados(): number           { return this._usosRealizados; }
  get accesosCount(): number             { return this._accesosCount; }
  get ipAcceso(): string | undefined     { return this._ipAcceso; }
  get userAgentAcceso(): string | undefined { return this._userAgentAcceso; }
  get creadoPorId(): string | undefined  { return this._creadoPorId; }
  get creadoPorNombre(): string | undefined { return this._creadoPorNombre; }
}

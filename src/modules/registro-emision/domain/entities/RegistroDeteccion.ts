/**
 * RegistroDeteccion — Entity (legacy support)
 * Representa una detección de emisión en el schema legacy.
 */

export interface RegistroDeteccionProps {
  id: string;
  tenantId: string;
  emisoraId: string;
  fechaHoraDeteccion: Date;
  cunaId?: string;
  spotTandaId?: string;
  metodoDeteccion: 'fingerprint' | 'manual' | 'shazam' | 'automatico' | 'speech_to_text';
  confianza: number;
  fingerprint?: string;
  duracionDetectada?: number;
  textoDetectado?: string;
  palabrasClave?: string[];
  validado?: boolean;
  validadoPorId?: string;
  fechaValidacion?: Date;
  fechaCreacion?: Date;
}

export class RegistroDeteccion {
  private readonly _id: string;
  private readonly _tenantId: string;
  private readonly _emisoraId: string;
  private readonly _fechaHoraDeteccion: Date;
  private readonly _cunaId?: string;
  private readonly _spotTandaId?: string;
  private readonly _metodoDeteccion: string;
  private readonly _confianza: number;
  private readonly _fingerprint?: string;
  private readonly _duracionDetectada?: number;
  private readonly _textoDetectado?: string;
  private readonly _palabrasClave?: string[];
  private readonly _validado: boolean;
  private readonly _validadoPorId?: string;
  private readonly _fechaValidacion?: Date;
  private readonly _fechaCreacion: Date;

  private constructor(props: RegistroDeteccionProps) {
    this._id = props.id;
    this._tenantId = props.tenantId;
    this._emisoraId = props.emisoraId;
    this._fechaHoraDeteccion = props.fechaHoraDeteccion;
    this._cunaId = props.cunaId;
    this._spotTandaId = props.spotTandaId;
    this._metodoDeteccion = props.metodoDeteccion;
    this._confianza = props.confianza;
    this._fingerprint = props.fingerprint;
    this._duracionDetectada = props.duracionDetectada;
    this._textoDetectado = props.textoDetectado;
    this._palabrasClave = props.palabrasClave;
    this._validado = props.validado ?? false;
    this._validadoPorId = props.validadoPorId;
    this._fechaValidacion = props.fechaValidacion;
    this._fechaCreacion = props.fechaCreacion ?? new Date();
  }

  static crearNueva(
    tenantId: string,
    emisoraId: string,
    metodoDeteccion: 'fingerprint' | 'manual' | 'shazam' | 'automatico' | 'speech_to_text',
    datos: {
      confianza: number;
      duracionDetectada?: number;
      fingerprint?: string;
      textoDetectado?: string;
      palabrasClave?: string[];
      cunaId?: string;
      spotTandaId?: string;
    },
  ): RegistroDeteccion {
    return new RegistroDeteccion({
      id: crypto.randomUUID(),
      tenantId,
      emisoraId,
      fechaHoraDeteccion: new Date(),
      metodoDeteccion,
      confianza: datos.confianza,
      duracionDetectada: datos.duracionDetectada,
      fingerprint: datos.fingerprint,
      textoDetectado: datos.textoDetectado,
      palabrasClave: datos.palabrasClave,
      cunaId: datos.cunaId,
      spotTandaId: datos.spotTandaId,
    });
  }

  static reconstituir(props: RegistroDeteccionProps): RegistroDeteccion {
    return new RegistroDeteccion(props);
  }

  get id(): string { return this._id; }
  get tenantId(): string { return this._tenantId; }
  get emisoraId(): string { return this._emisoraId; }
  get metodoDeteccion(): string { return this._metodoDeteccion; }
  get confianza(): number { return this._confianza; }
  get duracionDetectada(): number | undefined { return this._duracionDetectada; }
  get fingerprint(): string | undefined { return this._fingerprint; }
  get textoDetectado(): string | undefined { return this._textoDetectado; }
  get palabrasClave(): string[] | undefined { return this._palabrasClave; }
  get fechaHoraDeteccion(): Date { return this._fechaHoraDeteccion; }
  get validado(): boolean { return this._validado; }
}

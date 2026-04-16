/**
 * Campana — Aggregate Root
 * Entidad central del módulo de campañas.
 * Encapsula toda la lógica de negocio relacionada con campañas de radio.
 */

import { EstadoCampana, type EstadoCampanaValue } from '../value-objects/EstadoCampana';
import { NumeroCampana } from '../value-objects/NumeroCampana';
import { PresupuestoCampana, type PresupuestoData } from '../value-objects/PresupuestoCampana';

export type TipoCampana = 'REPARTIDO' | 'REPARTIDO_DETERMINADO' | 'PRIME' | 'PRIME_DETERMINADO' |
  'MENCION' | 'AUSPICIO' | 'NOCHE' | 'MICRO' | 'SENAL_HORARIA' | 'SENAL_TEMPERATURA' | 'CUSTOM';

export type MedioCampana = 'fm' | 'digital' | 'hibrido';

export interface CampanaProps {
  id: string;
  tenantId: string;
  numeroCampana: string;
  nombre: string;
  tipo: TipoCampana;
  medio: MedioCampana;
  estado: EstadoCampanaValue;
  anuncianteId: string;
  contratoId?: string;
  presupuesto: PresupuestoData;
  fechaInicio: Date;
  fechaFin: Date;
  descripcion?: string;
  observaciones?: string;
  creadoPor: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface CampanaDomainEvent {
  tipo: string;
  campanaId: string;
  tenantId: string;
  datos: Record<string, unknown>;
  ocurridoEn: Date;
}

export class Campana {
  private readonly _id: string;
  private readonly _tenantId: string;
  private readonly _numero: NumeroCampana;
  private _nombre: string;
  private _tipo: TipoCampana;
  private _medio: MedioCampana;
  private _estado: EstadoCampana;
  private readonly _anuncianteId: string;
  private readonly _contratoId: string | undefined;
  private _presupuesto: PresupuestoCampana;
  private _fechaInicio: Date;
  private _fechaFin: Date;
  private _descripcion: string | undefined;
  private _observaciones: string | undefined;
  private readonly _creadoPor: string;
  private readonly _creadoEn: Date;
  private _actualizadoEn: Date;
  private _eventos: CampanaDomainEvent[] = [];

  private constructor(props: CampanaProps) {
    // Validaciones de invariantes
    if (!props.id) throw new Error('ID de campaña es requerido');
    if (!props.tenantId) throw new Error('Tenant ID es requerido');
    if (!props.nombre || props.nombre.trim().length < 3) throw new Error('El nombre debe tener al menos 3 caracteres');
    if (!props.anuncianteId) throw new Error('Anunciante ID es requerido');
    if (props.fechaInicio >= props.fechaFin) throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');

    this._id = props.id;
    this._tenantId = props.tenantId;
    this._numero = NumeroCampana.crear(props.numeroCampana);
    this._nombre = props.nombre.trim();
    this._tipo = props.tipo;
    this._medio = props.medio ?? 'fm';
    this._estado = EstadoCampana.crear(props.estado);
    this._anuncianteId = props.anuncianteId;
    this._contratoId = props.contratoId;
    this._presupuesto = PresupuestoCampana.crear(props.presupuesto);
    this._fechaInicio = props.fechaInicio;
    this._fechaFin = props.fechaFin;
    this._descripcion = props.descripcion;
    this._observaciones = props.observaciones;
    this._creadoPor = props.creadoPor;
    this._creadoEn = props.creadoEn;
    this._actualizadoEn = props.actualizadoEn;
  }

  // ─── Factory ────────────────────────────────────────────────

  static crear(props: CampanaProps): Campana {
    const campana = new Campana(props);
    campana._agregarEvento('CAMPANA_CREADA', {
      nombre: props.nombre,
      tipo: props.tipo,
      medio: props.medio,
      anuncianteId: props.anuncianteId,
    });
    return campana;
  }

  static reconstituir(props: CampanaProps): Campana {
    return new Campana(props);
  }

  // ─── Commands ───────────────────────────────────────────────

  activar(activadoPor: string): void {
    if (!this._estado.puedeTransicionarA('ACTIVA')) {
      throw new Error(`No se puede activar una campaña en estado ${this._estado.valor}`);
    }
    this._estado = EstadoCampana.activa();
    this._actualizadoEn = new Date();
    this._agregarEvento('CAMPANA_ACTIVADA', { activadoPor });
  }

  pausar(motivo: string, pausadoPor: string): void {
    if (!this._estado.puedeTransicionarA('PAUSADA')) {
      throw new Error(`No se puede pausar una campaña en estado ${this._estado.valor}`);
    }
    this._estado = EstadoCampana.pausada();
    this._actualizadoEn = new Date();
    this._agregarEvento('CAMPANA_PAUSADA', { motivo, pausadoPor });
  }

  finalizar(finalizadoPor: string): void {
    if (!this._estado.puedeTransicionarA('FINALIZADA')) {
      throw new Error(`No se puede finalizar una campaña en estado ${this._estado.valor}`);
    }
    this._estado = EstadoCampana.crear('FINALIZADA');
    this._actualizadoEn = new Date();
    this._agregarEvento('CAMPANA_FINALIZADA', { finalizadoPor });
  }

  cancelar(motivo: string, canceladoPor: string): void {
    if (this._estado.estaTerminada) {
      throw new Error('No se puede cancelar una campaña ya terminada');
    }
    this._estado = EstadoCampana.crear('CANCELADA');
    this._actualizadoEn = new Date();
    this._agregarEvento('CAMPANA_CANCELADA', { motivo, canceladoPor });
  }

  actualizarNombre(nuevoNombre: string): void {
    if (!this._estado.esBorrador && !this._estado.estaPausada) {
      throw new Error('Solo se puede modificar el nombre en estado BORRADOR o PAUSADA');
    }
    if (nuevoNombre.trim().length < 3) throw new Error('El nombre debe tener al menos 3 caracteres');
    this._nombre = nuevoNombre.trim();
    this._actualizadoEn = new Date();
  }

  actualizarPresupuesto(presupuesto: PresupuestoData): void {
    if (this._estado.estaTerminada) {
      throw new Error('No se puede modificar el presupuesto de una campaña terminada');
    }
    this._presupuesto = PresupuestoCampana.crear(presupuesto);
    this._actualizadoEn = new Date();
  }

  agregarObservacion(observacion: string): void {
    this._observaciones = observacion;
    this._actualizadoEn = new Date();
  }

  // ─── Queries ────────────────────────────────────────────────

  estaVigente(): boolean {
    const ahora = new Date();
    return this._estado.estaActiva && ahora >= this._fechaInicio && ahora <= this._fechaFin;
  }

  diasRestantes(): number {
    if (this._estado.estaTerminada) return 0;
    const ahora = new Date();
    const diff = this._fechaFin.getTime() - ahora.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  estaProximaAVencer(diasUmbral = 7): boolean {
    return this.diasRestantes() <= diasUmbral && this._estado.estaActiva;
  }

  // ─── Events ─────────────────────────────────────────────────

  private _agregarEvento(tipo: string, datos: Record<string, unknown>): void {
    this._eventos.push({
      tipo,
      campanaId: this._id,
      tenantId: this._tenantId,
      datos,
      ocurridoEn: new Date(),
    });
  }

  tomarEventos(): CampanaDomainEvent[] {
    const eventos = [...this._eventos];
    this._eventos = [];
    return eventos;
  }

  // ─── Getters ────────────────────────────────────────────────

  get id(): string                     { return this._id; }
  get tenantId(): string               { return this._tenantId; }
  get numeroCampana(): NumeroCampana   { return this._numero; }
  get nombre(): string                 { return this._nombre; }
  get tipo(): TipoCampana              { return this._tipo; }
  get medio(): MedioCampana            { return this._medio; }
  get estado(): EstadoCampana          { return this._estado; }
  get anuncianteId(): string           { return this._anuncianteId; }
  get contratoId(): string | undefined { return this._contratoId; }
  get presupuesto(): PresupuestoCampana { return this._presupuesto; }
  get fechaInicio(): Date              { return this._fechaInicio; }
  get fechaFin(): Date                 { return this._fechaFin; }
  get descripcion(): string | undefined { return this._descripcion; }
  get observaciones(): string | undefined { return this._observaciones; }
  get creadoPor(): string              { return this._creadoPor; }
  get creadoEn(): Date                 { return this._creadoEn; }
  get actualizadoEn(): Date            { return this._actualizadoEn; }
}

/**
 * MotorCortex — Aggregate Root
 * Representa un motor de IA Cortex con su ciclo de vida y métricas.
 */

import { EstadoMotor, type EstadoMotorValue } from '../value-objects/EstadoMotor';
import { MetricasMotor } from '../value-objects/MetricasMotor';

export type TipoMotorCortex =
  | 'SUPREME'
  | 'ORCHESTRATOR'
  | 'PROPHET'
  | 'PROPHET_V2'
  | 'GUARDIAN'
  | 'RISK'
  | 'VOICE'
  | 'SENSE'
  | 'AUDIENCE'
  | 'CREATIVE'
  | 'SENTIMENT'
  | 'COMPLIANCE'
  | 'FLOW';

export interface MotorCortexProps {
  id: string;
  tenantId: string;
  tipo: TipoMotorCortex;
  nombre: string;
  version: string;
  estado: EstadoMotorValue;
  metricas: {
    precision: number;
    latenciaMs: number;
    solicitudesTotal: number;
    solicitudesExitosas: number;
    ultimaEjecucion?: Date;
  };
  configuracion: Record<string, unknown>;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface MotorCortexEvent {
  tipo: string;
  motorId: string;
  tenantId: string;
  datos: Record<string, unknown>;
  ocurridoEn: Date;
}

export class MotorCortex {
  private readonly _id: string;
  private readonly _tenantId: string;
  private readonly _tipo: TipoMotorCortex;
  private _nombre: string;
  private readonly _version: string;
  private _estado: EstadoMotor;
  private _metricas: MetricasMotor;
  private _configuracion: Record<string, unknown>;
  private readonly _creadoEn: Date;
  private _actualizadoEn: Date;
  private _eventos: MotorCortexEvent[] = [];

  private constructor(props: MotorCortexProps) {
    if (!props.id) throw new Error('ID del motor es requerido');
    if (!props.tenantId) throw new Error('Tenant ID es requerido');
    if (!props.nombre) throw new Error('Nombre del motor es requerido');

    this._id = props.id;
    this._tenantId = props.tenantId;
    this._tipo = props.tipo;
    this._nombre = props.nombre;
    this._version = props.version;
    this._estado = EstadoMotor.crear(props.estado);
    this._metricas = MetricasMotor.crear(props.metricas);
    this._configuracion = { ...props.configuracion };
    this._creadoEn = props.creadoEn;
    this._actualizadoEn = props.actualizadoEn;
  }

  static crear(props: MotorCortexProps): MotorCortex {
    const motor = new MotorCortex(props);
    motor._agregarEvento('MOTOR_CREADO', { tipo: props.tipo, version: props.version });
    return motor;
  }

  static reconstituir(props: MotorCortexProps): MotorCortex {
    return new MotorCortex(props);
  }

  // ─── Commands ───────────────────────────────────────────────

  activar(): void {
    if (!this._estado.puedeTransicionarA('ACTIVO')) {
      throw new Error(`No se puede activar el motor en estado ${this._estado.valor}`);
    }
    this._estado = EstadoMotor.activo();
    this._actualizadoEn = new Date();
    this._agregarEvento('MOTOR_ACTIVADO', {});
  }

  detener(motivo: string): void {
    if (!this._estado.puedeTransicionarA('DETENIDO')) {
      throw new Error(`No se puede detener el motor en estado ${this._estado.valor}`);
    }
    this._estado = EstadoMotor.detenido();
    this._actualizadoEn = new Date();
    this._agregarEvento('MOTOR_DETENIDO', { motivo });
  }

  marcarDegradado(razon: string): void {
    if (!this._estado.puedeTransicionarA('DEGRADADO')) {
      throw new Error(`No se puede degradar el motor en estado ${this._estado.valor}`);
    }
    this._estado = EstadoMotor.crear('DEGRADADO');
    this._actualizadoEn = new Date();
    this._agregarEvento('MOTOR_DEGRADADO', { razon });
  }

  marcarError(error: string): void {
    this._estado = EstadoMotor.crear('ERROR');
    this._actualizadoEn = new Date();
    this._agregarEvento('MOTOR_ERROR', { error });
  }

  registrarEjecucion(exitosa: boolean, latenciaMs: number): void {
    this._metricas = this._metricas.registrarEjecucion(exitosa, latenciaMs);
    this._actualizadoEn = new Date();
    if (!exitosa) {
      this._agregarEvento('EJECUCION_FALLIDA', { latenciaMs });
    }
  }

  actualizarConfiguracion(config: Record<string, unknown>): void {
    if (!this._estado.estaOperacional) {
      throw new Error('No se puede configurar un motor no operacional');
    }
    this._configuracion = { ...config };
    this._actualizadoEn = new Date();
    this._agregarEvento('CONFIGURACION_ACTUALIZADA', {});
  }

  // ─── Events ─────────────────────────────────────────────────

  private _agregarEvento(tipo: string, datos: Record<string, unknown>): void {
    this._eventos.push({
      tipo,
      motorId: this._id,
      tenantId: this._tenantId,
      datos,
      ocurridoEn: new Date(),
    });
  }

  tomarEventos(): MotorCortexEvent[] {
    const eventos = [...this._eventos];
    this._eventos = [];
    return eventos;
  }

  // ─── Getters ────────────────────────────────────────────────

  get id(): string                        { return this._id; }
  get tenantId(): string                  { return this._tenantId; }
  get tipo(): TipoMotorCortex             { return this._tipo; }
  get nombre(): string                    { return this._nombre; }
  get version(): string                   { return this._version; }
  get estado(): EstadoMotor              { return this._estado; }
  get metricas(): MetricasMotor          { return this._metricas; }
  get configuracion(): Record<string, unknown> { return { ...this._configuracion }; }
  get creadoEn(): Date                   { return this._creadoEn; }
  get actualizadoEn(): Date              { return this._actualizadoEn; }
}

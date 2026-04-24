/**
 * VerificacionEmision — Aggregate Root
 * Orquesta la búsqueda de materiales en registros de aire.
 */

import { EstadoVerificacion, type EstadoVerificacionValue } from '../value-objects/EstadoVerificacion';
import { RangoHorario } from '../value-objects/RangoHorario';

export type TipoMaterialVerificacion = 'audio_pregrabado' | 'mencion_vivo' | 'presentacion' | 'cierre';

export interface VerificacionEmisionProps {
  id: string;
  tenantId: string;
  anuncianteId?: string;
  campanaId?: string;
  contratoId?: string;
  ejecutivoId?: string;
  fechaBusqueda: Date;
  horaInicio: string;
  horaFin: string;
  emisorasIds?: string[];
  registrosAireIds?: string[];
  materialesIds?: string[];
  tiposMaterial?: TipoMaterialVerificacion[];
  toleranciaMinutos?: number;
  sensibilidadPorcentaje?: number;
  estado: EstadoVerificacionValue;
  progresoPorcentaje?: number;
  totalMaterialesBuscados?: number;
  materialesEncontrados?: number;
  materialesNoEncontrados?: number;
  accuracyPromedio?: number;
  tiempoProcesamientoMs?: number;
  fechaInicioProceso?: Date;
  fechaFinProceso?: Date;
  resultadosDetalle?: Record<string, unknown>[];
  creadoPorId?: string;
  creadoEn: Date;
  actualizadoEn?: Date;
}

export interface VerificacionEmisionDomainEvent {
  tipo: string;
  verificacionId: string;
  tenantId: string;
  datos: Record<string, unknown>;
  ocurridoEn: Date;
}

export class VerificacionEmision {
  private readonly _id: string;
  private readonly _tenantId: string;
  private readonly _anuncianteId?: string;
  private readonly _campanaId?: string;
  private readonly _contratoId?: string;
  private readonly _ejecutivoId?: string;
  private readonly _fechaBusqueda: Date;
  private readonly _rangoHorario: RangoHorario;
  private readonly _emisorasIds: string[];
  private _registrosAireIds: string[];
  private readonly _materialesIds: string[];
  private readonly _tiposMaterial: TipoMaterialVerificacion[];
  private readonly _toleranciaMinutos: number;
  private readonly _sensibilidadPorcentaje: number;
  private _estado: EstadoVerificacion;
  private _progresoPorcentaje: number;
  private _totalMaterialesBuscados: number;
  private _materialesEncontrados: number;
  private _materialesNoEncontrados: number;
  private _accuracyPromedio: number;
  private _tiempoProcesamientoMs?: number;
  private _fechaInicioProceso?: Date;
  private _fechaFinProceso?: Date;
  private _resultadosDetalle: Record<string, unknown>[];
  private readonly _creadoPorId?: string;
  private readonly _creadoEn: Date;
  private _actualizadoEn: Date;
  private _eventos: VerificacionEmisionDomainEvent[] = [];

  private constructor(props: VerificacionEmisionProps) {
    if (!props.id) throw new Error('ID de verificación es requerido');
    if (!props.tenantId) throw new Error('Tenant ID es requerido');

    this._id = props.id;
    this._tenantId = props.tenantId;
    this._anuncianteId = props.anuncianteId;
    this._campanaId = props.campanaId;
    this._contratoId = props.contratoId;
    this._ejecutivoId = props.ejecutivoId;
    this._fechaBusqueda = props.fechaBusqueda;
    this._rangoHorario = RangoHorario.crear({ inicio: props.horaInicio, fin: props.horaFin });
    this._emisorasIds = props.emisorasIds ?? [];
    this._registrosAireIds = props.registrosAireIds ?? [];
    this._materialesIds = props.materialesIds ?? [];
    this._tiposMaterial = props.tiposMaterial ?? [];
    this._toleranciaMinutos = props.toleranciaMinutos ?? 10;
    this._sensibilidadPorcentaje = props.sensibilidadPorcentaje ?? 95;
    this._estado = EstadoVerificacion.crear(props.estado);
    this._progresoPorcentaje = props.progresoPorcentaje ?? 0;
    this._totalMaterialesBuscados = props.totalMaterialesBuscados ?? 0;
    this._materialesEncontrados = props.materialesEncontrados ?? 0;
    this._materialesNoEncontrados = props.materialesNoEncontrados ?? 0;
    this._accuracyPromedio = props.accuracyPromedio ?? 0;
    this._tiempoProcesamientoMs = props.tiempoProcesamientoMs;
    this._fechaInicioProceso = props.fechaInicioProceso;
    this._fechaFinProceso = props.fechaFinProceso;
    this._resultadosDetalle = props.resultadosDetalle ?? [];
    this._creadoPorId = props.creadoPorId;
    this._creadoEn = props.creadoEn;
    this._actualizadoEn = props.actualizadoEn ?? props.creadoEn;
  }

  static crear(props: Omit<VerificacionEmisionProps, 'estado' | 'creadoEn' | 'actualizadoEn'> & { creadoEn?: Date }): VerificacionEmision {
    const v = new VerificacionEmision({
      ...props,
      estado: 'pendiente',
      creadoEn: props.creadoEn ?? new Date(),
    });
    v._agregarEvento('VERIFICACION_CREADA', {
      campanaId: props.campanaId,
      fechaBusqueda: props.fechaBusqueda,
      emisorasIds: props.emisorasIds,
    });
    return v;
  }

  static reconstituir(props: VerificacionEmisionProps): VerificacionEmision {
    return new VerificacionEmision(props);
  }

  iniciarProceso(): void {
    if (!this._estado.puedeTransicionarA('en_proceso')) {
      throw new Error(`No se puede iniciar proceso en estado ${this._estado.valor}`);
    }
    this._estado = EstadoVerificacion.enProceso();
    this._fechaInicioProceso = new Date();
    this._actualizadoEn = new Date();
    this._agregarEvento('VERIFICACION_INICIADA', {});
  }

  actualizarProgreso(porcentaje: number, encontrados: number, noEncontrados: number): void {
    if (!this._estado.esEnProceso) {
      throw new Error(`No se puede actualizar progreso en estado ${this._estado.valor}`);
    }
    this._progresoPorcentaje = Math.min(100, Math.max(0, porcentaje));
    this._materialesEncontrados = encontrados;
    this._materialesNoEncontrados = noEncontrados;
    this._actualizadoEn = new Date();
  }

  completar(accuracyPromedio: number, resultados: Record<string, unknown>[], tiempoMs: number): void {
    if (!this._estado.puedeTransicionarA('completada')) {
      throw new Error(`No se puede completar en estado ${this._estado.valor}`);
    }
    this._estado = EstadoVerificacion.completada();
    this._progresoPorcentaje = 100;
    this._accuracyPromedio = accuracyPromedio;
    this._resultadosDetalle = resultados;
    this._tiempoProcesamientoMs = tiempoMs;
    this._fechaFinProceso = new Date();
    this._actualizadoEn = new Date();
    this._agregarEvento('VERIFICACION_COMPLETADA', { accuracyPromedio, tiempoMs });
  }

  marcarParcial(accuracyPromedio: number, resultados: Record<string, unknown>[], tiempoMs: number): void {
    if (!this._estado.puedeTransicionarA('parcial')) {
      throw new Error(`No se puede marcar como parcial en estado ${this._estado.valor}`);
    }
    this._estado = EstadoVerificacion.parcial();
    this._accuracyPromedio = accuracyPromedio;
    this._resultadosDetalle = resultados;
    this._tiempoProcesamientoMs = tiempoMs;
    this._fechaFinProceso = new Date();
    this._actualizadoEn = new Date();
    this._agregarEvento('VERIFICACION_PARCIAL', { accuracyPromedio, tiempoMs });
  }

  marcarFallida(motivo: string): void {
    if (!this._estado.puedeTransicionarA('fallida')) {
      throw new Error(`No se puede marcar como fallida en estado ${this._estado.valor}`);
    }
    this._estado = EstadoVerificacion.fallida();
    this._fechaFinProceso = new Date();
    this._actualizadoEn = new Date();
    this._agregarEvento('VERIFICACION_FALLIDA', { motivo });
  }

  asignarRegistrosAire(registrosAireIds: string[]): void {
    this._registrosAireIds = [...registrosAireIds];
    this._actualizadoEn = new Date();
  }

  private _agregarEvento(tipo: string, datos: Record<string, unknown>): void {
    this._eventos.push({
      tipo,
      verificacionId: this._id,
      tenantId: this._tenantId,
      datos,
      ocurridoEn: new Date(),
    });
  }

  tomarEventos(): VerificacionEmisionDomainEvent[] {
    const eventos = [...this._eventos];
    this._eventos = [];
    return eventos;
  }

  get id(): string                       { return this._id; }
  get tenantId(): string                 { return this._tenantId; }
  get anuncianteId(): string | undefined { return this._anuncianteId; }
  get campanaId(): string | undefined    { return this._campanaId; }
  get contratoId(): string | undefined   { return this._contratoId; }
  get ejecutivoId(): string | undefined  { return this._ejecutivoId; }
  get fechaBusqueda(): Date              { return this._fechaBusqueda; }
  get rangoHorario(): RangoHorario       { return this._rangoHorario; }
  get emisorasIds(): string[]            { return [...this._emisorasIds]; }
  get registrosAireIds(): string[]       { return [...this._registrosAireIds]; }
  get materialesIds(): string[]          { return [...this._materialesIds]; }
  get tiposMaterial(): TipoMaterialVerificacion[] { return [...this._tiposMaterial]; }
  get toleranciaMinutos(): number        { return this._toleranciaMinutos; }
  get sensibilidadPorcentaje(): number   { return this._sensibilidadPorcentaje; }
  get estado(): EstadoVerificacion       { return this._estado; }
  get progresoPorcentaje(): number       { return this._progresoPorcentaje; }
  get totalMaterialesBuscados(): number  { return this._totalMaterialesBuscados; }
  get materialesEncontrados(): number    { return this._materialesEncontrados; }
  get materialesNoEncontrados(): number  { return this._materialesNoEncontrados; }
  get accuracyPromedio(): number         { return this._accuracyPromedio; }
  get tiempoProcesamientoMs(): number | undefined { return this._tiempoProcesamientoMs; }
  get fechaInicioProceso(): Date | undefined { return this._fechaInicioProceso; }
  get fechaFinProceso(): Date | undefined { return this._fechaFinProceso; }
  get resultadosDetalle(): Record<string, unknown>[] { return [...this._resultadosDetalle]; }
  get creadoPorId(): string | undefined  { return this._creadoPorId; }
  get creadoEn(): Date                   { return this._creadoEn; }
  get actualizadoEn(): Date              { return this._actualizadoEn; }
}

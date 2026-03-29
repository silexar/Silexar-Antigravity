/**
 * ENTIDAD EXPANSION OPPORTUNITY - TIER 0 ENTERPRISE
 *
 * @description Oportunidad de crecimiento dentro de cuenta existente.
 * Cross-sell, upsell, nueva división, renovación con uplift.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

import { ExpansionType } from '../value-objects/ExpansionType';

export enum EstadoExpansion {
  IDENTIFICADA = 'IDENTIFICADA',
  CALIFICADA = 'CALIFICADA',
  PROPUESTA_ENVIADA = 'PROPUESTA_ENVIADA',
  NEGOCIACION = 'NEGOCIACION',
  GANADA = 'GANADA',
  PERDIDA = 'PERDIDA',
  DESCARTADA = 'DESCARTADA',
}

export interface ActividadExpansion {
  fecha: Date;
  tipo: string;
  descripcion: string;
  responsableId: string;
}

export interface ExpansionOpportunityProps {
  id: string;
  cuentaId: string;
  cuentaNombre: string;
  kamId: string;
  tipo: ExpansionType;
  titulo: string;
  descripcion: string;
  valorPotencial: number;
  moneda: string;
  probabilidad: number; // 0-100
  estado: EstadoExpansion;
  fuenteDeteccion: 'IA' | 'MANUAL' | 'ANALYTICS';
  fechaDeteccion: Date;
  fechaCierreEstimada?: Date;
  actividades: ActividadExpansion[];
  competidorRelacionado?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class ExpansionOpportunity {
  private constructor(private props: ExpansionOpportunityProps) {
    this.validate();
  }

  public static create(
    props: Omit<ExpansionOpportunityProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'estado' | 'actividades'>
  ): ExpansionOpportunity {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();

    return new ExpansionOpportunity({
      ...props,
      id,
      estado: EstadoExpansion.IDENTIFICADA,
      actividades: [],
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {},
    });
  }

  public static fromPersistence(props: ExpansionOpportunityProps): ExpansionOpportunity {
    return new ExpansionOpportunity(props);
  }

  private validate(): void {
    if (!this.props.cuentaId) throw new Error('CuentaId es requerido');
    if (!this.props.kamId) throw new Error('KamId es requerido');
    if (this.props.valorPotencial < 0) throw new Error('Valor potencial no puede ser negativo');
    if (this.props.probabilidad < 0 || this.props.probabilidad > 100) throw new Error('Probabilidad debe ser 0-100');
  }

  // Getters
  get id(): string { return this.props.id; }
  get cuentaId(): string { return this.props.cuentaId; }
  get titulo(): string { return this.props.titulo; }
  get estado(): EstadoExpansion { return this.props.estado; }
  get valorPotencial(): number { return this.props.valorPotencial; }
  get probabilidad(): number { return this.props.probabilidad; }
  get tipo(): ExpansionType { return this.props.tipo; }

  get weightedValue(): number {
    return Math.round(this.props.valorPotencial * (this.props.probabilidad / 100));
  }

  get esActiva(): boolean {
    return ![EstadoExpansion.GANADA, EstadoExpansion.PERDIDA, EstadoExpansion.DESCARTADA].includes(this.props.estado);
  }

  // Business Logic
  public avanzarEstado(): void {
    const flujo: EstadoExpansion[] = [
      EstadoExpansion.IDENTIFICADA,
      EstadoExpansion.CALIFICADA,
      EstadoExpansion.PROPUESTA_ENVIADA,
      EstadoExpansion.NEGOCIACION,
      EstadoExpansion.GANADA,
    ];

    const idxActual = flujo.indexOf(this.props.estado);
    if (idxActual === -1 || idxActual >= flujo.length - 1) {
      throw new Error('No se puede avanzar desde el estado actual');
    }

    this.props.estado = flujo[idxActual + 1];
    this.props.fechaActualizacion = new Date();
  }

  public marcarPerdida(): void {
    this.props.estado = EstadoExpansion.PERDIDA;
    this.props.fechaActualizacion = new Date();
  }

  public registrarActividad(actividad: ActividadExpansion): void {
    this.props.actividades.push(actividad);
    this.props.fechaActualizacion = new Date();
  }

  public actualizarProbabilidad(nueva: number): void {
    if (nueva < 0 || nueva > 100) throw new Error('Probabilidad debe ser 0-100');
    this.props.probabilidad = nueva;
    this.props.fechaActualizacion = new Date();
  }

  public calcularWeightedValue(): number {
    return this.weightedValue;
  }

  public toSnapshot(): ExpansionOpportunityProps {
    return { ...this.props };
  }
}

/**
 * ENTIDAD META EQUIPO - TIER 0 ENTERPRISE
 *
 * @description Define las metas comerciales asignar a un equipo para un periodo específico.
 * Permite seguimiento de progreso y desglose (mensual, trimestral, anual).
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export type PeriodoMeta = 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

export interface MetaEquipoProps {
  id: string;
  equipoId: string;
  periodo: PeriodoMeta;
  fechaInicio: Date;
  fechaFin: Date;
  montoObjetivo: number;
  montoLogrado: number;
  moneda: string;
  estado: 'BORRADOR' | 'ACTIVA' | 'CERRADA' | 'CANCELADA';
  metricasAdicionales: Record<string, number>; // EJ: Leads, Calls, Demos
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class MetaEquipo {
  private constructor(private props: MetaEquipoProps) {
    this.validate();
  }

  public static create(
    props: Omit<MetaEquipoProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'montoLogrado' | 'estado'>
  ): MetaEquipo {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new MetaEquipo({
      ...props,
      id,
      montoLogrado: 0,
      estado: 'BORRADOR',
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metricasAdicionales: props.metricasAdicionales || {}
    });
  }

  public static fromPersistence(props: MetaEquipoProps): MetaEquipo {
    return new MetaEquipo(props);
  }

  private validate(): void {
    if (this.props.fechaInicio >= this.props.fechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    if (this.props.montoObjetivo < 0) {
      throw new Error('El monto objetivo no puede ser negativo');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get equipoId(): string { return this.props.equipoId; }
  get porcentajeCumplimiento(): number {
    if (this.props.montoObjetivo === 0) return 0;
    return (this.props.montoLogrado / this.props.montoObjetivo) * 100;
  }
  get estado(): string { return this.props.estado; }

  // Business Logic
  public activar(): void {
    if (this.props.estado !== 'BORRADOR') throw new Error('Solo se pueden activar metas en borrador');
    this.props.estado = 'ACTIVA';
    this.props.fechaActualizacion = new Date();
  }

  public registrarAvance(monto: number): void {
    if (this.props.estado !== 'ACTIVA') throw new Error('La meta no está activa');
    this.props.montoLogrado += monto;
    this.props.fechaActualizacion = new Date();
  }

  public ajustarObjetivo(nuevoObjetivo: number): void {
    if (this.props.estado === 'CERRADA') throw new Error('No se puede modificar una meta cerrada');
    this.props.montoObjetivo = nuevoObjetivo;
    this.props.fechaActualizacion = new Date();
  }

  public cerrar(): void {
    this.props.estado = 'CERRADA';
    this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): MetaEquipoProps {
    return { ...this.props };
  }
}

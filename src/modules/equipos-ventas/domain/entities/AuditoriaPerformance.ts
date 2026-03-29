/**
 * ENTIDAD AUDITORÍA PERFORMANCE - TIER 0 ENTERPRISE
 *
 * @description Registro inmutable de cambios en métricas críticas de performance.
 * Asegura la integridad de los datos para cálculo de comisiones (compliance).
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface AuditoriaPerformanceProps {
  id: string;
  entidadId: string; // ID del Vendedor o Equipo
  tipoEntidad: 'VENDEDOR' | 'EQUIPO';
  metricaAfectada: string;
  valorAnterior: string | number;
  valorNuevo: string | number;
  motivoCambio: string;
  responsableId: string; // Usuario que realizó el cambio
  sistemaOrigen: string; // 'CRM', 'ERP', 'MANUAL_ADJUSTMENT'
  ipAddress?: string;
  fechaEvento: Date;
}

export class AuditoriaPerformance {
  private constructor(private props: AuditoriaPerformanceProps) {
    this.validate();
  }

  public static create(
    props: Omit<AuditoriaPerformanceProps, 'id' | 'fechaEvento'>
  ): AuditoriaPerformance {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();

    return new AuditoriaPerformance({
      ...props,
      id,
      fechaEvento: new Date(),
    });
  }

  public static fromPersistence(props: AuditoriaPerformanceProps): AuditoriaPerformance {
    return new AuditoriaPerformance(props);
  }

  private validate(): void {
    if (!this.props.entidadId) throw new Error('ID de entidad requerido');
    if (!this.props.metricaAfectada) throw new Error('Métrica afectada requerida');
    if (!this.props.responsableId) throw new Error('Responsable requerido');
  }

  // Auditoria es inmutable por definición, no tiene métodos de modificación
  // Solo getters

  get id(): string { return this.props.id; }
  get detallesCambio(): string {
      return `Cambio en ${this.props.metricaAfectada}: ${JSON.stringify(this.props.valorAnterior)} -> ${JSON.stringify(this.props.valorNuevo)} por ${this.props.responsableId}`;
  }

  public toSnapshot(): AuditoriaPerformanceProps {
    return { ...this.props };
  }
}

/**
 * ENTIDAD PERFORMANCE METRICS - TIER 0 ENTERPRISE
 * 
 * @description Métricas de rendimiento detalladas por representante o equipo.
 * Soporta cálculo de KPIs financieros y de actividad.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { CicloPerformance } from '../value-objects/CicloPerformance';

export interface PerformanceMetricsProps {
  id: string;
  entidadId: string; // ID de Vendedor o Equipo
  tipoEntidad: 'VENDEDOR' | 'EQUIPO';
  ciclo: CicloPerformance; // MENSUAL, TRIMESTRAL, ANUAL
  periodo: string; // "2025-05", "2025-Q2", "2025"
  
  // Financiero
  quotaAsignada: number;
  revenueActual: number;
  forecastCommit: number;
  forecastBestCase: number;
  pipelineTotal: number;
  pipelineQualified: number;
  
  // Actividad
  llamadasRealizadas: number;
  reunionesAgendadas: number;
  demosRealizadas: number;
  propuestasEnviadas: number;
  whatsAppEnviados: number;
  
  // Ratios
  conversionRate: number; // % (Reunión -> Cierre)
  avgDealSize: number;
  salesCycleDays: number;
  
  // Inventario
  inventarioVendidoSegundos: number; // Nuevo KPI premium
  inventarioPrimeTimeVendido: number;
  
  fechaCalculo: Date;
  metadata: Record<string, unknown>;
}

export class PerformanceMetrics {
  private constructor(private props: PerformanceMetricsProps) {
    this.validate();
  }

  public static create(props: Omit<PerformanceMetricsProps, 'id' | 'fechaCalculo'>): PerformanceMetrics {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    
    return new PerformanceMetrics({
      ...props,
      id,
      fechaCalculo: new Date(),
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: PerformanceMetricsProps): PerformanceMetrics {
    return new PerformanceMetrics(props);
  }

  private validate(): void {
    if (this.props.quotaAsignada < 0) throw new Error('Quota negativa no permitida');
  }

  // Getters
  get id(): string { return this.props.id; }
  get attainment(): number { 
    return this.props.quotaAsignada > 0 
      ? (this.props.revenueActual / this.props.quotaAsignada) * 100 
      : 0; 
  }
  
  get gapToQuota(): number {
    return Math.max(0, this.props.quotaAsignada - this.props.revenueActual);
  }

  get pipelineCoverage(): number {
    const gap = this.gapToQuota;
    return gap > 0 
      ? this.props.pipelineQualified / gap 
      : 0;
  }

  // Métodos de Dominio
  public registrarVenta(monto: number, segundosInventario: number, esPrimeTime: boolean): void {
    this.props.revenueActual += monto;
    this.props.inventarioVendidoSegundos += segundosInventario;
    if (esPrimeTime) this.props.inventarioPrimeTimeVendido += segundosInventario;
    this.props.fechaCalculo = new Date();
  }

  public registrarActividad(tipo: 'LLAMADA' | 'REUNION' | 'DEMO' | 'PROPUESTA' | 'WHATSAPP'): void {
    switch (tipo) {
      case 'LLAMADA': this.props.llamadasRealizadas++; break;
      case 'REUNION': this.props.reunionesAgendadas++; break;
      case 'DEMO': this.props.demosRealizadas++; break;
      case 'PROPUESTA': this.props.propuestasEnviadas++; break;
      case 'WHATSAPP': this.props.whatsAppEnviados++; break;
    }
    this.props.fechaCalculo = new Date();
  }

  public actualizarForecast(commit: number, bestCase: number): void {
    this.props.forecastCommit = commit;
    this.props.forecastBestCase = bestCase;
    this.props.fechaCalculo = new Date();
  }

  public toSnapshot(): PerformanceMetricsProps {
    return { ...this.props };
  }
}

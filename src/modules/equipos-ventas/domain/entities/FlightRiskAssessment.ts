/**
 * ENTIDAD FLIGHT RISK ASSESSMENT - TIER 0 ENTERPRISE
 *
 * @description Predicción de riesgo de fuga de talento.
 * Analiza factores de compensación, engagement, performance y mercado.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

import { RiskLevel } from '../value-objects/RiskLevel';

export interface FactorRiesgo {
  categoria: 'COMPENSACION' | 'ENGAGEMENT' | 'PERFORMANCE' | 'MERCADO' | 'CRECIMIENTO' | 'LIDERAZGO';
  nombre: string;
  score: number; // 0-100 (100 = mayor riesgo)
  peso: number;
  detalle: string;
}

export interface AccionRetencion {
  id: string;
  tipo: 'COMPENSACION' | 'DESARROLLO' | 'RECONOCIMIENTO' | 'FLEXIBILIDAD' | 'PROMOCION';
  descripcion: string;
  responsableId: string;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'RECHAZADA';
  fechaAsignacion: Date;
  fechaCompletada?: Date;
  impactoEsperado: string;
}

export interface FlightRiskAssessmentProps {
  id: string;
  vendedorId: string;
  vendedorNombre: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  factores: FactorRiesgo[];
  tendencia: 'INCREASING' | 'STABLE' | 'DECREASING';
  retentionActions: AccionRetencion[];
  impactoSiSale: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  arrEnRiesgo: number;
  accountsEnRiesgo: number;
  ultimoCalculo: Date;
  fechaCreacion: Date;
  metadata: Record<string, unknown>;
}

export class FlightRiskAssessment {
  private constructor(private props: FlightRiskAssessmentProps) {
    this.validate();
  }

  public static create(
    props: Omit<FlightRiskAssessmentProps, 'id' | 'fechaCreacion' | 'ultimoCalculo' | 'riskScore' | 'riskLevel' | 'tendencia'>
  ): FlightRiskAssessment {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();

    const instance = new FlightRiskAssessment({
      ...props,
      id,
      riskScore: 0,
      riskLevel: RiskLevel.LOW,
      tendencia: 'STABLE',
      ultimoCalculo: fecha,
      fechaCreacion: fecha,
      metadata: props.metadata || {},
    });

    instance.recalcularRiesgo();
    return instance;
  }

  public static fromPersistence(props: FlightRiskAssessmentProps): FlightRiskAssessment {
    return new FlightRiskAssessment(props);
  }

  private validate(): void {
    if (!this.props.vendedorId) throw new Error('VendedorId es requerido');
    if (this.props.factores.length === 0) throw new Error('Debe tener al menos un factor de riesgo');
  }

  // Getters
  get id(): string { return this.props.id; }
  get vendedorId(): string { return this.props.vendedorId; }
  get vendedorNombre(): string { return this.props.vendedorNombre; }
  get riskScore(): number { return this.props.riskScore; }
  get riskLevel(): RiskLevel { return this.props.riskLevel; }
  get tendencia(): string { return this.props.tendencia; }
  get arrEnRiesgo(): number { return this.props.arrEnRiesgo; }

  get esAlertaCritica(): boolean {
    return this.props.riskLevel === RiskLevel.CRITICAL ||
      (this.props.riskLevel === RiskLevel.HIGH && this.props.impactoSiSale === 'CRITICAL');
  }

  get accionesCompletadas(): number {
    return this.props.retentionActions.filter(a => a.estado === 'COMPLETADA').length;
  }

  get accionesPendientes(): number {
    return this.props.retentionActions.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_PROGRESO').length;
  }

  // Business Logic
  public recalcularRiesgo(): void {
    const totalPeso = this.props.factores.reduce((sum, f) => sum + f.peso, 0);
    if (totalPeso === 0) return;

    this.props.riskScore = Math.round(
      this.props.factores.reduce((sum, f) => sum + (f.score * f.peso), 0) / totalPeso
    );

    if (this.props.riskScore >= 80) this.props.riskLevel = RiskLevel.CRITICAL;
    else if (this.props.riskScore >= 60) this.props.riskLevel = RiskLevel.HIGH;
    else if (this.props.riskScore >= 40) this.props.riskLevel = RiskLevel.MEDIUM;
    else this.props.riskLevel = RiskLevel.LOW;

    this.props.ultimoCalculo = new Date();
  }

  public registrarAccionRetencion(accion: Omit<AccionRetencion, 'id' | 'estado' | 'fechaAsignacion'>): void {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'act-' + Date.now();
    this.props.retentionActions.push({
      ...accion,
      id,
      estado: 'PENDIENTE',
      fechaAsignacion: new Date(),
    });
  }

  public completarAccionRetencion(accionId: string): void {
    const accion = this.props.retentionActions.find(a => a.id === accionId);
    if (!accion) throw new Error('Acción de retención no encontrada');
    accion.estado = 'COMPLETADA';
    accion.fechaCompletada = new Date();
  }

  public actualizarFactor(categoria: FactorRiesgo['categoria'], nuevoScore: number): void {
    if (nuevoScore < 0 || nuevoScore > 100) throw new Error('Score debe ser 0-100');
    const factor = this.props.factores.find(f => f.categoria === categoria);
    if (!factor) throw new Error(`Factor ${categoria} no encontrado`);
    factor.score = nuevoScore;
    this.recalcularRiesgo();
  }

  public toSnapshot(): FlightRiskAssessmentProps {
    return { ...this.props };
  }
}

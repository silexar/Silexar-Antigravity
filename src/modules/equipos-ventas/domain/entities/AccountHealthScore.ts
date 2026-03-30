/**
 * ENTIDAD ACCOUNT HEALTH SCORE - TIER 0 ENTERPRISE
 *
 * @description Tracking de salud de relación con cuenta clave.
 * Multidimensional: engagement, satisfaction, growth, advocacy.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

import { RiskLevel, RISK_THRESHOLDS } from '../value-objects/RiskLevel';

export interface DimensionHealth {
  nombre: 'ENGAGEMENT' | 'SATISFACTION' | 'GROWTH' | 'ADVOCACY';
  score: number; // 0-100
  peso: number;  // Weight en cálculo total
  tendencia: 'UP' | 'STABLE' | 'DOWN';
}

export interface AlertaHealth {
  id: string;
  tipo: 'RISK' | 'OPPORTUNITY' | 'ACTION_REQUIRED';
  mensaje: string;
  prioridad: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fecha: Date;
  resuelta: boolean;
}

export interface AccountHealthScoreProps {
  id: string;
  cuentaId: string;
  cuentaNombre: string;
  kamId: string;
  scoreGeneral: number;
  dimensiones: DimensionHealth[];
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  riskLevel: RiskLevel;
  alertas: AlertaHealth[];
  ultimaInteraccion: Date;
  proximaAccionRequerida?: string;
  fechaCalculo: Date;
  metadata: Record<string, unknown>;
}

export class AccountHealthScore {
  private constructor(private props: AccountHealthScoreProps) {
    this.validate();
  }

  public static create(
    props: Omit<AccountHealthScoreProps, 'id' | 'fechaCalculo' | 'scoreGeneral' | 'trend' | 'riskLevel'>
  ): AccountHealthScore {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();

    const instance = new AccountHealthScore({
      ...props,
      id,
      scoreGeneral: 0,
      trend: 'STABLE',
      riskLevel: RiskLevel.LOW,
      fechaCalculo: new Date(),
      metadata: props.metadata || {},
    });

    instance.recalcular();
    return instance;
  }

  public static fromPersistence(props: AccountHealthScoreProps): AccountHealthScore {
    return new AccountHealthScore(props);
  }

  private validate(): void {
    if (!this.props.cuentaId) throw new Error('CuentaId es requerido');
    if (!this.props.kamId) throw new Error('KamId es requerido');
    if (this.props.dimensiones.length === 0) throw new Error('Debe tener al menos una dimensión');
  }

  // Getters
  get id(): string { return this.props.id; }
  get cuentaId(): string { return this.props.cuentaId; }
  get cuentaNombre(): string { return this.props.cuentaNombre; }
  get scoreGeneral(): number { return this.props.scoreGeneral; }
  get trend(): string { return this.props.trend; }
  get riskLevel(): RiskLevel { return this.props.riskLevel; }
  get alertasActivas(): AlertaHealth[] { return this.props.alertas.filter(a => !a.resuelta); }

  get esEnRiesgo(): boolean {
    return this.props.riskLevel === RiskLevel.HIGH || this.props.riskLevel === RiskLevel.CRITICAL;
  }

  // Business Logic
  public recalcular(): void {
    const totalPeso = this.props.dimensiones.reduce((sum, d) => sum + d.peso, 0);
    if (totalPeso === 0) return;

    this.props.scoreGeneral = Math.round(
      this.props.dimensiones.reduce((sum, d) => sum + (d.score * d.peso), 0) / totalPeso
    );

    this.props.riskLevel = this.detectarRiesgo();
    this.props.fechaCalculo = new Date();
  }

  private detectarRiesgo(): RiskLevel {
    const score = this.props.scoreGeneral;
    if (score >= RISK_THRESHOLDS.LOW) return RiskLevel.LOW;
    if (score >= RISK_THRESHOLDS.MEDIUM) return RiskLevel.MEDIUM;
    if (score >= RISK_THRESHOLDS.HIGH) return RiskLevel.HIGH;
    return RiskLevel.CRITICAL;
  }

  public actualizarDimension(nombre: DimensionHealth['nombre'], nuevoScore: number): void {
    if (nuevoScore < 0 || nuevoScore > 100) throw new Error('Score debe ser 0-100');
    const dim = this.props.dimensiones.find(d => d.nombre === nombre);
    if (!dim) throw new Error(`Dimensión ${nombre} no encontrada`);

    const anterior = dim.score;
    dim.score = nuevoScore;
    dim.tendencia = nuevoScore > anterior ? 'UP' : nuevoScore < anterior ? 'DOWN' : 'STABLE';

    this.recalcular();
    this.actualizarTrend();
  }

  public registrarInteraccion(fecha?: Date): void {
    this.props.ultimaInteraccion = fecha || new Date();
  }

  public agregarAlerta(alerta: Omit<AlertaHealth, 'id' | 'fecha' | 'resuelta'>): void {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'alert-' + Date.now();
    this.props.alertas.push({ ...alerta, id, fecha: new Date(), resuelta: false });
  }

  public resolverAlerta(alertaId: string): void {
    const alerta = this.props.alertas.find(a => a.id === alertaId);
    if (!alerta) throw new Error('Alerta no encontrada');
    alerta.resuelta = true;
  }

  private actualizarTrend(): void {
    const improving = this.props.dimensiones.filter(d => d.tendencia === 'UP').length;
    const declining = this.props.dimensiones.filter(d => d.tendencia === 'DOWN').length;

    if (improving > declining) this.props.trend = 'IMPROVING';
    else if (declining > improving) this.props.trend = 'DECLINING';
    else this.props.trend = 'STABLE';
  }

  public toSnapshot(): AccountHealthScoreProps {
    return { ...this.props };
  }
}

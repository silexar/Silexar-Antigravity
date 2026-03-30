/**
 * ENTIDAD ACCOUNT PLAN - TIER 0 ENTERPRISE
 *
 * @description Plan estratégico para cuentas clave con objetivos,
 * iniciativas, KPIs y estrategia competitiva.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

export interface ObjetivoAccount {
  id: string;
  descripcion: string;
  tipo: 'REVENUE' | 'EXPANSION' | 'RETENTION' | 'RELATIONSHIP';
  valorTarget?: number;
  valorActual: number;
  completado: boolean;
  fechaLimite: Date;
}

export interface IniciativaAccount {
  id: string;
  titulo: string;
  descripcion: string;
  responsableId: string;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'BLOQUEADA';
  fechaInicio: Date;
  fechaFin?: Date;
  impactoEsperado: string;
}

export interface KPIAccount {
  nombre: string;
  valorActual: number;
  valorTarget: number;
  unidad: string;
  tendencia: 'UP' | 'STABLE' | 'DOWN';
}

export enum EstadoAccountPlan {
  BORRADOR = 'BORRADOR',
  ACTIVO = 'ACTIVO',
  EN_REVISION = 'EN_REVISION',
  COMPLETADO = 'COMPLETADO',
  ARCHIVADO = 'ARCHIVADO',
}

export interface AccountPlanProps {
  id: string;
  cuentaId: string;
  cuentaNombre: string;
  kamId: string;
  periodo: string; // "2025-Q1", "2025-H1", "2025"
  objetivos: ObjetivoAccount[];
  iniciativas: IniciativaAccount[];
  kpis: KPIAccount[];
  competitiveStrategy: string;
  expansionTargets: string[];
  estado: EstadoAccountPlan;
  progreso: number; // 0-100
  fechaCreacion: Date;
  fechaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class AccountPlan {
  private constructor(private props: AccountPlanProps) {
    this.validate();
  }

  public static create(
    props: Omit<AccountPlanProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'estado' | 'progreso'>
  ): AccountPlan {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();

    return new AccountPlan({
      ...props,
      id,
      estado: EstadoAccountPlan.BORRADOR,
      progreso: 0,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {},
    });
  }

  public static fromPersistence(props: AccountPlanProps): AccountPlan {
    return new AccountPlan(props);
  }

  private validate(): void {
    if (!this.props.cuentaId) throw new Error('CuentaId es requerido');
    if (!this.props.kamId) throw new Error('KamId es requerido');
    if (!this.props.periodo) throw new Error('Periodo es requerido');
  }

  // Getters
  get id(): string { return this.props.id; }
  get cuentaId(): string { return this.props.cuentaId; }
  get estado(): EstadoAccountPlan { return this.props.estado; }
  get progreso(): number { return this.props.progreso; }
  get objetivos(): ObjetivoAccount[] { return [...this.props.objetivos]; }
  get iniciativas(): IniciativaAccount[] { return [...this.props.iniciativas]; }
  get kpis(): KPIAccount[] { return [...this.props.kpis]; }

  // Business Logic
  public agregarObjetivo(objetivo: Omit<ObjetivoAccount, 'id' | 'completado' | 'valorActual'>): void {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'obj-' + Date.now();
    this.props.objetivos.push({ ...objetivo, id, completado: false, valorActual: 0 });
    this.props.fechaActualizacion = new Date();
  }

  public completarIniciativa(iniciativaId: string): void {
    const iniciativa = this.props.iniciativas.find(i => i.id === iniciativaId);
    if (!iniciativa) throw new Error('Iniciativa no encontrada');
    iniciativa.estado = 'COMPLETADA';
    iniciativa.fechaFin = new Date();
    this.recalcularProgreso();
    this.props.fechaActualizacion = new Date();
  }

  public activar(): void {
    if (this.props.objetivos.length === 0) throw new Error('Plan debe tener al menos un objetivo');
    this.props.estado = EstadoAccountPlan.ACTIVO;
    this.props.fechaActualizacion = new Date();
  }

  public agregarIniciativa(iniciativa: Omit<IniciativaAccount, 'id' | 'estado'>): void {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ini-' + Date.now();
    this.props.iniciativas.push({ ...iniciativa, id, estado: 'PENDIENTE' });
    this.props.fechaActualizacion = new Date();
  }

  public actualizarKPI(nombre: string, nuevoValor: number): void {
    const kpi = this.props.kpis.find(k => k.nombre === nombre);
    if (!kpi) throw new Error(`KPI ${nombre} no encontrado`);
    const anterior = kpi.valorActual;
    kpi.valorActual = nuevoValor;
    kpi.tendencia = nuevoValor > anterior ? 'UP' : nuevoValor < anterior ? 'DOWN' : 'STABLE';
    this.props.fechaActualizacion = new Date();
  }

  private recalcularProgreso(): void {
    const totalItems = this.props.objetivos.length + this.props.iniciativas.length;
    if (totalItems === 0) { this.props.progreso = 0; return; }

    const completados = this.props.objetivos.filter(o => o.completado).length +
      this.props.iniciativas.filter(i => i.estado === 'COMPLETADA').length;

    this.props.progreso = Math.round((completados / totalItems) * 100);

    if (this.props.progreso === 100) {
      this.props.estado = EstadoAccountPlan.COMPLETADO;
    }
  }

  public toSnapshot(): AccountPlanProps {
    return { ...this.props };
  }
}

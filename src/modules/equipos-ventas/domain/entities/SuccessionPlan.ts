/**
 * ENTIDAD SUCCESSION PLAN - TIER 0 ENTERPRISE
 *
 * @description Plan de sucesión para roles críticos.
 * Identifica candidatos, readiness scores, gaps y timeline.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

export interface CandidatoSucesion {
  vendedorId: string;
  nombreCompleto: string;
  rolActual: string;
  readinessScore: number; // 0-100
  gaps: string[];
  timelineEstimado: string; // "6 meses", "12 meses", etc.
  planDesarrolloId?: string;
  esInterno: boolean;
}

export enum PrioridadSucesion {
  CRITICA = 'CRITICA',
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAJA = 'BAJA',
}

export enum EstadoSucesion {
  ACTIVO = 'ACTIVO',
  EN_TRANSICION = 'EN_TRANSICION',
  COMPLETADO = 'COMPLETADO',
  ARCHIVADO = 'ARCHIVADO',
}

export interface SuccessionPlanProps {
  id: string;
  rolCritico: string;
  departamento: string;
  titularActualId: string;
  titularNombre: string;
  candidatos: CandidatoSucesion[];
  prioridad: PrioridadSucesion;
  estado: EstadoSucesion;
  razon: string; // "Jubilación", "Promoción", "Flight Risk", etc.
  fechaEstimadaTransicion?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class SuccessionPlan {
  private constructor(private props: SuccessionPlanProps) {
    this.validate();
  }

  public static create(
    props: Omit<SuccessionPlanProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'estado'>
  ): SuccessionPlan {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();

    return new SuccessionPlan({
      ...props,
      id,
      estado: EstadoSucesion.ACTIVO,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {},
    });
  }

  public static fromPersistence(props: SuccessionPlanProps): SuccessionPlan {
    return new SuccessionPlan(props);
  }

  private validate(): void {
    if (!this.props.rolCritico) throw new Error('Rol crítico es requerido');
    if (!this.props.titularActualId) throw new Error('Titular actual es requerido');
  }

  // Getters
  get id(): string { return this.props.id; }
  get rolCritico(): string { return this.props.rolCritico; }
  get estado(): EstadoSucesion { return this.props.estado; }
  get prioridad(): PrioridadSucesion { return this.props.prioridad; }
  get candidatos(): CandidatoSucesion[] { return [...this.props.candidatos]; }

  get mejorCandidato(): CandidatoSucesion | null {
    if (this.props.candidatos.length === 0) return null;
    return [...this.props.candidatos].sort((a, b) => b.readinessScore - a.readinessScore)[0];
  }

  get tieneCandidatoListo(): boolean {
    return this.props.candidatos.some(c => c.readinessScore >= 80);
  }

  // Business Logic
  public agregarCandidato(candidato: CandidatoSucesion): void {
    const yaExiste = this.props.candidatos.some(c => c.vendedorId === candidato.vendedorId);
    if (yaExiste) throw new Error('Candidato ya existe en el plan');
    this.props.candidatos.push(candidato);
    this.props.fechaActualizacion = new Date();
  }

  public actualizarReadiness(vendedorId: string, nuevoScore: number): void {
    if (nuevoScore < 0 || nuevoScore > 100) throw new Error('Readiness score debe ser 0-100');
    const candidato = this.props.candidatos.find(c => c.vendedorId === vendedorId);
    if (!candidato) throw new Error('Candidato no encontrado');
    candidato.readinessScore = nuevoScore;
    this.props.fechaActualizacion = new Date();
  }

  public ejecutarTransicion(candidatoId: string): void {
    const candidato = this.props.candidatos.find(c => c.vendedorId === candidatoId);
    if (!candidato) throw new Error('Candidato no encontrado');
    if (candidato.readinessScore < 60) throw new Error('Candidato no tiene readiness suficiente (min 60%)');

    this.props.estado = EstadoSucesion.EN_TRANSICION;
    this.props.fechaActualizacion = new Date();
  }

  public completar(): void {
    this.props.estado = EstadoSucesion.COMPLETADO;
    this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): SuccessionPlanProps {
    return { ...this.props };
  }
}

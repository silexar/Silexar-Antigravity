/**
 * ENTIDAD COACHING PLAN - TIER 0 ENTERPRISE
 * 
 * @description Planes de desarrollo y mejora de rendimiento generados por IA
 * o asignados por managers. Gestión de skills y trainings.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */


export enum TipoCoaching {
  MEJORA_PERFORMANCE = 'MEJORA_PERFORMANCE', // Por bajo rendimiento
  DESARROLLO_HABILIDADES = 'DESARROLLO_HABILIDADES', // Skill específico
  PREPARACION_ASCENSO = 'PREPARACION_ASCENSO', // High potential
  ONBOARDING = 'ONBOARDING' // Nuevos ingresos
}

export enum EstadoCoaching {
  BORRADOR = 'BORRADOR',
  ACTIVO = 'ACTIVO',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO', // Escalación a PIP
  CANCELADO = 'CANCELADO'
}

export interface ActividadCoaching {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'ROLE_PLAY' | 'TRAINING' | 'SHADOWING' | 'LECTURA' | 'MENTORING';
  fechaLimite: Date;
  completada: boolean;
  resultado?: string;
  feedbackManager?: string;
}

export interface CoachingPlanProps {
  id: string;
  vendedorId: string;
  managerId: string;
  tipo: TipoCoaching;
  motivoPrincipal: string; // "Baja conversión en cierre", "Nuevo producto"
  kpiObjetivo: string; // "Aumentar Win Rate a 25%"
  fechaInicio: Date;
  fechaFin: Date;
  actividades: ActividadCoaching[];
  estado: EstadoCoaching;
  progreso: number; // 0-100
  generadoPorIA: boolean;
  metadata: Record<string, unknown>;
}

export class CoachingPlan {
  private constructor(private props: CoachingPlanProps) {
    this.validate();
  }

  public static create(props: Omit<CoachingPlanProps, 'id' | 'estado' | 'progreso'>): CoachingPlan {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    
    return new CoachingPlan({
      ...props,
      id,
      estado: EstadoCoaching.ACTIVO,
      progreso: 0,
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: CoachingPlanProps): CoachingPlan {
    return new CoachingPlan(props);
  }

  private validate(): void {
    if (this.props.actividades.length === 0) throw new Error('Plan debe tener actividades');
    if (this.props.fechaInicio > this.props.fechaFin) throw new Error('Fechas inválidas');
  }

  // Getters
  get id(): string { return this.props.id; }
  get estado(): EstadoCoaching { return this.props.estado; }
  get esVencido(): boolean { return new Date() > this.props.fechaFin && this.props.estado === EstadoCoaching.ACTIVO; }

  // Métodos de Dominio
  public completarActividad(actividadId: string, resultado: string): void {
    const actividad = this.props.actividades.find(a => a.id === actividadId);
    if (!actividad) throw new Error('Actividad no encontrada');
    
    actividad.completada = true;
    actividad.resultado = resultado;
    this.recalcularProgreso();
  }

  public agregarFeedback(actividadId: string, feedback: string): void {
    const actividad = this.props.actividades.find(a => a.id === actividadId);
    if (!actividad) throw new Error('Actividad no encontrada');
    actividad.feedbackManager = feedback;
  }

  private recalcularProgreso(): void {
    const total = this.props.actividades.length;
    const completadas = this.props.actividades.filter(a => a.completada).length;
    this.props.progreso = Math.round((completadas / total) * 100);
    
    if (this.props.progreso === 100) {
      this.props.estado = EstadoCoaching.COMPLETADO;
    }
  }

  public marcarFallido(): void {
    this.props.estado = EstadoCoaching.FALLIDO;
    // Disparar evento EscalacionPIP
  }

  public toSnapshot(): CoachingPlanProps {
    return { ...this.props };
  }
}

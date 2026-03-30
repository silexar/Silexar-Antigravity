/**
 * ENTIDAD SKILL MATRIX - TIER 0 ENTERPRISE
 *
 * @description Matriz de evaluación de competencias por vendedor.
 * Gap analysis, priorización de desarrollo y recomendaciones IA.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

export interface Competencia {
  nombre: string;
  categoria: 'CORE_SELLING' | 'TECHNICAL' | 'INDUSTRY' | 'LEADERSHIP' | 'DIGITAL' | 'INTERPERSONAL';
  nivelActual: number; // 1-10
  nivelTarget: number; // 1-10
  prioridad: 'HIGH' | 'MEDIUM' | 'LOW';
  ultimaEvaluacion?: Date;
}

export interface CertificacionSkill {
  nombre: string;
  emisor: string;
  estado: 'REQUERIDA' | 'EN_PROGRESO' | 'COMPLETADA' | 'EXPIRADA';
  fechaObtencion?: Date;
  fechaExpiracion?: Date;
}

export interface SkillMatrixProps {
  id: string;
  vendedorId: string;
  vendedorNombre: string;
  competencias: Competencia[];
  certifications: CertificacionSkill[];
  gapScoreTotal: number; // Score agregado de gaps
  lastAssessmentDate: Date;
  nextAssessmentDate?: Date;
  developmentPlanId?: string;
  recomendacionesIA: string[];
  fechaCreacion: Date;
  fechaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class SkillMatrix {
  private constructor(private props: SkillMatrixProps) {
    this.validate();
  }

  public static create(
    props: Omit<SkillMatrixProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'gapScoreTotal'>
  ): SkillMatrix {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();

    const instance = new SkillMatrix({
      ...props,
      id,
      gapScoreTotal: 0,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {},
    });

    instance.calcularGapScore();
    return instance;
  }

  public static fromPersistence(props: SkillMatrixProps): SkillMatrix {
    return new SkillMatrix(props);
  }

  private validate(): void {
    if (!this.props.vendedorId) throw new Error('VendedorId es requerido');
    if (this.props.competencias.length === 0) throw new Error('Debe tener al menos una competencia');
  }

  // Getters
  get id(): string { return this.props.id; }
  get vendedorId(): string { return this.props.vendedorId; }
  get gapScoreTotal(): number { return this.props.gapScoreTotal; }
  get competencias(): Competencia[] { return [...this.props.competencias]; }
  get certifications(): CertificacionSkill[] { return [...this.props.certifications]; }

  get competenciasMastered(): Competencia[] {
    return this.props.competencias.filter(c => c.nivelActual >= c.nivelTarget);
  }

  get competenciasConGap(): Competencia[] {
    return this.props.competencias.filter(c => c.nivelActual < c.nivelTarget)
      .sort((a, b) => {
        const prioridadOrden = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      });
  }

  get certificacionesPendientes(): CertificacionSkill[] {
    return this.props.certifications.filter(c => c.estado === 'REQUERIDA' || c.estado === 'EN_PROGRESO');
  }

  // Business Logic
  public evaluarCompetencia(nombre: string, nuevoNivel: number): void {
    if (nuevoNivel < 1 || nuevoNivel > 10) throw new Error('Nivel debe ser 1-10');
    const comp = this.props.competencias.find(c => c.nombre === nombre);
    if (!comp) throw new Error(`Competencia ${nombre} no encontrada`);

    comp.nivelActual = nuevoNivel;
    comp.ultimaEvaluacion = new Date();
    this.calcularGapScore();
    this.props.fechaActualizacion = new Date();
  }

  public calcularGapScore(): void {
    const total = this.props.competencias.length;
    if (total === 0) { this.props.gapScoreTotal = 0; return; }

    const gapSum = this.props.competencias.reduce((sum, c) => {
      return sum + Math.max(0, c.nivelTarget - c.nivelActual);
    }, 0);

    const maxGap = total * 10; // Peor caso: 10 puntos de gap por competencia
    this.props.gapScoreTotal = Math.round((1 - gapSum / maxGap) * 100);
  }

  public generarRecomendaciones(): string[] {
    const recomendaciones: string[] = [];
    const gaps = this.competenciasConGap;

    if (gaps.length === 0) {
      recomendaciones.push('Todas las competencias cumplen el target - considerar roles de mentoring');
      this.props.recomendacionesIA = recomendaciones;
      return recomendaciones;
    }

    const highPriority = gaps.filter(g => g.prioridad === 'HIGH');
    if (highPriority.length > 0) {
      recomendaciones.push(`Priorizar: ${highPriority.map(g => g.nombre).join(', ')}`);
    }

    const certsPendientes = this.certificacionesPendientes;
    if (certsPendientes.length > 0) {
      recomendaciones.push(`Certificaciones pendientes: ${certsPendientes.map(c => c.nombre).join(', ')}`);
    }

    const bigGaps = gaps.filter(g => (g.nivelTarget - g.nivelActual) >= 3);
    if (bigGaps.length > 0) {
      recomendaciones.push(`Gaps significativos (3+): ${bigGaps.map(g => `${g.nombre} (${g.nivelActual}/${g.nivelTarget})`).join(', ')}`);
    }

    this.props.recomendacionesIA = recomendaciones;
    return recomendaciones;
  }

  public agregarCompetencia(comp: Competencia): void {
    const yaExiste = this.props.competencias.some(c => c.nombre === comp.nombre);
    if (yaExiste) throw new Error(`Competencia ${comp.nombre} ya existe`);
    this.props.competencias.push(comp);
    this.calcularGapScore();
    this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): SkillMatrixProps {
    return { ...this.props };
  }
}

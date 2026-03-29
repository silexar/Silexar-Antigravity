/**
 * DOMAIN ENTITY: ANALISIS CAPACIDAD
 * 
 * @description Modela el análisis de capacidad de un equipo de ventas,
 * permitiendo optimizar el headcount y la distribución de carga.
 */

export interface AnalisisCapacidadProps {
  id: string;
  equipoId: string;
  periodo: string; // Ej: '2025-Q1'
  headcountActual: number;
  headcountRequerido: number;
  capacidadPromedioPorVendedor: number; // Monto o Leads
  gapCapacidad: number;
  recomendacion: string;
  fechaAnalisis: Date;
  metadata?: Record<string, unknown>;
}

export class AnalisisCapacidad {
  private constructor(private props: AnalisisCapacidadProps) {
    this.validate();
  }

  public static create(
    props: Omit<AnalisisCapacidadProps, "id" | "fechaAnalisis">
  ): AnalisisCapacidad {
    const id = crypto.randomUUID();
    return new AnalisisCapacidad({
      ...props,
      id,
      fechaAnalisis: new Date(),
    });
  }

  public static fromPersistence(props: AnalisisCapacidadProps): AnalisisCapacidad {
    return new AnalisisCapacidad(props);
  }

  private validate(): void {
    if (this.props.headcountActual < 0) {
      throw new Error("El headcount actual no puede ser negativo");
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get equipoId(): string { return this.props.equipoId; }
  get gap(): number { return this.props.gapCapacidad; }
  get recomendacion(): string { return this.props.recomendacion; }

  public actualizarRecomendacion(nuevaRecomendacion: string): void {
      this.props.recomendacion = nuevaRecomendacion;
      this.props.fechaAnalisis = new Date();
  }

  public toSnapshot(): AnalisisCapacidadProps {
    return { ...this.props };
  }
}

/**
 * ENTIDAD PLAN COMPENSACIÓN - TIER 0 ENTERPRISE
 *
 * @description Define las reglas de compensación, comisiones y bonos para vendedores.
 * Soporta estructuras complejas de aceleradores y gatillos (triggers).
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface TramoComision {
  minimo: number;
  maximo: number | null; // null = infinito
  porcentaje: number;
}

export interface PlanCompensacionProps {
  id: string;
  nombre: string;
  descripcion?: string;
  rolObjetivo: string; // Ej: 'SENIOR_AE', 'SDR'
  sueldoBase: number;
  moneda: string;
  tramosComision: TramoComision[];
  aceleradores: Record<string, number>; // Ej: {'120%': 1.5}
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class PlanCompensacion {
  private constructor(private props: PlanCompensacionProps) {
    this.validate();
  }

  public static create(
    props: Omit<PlanCompensacionProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'activo'>
  ): PlanCompensacion {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new PlanCompensacion({
      ...props,
      id,
      activo: true,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      tramosComision: props.tramosComision || [],
      aceleradores: props.aceleradores || {},
    });
  }

  public static fromPersistence(props: PlanCompensacionProps): PlanCompensacion {
    return new PlanCompensacion(props);
  }

  private validate(): void {
    if (!this.props.nombre) throw new Error('Nombre del plan requerido');
    if (this.props.sueldoBase < 0) throw new Error('Sueldo base no puede ser negativo');
  }

  // Business Logic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public calcularComision(montoVenta: number, _porcentajeCumplimientoTotal: number): number {
    // Lógica simplificada de ejemplo - TIER 0 requeriría motor de reglas más complejo
    let comision = 0;
    
    // Buscar tramo
    // Esto es muy básico, normalmente sería sobre el acumulado o por deal
    const tramo = this.props.tramosComision.find(t => 
      montoVenta >= t.minimo && (t.maximo === null || montoVenta <= t.maximo)
    );

    if (tramo) {
      comision = montoVenta * (tramo.porcentaje / 100);
    }

    // Aplicar aceleradores si corresponde
    // Ej: si cumplimiento > 100%, multiplicar por 1.2
    // TO-DO: Implementar lógica robusta de aceleradores
    
    return comision;
  }

  public agregarTramo(tramo: TramoComision): void {
    this.props.tramosComision.push(tramo);
    this.props.tramosComision.sort((a, b) => a.minimo - b.minimo);
    this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): PlanCompensacionProps {
    return { ...this.props };
  }
}

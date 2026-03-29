/**
 * ENTIDAD INCENTIVO CAMPAIGN - TIER 0 ENTERPRISE
 *
 * @description Modela campañas de incentivos (SPIFFs), concursos flash y gamificación temporal.
 * Define reglas de calificación y recompensas.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface IncentivoCampaignProps {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'FLASH_CONTEST' | 'QUARTERLY_BONUS' | 'PRODUCT_LAUNCH' | 'SPIFF';
  fechaInicio: Date;
  fechaFin: Date;
  reglasCalificacion: Record<string, unknown>; // Ej: { productoId: 'XYZ', cantidadMinima: 10 }
  recompensa: {
    tipo: 'DINERO' | 'PUNTOS' | 'EXPERIENCIA' | 'REGALO';
    valor: number;
    descripcion?: string;
  };
  participantesElegibles: string[]; // IDs de vendedores o roles elegibles
  presupuestoAsignado: number;
  presupuestoConsumido: number;
  activo: boolean; // Si la campaña está vigente y visible
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class IncentivoCampaign {
  private constructor(private props: IncentivoCampaignProps) {
    this.validate();
  }

  public static create(
    props: Omit<IncentivoCampaignProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'activo' | 'presupuestoConsumido'>
  ): IncentivoCampaign {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new IncentivoCampaign({
      ...props,
      id,
      activo: true,
      presupuestoConsumido: 0,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
    });
  }

  public static fromPersistence(props: IncentivoCampaignProps): IncentivoCampaign {
    return new IncentivoCampaign(props);
  }

  private validate(): void {
    if (this.props.fechaInicio >= this.props.fechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    if (this.props.presupuestoAsignado < 0) {
      throw new Error('El presupuesto no puede ser negativo');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get activo(): boolean {
      const hoy = new Date();
      return this.props.activo && hoy >= this.props.fechaInicio && hoy <= this.props.fechaFin;
  }

  // Business Logic
  public registrarPago(monto: number): void {
      if (this.props.presupuestoConsumido + monto > this.props.presupuestoAsignado) {
          throw new Error('Presupuesto de campaña excedido');
      }
      this.props.presupuestoConsumido += monto;
      this.props.fechaActualizacion = new Date();
  }

  public extenderDuracion(nuevaFechaFin: Date): void {
      if (nuevaFechaFin <= this.props.fechaInicio) {
          throw new Error('La nueva fecha fin debe ser posterior al inicio');
      }
      this.props.fechaFin = nuevaFechaFin;
      this.props.fechaActualizacion = new Date();
  }
  
  public cancelar(): void {
      this.props.activo = false;
      this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): IncentivoCampaignProps {
    return { ...this.props };
  }
}

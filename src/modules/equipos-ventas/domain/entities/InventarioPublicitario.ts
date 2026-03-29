/**
 * ENTIDAD INVENTARIO PUBLICITARIO - TIER 0 ENTERPRISE
 * 
 * @description Representa el snapshot en tiempo real de la disponibilidad de
 * espacios publicitarios. Crítico para evitar sobreventa y conflictos.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { TipoFranjaHoraria } from '../value-objects/TipoFranjaHoraria';

export interface InventarioPublicitarioProps {
  id: string;
  medio: 'RADIO' | 'TV' | 'DIGITAL';
  fecha: Date; // Día específico
  bloqueHorario: string; // "08:00-09:00"
  tipoFranja: TipoFranjaHoraria;
  programaId?: string;
  capacidadTotalSegundos: number; // Ej: 3600s en una hora (menos contenido) -> 600s de tandas
  segundosVendidos: number;
  segundosReservados: number; // En proceso de cierre
  segundosBloqueados: number; // Mantenimiento, promos internas
  precioBaseSegundo: number;
  factorDemanda: number; // Multiplicador dinámico (1.0 - 5.0)
  estado: 'DISPONIBLE' | 'CRITICO' | 'AGOTADO';
  fechaUltimaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class InventarioPublicitario {
  private constructor(private props: InventarioPublicitarioProps) {
    this.validate();
    this.actualizarEstado();
  }

  public static create(props: Omit<InventarioPublicitarioProps, 'id' | 'fechaUltimaActualizacion' | 'estado'>): InventarioPublicitario {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date(); // Using Date() constructor
    
    return new InventarioPublicitario({
      ...props,
      id,
      estado: 'DISPONIBLE', // Se recalcula en el constructor
      fechaUltimaActualizacion: fecha,
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: InventarioPublicitarioProps): InventarioPublicitario {
    return new InventarioPublicitario(props);
  }

  private validate(): void {
    if (this.props.capacidadTotalSegundos <= 0) throw new Error('Capacidad inválida');
    if (this.props.segundosVendidos < 0) throw new Error('Ventas negativas no permitidas');
    if (this.props.precioBaseSegundo <= 0) throw new Error('Precio base inválido');
  }

  // Getters
  get id(): string { return this.props.id; }
  get disponibilidadReal(): number { 
    return this.props.capacidadTotalSegundos - 
           (this.props.segundosVendidos + this.props.segundosReservados + this.props.segundosBloqueados); 
  }
  get porcentajeOcupacion(): number {
    return ((this.props.capacidadTotalSegundos - this.disponibilidadReal) / this.props.capacidadTotalSegundos) * 100;
  }
  get precioActual(): number {
    return this.props.precioBaseSegundo * this.props.factorDemanda;
  }
  get estado(): string { return this.props.estado; }

  // Métodos de Dominio
  public reservarEspacio(segundos: number): void {
    if (segundos <= 0) throw new Error('Cantidad inválida');
    if (this.disponibilidadReal < segundos) throw new Error('Inventario insuficiente');
    
    this.props.segundosReservados += segundos;
    this.actualizarEstado();
    this.recalcularFactorDemanda();
    this.props.fechaUltimaActualizacion = new Date();
  }

  public confirmarVenta(segundos: number): void {
    // Mueve de reservado a vendido
    if (this.props.segundosReservados < segundos) {
       // Si no estaba reservado, verificamos disponibilidad directa
       if (this.disponibilidadReal < segundos) throw new Error('Inventario insuficiente para confirmar venta directa');
    } else {
       this.props.segundosReservados -= segundos;
    }
    
    this.props.segundosVendidos += segundos;
    this.actualizarEstado();
    this.recalcularFactorDemanda();
    this.props.fechaUltimaActualizacion = new Date();
  }

  public liberarReserva(segundos: number): void {
    if (this.props.segundosReservados < segundos) throw new Error('No hay suficientes reservas para liberar');
    this.props.segundosReservados -= segundos;
    this.actualizarEstado();
    this.recalcularFactorDemanda();
    this.props.fechaUltimaActualizacion = new Date();
  }

  private actualizarEstado(): void {
    const ocupacion = this.porcentajeOcupacion;
    if (ocupacion >= 100) this.props.estado = 'AGOTADO';
    else if (ocupacion >= 85) this.props.estado = 'CRITICO';
    else this.props.estado = 'DISPONIBLE';
  }

  private recalcularFactorDemanda(): void {
    // Algoritmo simple de pricing dinámico basado en escasez
    const ocupacion = this.porcentajeOcupacion;
    if (ocupacion >= 95) this.props.factorDemanda = 3.0; // 300% precio si queda <5%
    else if (ocupacion >= 85) this.props.factorDemanda = 2.0; // 200% precio
    else if (ocupacion >= 70) this.props.factorDemanda = 1.5; // 150% precio
    else if (ocupacion >= 50) this.props.factorDemanda = 1.2; // 120% precio
    else this.props.factorDemanda = 1.0; // Precio base
  }

  public toSnapshot(): InventarioPublicitarioProps {
    return { ...this.props };
  }
}

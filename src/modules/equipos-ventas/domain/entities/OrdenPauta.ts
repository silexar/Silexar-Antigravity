/**
 * ENTIDAD ORDEN PAUTA - TIER 0 ENTERPRISE
 * 
 * @description Representa la orden de emisión generada desde ventas hacia programación.
 * Actúa como contrato de servicio interno entre áreas.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { EstadoOrdenPauta } from '../value-objects/EstadoOrdenPauta';
import { TipoFranjaHoraria } from '../value-objects/TipoFranjaHoraria';

export interface OrdenPautaItem {
  id: string; // SKU temporal o ID de spot
  tipoMaterial: string; // 'AUDIO', 'VIDEO', 'BANNER'
  duracionSegundos: number;
  frecuencia: number; // Spots por día
  diasEmision: number[]; // [1, 3, 5] = Lun, Mie, Vie
  franjaHoraria: TipoFranjaHoraria;
  bloquePreferido?: string; // "08:00-09:00"
}

export interface OrdenPautaProps {
  id: string;
  numeroOrden: string; // OP-2025-001
  contratoId: string;
  propuestaId?: string;
  vendedorId: string;
  anuncianteId: string;
  fechaInicio: Date;
  fechaFin: Date;
  items: OrdenPautaItem[];
  estado: EstadoOrdenPauta;
  prioridad: 'NORMAL' | 'ALTA' | 'URGENTE';
  observacionesProgramacion?: string;
  conflictosDetectados: string[]; // ["Inventario agotado Lun 08:00"]
  fechaCreacion: Date;
  fechaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class OrdenPauta {
  private constructor(private props: OrdenPautaProps) {
    this.validate();
  }

  public static create(props: Omit<OrdenPautaProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'estado' | 'conflictosDetectados'>): OrdenPauta {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();
    
    return new OrdenPauta({
      ...props,
      id,
      estado: EstadoOrdenPauta.VENDIDO, // Estado inicial
      conflictosDetectados: [],
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: OrdenPautaProps): OrdenPauta {
    return new OrdenPauta(props);
  }

  private validate(): void {
    if (this.props.items.length === 0) throw new Error('Orden debe tener al menos un item');
    if (this.props.fechaInicio > this.props.fechaFin) throw new Error('Rango de fechas inválido');
  }

  // Getters
  get id(): string { return this.props.id; }
  get estado(): EstadoOrdenPauta { return this.props.estado; }
  get conflictos(): string[] { return [...this.props.conflictosDetectados]; }
  get esCritica(): boolean { return this.props.prioridad === 'URGENTE'; }

  // Métodos de Dominio
  public marcarEnCola(): void {
    if (this.props.estado === EstadoOrdenPauta.VENDIDO) {
      this.props.estado = EstadoOrdenPauta.EN_COLA;
      this.props.fechaActualizacion = new Date();
    }
  }

  public reportarConflicto(motivo: string): void {
    this.props.conflictosDetectados.push(motivo);
    this.props.estado = EstadoOrdenPauta.CONFLICTO;
    this.props.fechaActualizacion = new Date();
    // Debería disparar evento AlertarVendedor
  }

  public resolverConflicto(): void {
    this.props.conflictosDetectados = [];
    this.props.estado = EstadoOrdenPauta.EN_COLA; // Vuelve a cola
    this.props.fechaActualizacion = new Date();
  }

  public programar(): void {
    if (this.props.conflictosDetectados.length > 0) throw new Error('No se puede programar con conflictos pendientes');
    this.props.estado = EstadoOrdenPauta.PROGRAMADO;
    this.props.fechaActualizacion = new Date();
  }

  public emitir(): void {
    if (this.props.estado === EstadoOrdenPauta.PROGRAMADO) {
        this.props.estado = EstadoOrdenPauta.AL_AIRE; // O EMITIDO si ya finalizó
        this.props.fechaActualizacion = new Date();
    }
  }
  
  public finalizarEmision(): void {
      this.props.estado = EstadoOrdenPauta.EMITIDO;
      this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): OrdenPautaProps {
    return { ...this.props };
  }
}

/**
 * ENTIDAD TERRITORIO VENTA - TIER 0 ENTERPRISE
 *
 * @description Define un territorio geográfico o lógico de ventas.
 * Puede ser asignado a equipos o vendedores individuales.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface TerritorioVentaProps {
  id: string;
  codigo: string;
  nombre: string;
  geoJson?: string; // Definición geográfica opcional
  tipo: 'GEOGRAFICO' | 'INDUSTRIA' | 'CUENTA_NOMBRADA' | 'CANAL';
  padreId?: string | null;
  asignadoAId?: string | null; // ID de Equipo o Vendedor
  tipoAsignacion?: 'EQUIPO' | 'VENDEDOR' | null;
  activo: boolean;
  potencialMercado: number; // Valor estimado del territorio
  moneda: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class TerritorioVenta {
  private constructor(private props: TerritorioVentaProps) {
    this.validate();
  }

  public static create(
    props: Omit<TerritorioVentaProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'activo'>
  ): TerritorioVenta {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new TerritorioVenta({
      ...props,
      id,
      activo: true,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
    });
  }

  public static fromPersistence(props: TerritorioVentaProps): TerritorioVenta {
    return new TerritorioVenta(props);
  }

  private validate(): void {
    if (!this.props.codigo || this.props.codigo.trim().length < 2) {
      throw new Error('Código de territorio inválido');
    }
    if (!this.props.nombre || this.props.nombre.trim().length < 3) {
      throw new Error('Nombre de territorio inválido');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get codigo(): string { return this.props.codigo; }
  get nombre(): string { return this.props.nombre; }
  get tipo(): string { return this.props.tipo; }
  get padreId(): string | undefined | null { return this.props.padreId; }
  get asignadoAId(): string | undefined | null { return this.props.asignadoAId; }
  get activo(): boolean { return this.props.activo; }
  get fechaCreacion(): Date { return this.props.fechaCreacion; }

  // Business Logic
  public asignar(entidadId: string, tipo: 'EQUIPO' | 'VENDEDOR'): void {
    this.props.asignadoAId = entidadId;
    this.props.tipoAsignacion = tipo;
    this.props.fechaActualizacion = new Date();
  }

  public liberar(): void {
    this.props.asignadoAId = null;
    this.props.tipoAsignacion = null;
    this.props.fechaActualizacion = new Date();
  }

  public actualizarPotencial(nuevoPotencial: number): void {
    if (nuevoPotencial < 0) throw new Error('El potencial no puede ser negativo');
    this.props.potencialMercado = nuevoPotencial;
    this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): TerritorioVentaProps {
    return { ...this.props };
  }
}

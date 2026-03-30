/**
 * ENTIDAD EQUIPO VENTAS - TIER 0 ENTERPRISE
 *
 * @description Entidad principal que representa un equipo de ventas en la estructura
 * organizacional. Soporta jerarquías, asignación de territorios y cálculo de performance.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// import { TipoEquipo } from '../value-objects/TipoEquipo';
// Temporarily using string until ValueObject is created to avoid circular dependency issues during creation
// Or we can create the value object immediately after.
import { TipoEquipo } from "../value-objects/TipoEquipo";

export interface EquipoVentasProps {
  id: string;
  nombre: string;
  tipo: TipoEquipo;
  liderId: string;
  territorioId?: string;
  padreId?: string; // Para jerarquías anidadas (ej: Región -> Área -> Equipo)
  activo: boolean;
  metaAnual: number;
  moneda: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  tags: string[];
  metadata: Record<string, unknown>;
}

export class EquipoVentas {
  private constructor(private props: EquipoVentasProps) {
    this.validate();
  }

  public static create(
    props: Omit<
      EquipoVentasProps,
      "id" | "fechaCreacion" | "fechaActualizacion" | "activo"
    >,
  ): EquipoVentas {
    // Generate UUID v4
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "temp-uuid-" + Date.now();
    const fecha = new Date();

    return new EquipoVentas({
      ...props,
      id,
      activo: true,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      tags: props.tags || [],
      metadata: props.metadata || {},
    });
  }

  public static fromPersistence(props: EquipoVentasProps): EquipoVentas {
    return new EquipoVentas(props);
  }

  private validate(): void {
    if (!this.props.nombre || this.props.nombre.trim().length < 3) {
      throw new Error("El nombre del equipo debe tener al menos 3 caracteres");
    }
    if (!this.props.liderId) {
      throw new Error("El equipo debe tener un líder asignado");
    }
    if (this.props.metaAnual < 0) {
      throw new Error("La meta anual no puede ser negativa");
    }
    if (!this.props.id) {
      throw new Error("ID es requerido para una entidad existente/persistida");
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get nombre(): string {
    return this.props.nombre;
  }
  get tipo(): TipoEquipo {
    return this.props.tipo;
  }
  get liderId(): string {
    return this.props.liderId;
  }
  get territorioId(): string | undefined {
    return this.props.territorioId;
  }
  get activo(): boolean {
    return this.props.activo;
  }
  get metaAnual(): number {
    return this.props.metaAnual;
  }
  get fechaCreacion(): Date {
    return this.props.fechaCreacion;
  }
  get fechaActualizacion(): Date {
    return this.props.fechaActualizacion;
  }

  // Métodos de Dominio
  public actualizarNombre(nuevoNombre: string): void {
    if (nuevoNombre.trim().length < 3) throw new Error("Nombre inválido");
    this.props.nombre = nuevoNombre;
    this.props.fechaActualizacion = new Date();
  }

  public asignarTerritorio(territorioId: string): void {
    this.props.territorioId = territorioId;
    this.props.fechaActualizacion = new Date();
  }

  public cambiarLider(nuevoLiderId: string): void {
    if (!nuevoLiderId) throw new Error("ID de líder inválido");
    this.props.liderId = nuevoLiderId;
    this.props.fechaActualizacion = new Date();
  }

  public ajustarMeta(nuevaMeta: number): void {
    if (nuevaMeta < 0) throw new Error("Meta no puede ser negativa");
    this.props.metaAnual = nuevaMeta;
    this.props.fechaActualizacion = new Date();
  }

  public desactivar(): void {
    this.props.activo = false;
    this.props.fechaActualizacion = new Date();
  }

  public reactivar(): void {
    this.props.activo = true;
    this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): EquipoVentasProps {
    return { ...this.props };
  }
}

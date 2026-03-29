/**
 * ENTIDAD JERARQUÍA ORGANIZACIONAL - TIER 0 ENTERPRISE
 *
 * @description Modela la estructura jerárquica de la organización de ventas (Región, Área, División).
 * Permite definir relaciones padre-hijo y niveles de reporte.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface JerarquiaOrganizacionalProps {
  id: string;
  nombre: string;
  nivel: number; // 0: Root, 1: Región, 2: Área, 3: Distrito, etc.
  padreId?: string | null;
  responsableId?: string | null; // ID del Vendedor/Gerente a cargo
  activo: boolean;
  metadata: Record<string, unknown>;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class JerarquiaOrganizacional {
  private constructor(private props: JerarquiaOrganizacionalProps) {
    this.validate();
  }

  public static create(
    props: Omit<JerarquiaOrganizacionalProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'activo'>
  ): JerarquiaOrganizacional {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new JerarquiaOrganizacional({
      ...props,
      id,
      activo: true,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {},
    });
  }

  public static fromPersistence(props: JerarquiaOrganizacionalProps): JerarquiaOrganizacional {
    return new JerarquiaOrganizacional(props);
  }

  private validate(): void {
    if (!this.props.nombre || this.props.nombre.trim().length < 3) {
      throw new Error('El nombre de la jerarquía debe tener al menos 3 caracteres');
    }
    if (this.props.nivel < 0) {
      throw new Error('El nivel de jerarquía no puede ser negativo');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get nombre(): string { return this.props.nombre; }
  get nivel(): number { return this.props.nivel; }
  get padreId(): string | undefined | null { return this.props.padreId; }
  get responsableId(): string | undefined | null { return this.props.responsableId; }
  get activo(): boolean { return this.props.activo; }
  get fechaCreacion(): Date { return this.props.fechaCreacion; }
  get fechaActualizacion(): Date { return this.props.fechaActualizacion; }

  // Business Logic
  public actualizarNombre(nuevoNombre: string): void {
    if (nuevoNombre.trim().length < 3) throw new Error('Nombre inválido');
    this.props.nombre = nuevoNombre;
    this.props.fechaActualizacion = new Date();
  }

  public asignarResponsable(responsableId: string): void {
    this.props.responsableId = responsableId;
    this.props.fechaActualizacion = new Date();
  }

  public moverJerarquia(nuevoPadreId: string | null): void {
    if (nuevoPadreId === this.props.id) throw new Error('No puede ser padre de sí mismo');
    this.props.padreId = nuevoPadreId;
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

  public toSnapshot(): JerarquiaOrganizacionalProps {
    return { ...this.props };
  }
}

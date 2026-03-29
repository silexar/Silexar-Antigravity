/**
 * ENTIDAD MIEMBRO EQUIPO - TIER 0 ENTERPRISE
 * 
 * @description Representa a un individuo dentro de la estructura de ventas.
 * Gestiona su rol, equipo, estado y métricas clave de perfil.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NivelJerarquia } from '../value-objects/NivelJerarquia';
import { StatusMiembro } from '../value-objects/StatusMiembro';

export interface MiembroEquipoProps {
  id: string;
  usuarioId: string; // Relación con usuario del sistema (auth)
  equipoId: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  nivel: NivelJerarquia;
  status: StatusMiembro;
  fechaIngreso: Date;
  managerId?: string; // Reporta a
  territoriosAsignados: string[]; // IDs de territorios
  especialidades: string[]; // ['Pharma', 'Retail', 'Tech']
  certificaciones: string[]; // IDs de certificaciones obtenidas
  quotaIndividual?: number;
  moneda: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class MiembroEquipo {
  private constructor(private props: MiembroEquipoProps) {
    this.validate();
  }

  public static create(props: Omit<MiembroEquipoProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'status'>): MiembroEquipo {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date(); // Using Date() constructor
    
    return new MiembroEquipo({
      ...props,
      id,
      status: StatusMiembro.ONBOARDING, // Default status for new members
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: MiembroEquipoProps): MiembroEquipo {
    return new MiembroEquipo(props);
  }

  private validate(): void {
    if (!this.props.email || !this.props.email.includes('@')) {
      throw new Error('Email inválido');
    }
    if (!this.props.nombre || !this.props.apellido) {
      throw new Error('Nombre y apellido son requeridos');
    }
    if (!this.props.equipoId) {
      throw new Error('El miembro debe estar asignado a un equipo');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get usuarioId(): string { return this.props.usuarioId; }
  get nombreCompleto(): string { return `${this.props.nombre} ${this.props.apellido}`; }
  get email(): string { return this.props.email; }
  get nivel(): NivelJerarquia { return this.props.nivel; }
  get status(): StatusMiembro { return this.props.status; }
  get equipoId(): string { return this.props.equipoId; }
  get territorios(): string[] { return [...this.props.territoriosAsignados]; }

  // Métodos de Dominio
  public promover(nuevoNivel: NivelJerarquia): void {
    // Validaciones de negocio podrían ir aquí (ej: tenure mínima)
    this.props.nivel = nuevoNivel;
    this.props.fechaActualizacion = new Date();
  }

  public cambiarEquipo(nuevoEquipoId: string, nuevoManagerId?: string): void {
    this.props.equipoId = nuevoEquipoId;
    if (nuevoManagerId) this.props.managerId = nuevoManagerId;
    this.props.fechaActualizacion = new Date();
  }

  public asignarTerritorio(territorioId: string): void {
    if (!this.props.territoriosAsignados.includes(territorioId)) {
      this.props.territoriosAsignados.push(territorioId);
      this.props.fechaActualizacion = new Date();
    }
  }

  public removerTerritorio(territorioId: string): void {
    this.props.territoriosAsignados = this.props.territoriosAsignados.filter(id => id !== territorioId);
    this.props.fechaActualizacion = new Date();
  }

  public iniciarPIP(): void {
    this.props.status = StatusMiembro.PIP;
    this.props.fechaActualizacion = new Date();
  }

  public completarOnboarding(): void {
    if (this.props.status === StatusMiembro.ONBOARDING) {
      this.props.status = StatusMiembro.ACTIVO;
      this.props.fechaActualizacion = new Date();
    }
  }

  public desactivar(motivo: StatusMiembro = StatusMiembro.ALUMNI): void {
    this.props.status = motivo;
    this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): MiembroEquipoProps {
    return { ...this.props };
  }
}

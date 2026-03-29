/**
 * ENTIDAD KEY ACCOUNT MANAGER - TIER 0 ENTERPRISE
 *
 * @description Especialización de vendedor para gestión estratégica de cuentas clave.
 * Modela el perfil KAM con portfolio, certificaciones y capacidad.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

import { AccountTier } from '../value-objects/AccountTier';

export interface CertificacionKAM {
  nombre: string;
  emisor: string;
  fechaObtencion: Date;
  fechaExpiracion?: Date;
  estado: 'VIGENTE' | 'EXPIRADA' | 'EN_PROGRESO';
}

export interface KeyAccountManagerProps {
  id: string;
  vendedorId: string;
  tier: AccountTier;
  portfolioARR: number;
  accountCount: number;
  avgHealthScore: number;
  expansionOppsCount: number;
  certifications: CertificacionKAM[];
  maxAccounts: number;
  especialidadVertical: string;
  fechaPromocionKAM: Date;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class KeyAccountManager {
  private constructor(private props: KeyAccountManagerProps) {
    this.validate();
  }

  public static create(
    props: Omit<KeyAccountManagerProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'activo' | 'avgHealthScore' | 'expansionOppsCount'>
  ): KeyAccountManager {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();

    return new KeyAccountManager({
      ...props,
      id,
      activo: true,
      avgHealthScore: 0,
      expansionOppsCount: 0,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {},
    });
  }

  public static fromPersistence(props: KeyAccountManagerProps): KeyAccountManager {
    return new KeyAccountManager(props);
  }

  private validate(): void {
    if (!this.props.vendedorId) throw new Error('VendedorId es requerido');
    if (this.props.maxAccounts < 1) throw new Error('Max accounts debe ser al menos 1');
    if (this.props.portfolioARR < 0) throw new Error('Portfolio ARR no puede ser negativo');
  }

  // Getters
  get id(): string { return this.props.id; }
  get vendedorId(): string { return this.props.vendedorId; }
  get tier(): AccountTier { return this.props.tier; }
  get portfolioARR(): number { return this.props.portfolioARR; }
  get accountCount(): number { return this.props.accountCount; }
  get avgHealthScore(): number { return this.props.avgHealthScore; }
  get expansionOppsCount(): number { return this.props.expansionOppsCount; }
  get activo(): boolean { return this.props.activo; }

  get capacidadDisponible(): number {
    return Math.max(0, this.props.maxAccounts - this.props.accountCount);
  }

  get certificacionesVigentes(): CertificacionKAM[] {
    return this.props.certifications.filter(c => c.estado === 'VIGENTE');
  }

  // Business Logic
  public asignarCuenta(arrCuenta: number): void {
    if (this.capacidadDisponible <= 0) {
      throw new Error('KAM sin capacidad disponible para nuevas cuentas');
    }
    this.props.accountCount++;
    this.props.portfolioARR += arrCuenta;
    this.props.fechaActualizacion = new Date();
  }

  public desasignarCuenta(arrCuenta: number): void {
    if (this.props.accountCount <= 0) throw new Error('No hay cuentas para desasignar');
    this.props.accountCount--;
    this.props.portfolioARR = Math.max(0, this.props.portfolioARR - arrCuenta);
    this.props.fechaActualizacion = new Date();
  }

  public actualizarHealthScore(nuevoScore: number): void {
    if (nuevoScore < 0 || nuevoScore > 100) throw new Error('Health score debe ser 0-100');
    this.props.avgHealthScore = nuevoScore;
    this.props.fechaActualizacion = new Date();
  }

  public agregarCertificacion(cert: CertificacionKAM): void {
    this.props.certifications.push(cert);
    this.props.fechaActualizacion = new Date();
  }

  public esElegibleParaStrategicTier(): boolean {
    const tieneExperiencia = this.props.portfolioARR >= 500000;
    const tieneCertificaciones = this.certificacionesVigentes.length >= 3;
    const tieneHealthAlto = this.props.avgHealthScore >= 85;
    return tieneExperiencia && tieneCertificaciones && tieneHealthAlto;
  }

  public calcularCapacidad(): { actual: number; maximo: number; porcentaje: number } {
    return {
      actual: this.props.accountCount,
      maximo: this.props.maxAccounts,
      porcentaje: Math.round((this.props.accountCount / this.props.maxAccounts) * 100),
    };
  }

  public toSnapshot(): KeyAccountManagerProps {
    return { ...this.props };
  }
}

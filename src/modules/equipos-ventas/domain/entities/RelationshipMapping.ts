/**
 * ENTIDAD RELATIONSHIP MAPPING - TIER 0 ENTERPRISE
 *
 * @description Mapeo de stakeholders y red de influencia en una cuenta.
 * Visualiza buying committee, champions, blockers y competitive threats.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

import { TipoStakeholder } from '../value-objects/TipoStakeholder';

export interface Stakeholder {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  tipo: TipoStakeholder;
  nivelInfluencia: number; // 1-10
  sentimiento: 'POSITIVO' | 'NEUTRAL' | 'NEGATIVO' | 'DESCONOCIDO';
  frecuenciaContacto: 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'TRIMESTRAL' | 'RARA_VEZ';
  ultimoContacto?: Date;
  notas?: string;
  linkedInUrl?: string;
  email?: string;
}

export interface CompetitiveThreat {
  competidor: string;
  tipoAmenaza: 'DISPLACEMENT' | 'NEW_ENTRY' | 'PRICING' | 'PARTNERSHIP';
  stakeholderRelacionadoId?: string;
  severidad: 'LOW' | 'MEDIUM' | 'HIGH';
  fechaDeteccion: Date;
  accionContraMedida?: string;
}

export interface RelationshipMappingProps {
  id: string;
  cuentaId: string;
  cuentaNombre: string;
  kamId: string;
  stakeholders: Stakeholder[];
  coberturaBuyingCommittee: number; // 0-100
  championStrength: number; // 0-100
  competitiveThreats: CompetitiveThreat[];
  fechaCreacion: Date;
  fechaActualizacion: Date;
  metadata: Record<string, unknown>;
}

export class RelationshipMapping {
  private constructor(private props: RelationshipMappingProps) {
    this.validate();
  }

  public static create(
    props: Omit<RelationshipMappingProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'coberturaBuyingCommittee' | 'championStrength'>
  ): RelationshipMapping {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();

    const instance = new RelationshipMapping({
      ...props,
      id,
      coberturaBuyingCommittee: 0,
      championStrength: 0,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
      metadata: props.metadata || {},
    });

    instance.recalcularMetricas();
    return instance;
  }

  public static fromPersistence(props: RelationshipMappingProps): RelationshipMapping {
    return new RelationshipMapping(props);
  }

  private validate(): void {
    if (!this.props.cuentaId) throw new Error('CuentaId es requerido');
    if (!this.props.kamId) throw new Error('KamId es requerido');
  }

  // Getters
  get id(): string { return this.props.id; }
  get cuentaId(): string { return this.props.cuentaId; }
  get stakeholders(): Stakeholder[] { return [...this.props.stakeholders]; }
  get coberturaBuyingCommittee(): number { return this.props.coberturaBuyingCommittee; }
  get championStrength(): number { return this.props.championStrength; }
  get competitiveThreats(): CompetitiveThreat[] { return [...this.props.competitiveThreats]; }

  get stakeholderCount(): number { return this.props.stakeholders.length; }

  get cLevelCount(): number {
    return this.props.stakeholders.filter(s =>
      s.cargo.toLowerCase().startsWith('c') &&
      (s.cargo.toLowerCase().includes('ceo') || s.cargo.toLowerCase().includes('cto') ||
       s.cargo.toLowerCase().includes('cfo') || s.cargo.toLowerCase().includes('cmo') ||
       s.cargo.toLowerCase().includes('coo') || s.cargo.toLowerCase().includes('chief'))
    ).length;
  }

  get threatsActivas(): CompetitiveThreat[] {
    return this.props.competitiveThreats.filter(t => t.severidad === 'HIGH');
  }

  // Business Logic
  public agregarStakeholder(stakeholder: Omit<Stakeholder, 'id'>): void {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sh-' + Date.now();
    this.props.stakeholders.push({ ...stakeholder, id });
    this.recalcularMetricas();
    this.props.fechaActualizacion = new Date();
  }

  public actualizarSentimiento(stakeholderId: string, sentimiento: Stakeholder['sentimiento']): void {
    const stakeholder = this.props.stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) throw new Error('Stakeholder no encontrado');
    stakeholder.sentimiento = sentimiento;
    this.recalcularMetricas();
    this.props.fechaActualizacion = new Date();
  }

  public registrarContacto(stakeholderId: string, fecha?: Date): void {
    const stakeholder = this.props.stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) throw new Error('Stakeholder no encontrado');
    stakeholder.ultimoContacto = fecha || new Date();
    this.props.fechaActualizacion = new Date();
  }

  public agregarThreat(threat: CompetitiveThreat): void {
    this.props.competitiveThreats.push(threat);
    this.props.fechaActualizacion = new Date();
  }

  public calcularCobertura(): number {
    return this.props.coberturaBuyingCommittee;
  }

  public identificarBrechas(): string[] {
    const brechas: string[] = [];

    const tieneChampion = this.props.stakeholders.some(s => s.tipo === TipoStakeholder.CHAMPION);
    if (!tieneChampion) brechas.push('No hay Champion identificado');

    const tieneDecisionMaker = this.props.stakeholders.some(s => s.tipo === TipoStakeholder.DECISION_MAKER);
    if (!tieneDecisionMaker) brechas.push('No hay Decision Maker mapeado');

    const tieneEconomicBuyer = this.props.stakeholders.some(s => s.tipo === TipoStakeholder.ECONOMIC_BUYER);
    if (!tieneEconomicBuyer) brechas.push('No hay Economic Buyer identificado');

    const negativos = this.props.stakeholders.filter(s => s.sentimiento === 'NEGATIVO');
    if (negativos.length > 0) brechas.push(`${negativos.length} stakeholder(s) con sentimiento negativo`);

    const sinContactoReciente = this.props.stakeholders.filter(s => {
      if (!s.ultimoContacto) return true;
      const diasSinContacto = (Date.now() - s.ultimoContacto.getTime()) / (1000 * 60 * 60 * 24);
      return diasSinContacto > 30;
    });
    if (sinContactoReciente.length > 0) brechas.push(`${sinContactoReciente.length} stakeholder(s) sin contacto reciente`);

    return brechas;
  }

  private recalcularMetricas(): void {
    // Cobertura del buying committee
    const rolesImportantes = [TipoStakeholder.CHAMPION, TipoStakeholder.DECISION_MAKER, TipoStakeholder.ECONOMIC_BUYER, TipoStakeholder.INFLUENCER];
    const rolesCubiertos = rolesImportantes.filter(rol =>
      this.props.stakeholders.some(s => s.tipo === rol && s.sentimiento !== 'DESCONOCIDO')
    );
    this.props.coberturaBuyingCommittee = Math.round((rolesCubiertos.length / rolesImportantes.length) * 100);

    // Champion strength
    const champions = this.props.stakeholders.filter(s => s.tipo === TipoStakeholder.CHAMPION);
    if (champions.length > 0) {
      const avgInfluencia = champions.reduce((sum, c) => sum + c.nivelInfluencia, 0) / champions.length;
      const sentimientoBonus = champions.filter(c => c.sentimiento === 'POSITIVO').length / champions.length;
      this.props.championStrength = Math.round((avgInfluencia / 10) * 50 + sentimientoBonus * 50);
    } else {
      this.props.championStrength = 0;
    }
  }

  public toSnapshot(): RelationshipMappingProps {
    return { ...this.props };
  }
}

/**
 * COMMAND: MAPEAR RELATIONSHIP - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

import { TipoStakeholder } from '../../domain/value-objects/TipoStakeholder';

export interface MapearRelationshipCommandPayload {
  cuentaId: string;
  cuentaNombre: string;
  kamId: string;
  stakeholders: Array<{
    nombre: string;
    cargo: string;
    departamento: string;
    tipo: TipoStakeholder;
    nivelInfluencia: number;
    sentimiento: 'POSITIVO' | 'NEUTRAL' | 'NEGATIVO' | 'DESCONOCIDO';
    frecuenciaContacto: 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'TRIMESTRAL' | 'RARA_VEZ';
    email?: string;
    linkedInUrl?: string;
  }>;
  competitiveThreats?: Array<{
    competidor: string;
    tipoAmenaza: 'DISPLACEMENT' | 'NEW_ENTRY' | 'PRICING' | 'PARTNERSHIP';
    severidad: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

export class MapearRelationshipCommand {
  constructor(public readonly payload: MapearRelationshipCommandPayload) {
    this.validate();
  }

  private validate(): void {
    if (!this.payload.cuentaId) throw new Error('CuentaId es requerido');
    if (!this.payload.kamId) throw new Error('KamId es requerido');
  }
}

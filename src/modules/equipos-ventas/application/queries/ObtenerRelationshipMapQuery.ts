/**
 * QUERY: OBTENER RELATIONSHIP MAP - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

export interface RelationshipMapResult {
  cuentaId: string;
  cuentaNombre: string;
  stakeholders: Array<{
    id: string;
    nombre: string;
    cargo: string;
    departamento: string;
    tipo: string;
    nivelInfluencia: number;
    sentimiento: string;
    ultimoContacto?: Date;
  }>;
  coberturaBuyingCommittee: number;
  championStrength: number;
  competitiveThreats: Array<{
    competidor: string;
    tipoAmenaza: string;
    severidad: string;
  }>;
  brechas: string[];
}

export class ObtenerRelationshipMapQuery {
  constructor(
    public readonly cuentaId: string,
    public readonly kamId: string
  ) {
    if (!cuentaId) throw new Error('CuentaId es requerido');
    if (!kamId) throw new Error('KamId es requerido');
  }
}

import { Anunciante, AnuncianteEstado } from '../entities/Anunciante';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface BuscarAnunciantesFilters {
  search?: string;
  estado?: AnuncianteEstado;
  activo?: boolean;
}

export interface IAnuncianteRepository {
  findById(id: string, tenantId: string): Promise<Anunciante | null>;
  findAll(tenantId: string, filters: BuscarAnunciantesFilters, pagination: PaginationParams): Promise<Anunciante[]>;
  save(anunciante: Anunciante): Promise<void>;
  update(anunciante: Anunciante): Promise<void>;
  softDelete(id: string, tenantId: string, userId: string): Promise<void>;
  count(tenantId: string, filters: BuscarAnunciantesFilters): Promise<number>;
  existsByRut(rut: string, tenantId: string, excludeId?: string): Promise<boolean>;
  generateCode(tenantId: string): Promise<string>;
  /**
   * Búsqueda enriquecida con datos agregados de contratos y cuñas
   * Para el endpoint de búsqueda inteligente
   */
  findEnriched(tenantId: string, search?: string, limit?: number): Promise<AnuncianteEnriquecido[]>;
}

/**
 * Datos enriquecidos para búsqueda inteligente
 */
export interface AnuncianteEnriquecido {
  id: string;
  nombre: string;
  razonSocial: string;
  rut: string;
  industria: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  contratosActivos: number;
  cunasActivas: number;
  ultimaActividad: string;
  riskLevel: 'bajo' | 'medio' | 'alto';
  riskScore: number;
  creditScore: number;
}

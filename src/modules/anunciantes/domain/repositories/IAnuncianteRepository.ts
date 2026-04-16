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
}

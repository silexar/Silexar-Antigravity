/**
 * REPOSITORY INTERFACE: ACTIVO DIGITAL
 *
 * Contrato de persistencia para la entidad ActivoDigital.
 * No importa nada de infrastructure/ ni lib/db/.
 */

import type { ActivoDigital } from '../entities/ActivoDigital';
import type { EstadoActivoDigitalValor, TipoActivoDigitalValor } from '../entities/ActivoDigital';

export interface ActivoDigitalFilter {
  search?: string;
  tipo?: TipoActivoDigitalValor;
  estado?: EstadoActivoDigitalValor;
  cunaId?: string;
  anuncianteId?: string; // Se resuelve via cuna → anunciante
  formato?: string;
  soloActivos?: boolean;
  soloVigentes?: boolean;
  page?: number;
  limit?: number;
  orderDir?: 'asc' | 'desc';
}

export interface ActivoDigitalListResult {
  items: ActivoDigital[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IActivoDigitalRepository {
  /** Busca un activo digital por ID dentro del tenant */
  findById(id: string, tenantId: string): Promise<ActivoDigital | null>;

  /** Busca por código (DA-2026-0001) */
  findByCodigo(codigo: string, tenantId: string): Promise<ActivoDigital | null>;

  /** Lista activos con filtros y paginación */
  findMany(filter: ActivoDigitalFilter, tenantId: string): Promise<ActivoDigitalListResult>;

  /** Persiste un activo digital (INSERT o UPDATE) */
  save(activo: ActivoDigital): Promise<void>;

  /** Soft delete */
  delete(id: string, tenantId: string, eliminadoPorId: string): Promise<void>;

  /** Reserva el próximo código DA disponible */
  reserveNextCodigo(tenantId: string): Promise<string>;

  /** Verifica existencia */
  exists(id: string, tenantId: string): Promise<boolean>;
}

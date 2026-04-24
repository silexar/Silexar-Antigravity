/**
 * REPOSITORY INTERFACE: CUÑA — TIER 0
 *
 * Contrato puro de persistencia para la entidad Cuna.
 * La capa de dominio define QUÉ necesita; la infraestructura decide CÓMO.
 *
 * REGLA: Este archivo NO importa nada de infrastructure/, app/, ni lib/db/.
 */

import type { Cuna } from '../entities/Cuna';
import type { CunaId } from '../value-objects/CunaId';
import type { EstadoCunaValor } from '../value-objects/EstadoCuna';
import type { TipoCunaValor } from '../entities/Cuna';

export interface CunaFilter {
  search?: string;
  tipo?: TipoCunaValor;
  estado?: EstadoCunaValor;
  anuncianteId?: string;
  campanaId?: string;
  contratoId?: string;
  venceEnDias?: number;      // Cuñas que vencen en los próximos N días
  soloEnAire?: boolean;
  soloPendientes?: boolean;
  page?: number;
  limit?: number;
  orderDir?: 'asc' | 'desc';
}

export interface CunaListResult {
  items: Cuna[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICunaRepository {
  /** Busca una cuña por ID dentro del tenant. Retorna null si no existe. */
  findById(id: string, tenantId: string): Promise<Cuna | null>;

  /** Busca una cuña por código SPX. Retorna null si no existe. */
  findByCodigo(codigo: string, tenantId: string): Promise<Cuna | null>;

  /** Lista cuñas con filtros y paginación. */
  findMany(filter: CunaFilter, tenantId: string): Promise<CunaListResult>;

  /** Persiste una cuña (INSERT si nueva, UPDATE si ya existe). */
  save(cuna: Cuna): Promise<void>;

  /** Soft delete de una cuña. */
  delete(id: string, tenantId: string, eliminadoPorId: string): Promise<void>;

  /**
   * Reserva atómicamente el próximo CunaId disponible.
   * Usa una transacción para evitar colisiones concurrentes.
   */
  reserveNextCodigo(tenantId: string): Promise<CunaId>;

  /** Verifica si existe una cuña con ese ID dentro del tenant. */
  exists(id: string, tenantId: string): Promise<boolean>;
}
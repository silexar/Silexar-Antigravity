/**
 * IRegistroAireRepository — Interface del repositorio de registros de aire
 */

import type { RegistroAire } from '../entities/RegistroAire';
import type { EstadoRegistroAireValue } from '../value-objects/EstadoRegistroAire';

export interface RegistroAireFilters {
  tenantId: string;
  emisoraId?: string;
  estado?: EstadoRegistroAireValue;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface RegistroAirePaginado {
  datos: RegistroAire[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

export interface IRegistroAireRepository {
  buscarPorId(id: string, tenantId: string): Promise<RegistroAire | null>;
  listar(filtros: RegistroAireFilters, pagina: number, tamanoPagina: number): Promise<RegistroAirePaginado>;
  guardar(registro: RegistroAire): Promise<void>;
  actualizar(registro: RegistroAire): Promise<void>;
  eliminar(id: string, tenantId: string): Promise<void>;
  listarExpirados(tenantId: string, fechaCorte: Date): Promise<RegistroAire[]>;
}

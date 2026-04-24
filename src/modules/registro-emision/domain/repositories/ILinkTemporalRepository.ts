/**
 * ILinkTemporalRepository — Interface del repositorio de accesos seguros (links temporales)
 */

import type { AccesoSeguro } from '../entities/AccesoSeguro';

export interface AccesoSeguroFilters {
  tenantId: string;
  verificacionId?: string;
  estado?: 'activo' | 'usado' | 'expirado' | 'revocado';
  clienteEmail?: string;
}

export interface ILinkTemporalRepository {
  buscarPorId(id: string, tenantId: string): Promise<AccesoSeguro | null>;
  buscarPorCodigo(codigoAcceso: string, tenantId: string): Promise<AccesoSeguro | null>;
  buscarPorUuid(linkUuid: string, tenantId: string): Promise<AccesoSeguro | null>;
  listar(filtros: AccesoSeguroFilters, pagina: number, tamanoPagina: number): Promise<{
    datos: AccesoSeguro[];
    total: number;
    pagina: number;
    tamanoPagina: number;
    totalPaginas: number;
  }>;
  guardar(acceso: AccesoSeguro): Promise<void>;
  actualizar(acceso: AccesoSeguro): Promise<void>;
  eliminar(id: string, tenantId: string): Promise<void>;
  listarExpirados(tenantId: string, fechaCorte: Date): Promise<AccesoSeguro[]>;
}

/**
 * IVerificacionEmisionRepository — Interface del repositorio de verificaciones
 */

import type { VerificacionEmision } from '../entities/VerificacionEmision';
import type { EstadoVerificacionValue } from '../value-objects/EstadoVerificacion';

export interface VerificacionEmisionFilters {
  tenantId: string;
  estado?: EstadoVerificacionValue;
  campanaId?: string;
  anuncianteId?: string;
  ejecutivoId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface VerificacionEmisionPaginada {
  datos: VerificacionEmision[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

export interface IVerificacionEmisionRepository {
  buscarPorId(id: string, tenantId: string): Promise<VerificacionEmision | null>;
  listar(filtros: VerificacionEmisionFilters, pagina: number, tamanoPagina: number): Promise<VerificacionEmisionPaginada>;
  guardar(verificacion: VerificacionEmision): Promise<void>;
  actualizar(verificacion: VerificacionEmision): Promise<void>;
  eliminar(id: string, tenantId: string): Promise<void>;
}

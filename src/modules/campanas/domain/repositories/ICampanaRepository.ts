/**
 * ICampanaRepository — Interface del repositorio de campañas
 * Define el contrato para persistencia. Sin imports de infraestructura.
 */

import type { Campana } from '../entities/Campana';
import type { EstadoCampanaValue } from '../value-objects/EstadoCampana';

export interface CampanaFilters {
  tenantId: string;
  estado?: EstadoCampanaValue;
  anuncianteId?: string;
  contratoId?: string;
  fechaInicioDesde?: Date;
  fechaFinHasta?: Date;
  busqueda?: string;
}

export interface CampanaPaginada {
  datos: Campana[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

export interface ICampanaRepository {
  /** Buscar por ID, retorna null si no existe */
  buscarPorId(id: string, tenantId: string): Promise<Campana | null>;

  /** Listar con filtros y paginación */
  listar(filtros: CampanaFilters, pagina: number, tamanoPagina: number): Promise<CampanaPaginada>;

  /** Guardar nueva campaña */
  guardar(campana: Campana): Promise<void>;

  /** Actualizar campaña existente */
  actualizar(campana: Campana): Promise<void>;

  /** Verificar si existe por número de campaña */
  existePorNumero(numero: string, tenantId: string): Promise<boolean>;

  /** Obtener próximo número secuencial para el tenant */
  obtenerSiguienteSecuencial(tenantId: string, anio: number): Promise<number>;

  /** Campañas próximas a vencer (dentro de N días) */
  listarProximasAVencer(tenantId: string, diasUmbral: number): Promise<Campana[]>;

  /** Contar por estado para dashboard */
  contarPorEstado(tenantId: string): Promise<Record<EstadoCampanaValue, number>>;
}

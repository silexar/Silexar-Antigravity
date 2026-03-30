/**
 * 🔌 DOMAIN PORT: IRegistroEmisionRepository
 * 
 * Contrato para la persistencia del agregado RegistroEmision.
 * Desacopla el dominio de la base de datos (Drizzle/SQL).
 * 
 * @tier TIER_0_ENTERPRISE
 */

import { RegistroEmision } from "../entities/RegistroEmision";

export interface IRegistroEmisionRepository {
  /**
   * Guarda un nuevo registro o actualiza uno existente.
   * Debe garantizar consistencia transaccional del agregado.
   */
  save(registro: RegistroEmision): Promise<void>;

  /**
   * Busca un registro por su ID único de negocio.
   */
  findById(id: string): Promise<RegistroEmision | null>;

  /**
   * Busca registros activos por cliente.
   */
  findByClienteId(clienteId: string): Promise<RegistroEmision[]>;
}

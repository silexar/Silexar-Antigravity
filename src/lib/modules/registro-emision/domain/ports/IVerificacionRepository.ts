/**
 * 🔌 PORT: IVerificacionRepository
 * 
 * Interfaz para la persistencia de verificaciones.
 * Permite desacoplar el dominio de la implementación (Drizzle/Postgres).
 * 
 * @tier TIER_0_FORTUNE_10
 */

import { Verificacion } from "../entities/Verificacion";

export interface IVerificacionRepository {
  /**
   * Guarda una nueva verificación o actualiza una existente.
   */
  save(verificacion: Verificacion): Promise<void>;

  /**
   * Busca una verificación por su ID.
   */
  findById(id: string): Promise<Verificacion | null>;

  /**
   * Obtiene las verificaciones recientes de un tenant.
   */
  findRecentByTenant(tenantId: string, limit?: number): Promise<Verificacion[]>;
}

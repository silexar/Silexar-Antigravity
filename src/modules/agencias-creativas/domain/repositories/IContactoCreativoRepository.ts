/**
 * 📞 REPOSITORIO: CONTACTO CREATIVO
 * 
 * Interface para el repositorio de contactos creativos
 */

import { ContactoCreativo } from '../entities/ContactoCreativo';

export interface IContactoCreativoRepository {
  /**
   * Guarda un contacto creativo
   */
  save(contacto: ContactoCreativo): Promise<void>;

  /**
   * Busca un contacto por ID
   */
  findById(id: string): Promise<ContactoCreativo | null>;

  /**
   * Busca contactos por agencia
   */
  findByAgenciaId(agenciaId: string): Promise<ContactoCreativo[]>;

  /**
   * Busca contacto principal de una agencia
   */
  findPrincipalByAgenciaId(agenciaId: string): Promise<ContactoCreativo | null>;

  /**
   * Busca contacto por email
   */
  findByEmail(email: string): Promise<ContactoCreativo | null>;

  /**
   * Actualiza un contacto
   */
  update(contacto: ContactoCreativo): Promise<void>;

  /**
   * Elimina un contacto
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si existe un contacto con el email dado
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Busca contactos por tenant
   */
  findByTenantId(tenantId: string): Promise<ContactoCreativo[]>;

  /**
   * Busca contactos activos por agencia
   */
  findActiveByAgenciaId(agenciaId: string): Promise<ContactoCreativo[]>;

  /**
   * Busca contactos disponibles por agencia
   */
  findAvailableByAgenciaId(agenciaId: string): Promise<ContactoCreativo[]>;
}
/**
 * REPOSITORY INTERFACE: DISTRIBUCIÓN — TIER 0
 *
 * Contrato de dominio para la persistencia de GrupoDistribucion
 * y registro de los envíos realizados.
 */

import type { GrupoDistribucion } from '../entities/GrupoDistribucion';

export interface RegistroEnvio {
  id: string;
  cunaId: string;
  grupoId: string;
  tenantId: string;
  canal: 'email' | 'whatsapp' | 'ftp' | 'api';
  destinatarios: string[];           // emails o teléfonos usados
  estado: 'enviado' | 'fallido' | 'pendiente';
  errorDetalle?: string | null;
  enviadoEn: Date;
}

export interface IDistribucionRepository {
  // ─── GrupoDistribucion ─────────────────────────────────────────

  /** Obtiene un grupo por ID */
  findGrupoById(id: string, tenantId: string): Promise<GrupoDistribucion | null>;

  /** Lista todos los grupos activos de un tenant */
  findGruposActivos(tenantId: string): Promise<GrupoDistribucion[]>;

  /** Grupos asociados a una emisora específica */
  findGruposByEmisora(emisoraId: string, tenantId: string): Promise<GrupoDistribucion[]>;

  /** Persiste un nuevo grupo */
  saveGrupo(grupo: GrupoDistribucion): Promise<void>;

  /** Actualiza un grupo existente */
  updateGrupo(grupo: GrupoDistribucion): Promise<void>;

  /** Elimina un grupo por ID */
  deleteGrupo(id: string, tenantId: string): Promise<void>;

  // ─── Registros de Envío ────────────────────────────────────────

  /** Registra un envío realizado */
  saveRegistroEnvio(registro: RegistroEnvio): Promise<void>;

  /** Obtiene el historial de envíos de una cuña */
  findEnviosByCunaId(cunaId: string, tenantId: string): Promise<RegistroEnvio[]>;

  /** Envíos fallidos pendientes de reintento */
  findEnviosFallidos(tenantId: string): Promise<RegistroEnvio[]>;
}

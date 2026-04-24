/**
 * REPOSITORY INTERFACE: AUDIO — TIER 0
 *
 * Contrato de dominio para la persistencia de la entidad Audio.
 * La implementación real vive en la capa de infraestructura.
 */

import type { Audio } from '../entities/Audio';

export interface IAudioRepository {
  /** Obtiene un audio por su ID */
  findById(id: string, tenantId: string): Promise<Audio | null>;

  /** Obtiene todos los audios de una cuña específica */
  findByCunaId(cunaId: string, tenantId: string): Promise<Audio[]>;

  /** Obtiene el audio activo (esVersionActual = true) de una cuña */
  findActivoByCunaId(cunaId: string, tenantId: string): Promise<Audio | null>;

  /** Obtiene audios pendientes de procesamiento */
  findPendientesProcesamiento(tenantId: string): Promise<Audio[]>;

  /** Busca audio por fingerprint (para evitar duplicados) */
  findByFingerprint(fingerprint: string, tenantId: string): Promise<Audio | null>;

  /** Persiste un nuevo audio */
  save(audio: Audio): Promise<void>;

  /** Actualiza un audio existente */
  update(audio: Audio): Promise<void>;

  /** Elimina un audio por ID */
  delete(id: string, tenantId: string): Promise<void>;

  /** Cuenta audios por cuña */
  countByCunaId(cunaId: string, tenantId: string): Promise<number>;
}

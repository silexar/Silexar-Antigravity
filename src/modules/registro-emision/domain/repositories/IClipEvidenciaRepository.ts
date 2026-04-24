/**
 * IClipEvidenciaRepository — Interface del repositorio de clips de evidencia
 */

import type { ClipEvidencia } from '../entities/ClipEvidencia';

export interface ClipEvidenciaFilters {
  tenantId: string;
  verificacionId?: string;
  aprobado?: boolean;
}

export interface IClipEvidenciaRepository {
  buscarPorId(id: string, tenantId: string): Promise<ClipEvidencia | null>;
  listarPorVerificacion(verificacionId: string, tenantId: string): Promise<ClipEvidencia[]>;
  guardar(clip: ClipEvidencia): Promise<void>;
  actualizar(clip: ClipEvidencia): Promise<void>;
  eliminar(id: string, tenantId: string): Promise<void>;
  listarExpirados(tenantId: string, fechaCorte: Date): Promise<ClipEvidencia[]>;
}

import { RrssPublicacion } from '../entities/RrssPublicacion';

export interface IRrssPublicacionRepository {
  findPublicacionById(id: string, tenantId: string): Promise<RrssPublicacion | null>;
  findPublicacionesByTenant(tenantId: string, limit?: number, offset?: number): Promise<RrssPublicacion[]>;
  findByCampana(campanaId: string, tenantId: string): Promise<RrssPublicacion[]>;
  findByContrato(contratoId: string, tenantId: string): Promise<RrssPublicacion[]>;
  findByConnection(connectionId: string, tenantId: string): Promise<RrssPublicacion[]>;
  findProgramadasPendientes(tenantId: string, antesDe: Date): Promise<RrssPublicacion[]>;
  findAllProgramadasPendientes(antesDe: Date): Promise<RrssPublicacion[]>;
  savePublicacion(publicacion: RrssPublicacion): Promise<void>;
  updatePublicacion(publicacion: RrssPublicacion): Promise<void>;
  deletePublicacion(id: string, tenantId: string): Promise<void>;
}

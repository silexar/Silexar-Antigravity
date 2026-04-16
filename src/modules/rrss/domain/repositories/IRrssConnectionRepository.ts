import { RrssConnection } from '../entities/RrssConnection';

export interface IRrssConnectionRepository {
  findConnectionById(id: string, tenantId: string): Promise<RrssConnection | null>;
  findConnectionsByTenant(tenantId: string): Promise<RrssConnection[]>;
  findByPlataforma(tenantId: string, plataforma: string): Promise<RrssConnection[]>;
  findByAccountId(tenantId: string, plataforma: string, accountId: string): Promise<RrssConnection | null>;
  saveConnection(connection: RrssConnection): Promise<void>;
  updateConnection(connection: RrssConnection): Promise<void>;
  deleteConnection(id: string, tenantId: string): Promise<void>;
}

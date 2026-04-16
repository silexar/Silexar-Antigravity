import { Factura, EstadoFactura, TipoDocumentoTributario } from '../entities/Factura';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface BuscarFacturasFilters {
  search?: string;
  estado?: EstadoFactura;
  tipoDocumento?: TipoDocumentoTributario;
}

export interface IFacturaRepository {
  findById(id: string, tenantId: string): Promise<Factura | null>;
  findAll(tenantId: string, filters: BuscarFacturasFilters, pagination: PaginationParams): Promise<Factura[]>;
  save(factura: Factura): Promise<void>;
  update(factura: Factura): Promise<void>;
  count(tenantId: string, filters: BuscarFacturasFilters): Promise<number>;
  generateNumeroFactura(tenantId: string): Promise<number>;
}

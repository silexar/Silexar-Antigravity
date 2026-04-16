import { EstadoFactura, TipoDocumentoTributario } from '../../domain/entities/Factura';

export interface BuscarFacturasQueryInput {
  tenantId: string;
  search?: string;
  estado?: EstadoFactura;
  tipoDocumento?: TipoDocumentoTributario;
  page: number;
  limit: number;
}

export class BuscarFacturasQuery {
  constructor(public readonly input: BuscarFacturasQueryInput) {}
}

import { Result } from '@/lib/utils/result';
import { Factura } from '../../domain/entities/Factura';
import { IFacturaRepository } from '../../domain/repositories/IFacturaRepository';
import { BuscarFacturasQuery } from '../queries/BuscarFacturasQuery';

export interface BuscarFacturasResult {
  data: Factura[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BuscarFacturasHandler {
  constructor(private readonly repository: IFacturaRepository) {}

  async execute(query: BuscarFacturasQuery): Promise<Result<BuscarFacturasResult>> {
    try {
      const { tenantId, search, estado, tipoDocumento, page, limit } = query.input;
      const filters = { search, estado, tipoDocumento };
      const pagination = { page, limit };

      const [data, total] = await Promise.all([
        this.repository.findAll(tenantId, filters, pagination),
        this.repository.count(tenantId, filters),
      ]);

      return Result.ok({
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al buscar facturas'));
    }
  }
}

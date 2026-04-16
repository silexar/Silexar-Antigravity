import { Result } from '@/lib/utils/result';
import { Factura } from '../../domain/entities/Factura';
import { IFacturaRepository } from '../../domain/repositories/IFacturaRepository';
import { ObtenerFacturaPorIdQuery } from '../queries/ObtenerFacturaPorIdQuery';

export class ObtenerFacturaPorIdHandler {
  constructor(private readonly repository: IFacturaRepository) {}

  async execute(query: ObtenerFacturaPorIdQuery): Promise<Result<Factura | null>> {
    try {
      const factura = await this.repository.findById(query.input.id, query.input.tenantId);
      return Result.ok(factura);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al obtener factura'));
    }
  }
}

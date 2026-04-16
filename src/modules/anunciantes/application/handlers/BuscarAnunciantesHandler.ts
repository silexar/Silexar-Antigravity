import { Result } from '@/lib/utils/result';
import { Anunciante } from '../../domain/entities/Anunciante';
import { IAnuncianteRepository } from '../../domain/repositories/IAnuncianteRepository';
import { BuscarAnunciantesQuery } from '../queries/BuscarAnunciantesQuery';

export interface BuscarAnunciantesResult {
  data: Anunciante[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BuscarAnunciantesHandler {
  constructor(private readonly repository: IAnuncianteRepository) {}

  async execute(query: BuscarAnunciantesQuery): Promise<Result<BuscarAnunciantesResult>> {
    try {
      const { tenantId, search, estado, activo, page, limit } = query.input;
      const filters = { search, estado, activo };
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
      return Result.fail(error instanceof Error ? error : new Error('Error al buscar anunciantes'));
    }
  }
}

import { Result } from '@/lib/utils/result';
import { RrssConnection } from '../../domain/entities/RrssConnection';
import { IRrssConnectionRepository } from '../../domain/repositories/IRrssConnectionRepository';
import { ListarCuentasRrssQuery } from '../queries/ListarCuentasRrssQuery';

export class ListarCuentasRrssHandler {
  constructor(private readonly repo: IRrssConnectionRepository) {}

  async execute(query: ListarCuentasRrssQuery): Promise<Result<RrssConnection[]>> {
    try {
      const { input } = query;
      const cuentas = input.plataforma
        ? await this.repo.findByPlataforma(input.tenantId, input.plataforma)
        : await this.repo.findConnectionsByTenant(input.tenantId);
      return Result.ok(cuentas);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al listar cuentas RRSS');
    }
  }
}

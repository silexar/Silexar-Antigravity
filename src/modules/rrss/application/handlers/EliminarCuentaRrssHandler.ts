import { Result } from '@/lib/utils/result';
import { IRrssConnectionRepository } from '../../domain/repositories/IRrssConnectionRepository';
import { EliminarCuentaRrssCommand } from '../commands/EliminarCuentaRrssCommand';

export class EliminarCuentaRrssHandler {
  constructor(private readonly repo: IRrssConnectionRepository) {}

  async execute(command: EliminarCuentaRrssCommand): Promise<Result<void>> {
    try {
      await this.repo.deleteConnection(command.input.id, command.input.tenantId);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al eliminar cuenta RRSS');
    }
  }
}

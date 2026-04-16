import { Result } from '@/lib/utils/result';
import { IAnuncianteRepository } from '../../domain/repositories/IAnuncianteRepository';

export interface EliminarAnuncianteInput {
  id: string;
  tenantId: string;
  userId: string;
}

export class EliminarAnuncianteHandler {
  constructor(private readonly repository: IAnuncianteRepository) {}

  async execute(input: EliminarAnuncianteInput): Promise<Result<void>> {
    try {
      await this.repository.softDelete(input.id, input.tenantId, input.userId);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al eliminar anunciante'));
    }
  }
}

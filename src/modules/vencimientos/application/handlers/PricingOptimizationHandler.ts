import { OptimizarPricingCommand, OptimizarPricingDTO } from '../commands/OptimizarPricingCommand';
import { ITarifarioRepository } from '../../domain/repositories/ITarifarioRepository';

export class PricingOptimizationHandler {
  constructor(private readonly tarifarioRepository: ITarifarioRepository) {}

  async handle(dto: OptimizarPricingDTO) {
    const command = new OptimizarPricingCommand(this.tarifarioRepository);
    return await command.execute(dto);
  }
}

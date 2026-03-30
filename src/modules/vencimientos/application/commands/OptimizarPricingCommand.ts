export interface OptimizarPricingDTO {
  programaId: string;
  franjaHoraria: string;
  demandaDetectada: number;
}

import type { ITarifarioRepository } from '../../domain/repositories/ITarifarioRepository';

export class OptimizarPricingCommand {
  constructor(private readonly repo: ITarifarioRepository) {}

  async execute(dto: OptimizarPricingDTO) {
    return this.repo.findTarifarioVigente(dto.programaId);
  }
}

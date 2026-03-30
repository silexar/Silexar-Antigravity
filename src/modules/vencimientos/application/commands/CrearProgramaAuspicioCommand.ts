import { ProgramaAuspicio } from '../../domain/entities/ProgramaAuspicio';
import { logger } from '@/lib/observability';
import { IProgramaAuspicioRepository } from '../../domain/repositories/IProgramaAuspicioRepository';

export interface CrearProgramaAuspicioDTO {
  emisoraId: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  diasEmision: number[];
  cupoDisponible: number;
}

export class CrearProgramaAuspicioCommand {
  constructor(private readonly repository: IProgramaAuspicioRepository) {}

  async execute(dto: CrearProgramaAuspicioDTO) {
    logger.info(`Command: Creando nuevo programa de auspicio ${dto.nombre} para emisora ${dto.emisoraId}`);
    // mock logic
    return { success: true, programaId: "PRG_NEW" };
  }
}

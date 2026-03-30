import { CrearProgramaAuspicioCommand, CrearProgramaAuspicioDTO } from '../commands/CrearProgramaAuspicioCommand';
import { IProgramaAuspicioRepository } from '../../domain/repositories/IProgramaAuspicioRepository';

export class ProgramaAuspicioHandler {
  constructor(private readonly repository: IProgramaAuspicioRepository) {}

  async handleCrearPrograma(dto: CrearProgramaAuspicioDTO) {
    const command = new CrearProgramaAuspicioCommand(this.repository);
    return await command.execute(dto);
  }
}

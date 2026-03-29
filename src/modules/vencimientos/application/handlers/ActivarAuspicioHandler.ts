import { ActivarAuspicioCommand, ActivarAuspicioDTO } from '../commands/ActivarAuspicioCommand';
import { ICupoComercialRepository } from '../../domain/repositories/ICupoComercialRepository';

export class ActivarAuspicioHandler {
  constructor(private readonly cupoRepository: ICupoComercialRepository) {}

  async handle(dto: ActivarAuspicioDTO) {
    const command = new ActivarAuspicioCommand(this.cupoRepository);
    return await command.execute(dto);
  }
}

import { ObtenerDisponibilidadCuposQuery, ObtenerDisponibilidadCuposDTO } from '../queries/ObtenerDisponibilidadCuposQuery';
import { IEmisoraRepository } from '../../domain/repositories/IEmisoraRepository';

export class DisponibilidadHandler {
  constructor(private readonly emisoraRepository: IEmisoraRepository) {}

  async handleQuery(dto: ObtenerDisponibilidadCuposDTO) {
    const query = new ObtenerDisponibilidadCuposQuery(this.emisoraRepository);
    return await query.execute(dto);
  }
}

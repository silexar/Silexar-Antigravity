export interface ObtenerDisponibilidadCuposDTO {
  programaId: string;
  franjaHoraria: string;
}

import type { IEmisoraRepository } from '../../domain/repositories/IEmisoraRepository';

export class ObtenerDisponibilidadCuposQuery {
  constructor(private readonly repo: IEmisoraRepository) {}

  async execute(_dto: ObtenerDisponibilidadCuposDTO) {
    return this.repo.findAll();
  }
}

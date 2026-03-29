import { TipoPropiedad } from '../../domain/entities/TipoPropiedad';
import { ITipoPropiedadRepository, FiltrosBusquedaTipos } from '../../domain/repositories/IRepositories';

export class ObtenerTiposPropiedadQuery {
  constructor(private readonly repository: ITipoPropiedadRepository) {}

  async execute(filtros?: FiltrosBusquedaTipos): Promise<TipoPropiedad[]> {
    return this.repository.findAll(filtros);
  }
}

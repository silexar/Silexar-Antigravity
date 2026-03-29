import { ValorPropiedad } from '../../domain/entities/ValorPropiedad';
import { IValorPropiedadRepository, FiltrosValoresPropiedad } from '../../domain/repositories/IRepositories';

export class BuscarValoresPropiedadQuery {
  constructor(private readonly repository: IValorPropiedadRepository) {}

  async execute(filtros?: FiltrosValoresPropiedad): Promise<ValorPropiedad[]> {
    return this.repository.findAll(filtros);
  }
}

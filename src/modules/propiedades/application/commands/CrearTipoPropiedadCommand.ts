import { CrearTipoPropiedadProps, TipoPropiedad } from '../../domain/entities/TipoPropiedad';
import { ITipoPropiedadRepository } from '../../domain/repositories/IRepositories';
import { CodigoPropiedad } from '../../domain/value-objects/TiposBase';

export class CrearTipoPropiedadCommand {
  constructor(private readonly repository: ITipoPropiedadRepository) {}

  async execute(codigo: CodigoPropiedad, props: CrearTipoPropiedadProps): Promise<TipoPropiedad> {
    const existe = await this.repository.findByCodigo(codigo);
    if (existe) {
      throw new Error(`El código de propiedad ${codigo} ya está en uso.`);
    }

    const entidad = TipoPropiedad.create(codigo, props);
    await this.repository.save(entidad);
    
    return entidad;
  }
}

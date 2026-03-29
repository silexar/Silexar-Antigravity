import { CrearValorPropiedadProps, ValorPropiedad } from '../../domain/entities/ValorPropiedad';
import { ITipoPropiedadRepository, IValorPropiedadRepository } from '../../domain/repositories/IRepositories';

export class CrearValorPropiedadCommand {
  constructor(
    private readonly tipoRepo: ITipoPropiedadRepository,
    private readonly valorRepo: IValorPropiedadRepository
  ) {}

  async execute(tipoPropiedadId: string, props: CrearValorPropiedadProps): Promise<ValorPropiedad> {
    // Validar existencia del tipo
    const tipo = await this.tipoRepo.findById(tipoPropiedadId);
    if (!tipo) {
      throw new Error(`Tipo de propiedad con ID ${tipoPropiedadId} no encontrado.`);
    }

    // Validar exclusividad del código ref
    const existeCodigo = await this.valorRepo.findByTipoAndCodigoRef(tipoPropiedadId, props.codigoRef);
    if (existeCodigo) {
      throw new Error(`El código ref ${props.codigoRef} ya existe para este tipo de propiedad.`);
    }

    // El dominio valida el resto (Zod en create)
    const entidad = ValorPropiedad.create(tipoPropiedadId, props);
    await this.valorRepo.save(entidad);
    
    return entidad;
  }
}

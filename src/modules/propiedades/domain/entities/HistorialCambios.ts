import { Entity } from '../../../../core/domain/Entity';
import { Result } from '../../../../core/domain/Result';

type HistorialCambiosProps = {
  entidadId: string;      // ID de TipoPropiedad o ValorPropiedad
  tipoEntidad: 'TIPO_PROPIEDAD' | 'VALOR_PROPIEDAD';
  campoModificado: string;
  valorAnterior: string | null;
  valorNuevo: string;
  fechaCambio: Date;
  usuarioId: string;
  motivoCambio?: string;
};

export class HistorialCambios extends Entity<HistorialCambiosProps> {
  // getters omitidos por brevedad
  
  private constructor(props: HistorialCambiosProps, id: string) {
    super(props, id);
  }

  public static create(props: HistorialCambiosProps, id: string): Result<HistorialCambios> {
    return Result.ok(new HistorialCambios(props, id));
  }
}

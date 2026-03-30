import { Entity } from '../../../../core/domain/Entity';
import { Result } from '../../../../core/domain/Result';

export type JerarquiaPropiedadProps = {
  tipoPadreId: string;
  tipoHijoId: string;
  relacion: 'OBLIGATORIA' | 'OPCIONAL' | 'CONDICIONADA';
  nivelProfundidad: number;
};

export class JerarquiaPropiedad extends Entity<JerarquiaPropiedadProps> {
  get tipoPadreId() { return this.props.tipoPadreId; }
  get tipoHijoId() { return this.props.tipoHijoId; }
  get relacion() { return this.props.relacion; }

  private constructor(props: JerarquiaPropiedadProps, id: string) {
    super(props, id);
  }

  public static create(props: JerarquiaPropiedadProps, id: string): Result<JerarquiaPropiedad> {
    if (props.tipoPadreId === props.tipoHijoId) {
      return Result.fail({ code: 'CIRCULAR_DEPENDENCY', message: 'Una propiedad no puede ser hija de sí misma' });
    }
    return Result.ok(new JerarquiaPropiedad(props, id));
  }
}

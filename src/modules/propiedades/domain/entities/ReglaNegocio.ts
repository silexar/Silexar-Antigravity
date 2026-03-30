import { Entity } from '../../../../core/domain/Entity';
import { Result } from '../../../../core/domain/Result';

export type ReglaNegocioProps = {
  tipoPropiedadId: string;
  nombreRegla: string;
  condicionEvaluable: string; // Expresión lógica o ref a función
  accionRequerida: 'BLOQUEAR' | 'ADVERTIR' | 'AUTOMATIZAR';
  estado: 'ACTIVA' | 'INACTIVA';
  creadoPor: string;
};

export class ReglaNegocio extends Entity<ReglaNegocioProps> {
  get tipoPropiedadId() { return this.props.tipoPropiedadId; }
  get nombreRegla() { return this.props.nombreRegla; }
  get condicionEvaluable() { return this.props.condicionEvaluable; }
  get accionRequerida() { return this.props.accionRequerida; }
  get estado() { return this.props.estado; }

  private constructor(props: ReglaNegocioProps, id: string) {
    super(props, id);
  }

  public static create(props: ReglaNegocioProps, id: string): Result<ReglaNegocio> {
    if (!props.tipoPropiedadId || !props.nombreRegla || !props.condicionEvaluable) {
      return Result.fail({ code: 'INVALID_REGLA', message: 'Datos incompletos para crear regla de negocio' });
    }
    return Result.ok(new ReglaNegocio(props, id));
  }

  public desactivar(): void {
    this.props.estado = 'INACTIVA';
    // Opcional: _domainEvents.push(new ReglaDesactivadaEvent(...))
  }
}

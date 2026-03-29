import { Entity } from "./base/AggregateRoot";
import { AlertaUrgencia } from "../value-objects/AlertaUrgencia";

interface NotificacionDiscrepanciaProps {
  discrepanciaId: string;
  urgencia: AlertaUrgencia;
  stakeholders: string[]; // IDs de usuarios o emails
  enviada: boolean;
  fechaEnvio?: Date;
  mensaje: string;
}

export class NotificacionDiscrepancia extends Entity<NotificacionDiscrepanciaProps> {
  private constructor(props: NotificacionDiscrepanciaProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<NotificacionDiscrepanciaProps, 'enviada'>, id?: string): NotificacionDiscrepancia {
    return new NotificacionDiscrepancia({
      ...props,
      enviada: false
    }, id);
  }

  public marcarComoEnviada(): void {
    this.props.enviada = true;
    this.props.fechaEnvio = new Date();
  }
}

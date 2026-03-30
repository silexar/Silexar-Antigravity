import { Entity } from "./base/AggregateRoot";
import { RegistroEmisionProgramada } from "./RegistroEmisionProgramada";
import { RegistroEmisionReal } from "./RegistroEmisionReal";

interface ValidadorIntegridadProps {
  fechaEjecucion: Date;
  registrosProcesados: number;
  erroresDetectados: string[];
  alertas: string[];
}

export class ValidadorIntegridad extends Entity<ValidadorIntegridadProps> {
  private constructor(props: ValidadorIntegridadProps, id?: string) {
    super(props, id);
  }

  public static create(numeroRegistros: number, id?: string): ValidadorIntegridad {
    return new ValidadorIntegridad({
      fechaEjecucion: new Date(),
      registrosProcesados: numeroRegistros,
      erroresDetectados: [],
      alertas: []
    }, id);
  }

  public validarCoherencia(programados: RegistroEmisionProgramada[], reales: RegistroEmisionReal[]): void {
    if (reales.length > programados.length * 1.5) {
      this.props.alertas.push("Inconsistencia masiva detectada: más de 50% de sobre-emisión.");
    }
  }

  get isOk(): boolean {
    return this.props.erroresDetectados.length === 0;
  }
}

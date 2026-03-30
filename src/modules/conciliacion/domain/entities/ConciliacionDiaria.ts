import { AggregateRoot, DomainEvent } from "./base/AggregateRoot";
import { FechaConciliacion } from "../value-objects/FechaConciliacion";
import { EmisoraTarget } from "../value-objects/EmisoraTarget";
import { RegistroEmisionProgramada } from "./RegistroEmisionProgramada";
import { RegistroEmisionReal } from "./RegistroEmisionReal";
import { DiscrepanciaEmision } from "./DiscrepanciaEmision";
import { SpotNoEmitido } from "./SpotNoEmitido";

// Definimos un evento de dominio simple para la demostración
export class ConciliacionCompletadaEvent extends DomainEvent {
    constructor(public readonly conciliacionId: string, public readonly fecha: Date) {
        super();
    }
}

interface ConciliacionDiariaProps {
  fecha: FechaConciliacion;
  emisora: EmisoraTarget;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADA' | 'ERROR';
  registrosProgramados: RegistroEmisionProgramada[];
  registrosReales: RegistroEmisionReal[];
  discrepancias: DiscrepanciaEmision[];
  spotsNoEmitidos: SpotNoEmitido[];
  fechaActualizacion: Date;
}

export class ConciliacionDiaria extends AggregateRoot<ConciliacionDiariaProps> {
  
  private constructor(props: ConciliacionDiariaProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<ConciliacionDiariaProps, 'estado' | 'discrepancias' | 'spotsNoEmitidos' | 'fechaActualizacion'>, id?: string): ConciliacionDiaria {
    return new ConciliacionDiaria({
      ...props,
      estado: 'PENDIENTE',
      discrepancias: [],
      spotsNoEmitidos: [],
      fechaActualizacion: new Date()
    }, id);
  }

  public iniciarProcesamiento(): void {
      if (this.props.estado === 'COMPLETADA') {
          throw new Error("La conciliación ya fue completada");
      }
      this.props.estado = 'PROCESANDO';
      this.props.fechaActualizacion = new Date();
  }

  public finalizarProcesamiento(discrepancias: DiscrepanciaEmision[], spotsNoEmitidos: SpotNoEmitido[]): void {
      if (this.props.estado !== 'PROCESANDO') {
          throw new Error("Debe estar en procesamiento para finalizar");
      }
      
      this.props.discrepancias = discrepancias;
      this.props.spotsNoEmitidos = spotsNoEmitidos;
      this.props.estado = 'COMPLETADA';
      this.props.fechaActualizacion = new Date();
      
      // Agregar evento de dominio
      this.addDomainEvent(new ConciliacionCompletadaEvent(this.id, new Date()));
  }

  // Getters y métricas
  public get porcentajeCumplimiento(): number {
      if (this.props.registrosProgramados.length === 0) return 0;
      
      const emitidos = this.props.registrosProgramados.length - this.props.spotsNoEmitidos.length;
      return (emitidos / this.props.registrosProgramados.length) * 100;
  }

  get fecha(): FechaConciliacion { return this.props.fecha; }
  get emisora(): EmisoraTarget { return this.props.emisora; }
  get estado(): string { return this.props.estado; }
  get discrepancias(): DiscrepanciaEmision[] { return this.props.discrepancias; }
  get spotsNoEmitidos(): SpotNoEmitido[] { return this.props.spotsNoEmitidos; }
}

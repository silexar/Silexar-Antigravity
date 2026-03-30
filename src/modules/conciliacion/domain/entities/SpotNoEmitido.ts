import { Entity } from "./base/AggregateRoot";
import { CodigoSP } from "../value-objects/CodigoSP";
import { EmisoraTarget } from "../value-objects/EmisoraTarget";
import { EstadoEmision } from "../value-objects/EstadoEmision";
import { RegistroEmisionProgramada } from "./RegistroEmisionProgramada";

export type EstadoDecisionRecuperacion = 
  | 'PENDIENTE_TRAFICO' 
  | 'CONSULTA_ENVIADA_A_VENTAS' 
  | 'RECUPERACION_APROBADA' 
  | 'CAMPANA_FINALIZADA' 
  | 'DESCARTADO';

interface SpotNoEmitidoProps {
  registroProgramado: RegistroEmisionProgramada;
  emisora: EmisoraTarget;
  estado: EstadoEmision;
  valorRecuperado: number;
  notasRecuperacion?: string;
  // Puente Tráfico-Ventas
  ejecutivoVentaId: string;
  ejecutivoVentaNombre: string;
  estadoDecision: EstadoDecisionRecuperacion;
  instruccionesVenta?: string;
  // Excelencia Operativa TIER 0
  materialCargado: boolean;
  ultimoBloqueSugerido?: string;
}


export class SpotNoEmitido extends Entity<SpotNoEmitidoProps> {
  
  private constructor(props: SpotNoEmitidoProps, id?: string) {
    super(props, id);
  }

  public static create(props: SpotNoEmitidoProps, id?: string): SpotNoEmitido {
    return new SpotNoEmitido({
      ...props,
      valorRecuperado: props.valorRecuperado ?? 0,
      materialCargado: props.materialCargado ?? true // Default to true for Tier 0
    }, id);
  }

  public marcarRecuperadoAutomatico(): void {
    this.props.estado = EstadoEmision.create('RECUPERADO_AUTO');
    this.props.valorRecuperado = this.props.registroProgramado.valorComercial;
  }

  public marcarPendienteManual(): void {
    this.props.estado = EstadoEmision.create('PENDIENTE_MANUAL');
  }

  public registrarConsultaVentas(): void {
    this.props.estadoDecision = 'CONSULTA_ENVIADA_A_VENTAS';
  }

  public registrarDecisionVentas(esAprobado: boolean, instrucciones: string): void {
    this.props.estadoDecision = esAprobado ? 'RECUPERACION_APROBADA' : 'DESCARTADO';
    this.props.instruccionesVenta = instrucciones;
  }

  public marcarMaterialFaltante(): void {
      this.props.materialCargado = false;
  }

  public sugerirBloqueRecuperacion(bloque: string): void {
      this.props.ultimoBloqueSugerido = bloque;
  }

  get codigoSP(): CodigoSP { return this.props.registroProgramado.codigoSP; }
  get emisora(): EmisoraTarget { return this.props.emisora; }
  get estado(): EstadoEmision { return this.props.estado; }
  get ejecutivoVentaId(): string { return this.props.ejecutivoVentaId; }
  get ejecutivoVentaNombre(): string { return this.props.ejecutivoVentaNombre; }
  get estadoDecision(): EstadoDecisionRecuperacion { return this.props.estadoDecision; }
}


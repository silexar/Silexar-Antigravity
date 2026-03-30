/**
 * ENTIDAD COMISION VENDEDOR - TIER 0 ENTERPRISE
 * 
 * @description Registro y cálculo de comisiones individuales, bonuses y SPIFFs.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */


export enum TipoComision {
  VENTA_DIRECTA = 'VENTA_DIRECTA',
  RENOVACION = 'RENOVACION',
  UPSELL = 'UPSELL',
  SPIFF = 'SPIFF', // Concurso/Bono especial
  BONO_TRIMESTRAL = 'BONO_TRIMESTRAL',
  BONO_ANUAL = 'BONO_ANUAL'
}

export enum EstadoComision {
  PENDIENTE = 'PENDIENTE', // Calculada pero no aprobada
  APROBADA = 'APROBADA', // Lista para pago
  PAGADA = 'PAGADA', // Procesada en nómina
  CANCELADA = 'CANCELADA', // Por cancelación de venta o error
  RETENIDA = 'RETENIDA' // Disputa o auditoría
}

export interface ComisionVendedorProps {
  id: string;
  vendedorId: string;
  origenId?: string; // ContratoId, OrdenPautaId (si aplica)
  tipo: TipoComision;
  montoBase: number; // Monto sobre el cual se calcula
  porcentajeAplicado: number; // % comisión
  montoComision: number; // Valor final
  moneda: string;
  fechaCalculo: Date;
  fechaAprobacion?: Date;
  fechaPagoEstimada: Date;
  estado: EstadoComision;
  detalles: string;
  metadata: Record<string, unknown>;
}

export class ComisionVendedor {
  private constructor(private props: ComisionVendedorProps) {
    this.validate();
  }

  public static create(props: Omit<ComisionVendedorProps, 'id' | 'fechaCalculo' | 'estado'>): ComisionVendedor {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    
    return new ComisionVendedor({
      ...props,
      id,
      estado: EstadoComision.PENDIENTE,
      fechaCalculo: new Date(),
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: ComisionVendedorProps): ComisionVendedor {
    return new ComisionVendedor(props);
  }

  private validate(): void {
    if (this.props.montoComision < 0) throw new Error('Comisión negativa no permitida');
    if (this.props.porcentajeAplicado < 0) throw new Error('Porcentaje negativo no permitido');
  }

  // Getters
  get id(): string { return this.props.id; }
  get estado(): EstadoComision { return this.props.estado; }
  get monto(): number { return this.props.montoComision; }

  // Métodos de Dominio
  public aprobar(aprobadorId: string): void {
    if (this.props.estado !== EstadoComision.PENDIENTE) throw new Error('Solo comisiones pendientes pueden aprobarse');
    this.props.estado = EstadoComision.APROBADA;
    this.props.fechaAprobacion = new Date();
    this.props.metadata['aprobadoPor'] = aprobadorId;
  }

  public marcarPagada(referenciaPago: string): void {
    this.props.estado = EstadoComision.PAGADA;
    this.props.metadata['referenciaPago'] = referenciaPago;
  }

  public cancelar(motivo: string): void {
    this.props.estado = EstadoComision.CANCELADA;
    this.props.metadata['motivoCancelacion'] = motivo;
  }

  public toSnapshot(): ComisionVendedorProps {
    return { ...this.props };
  }
}

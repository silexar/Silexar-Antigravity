/**
 * ENTIDAD PROPUESTA COMERCIAL - TIER 0 ENTERPRISE
 * 
 * @description Gestión de propuestas comerciales y planes de medios
 * generados manual o automáticamente. Se valida contra inventario.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */


export enum EstadoPropuesta {
  BORRADOR = 'BORRADOR',
  GENERADA = 'GENERADA',
  ENVIADA = 'ENVIADA',
  VISTA = 'VISTA',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
  VENCIDA = 'VENCIDA'
}

export interface LineaPropuesta {
  inventarioId?: string; // Si es spot específico
  tipoFranja: string;
  cantidad: number;
  precioUnitario: number;
  descuentoAplicado: number;
  totalLinea: number;
}

export interface PropuestaComercialProps {
  id: string;
  numeroPropuesta: string; // PROP-2025-001
  anuncianteId: string;
  vendedorId: string;
  nombreCampaña: string;
  presupuestoTotal: number; // Presupuesto objetivo del cliente
  valorTotalPropuesta: number; // Valor real calculado
  moneda: string;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  estado: EstadoPropuesta;
  lineas: LineaPropuesta[];
  observaciones?: string;
  linkDescargaPdf?: string;
  version: number;
  metadata: Record<string, unknown>;
}

export class PropuestaComercial {
  private constructor(private props: PropuestaComercialProps) {
    this.validate();
  }

  public static create(props: Omit<PropuestaComercialProps, 'id' | 'fechaCreacion' | 'estado' | 'version' | 'valorTotalPropuesta'>): PropuestaComercial {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    const fecha = new Date();
    
    // Calcular valor total inicial
    const total = props.lineas.reduce((sum, linea) => sum + linea.totalLinea, 0);

    return new PropuestaComercial({
      ...props,
      id,
      estado: EstadoPropuesta.BORRADOR,
      fechaCreacion: fecha,
      version: 1,
      valorTotalPropuesta: total,
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: PropuestaComercialProps): PropuestaComercial {
    return new PropuestaComercial(props);
  }

  private validate(): void {
    if (this.props.lineas.length === 0) throw new Error('Propuesta debe tener al menos una línea');
    if (this.props.presupuestoTotal < 0) throw new Error('Presupuesto inválido');
  }

  // Getters
  get id(): string { return this.props.id; }
  get estado(): EstadoPropuesta { return this.props.estado; }
  get total(): number { return this.props.valorTotalPropuesta; }
  get esVencida(): boolean { return new Date() > this.props.fechaVencimiento; }

  // Métodos de Dominio
  public enviarPropuesta(): void {
    if (this.esVencida) throw new Error('No se puede enviar una propuesta vencida');
    this.props.estado = EstadoPropuesta.ENVIADA;
    // Podría disparar evento de dominio EmailSent o WhatsAppSent
  }

  public marcarComoVista(): void {
    if (this.props.estado === EstadoPropuesta.ENVIADA) {
      this.props.estado = EstadoPropuesta.VISTA;
    }
  }

  public aceptarPropuesta(): void {
    if (this.esVencida) throw new Error('Propuesta vencida');
    this.props.estado = EstadoPropuesta.ACEPTADA;
    // Aquí debería disparar evento para crear Contrato / OrdenPauta
  }

  public rechazarPropuesta(motivo: string): void {
    this.props.estado = EstadoPropuesta.RECHAZADA;
    this.props.metadata['motivoRechazo'] = motivo;
  }

  public regenerarVersion(nuevasLineas: LineaPropuesta[]): void {
    this.props.version += 1;
    this.props.lineas = nuevasLineas;
    this.props.valorTotalPropuesta = nuevasLineas.reduce((sum, linea) => sum + linea.totalLinea, 0);
    this.props.estado = EstadoPropuesta.GENERADA; // Resetea estado
  }

  public toSnapshot(): PropuestaComercialProps {
    return { ...this.props };
  }
}

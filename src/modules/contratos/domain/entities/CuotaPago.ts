/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Entidad: CuotaPago
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

// Estado enums definidos localmente para evitar dependencias circulares
export enum EstadoCuota {
  ACTIVO = 'activo',
  PENDIENTE = 'pendiente',
  COMPLETADO = 'completado',
  VENCIDO = 'vencido',
  CANCELADO = 'cancelado'
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  CHEQUE = 'cheque',
  TARJETA_CREDITO = 'tarjeta_credito',
  TARJETA_DEBITO = 'tarjeta_debito',
  CRIPTOMONEDA = 'criptomoneda'
}

export interface CuotaPagoProps {
  id?: string;
  numero: number;
  monto: number;
  fechaVencimiento: Date;
  estado: EstadoCuota;
  metodoPago?: MetodoPago;
  fechaPago?: Date;
  montoPagado?: number;
  interesesMora?: number;
  diasMora?: number;
  planPagosId: string;
  observaciones?: string;
  comprobantePago?: string;
}

export class CuotaPago {
  private _id: string;
  private _numero: number;
  private _monto: number;
  private _fechaVencimiento: Date;
  private _estado: EstadoCuota;
  private _metodoPago?: MetodoPago;
  private _fechaPago?: Date;
  private _montoPagado?: number;
  private _interesesMora: number;
  private _diasMora: number;
  private _planPagosId: string;
  private _observaciones?: string;
  private _comprobantePago?: string;

  // Configuración empresarial Fortune 10
  private static readonly TASA_INTERES_MORA_DIARIA = 0.001; // 0.1% diario
  private static readonly DIAS_GRACIA = 5;
  private static readonly MONTO_MINIMO_CUOTA = 100;

  constructor(props: CuotaPagoProps) {
    this.validarPropiedades(props);
    
    this._id = props.id || this.generarId();
    this._numero = props.numero;
    this._monto = props.monto;
    this._fechaVencimiento = props.fechaVencimiento;
    this._estado = props.estado;
    this._metodoPago = props.metodoPago;
    this._fechaPago = props.fechaPago;
    this._montoPagado = props.montoPagado || 0;
    this._interesesMora = props.interesesMora || 0;
    this._diasMora = props.diasMora || 0;
    this._planPagosId = props.planPagosId;
    this._observaciones = props.observaciones;
    this._comprobantePago = props.comprobantePago;

    this.calcularMoraAutomatica();
  }

  static create(props: Omit<CuotaPagoProps, 'id' | 'estado'>): CuotaPago {
    return new CuotaPago({
      ...props,
      estado: EstadoCuota.ACTIVO
    });
  }

  // Getters
  get id(): string { return this._id; }
  get numero(): number { return this._numero; }
  get monto(): number { return this._monto; }
  get fechaVencimiento(): Date { return this._fechaVencimiento; }
  get estado(): EstadoCuota { return this._estado; }
  get metodoPago(): MetodoPago | undefined { return this._metodoPago; }
  get fechaPago(): Date | undefined { return this._fechaPago; }
  get montoPagado(): number { return this._montoPagado || 0; }
  get interesesMora(): number { return this._interesesMora; }
  get diasMora(): number { return this._diasMora; }
  get planPagosId(): string { return this._planPagosId; }
  get observaciones(): string | undefined { return this._observaciones; }
  get comprobantePago(): string | undefined { return this._comprobantePago; }

  /**
   * Calcula automáticamente los intereses por mora
   */
  private calcularMoraAutomatica(): void {
    const hoy = new Date();
    const diasVencimiento = Math.floor((hoy.getTime() - this._fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasVencimiento > CuotaPago.DIAS_GRACIA && !this.estaPagada()) {
      this._diasMora = diasVencimiento - CuotaPago.DIAS_GRACIA;
      this._interesesMora = this._monto * CuotaPago.TASA_INTERES_MORA_DIARIA * this._diasMora;
      
      // Actualizar estado a vencido si corresponde
      if (this._estado === EstadoCuota.ACTIVO || this._estado === EstadoCuota.PENDIENTE) {
        this._estado = EstadoCuota.VENCIDO;
      }
    }
  }

  /**
   * Registra el pago de la cuota
   */
  registrarPago(
    montoPagado: number,
    metodoPago: MetodoPago,
    comprobantePago?: string,
    observaciones?: string
  ): void {
    this.validarPago(montoPagado);

    this._montoPagado = montoPagado;
    this._metodoPago = metodoPago;
    this._fechaPago = new Date();
    this._comprobantePago = comprobantePago;
    
    if (observaciones) {
      this._observaciones = observaciones;
    }

    // Actualizar estado según el monto pagado
    if (montoPagado >= this.getMontoTotal()) {
      this._estado = EstadoCuota.COMPLETADO;
    } else {
      this._observaciones = `${this._observaciones || ''} - Pago parcial: $${montoPagado}`;
    }
  }

  /**
   * Obtiene el monto total incluyendo intereses de mora
   */
  getMontoTotal(): number {
    return this._monto + this._interesesMora;
  }

  /**
   * Obtiene el saldo pendiente
   */
  getSaldoPendiente(): number {
    return Math.max(0, this.getMontoTotal() - (this._montoPagado || 0));
  }

  /**
   * Verifica si la cuota está completamente pagada
   */
  estaPagada(): boolean {
    return this._estado === EstadoCuota.COMPLETADO;
  }

  /**
   * Verifica si la cuota está vencida
   */
  estaVencida(): boolean {
    return this._estado === EstadoCuota.VENCIDO;
  }

  /**
   * Verifica si la cuota está próxima a vencer
   */
  estaProximaAVencer(diasAnticipacion: number = 7): boolean {
    const hoy = new Date();
    const diasHastaVencimiento = Math.floor((this._fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasHastaVencimiento <= diasAnticipacion && diasHastaVencimiento > 0;
  }

  /**
   * Aplica un descuento por pronto pago
   */
  aplicarDescuentoProntoPago(porcentajeDescuento: number): void {
    if (porcentajeDescuento < 0 || porcentajeDescuento > 100) {
      throw new Error('El porcentaje de descuento debe estar entre 0 y 100');
    }

    if (this.estaPagada()) {
      throw new Error('No se puede aplicar descuento a una cuota ya pagada');
    }

    const descuento = this._monto * (porcentajeDescuento / 100);
    this._monto = this._monto - descuento;
    this._observaciones = `${this._observaciones || ''} - Descuento pronto pago: ${porcentajeDescuento}%`;
  }

  /**
   * Genera un plan de refinanciamiento
   */
  generarPlanRefinanciamiento(nuevasCuotas: number): CuotaPago[] {
    if (this.estaPagada()) {
      throw new Error('No se puede refinanciar una cuota ya pagada');
    }

    const montoARefinanciar = this.getMontoTotal();
    const montoPorCuota = montoARefinanciar / nuevasCuotas;
    const cuotasRefinanciadas: CuotaPago[] = [];

    for (let i = 1; i <= nuevasCuotas; i++) {
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      cuotasRefinanciadas.push(CuotaPago.create({
        numero: this._numero + (i - 1) * 0.1, // Numeración decimal para refinanciamiento
        monto: montoPorCuota,
        fechaVencimiento,
        planPagosId: this._planPagosId,
        observaciones: `Refinanciamiento de cuota ${this._numero}`
      }));
    }

    // Marcar la cuota original como cancelada
    this._estado = EstadoCuota.CANCELADO;

    return cuotasRefinanciadas;
  }

  /**
   * Validaciones de negocio
   */
  private validarPropiedades(props: CuotaPagoProps): void {
    if (props.numero <= 0) {
      throw new Error('El número de cuota debe ser mayor a 0');
    }

    if (props.monto < CuotaPago.MONTO_MINIMO_CUOTA) {
      throw new Error(`El monto mínimo de cuota es $${CuotaPago.MONTO_MINIMO_CUOTA}`);
    }

    if (props.fechaVencimiento < new Date('2020-01-01')) {
      throw new Error('La fecha de vencimiento no puede ser anterior a 2020');
    }

    if (!props.planPagosId) {
      throw new Error('El ID del plan de pagos es requerido');
    }
  }

  private validarPago(montoPagado: number): void {
    if (montoPagado <= 0) {
      throw new Error('El monto pagado debe ser mayor a 0');
    }

    if (this.estaPagada()) {
      throw new Error('La cuota ya está pagada');
    }

    if (montoPagado > this.getMontoTotal() * 1.1) { // Permitir 10% de tolerancia
      throw new Error('El monto pagado excede significativamente el monto adeudado');
    }
  }

  private generarId(): string {
    return `cuota_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serialización para persistencia
   */
  toSnapshot(): Record<string, unknown> {
    return {
      id: this._id,
      numero: this._numero,
      monto: this._monto,
      fechaVencimiento: this._fechaVencimiento.toISOString(),
      estado: this._estado,
      metodoPago: this._metodoPago,
      fechaPago: this._fechaPago?.toISOString(),
      montoPagado: this._montoPagado,
      interesesMora: this._interesesMora,
      diasMora: this._diasMora,
      planPagosId: this._planPagosId,
      observaciones: this._observaciones,
      comprobantePago: this._comprobantePago
    };
  }

  static fromSnapshot(snapshot: Record<string, unknown>): CuotaPago {
    return new CuotaPago({
      id: snapshot.id as string,
      numero: snapshot.numero as number,
      monto: snapshot.monto as number,
      fechaVencimiento: new Date(snapshot.fechaVencimiento as string),
      estado: snapshot.estado as EstadoCuota,
      metodoPago: snapshot.metodoPago as MetodoPago | undefined,
      fechaPago: snapshot.fechaPago ? new Date(snapshot.fechaPago as string) : undefined,
      montoPagado: snapshot.montoPagado as number | undefined,
      interesesMora: snapshot.interesesMora as number | undefined,
      diasMora: snapshot.diasMora as number | undefined,
      planPagosId: snapshot.planPagosId as string,
      observaciones: snapshot.observaciones as string | undefined,
      comprobantePago: snapshot.comprobantePago as string | undefined
    });
  }
}
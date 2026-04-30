import { z } from 'zod';

export const TipoDocumentoTributarioEnum = z.enum([
  'factura_electronica',
  'factura_exenta',
  'boleta_electronica',
  'nota_credito',
  'nota_debito',
  'guia_despacho',
]);
export type TipoDocumentoTributario = z.infer<typeof TipoDocumentoTributarioEnum>;

export const EstadoFacturaEnum = z.enum([
  'borrador', 'emitida', 'enviada', 'aceptada_sii', 'rechazada_sii',
  'pagada', 'parcialmente_pagada', 'vencida', 'anulada'
]);
export type EstadoFactura = z.infer<typeof EstadoFacturaEnum>;

export const FormaPagoEnum = z.enum([
  'contado', 'credito_30', 'credito_45', 'credito_60', 'credito_90'
]);
export type FormaPago = z.infer<typeof FormaPagoEnum>;

export const FacturaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  numeroFactura: z.number().int().positive(),
  folio: z.number().int().positive().nullable(),
  tipoDocumento: TipoDocumentoTributarioEnum,
  codigoSii: z.number().int().default(33),
  anuncianteId: z.string().uuid().nullable(),
  agenciaId: z.string().uuid().nullable(),
  contratoId: z.string().uuid().nullable(),
  receptorRut: z.string().min(1).max(12),
  receptorRazonSocial: z.string().min(1).max(255),
  receptorGiro: z.string().max(500).nullable(),
  receptorDireccion: z.string().max(500).nullable(),
  receptorCiudad: z.string().max(100).nullable(),
  receptorComuna: z.string().max(100).nullable(),
  fechaEmision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaVencimientos: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  montoNeto: z.number().positive(),
  montoExento: z.number().min(0).default(0),
  tasaIva: z.number().min(0).max(100).default(19),
  montoIva: z.number().min(0),
  montoTotal: z.number().positive(),
  moneda: z.string().max(3).default('CLP'),
  formaPago: FormaPagoEnum,
  estado: EstadoFacturaEnum,
  montoPagado: z.number().min(0).default(0),
  fechaPago: z.date().nullable(),
  saldoPendiente: z.number().min(0).nullable(),
  facturaReferenciaId: z.string().uuid().nullable(),
  motivoReferencia: z.string().nullable(),
  observaciones: z.string().nullable(),
  anulada: z.boolean().default(false),
  fechaAnulacion: z.date().nullable(),
  creadoPorId: z.string().uuid(),
  fechaCreacion: z.date(),
  modificadoPorId: z.string().uuid().nullable(),
  fechaModificacion: z.date().nullable(),
});

export type FacturaProps = z.infer<typeof FacturaSchema>;

export class Factura {
  private constructor(private props: FacturaProps) {
    this.validate();
  }

  static create(
    props: Omit<FacturaProps, 'id' | 'numeroFactura' | 'fechaCreacion' | 'fechaModificacion' | 'fechaAnulacion' | 'fechaPago' | 'montoPagado' | 'saldoPendiente' | 'anulada' | 'modificadoPorId' | 'montoIva' | 'montoTotal' | 'estado' | 'moneda'> & { id?: string; numeroFactura?: number; montoIva?: number; montoTotal?: number; estado?: FacturaProps['estado']; moneda?: FacturaProps['moneda'] }
  ): Factura {
    const iva = Math.round(props.montoNeto * ((props.tasaIva ?? 19) / 100));
    const total = props.montoNeto + (props.montoExento ?? 0) + iva;
    return new Factura({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      numeroFactura: props.numeroFactura ?? 0,
      montoIva: props.montoIva ?? iva,
      montoTotal: props.montoTotal ?? total,
      estado: props.estado ?? 'borrador',
      moneda: props.moneda ?? 'CLP',
      montoPagado: 0,
      saldoPendiente: props.montoTotal ?? total,
      fechaPago: null,
      anulada: false,
      fechaAnulacion: null,
      fechaCreacion: new Date(),
      fechaModificacion: null,
      modificadoPorId: null,
    });
  }

  static reconstitute(props: FacturaProps): Factura {
    return new Factura(props);
  }

  private validate(): void {
    const result = FacturaSchema.safeParse(this.props);
    if (!result.success) {
      throw new Error(`Factura inválida: ${result.error.message}`);
    }
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get numeroFactura(): number { return this.props.numeroFactura; }
  set numeroFactura(value: number) { this.props.numeroFactura = value; }
  get folio(): number | null { return this.props.folio; }
  get tipoDocumento(): TipoDocumentoTributario { return this.props.tipoDocumento; }
  get codigoSii(): number { return this.props.codigoSii; }
  get anuncianteId(): string | null { return this.props.anuncianteId; }
  get agenciaId(): string | null { return this.props.agenciaId; }
  get contratoId(): string | null { return this.props.contratoId; }
  get receptorRut(): string { return this.props.receptorRut; }
  get receptorRazonSocial(): string { return this.props.receptorRazonSocial; }
  get receptorGiro(): string | null { return this.props.receptorGiro; }
  get receptorDireccion(): string | null { return this.props.receptorDireccion; }
  get receptorCiudad(): string | null { return this.props.receptorCiudad; }
  get receptorComuna(): string | null { return this.props.receptorComuna; }
  get fechaEmision(): string { return this.props.fechaEmision; }
  get fechaVencimientos(): string | null { return this.props.fechaVencimientos; }
  get montoNeto(): number { return this.props.montoNeto; }
  get montoExento(): number { return this.props.montoExento; }
  get tasaIva(): number { return this.props.tasaIva; }
  get montoIva(): number { return this.props.montoIva; }
  get montoTotal(): number { return this.props.montoTotal; }
  get moneda(): string { return this.props.moneda; }
  get formaPago(): FormaPago { return this.props.formaPago; }
  get estado(): EstadoFactura { return this.props.estado; }
  get montoPagado(): number { return this.props.montoPagado; }
  get saldoPendiente(): number | null { return this.props.saldoPendiente; }
  get observaciones(): string | null { return this.props.observaciones; }
  get anulada(): boolean { return this.props.anulada; }
  get creadoPorId(): string { return this.props.creadoPorId; }
  get fechaCreacion(): Date { return this.props.fechaCreacion; }

  emitir(): void {
    if (this.props.estado !== 'borrador') {
      throw new Error('Solo se pueden emitir facturas en borrador');
    }
    this.props.estado = 'emitida';
    this.props.fechaModificacion = new Date();
  }

  anular(): void {
    if (this.props.anulada) {
      throw new Error('La factura ya está anulada');
    }
    this.props.anulada = true;
    this.props.estado = 'anulada';
    this.props.fechaAnulacion = new Date();
    this.props.saldoPendiente = 0;
  }

  registrarPago(monto: number): void {
    if (monto <= 0) throw new Error('El monto debe ser mayor a 0');
    this.props.montoPagado += monto;
    this.props.saldoPendiente = Math.max(0, (this.props.montoTotal - this.props.montoPagado));
    this.props.fechaPago = new Date();
    if (this.props.saldoPendiente === 0) {
      this.props.estado = 'pagada';
    } else if (this.props.montoPagado > 0) {
      this.props.estado = 'parcialmente_pagada';
    }
  }

  toJSON(): FacturaProps {
    return { ...this.props };
  }
}

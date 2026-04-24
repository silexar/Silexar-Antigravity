import { logger } from "@/lib/observability";
/**
 * 💰 SILEXAR PULSE - Cuenta Corriente Service TIER 0
 *
 * @description Servicio para gestión de cuenta corriente de contratos:
 * - Apertura automática de cuenta al crear contrato
 * - Registro de todos los movimientos
 * - Cálculo de saldos en tiempo real
 * - Generación de estado de cuenta profesional
 * - Envío por email en múltiples formatos
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoMovimiento =
  | "APERTURA_CUENTA"
  | "CARGO_FACTURA"
  | "CARGO_INTERES"
  | "CARGO_MORA"
  | "ABONO_PAGO"
  | "ABONO_TRANSFERENCIA"
  | "ABONO_EFECTIVO"
  | "ABONO_CHEQUE"
  | "CREDITO_NOTA_CREDITO"
  | "CREDITO_DESCUENTO"
  | "CREDITO_PROMOCION"
  | "DEBITO_NOTA_DEBITO"
  | "DEBITO_PENALIZACION"
  | "AJUSTE_POSITIVO"
  | "AJUSTE_NEGATIVO";

export type EstadoCuenta = "ACTIVA" | "CERRADA" | "MORATORIA" | "CASTIGADA";

export interface CuentaCorriente {
  id: string;
  contratoId: string;
  numeroContrato: string;
  fechaApertura: Date;

  // Cliente
  clienteId: string;
  clienteRut: string;
  clienteNombre: string;
  clienteEmail?: string;

  // Valores
  valorOriginalContrato: number;
  montoIVA: number;
  valorTotalContrato: number;

  // Saldos
  totalCargos: number;
  totalAbonos: number;
  totalCreditos: number;
  totalDebitos: number;
  totalAjustes: number;
  saldoPendiente: number;

  // Estado
  estado: EstadoCuenta;
  diasMoraActual: number;
  fechaUltimoMovimiento?: Date;
  fechaUltimoPago?: Date;

  // Movimientos
  movimientos: Movimiento[];
}

export interface Movimiento {
  id: string;
  numeroMovimiento: number;
  fechaMovimiento: Date;
  fechaValor: Date;
  tipoMovimiento: TipoMovimiento;

  // Documento
  documentoTipo?: string;
  documentoNumero?: string;
  documentoUrl?: string;

  // Montos
  montoBruto: number;
  montoIVA: number;
  montoRetencion: number;
  montoNeto: number;
  esCargo: boolean;

  // Saldos
  saldoAnterior: number;
  saldoPosterior: number;

  // Descripción
  concepto: string;
  detalleConcepto?: string;

  // Pago
  medioPago?: string;
  bancoOrigen?: string;
  numeroOperacion?: string;

  // Estado
  conciliado: boolean;
  anulado: boolean;
}

export interface EstadoCuentaGenerado {
  id: string;
  periodoDesde: Date;
  periodoHasta: Date;
  fechaGeneracion: Date;

  // Datos cuenta
  cuentaCorriente: CuentaCorriente;
  movimientosPeriodo: Movimiento[];

  // Resumen
  saldoInicial: number;
  saldoFinal: number;
  totalCargos: number;
  totalAbonos: number;
  cantidadMovimientos: number;

  // Documento
  formatoDocumento: "PDF" | "EXCEL" | "CSV";
  urlDocumento?: string;
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

class CuentaCorrienteEngine {
  private static instance: CuentaCorrienteEngine;
  private cuentas: Map<string, CuentaCorriente> = new Map();

  private constructor() {
    this.inicializarDemoData();
  }

  static getInstance(): CuentaCorrienteEngine {
    if (!this.instance) {
      this.instance = new CuentaCorrienteEngine();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // APERTURA DE CUENTA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Abre cuenta corriente automáticamente al aprobar contrato
   */
  abrirCuenta(params: {
    contratoId: string;
    numeroContrato: string;
    clienteId: string;
    clienteRut: string;
    clienteNombre: string;
    clienteEmail?: string;
    valorNeto: number;
    montoIVA: number;
    valorTotal: number;
    usuario: string;
  }): CuentaCorriente {
    const cuenta: CuentaCorriente = {
      id: `cc-${params.contratoId}`,
      contratoId: params.contratoId,
      numeroContrato: params.numeroContrato,
      fechaApertura: new Date(),
      clienteId: params.clienteId,
      clienteRut: params.clienteRut,
      clienteNombre: params.clienteNombre,
      clienteEmail: params.clienteEmail,
      valorOriginalContrato: params.valorNeto,
      montoIVA: params.montoIVA,
      valorTotalContrato: params.valorTotal,
      totalCargos: 0,
      totalAbonos: 0,
      totalCreditos: 0,
      totalDebitos: 0,
      totalAjustes: 0,
      saldoPendiente: 0,
      estado: "ACTIVA",
      diasMoraActual: 0,
      movimientos: [],
    };

    // Registrar movimiento de apertura
    this.registrarMovimiento(cuenta.id, {
      tipoMovimiento: "APERTURA_CUENTA",
      montoBruto: params.valorTotal,
      montoIVA: params.montoIVA,
      concepto:
        `Apertura de cuenta corriente - Contrato ${params.numeroContrato}`,
      detalleConcepto: `Valor neto: ${
        this.formatCurrency(params.valorNeto)
      } | IVA: ${this.formatCurrency(params.montoIVA)} | Total: ${
        this.formatCurrency(params.valorTotal)
      }`,
      usuario: params.usuario,
      usuarioNombre: params.usuario,
    });

    this.cuentas.set(cuenta.id, cuenta);
    return cuenta;
  }

  // ═══════════════════════════════════════════════════════════════
  // REGISTRO DE MOVIMIENTOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Registra un movimiento en la cuenta corriente
   */
  registrarMovimiento(cuentaId: string, params: {
    tipoMovimiento: TipoMovimiento;
    montoBruto: number;
    montoIVA?: number;
    montoRetencion?: number;
    documentoTipo?: string;
    documentoNumero?: string;
    documentoUrl?: string;
    concepto: string;
    detalleConcepto?: string;
    medioPago?: string;
    bancoOrigen?: string;
    numeroOperacion?: string;
    fechaValor?: Date;
    usuario: string;
    usuarioNombre: string;
  }): Movimiento {
    const cuenta = this.cuentas.get(cuentaId);
    if (!cuenta) throw new Error("Cuenta corriente no encontrada");

    const montoNeto = params.montoBruto + (params.montoIVA || 0) -
      (params.montoRetencion || 0);
    const esCargo = this.esMovimientoCargo(params.tipoMovimiento);
    const saldoAnterior = cuenta.saldoPendiente;

    // Calcular nuevo saldo
    const saldoPosterior = esCargo
      ? saldoAnterior + montoNeto
      : saldoAnterior - montoNeto;

    const movimiento: Movimiento = {
      id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      numeroMovimiento: cuenta.movimientos.length + 1,
      fechaMovimiento: new Date(),
      fechaValor: params.fechaValor || new Date(),
      tipoMovimiento: params.tipoMovimiento,
      documentoTipo: params.documentoTipo,
      documentoNumero: params.documentoNumero,
      documentoUrl: params.documentoUrl,
      montoBruto: params.montoBruto,
      montoIVA: params.montoIVA || 0,
      montoRetencion: params.montoRetencion || 0,
      montoNeto,
      esCargo,
      saldoAnterior,
      saldoPosterior,
      concepto: params.concepto,
      detalleConcepto: params.detalleConcepto,
      medioPago: params.medioPago,
      bancoOrigen: params.bancoOrigen,
      numeroOperacion: params.numeroOperacion,
      conciliado: false,
      anulado: false,
    };

    // Actualizar cuenta
    cuenta.movimientos.push(movimiento);
    cuenta.saldoPendiente = saldoPosterior;
    cuenta.fechaUltimoMovimiento = new Date();

    // Actualizar totales
    if (params.tipoMovimiento.startsWith("CARGO")) {
      cuenta.totalCargos += montoNeto;
    } else if (params.tipoMovimiento.startsWith("ABONO")) {
      cuenta.totalAbonos += montoNeto;
      cuenta.fechaUltimoPago = new Date();
    } else if (params.tipoMovimiento.startsWith("CREDITO")) {
      cuenta.totalCreditos += montoNeto;
    } else if (params.tipoMovimiento.startsWith("DEBITO")) {
      cuenta.totalDebitos += montoNeto;
    } else if (params.tipoMovimiento.startsWith("AJUSTE")) {
      cuenta.totalAjustes += esCargo ? montoNeto : -montoNeto;
    }

    return movimiento;
  }

  /**
   * Registra cargo por factura
   */
  registrarFactura(cuentaId: string, factura: {
    numero: string;
    folio: number;
    montoNeto: number;
    montoIVA: number;
    concepto: string;
    urlPDF?: string;
    usuario: string;
    usuarioNombre: string;
  }): Movimiento {
    return this.registrarMovimiento(cuentaId, {
      tipoMovimiento: "CARGO_FACTURA",
      montoBruto: factura.montoNeto,
      montoIVA: factura.montoIVA,
      documentoTipo: "FACTURA",
      documentoNumero: factura.numero,
      documentoUrl: factura.urlPDF,
      concepto: `Factura ${factura.numero} - ${factura.concepto}`,
      usuario: factura.usuario,
      usuarioNombre: factura.usuarioNombre,
    });
  }

  /**
   * Registra abono por pago
   */
  registrarPago(cuentaId: string, pago: {
    monto: number;
    medioPago: string;
    banco?: string;
    numeroOperacion?: string;
    concepto?: string;
    usuario: string;
    usuarioNombre: string;
  }): Movimiento {
    return this.registrarMovimiento(cuentaId, {
      tipoMovimiento: `ABONO_${pago.medioPago.toUpperCase()}` as TipoMovimiento,
      montoBruto: pago.monto,
      medioPago: pago.medioPago,
      bancoOrigen: pago.banco,
      numeroOperacion: pago.numeroOperacion,
      concepto: pago.concepto || `Pago recibido ${pago.medioPago}`,
      detalleConcepto: pago.numeroOperacion
        ? `Operación: ${pago.numeroOperacion}`
        : undefined,
      usuario: pago.usuario,
      usuarioNombre: pago.usuarioNombre,
    });
  }

  /**
   * Registra nota de crédito
   */
  registrarNotaCredito(cuentaId: string, nota: {
    numero: string;
    monto: number;
    montoIVA: number;
    motivo: string;
    urlPDF?: string;
    usuario: string;
    usuarioNombre: string;
  }): Movimiento {
    return this.registrarMovimiento(cuentaId, {
      tipoMovimiento: "CREDITO_NOTA_CREDITO",
      montoBruto: nota.monto,
      montoIVA: nota.montoIVA,
      documentoTipo: "NOTA_CREDITO",
      documentoNumero: nota.numero,
      documentoUrl: nota.urlPDF,
      concepto: `Nota de Crédito ${nota.numero}`,
      detalleConcepto: nota.motivo,
      usuario: nota.usuario,
      usuarioNombre: nota.usuarioNombre,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CONSULTAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene cuenta corriente por contrato
   */
  obtenerCuenta(contratoId: string): CuentaCorriente | undefined {
    return Array.from(this.cuentas.values()).find((c) =>
      c.contratoId === contratoId
    );
  }

  /**
   * Obtiene cuenta por ID
   */
  obtenerCuentaPorId(cuentaId: string): CuentaCorriente | undefined {
    return this.cuentas.get(cuentaId);
  }

  /**
   * Obtiene movimientos de un período
   */
  obtenerMovimientosPeriodo(
    cuentaId: string,
    desde: Date,
    hasta: Date,
  ): Movimiento[] {
    const cuenta = this.cuentas.get(cuentaId);
    if (!cuenta) return [];

    return cuenta.movimientos.filter((m) =>
      m.fechaMovimiento >= desde && m.fechaMovimiento <= hasta && !m.anulado
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ESTADO DE CUENTA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Genera estado de cuenta para un período
   */
  generarEstadoCuenta(
    cuentaId: string,
    desde: Date,
    hasta: Date,
  ): EstadoCuentaGenerado {
    const cuenta = this.cuentas.get(cuentaId);
    if (!cuenta) throw new Error("Cuenta no encontrada");

    const movimientosPeriodo = this.obtenerMovimientosPeriodo(
      cuentaId,
      desde,
      hasta,
    );

    // Calcular saldo inicial (suma de movimientos antes del período)
    const movimientosAnteriores = cuenta.movimientos.filter((m) =>
      m.fechaMovimiento < desde
    );
    const saldoInicial = movimientosAnteriores.length > 0
      ? movimientosAnteriores[movimientosAnteriores.length - 1].saldoPosterior
      : 0;

    // Calcular totales del período
    const totalCargos = movimientosPeriodo
      .filter((m) => m.esCargo)
      .reduce((acc, m) => acc + m.montoNeto, 0);

    const totalAbonos = movimientosPeriodo
      .filter((m) => !m.esCargo)
      .reduce((acc, m) => acc + m.montoNeto, 0);

    const saldoFinal = saldoInicial + totalCargos - totalAbonos;

    return {
      id: `ec-${Date.now()}`,
      periodoDesde: desde,
      periodoHasta: hasta,
      fechaGeneracion: new Date(),
      cuentaCorriente: cuenta,
      movimientosPeriodo,
      saldoInicial,
      saldoFinal,
      totalCargos,
      totalAbonos,
      cantidadMovimientos: movimientosPeriodo.length,
      formatoDocumento: "PDF",
    };
  }

  /**
   * Envía estado de cuenta por email
   */
  async enviarEstadoCuentaPorEmail(params: {
    cuentaId: string;
    desde: Date;
    hasta: Date;
    emailDestinatario: string;
    emailsCC?: string[];
    formato: "PDF" | "EXCEL" | "CSV";
    mensajePersonalizado?: string;
  }): Promise<{
    enviado: boolean;
    urlDocumento?: string;
    error?: string;
  }> {
    try {
      // Generar estado de cuenta
      const estadoCuenta = this.generarEstadoCuenta(
        params.cuentaId,
        params.desde,
        params.hasta,
      );

      // Simular generación de documento
      const urlDocumento =
        `/estados-cuenta/${estadoCuenta.id}.${params.formato.toLowerCase()}`;

      // Simular envío
      logger.info(
        `[CuentaCorriente] Enviando estado de cuenta a: ${params.emailDestinatario}`,
      );
      logger.info(`[CuentaCorriente] Formato: ${params.formato}`);
      logger.info(
        `[CuentaCorriente] Período: ${params.desde.toLocaleDateString()} - ${params.hasta.toLocaleDateString()}`,
      );

      return {
        enviado: true,
        urlDocumento,
      };
    } catch (error) {
      return {
        enviado: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  private esMovimientoCargo(tipo: TipoMovimiento): boolean {
    return tipo.startsWith("CARGO") || tipo.startsWith("DEBITO") ||
      tipo === "APERTURA_CUENTA" || tipo === "AJUSTE_POSITIVO";
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ═══════════════════════════════════════════════════════════════
  // DEMO DATA
  // ═══════════════════════════════════════════════════════════════

  private inicializarDemoData(): void {
    // Crear cuenta demo
    const cuenta: CuentaCorriente = {
      id: "cc-demo-001",
      contratoId: "ctr-demo-001",
      numeroContrato: "CTR-2025-00089",
      fechaApertura: new Date("2025-01-15"),
      clienteId: "cli-001",
      clienteRut: "97.004.000-5",
      clienteNombre: "Banco Chile",
      clienteEmail: "pagos@bancochile.cl",
      valorOriginalContrato: 82000000,
      montoIVA: 15580000,
      valorTotalContrato: 97580000,
      totalCargos: 65264000,
      totalAbonos: 32632000,
      totalCreditos: 0,
      totalDebitos: 0,
      totalAjustes: 0,
      saldoPendiente: 32632000,
      estado: "ACTIVA",
      diasMoraActual: 0,
      fechaUltimoMovimiento: new Date(),
      fechaUltimoPago: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      movimientos: [],
    };

    // Agregar movimientos demo
    const movimientosDemo: Partial<Movimiento>[] = [
      {
        tipoMovimiento: "APERTURA_CUENTA",
        fechaMovimiento: new Date("2025-01-15"),
        montoBruto: 82000000,
        montoIVA: 15580000,
        montoNeto: 97580000,
        esCargo: true,
        concepto: "Apertura cuenta corriente - Contrato CTR-2025-00089",
        detalleConcepto:
          "Campaña publicitaria integral: Radio FM + Digital + TV",
      },
      {
        tipoMovimiento: "CARGO_FACTURA",
        fechaMovimiento: new Date("2025-01-20"),
        documentoTipo: "FACTURA",
        documentoNumero: "FAC-2025-001234",
        montoBruto: 27420000,
        montoIVA: 5209800,
        montoNeto: 32629800,
        esCargo: true,
        concepto: "Factura FAC-2025-001234 - Cuota 1/3 Enero 2025",
      },
      {
        tipoMovimiento: "ABONO_TRANSFERENCIA",
        fechaMovimiento: new Date("2025-02-05"),
        medioPago: "TRANSFERENCIA",
        bancoOrigen: "Banco Chile",
        numeroOperacion: "TRF-89456123",
        montoBruto: 32632000,
        montoNeto: 32632000,
        esCargo: false,
        concepto: "Pago Factura FAC-2025-001234",
      },
      {
        tipoMovimiento: "CARGO_FACTURA",
        fechaMovimiento: new Date("2025-02-15"),
        documentoTipo: "FACTURA",
        documentoNumero: "FAC-2025-001345",
        montoBruto: 27420000,
        montoIVA: 5209800,
        montoNeto: 32629800,
        esCargo: true,
        concepto: "Factura FAC-2025-001345 - Cuota 2/3 Febrero 2025",
      },
    ];

    let saldoAcumulado = 0;
    movimientosDemo.forEach((m, idx) => {
      const saldoAnterior = saldoAcumulado;
      const montoNeto = m.montoNeto || 0;
      saldoAcumulado = m.esCargo
        ? saldoAcumulado + montoNeto
        : saldoAcumulado - montoNeto;

      cuenta.movimientos.push({
        id: `mov-demo-${idx + 1}`,
        numeroMovimiento: idx + 1,
        fechaMovimiento: m.fechaMovimiento || new Date(),
        fechaValor: m.fechaMovimiento || new Date(),
        tipoMovimiento: m.tipoMovimiento as TipoMovimiento,
        documentoTipo: m.documentoTipo,
        documentoNumero: m.documentoNumero,
        montoBruto: m.montoBruto || 0,
        montoIVA: m.montoIVA || 0,
        montoRetencion: 0,
        montoNeto: montoNeto,
        esCargo: m.esCargo || false,
        saldoAnterior,
        saldoPosterior: saldoAcumulado,
        concepto: m.concepto || "",
        detalleConcepto: m.detalleConcepto,
        medioPago: m.medioPago,
        bancoOrigen: m.bancoOrigen,
        numeroOperacion: m.numeroOperacion,
        conciliado: true,
        anulado: false,
      });
    });

    cuenta.saldoPendiente = saldoAcumulado;
    this.cuentas.set(cuenta.id, cuenta);
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const CuentaCorrienteService = CuentaCorrienteEngine.getInstance();

export function useCuentaCorriente(contratoId: string) {
  const cuenta = CuentaCorrienteService.obtenerCuenta(contratoId);

  return {
    cuenta,
    registrarFactura: (
      factura: Parameters<typeof CuentaCorrienteService.registrarFactura>[1],
    ) =>
      cuenta
        ? CuentaCorrienteService.registrarFactura(cuenta.id, factura)
        : null,
    registrarPago: (
      pago: Parameters<typeof CuentaCorrienteService.registrarPago>[1],
    ) => cuenta ? CuentaCorrienteService.registrarPago(cuenta.id, pago) : null,
    generarEstadoCuenta: (desde: Date, hasta: Date) =>
      cuenta
        ? CuentaCorrienteService.generarEstadoCuenta(cuenta.id, desde, hasta)
        : null,
    enviarPorEmail: (
      params: Omit<
        Parameters<typeof CuentaCorrienteService.enviarEstadoCuentaPorEmail>[0],
        "cuentaId"
      >,
    ) =>
      cuenta
        ? CuentaCorrienteService.enviarEstadoCuentaPorEmail({
          ...params,
          cuentaId: cuenta.id,
        })
        : null,
  };
}

export default CuentaCorrienteService;

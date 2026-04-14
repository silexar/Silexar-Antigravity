// @ts-nocheck

/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Command: AprobarTerminosPagoCommand
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

export enum TipoAprobacion {
  AUTOMATICA = 'automatica',
  MANUAL = 'manual',
  ESCALADA = 'escalada',
  EMERGENCIA = 'emergencia'
}

export enum RiesgoCredito {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
  CRITICO = 'critico'
}

export interface TerminosPagoProps {
  modalidad: 'contado' | 'credito' | 'mixto';
  plazoCredito?: number; // días
  descuentoProntoPago?: number; // porcentaje
  garantias?: string[];
  condicionesEspeciales?: string[];
  montoMaximoCredito?: number;
}

export interface AprobarTerminosPagoCommandProps {
  contratoId: string;
  terminosPago: TerminosPagoProps;
  aprobadoPor: string;
  tipoAprobacion: TipoAprobacion;
  observaciones?: string;
  validacionRiesgo?: boolean;
  notificarCliente?: boolean;
}

export class AprobarTerminosPagoCommand {
  constructor(public readonly props: AprobarTerminosPagoCommandProps) {}
}

export class AprobarTerminosPagoCommandHandler {
  private static readonly LIMITES_AUTOMATICOS = {
    [RiesgoCredito.BAJO]: 500000,
    [RiesgoCredito.MEDIO]: 200000,
    [RiesgoCredito.ALTO]: 50000,
    [RiesgoCredito.CRITICO]: 0
  };

  private static readonly PLAZOS_MAXIMOS = {
    [RiesgoCredito.BAJO]: 90,
    [RiesgoCredito.MEDIO]: 60,
    [RiesgoCredito.ALTO]: 30,
    [RiesgoCredito.CRITICO]: 0
  };

  async handle(command: AprobarTerminosPagoCommand): Promise<{
    success: boolean;
    aprobacionId: string;
    requiereEscalamiento: boolean;
    validacionRiesgo: {
      nivelRiesgo: RiesgoCredito;
      score: number;
      factoresRiesgo: string[];
      recomendaciones: string[];
    };
    notificacionesEnviadas: string[];
  }> {
    // Validar autorización del aprobador
    await this.validarAutorizacion(command.props.aprobadoPor, command.props.contratoId);

    // Obtener datos del contrato y cliente
    const datosContrato = await this.obtenerDatosContrato(command.props.contratoId);
    const datosCliente = await this.obtenerDatosCliente(datosContrato.clienteId);

    // Validar términos de pago contra políticas
    const validacionPoliticas = await this.validarContraPoliticas(
      command.props.terminosPago,
      datosContrato,
      datosCliente
    );

    if (!validacionPoliticas.valido) {
      throw new Error(`Términos no cumplen políticas: ${validacionPoliticas.errores.join(', ')}`);
    }

    // Realizar validación de riesgo si es requerida
    let validacionRiesgo;
    if (command.props.validacionRiesgo !== false) {
      validacionRiesgo = await this.validarRiesgoCredito(
        command.props.terminosPago,
        datosCliente,
        datosContrato
      );
    }

    // Determinar si requiere escalamiento
    const requiereEscalamiento = await this.evaluarEscalamiento(
      command.props.terminosPago,
      validacionRiesgo,
      datosContrato
    );

    if (requiereEscalamiento && command.props.tipoAprobacion !== TipoAprobacion.ESCALADA) {
      return await this.escalarAprobacion(command, validacionRiesgo);
    }

    // Procesar aprobación
    const aprobacionId = await this.procesarAprobacion(command, validacionRiesgo);

    // Enviar notificaciones
    const notificacionesEnviadas = [];
    if (command.props.notificarCliente) {
      const notifId = await this.notificarCliente(command.props.contratoId, command.props.terminosPago);
      notificacionesEnviadas.push(notifId);
    }

    // Notificar a stakeholders internos
    const notifStakeholders = await this.notificarStakeholders(
      command.props.contratoId,
      command.props.terminosPago,
      validacionRiesgo
    );
    notificacionesEnviadas.push(...notifStakeholders);

    return {
      success: true,
      aprobacionId,
      requiereEscalamiento: false,
      validacionRiesgo: validacionRiesgo || {
        nivelRiesgo: RiesgoCredito.BAJO,
        score: 100,
        factoresRiesgo: [],
        recomendaciones: []
      },
      notificacionesEnviadas
    };
  }

  private async validarAutorizacion(aprobadorId: string, contratoId: string): Promise<void> {
    // Validar que el usuario tiene permisos para aprobar términos de pago
    // En producción consultaría el sistema de autorización
  }

  private async obtenerDatosContrato(contratoId: string): Promise<unknown> {
    // Obtener datos del contrato desde el repositorio
    return {
      id: contratoId,
      clienteId: 'cliente_123',
      montoTotal: 150000,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };
  }

  private async obtenerDatosCliente(clienteId: string): Promise<unknown> {
    // Obtener datos del cliente desde el repositorio
    return {
      id: clienteId,
      nombre: 'Cliente Ejemplo',
      rut: '12345678-9',
      historialPagos: 'bueno',
      scoreCredito: 750,
      antiguedad: 24, // meses
      ventasUltimos12Meses: 500000
    };
  }

  private async validarContraPoliticas(
    terminos: TerminosPagoProps,
    contrato: { montoTotal: number; [key: string]: unknown },
    cliente: { scoreCredito: number; historialPagos: string; antiguedad: number; ventasUltimos12Meses: number; [key: string]: unknown }
  ): Promise<{ valido: boolean; errores: string[]; advertencias: string[] }> {
    const errores: string[] = [];
    const advertencias: string[] = [];

    // Validar plazo máximo según modalidad
    if (terminos.modalidad === 'credito' && terminos.plazoCredito) {
      if (terminos.plazoCredito > 120) {
        errores.push('Plazo de crédito no puede exceder 120 días');
      }
    }

    // Validar monto máximo de crédito
    if (terminos.montoMaximoCredito && terminos.montoMaximoCredito > contrato.montoTotal * 1.2) {
      errores.push('Monto máximo de crédito no puede exceder 120% del valor del contrato');
    }

    // Validar descuento por pronto pago
    if (terminos.descuentoProntoPago && terminos.descuentoProntoPago > 10) {
      advertencias.push('Descuento por pronto pago superior al 10% requiere aprobación especial');
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias
    };
  }

  private async validarRiesgoCredito(
    terminos: TerminosPagoProps,
    cliente: { scoreCredito: number; historialPagos: string; antiguedad: number; ventasUltimos12Meses: number; [key: string]: unknown },
    contrato: { montoTotal: number; [key: string]: unknown }
  ): Promise<{
    nivelRiesgo: RiesgoCredito;
    score: number;
    factoresRiesgo: string[];
    recomendaciones: string[];
  }> {
    let score = 100;
    const factoresRiesgo: string[] = [];
    const recomendaciones: string[] = [];

    // Evaluar score de crédito del cliente
    if (cliente.scoreCredito < 600) {
      score -= 30;
      factoresRiesgo.push('Score de crédito bajo');
      recomendaciones.push('Solicitar garantías adicionales');
    } else if (cliente.scoreCredito < 700) {
      score -= 15;
      factoresRiesgo.push('Score de crédito medio');
    }

    // Evaluar historial de pagos
    if (cliente.historialPagos === 'malo') {
      score -= 25;
      factoresRiesgo.push('Historial de pagos deficiente');
      recomendaciones.push('Reducir plazo de crédito');
    } else if (cliente.historialPagos === 'regular') {
      score -= 10;
      factoresRiesgo.push('Historial de pagos irregular');
    }

    // Evaluar antigüedad del cliente
    if (cliente.antiguedad < 12) {
      score -= 15;
      factoresRiesgo.push('Cliente nuevo (menos de 12 meses)');
      recomendaciones.push('Aplicar términos conservadores');
    }

    // Evaluar monto vs ventas históricas
    const ratioMonto = contrato.montoTotal / cliente.ventasUltimos12Meses;
    if (ratioMonto > 0.5) {
      score -= 20;
      factoresRiesgo.push('Monto alto vs ventas históricas');
      recomendaciones.push('Considerar pago escalonado');
    }

    // Evaluar plazo solicitado
    if (terminos.plazoCredito && terminos.plazoCredito > 60) {
      score -= 10;
      factoresRiesgo.push('Plazo de crédito extendido');
    }

    // Determinar nivel de riesgo
    let nivelRiesgo: RiesgoCredito;
    if (score >= 80) {
      nivelRiesgo = RiesgoCredito.BAJO;
    } else if (score >= 60) {
      nivelRiesgo = RiesgoCredito.MEDIO;
    } else if (score >= 40) {
      nivelRiesgo = RiesgoCredito.ALTO;
    } else {
      nivelRiesgo = RiesgoCredito.CRITICO;
    }

    // Agregar recomendaciones específicas por nivel
    if (nivelRiesgo === RiesgoCredito.CRITICO) {
      recomendaciones.push('Rechazar crédito, solo contado');
    } else if (nivelRiesgo === RiesgoCredito.ALTO) {
      recomendaciones.push('Crédito limitado con garantías');
    }

    return {
      nivelRiesgo,
      score,
      factoresRiesgo,
      recomendaciones
    };
  }

  private async evaluarEscalamiento(
    terminos: TerminosPagoProps,
    validacionRiesgo: { nivelRiesgo: RiesgoCredito; score: number; factoresRiesgo: string[]; recomendaciones: string[] } | undefined,
    contrato: { montoTotal: number; [key: string]: unknown }
  ): Promise<boolean> {
    // Escalamiento por riesgo alto
    if (validacionRiesgo && validacionRiesgo.nivelRiesgo === RiesgoCredito.CRITICO) {
      return true;
    }

    // Escalamiento por monto alto
    const limiteAutomatico = AprobarTerminosPagoCommandHandler.LIMITES_AUTOMATICOS[
      validacionRiesgo?.nivelRiesgo || RiesgoCredito.MEDIO
    ];
    
    if (contrato.montoTotal > limiteAutomatico) {
      return true;
    }

    // Escalamiento por plazo extendido
    const plazoMaximo = AprobarTerminosPagoCommandHandler.PLAZOS_MAXIMOS[
      validacionRiesgo?.nivelRiesgo || RiesgoCredito.MEDIO
    ];
    
    if (terminos.plazoCredito && terminos.plazoCredito > plazoMaximo) {
      return true;
    }

    return false;
  }

  private async escalarAprobacion(
    command: AprobarTerminosPagoCommand,
    validacionRiesgo: { nivelRiesgo: RiesgoCredito; score: number; factoresRiesgo: string[]; recomendaciones: string[] } | undefined
  ): Promise<unknown> {
    // Crear solicitud de escalamiento
    const escalamientoId = await this.crearSolicitudEscalamiento(
      command.props.contratoId,
      command.props.terminosPago,
      validacionRiesgo,
      command.props.aprobadoPor
    );

    return {
      success: false,
      requiereEscalamiento: true,
      escalamientoId,
      validacionRiesgo,
      notificacionesEnviadas: []
    };
  }

  private async crearSolicitudEscalamiento(
    contratoId: string,
    terminos: TerminosPagoProps,
    validacionRiesgo: { nivelRiesgo: RiesgoCredito; score: number; factoresRiesgo: string[]; recomendaciones: string[] } | undefined,
    solicitadoPor: string
  ): Promise<string> {
    // Crear solicitud de escalamiento en el sistema
    const escalamientoId = `escalamiento_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    // En producción se guardaría en base de datos y se notificaría al nivel superior
    
    return escalamientoId;
  }

  private async procesarAprobacion(
    command: AprobarTerminosPagoCommand,
    validacionRiesgo: { nivelRiesgo: RiesgoCredito; score: number; factoresRiesgo: string[]; recomendaciones: string[] } | undefined
  ): Promise<string> {
    const aprobacionId = `aprobacion_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    // Registrar aprobación en el sistema
    await this.registrarAprobacion({
      id: aprobacionId,
      contratoId: command.props.contratoId,
      terminosPago: command.props.terminosPago,
      aprobadoPor: command.props.aprobadoPor,
      tipoAprobacion: command.props.tipoAprobacion,
      fechaAprobacion: new Date(),
      validacionRiesgo,
      observaciones: command.props.observaciones
    });

    // Actualizar estado del contrato
    await this.actualizarEstadoContrato(command.props.contratoId, 'terminos_aprobados');

    return aprobacionId;
  }

  private async registrarAprobacion(aprobacion: unknown): Promise<void> {
    // Guardar aprobación en base de datos
    // En producción usaría el repositorio correspondiente
  }

  private async actualizarEstadoContrato(contratoId: string, nuevoEstado: string): Promise<void> {
    // Actualizar estado del contrato
    // En producción usaría el repositorio de contratos
  }

  private async notificarCliente(contratoId: string, terminos: TerminosPagoProps): Promise<string> {
    // Enviar notificación al cliente sobre términos aprobados
    const notificacionId = `notif_cliente_${Date.now()}`;
    
    // En producción usaría el servicio de notificaciones
    
    return notificacionId;
  }

  private async notificarStakeholders(
    contratoId: string,
    terminos: TerminosPagoProps,
    validacionRiesgo: { nivelRiesgo: RiesgoCredito; score: number; factoresRiesgo: string[]; recomendaciones: string[] } | undefined
  ): Promise<string[]> {
    const notificaciones: string[] = [];
    
    // Notificar a finanzas
    notificaciones.push(`notif_finanzas_${Date.now()}`);
    
    // Notificar a ejecutivo de cuenta
    notificaciones.push(`notif_ejecutivo_${Date.now()}`);
    
    // Si es riesgo alto, notificar a gerencia
    if (validacionRiesgo?.nivelRiesgo === RiesgoCredito.ALTO) {
      notificaciones.push(`notif_gerencia_${Date.now()}`);
    }
    
    return notificaciones;
  }
}
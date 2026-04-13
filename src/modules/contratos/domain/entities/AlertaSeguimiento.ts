/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Entidad: AlertaSeguimiento
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

export enum PrioridadAlerta {
  CRITICA = 'critica',
  ALTA = 'alta',
  MEDIA = 'media',
  BAJA = 'baja'
}

export enum CategoriaAlerta {
  VENCIMIENTO = 'vencimiento',
  APROBACION = 'aprobacion',
  INVENTARIO = 'inventario',
  RIESGO = 'riesgo',
  PAGO = 'pago',
  FIRMA = 'firma',
  PERFORMANCE = 'performance',
  COMPLIANCE = 'compliance'
}

export enum CanalNotificacion {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  SLACK = 'slack',
  TEAMS = 'teams',
  WEBHOOK = 'webhook'
}

export enum EstadoAlerta {
  ACTIVA = 'activa',
  EN_PROCESO = 'en_proceso',
  ESCALADA = 'escalada',
  RESUELTA = 'resuelta',
  CANCELADA = 'cancelada',
  VENCIDA = 'vencida'
}

export interface ResponsableProps {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  cargo: string;
  departamento: string;
  nivelEscalamiento: number;
  canalesPreferidos: CanalNotificacion[];
  horariosDisponibles?: string[];
}

export interface EscalamientoProps {
  nivel: number;
  tiempoLimite: number; // en minutos
  responsables: ResponsableProps[];
  accionesAutomaticas?: string[];
  condicionesEscalamiento?: string[];
}

export interface NotificacionProps {
  id: string;
  canal: CanalNotificacion;
  destinatario: string;
  mensaje: string;
  fechaEnvio: Date;
  fechaEntrega?: Date;
  estado: 'enviada' | 'entregada' | 'leida' | 'error';
  intentos: number;
  metadatos?: Record<string, unknown>;
}

export interface AlertaSeguimientoProps {
  id?: string;
  contratoId: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaAlerta;
  prioridad: PrioridadAlerta;
  estado: EstadoAlerta;
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  fechaResolucion?: Date;
  responsableActual?: ResponsableProps;
  escalamientos: EscalamientoProps[];
  nivelEscalamientoActual: number;
  notificaciones: NotificacionProps[];
  acciones: string[];
  metadatos?: Record<string, unknown>;
  configuracionSLA: {
    tiempoRespuesta: number; // minutos
    tiempoResolucion: number; // minutos
    escalamientoAutomatico: boolean;
  };
}

export class AlertaSeguimiento {
  private _id: string;
  private _contratoId: string;
  private _titulo: string;
  private _descripcion: string;
  private _categoria: CategoriaAlerta;
  private _prioridad: PrioridadAlerta;
  private _estado: EstadoAlerta;
  private _fechaCreacion: Date;
  private _fechaVencimiento?: Date;
  private _fechaResolucion?: Date;
  private _responsableActual?: ResponsableProps;
  private _escalamientos: EscalamientoProps[];
  private _nivelEscalamientoActual: number;
  private _notificaciones: NotificacionProps[];
  private _acciones: string[];
  private _metadatos: Record<string, unknown>;
  private _configuracionSLA: {
    tiempoRespuesta: number;
    tiempoResolucion: number;
    escalamientoAutomatico: boolean;
  };

  // Configuraciones empresariales Fortune 10
  private static readonly SLA_DEFAULTS: Record<PrioridadAlerta, { respuesta: number; resolucion: number }> = {
    [PrioridadAlerta.CRITICA]: { respuesta: 15, resolucion: 60 },
    [PrioridadAlerta.ALTA]: { respuesta: 30, resolucion: 240 },
    [PrioridadAlerta.MEDIA]: { respuesta: 120, resolucion: 480 },
    [PrioridadAlerta.BAJA]: { respuesta: 480, resolucion: 1440 }
  };

  private static readonly CANALES_POR_PRIORIDAD: Record<PrioridadAlerta, CanalNotificacion[]> = {
    [PrioridadAlerta.CRITICA]: [CanalNotificacion.SMS, CanalNotificacion.PUSH, CanalNotificacion.EMAIL, CanalNotificacion.WHATSAPP],
    [PrioridadAlerta.ALTA]: [CanalNotificacion.PUSH, CanalNotificacion.EMAIL, CanalNotificacion.SLACK],
    [PrioridadAlerta.MEDIA]: [CanalNotificacion.EMAIL, CanalNotificacion.PUSH],
    [PrioridadAlerta.BAJA]: [CanalNotificacion.EMAIL]
  };

  constructor(props: AlertaSeguimientoProps) {
    this.validarPropiedades(props);

    this._id = props.id || this.generarId();
    this._contratoId = props.contratoId;
    this._titulo = props.titulo;
    this._descripcion = props.descripcion;
    this._categoria = props.categoria;
    this._prioridad = props.prioridad;
    this._estado = props.estado;
    this._fechaCreacion = props.fechaCreacion;
    this._fechaVencimiento = props.fechaVencimiento;
    this._fechaResolucion = props.fechaResolucion;
    this._responsableActual = props.responsableActual;
    this._escalamientos = props.escalamientos;
    this._nivelEscalamientoActual = props.nivelEscalamientoActual;
    this._notificaciones = props.notificaciones;
    this._acciones = props.acciones;
    this._metadatos = props.metadatos || {};
    this._configuracionSLA = props.configuracionSLA;
  }

  static create(
    contratoId: string,
    titulo: string,
    descripcion: string,
    categoria: CategoriaAlerta,
    prioridad: PrioridadAlerta,
    opciones?: Partial<Omit<AlertaSeguimientoProps, 'contratoId' | 'titulo' | 'descripcion' | 'categoria' | 'prioridad'>>
  ): AlertaSeguimiento {
    // Safe access with type checking to prevent object injection
    const slaDefaults = (prioridad === PrioridadAlerta.CRITICA) ? AlertaSeguimiento.SLA_DEFAULTS[PrioridadAlerta.CRITICA] :
                       (prioridad === PrioridadAlerta.ALTA) ? AlertaSeguimiento.SLA_DEFAULTS[PrioridadAlerta.ALTA] :
                       (prioridad === PrioridadAlerta.BAJA) ? AlertaSeguimiento.SLA_DEFAULTS[PrioridadAlerta.BAJA] :
                       AlertaSeguimiento.SLA_DEFAULTS[PrioridadAlerta.MEDIA];
    
    return new AlertaSeguimiento({
      contratoId,
      titulo,
      descripcion,
      categoria,
      prioridad,
      estado: EstadoAlerta.ACTIVA,
      fechaCreacion: new Date(),
      escalamientos: opciones?.escalamientos || AlertaSeguimiento.crearEscalamientosDefault(prioridad),
      nivelEscalamientoActual: 0,
      notificaciones: [],
      acciones: [],
      configuracionSLA: {
        tiempoRespuesta: slaDefaults.respuesta,
        tiempoResolucion: slaDefaults.resolucion,
        escalamientoAutomatico: true,
        ...opciones?.configuracionSLA
      },
      ...opciones
    });
  }

  // Getters
  get id(): string { return this._id; }
  get contratoId(): string { return this._contratoId; }
  get titulo(): string { return this._titulo; }
  get descripcion(): string { return this._descripcion; }
  get categoria(): CategoriaAlerta { return this._categoria; }
  get prioridad(): PrioridadAlerta { return this._prioridad; }
  get estado(): EstadoAlerta { return this._estado; }
  get fechaCreacion(): Date { return this._fechaCreacion; }
  get fechaVencimiento(): Date | undefined { return this._fechaVencimiento; }
  get fechaResolucion(): Date | undefined { return this._fechaResolucion; }
  get responsableActual(): ResponsableProps | undefined { return this._responsableActual; }
  get escalamientos(): EscalamientoProps[] { return [...this._escalamientos]; }
  get nivelEscalamientoActual(): number { return this._nivelEscalamientoActual; }
  get notificaciones(): NotificacionProps[] { return [...this._notificaciones]; }
  get acciones(): string[] { return [...this._acciones]; }
  get metadatos(): Record<string, unknown> { return { ...this._metadatos }; }
  get configuracionSLA(): typeof this._configuracionSLA { return { ...this._configuracionSLA }; }

  /**
   * Asigna un responsable a la alerta
   */
  asignarResponsable(responsable: ResponsableProps, motivo?: string): void {
    if (this._estado === EstadoAlerta.RESUELTA || this._estado === EstadoAlerta.CANCELADA) {
      throw new Error('No se puede asignar responsable a una alerta resuelta o cancelada');
    }

    const responsableAnterior = this._responsableActual;
    this._responsableActual = responsable;
    this._estado = EstadoAlerta.EN_PROCESO;

    this._acciones.push(
      `Asignada a ${responsable.nombre} (${responsable.cargo}) ${motivo ? `- ${motivo}` : ''}`
    );

    const asignaciones = (this._metadatos.asignaciones || []) as Array<{
      fecha: string;
      responsableAnterior?: string;
      responsableNuevo: string;
      motivo?: string;
    }>;
    asignaciones.push({
      fecha: new Date().toISOString(),
      responsableAnterior: responsableAnterior?.nombre,
      responsableNuevo: responsable.nombre,
      motivo
    });
    this._metadatos.asignaciones = asignaciones;

    // Enviar notificación al nuevo responsable
    this.enviarNotificacion(
      responsable,
      `Se te ha asignado la alerta: ${this._titulo}`,
      AlertaSeguimiento.CANALES_POR_PRIORIDAD[this._prioridad]
    );
  }

  /**
   * Escala la alerta al siguiente nivel
   */
  async escalarAlerta(motivo?: string): Promise<boolean> {
    if (this._nivelEscalamientoActual >= this._escalamientos.length - 1) {
      this._metadatos.escalamientoMaximoAlcanzado = {
        fecha: new Date().toISOString(),
        motivo: 'Nivel máximo de escalamiento alcanzado'
      };
      return false;
    }

    this._nivelEscalamientoActual++;
    const nuevoNivel = this._escalamientos[this._nivelEscalamientoActual];
    this._estado = EstadoAlerta.ESCALADA;

    this._acciones.push(
      `Escalada a nivel ${this._nivelEscalamientoActual + 1} ${motivo ? `- ${motivo}` : ''}`
    );

    // Ejecutar acciones automáticas del nivel
    if (nuevoNivel.accionesAutomaticas) {
      await this.ejecutarAccionesAutomaticas(nuevoNivel.accionesAutomaticas);
    }

    // Notificar a todos los responsables del nuevo nivel
    for (const responsable of nuevoNivel.responsables) {
      await this.enviarNotificacion(
        responsable,
        `ESCALAMIENTO NIVEL ${this._nivelEscalamientoActual + 1}: ${this._titulo}`,
        responsable.canalesPreferidos
      );
    }

    const escalamientos = (this._metadatos.escalamientos || []) as Array<{
      fecha: string;
      nivelAnterior: number;
      nivelNuevo: number;
      motivo?: string;
      responsables: string[];
    }>;
    escalamientos.push({
      fecha: new Date().toISOString(),
      nivelAnterior: this._nivelEscalamientoActual - 1,
      nivelNuevo: this._nivelEscalamientoActual,
      motivo,
      responsables: nuevoNivel.responsables.map(r => r.nombre)
    });
    this._metadatos.escalamientos = escalamientos;

    return true;
  }

  /**
   * Envía notificaciones a través de múltiples canales
   */
  async enviarNotificaciones(
    mensaje: string,
    canales?: CanalNotificacion[],
    destinatarios?: ResponsableProps[]
  ): Promise<void> {
    const canalesAUsar = canales || AlertaSeguimiento.CANALES_POR_PRIORIDAD[this._prioridad];
    const destinatariosAUsar = destinatarios || (this._responsableActual ? [this._responsableActual] : []);

    for (const destinatario of destinatariosAUsar) {
      await this.enviarNotificacion(destinatario, mensaje, canalesAUsar);
    }
  }

  /**
   * Verifica si la alerta ha excedido los SLA
   */
  verificarSLA(): {
    tiempoRespuestaExcedido: boolean;
    tiempoResolucionExcedido: boolean;
    minutosExcedidosRespuesta: number;
    minutosExcedidosResolucion: number;
  } {
    const ahora = new Date();
    const minutosDesdeCreacion = Math.floor(
      (ahora.getTime() - this._fechaCreacion.getTime()) / (1000 * 60)
    );

    const tiempoRespuestaExcedido = minutosDesdeCreacion > this._configuracionSLA.tiempoRespuesta;
    const tiempoResolucionExcedido = minutosDesdeCreacion > this._configuracionSLA.tiempoResolucion;

    return {
      tiempoRespuestaExcedido,
      tiempoResolucionExcedido,
      minutosExcedidosRespuesta: Math.max(0, minutosDesdeCreacion - this._configuracionSLA.tiempoRespuesta),
      minutosExcedidosResolucion: Math.max(0, minutosDesdeCreacion - this._configuracionSLA.tiempoResolucion)
    };
  }

  /**
   * Procesa el escalamiento automático por tiempo
   */
  async procesarEscalamientoAutomatico(): Promise<boolean> {
    if (!this._configuracionSLA.escalamientoAutomatico) {
      return false;
    }

    const nivelActual = this._escalamientos[this._nivelEscalamientoActual];

    // Verificar si debe escalar por tiempo
    const minutosDesdeCreacion = Math.floor(
      (new Date().getTime() - this._fechaCreacion.getTime()) / (1000 * 60)
    );

    if (minutosDesdeCreacion >= nivelActual.tiempoLimite) {
      return await this.escalarAlerta('Escalamiento automático por tiempo');
    }

    // Verificar condiciones específicas de escalamiento
    if (nivelActual.condicionesEscalamiento) {
      const debeEscalar = await this.evaluarCondicionesEscalamiento(nivelActual.condicionesEscalamiento);
      if (debeEscalar) {
        return await this.escalarAlerta('Escalamiento automático por condiciones');
      }
    }

    return false;
  }

  /**
   * Resuelve la alerta
   */
  resolver(solucion: string, responsable?: string): void {
    if (this._estado === EstadoAlerta.RESUELTA) {
      throw new Error('La alerta ya está resuelta');
    }

    this._estado = EstadoAlerta.RESUELTA;
    this._fechaResolucion = new Date();

    this._acciones.push(
      `Resuelta: ${solucion} ${responsable ? `por ${responsable}` : ''}`
    );

    this._metadatos.resolucion = {
      fecha: this._fechaResolucion.toISOString(),
      solucion,
      responsable,
      tiempoResolucion: Math.floor(
        (this._fechaResolucion.getTime() - this._fechaCreacion.getTime()) / (1000 * 60)
      )
    };

    // Notificar resolución a stakeholders
    if (this._responsableActual) {
      this.enviarNotificacion(
        this._responsableActual,
        `Alerta resuelta: ${this._titulo} - ${solucion}`,
        [CanalNotificacion.EMAIL, CanalNotificacion.PUSH]
      );
    }
  }

  /**
   * Cancela la alerta
   */
  cancelar(motivo: string, responsable?: string): void {
    if (this._estado === EstadoAlerta.RESUELTA || this._estado === EstadoAlerta.CANCELADA) {
      throw new Error('La alerta ya está resuelta o cancelada');
    }

    this._estado = EstadoAlerta.CANCELADA;
    this._fechaResolucion = new Date();

    this._acciones.push(
      `Cancelada: ${motivo} ${responsable ? `por ${responsable}` : ''}`
    );

    this._metadatos.cancelacion = {
      fecha: this._fechaResolucion.toISOString(),
      motivo,
      responsable
    };
  }

  /**
   * Obtiene métricas de la alerta
   */
  getMetricas(): {
    tiempoVida: number; // minutos
    tiempoRespuesta?: number; // minutos
    tiempoResolucion?: number; // minutos
    numeroEscalamientos: number;
    numeroNotificaciones: number;
    cumpleSLA: boolean;
    eficienciaResolucion: number; // porcentaje
  } {
    const ahora = new Date();
    const fechaFin = this._fechaResolucion || ahora;
    
    const tiempoVida = Math.floor(
      (fechaFin.getTime() - this._fechaCreacion.getTime()) / (1000 * 60)
    );

    const tiempoRespuesta = this._responsableActual 
      ? Math.floor((new Date().getTime() - this._fechaCreacion.getTime()) / (1000 * 60))
      : undefined;

    const tiempoResolucion = this._fechaResolucion
      ? Math.floor((this._fechaResolucion.getTime() - this._fechaCreacion.getTime()) / (1000 * 60))
      : undefined;

    const sla = this.verificarSLA();
    const cumpleSLA = !sla.tiempoRespuestaExcedido && !sla.tiempoResolucionExcedido;

    const eficienciaResolucion = tiempoResolucion
      ? Math.max(0, 100 - ((tiempoResolucion / this._configuracionSLA.tiempoResolucion) * 100))
      : 0;

    return {
      tiempoVida,
      tiempoRespuesta,
      tiempoResolucion,
      numeroEscalamientos: this._nivelEscalamientoActual,
      numeroNotificaciones: this._notificaciones.length,
      cumpleSLA,
      eficienciaResolucion: Math.round(eficienciaResolucion)
    };
  }

  /**
   * Métodos privados de utilidad
   */
  private async enviarNotificacion(
    destinatario: ResponsableProps,
    mensaje: string,
    canales: CanalNotificacion[]
  ): Promise<void> {
    for (const canal of canales) {
      if (destinatario.canalesPreferidos.includes(canal)) {
        const notificacion: NotificacionProps = {
          id: this.generarIdNotificacion(),
          canal,
          destinatario: this.getDestinatarioParaCanal(destinatario, canal),
          mensaje,
          fechaEnvio: new Date(),
          estado: 'enviada',
          intentos: 1
        };

        // Simular envío (en producción sería llamada real)
        try {
          await this.simularEnvioNotificacion(notificacion);
          notificacion.estado = 'entregada';
          notificacion.fechaEntrega = new Date();
        } catch (error) {
          notificacion.estado = 'error';
          notificacion.metadatos = { error: error instanceof Error ? error.message : 'Error desconocido' };
        }

        this._notificaciones.push(notificacion);
      }
    }
  }

  private async ejecutarAccionesAutomaticas(acciones: string[]): Promise<void> {
    for (const accion of acciones) {
      try {
        // Simular ejecución de acción automática
        await this.simularAccionAutomatica(accion);
        this._acciones.push(`Acción automática ejecutada: ${accion}`);
      } catch (error) {
        this._acciones.push(`Error en acción automática: ${accion} - ${error}`);
      }
    }
  }

  private async evaluarCondicionesEscalamiento(condiciones: string[]): Promise<boolean> {
    // Implementación simplificada - en producción sería más compleja
    for (const condicion of condiciones) {
      if (condicion.includes('sin_respuesta') && !this._responsableActual) {
        return true;
      }
      if (condicion.includes('tiempo_excedido')) {
        const sla = this.verificarSLA();
        if (sla.tiempoRespuestaExcedido) {
          return true;
        }
      }
    }
    return false;
  }

  private async simularEnvioNotificacion(_notificacion: NotificacionProps): Promise<void> {
    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
    
    // Simular posibles errores
    if (Math.random() < 0.05) { // 5% de probabilidad de error
      throw new Error('Error de conectividad');
    }
  }

  private async simularAccionAutomatica(_accion: string): Promise<void> {
    // Simular ejecución de acción
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private getDestinatarioParaCanal(responsable: ResponsableProps, canal: CanalNotificacion): string {
    switch (canal) {
      case CanalNotificacion.EMAIL:
        return responsable.email;
      case CanalNotificacion.SMS:
      case CanalNotificacion.WHATSAPP:
        return responsable.telefono || responsable.email;
      default:
        return responsable.email;
    }
  }

  private static crearEscalamientosDefault(prioridad: PrioridadAlerta): EscalamientoProps[] {
    const tiemposBase = {
      [PrioridadAlerta.CRITICA]: [15, 30, 60],
      [PrioridadAlerta.ALTA]: [60, 120, 240],
      [PrioridadAlerta.MEDIA]: [240, 480, 960],
      [PrioridadAlerta.BAJA]: [480, 960, 1440]
    };

    // Safe access with type checking to prevent object injection
    const tiempos = (prioridad === PrioridadAlerta.CRITICA) ? tiemposBase[PrioridadAlerta.CRITICA] :
                   (prioridad === PrioridadAlerta.ALTA) ? tiemposBase[PrioridadAlerta.ALTA] :
                   (prioridad === PrioridadAlerta.BAJA) ? tiemposBase[PrioridadAlerta.BAJA] :
                   tiemposBase[PrioridadAlerta.MEDIA];
    return tiempos.map((tiempo, index) => ({
      nivel: index,
      tiempoLimite: tiempo,
      responsables: [], // Se asignarían responsables reales
      accionesAutomaticas: index === 2 ? ['crear_ticket_critico', 'notificar_gerencia'] : undefined,
      condicionesEscalamiento: ['sin_respuesta', 'tiempo_excedido']
    }));
  }

  private generarIdNotificacion(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private validarPropiedades(props: AlertaSeguimientoProps): void {
    if (!props.contratoId) {
      throw new Error('El ID del contrato es requerido');
    }

    if (!props.titulo || props.titulo.trim().length === 0) {
      throw new Error('El título es requerido');
    }

    if (!props.descripcion || props.descripcion.trim().length === 0) {
      throw new Error('La descripción es requerida');
    }

    if (props.escalamientos.length === 0) {
      throw new Error('Debe haber al menos un nivel de escalamiento');
    }

    if (props.nivelEscalamientoActual >= props.escalamientos.length) {
      throw new Error('El nivel de escalamiento actual es inválido');
    }
  }

  private generarId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  equals(other: AlertaSeguimiento): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `${this._titulo} (${this._prioridad} - ${this._estado})`;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this._id,
      contratoId: this._contratoId,
      titulo: this._titulo,
      descripcion: this._descripcion,
      categoria: this._categoria,
      prioridad: this._prioridad,
      estado: this._estado,
      fechaCreacion: this._fechaCreacion.toISOString(),
      fechaVencimiento: this._fechaVencimiento?.toISOString(),
      fechaResolucion: this._fechaResolucion?.toISOString(),
      responsableActual: this._responsableActual,
      escalamientos: this._escalamientos,
      nivelEscalamientoActual: this._nivelEscalamientoActual,
      notificaciones: this._notificaciones.map(n => ({
        ...n,
        fechaEnvio: n.fechaEnvio.toISOString(),
        fechaEntrega: n.fechaEntrega?.toISOString()
      })),
      acciones: this._acciones,
      metadatos: this._metadatos,
      configuracionSLA: this._configuracionSLA
    };
  }
}
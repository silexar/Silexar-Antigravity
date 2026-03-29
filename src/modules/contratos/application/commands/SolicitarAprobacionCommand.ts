/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Command: SolicitarAprobacionCommand
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

export enum TipoSolicitudAprobacion {
  CONTRATO_NUEVO = 'contrato_nuevo',
  MODIFICACION_CONTRATO = 'modificacion_contrato',
  TERMINOS_PAGO = 'terminos_pago',
  DESCUENTO_ESPECIAL = 'descuento_especial',
  CLAUSULA_ESPECIAL = 'clausula_especial',
  EMERGENCIA = 'emergencia'
}

export enum NivelAprobacionRequerido {
  SUPERVISOR = 'supervisor',
  GERENTE = 'gerente',
  DIRECTOR = 'director',
  PRESIDENCIA = 'presidencia',
  COMITE = 'comite'
}

export enum PrioridadSolicitud {
  CRITICA = 'critica',      // 2 horas
  ALTA = 'alta',            // 8 horas
  MEDIA = 'media',          // 24 horas
  BAJA = 'baja'             // 72 horas
}

export interface AprobadorProps {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  nivel: NivelAprobacionRequerido;
  telefono?: string;
  delegados?: string[]; // IDs de usuarios que pueden aprobar en su ausencia
  horariosDisponibles?: string[];
}

export interface SolicitarAprobacionCommandProps {
  contratoId: string;
  tipoSolicitud: TipoSolicitudAprobacion;
  descripcion: string;
  justificacion: string;
  documentosAdjuntos?: string[];
  valorImpacto: number;
  fechaLimite?: Date;
  prioridad?: PrioridadSolicitud;
  solicitadoPor: string;
  requiereMultiplesAprobaciones?: boolean;
  metadatos?: Record<string, unknown>;
}

export class SolicitarAprobacionCommand {
  constructor(public readonly props: SolicitarAprobacionCommandProps) {}
}

export class SolicitarAprobacionCommandHandler {
  private static readonly LIMITES_APROBACION: Record<NivelAprobacionRequerido, number> = {
    [NivelAprobacionRequerido.SUPERVISOR]: 100000,
    [NivelAprobacionRequerido.GERENTE]: 500000,
    [NivelAprobacionRequerido.DIRECTOR]: 2000000,
    [NivelAprobacionRequerido.PRESIDENCIA]: 10000000,
    [NivelAprobacionRequerido.COMITE]: Infinity
  };

  private static readonly TIMEOUTS_POR_PRIORIDAD: Record<PrioridadSolicitud, number> = {
    [PrioridadSolicitud.CRITICA]: 2 * 60 * 60 * 1000,    // 2 horas
    [PrioridadSolicitud.ALTA]: 8 * 60 * 60 * 1000,       // 8 horas
    [PrioridadSolicitud.MEDIA]: 24 * 60 * 60 * 1000,     // 24 horas
    [PrioridadSolicitud.BAJA]: 72 * 60 * 60 * 1000       // 72 horas
  };

  private static readonly APROBADORES_EMERGENCIA = [
    'director_general',
    'director_comercial',
    'gerente_general'
  ];

  async handle(command: SolicitarAprobacionCommand): Promise<{
    success: boolean;
    solicitudId: string;
    nivelesRequeridos: NivelAprobacionRequerido[];
    aprobadoresAsignados: AprobadorProps[];
    fechaLimiteEscalamiento: Date;
    notificacionesEnviadas: string[];
    requiereEscalamientoInmediato: boolean;
  }> {
    // 1. Determinar nivel de aprobación requerido automáticamente
    const nivelesRequeridos = await this.determinarNivelAprobacionRequerido(
      command.props.tipoSolicitud,
      command.props.valorImpacto,
      command.props.contratoId
    );

    // 2. Obtener aprobadores disponibles para cada nivel
    const aprobadoresAsignados = await this.asignarAprobadores(
      nivelesRequeridos,
      command.props.prioridad || PrioridadSolicitud.MEDIA
    );

    // 3. Crear solicitud de aprobación
    const solicitudId = await this.crearSolicitudAprobacion(command, nivelesRequeridos, aprobadoresAsignados);

    // 4. Configurar escalamiento automático
    const fechaLimiteEscalamiento = await this.configurarEscalamientoAutomatico(
      solicitudId,
      command.props.prioridad || PrioridadSolicitud.MEDIA,
      command.props.fechaLimite
    );

    // 5. Enviar notificaciones contextuales
    const notificacionesEnviadas = await this.enviarNotificacionesContextuales(
      solicitudId,
      aprobadoresAsignados,
      command.props
    );

    // 6. Verificar si requiere escalamiento inmediato
    const requiereEscalamientoInmediato = await this.evaluarEscalamientoInmediato(
      command.props.tipoSolicitud,
      command.props.valorImpacto,
      command.props.prioridad
    );

    if (requiereEscalamientoInmediato) {
      await this.ejecutarEscalamientoInmediato(solicitudId, command.props);
    }

    return {
      success: true,
      solicitudId,
      nivelesRequeridos,
      aprobadoresAsignados,
      fechaLimiteEscalamiento,
      notificacionesEnviadas,
      requiereEscalamientoInmediato
    };
  }

  private async determinarNivelAprobacionRequerido(
    tipoSolicitud: TipoSolicitudAprobacion,
    valorImpacto: number,
    contratoId: string
  ): Promise<NivelAprobacionRequerido[]> {
    const nivelesRequeridos: NivelAprobacionRequerido[] = [];

    // Determinar por valor de impacto
    for (const [nivel, limite] of Object.entries(SolicitarAprobacionCommandHandler.LIMITES_APROBACION)) {
      if (valorImpacto <= limite) {
        nivelesRequeridos.push(nivel as NivelAprobacionRequerido);
        break;
      }
    }

    // Ajustar según tipo de solicitud
    switch (tipoSolicitud) {
      case TipoSolicitudAprobacion.EMERGENCIA:
        // Emergencias requieren al menos director
        if (!nivelesRequeridos.includes(NivelAprobacionRequerido.DIRECTOR)) {
          nivelesRequeridos.push(NivelAprobacionRequerido.DIRECTOR);
        }
        break;

      case TipoSolicitudAprobacion.CLAUSULA_ESPECIAL:
        // Cláusulas especiales requieren revisión legal (comité)
        if (valorImpacto > 1000000) {
          nivelesRequeridos.push(NivelAprobacionRequerido.COMITE);
        }
        break;

      case TipoSolicitudAprobacion.DESCUENTO_ESPECIAL:
        // Descuentos especiales requieren aprobación comercial
        if (!nivelesRequeridos.includes(NivelAprobacionRequerido.GERENTE)) {
          nivelesRequeridos.push(NivelAprobacionRequerido.GERENTE);
        }
        break;
    }

    // Verificar historial del contrato para ajustar niveles
    const historialContrato = await this.obtenerHistorialContrato(contratoId);
    if (historialContrato.tieneIncidencias) {
      // Elevar un nivel si hay historial de incidencias
      const nivelActual = nivelesRequeridos[0];
      const nivelesOrdenados = Object.values(NivelAprobacionRequerido);
      const indiceActual = nivelesOrdenados.indexOf(nivelActual);
      
      if (indiceActual < nivelesOrdenados.length - 1) {
        nivelesRequeridos[0] = nivelesOrdenados[indiceActual + 1];
      }
    }

    return nivelesRequeridos.length > 0 ? nivelesRequeridos : [NivelAprobacionRequerido.SUPERVISOR];
  }

  private async asignarAprobadores(
    nivelesRequeridos: NivelAprobacionRequerido[],
    prioridad: PrioridadSolicitud
  ): Promise<AprobadorProps[]> {
    const aprobadoresAsignados: AprobadorProps[] = [];

    for (const nivel of nivelesRequeridos) {
      // Obtener aprobadores disponibles para el nivel
      const aprobadoresDisponibles = await this.obtenerAprobadoresDisponibles(nivel);
      
      if (aprobadoresDisponibles.length === 0) {
        // Si no hay aprobadores disponibles, buscar delegados
        const delegados = await this.obtenerDelegadosDisponibles(nivel);
        if (delegados.length > 0) {
          aprobadoresAsignados.push(delegados[0]);
        } else {
          throw new Error(`No hay aprobadores disponibles para el nivel ${nivel}`);
        }
      } else {
        // Seleccionar aprobador según prioridad y disponibilidad
        const aprobadorSeleccionado = await this.seleccionarAprobadorOptimo(
          aprobadoresDisponibles,
          prioridad
        );
        aprobadoresAsignados.push(aprobadorSeleccionado);
      }
    }

    return aprobadoresAsignados;
  }

  private async crearSolicitudAprobacion(
    command: SolicitarAprobacionCommand,
    nivelesRequeridos: NivelAprobacionRequerido[],
    aprobadoresAsignados: AprobadorProps[]
  ): Promise<string> {
    const solicitudId = this.generarIdSolicitud();
    
    const solicitud = {
      id: solicitudId,
      contratoId: command.props.contratoId,
      tipoSolicitud: command.props.tipoSolicitud,
      descripcion: command.props.descripcion,
      justificacion: command.props.justificacion,
      valorImpacto: command.props.valorImpacto,
      prioridad: command.props.prioridad || PrioridadSolicitud.MEDIA,
      solicitadoPor: command.props.solicitadoPor,
      fechaSolicitud: new Date(),
      fechaLimite: command.props.fechaLimite,
      nivelesRequeridos,
      aprobadoresAsignados: aprobadoresAsignados.map(a => a.id),
      estado: 'pendiente',
      documentosAdjuntos: command.props.documentosAdjuntos || [],
      requiereMultiplesAprobaciones: command.props.requiereMultiplesAprobaciones || false,
      metadatos: {
        ...command.props.metadatos,
        fechaCreacion: new Date().toISOString(),
        sistemaOrigen: 'SILEXAR_PULSE_QUANTUM'
      }
    };

    // Guardar solicitud en el sistema
    await this.guardarSolicitudAprobacion(solicitud);

    return solicitudId;
  }

  private async configurarEscalamientoAutomatico(
    solicitudId: string,
    prioridad: PrioridadSolicitud,
    fechaLimiteManual?: Date
  ): Promise<Date> {
    const timeoutMs = SolicitarAprobacionCommandHandler.TIMEOUTS_POR_PRIORIDAD[prioridad];
    const fechaLimiteAutomatica = new Date(Date.now() + timeoutMs);
    
    // Usar la fecha más restrictiva
    const fechaLimiteEscalamiento = fechaLimiteManual && fechaLimiteManual < fechaLimiteAutomatica
      ? fechaLimiteManual
      : fechaLimiteAutomatica;

    // Programar escalamiento automático
    await this.programarEscalamientoAutomatico(solicitudId, fechaLimiteEscalamiento);

    return fechaLimiteEscalamiento;
  }

  private async enviarNotificacionesContextuales(
    solicitudId: string,
    aprobadores: AprobadorProps[],
    commandProps: SolicitarAprobacionCommandProps
  ): Promise<string[]> {
    const notificacionesEnviadas: string[] = [];

    for (const aprobador of aprobadores) {
      // Crear contexto completo para decisión rápida
      const contextoCompleto = await this.generarContextoCompleto(
        commandProps.contratoId,
        commandProps.tipoSolicitud,
        commandProps.valorImpacto
      );

      // Enviar notificación personalizada
      const notificacionId = await this.enviarNotificacionPersonalizada(
        aprobador,
        solicitudId,
        commandProps,
        contextoCompleto
      );

      notificacionesEnviadas.push(notificacionId);

      // Enviar también por canales alternativos si es crítico
      if (commandProps.prioridad === PrioridadSolicitud.CRITICA) {
        if (aprobador.telefono) {
          const smsId = await this.enviarNotificacionSMS(aprobador, solicitudId);
          notificacionesEnviadas.push(smsId);
        }
      }
    }

    return notificacionesEnviadas;
  }

  private async evaluarEscalamientoInmediato(
    tipoSolicitud: TipoSolicitudAprobacion,
    valorImpacto: number,
    prioridad?: PrioridadSolicitud
  ): Promise<boolean> {
    // Escalamiento inmediato para emergencias
    if (tipoSolicitud === TipoSolicitudAprobacion.EMERGENCIA) {
      return true;
    }

    // Escalamiento inmediato para valores muy altos
    if (valorImpacto > 5000000) { // > $5M
      return true;
    }

    // Escalamiento inmediato para prioridad crítica
    if (prioridad === PrioridadSolicitud.CRITICA) {
      return true;
    }

    return false;
  }

  private async ejecutarEscalamientoInmediato(
    solicitudId: string,
    commandProps: SolicitarAprobacionCommandProps
  ): Promise<void> {
    // Notificar a aprobadores de emergencia
    for (const aprobadorEmergenciaId of SolicitarAprobacionCommandHandler.APROBADORES_EMERGENCIA) {
      await this.notificarAprobadorEmergencia(aprobadorEmergenciaId, solicitudId, commandProps);
    }

    // Marcar solicitud como escalada
    await this.marcarSolicitudComoEscalada(solicitudId);
  }

  private async implementarOverrideEmergencia(
    solicitudId: string,
    aprobadorEmergencia: string,
    justificacionOverride: string
  ): Promise<void> {
    // Registrar override de emergencia
    await this.registrarOverrideEmergencia({
      solicitudId,
      aprobadorEmergencia,
      justificacion: justificacionOverride,
      fecha: new Date(),
      tipoOverride: 'emergencia'
    });

    // Aprobar automáticamente la solicitud
    await this.aprobarSolicitudAutomaticamente(solicitudId, aprobadorEmergencia, 'Override de emergencia');

    // Notificar a stakeholders sobre el override
    await this.notificarOverrideEmergencia(solicitudId, aprobadorEmergencia);
  }

  // Métodos de utilidad y simulación
  private async obtenerHistorialContrato(contratoId: string): Promise<unknown> {
    // Simular obtención de historial
    return {
      tieneIncidencias: Math.random() < 0.2, // 20% probabilidad de incidencias
      numeroModificaciones: Math.floor(Math.random() * 5),
      ultimaModificacion: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    };
  }

  private async obtenerAprobadoresDisponibles(nivel: NivelAprobacionRequerido): Promise<AprobadorProps[]> {
    // Simular obtención de aprobadores
    const aprobadoresSimulados: Record<NivelAprobacionRequerido, AprobadorProps[]> = {
      [NivelAprobacionRequerido.SUPERVISOR]: [
        {
          id: 'supervisor_001',
          nombre: 'Juan Supervisor',
          email: 'juan.supervisor@empresa.com',
          cargo: 'Supervisor Comercial',
          nivel: NivelAprobacionRequerido.SUPERVISOR,
          telefono: '+56912345678'
        }
      ],
      [NivelAprobacionRequerido.GERENTE]: [
        {
          id: 'gerente_001',
          nombre: 'María Gerente',
          email: 'maria.gerente@empresa.com',
          cargo: 'Gerente Comercial',
          nivel: NivelAprobacionRequerido.GERENTE,
          telefono: '+56987654321'
        }
      ],
      [NivelAprobacionRequerido.DIRECTOR]: [
        {
          id: 'director_001',
          nombre: 'Carlos Director',
          email: 'carlos.director@empresa.com',
          cargo: 'Director Comercial',
          nivel: NivelAprobacionRequerido.DIRECTOR,
          telefono: '+56911111111'
        }
      ],
      [NivelAprobacionRequerido.PRESIDENCIA]: [
        {
          id: 'presidente_001',
          nombre: 'Ana Presidente',
          email: 'ana.presidente@empresa.com',
          cargo: 'Presidente',
          nivel: NivelAprobacionRequerido.PRESIDENCIA,
          telefono: '+56922222222'
        }
      ],
      [NivelAprobacionRequerido.COMITE]: [
        {
          id: 'comite_001',
          nombre: 'Comité Ejecutivo',
          email: 'comite@empresa.com',
          cargo: 'Comité Ejecutivo',
          nivel: NivelAprobacionRequerido.COMITE
        }
      ]
    };

    return aprobadoresSimulados[nivel] || [];
  }

  private async obtenerDelegadosDisponibles(nivel: NivelAprobacionRequerido): Promise<AprobadorProps[]> {
    // Simular obtención de delegados
    return [];
  }

  private async seleccionarAprobadorOptimo(
    aprobadores: AprobadorProps[],
    prioridad: PrioridadSolicitud
  ): Promise<AprobadorProps> {
    // Seleccionar el primer aprobador disponible (en producción sería más sofisticado)
    return aprobadores[0];
  }

  private async generarContextoCompleto(
    contratoId: string,
    tipoSolicitud: TipoSolicitudAprobacion,
    valorImpacto: number
  ): Promise<unknown> {
    return {
      contrato: {
        id: contratoId,
        cliente: 'Cliente Ejemplo',
        montoTotal: 500000,
        estado: 'en_proceso'
      },
      impacto: {
        financiero: valorImpacto,
        operacional: 'Medio',
        reputacional: 'Bajo'
      },
      recomendacion: valorImpacto > 100000 ? 'Revisar cuidadosamente' : 'Aprobación estándar'
    };
  }

  private async enviarNotificacionPersonalizada(
    aprobador: AprobadorProps,
    solicitudId: string,
    commandProps: SolicitarAprobacionCommandProps,
    contexto: unknown
  ): Promise<string> {
    const notificacionId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Simular envío de notificación
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return notificacionId;
  }

  private async enviarNotificacionSMS(aprobador: AprobadorProps, solicitudId: string): Promise<string> {
    const smsId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Simular envío de SMS
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return smsId;
  }

  private async programarEscalamientoAutomatico(solicitudId: string, fechaLimite: Date): Promise<void> {
    // Simular programación de escalamiento
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async notificarAprobadorEmergencia(
    aprobadorId: string,
    solicitudId: string,
    commandProps: SolicitarAprobacionCommandProps
  ): Promise<void> {
    // Simular notificación de emergencia
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async marcarSolicitudComoEscalada(solicitudId: string): Promise<void> {
    // Simular marcado como escalada
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async registrarOverrideEmergencia(override: unknown): Promise<void> {
    // Simular registro de override
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async aprobarSolicitudAutomaticamente(
    solicitudId: string,
    aprobador: string,
    motivo: string
  ): Promise<void> {
    // Simular aprobación automática
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async notificarOverrideEmergencia(solicitudId: string, aprobador: string): Promise<void> {
    // Simular notificación de override
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async guardarSolicitudAprobacion(solicitud: unknown): Promise<void> {
    // Simular guardado en base de datos
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private generarIdSolicitud(): string {
    return `aprobacion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Entidad: OrdenPauta
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

import { EstadoPlanPagos, EstadoPlanPagosEnum } from '../value-objects/EstadoPlanPagos';

export enum SistemaEmision {
  WIDEORBIT = 'wideorbit',
  SARA = 'sara',
  DALET = 'dalet',
  ENCO = 'enco',
  RADIOFORGE = 'radioforge',
  CUSTOM = 'custom'
}

export enum EstadoEnvio {
  PENDIENTE = 'pendiente',
  ENVIANDO = 'enviando',
  ENVIADO = 'enviado',
  CONFIRMADO = 'confirmado',
  ERROR = 'error',
  REINTENTANDO = 'reintentando',
  CANCELADO = 'cancelado'
}

export enum TipoEspecificacion {
  SPOT_RADIO = 'spot_radio',
  SPOT_TV = 'spot_tv',
  BANNER_DIGITAL = 'banner_digital',
  VIDEO_STREAMING = 'video_streaming',
  PODCAST_AD = 'podcast_ad',
  PATROCINIO = 'patrocinio',
  MENCION_VIVO = 'mencion_vivo'
}

export interface EspecificacionPautaProps {
  tipo: TipoEspecificacion;
  duracion: number; // en segundos
  horarios: string[]; // formato "HH:MM-HH:MM"
  frecuenciaDiaria: number;
  diasSemana: number[]; // 0=domingo, 1=lunes, etc.
  fechaInicio: Date;
  fechaFin: Date;
  materialCreativo: string;
  posicionPreferida?: string;
  restricciones?: string[];
  metadatos?: Record<string, unknown>;
}

export interface IntentoEnvioProps {
  numero: number;
  fechaIntento: Date;
  sistemaDestino: SistemaEmision;
  estado: EstadoEnvio;
  respuesta?: string;
  codigoError?: string;
  tiempoRespuesta?: number;
  metadatos?: Record<string, unknown>;
}

export interface OrdenPautaProps {
  id?: string;
  contratoId: string;
  numeroOrden: string;
  especificaciones: EspecificacionPautaProps[];
  sistemasDestino: SistemaEmision[];
  estadoGeneral: EstadoEnvio;
  intentosEnvio: IntentoEnvioProps[];
  fechaCreacion: Date;
  fechaEnvio?: Date;
  fechaConfirmacion?: Date;
  usuarioCreador: string;
  observaciones?: string;
  prioridad: number; // 1-10, 10 = máxima prioridad
  requiereAprobacion: boolean;
  aprobadoPor?: string;
  fechaAprobacion?: Date;
  metadatos?: Record<string, unknown>;
}

export class OrdenPauta {
  private _id: string;
  private _contratoId: string;
  private _numeroOrden: string;
  private _especificaciones: EspecificacionPautaProps[];
  private _sistemasDestino: SistemaEmision[];
  private _estadoGeneral: EstadoEnvio;
  private _intentosEnvio: IntentoEnvioProps[];
  private _fechaCreacion: Date;
  private _fechaEnvio?: Date;
  private _fechaConfirmacion?: Date;
  private _usuarioCreador: string;
  private _observaciones?: string;
  private _prioridad: number;
  private _requiereAprobacion: boolean;
  private _aprobadoPor?: string;
  private _fechaAprobacion?: Date;
  private _metadatos: Record<string, unknown>;

  // Configuraciones empresariales Fortune 10
  private static readonly MAX_INTENTOS_ENVIO = 5;
  private static readonly TIMEOUT_ENVIO_MS = 30000; // 30 segundos
  private static readonly DELAY_RETRY_BASE_MS = 1000; // 1 segundo base para backoff exponencial
  private static readonly SISTEMAS_PRIORITARIOS = [SistemaEmision.WIDEORBIT, SistemaEmision.SARA];

  constructor(props: OrdenPautaProps) {
    this.validarPropiedades(props);

    this._id = props.id || this.generarId();
    this._contratoId = props.contratoId;
    this._numeroOrden = props.numeroOrden;
    this._especificaciones = props.especificaciones;
    this._sistemasDestino = props.sistemasDestino;
    this._estadoGeneral = props.estadoGeneral;
    this._intentosEnvio = props.intentosEnvio;
    this._fechaCreacion = props.fechaCreacion;
    this._fechaEnvio = props.fechaEnvio;
    this._fechaConfirmacion = props.fechaConfirmacion;
    this._usuarioCreador = props.usuarioCreador;
    this._observaciones = props.observaciones;
    this._prioridad = props.prioridad;
    this._requiereAprobacion = props.requiereAprobacion;
    this._aprobadoPor = props.aprobadoPor;
    this._fechaAprobacion = props.fechaAprobacion;
    this._metadatos = props.metadatos || {};
  }

  static create(
    contratoId: string,
    especificaciones: EspecificacionPautaProps[],
    sistemasDestino: SistemaEmision[],
    usuarioCreador: string,
    opciones?: Partial<Omit<OrdenPautaProps, 'contratoId' | 'especificaciones' | 'sistemasDestino' | 'usuarioCreador'>>
  ): OrdenPauta {
    const numeroOrden = OrdenPauta.generarNumeroOrden();
    const requiereAprobacion = OrdenPauta.evaluarRequiereAprobacion(especificaciones);

    return new OrdenPauta({
      contratoId,
      numeroOrden,
      especificaciones,
      sistemasDestino,
      usuarioCreador,
      estadoGeneral: EstadoEnvio.PENDIENTE,
      intentosEnvio: [],
      fechaCreacion: new Date(),
      prioridad: 5, // Prioridad media por defecto
      requiereAprobacion,
      ...opciones
    });
  }

  // Getters
  get id(): string { return this._id; }
  get contratoId(): string { return this._contratoId; }
  get numeroOrden(): string { return this._numeroOrden; }
  get especificaciones(): EspecificacionPautaProps[] { return [...this._especificaciones]; }
  get sistemasDestino(): SistemaEmision[] { return [...this._sistemasDestino]; }
  get estadoGeneral(): EstadoEnvio { return this._estadoGeneral; }
  get intentosEnvio(): IntentoEnvioProps[] { return [...this._intentosEnvio]; }
  get fechaCreacion(): Date { return this._fechaCreacion; }
  get fechaEnvio(): Date | undefined { return this._fechaEnvio; }
  get fechaConfirmacion(): Date | undefined { return this._fechaConfirmacion; }
  get usuarioCreador(): string { return this._usuarioCreador; }
  get observaciones(): string | undefined { return this._observaciones; }
  get prioridad(): number { return this._prioridad; }
  get requiereAprobacion(): boolean { return this._requiereAprobacion; }
  get aprobadoPor(): string | undefined { return this._aprobadoPor; }
  get fechaAprobacion(): Date | undefined { return this._fechaAprobacion; }
  get metadatos(): Record<string, unknown> { return { ...this._metadatos }; }

  /**
   * Genera las especificaciones de pauta automáticamente
   */
  generarEspecificaciones(
    parametros: {
      tipoProducto: string;
      duracionCampana: number;
      presupuesto: number;
      audienciaObjetivo: string[];
      horariosPico?: string[];
    }
  ): void {
    const especificacionesGeneradas: EspecificacionPautaProps[] = [];

    // Lógica de generación basada en tipo de producto
    switch (parametros.tipoProducto.toLowerCase()) {
      case 'radio':
        especificacionesGeneradas.push(...this.generarEspecificacionesRadio(parametros));
        break;
      case 'television':
        especificacionesGeneradas.push(...this.generarEspecificacionesTV(parametros));
        break;
      case 'digital':
        especificacionesGeneradas.push(...this.generarEspecificacionesDigital(parametros));
        break;
      default:
        especificacionesGeneradas.push(...this.generarEspecificacionesGenericas(parametros));
    }

    this._especificaciones = especificacionesGeneradas;
    this._metadatos.especificacionesGeneradasAutomaticamente = true;
    this._metadatos.parametrosGeneracion = parametros;
  }

  /**
   * Envía la orden a los sistemas de emisión
   */
  async enviarASistemaEmision(): Promise<{
    success: boolean;
    resultados: Array<{ sistema: SistemaEmision; success: boolean; error?: string }>;
  }> {
    if (this._requiereAprobacion && !this._aprobadoPor) {
      throw new Error('La orden requiere aprobación antes del envío');
    }

    this._estadoGeneral = EstadoEnvio.ENVIANDO;
    this._fechaEnvio = new Date();

    const resultados: Array<{ sistema: SistemaEmision; success: boolean; error?: string }> = [];
    let enviosExitosos = 0;

    // Enviar a cada sistema de destino
    for (const sistema of this._sistemasDestino) {
      try {
        const resultado = await this.enviarASistemaEspecifico(sistema);
        resultados.push({ sistema, success: resultado.success, error: resultado.error });
        
        if (resultado.success) {
          enviosExitosos++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        resultados.push({ sistema, success: false, error: errorMsg });
      }
    }

    // Actualizar estado general
    if (enviosExitosos === this._sistemasDestino.length) {
      this._estadoGeneral = EstadoEnvio.ENVIADO;
    } else if (enviosExitosos > 0) {
      this._estadoGeneral = EstadoEnvio.ERROR; // Envío parcial
    } else {
      this._estadoGeneral = EstadoEnvio.ERROR;
    }

    return {
      success: enviosExitosos > 0,
      resultados
    };
  }

  /**
   * Valida la disponibilidad de inventario
   */
  async validarInventarioDisponible(): Promise<{
    disponible: boolean;
    conflictos: Array<{
      especificacion: number;
      conflicto: string;
      sugerencia?: string;
    }>;
  }> {
    const conflictos: Array<{ especificacion: number; conflicto: string; sugerencia?: string }> = [];

    for (let i = 0; i < this._especificaciones.length; i++) {
      const spec = this._especificaciones[i];
      
      // Simular validación de inventario (en producción sería llamada real)
      const validacion = await this.simularValidacionInventario(spec);
      
      if (!validacion.disponible) {
        conflictos.push({
          especificacion: i,
          conflicto: validacion.razon || 'Inventario no disponible',
          sugerencia: validacion.sugerencia
        });
      }
    }

    return {
      disponible: conflictos.length === 0,
      conflictos
    };
  }

  /**
   * Implementa retry automático con backoff exponencial
   */
  async reintentarEnvio(sistemaEspecifico?: SistemaEmision): Promise<boolean> {
    const sistemasAReintentear = sistemaEspecifico 
      ? [sistemaEspecifico] 
      : this._sistemasDestino.filter(s => this.necesitaReintento(s));

    if (sistemasAReintentear.length === 0) {
      return false;
    }

    this._estadoGeneral = EstadoEnvio.REINTENTANDO;
    let reintentoExitoso = false;

    for (const sistema of sistemasAReintentear) {
      const intentosAnteriores = this._intentosEnvio.filter(i => i.sistemaDestino === sistema).length;
      
      if (intentosAnteriores >= OrdenPauta.MAX_INTENTOS_ENVIO) {
        continue;
      }

      // Calcular delay con backoff exponencial
      const delay = OrdenPauta.DELAY_RETRY_BASE_MS * Math.pow(2, intentosAnteriores);
      await new Promise(resolve => setTimeout(resolve, delay));

      try {
        const resultado = await this.enviarASistemaEspecifico(sistema);
        if (resultado.success) {
          reintentoExitoso = true;
        }
      } catch (error) {
        // Error ya registrado en enviarASistemaEspecifico
      }
    }

    // Actualizar estado general
    if (reintentoExitoso) {
      this._estadoGeneral = EstadoEnvio.ENVIADO;
    } else {
      this._estadoGeneral = EstadoEnvio.ERROR;
    }

    return reintentoExitoso;
  }

  /**
   * Aprueba la orden de pauta
   */
  aprobar(aprobadoPor: string, observaciones?: string): void {
    if (!this._requiereAprobacion) {
      throw new Error('Esta orden no requiere aprobación');
    }

    if (this._aprobadoPor) {
      throw new Error('La orden ya está aprobada');
    }

    this._aprobadoPor = aprobadoPor;
    this._fechaAprobacion = new Date();
    
    if (observaciones) {
      this._observaciones = `${this._observaciones || ''}\nAprobación: ${observaciones}`;
    }

    this._metadatos.aprobacion = {
      usuario: aprobadoPor,
      fecha: this._fechaAprobacion.toISOString(),
      observaciones
    };
  }

  /**
   * Confirma la recepción por parte del sistema de emisión
   */
  confirmarRecepcion(sistema: SistemaEmision, codigoConfirmacion: string): void {
    const ultimoIntento = this._intentosEnvio
      .filter(i => i.sistemaDestino === sistema)
      .sort((a, b) => b.numero - a.numero)[0];

    if (!ultimoIntento || ultimoIntento.estado !== EstadoEnvio.ENVIADO) {
      throw new Error('No hay envío pendiente de confirmación para este sistema');
    }

    ultimoIntento.estado = EstadoEnvio.CONFIRMADO;
    ultimoIntento.respuesta = codigoConfirmacion;

    // Verificar si todos los sistemas han confirmado
    const todosConfirmados = this._sistemasDestino.every(sistema => {
      const ultimoIntentoSistema = this._intentosEnvio
        .filter(i => i.sistemaDestino === sistema)
        .sort((a, b) => b.numero - a.numero)[0];
      return ultimoIntentoSistema?.estado === EstadoEnvio.CONFIRMADO;
    });

    if (todosConfirmados) {
      this._estadoGeneral = EstadoEnvio.CONFIRMADO;
      this._fechaConfirmacion = new Date();
    }
  }

  /**
   * Cancela la orden de pauta
   */
  cancelar(motivo: string, usuarioCancelacion: string): void {
    if (this._estadoGeneral === EstadoEnvio.CONFIRMADO) {
      throw new Error('No se puede cancelar una orden ya confirmada');
    }

    this._estadoGeneral = EstadoEnvio.CANCELADO;
    this._observaciones = `${this._observaciones || ''}\nCancelada: ${motivo}`;
    
    this._metadatos.cancelacion = {
      fecha: new Date().toISOString(),
      motivo,
      usuario: usuarioCancelacion
    };
  }

  /**
   * Obtiene estadísticas de la orden
   */
  getEstadisticas(): {
    totalEspecificaciones: number;
    sistemasDestino: number;
    intentosEnvio: number;
    tiempoPromedioRespuesta: number;
    tasaExito: number;
    diasHastaInicio: number;
  } {
    const tiemposRespuesta = this._intentosEnvio
      .filter(i => i.tiempoRespuesta)
      .map(i => i.tiempoRespuesta!);

    const intentosExitosos = this._intentosEnvio.filter(i => 
      i.estado === EstadoEnvio.ENVIADO || i.estado === EstadoEnvio.CONFIRMADO
    ).length;

    const fechaInicioMasTemprana = Math.min(
      ...this._especificaciones.map(e => e.fechaInicio.getTime())
    );
    const diasHastaInicio = Math.ceil(
      (fechaInicioMasTemprana - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalEspecificaciones: this._especificaciones.length,
      sistemasDestino: this._sistemasDestino.length,
      intentosEnvio: this._intentosEnvio.length,
      tiempoPromedioRespuesta: tiemposRespuesta.length > 0 
        ? tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length 
        : 0,
      tasaExito: this._intentosEnvio.length > 0 
        ? (intentosExitosos / this._intentosEnvio.length) * 100 
        : 0,
      diasHastaInicio
    };
  }

  /**
   * Métodos privados de utilidad
   */
  private async enviarASistemaEspecifico(sistema: SistemaEmision): Promise<{ success: boolean; error?: string }> {
    const numeroIntento = this._intentosEnvio.filter(i => i.sistemaDestino === sistema).length + 1;
    const inicioEnvio = Date.now();

    const intento: IntentoEnvioProps = {
      numero: numeroIntento,
      fechaIntento: new Date(),
      sistemaDestino: sistema,
      estado: EstadoEnvio.ENVIANDO
    };

    this._intentosEnvio.push(intento);

    try {
      // Simular envío al sistema (en producción sería llamada real)
      const resultado = await this.simularEnvioSistema(sistema);
      
      intento.estado = resultado.success ? EstadoEnvio.ENVIADO : EstadoEnvio.ERROR;
      intento.respuesta = resultado.respuesta;
      intento.codigoError = resultado.error;
      intento.tiempoRespuesta = Date.now() - inicioEnvio;

      return { success: resultado.success, error: resultado.error };
    } catch (error) {
      intento.estado = EstadoEnvio.ERROR;
      intento.codigoError = error instanceof Error ? error.message : 'Error desconocido';
      intento.tiempoRespuesta = Date.now() - inicioEnvio;

      return { success: false, error: intento.codigoError };
    }
  }

  private async simularEnvioSistema(sistema: SistemaEmision): Promise<{
    success: boolean;
    respuesta?: string;
    error?: string;
  }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    // Simular diferentes tasas de éxito por sistema
    const tasasExito: Record<SistemaEmision, number> = {
      [SistemaEmision.WIDEORBIT]: 0.95,
      [SistemaEmision.SARA]: 0.90,
      [SistemaEmision.DALET]: 0.85,
      [SistemaEmision.ENCO]: 0.80,
      [SistemaEmision.RADIOFORGE]: 0.75,
      [SistemaEmision.CUSTOM]: 0.70
    };

    const exito = Math.random() < tasasExito[sistema];

    if (exito) {
      return {
        success: true,
        respuesta: `Orden ${this._numeroOrden} recibida correctamente en ${sistema}`
      };
    } else {
      return {
        success: false,
        error: `Error de conexión con ${sistema}`
      };
    }
  }

  private async simularValidacionInventario(spec: EspecificacionPautaProps): Promise<{
    disponible: boolean;
    razon?: string;
    sugerencia?: string;
  }> {
    // Simular validación de inventario
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simular algunos conflictos
    if (spec.horarios.some(h => h.includes('20:00'))) {
      return {
        disponible: false,
        razon: 'Horario prime time saturado',
        sugerencia: 'Considerar horarios 19:00-19:30 o 21:00-21:30'
      };
    }

    return { disponible: true };
  }

  private necesitaReintento(sistema: SistemaEmision): boolean {
    const ultimoIntento = this._intentosEnvio
      .filter(i => i.sistemaDestino === sistema)
      .sort((a, b) => b.numero - a.numero)[0];

    return ultimoIntento?.estado === EstadoEnvio.ERROR && 
           ultimoIntento.numero < OrdenPauta.MAX_INTENTOS_ENVIO;
  }

  private generarEspecificacionesRadio(parametros: unknown): EspecificacionPautaProps[] {
    // Implementación específica para radio
    return [{
      tipo: TipoEspecificacion.SPOT_RADIO,
      duracion: 30,
      horarios: parametros.horariosPico || ['07:00-09:00', '17:00-19:00'],
      frecuenciaDiaria: Math.ceil(parametros.presupuesto / 1000),
      diasSemana: [1, 2, 3, 4, 5], // Lunes a viernes
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + parametros.duracionCampana * 24 * 60 * 60 * 1000),
      materialCreativo: 'spot_radio_default.mp3'
    }];
  }

  private generarEspecificacionesTV(parametros: unknown): EspecificacionPautaProps[] {
    // Implementación específica para TV
    return [{
      tipo: TipoEspecificacion.SPOT_TV,
      duracion: 20,
      horarios: ['20:00-23:00'],
      frecuenciaDiaria: Math.ceil(parametros.presupuesto / 5000),
      diasSemana: [0, 1, 2, 3, 4, 5, 6], // Todos los días
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + parametros.duracionCampana * 24 * 60 * 60 * 1000),
      materialCreativo: 'spot_tv_default.mp4'
    }];
  }

  private generarEspecificacionesDigital(parametros: unknown): EspecificacionPautaProps[] {
    // Implementación específica para digital
    return [{
      tipo: TipoEspecificacion.BANNER_DIGITAL,
      duracion: 0, // Los banners no tienen duración
      horarios: ['00:00-23:59'],
      frecuenciaDiaria: Math.ceil(parametros.presupuesto / 100),
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + parametros.duracionCampana * 24 * 60 * 60 * 1000),
      materialCreativo: 'banner_default.jpg'
    }];
  }

  private generarEspecificacionesGenericas(parametros: unknown): EspecificacionPautaProps[] {
    // Implementación genérica
    return [{
      tipo: TipoEspecificacion.SPOT_RADIO,
      duracion: 30,
      horarios: ['09:00-18:00'],
      frecuenciaDiaria: 5,
      diasSemana: [1, 2, 3, 4, 5],
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + parametros.duracionCampana * 24 * 60 * 60 * 1000),
      materialCreativo: 'material_default'
    }];
  }

  private static generarNumeroOrden(): string {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const secuencia = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `OP${año}${mes}${dia}${secuencia}`;
  }

  private static evaluarRequiereAprobacion(especificaciones: EspecificacionPautaProps[]): boolean {
    // Requiere aprobación si hay especificaciones de alto valor o complejidad
    return especificaciones.some(spec => 
      spec.tipo === TipoEspecificacion.PATROCINIO ||
      spec.frecuenciaDiaria > 20 ||
      spec.horarios.some(h => h.includes('20:00') || h.includes('21:00'))
    );
  }

  private validarPropiedades(props: OrdenPautaProps): void {
    if (!props.contratoId) {
      throw new Error('El ID del contrato es requerido');
    }

    if (!props.numeroOrden) {
      throw new Error('El número de orden es requerido');
    }

    if (!props.especificaciones || props.especificaciones.length === 0) {
      throw new Error('Debe haber al menos una especificación');
    }

    if (!props.sistemasDestino || props.sistemasDestino.length === 0) {
      throw new Error('Debe haber al menos un sistema de destino');
    }

    if (!props.usuarioCreador) {
      throw new Error('El usuario creador es requerido');
    }

    if (props.prioridad < 1 || props.prioridad > 10) {
      throw new Error('La prioridad debe estar entre 1 y 10');
    }
  }

  private generarId(): string {
    return `orden_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  equals(other: OrdenPauta): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `Orden ${this._numeroOrden} (${this._estadoGeneral})`;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this._id,
      contratoId: this._contratoId,
      numeroOrden: this._numeroOrden,
      especificaciones: this._especificaciones.map(e => ({
        ...e,
        fechaInicio: e.fechaInicio.toISOString(),
        fechaFin: e.fechaFin.toISOString()
      })),
      sistemasDestino: this._sistemasDestino,
      estadoGeneral: this._estadoGeneral,
      intentosEnvio: this._intentosEnvio.map(i => ({
        ...i,
        fechaIntento: i.fechaIntento.toISOString()
      })),
      fechaCreacion: this._fechaCreacion.toISOString(),
      fechaEnvio: this._fechaEnvio?.toISOString(),
      fechaConfirmacion: this._fechaConfirmacion?.toISOString(),
      usuarioCreador: this._usuarioCreador,
      observaciones: this._observaciones,
      prioridad: this._prioridad,
      requiereAprobacion: this._requiereAprobacion,
      aprobadoPor: this._aprobadoPor,
      fechaAprobacion: this._fechaAprobacion?.toISOString(),
      metadatos: this._metadatos
    };
  }
}
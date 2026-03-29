/**
 * ENTIDAD: VENCIMIENTO AUSPICIO - TIER 0 ENTERPRISE
 *
 * @description Tracking de vencimientos con cálculo de días restantes,
 * niveles de alerta, countdown 48h auto-eliminación (R1), y alertas de fin (R2).
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { PeriodoVigencia } from '../value-objects/PeriodoVigencia.js'

export type NivelAlertaVencimiento = 'verde' | 'amarillo' | 'rojo' | 'critico' | 'vencido' | 'no_iniciado'

export type AccionSugerida =
  | 'ninguna'
  | 'contactar_cliente_renovacion'
  | 'generar_propuesta_automatica'
  | 'alertar_ejecutivo_no_inicio'
  | 'countdown_48h'
  | 'eliminar_automatico'
  | 'alertar_trafico_fin_manana'
  | 'alertar_trafico_fin_hoy'
  | 'preparar_retiro_materiales'

export interface VencimientoAuspicioProps {
  id: string
  cupoComercialId: string
  programaId: string
  emisoraId: string
  clienteId: string
  clienteNombre: string
  ejecutivoId: string
  ejecutivoNombre: string
  periodoVigencia: PeriodoVigencia
  nivelAlerta: NivelAlertaVencimiento
  accionSugerida: AccionSugerida
  notificacionEnviada: boolean
  countdown48hIniciado: boolean
  countdown48hExpira?: Date
  alertaTraficoEnviada: boolean
  alertaTraficoFinalEnviada: boolean
  historialAcciones: string[]
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class VencimientoAuspicio {
  private _domainEvents: string[] = []

  private constructor(private props: VencimientoAuspicioProps) {}

  static create(props: Omit<VencimientoAuspicioProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): VencimientoAuspicio {
    const now = new Date()
    return new VencimientoAuspicio({
      ...props,
      id: `venc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: VencimientoAuspicioProps): VencimientoAuspicio {
    return new VencimientoAuspicio(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get cupoComercialId(): string { return this.props.cupoComercialId }
  get programaId(): string { return this.props.programaId }
  get emisoraId(): string { return this.props.emisoraId }
  get clienteId(): string { return this.props.clienteId }
  get clienteNombre(): string { return this.props.clienteNombre }
  get ejecutivoId(): string { return this.props.ejecutivoId }
  get ejecutivoNombre(): string { return this.props.ejecutivoNombre }
  get periodoVigencia(): PeriodoVigencia { return this.props.periodoVigencia }
  get nivelAlerta(): NivelAlertaVencimiento { return this.props.nivelAlerta }
  get accionSugerida(): AccionSugerida { return this.props.accionSugerida }
  get countdown48hIniciado(): boolean { return this.props.countdown48hIniciado }
  get countdown48hExpira(): Date | undefined { return this.props.countdown48hExpira }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  get diasRestantes(): number { return this.props.periodoVigencia.diasRestantes }
  get terminaManana(): boolean { return this.props.periodoVigencia.terminaManana() }
  get terminaHoy(): boolean { return this.props.periodoVigencia.terminaHoy() }

  /** Horas restantes del countdown 48h */
  get horasCountdownRestantes(): number {
    if (!this.props.countdown48hExpira) return -1
    const diff = this.props.countdown48hExpira.getTime() - Date.now()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
  }

  // ── Evaluación automática ──

  /** Evalúa y actualiza el nivel de alerta y acción sugerida */
  evaluar(): void {
    const vp = this.props.periodoVigencia

    // R1: Verificar no-inicio
    if (vp.supero48hSinIniciar()) {
      this.props.nivelAlerta = 'no_iniciado'
      this.props.accionSugerida = 'eliminar_automatico'
      if (!this.props.countdown48hIniciado) {
        this.iniciarCountdown48h()
      }
      return
    }

    if (vp.superoFechaInicio() && !this.props.countdown48hIniciado) {
      this.props.nivelAlerta = 'no_iniciado'
      this.props.accionSugerida = 'alertar_ejecutivo_no_inicio'
      this.addDomainEvent(`AlertaNoInicio: ${this.props.clienteNombre} no ha iniciado auspicio`)
      return
    }

    // R2: Verificar fin próximo
    if (this.terminaHoy) {
      this.props.nivelAlerta = 'critico'
      this.props.accionSugerida = 'alertar_trafico_fin_hoy'
      if (!this.props.alertaTraficoFinalEnviada) {
        this.addDomainEvent(`AlertaTraficoFinHoy: ${this.props.clienteNombre} finaliza HOY`)
      }
      return
    }

    if (this.terminaManana) {
      this.props.nivelAlerta = 'rojo'
      this.props.accionSugerida = 'alertar_trafico_fin_manana'
      if (!this.props.alertaTraficoEnviada) {
        this.addDomainEvent(`AlertaTraficoFinManana: ${this.props.clienteNombre} finaliza MAÑANA`)
      }
      return
    }

    // Vencimientos estándar
    if (vp.estaVencido()) {
      this.props.nivelAlerta = 'vencido'
      this.props.accionSugerida = 'preparar_retiro_materiales'
    } else if (vp.venceEnDias(7)) {
      this.props.nivelAlerta = 'rojo'
      this.props.accionSugerida = 'contactar_cliente_renovacion'
    } else if (vp.venceEnDias(15)) {
      this.props.nivelAlerta = 'amarillo'
      this.props.accionSugerida = 'generar_propuesta_automatica'
    } else if (vp.venceEnDias(30)) {
      this.props.nivelAlerta = 'amarillo'
      this.props.accionSugerida = 'contactar_cliente_renovacion'
    } else {
      this.props.nivelAlerta = 'verde'
      this.props.accionSugerida = 'ninguna'
    }

    this.props.fechaActualizacion = new Date()
  }

  /** R1: Iniciar countdown de 48h */
  private iniciarCountdown48h(): void {
    const expira = new Date()
    expira.setHours(expira.getHours() + 48)
    this.props.countdown48hIniciado = true
    this.props.countdown48hExpira = expira
    this.props.accionSugerida = 'countdown_48h'
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`Countdown48hIniciado: ${this.props.clienteNombre} será eliminado en 48h`)
  }

  /** R1: Verificar si expiró el countdown */
  haExpiradoCountdown(): boolean {
    return !!this.props.countdown48hExpira && Date.now() >= this.props.countdown48hExpira.getTime()
  }

  /** Marcar notificaciones como enviadas */
  marcarNotificacionEnviada(): void {
    this.props.notificacionEnviada = true
    this.props.fechaActualizacion = new Date()
  }

  marcarAlertaTraficoEnviada(): void {
    this.props.alertaTraficoEnviada = true
    this.props.fechaActualizacion = new Date()
  }

  marcarAlertaTraficoFinalEnviada(): void {
    this.props.alertaTraficoFinalEnviada = true
    this.props.fechaActualizacion = new Date()
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): VencimientoAuspicioProps { return { ...this.props } }
}

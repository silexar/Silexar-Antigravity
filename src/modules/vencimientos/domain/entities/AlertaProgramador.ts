/**
 * ENTIDAD: ALERTA PROGRAMADOR - TIER 0 ENTERPRISE
 *
 * @description Notificaciones automáticas por inicio/fin de auspicios
 * con confirmación requerida. Incluye alertas R2 al operador de tráfico.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { ConfirmacionProgramador } from '../value-objects/ConfirmacionProgramador.js'

export type TipoAlertaProgramador =
  | 'inicio_auspicio'
  | 'fin_auspicio_manana'
  | 'fin_auspicio_hoy'
  | 'confirmacion_retiro_material'
  | 'no_inicio_cliente'
  | 'extension_aprobada'
  | 'cambio_material'
  | 'urgente'

export type CanalNotificacion = 'sistema' | 'email' | 'whatsapp' | 'push'

export interface AlertaProgramadorProps {
  id: string
  emisoraId: string
  programaId: string
  programaNombre: string
  cupoComercialId: string
  clienteNombre: string
  tipo: TipoAlertaProgramador
  titulo: string
  mensaje: string
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  destinatarioId: string
  destinatarioNombre: string
  canalesNotificacion: CanalNotificacion[]
  confirmacion: ConfirmacionProgramador
  leida: boolean
  fechaLectura?: Date
  fechaExpiracion?: Date
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class AlertaProgramador {
  private _domainEvents: string[] = []

  private constructor(private props: AlertaProgramadorProps) {}

  static create(props: Omit<AlertaProgramadorProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): AlertaProgramador {
    const now = new Date()
    return new AlertaProgramador({
      ...props,
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: AlertaProgramadorProps): AlertaProgramador {
    return new AlertaProgramador(props)
  }

  /** R2: Crear alerta de fin de auspicio mañana */
  static crearAlertaFinManana(data: {
    emisoraId: string; programaId: string; programaNombre: string
    cupoComercialId: string; clienteNombre: string
    operadorTraficoId: string; operadorTraficoNombre: string
  }): AlertaProgramador {
    return AlertaProgramador.create({
      ...data,
      tipo: 'fin_auspicio_manana',
      titulo: `⚠️ MAÑANA finaliza: ${data.clienteNombre}`,
      mensaje: `El auspicio de ${data.clienteNombre} en el programa "${data.programaNombre}" finaliza MAÑANA. Verificar retiro de materiales (presentaciones/cierres).`,
      prioridad: 'alta',
      destinatarioId: data.operadorTraficoId,
      destinatarioNombre: data.operadorTraficoNombre,
      canalesNotificacion: ['sistema', 'email'],
      confirmacion: ConfirmacionProgramador.pendiente(data.operadorTraficoId, data.operadorTraficoNombre),
      leida: false,
      fechaExpiracion: undefined
    })
  }

  /** R2: Crear alerta de fin de auspicio hoy */
  static crearAlertaFinHoy(data: {
    emisoraId: string; programaId: string; programaNombre: string
    cupoComercialId: string; clienteNombre: string
    operadorTraficoId: string; operadorTraficoNombre: string
  }): AlertaProgramador {
    return AlertaProgramador.create({
      ...data,
      tipo: 'fin_auspicio_hoy',
      titulo: `🚨 HOY finaliza: ${data.clienteNombre}`,
      mensaje: `El auspicio de ${data.clienteNombre} en "${data.programaNombre}" finaliza HOY. Confirmar retiro de materiales y limpieza de parrilla.`,
      prioridad: 'critica',
      destinatarioId: data.operadorTraficoId,
      destinatarioNombre: data.operadorTraficoNombre,
      canalesNotificacion: ['sistema', 'email', 'whatsapp'],
      confirmacion: ConfirmacionProgramador.pendiente(data.operadorTraficoId, data.operadorTraficoNombre),
      leida: false,
      fechaExpiracion: undefined
    })
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get emisoraId(): string { return this.props.emisoraId }
  get programaId(): string { return this.props.programaId }
  get programaNombre(): string { return this.props.programaNombre }
  get cupoComercialId(): string { return this.props.cupoComercialId }
  get clienteNombre(): string { return this.props.clienteNombre }
  get tipo(): TipoAlertaProgramador { return this.props.tipo }
  get titulo(): string { return this.props.titulo }
  get mensaje(): string { return this.props.mensaje }
  get prioridad(): string { return this.props.prioridad }
  get destinatarioId(): string { return this.props.destinatarioId }
  get destinatarioNombre(): string { return this.props.destinatarioNombre }
  get confirmacion(): ConfirmacionProgramador { return this.props.confirmacion }
  get leida(): boolean { return this.props.leida }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  get requiereAccion(): boolean { return this.props.confirmacion.requiereAccion() }
  get estaExpirada(): boolean { return !!this.props.fechaExpiracion && new Date() > this.props.fechaExpiracion }

  get prioridadColor(): string {
    const colores: Record<string, string> = {
      'baja': 'bg-blue-500', 'media': 'bg-yellow-500',
      'alta': 'bg-orange-500', 'critica': 'bg-red-500'
    }
    return colores[this.props.prioridad] || 'bg-gray-500'
  }

  // ── Métodos ──
  marcarLeida(): void {
    this.props.leida = true
    this.props.fechaLectura = new Date()
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  confirmar(comentario?: string): void {
    this.props.confirmacion = this.props.confirmacion.confirmar(comentario)
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`AlertaConfirmada: ${this.props.titulo} por ${this.props.destinatarioNombre}`)
  }

  rechazar(comentario: string): void {
    this.props.confirmacion = this.props.confirmacion.rechazar(comentario)
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`AlertaRechazada: ${this.props.titulo} por ${this.props.destinatarioNombre}`)
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): AlertaProgramadorProps { return { ...this.props } }
}

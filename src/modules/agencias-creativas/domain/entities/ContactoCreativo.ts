/**
 * 👤 ENTIDAD CONTACTO CREATIVO - TIER 0
 * 
 * Representa a las personas clave dentro de una agencia creativa
 * Directores creativos, productores, diseñadores, etc.
 */

// Tipos base para entidades
interface WithId<T = any> {
  id: string
}

interface WithTimestamps<T = any> {
  createdAt: Date
  updatedAt: Date
}

export interface ContactoCreativoProps {
  // Información personal
  nombre: string
  apellidos: string
  email: string
  telefono: string
  celular?: string

  // Información profesional
  cargo: string
  departamento: string
  especialidad: string[]
  nivelSenioridad: 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead' | 'Director'

  // Relación con agencia
  agenciaCreativaId: string
  esPrincipal: boolean
  esDecisionMaker: boolean
  nivelAutorizacion: 'Bajo' | 'Medio' | 'Alto' | 'Total'

  // Información de contacto
  linkedinUrl?: string
  portfolioPersonal?: string
  behanceUrl?: string
  dribbbleUrl?: string

  // Métricas de colaboración
  metricas: {
    proyectosGestionados: number
    tiempoRespuestaPromedio: number // horas
    satisfaccionColaboracion: number // 0-10
    disponibilidadSemanal: number // horas
    proyectosActivosActuales: number
  }

  // Preferencias de comunicación
  preferencias: {
    canalPreferido: 'Email' | 'WhatsApp' | 'Slack' | 'Telefono' | 'Teams'
    horarioDisponible: {
      inicio: string // HH:mm
      fin: string // HH:mm
      diasSemana: number[] // 0-6 (domingo-sábado)
    }
    zonaHoraria: string
    idiomasManejo: string[]
  }

  // Experiencia y habilidades
  experiencia: {
    añosExperiencia: number
    industriasExperiencia: string[]
    tiposProyectoExperiencia: string[]
    herramientasDominio: string[]
    certificaciones: string[]
  }

  // Estado y actividad
  activo: boolean
  disponible: boolean
  fechaUltimaActividad: Date

  // Metadata
  tenantId: string
  creadoPor: string

  // Notas internas
  notasInternas?: string

  // Evaluación de performance
  evaluacion?: {
    comunicacion: number // 1-5
    proactividad: number // 1-5
    calidadTrabajo: number // 1-5
    cumplimientoPlazos: number // 1-5
    colaboracion: number // 1-5
    ultimaEvaluacion: Date
    evaluadoPor: string
  }
}

export class ContactoCreativo implements WithId<ContactoCreativoProps>, WithTimestamps<ContactoCreativoProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(
    id: string,
    private props: ContactoCreativoProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()

    this.validate()
  }

  // Getters principales
  get nombreCompleto(): string {
    return `${this.props.nombre} ${this.props.apellidos}`
  }

  get email(): string {
    return this.props.email
  }

  get cargo(): string {
    return this.props.cargo
  }

  get agenciaCreativaId(): string {
    return this.props.agenciaCreativaId
  }

  get esPrincipal(): boolean {
    return this.props.esPrincipal
  }

  get esDecisionMaker(): boolean {
    return this.props.esDecisionMaker
  }

  get activo(): boolean {
    return this.props.activo
  }

  get disponible(): boolean {
    return this.props.disponible
  }

  get metricas() {
    return this.props.metricas
  }

  // Métodos de negocio

  /**
   * Establece como contacto principal de la agencia
   */
  establecerComoPrincipal(): void {
    this.props.esPrincipal = true
    this.touch()
  }

  /**
   * Remueve como contacto principal
   */
  removerComoPrincipal(): void {
    this.props.esPrincipal = false
    this.touch()
  }

  /**
   * Actualiza la disponibilidad
   */
  actualizarDisponibilidad(disponible: boolean): void {
    this.props.disponible = disponible
    this.props.fechaUltimaActividad = new Date()
    this.touch()
  }

  /**
   * Registra actividad en un proyecto
   */
  registrarActividadProyecto(): void {
    this.props.fechaUltimaActividad = new Date()
    this.touch()
  }

  /**
   * Asigna un nuevo proyecto
   */
  asignarProyecto(): void {
    this.props.metricas.proyectosGestionados += 1
    this.props.metricas.proyectosActivosActuales += 1
    this.props.fechaUltimaActividad = new Date()
    this.touch()
  }

  /**
   * Completa un proyecto
   */
  completarProyecto(satisfaccion: number): void {
    this.props.metricas.proyectosActivosActuales = Math.max(0, this.props.metricas.proyectosActivosActuales - 1)

    // Actualizar satisfacción promedio
    const totalProyectos = this.props.metricas.proyectosGestionados
    this.props.metricas.satisfaccionColaboracion =
      (this.props.metricas.satisfaccionColaboracion * (totalProyectos - 1) + satisfaccion) / totalProyectos

    this.touch()
  }

  /**
   * Actualiza el tiempo de respuesta promedio
   */
  actualizarTiempoRespuesta(tiempoRespuesta: number): void {
    const totalProyectos = this.props.metricas.proyectosGestionados
    if (totalProyectos > 0) {
      this.props.metricas.tiempoRespuestaPromedio =
        (this.props.metricas.tiempoRespuestaPromedio * (totalProyectos - 1) + tiempoRespuesta) / totalProyectos
    } else {
      this.props.metricas.tiempoRespuestaPromedio = tiempoRespuesta
    }
    this.touch()
  }

  /**
   * Verifica si está disponible en un horario específico
   */
  estaDisponibleEn(fecha: Date): boolean {
    if (!this.props.disponible || !this.props.activo) {
      return false
    }

    const diaSemana = fecha.getDay()
    const hora = fecha.getHours()
    const minutos = fecha.getMinutes()
    const tiempoMinutos = hora * 60 + minutos

    const horario = this.props.preferencias.horarioDisponible
    const inicioMinutos = this.parseTimeToMinutes(horario.inicio)
    const finMinutos = this.parseTimeToMinutes(horario.fin)

    const diaDisponible = horario.diasSemana.includes(diaSemana)
    const horaDisponible = tiempoMinutos >= inicioMinutos && tiempoMinutos <= finMinutos

    return diaDisponible && horaDisponible
  }

  /**
   * Obtiene el canal de comunicación preferido
   */
  getCanalPreferido(): string {
    return this.props.preferencias.canalPreferido
  }

  /**
   * Verifica si puede autorizar un presupuesto
   */
  puedeAutorizar(monto: number): boolean {
    if (!this.props.esDecisionMaker) {
      return false
    }

    switch (this.props.nivelAutorizacion) {
      case 'Bajo':
        return monto <= 1000000 // 1M CLP
      case 'Medio':
        return monto <= 5000000 // 5M CLP
      case 'Alto':
        return monto <= 20000000 // 20M CLP
      case 'Total':
        return true
      default:
        return false
    }
  }

  /**
   * Actualiza la evaluación de performance
   */
  actualizarEvaluacion(
    comunicacion: number,
    proactividad: number,
    calidadTrabajo: number,
    cumplimientoPlazos: number,
    colaboracion: number,
    evaluadoPor: string
  ): void {
    this.props.evaluacion = {
      comunicacion,
      proactividad,
      calidadTrabajo,
      cumplimientoPlazos,
      colaboracion,
      ultimaEvaluacion: new Date(),
      evaluadoPor
    }
    this.touch()
  }

  /**
   * Obtiene el score promedio de evaluación
   */
  getScoreEvaluacion(): number {
    if (!this.props.evaluacion) {
      return 0
    }

    const { comunicacion, proactividad, calidadTrabajo, cumplimientoPlazos, colaboracion } = this.props.evaluacion
    return (comunicacion + proactividad + calidadTrabajo + cumplimientoPlazos + colaboracion) / 5
  }

  /**
   * Añade una especialidad
   */
  añadirEspecialidad(especialidad: string): void {
    if (!this.props.especialidad.includes(especialidad)) {
      this.props.especialidad.push(especialidad)
      this.touch()
    }
  }

  /**
   * Actualiza información de contacto
   */
  actualizarContacto(email: string, telefono: string, celular?: string): void {
    this.props.email = email
    this.props.telefono = telefono
    if (celular) {
      this.props.celular = celular
    }
    this.touch()
  }

  /**
   * Desactiva el contacto
   */
  desactivar(): void {
    this.props.activo = false
    this.props.disponible = false
    this.touch()
  }

  /**
   * Activa el contacto
   */
  activar(): void {
    this.props.activo = true
    this.props.disponible = true
    this.touch()
  }

  /**
   * Convierte tiempo HH:mm a minutos
   */
  private parseTimeToMinutes(time: string): number {
    const parts = time.split(':')
    const hours = parseInt(parts[0] || '0', 10)
    const minutes = parseInt(parts[1] || '0', 10)
    return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes)
  }

  /**
   * Obtiene todas las propiedades
   */
  getProps(): ContactoCreativoProps {
    return { ...this.props }
  }

  /**
   * Actualiza el timestamp de modificación
   */
  private touch(): void {
    (this as unknown).updatedAt = new Date()
  }

  /**
   * Valida la entidad
   */
  private validate(): void {
    if (!this.props.nombre?.trim()) {
      throw new Error('El nombre es requerido')
    }

    if (!this.props.apellidos?.trim()) {
      throw new Error('Los apellidos son requeridos')
    }

    if (!this.props.email?.trim()) {
      throw new Error('El email es requerido')
    }

    if (!this.props.telefono?.trim()) {
      throw new Error('El teléfono es requerido')
    }

    if (!this.props.cargo?.trim()) {
      throw new Error('El cargo es requerido')
    }

    if (!this.props.agenciaCreativaId?.trim()) {
      throw new Error('El ID de la agencia es requerido')
    }

    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }

    if (!this.props.creadoPor?.trim()) {
      throw new Error('El campo creadoPor es requerido')
    }

    // Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.props.email)) {
      throw new Error('El formato del email es inválido')
    }
  }

  /**
   * Crea una nueva instancia
   */
  static create(props: ContactoCreativoProps): ContactoCreativo {
    const id = globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return new ContactoCreativo(id, props)
  }

  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: ContactoCreativoProps,
    createdAt: Date,
    updatedAt: Date
  ): ContactoCreativo {
    return new ContactoCreativo(id, props, createdAt, updatedAt)
  }
}
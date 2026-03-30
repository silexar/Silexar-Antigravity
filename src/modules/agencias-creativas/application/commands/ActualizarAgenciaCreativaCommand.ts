/**
 * 🔄 COMMAND: ACTUALIZAR AGENCIA CREATIVA
 * 
 * Comando para actualizar información de una agencia creativa existente
 */

import { TipoAgenciaCreativa } from '../../domain/value-objects/TipoAgenciaCreativa'
import { EspecializacionCreativa } from '../../domain/value-objects/EspecializacionCreativa'
import { NivelExperiencia } from '../../domain/value-objects/NivelExperiencia'
import { RangoPresupuesto } from '../../domain/value-objects/RangoPresupuesto'
import { EstadoDisponibilidad } from '../../domain/value-objects/EstadoDisponibilidad'

export interface ActualizarAgenciaCreativaCommandProps {
  // Identificación
  id: string
  
  // Información básica (opcional para actualización)
  nombre?: string
  razonSocial?: string
  email?: string
  telefono?: string
  sitioWeb?: string
  
  // Clasificación y especialización
  tipo?: TipoAgenciaCreativa
  especializaciones?: EspecializacionCreativa[]
  nivelExperiencia?: NivelExperiencia
  rangoPresupuesto?: RangoPresupuesto
  
  // Ubicación
  direccion?: string
  ciudad?: string
  region?: string
  pais?: string
  coordenadas?: {
    latitud: number
    longitud: number
  }
  
  // Estado
  estadoDisponibilidad?: EstadoDisponibilidad
  activo?: boolean
  
  // Capacidades técnicas
  capacidadesTecnicas?: {
    video4K?: boolean
    audioHD?: boolean
    motionGraphics?: boolean
    colorGrading?: boolean
    animacion3D?: boolean
    liveAction?: boolean
    postProduccion?: boolean
    efectosEspeciales?: boolean
    realidadAumentada?: boolean
    realidadVirtual?: boolean
  }
  
  // Certificaciones y premios
  certificaciones?: string[]
  premios?: Array<{
    nombre: string
    año: number
    categoria: string
    proyecto?: string
  }>
  
  // Información comercial
  añosExperiencia?: number
  numeroEmpleados?: number
  clientesPrincipales?: string[]
  sectoresExperiencia?: string[]
  
  // Portfolio y redes sociales
  portfolioUrl?: string
  behanceUrl?: string
  dribbbleUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  
  // Configuración de colaboración
  configuracion?: {
    tiempoRespuestaPromedio?: number
    metodologiaTrabajo?: string[]
    herramientasColaboracion?: string[]
    formatosEntrega?: string[]
    politicasRevision?: {
      numeroRevisionesIncluidas?: number
      tiempoRevision?: number
      costoRevisionAdicional?: number
    }
  }
  
  // Contacto principal
  contactoPrincipalId?: string
  
  // Metadata de actualización
  actualizadoPor: string
  motivoActualizacion?: string
  
  // Campos específicos para actualización
  camposActualizar: string[] // Lista de campos que se van a actualizar
}

export class ActualizarAgenciaCreativaCommand {
  constructor(public readonly props: ActualizarAgenciaCreativaCommandProps) {
    this.validate()
  }
  
  /**
   * Valida el comando
   */
  private validate(): void {
    if (!this.props.id?.trim()) {
      throw new Error('El ID de la agencia es requerido')
    }
    
    if (!this.props.actualizadoPor?.trim()) {
      throw new Error('El campo actualizadoPor es requerido')
    }
    
    if (!this.props.camposActualizar || this.props.camposActualizar.length === 0) {
      throw new Error('Debe especificar al menos un campo para actualizar')
    }
    
    // Validar email si se proporciona
    if (this.props.email && !this.isValidEmail(this.props.email)) {
      throw new Error('El formato del email es inválido')
    }
    
    // Validar URLs si se proporcionan
    if (this.props.sitioWeb && !this.isValidUrl(this.props.sitioWeb)) {
      throw new Error('El formato del sitio web es inválido')
    }
    
    if (this.props.portfolioUrl && !this.isValidUrl(this.props.portfolioUrl)) {
      throw new Error('El formato de la URL del portfolio es inválido')
    }
    
    // Validar coordenadas si se proporcionan
    if (this.props.coordenadas) {
      const { latitud, longitud } = this.props.coordenadas
      if (latitud < -90 || latitud > 90) {
        throw new Error('La latitud debe estar entre -90 y 90')
      }
      if (longitud < -180 || longitud > 180) {
        throw new Error('La longitud debe estar entre -180 y 180')
      }
    }
    
    // Validar años de experiencia
    if (this.props.añosExperiencia !== undefined && this.props.añosExperiencia < 0) {
      throw new Error('Los años de experiencia no pueden ser negativos')
    }
    
    // Validar número de empleados
    if (this.props.numeroEmpleados !== undefined && this.props.numeroEmpleados < 1) {
      throw new Error('El número de empleados debe ser mayor a 0')
    }
    
    // Validar configuración de colaboración
    if (this.props.configuracion?.tiempoRespuestaPromedio !== undefined && 
        this.props.configuracion.tiempoRespuestaPromedio < 0) {
      throw new Error('El tiempo de respuesta promedio no puede ser negativo')
    }
    
    if (this.props.configuracion?.politicasRevision?.numeroRevisionesIncluidas !== undefined &&
        this.props.configuracion.politicasRevision.numeroRevisionesIncluidas < 0) {
      throw new Error('El número de revisiones incluidas no puede ser negativo')
    }
  }
  
  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  /**
   * Valida formato de URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  /**
   * Verifica si un campo específico debe ser actualizado
   */
  shouldUpdateField(fieldName: string): boolean {
    return this.props.camposActualizar.includes(fieldName)
  }
  
  /**
   * Obtiene solo los campos que deben ser actualizados
   */
  getFieldsToUpdate(): Partial<ActualizarAgenciaCreativaCommandProps> {
    const fieldsToUpdate: Partial<ActualizarAgenciaCreativaCommandProps> = {
      id: this.props.id,
      actualizadoPor: this.props.actualizadoPor,
      motivoActualizacion: this.props.motivoActualizacion
    }
    
    this.props.camposActualizar.forEach(field => {
      if (field in this.props) {
        (fieldsToUpdate as unknown)[field] = (this.props as unknown)[field]
      }
    })
    
    return fieldsToUpdate
  }
  
  /**
   * Verifica si la actualización incluye cambios críticos
   */
  hasCriticalChanges(): boolean {
    const criticalFields = [
      'nombre',
      'razonSocial',
      'tipo',
      'especializaciones',
      'activo',
      'estadoDisponibilidad'
    ]
    
    return this.props.camposActualizar.some(field => criticalFields.includes(field))
  }
  
  /**
   * Verifica si la actualización incluye cambios en capacidades
   */
  hasCapabilityChanges(): boolean {
    return this.props.camposActualizar.includes('capacidadesTecnicas') ||
           this.props.camposActualizar.includes('especializaciones') ||
           this.props.camposActualizar.includes('certificaciones')
  }
  
  /**
   * Verifica si la actualización incluye cambios de contacto
   */
  hasContactChanges(): boolean {
    const contactFields = [
      'email',
      'telefono',
      'direccion',
      'ciudad',
      'region',
      'pais',
      'contactoPrincipalId'
    ]
    
    return this.props.camposActualizar.some(field => contactFields.includes(field))
  }
  
  /**
   * Obtiene un resumen de los cambios
   */
  getChangesSummary(): string {
    const changes = this.props.camposActualizar.map(field => {
      switch (field) {
        case 'nombre':
          return 'Nombre de la agencia'
        case 'razonSocial':
          return 'Razón social'
        case 'email':
          return 'Email de contacto'
        case 'telefono':
          return 'Teléfono de contacto'
        case 'tipo':
          return 'Tipo de agencia'
        case 'especializaciones':
          return 'Especializaciones creativas'
        case 'estadoDisponibilidad':
          return 'Estado de disponibilidad'
        case 'capacidadesTecnicas':
          return 'Capacidades técnicas'
        case 'certificaciones':
          return 'Certificaciones'
        case 'premios':
          return 'Premios y reconocimientos'
        case 'configuracion':
          return 'Configuración de colaboración'
        default:
          return field
      }
    })
    
    return `Actualización de: ${changes.join(', ')}`
  }
  
  /**
   * Crea un comando de actualización completa
   */
  static createFullUpdate(
    id: string,
    props: Omit<ActualizarAgenciaCreativaCommandProps, 'id' | 'camposActualizar'>,
    actualizadoPor: string
  ): ActualizarAgenciaCreativaCommand {
    const allFields = Object.keys(props).filter(key => 
      key !== 'id' && key !== 'actualizadoPor' && key !== 'camposActualizar'
    )
    
    return new ActualizarAgenciaCreativaCommand({
      ...props,
      id,
      actualizadoPor,
      camposActualizar: allFields
    })
  }
  
  /**
   * Crea un comando de actualización parcial
   */
  static createPartialUpdate(
    id: string,
    updates: Partial<ActualizarAgenciaCreativaCommandProps>,
    actualizadoPor: string,
    motivoActualizacion?: string
  ): ActualizarAgenciaCreativaCommand {
    const camposActualizar = Object.keys(updates).filter(key => 
      key !== 'id' && key !== 'actualizadoPor' && key !== 'camposActualizar' && key !== 'motivoActualizacion'
    )
    
    return new ActualizarAgenciaCreativaCommand({
      ...updates,
      id,
      actualizadoPor,
      motivoActualizacion,
      camposActualizar
    })
  }
  
  /**
   * Crea un comando para actualizar solo el estado
   */
  static createStatusUpdate(
    id: string,
    estadoDisponibilidad: EstadoDisponibilidad,
    activo: boolean,
    actualizadoPor: string,
    motivo?: string
  ): ActualizarAgenciaCreativaCommand {
    return new ActualizarAgenciaCreativaCommand({
      id,
      estadoDisponibilidad,
      activo,
      actualizadoPor,
      motivoActualizacion: motivo || 'Actualización de estado',
      camposActualizar: ['estadoDisponibilidad', 'activo']
    })
  }
  
  /**
   * Crea un comando para actualizar capacidades técnicas
   */
  static createCapabilitiesUpdate(
    id: string,
    capacidadesTecnicas: ActualizarAgenciaCreativaCommandProps['capacidadesTecnicas'],
    certificaciones: string[],
    actualizadoPor: string
  ): ActualizarAgenciaCreativaCommand {
    return new ActualizarAgenciaCreativaCommand({
      id,
      capacidadesTecnicas,
      certificaciones,
      actualizadoPor,
      motivoActualizacion: 'Actualización de capacidades técnicas',
      camposActualizar: ['capacidadesTecnicas', 'certificaciones']
    })
  }
}
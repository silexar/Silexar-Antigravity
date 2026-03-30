/**
 * 🎨 ENTIDAD ESPECIALIDAD CREATIVA - TIER 0
 * 
 * Representa las diferentes especialidades creativas que puede ofrecer una agencia
 * Audio, Video, Gráfica, Digital, BTL, etc.
 */

import { WithTimestamps, WithId } from '@/types'

export interface EspecialidadCreativaProps {
  // Información básica
  nombre: string
  codigo: string
  descripcion: string
  categoria: 'AUDIOVISUAL' | 'GRAFICO' | 'DIGITAL' | 'BTL' | 'ESTRATEGICO' | 'TECNICO'
  
  // Clasificación técnica
  complejidadTecnica: 'BAJA' | 'MEDIA' | 'ALTA' | 'EXPERTA'
  tiempoPromedioProduccion: number // horas
  recursosRequeridos: string[]
  
  // Herramientas y tecnologías
  herramientasPrincipales: string[]
  tecnologiasRequeridas: string[]
  certificacionesRecomendadas: string[]
  
  // Métricas de mercado
  demandaMercado: number // 0-100%
  competitividad: number // 0-100%
  rangoPresupuestoPromedio: {
    minimo: number
    maximo: number
    moneda: string
  }
  
  // Subtipos y variaciones
  subtipos: Array<{
    nombre: string
    descripcion: string
    especializacionAdicional: boolean
  }>
  
  // Integración con otros servicios
  serviciosComplementarios: string[]
  dependencias: string[]
  
  // Estado y configuración
  activo: boolean
  disponibleParaAsignacion: boolean
  
  // Metadata
  tenantId: string
  creadoPor: string
}

export class EspecialidadCreativa implements WithId<EspecialidadCreativaProps>, WithTimestamps<EspecialidadCreativaProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  
  constructor(
    id: string,
    private props: EspecialidadCreativaProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    
    this.validate()
  }
  
  // Getters principales
  get nombre(): string {
    return this.props.nombre
  }
  
  get codigo(): string {
    return this.props.codigo
  }
  
  get categoria(): EspecialidadCreativaProps['categoria'] {
    return this.props.categoria
  }
  
  get complejidadTecnica(): EspecialidadCreativaProps['complejidadTecnica'] {
    return this.props.complejidadTecnica
  }
  
  get tiempoPromedioProduccion(): number {
    return this.props.tiempoPromedioProduccion
  }
  
  get activo(): boolean {
    return this.props.activo
  }
  
  // Métodos de negocio
  
  /**
   * Verifica si requiere una herramienta específica
   */
  requiereHerramienta(herramienta: string): boolean {
    return this.props.herramientasPrincipales.some(h => 
      h.toLowerCase().includes(herramienta.toLowerCase())
    )
  }
  
  /**
   * Verifica si es compatible con un presupuesto
   */
  esCompatibleConPresupuesto(presupuesto: number): boolean {
    return presupuesto >= this.props.rangoPresupuestoPromedio.minimo &&
           presupuesto <= this.props.rangoPresupuestoPromedio.maximo
  }
  
  /**
   * Obtiene el multiplicador de complejidad
   */
  getMultiplicadorComplejidad(): number {
    const multiplicadores = {
      'BAJA': 1.0,
      'MEDIA': 1.3,
      'ALTA': 1.7,
      'EXPERTA': 2.2
    }
    
    return multiplicadores[this.props.complejidadTecnica]
  }
  
  /**
   * Calcula el tiempo estimado para un proyecto específico
   */
  calcularTiempoEstimado(factorComplejidad: number = 1): number {
    return this.props.tiempoPromedioProduccion * factorComplejidad * this.getMultiplicadorComplejidad()
  }
  
  /**
   * Verifica si tiene dependencias no resueltas
   */
  tieneDependenciasPendientes(especialidadesDisponibles: string[]): boolean {
    return this.props.dependencias.some(dep => 
      !especialidadesDisponibles.includes(dep)
    )
  }
  
  /**
   * Obtiene servicios complementarios recomendados
   */
  getServiciosComplementarios(): string[] {
    return [...this.props.serviciosComplementarios]
  }
  
  /**
   * Actualiza la demanda de mercado
   */
  actualizarDemandaMercado(nuevaDemanda: number): void {
    if (nuevaDemanda < 0 || nuevaDemanda > 100) {
      throw new Error('La demanda debe estar entre 0 y 100')
    }
    
    this.props.demandaMercado = nuevaDemanda
    this.touch()
  }
  
  /**
   * Añade una herramienta principal
   */
  añadirHerramienta(herramienta: string): void {
    if (!this.props.herramientasPrincipales.includes(herramienta)) {
      this.props.herramientasPrincipales.push(herramienta)
      this.touch()
    }
  }
  
  /**
   * Añade un subtipo
   */
  añadirSubtipo(nombre: string, descripcion: string, especializacionAdicional: boolean = false): void {
    const existeSubtipo = this.props.subtipos.some(s => s.nombre === nombre)
    if (!existeSubtipo) {
      this.props.subtipos.push({
        nombre,
        descripcion,
        especializacionAdicional
      })
      this.touch()
    }
  }
  
  /**
   * Desactiva la especialidad
   */
  desactivar(): void {
    this.props.activo = false
    this.props.disponibleParaAsignacion = false
    this.touch()
  }
  
  /**
   * Activa la especialidad
   */
  activar(): void {
    this.props.activo = true
    this.props.disponibleParaAsignacion = true
    this.touch()
  }
  
  /**
   * Obtiene todas las propiedades
   */
  getProps(): EspecialidadCreativaProps {
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
      throw new Error('El nombre de la especialidad es requerido')
    }
    
    if (!this.props.codigo?.trim()) {
      throw new Error('El código es requerido')
    }
    
    if (this.props.tiempoPromedioProduccion <= 0) {
      throw new Error('El tiempo promedio de producción debe ser mayor a 0')
    }
    
    if (this.props.rangoPresupuestoPromedio.minimo < 0) {
      throw new Error('El presupuesto mínimo no puede ser negativo')
    }
    
    if (this.props.rangoPresupuestoPromedio.maximo < this.props.rangoPresupuestoPromedio.minimo) {
      throw new Error('El presupuesto máximo debe ser mayor al mínimo')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
  }
  
  /**
   * Crea una nueva instancia
   */
  static create(props: EspecialidadCreativaProps): EspecialidadCreativa {
    const id = crypto.randomUUID()
    return new EspecialidadCreativa(id, props)
  }
  
  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: EspecialidadCreativaProps,
    createdAt: Date,
    updatedAt: Date
  ): EspecialidadCreativa {
    return new EspecialidadCreativa(id, props, createdAt, updatedAt)
  }
  
  /**
   * Crea especialidades predefinidas del sistema
   */
  static createDefaultSpecialties(tenantId: string, creadoPor: string): EspecialidadCreativa[] {
    const especialidades = [
      {
        nombre: 'Video Comercial',
        codigo: 'VIDEO_COM',
        descripcion: 'Producción de comerciales de televisión y video digital',
        categoria: 'AUDIOVISUAL' as const,
        complejidadTecnica: 'ALTA' as const,
        tiempoPromedioProduccion: 120,
        recursosRequeridos: ['Cámara 4K', 'Equipo de iluminación', 'Equipo de audio'],
        herramientasPrincipales: ['Adobe Premiere', 'DaVinci Resolve', 'After Effects'],
        tecnologiasRequeridas: ['4K Recording', 'Color Grading', 'Audio Mixing'],
        certificacionesRecomendadas: ['Adobe Certified Expert', 'Blackmagic Certified'],
        demandaMercado: 85,
        competitividad: 90,
        rangoPresupuestoPromedio: { minimo: 2000000, maximo: 50000000, moneda: 'CLP' },
        subtipos: [
          { nombre: 'Comercial TV', descripcion: 'Para televisión tradicional', especializacionAdicional: false },
          { nombre: 'Video Digital', descripcion: 'Para plataformas digitales', especializacionAdicional: false }
        ],
        serviciosComplementarios: ['Audio Post-Producción', 'Motion Graphics', 'Color Grading'],
        dependencias: [],
        activo: true,
        disponibleParaAsignacion: true,
        tenantId,
        creadoPor
      },
      {
        nombre: 'Spot Radial',
        codigo: 'AUDIO_SPOT',
        descripcion: 'Producción de spots publicitarios para radio',
        categoria: 'AUDIOVISUAL' as const,
        complejidadTecnica: 'MEDIA' as const,
        tiempoPromedioProduccion: 24,
        recursosRequeridos: ['Estudio de grabación', 'Micrófonos profesionales'],
        herramientasPrincipales: ['Pro Tools', 'Logic Pro', 'Adobe Audition'],
        tecnologiasRequeridas: ['Audio Recording', 'Sound Design', 'Audio Mastering'],
        certificacionesRecomendadas: ['Pro Tools Certified', 'Audio Engineering Society'],
        demandaMercado: 70,
        competitividad: 75,
        rangoPresupuestoPromedio: { minimo: 500000, maximo: 5000000, moneda: 'CLP' },
        subtipos: [
          { nombre: 'Spot 30s', descripcion: 'Formato estándar de 30 segundos', especializacionAdicional: false },
          { nombre: 'Jingle', descripcion: 'Música publicitaria memorable', especializacionAdicional: true }
        ],
        serviciosComplementarios: ['Locución', 'Música Original', 'Sound Design'],
        dependencias: [],
        activo: true,
        disponibleParaAsignacion: true,
        tenantId,
        creadoPor
      },
      {
        nombre: 'Diseño Gráfico',
        codigo: 'GRAFICO_DIS',
        descripcion: 'Diseño de piezas gráficas publicitarias',
        categoria: 'GRAFICO' as const,
        complejidadTecnica: 'MEDIA' as const,
        tiempoPromedioProduccion: 16,
        recursosRequeridos: ['Computador con software de diseño'],
        herramientasPrincipales: ['Adobe Creative Suite', 'Figma', 'Sketch'],
        tecnologiasRequeridas: ['Vector Graphics', 'Photo Editing', 'Typography'],
        certificacionesRecomendadas: ['Adobe Certified Expert', 'Graphic Design Certification'],
        demandaMercado: 95,
        competitividad: 85,
        rangoPresupuestoPromedio: { minimo: 200000, maximo: 10000000, moneda: 'CLP' },
        subtipos: [
          { nombre: 'Print Advertising', descripcion: 'Publicidad impresa', especializacionAdicional: false },
          { nombre: 'Digital Graphics', descripcion: 'Gráficas para medios digitales', especializacionAdicional: false }
        ],
        serviciosComplementarios: ['Fotografía', 'Ilustración', 'Branding'],
        dependencias: [],
        activo: true,
        disponibleParaAsignacion: true,
        tenantId,
        creadoPor
      }
    ]
    
    return especialidades.map(esp => EspecialidadCreativa.create(esp))
  }
}
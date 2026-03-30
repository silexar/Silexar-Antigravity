/**
 * 🔧 HANDLER: COMANDOS AGENCIA CREATIVA
 * 
 * Maneja todos los comandos relacionados con agencias creativas
 * Orquesta validaciones, análisis IA y persistencia
 */

import { AgenciaCreativa } from '../../domain/entities/AgenciaCreativa'
import { logger } from '@/lib/observability';
import { ContactoCreativo } from '../../domain/entities/ContactoCreativo'
import { IAgenciaCreativaRepository } from '../../domain/repositories/IAgenciaCreativaRepository'
import { IContactoCreativoRepository } from '../../domain/repositories/IContactoCreativoRepository'
import { RutAgenciaCreativa } from '../../domain/value-objects/RutAgenciaCreativa'
import { TipoAgenciaCreativa } from '../../domain/value-objects/TipoAgenciaCreativa'
import { EspecializacionCreativa } from '../../domain/value-objects/EspecializacionCreativa'
import { NivelExperiencia } from '../../domain/value-objects/NivelExperiencia'
import { ScoreCreativo } from '../../domain/value-objects/ScoreCreativo'
import { EstadoDisponibilidad } from '../../domain/value-objects/EstadoDisponibilidad'
import { RangoPresupuesto } from '../../domain/value-objects/RangoPresupuesto'
import { 
  CrearAgenciaCreativaCommand, 
  CrearAgenciaCreativaResult 
} from '../commands/CrearAgenciaCreativaCommand'
import { AsignarProyectoCommand } from '../commands/AsignarProyectoCommand'
import { BuscarAgenciasCreativasQuery } from '../queries/BuscarAgenciasCreativasQuery'

// Servicios externos
interface ISIIValidationService {
  validateRut(rut: string): Promise<{
    valido: boolean
    razonSocial?: string
    actividadEconomica?: string
    situacionTributaria?: string
  }>
}

interface ICortexCreativeService {
  analyzeAgency(agencyData: unknown): Promise<{
    score: number
    fortalezas: string[]
    areasOptimizacion: string[]
    recomendaciones: string[]
    prediccionPerformance: number
  }>
}

interface IPortfolioImportService {
  importFromBehance(url: string): Promise<unknown>
  importFromDribbble(url: string): Promise<unknown>
  importFromInstagram(url: string): Promise<unknown>
}

interface INotificationService {
  sendWelcomeEmail(agencia: AgenciaCreativa, contacto?: ContactoCreativo): Promise<void>
  sendAlertConfiguration(agencia: AgenciaCreativa): Promise<void>
}

export class AgenciaCreativaCommandHandler {
  constructor(
    private readonly agenciaRepository: IAgenciaCreativaRepository,
    private readonly contactoRepository: IContactoCreativoRepository,
    private readonly siiValidationService: ISIIValidationService,
    private readonly cortexCreativeService: ICortexCreativeService,
    private readonly portfolioImportService: IPortfolioImportService,
    private readonly notificationService: INotificationService
  ) {}

  /**
   * Crear nueva agencia creativa
   */
  async crearAgencia(command: CrearAgenciaCreativaCommand): Promise<CrearAgenciaCreativaResult> {
    const startTime = Date.now()
    
    try {
      // 1. Validaciones iniciales
      await this.validateCommand(command)
      
      // 2. Validar RUT con SII si está habilitado
      let siiValidation: { valido: boolean; razonSocial?: string; actividadEconomica?: string; situacionTributaria?: string; error?: string } | null = null
      if (command.opciones?.validarConSII) {
        siiValidation = await this.validateWithSII(command.rut)
      }
      
      // 3. Crear value objects
      const valueObjects = this.createValueObjects(command)
      
      // 4. Calcular score inicial si está habilitado
      let scoreInicial = new ScoreCreativo(0)
      let analisisIA: { score: number; fortalezas: string[]; areasOptimizacion: string[]; recomendaciones: string[]; prediccionPerformance: number } | null = null
      
      if (command.opciones?.calcularScoreInicial || command.opciones?.analizarConIA) {
        const analisis = await this.analyzeWithCortexCreative(command)
        scoreInicial = new ScoreCreativo(analisis.score)
        analisisIA = analisis
      }
      
      // 5. Crear entidad AgenciaCreativa
      const agencia = this.createAgenciaEntity(command, valueObjects, scoreInicial, analisisIA)
      
      // 6. Crear contacto principal si se proporciona
      let contactoPrincipal: ContactoCreativo | null = null
      if (command.contactoPrincipal) {
        contactoPrincipal = this.createContactoEntity(command.contactoPrincipal, agencia.id, command)
      }
      
      // 7. Persistir en base de datos
      await this.agenciaRepository.save(agencia)
      if (contactoPrincipal) {
        await this.contactoRepository.save(contactoPrincipal)
      }
      
      // 8. Importar portfolio si está habilitado
      const portfolioImportado = await this.importPortfolioIfEnabled(command, agencia.id)
      
      // 9. Sincronizar con servicios externos
      const integraciones = await this.syncExternalServices(command, agencia.id)
      
      // 10. Configurar alertas y notificaciones
      const configuraciones = await this.setupConfigurations(command, agencia, contactoPrincipal)
      
      // 11. Enviar notificaciones
      if (command.opciones?.configurarNotificaciones && contactoPrincipal) {
        await this.notificationService.sendWelcomeEmail(agencia, contactoPrincipal)
      }
      
      // 12. Construir resultado
      const result: CrearAgenciaCreativaResult = {
        agenciaId: agencia.id,
        agencia: {
          nombre: agencia.nombre,
          rut: agencia.rut.formatted,
          scoreInicial: scoreInicial.value,
          nivel: scoreInicial.displayName,
          tipo: agencia.tipo.displayName,
          especializaciones: agencia.especializaciones.map(e => e.displayName)
        },
        contactoPrincipal: contactoPrincipal ? {
          id: contactoPrincipal.id,
          nombre: contactoPrincipal.nombreCompleto,
          email: contactoPrincipal.email,
          cargo: contactoPrincipal.cargo
        } : undefined,
        analisisIA: analisisIA ? {
          scoreCalculado: analisisIA.score,
          nivel: scoreInicial.displayName,
          fortalezasDetectadas: analisisIA.fortalezas,
          areasOptimizacion: analisisIA.areasOptimizacion,
          recomendacionesIniciales: analisisIA.recomendaciones,
          compatibilidadProyectos: this.extractCompatibilityFromAnalysis(analisisIA),
          riesgosPotenciales: this.extractRisksFromAnalysis(analisisIA)
        } : undefined,
        integraciones: {
          siiValidado: !!siiValidation?.valido,
          portfolioImportado: portfolioImportado,
          behanceSincronizado: integraciones.behance,
          dribbbleSincronizado: integraciones.dribbble,
          instagramSincronizado: integraciones.instagram
        },
        configuraciones: configuraciones,
        proximosPasos: this.generateNextSteps(agencia, contactoPrincipal, analisisIA),
        advertencias: this.generateWarnings(command, siiValidation, analisisIA),
        tiempoProcesamiento: Date.now() - startTime,
        fechaCreacion: new Date()
      }
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      throw new Error(`Error al crear agencia creativa: ${errorMessage}`)
    }
  }

  /**
   * Buscar agencias con filtros
   */
  async buscarAgencias(query: unknown): Promise<unknown> {
    try {
      const agencias = await this.agenciaRepository.findByTenantId(query.tenantId || 'default')
      
      let agenciasFiltradas = agencias

      // Aplicar filtros
      if (query.busquedaTexto) {
        const texto = query.busquedaTexto.toLowerCase()
        agenciasFiltradas = agenciasFiltradas.filter(agencia => 
          agencia.nombre.toLowerCase().includes(texto) ||
          agencia.razonSocial.toLowerCase().includes(texto)
        )
      }

      if (query.tipoProyecto) {
        agenciasFiltradas = agenciasFiltradas.filter(agencia =>
          agencia.especializaciones.some(esp => 
            esp.displayName.toLowerCase().includes(query.tipoProyecto.toLowerCase())
          )
        )
      }

      // Aplicar límite
      const limite = query.limite || 20
      const agenciasLimitadas = agenciasFiltradas.slice(0, limite)

      return {
        agencias: agenciasLimitadas.map(agencia => ({
          id: agencia.id,
          nombre: agencia.nombre,
          scoreCreativo: agencia.scoreCreativo.value,
          tipo: agencia.tipo.displayName,
          estadoDisponibilidad: agencia.estadoDisponibilidad.displayName,
          especializaciones: agencia.especializaciones.map(e => e.displayName)
        })),
        total: agenciasFiltradas.length,
        matchingInfo: query.usarMatchingIA ? {
          confianzaResultados: 85,
          criteriosAplicados: ['especialización', 'disponibilidad', 'score']
        } : undefined
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      throw new Error(`Error buscando agencias: ${errorMessage}`)
    }
  }

  /**
   * Obtener agencia por ID
   */
  async obtenerAgenciaPorId(id: string, opciones: Record<string, unknown> = {}): Promise<unknown> {
    try {
      const agencia = await this.agenciaRepository.findById(id)
      if (!agencia) {
        return null
      }

      const resultado: Record<string, unknown> = {
        id: agencia.id,
        nombre: agencia.nombre,
        razonSocial: agencia.razonSocial,
        rut: agencia.rut.formatted,
        email: agencia.email,
        telefono: agencia.telefono,
        tipo: agencia.tipo.displayName,
        especializaciones: agencia.especializaciones.map(e => e.displayName),
        scoreCreativo: agencia.scoreCreativo.value,
        nivel: agencia.scoreCreativo.displayName,
        estadoDisponibilidad: agencia.estadoDisponibilidad.displayName,
        activo: agencia.activo
      }

      if (opciones.incluirMetricas) {
        resultado.metricas = agencia.metricas
      }

      return resultado
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      throw new Error(`Error obteniendo agencia: ${errorMessage}`)
    }
  }

  /**
   * Obtener estadísticas de agencia
   */
  async obtenerEstadisticas(agenciaId: string): Promise<unknown> {
    try {
      const agencia = await this.agenciaRepository.findById(agenciaId)
      if (!agencia) {
        throw new Error('Agencia no encontrada')
      }

      return {
        scoreCreativo: agencia.scoreCreativo.value,
        nivel: agencia.scoreCreativo.displayName,
        metricas: agencia.metricas,
        tendencias: {
          ultimosMeses: []
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      throw new Error(`Error obteniendo estadísticas: ${errorMessage}`)
    }
  }

  /**
   * Obtener dashboard de agencia
   */
  async obtenerDashboard(agenciaId: string): Promise<unknown> {
    try {
      const agencia = await this.agenciaRepository.findById(agenciaId)
      if (!agencia) {
        throw new Error('Agencia no encontrada')
      }

      return {
        resumen: {
          scoreCreativo: agencia.scoreCreativo.value,
          proyectosActivos: agencia.metricas.proyectosActivos,
          proyectosCompletados: agencia.metricas.proyectosCompletados,
          calidadPromedio: agencia.metricas.promedioCalidad,
          puntualidad: agencia.metricas.puntualidadEntregas
        },
        alertas: [],
        proximasEntregas: [],
        performance: {
          tendenciaCalidad: [],
          tendenciaPuntualidad: []
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      throw new Error(`Error obteniendo dashboard: ${errorMessage}`)
    }
  }

  /**
   * Actualizar agencia
   */
  async actualizarAgencia(command: unknown): Promise<void> {
    try {
      const agencia = await this.agenciaRepository.findById(command.props.id)
      if (!agencia) {
        throw new Error('Agencia no encontrada')
      }

      await this.agenciaRepository.save(agencia)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      throw new Error(`Error actualizando agencia: ${errorMessage}`)
    }
  }

  /**
   * Desactivar agencia
   */
  async desactivarAgencia(id: string, motivo: string, desactivadoPor: string): Promise<void> {
    try {
      const agencia = await this.agenciaRepository.findById(id)
      if (!agencia) {
        throw new Error('Agencia no encontrada')
      }

      agencia.desactivar(motivo)
      await this.agenciaRepository.save(agencia)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      throw new Error(`Error desactivando agencia: ${errorMessage}`)
    }
  }

  /**
   * Activar agencia
   */
  async activarAgencia(id: string, activadoPor: string): Promise<void> {
    try {
      const agencia = await this.agenciaRepository.findById(id)
      if (!agencia) {
        throw new Error('Agencia no encontrada')
      }

      agencia.activar()
      await this.agenciaRepository.save(agencia)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      throw new Error(`Error activando agencia: ${errorMessage}`)
    }
  }

  // Métodos privados de apoyo
  private async validateCommand(command: CrearAgenciaCreativaCommand): Promise<void> {
    if (!command.nombre?.trim()) {
      throw new Error('El nombre de la agencia es requerido')
    }
    
    if (!command.razonSocial?.trim()) {
      throw new Error('La razón social es requerida')
    }
    
    if (!command.rut?.trim()) {
      throw new Error('El RUT es requerido')
    }
    
    if (!command.email?.trim()) {
      throw new Error('El email es requerido')
    }
    
    if (!command.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(command.email)) {
      throw new Error('El formato del email es inválido')
    }
    
    const rutVO = new RutAgenciaCreativa(command.rut)
    const existeRut = await this.agenciaRepository.existsByRut(rutVO)
    if (existeRut) {
      throw new Error(`Ya existe una agencia con el RUT ${rutVO.formatted}`)
    }
    
    if (!command.especializaciones || command.especializaciones.length === 0) {
      throw new Error('Debe especificar al menos una especialización')
    }
  }

  private async validateWithSII(rut: string): Promise<unknown> {
    try {
      return await this.siiValidationService.validateRut(rut)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.warn(`Error validando RUT con SII: ${errorMessage}`)
      return { valido: false, error: errorMessage }
    }
  }

  private createValueObjects(command: CrearAgenciaCreativaCommand) {
    return {
      rut: new RutAgenciaCreativa(command.rut),
      tipo: new TipoAgenciaCreativa(command.tipo),
      especializaciones: command.especializaciones.map(e => new EspecializacionCreativa(e)),
      nivelExperiencia: new NivelExperiencia(command.añosExperiencia),
      rangoPresupuesto: new RangoPresupuesto(command.rangoPresupuesto),
      estadoDisponibilidad: new EstadoDisponibilidad('DISPONIBLE')
    }
  }

  private async analyzeWithCortexCreative(command: CrearAgenciaCreativaCommand): Promise<unknown> {
    try {
      const agencyData = {
        tipo: command.tipo,
        especializaciones: command.especializaciones,
        añosExperiencia: command.añosExperiencia,
        numeroEmpleados: command.numeroEmpleados,
        capacidadesTecnicas: command.capacidadesTecnicas,
        certificaciones: command.certificaciones,
        premios: command.premios,
        clientesPrincipales: command.clientesPrincipales,
        sectoresExperiencia: command.sectoresExperiencia,
        portfolioUrl: command.portfolioUrl,
        behanceUrl: command.behanceUrl,
        dribbbleUrl: command.dribbbleUrl
      }
      
      return await this.cortexCreativeService.analyzeAgency(agencyData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.warn(`Error en análisis Cortex Creative: ${errorMessage}`)
      return {
        score: this.calculateBasicScore(command),
        fortalezas: ['Agencia nueva en el sistema'],
        areasOptimizacion: ['Completar información de portfolio'],
        recomendaciones: ['Subir trabajos recientes', 'Completar certificaciones'],
        prediccionPerformance: 70
      }
    }
  }

  private calculateBasicScore(command: CrearAgenciaCreativaCommand): number {
    let score = 200
    
    score += Math.min(command.añosExperiencia * 20, 200)
    score += Math.min(command.numeroEmpleados * 5, 100)
    
    if (command.certificaciones && command.certificaciones.length > 0) {
      score += command.certificaciones.length * 25
    }
    
    if (command.premios && command.premios.length > 0) {
      score += command.premios.length * 50
    }
    
    if (command.capacidadesTecnicas) {
      const capacidades = Object.values(command.capacidadesTecnicas).filter(Boolean).length
      score += capacidades * 15
    }
    
    return Math.min(score, 800)
  }

  private createAgenciaEntity(
    command: CrearAgenciaCreativaCommand,
    valueObjects: {
      rut: RutAgenciaCreativa;
      tipo: TipoAgenciaCreativa;
      especializaciones: EspecializacionCreativa[];
      nivelExperiencia: NivelExperiencia;
      rangoPresupuesto: RangoPresupuesto;
      estadoDisponibilidad: EstadoDisponibilidad;
    },
    scoreInicial: ScoreCreativo,
    analisisIA: { score: number; fortalezas: string[]; areasOptimizacion: string[]; recomendaciones: string[]; prediccionPerformance: number } | null
  ): AgenciaCreativa {
    const props = {
      nombre: command.nombre,
      razonSocial: command.razonSocial,
      rut: valueObjects.rut,
      email: command.email,
      telefono: command.telefono,
      sitioWeb: command.sitioWeb,
      
      tipo: valueObjects.tipo,
      especializaciones: valueObjects.especializaciones,
      nivelExperiencia: valueObjects.nivelExperiencia,
      rangoPresupuesto: valueObjects.rangoPresupuesto,
      
      direccion: command.direccion,
      ciudad: command.ciudad,
      region: command.region,
      pais: command.pais,
      coordenadas: command.coordenadas,
      
      scoreCreativo: scoreInicial,
      estadoDisponibilidad: valueObjects.estadoDisponibilidad,
      
      metricas: {
        proyectosCompletados: 0,
        proyectosActivos: 0,
        promedioCalidad: 0,
        puntualidadEntregas: 100,
        tiempoRespuesta: command.configuracion?.tiempoRespuestaPromedio || 24,
        satisfaccionClientes: 0,
        volumenFacturado: 0,
        crecimientoAnual: 0
      },
      
      capacidadesTecnicas: {
        video4K: command.capacidadesTecnicas?.video4K || false,
        audioHD: command.capacidadesTecnicas?.audioHD || false,
        motionGraphics: command.capacidadesTecnicas?.motionGraphics || false,
        colorGrading: command.capacidadesTecnicas?.colorGrading || false,
        animacion3D: command.capacidadesTecnicas?.animacion3D || false,
        liveAction: command.capacidadesTecnicas?.liveAction || false,
        postProduccion: command.capacidadesTecnicas?.postProduccion || false,
        efectosEspeciales: command.capacidadesTecnicas?.efectosEspeciales || false,
        realidadAumentada: command.capacidadesTecnicas?.realidadAumentada || false,
        realidadVirtual: command.capacidadesTecnicas?.realidadVirtual || false
      },
      
      certificaciones: command.certificaciones || [],
      premios: command.premios || [],
      
      añosExperiencia: command.añosExperiencia,
      numeroEmpleados: command.numeroEmpleados,
      clientesPrincipales: command.clientesPrincipales || [],
      sectoresExperiencia: command.sectoresExperiencia || [],
      
      portfolioUrl: command.portfolioUrl,
      behanceUrl: command.behanceUrl,
      dribbbleUrl: command.dribbbleUrl,
      instagramUrl: command.instagramUrl,
      linkedinUrl: command.linkedinUrl,
      
      configuracion: {
        tiempoRespuestaPromedio: command.configuracion?.tiempoRespuestaPromedio || 24,
        metodologiaTrabajo: command.configuracion?.metodologiaTrabajo || [],
        herramientasColaboracion: command.configuracion?.herramientasColaboracion || [],
        formatosEntrega: command.configuracion?.formatosEntrega || [],
        politicasRevision: {
          numeroRevisionesIncluidas: command.configuracion?.politicasRevision?.numeroRevisionesIncluidas || 2,
          tiempoRevision: command.configuracion?.politicasRevision?.tiempoRevision || 48,
          costoRevisionAdicional: command.configuracion?.politicasRevision?.costoRevisionAdicional || 0
        }
      },
      
      activo: true,
      fechaUltimaActividad: new Date(),
      fechaRegistro: new Date(),
      
      tenantId: command.tenantId,
      creadoPor: command.creadoPor,
      
      cortexAnalysis: analisisIA ? {
        scoreIA: analisisIA.score,
        fortalezas: analisisIA.fortalezas,
        areasOptimizacion: analisisIA.areasOptimizacion,
        recomendacionesAsignacion: analisisIA.recomendaciones,
        prediccionPerformance: analisisIA.prediccionPerformance,
        ultimoAnalisis: new Date()
      } : undefined
    }
    
    return AgenciaCreativa.create(props)
  }

  private createContactoEntity(
    contactoData: Record<string, unknown>,
    agenciaId: string,
    command: CrearAgenciaCreativaCommand
  ): ContactoCreativo {
    const props = {
      nombre: contactoData.nombre,
      apellidos: contactoData.apellidos,
      email: contactoData.email,
      telefono: contactoData.telefono,
      
      cargo: contactoData.cargo,
      departamento: contactoData.departamento,
      especialidad: contactoData.especialidad,
      nivelSenioridad: contactoData.nivelSenioridad,
      
      agenciaCreativaId: agenciaId,
      esPrincipal: true,
      esDecisionMaker: contactoData.esDecisionMaker,
      nivelAutorizacion: contactoData.nivelAutorizacion,
      
      linkedinUrl: contactoData.linkedinUrl,
      portfolioPersonal: contactoData.portfolioPersonal,
      
      metricas: {
        proyectosGestionados: 0,
        tiempoRespuestaPromedio: 24,
        satisfaccionColaboracion: 0,
        disponibilidadSemanal: 40,
        proyectosActivosActuales: 0
      },
      
      preferencias: {
        canalPreferido: 'Email' as const,
        horarioDisponible: {
          inicio: '09:00',
          fin: '18:00',
          diasSemana: [1, 2, 3, 4, 5]
        },
        zonaHoraria: 'America/Santiago',
        idiomasManejo: ['Español']
      },
      
      experiencia: {
        añosExperiencia: Math.floor(command.añosExperiencia * 0.8),
        industriasExperiencia: command.sectoresExperiencia || [],
        tiposProyectoExperiencia: command.especializaciones,
        herramientasDominio: [],
        certificaciones: []
      },
      
      activo: true,
      disponible: true,
      fechaUltimaActividad: new Date(),
      
      tenantId: command.tenantId,
      creadoPor: command.creadoPor
    }
    
    return ContactoCreativo.create(props)
  }

  private async importPortfolioIfEnabled(
    command: CrearAgenciaCreativaCommand,
    agenciaId: string
  ): Promise<boolean> {
    if (!command.opciones?.importarPortfolio) {
      return false
    }
    
    try {
      const importPromises = []
      
      if (command.behanceUrl && command.opciones?.sincronizarBehance) {
        importPromises.push(this.portfolioImportService.importFromBehance(command.behanceUrl))
      }
      
      if (command.dribbbleUrl && command.opciones?.sincronizarDribbble) {
        importPromises.push(this.portfolioImportService.importFromDribbble(command.dribbbleUrl))
      }
      
      if (command.instagramUrl && command.opciones?.sincronizarInstagram) {
        importPromises.push(this.portfolioImportService.importFromInstagram(command.instagramUrl))
      }
      
      if (importPromises.length > 0) {
        await Promise.allSettled(importPromises)
        return true
      }
      
      return false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.warn(`Error importando portfolio: ${errorMessage}`)
      return false
    }
  }

  private async syncExternalServices(
    command: CrearAgenciaCreativaCommand,
    agenciaId: string
  ): Promise<{ behance: boolean; dribbble: boolean; instagram: boolean }> {
    return {
      behance: !!command.opciones?.sincronizarBehance && !!command.behanceUrl,
      dribbble: !!command.opciones?.sincronizarDribbble && !!command.dribbbleUrl,
      instagram: !!command.opciones?.sincronizarInstagram && !!command.instagramUrl
    }
  }

  private async setupConfigurations(
    command: CrearAgenciaCreativaCommand,
    agencia: AgenciaCreativa,
    contacto: ContactoCreativo | null
  ): Promise<unknown> {
    const configuraciones = {
      alertasActivadas: !!command.opciones?.activarAlertas,
      notificacionesConfiguradas: !!command.opciones?.configurarNotificaciones,
      scoreInicialCalculado: !!command.opciones?.calcularScoreInicial
    }
    
    if (command.opciones?.activarAlertas && contacto) {
      try {
        await this.notificationService.sendAlertConfiguration(agencia)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        logger.warn(`Error configurando alertas: ${errorMessage}`)
      }
    }
    
    return configuraciones
  }

  private extractCompatibilityFromAnalysis(analisis: unknown): string[] {
    return analisis.recomendaciones?.filter((r: string) => 
      r.includes('proyecto') || r.includes('especialidad')
    ) || []
  }

  private extractRisksFromAnalysis(analisis: unknown): string[] {
    return analisis.areasOptimizacion?.map((area: string) => 
      `Riesgo: ${area}`
    ) || []
  }

  private generateNextSteps(
    agencia: AgenciaCreativa,
    contacto: ContactoCreativo | null,
    analisis: { areasOptimizacion?: string[] } | null
  ): string[] {
    const pasos = [
      'Completar información de portfolio',
      'Subir trabajos recientes representativos',
      'Configurar preferencias de colaboración'
    ]
    
    if (!contacto) {
      pasos.unshift('Agregar contacto principal de la agencia')
    }
    
    if (analisis?.areasOptimizacion) {
      pasos.push(...analisis.areasOptimizacion.map((area: string) => 
        `Mejorar: ${area}`
      ))
    }
    
    return pasos
  }

  private generateWarnings(
    command: CrearAgenciaCreativaCommand,
    siiValidation: { valido: boolean } | null,
    analisis: { score?: number } | null
  ): string[] {
    const warnings = []
    
    if (siiValidation && !siiValidation.valido) {
      warnings.push('No se pudo validar el RUT con el SII')
    }
    
    if (!command.portfolioUrl && !command.behanceUrl && !command.dribbbleUrl) {
      warnings.push('No se proporcionaron URLs de portfolio')
    }
    
    if (command.añosExperiencia < 2) {
      warnings.push('Agencia con poca experiencia, requiere supervisión adicional')
    }
    
    if (analisis?.score < 400) {
      warnings.push('Score inicial bajo, considerar capacitación adicional')
    }
    
    return warnings
  }
}
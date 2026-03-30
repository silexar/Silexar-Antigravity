import { logger } from '@/lib/observability';
/**
 * 🏛️ SERVICIO: VALIDACIÓN SII
 * 
 * Servicio para validar datos tributarios con el Servicio de Impuestos Internos de Chile
 */

export interface SIIValidationResult {
  valido: boolean
  razonSocial?: string
  giro?: string
  direccion?: string
  comuna?: string
  region?: string
  fechaInicio?: Date
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
  categoria?: string
  errores?: string[]
}

export interface SIICompanyData {
  rut: string
  razonSocial: string
  giro: string
  direccion: string
  comuna: string
  region: string
  fechaInicio: Date
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
  categoria: string
  actividadesEconomicas: Array<{
    codigo: string
    descripcion: string
    categoria: string
  }>
  representanteLegal?: {
    nombre: string
    rut: string
    cargo: string
  }
}

export class SIIValidationService {
  private readonly baseUrl: string
  private readonly apiKey?: string
  private readonly timeout: number = 10000 // 10 segundos
  
  constructor(config?: {
    baseUrl?: string
    apiKey?: string
    timeout?: number
  }) {
    // En producción, estos valores vendrían de variables de entorno
    this.baseUrl = config?.baseUrl || process.env.SII_API_URL || 'https://api.sii.cl'
    this.apiKey = config?.apiKey || process.env.SII_API_KEY
    this.timeout = config?.timeout || 10000
  }
  
  /**
   * Valida un RUT con el SII
   */
  async validarRUT(rut: string): Promise<SIIValidationResult> {
    try {
      // Limpiar y formatear RUT
      const rutLimpio = this.limpiarRUT(rut)
      
      if (!this.validarFormatoRUT(rutLimpio)) {
        return {
          valido: false,
          errores: ['Formato de RUT inválido']
        }
      }
      
      // En un entorno real, aquí haríamos la llamada al API del SII
      // Por ahora, simulamos la validación
      const resultado = await this.consultarSII(rutLimpio)
      
      return resultado
      
    } catch (error) {
      logger.error('Error validando RUT con SII:', error)
      return {
        valido: false,
        errores: ['Error de conexión con el SII']
      }
    }
  }
  
  /**
   * Obtiene información completa de una empresa por RUT
   */
  async obtenerDatosEmpresa(rut: string): Promise<SIICompanyData | null> {
    try {
      const rutLimpio = this.limpiarRUT(rut)
      
      if (!this.validarFormatoRUT(rutLimpio)) {
        throw new Error('Formato de RUT inválido')
      }
      
      // Simulación de consulta al SII
      const datos = await this.consultarDatosCompletos(rutLimpio)
      
      return datos
      
    } catch (error) {
      logger.error('Error obteniendo datos de empresa:', error)
      return null
    }
  }
  
  /**
   * Verifica si una empresa está activa en el SII
   */
  async verificarEstadoEmpresa(rut: string): Promise<{
    activa: boolean
    estado: string
    fechaUltimaActualizacion?: Date
  }> {
    try {
      const datos = await this.obtenerDatosEmpresa(rut)
      
      if (!datos) {
        return {
          activa: false,
          estado: 'NO_ENCONTRADA'
        }
      }
      
      return {
        activa: datos.estado === 'ACTIVO',
        estado: datos.estado,
        fechaUltimaActualizacion: new Date()
      }
      
    } catch (error) {
      logger.error('Error verificando estado de empresa:', error)
      return {
        activa: false,
        estado: 'ERROR'
      }
    }
  }
  
  /**
   * Busca empresas por razón social
   */
  async buscarPorRazonSocial(razonSocial: string): Promise<Array<{
    rut: string
    razonSocial: string
    giro: string
    estado: string
  }>> {
    try {
      // Simulación de búsqueda en SII
      const resultados = await this.buscarEnSII(razonSocial)
      
      return resultados
      
    } catch (error) {
      logger.error('Error buscando por razón social:', error)
      return []
    }
  }
  
  /**
   * Valida actividades económicas de una empresa
   */
  async validarActividadesEconomicas(rut: string, actividades: string[]): Promise<{
    validas: string[]
    invalidas: string[]
    sugerencias: Array<{
      codigo: string
      descripcion: string
      similitud: number
    }>
  }> {
    try {
      const datos = await this.obtenerDatosEmpresa(rut)
      
      if (!datos) {
        return {
          validas: [],
          invalidas: actividades,
          sugerencias: []
        }
      }
      
      const actividadesEmpresa = datos.actividadesEconomicas.map(a => a.codigo)
      const validas = actividades.filter(a => actividadesEmpresa.includes(a))
      const invalidas = actividades.filter(a => !actividadesEmpresa.includes(a))
      
      // Generar sugerencias para actividades inválidas
      const sugerencias = await this.generarSugerenciasActividades(invalidas, datos.actividadesEconomicas)
      
      return {
        validas,
        invalidas,
        sugerencias
      }
      
    } catch (error) {
      logger.error('Error validando actividades económicas:', error)
      return {
        validas: [],
        invalidas: actividades,
        sugerencias: []
      }
    }
  }
  
  /**
   * Limpia y formatea un RUT
   */
  private limpiarRUT(rut: string): string {
    return rut.replace(/[^0-9kK]/g, '').toUpperCase()
  }
  
  /**
   * Valida el formato de un RUT chileno
   */
  private validarFormatoRUT(rut: string): boolean {
    if (rut.length < 8 || rut.length > 9) {
      return false
    }
    
    const cuerpo = rut.slice(0, -1)
    const dv = rut.slice(-1)
    
    // Validar que el cuerpo sean solo números
    if (!/^\d+$/.test(cuerpo)) {
      return false
    }
    
    // Validar dígito verificador
    const dvCalculado = this.calcularDV(cuerpo)
    return dv === dvCalculado
  }
  
  /**
   * Calcula el dígito verificador de un RUT
   */
  private calcularDV(rut: string): string {
    let suma = 0
    let multiplicador = 2
    
    for (let i = rut.length - 1; i >= 0; i--) {
      suma += parseInt(rut[i]) * multiplicador
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
    }
    
    const resto = suma % 11
    const dv = 11 - resto
    
    if (dv === 11) return '0'
    if (dv === 10) return 'K'
    return dv.toString()
  }
  
  /**
   * Consulta datos básicos en el SII (simulado)
   */
  private async consultarSII(rut: string): Promise<SIIValidationResult> {
    // En un entorno real, aquí haríamos la llamada HTTP al API del SII
    // Por ahora, simulamos diferentes escenarios
    
    await this.delay(1000) // Simular latencia de red
    
    // Simulación de diferentes casos
    const casos = this.obtenerCasosSimulacion()
    const caso = casos[rut] || casos.default
    
    return caso
  }
  
  /**
   * Consulta datos completos de una empresa (simulado)
   */
  private async consultarDatosCompletos(rut: string): Promise<SIICompanyData | null> {
    await this.delay(1500) // Simular latencia de red
    
    // Simulación de datos de empresa
    const empresasSimuladas: Record<string, SIICompanyData> = {
      '96790240-3': {
        rut: '96790240-3',
        razonSocial: 'ESTUDIO CREATIVO INNOVADOR LTDA',
        giro: 'SERVICIOS DE PUBLICIDAD Y MARKETING',
        direccion: 'AV. PROVIDENCIA 1234, OFICINA 567',
        comuna: 'PROVIDENCIA',
        region: 'REGION METROPOLITANA',
        fechaInicio: new Date('2018-03-15'),
        estado: 'ACTIVO',
        categoria: 'PRIMERA CATEGORIA',
        actividadesEconomicas: [
          {
            codigo: '731000',
            descripcion: 'Actividades de publicidad',
            categoria: 'SERVICIOS'
          },
          {
            codigo: '732000',
            descripcion: 'Estudios de mercado y encuestas de opinión pública',
            categoria: 'SERVICIOS'
          }
        ],
        representanteLegal: {
          nombre: 'CARLOS MENDOZA RIVERA',
          rut: '12345678-9',
          cargo: 'GERENTE GENERAL'
        }
      }
    }
    
    return empresasSimuladas[rut] || null
  }
  
  /**
   * Busca empresas por razón social (simulado)
   */
  private async buscarEnSII(razonSocial: string): Promise<Array<{
    rut: string
    razonSocial: string
    giro: string
    estado: string
  }>> {
    await this.delay(800)
    
    // Simulación de resultados de búsqueda
    const resultados = [
      {
        rut: '96790240-3',
        razonSocial: 'ESTUDIO CREATIVO INNOVADOR LTDA',
        giro: 'SERVICIOS DE PUBLICIDAD Y MARKETING',
        estado: 'ACTIVO'
      },
      {
        rut: '76123456-7',
        razonSocial: 'AGENCIA CREATIVA DIGITAL SPA',
        giro: 'DISEÑO Y DESARROLLO DE SOFTWARE',
        estado: 'ACTIVO'
      }
    ]
    
    // Filtrar por similitud con la razón social buscada
    return resultados.filter(r => 
      r.razonSocial.toLowerCase().includes(razonSocial.toLowerCase())
    )
  }
  
  /**
   * Genera sugerencias de actividades económicas
   */
  private async generarSugerenciasActividades(
    actividadesInvalidas: string[],
    actividadesEmpresa: Array<{ codigo: string; descripcion: string }>
  ): Promise<Array<{ codigo: string; descripcion: string; similitud: number }>> {
    // Simulación de sugerencias basadas en similitud
    const sugerencias = actividadesEmpresa.map(actividad => ({
      codigo: actividad.codigo,
      descripcion: actividad.descripcion,
      similitud: Math.random() * 100 // En la realidad, usaríamos algoritmos de similitud
    }))
    
    return sugerencias
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, 5) // Top 5 sugerencias
  }
  
  /**
   * Obtiene casos de simulación para testing
   */
  private obtenerCasosSimulacion(): Record<string, SIIValidationResult> {
    return {
      '96790240-3': {
        valido: true,
        razonSocial: 'ESTUDIO CREATIVO INNOVADOR LTDA',
        giro: 'SERVICIOS DE PUBLICIDAD Y MARKETING',
        direccion: 'AV. PROVIDENCIA 1234, OFICINA 567',
        comuna: 'PROVIDENCIA',
        region: 'REGION METROPOLITANA',
        fechaInicio: new Date('2018-03-15'),
        estado: 'ACTIVO',
        categoria: 'PRIMERA CATEGORIA'
      },
      '12345678-9': {
        valido: false,
        errores: ['RUT no encontrado en registros del SII']
      },
      'default': {
        valido: true,
        razonSocial: 'EMPRESA DE PRUEBA LTDA',
        giro: 'ACTIVIDADES EMPRESARIALES',
        estado: 'ACTIVO'
      }
    }
  }
  
  /**
   * Simula delay de red
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * Verifica la conectividad con el SII
   */
  async verificarConectividad(): Promise<boolean> {
    try {
      // En un entorno real, haríamos un ping al API del SII
      await this.delay(500)
      return true
    } catch (error) {
      return false
    }
  }
  
  /**
   * Obtiene el estado del servicio SII
   */
  async obtenerEstadoServicio(): Promise<{
    disponible: boolean
    latencia: number
    ultimaActualizacion: Date
  }> {
    const inicio = Date.now()
    const disponible = await this.verificarConectividad()
    const latencia = Date.now() - inicio
    
    return {
      disponible,
      latencia,
      ultimaActualizacion: new Date()
    }
  }
}
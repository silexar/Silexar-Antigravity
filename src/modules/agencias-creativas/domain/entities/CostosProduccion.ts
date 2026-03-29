/**
 * 💰 ENTIDAD COSTOS PRODUCCIÓN - TIER 0
 * 
 * Gestiona los costos y presupuestos de producción creativa
 * Incluye desglose detallado, tracking y análisis de rentabilidad
 */

import { WithTimestamps, WithId } from '@/types'

export interface CostosProduccionProps {
  // Información básica
  proyectoCreativoId: string
  agenciaCreativaId: string
  nombre: string
  descripcion: string
  
  // Presupuesto principal
  presupuesto: {
    montoTotal: number
    moneda: string
    tipoPresupuesto: 'FIJO' | 'VARIABLE' | 'MIXTO' | 'POR_HORAS'
    fechaCreacion: Date
    fechaVencimiento: Date
    version: number
    estado: 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO' | 'MODIFICADO'
  }
  
  // Desglose de costos
  desgloseCostos: Array<{
    id: string
    categoria: 'PREPRODUCCION' | 'PRODUCCION' | 'POSTPRODUCCION' | 'RECURSOS' | 'TALENTO' | 'EQUIPOS' | 'OTROS'
    concepto: string
    descripcion: string
    cantidad: number
    unidad: string
    costoUnitario: number
    costoTotal: number
    porcentaje: number
    obligatorio: boolean
    negociable: boolean
    proveedor?: string
    fechaRequerida?: Date
  }>
  
  // Costos por fases
  fases: Array<{
    nombre: string
    descripcion: string
    costoEstimado: number
    costoReal?: number
    porcentajeTotal: number
    fechaInicio: Date
    fechaFin: Date
    estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'FACTURADA'
    hitos: Array<{
      nombre: string
      costo: number
      completado: boolean
      fechaCompletado?: Date
    }>
  }>
  
  // Recursos humanos
  recursosHumanos: Array<{
    contactoId: string
    nombre: string
    rol: string
    tipoContrato: 'FIJO' | 'POR_HORAS' | 'POR_PROYECTO' | 'FREELANCE'
    tarifaHora?: number
    costoFijo?: number
    horasEstimadas: number
    horasReales?: number
    costoTotal: number
    disponibilidad: number // 0-100%
    fechaInicio: Date
    fechaFin: Date
  }>
  
  // Recursos técnicos
  recursosTecnicos: Array<{
    id: string
    nombre: string
    tipo: 'EQUIPO' | 'SOFTWARE' | 'LICENCIA' | 'SERVICIO' | 'INFRAESTRUCTURA'
    proveedor: string
    costoAlquiler?: number
    costoCompra?: number
    duracionUso: number // días
    costoTotal: number
    fechaRequerida: Date
    estado: 'COTIZADO' | 'RESERVADO' | 'CONFIRMADO' | 'ENTREGADO' | 'DEVUELTO'
  }>
  
  // Gastos adicionales
  gastosAdicionales: Array<{
    id: string
    concepto: string
    descripcion: string
    monto: number
    categoria: 'TRANSPORTE' | 'ALIMENTACION' | 'HOSPEDAJE' | 'MATERIALES' | 'IMPREVISTOS' | 'OTROS'
    fecha: Date
    aprobado: boolean
    facturado: boolean
    comprobante?: string
  }>
  
  // Márgenes y rentabilidad
  rentabilidad: {
    margenBruto: number // %
    margenNeto: number // %
    utilidadEstimada: number
    utilidadReal?: number
    roi: number // %
    puntoEquilibrio: number
    riesgoFinanciero: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO'
  }
  
  // Facturación
  facturacion: {
    modalidad: 'ANTICIPO_SALDO' | 'HITOS' | 'MENSUAL' | 'FINAL' | 'PERSONALIZADA'
    anticipoPorcentaje?: number
    cronogramaPagos: Array<{
      hito: string
      porcentaje: number
      monto: number
      fechaVencimiento: Date
      pagado: boolean
      fechaPago?: Date
    }>
    condicionesPago: string
    montoFacturado: number
    montoPendiente: number
  }
  
  // Comparación y benchmarking
  benchmarking: {
    costoPromedioCategoria: number
    posicionMercado: 'ECONOMICO' | 'COMPETITIVO' | 'PREMIUM' | 'LUXURY'
    factorCompetitividad: number // 0-100%
    proyectosSimilares: Array<{
      proyectoId: string
      costo: number
      diferenciaPorcentual: number
    }>
  }
  
  // Control de cambios
  controlCambios: Array<{
    fecha: Date
    tipo: 'INCREMENTO' | 'REDUCCION' | 'MODIFICACION' | 'APROBACION'
    concepto: string
    montoAnterior: number
    montoNuevo: number
    diferencia: number
    motivo: string
    aprobadoPor: string
    impactoMargen: number
  }>
  
  // Estado y configuración
  estado: 'BORRADOR' | 'COTIZACION' | 'APROBADO' | 'EN_EJECUCION' | 'COMPLETADO' | 'FACTURADO'
  activo: boolean
  
  // Metadata
  tenantId: string
  creadoPor: string
  
  // Integración con IA
  cortexAnalysis?: {
    optimizacionCostos: string[]
    riesgosDetectados: Array<{
      tipo: string
      descripcion: string
      impacto: number
      probabilidad: number
      mitigacion: string
    }>
    recomendacionesRentabilidad: string[]
    prediccionSobrecosto: number // %
    ultimoAnalisis: Date
  }
}

export class CostosProduccion implements WithId<CostosProduccionProps>, WithTimestamps<CostosProduccionProps> {
  public readonly id: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  
  constructor(
    id: string,
    private props: CostosProduccionProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    
    this.validate()
    this.calcularTotales()
  }
  
  // Getters principales
  get proyectoCreativoId(): string {
    return this.props.proyectoCreativoId
  }
  
  get agenciaCreativaId(): string {
    return this.props.agenciaCreativaId
  }
  
  get montoTotal(): number {
    return this.props.presupuesto.montoTotal
  }
  
  get estado(): CostosProduccionProps['estado'] {
    return this.props.estado
  }
  
  get rentabilidad() {
    return this.props.rentabilidad
  }
  
  // Métodos de negocio
  
  /**
   * Añade un item al desglose de costos
   */
  añadirItemCosto(
    categoria: CostosProduccionProps['desgloseCostos'][0]['categoria'],
    concepto: string,
    descripcion: string,
    cantidad: number,
    unidad: string,
    costoUnitario: number,
    obligatorio: boolean = true,
    negociable: boolean = false,
    proveedor?: string
  ): string {
    const itemId = crypto.randomUUID()
    const costoTotal = cantidad * costoUnitario
    
    const nuevoItem: CostosProduccionProps['desgloseCostos'][0] = {
      id: itemId,
      categoria,
      concepto,
      descripcion,
      cantidad,
      unidad,
      costoUnitario,
      costoTotal,
      porcentaje: 0, // Se calculará en calcularTotales()
      obligatorio,
      negociable,
      proveedor
    }
    
    this.props.desgloseCostos.push(nuevoItem)
    this.calcularTotales()
    this.touch()
    
    return itemId
  }
  
  /**
   * Actualiza un item del desglose
   */
  actualizarItemCosto(
    itemId: string,
    cantidad?: number,
    costoUnitario?: number,
    proveedor?: string
  ): void {
    const item = this.props.desgloseCostos.find(i => i.id === itemId)
    if (!item) {
      throw new Error('Item de costo no encontrado')
    }
    
    if (cantidad !== undefined) item.cantidad = cantidad
    if (costoUnitario !== undefined) item.costoUnitario = costoUnitario
    if (proveedor !== undefined) item.proveedor = proveedor
    
    item.costoTotal = item.cantidad * item.costoUnitario
    
    this.calcularTotales()
    this.touch()
  }
  
  /**
   * Elimina un item del desglose
   */
  eliminarItemCosto(itemId: string): void {
    const index = this.props.desgloseCostos.findIndex(i => i.id === itemId)
    if (index === -1) {
      throw new Error('Item de costo no encontrado')
    }
    
    const item = this.props.desgloseCostos[index]
    if (item.obligatorio) {
      throw new Error('No se puede eliminar un item obligatorio')
    }
    
    this.props.desgloseCostos.splice(index, 1)
    this.calcularTotales()
    this.touch()
  }
  
  /**
   * Añade un recurso humano
   */
  añadirRecursoHumano(
    contactoId: string,
    nombre: string,
    rol: string,
    tipoContrato: CostosProduccionProps['recursosHumanos'][0]['tipoContrato'],
    horasEstimadas: number,
    tarifaHora?: number,
    costoFijo?: number
  ): void {
    let costoTotal = 0
    
    if (tipoContrato === 'POR_HORAS' && tarifaHora) {
      costoTotal = horasEstimadas * tarifaHora
    } else if (costoFijo) {
      costoTotal = costoFijo
    }
    
    const recurso: CostosProduccionProps['recursosHumanos'][0] = {
      contactoId,
      nombre,
      rol,
      tipoContrato,
      tarifaHora,
      costoFijo,
      horasEstimadas,
      costoTotal,
      disponibilidad: 100,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días por defecto
    }
    
    this.props.recursosHumanos.push(recurso)
    this.calcularTotales()
    this.touch()
  }
  
  /**
   * Registra horas reales trabajadas
   */
  registrarHorasReales(contactoId: string, horasReales: number): void {
    const recurso = this.props.recursosHumanos.find(r => r.contactoId === contactoId)
    if (!recurso) {
      throw new Error('Recurso humano no encontrado')
    }
    
    recurso.horasReales = horasReales
    
    // Recalcular costo si es por horas
    if (recurso.tipoContrato === 'POR_HORAS' && recurso.tarifaHora) {
      recurso.costoTotal = horasReales * recurso.tarifaHora
    }
    
    this.calcularTotales()
    this.touch()
  }
  
  /**
   * Añade un gasto adicional
   */
  añadirGastoAdicional(
    concepto: string,
    descripcion: string,
    monto: number,
    categoria: CostosProduccionProps['gastosAdicionales'][0]['categoria'],
    comprobante?: string
  ): string {
    const gastoId = crypto.randomUUID()
    
    const gasto: CostosProduccionProps['gastosAdicionales'][0] = {
      id: gastoId,
      concepto,
      descripcion,
      monto,
      categoria,
      fecha: new Date(),
      aprobado: false,
      facturado: false,
      comprobante
    }
    
    this.props.gastosAdicionales.push(gasto)
    this.calcularTotales()
    this.touch()
    
    return gastoId
  }
  
  /**
   * Aprueba un gasto adicional
   */
  aprobarGasto(gastoId: string): void {
    const gasto = this.props.gastosAdicionales.find(g => g.id === gastoId)
    if (!gasto) {
      throw new Error('Gasto no encontrado')
    }
    
    gasto.aprobado = true
    this.calcularTotales()
    this.touch()
  }
  
  /**
   * Calcula todos los totales y métricas
   */
  private calcularTotales(): void {
    // Calcular total del desglose
    const totalDesglose = this.props.desgloseCostos.reduce((sum, item) => sum + item.costoTotal, 0)
    
    // Calcular porcentajes del desglose
    this.props.desgloseCostos.forEach(item => {
      item.porcentaje = totalDesglose > 0 ? (item.costoTotal / totalDesglose) * 100 : 0
    })
    
    // Calcular total recursos humanos
    const totalRecursosHumanos = this.props.recursosHumanos.reduce((sum, recurso) => sum + recurso.costoTotal, 0)
    
    // Calcular total recursos técnicos
    const totalRecursosTecnicos = this.props.recursosTecnicos.reduce((sum, recurso) => sum + recurso.costoTotal, 0)
    
    // Calcular total gastos adicionales aprobados
    const totalGastosAdicionales = this.props.gastosAdicionales
      .filter(g => g.aprobado)
      .reduce((sum, gasto) => sum + gasto.monto, 0)
    
    // Calcular costo total real
    const costoTotalReal = totalDesglose + totalRecursosHumanos + totalRecursosTecnicos + totalGastosAdicionales
    
    // Actualizar presupuesto total si es necesario
    if (this.props.presupuesto.tipoPresupuesto === 'VARIABLE') {
      this.props.presupuesto.montoTotal = costoTotalReal
    }
    
    // Calcular rentabilidad
    this.calcularRentabilidad(costoTotalReal)
    
    // Actualizar facturación
    this.actualizarFacturacion()
  }
  
  /**
   * Calcula métricas de rentabilidad
   */
  private calcularRentabilidad(costoTotal: number): void {
    const ingresoTotal = this.props.presupuesto.montoTotal
    const utilidadBruta = ingresoTotal - costoTotal
    
    this.props.rentabilidad.margenBruto = ingresoTotal > 0 ? (utilidadBruta / ingresoTotal) * 100 : 0
    this.props.rentabilidad.utilidadEstimada = utilidadBruta
    
    // Calcular ROI (simplificado)
    this.props.rentabilidad.roi = costoTotal > 0 ? (utilidadBruta / costoTotal) * 100 : 0
    
    // Determinar riesgo financiero
    if (this.props.rentabilidad.margenBruto < 10) {
      this.props.rentabilidad.riesgoFinanciero = 'CRITICO'
    } else if (this.props.rentabilidad.margenBruto < 20) {
      this.props.rentabilidad.riesgoFinanciero = 'ALTO'
    } else if (this.props.rentabilidad.margenBruto < 30) {
      this.props.rentabilidad.riesgoFinanciero = 'MEDIO'
    } else {
      this.props.rentabilidad.riesgoFinanciero = 'BAJO'
    }
  }
  
  /**
   * Actualiza información de facturación
   */
  private actualizarFacturacion(): void {
    const montoTotal = this.props.presupuesto.montoTotal
    const montoFacturado = this.props.facturacion.cronogramaPagos
      .filter(p => p.pagado)
      .reduce((sum, pago) => sum + pago.monto, 0)
    
    this.props.facturacion.montoFacturado = montoFacturado
    this.props.facturacion.montoPendiente = montoTotal - montoFacturado
  }
  
  /**
   * Registra un cambio en el presupuesto
   */
  registrarCambio(
    tipo: CostosProduccionProps['controlCambios'][0]['tipo'],
    concepto: string,
    montoAnterior: number,
    montoNuevo: number,
    motivo: string,
    aprobadoPor: string
  ): void {
    const diferencia = montoNuevo - montoAnterior
    const impactoMargen = this.props.presupuesto.montoTotal > 0 ? 
      (diferencia / this.props.presupuesto.montoTotal) * 100 : 0
    
    this.props.controlCambios.push({
      fecha: new Date(),
      tipo,
      concepto,
      montoAnterior,
      montoNuevo,
      diferencia,
      motivo,
      aprobadoPor,
      impactoMargen
    })
    
    this.touch()
  }
  
  /**
   * Aprueba el presupuesto
   */
  aprobar(): void {
    if (this.props.estado !== 'COTIZACION') {
      throw new Error('Solo se puede aprobar un presupuesto en cotización')
    }
    
    this.props.estado = 'APROBADO'
    this.props.presupuesto.estado = 'APROBADO'
    
    this.registrarCambio(
      'APROBACION',
      'Presupuesto aprobado',
      0,
      this.props.presupuesto.montoTotal,
      'Aprobación oficial del presupuesto',
      'Sistema'
    )
    
    this.touch()
  }
  
  /**
   * Inicia la ejecución del presupuesto
   */
  iniciarEjecucion(): void {
    if (this.props.estado !== 'APROBADO') {
      throw new Error('El presupuesto debe estar aprobado para iniciar ejecución')
    }
    
    this.props.estado = 'EN_EJECUCION'
    this.touch()
  }
  
  /**
   * Obtiene el costo por categoría
   */
  getCostoPorCategoria(): Record<string, number> {
    const costosPorCategoria: Record<string, number> = {}
    
    this.props.desgloseCostos.forEach(item => {
      if (!costosPorCategoria[item.categoria]) {
        costosPorCategoria[item.categoria] = 0
      }
      costosPorCategoria[item.categoria] += item.costoTotal
    })
    
    return costosPorCategoria
  }
  
  /**
   * Verifica si está dentro del presupuesto
   */
  estaDentroPresupuesto(): boolean {
    const costoTotal = this.props.desgloseCostos.reduce((sum, item) => sum + item.costoTotal, 0) +
                     this.props.recursosHumanos.reduce((sum, recurso) => sum + recurso.costoTotal, 0) +
                     this.props.recursosTecnicos.reduce((sum, recurso) => sum + recurso.costoTotal, 0) +
                     this.props.gastosAdicionales.filter(g => g.aprobado).reduce((sum, gasto) => sum + gasto.monto, 0)
    
    return costoTotal <= this.props.presupuesto.montoTotal
  }
  
  /**
   * Obtiene el porcentaje de ejecución del presupuesto
   */
  getPorcentajeEjecucion(): number {
    const costoTotal = this.props.desgloseCostos.reduce((sum, item) => sum + item.costoTotal, 0)
    return this.props.presupuesto.montoTotal > 0 ? 
      (costoTotal / this.props.presupuesto.montoTotal) * 100 : 0
  }
  
  /**
   * Obtiene todas las propiedades
   */
  getProps(): CostosProduccionProps {
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
    if (!this.props.proyectoCreativoId?.trim()) {
      throw new Error('El ID del proyecto es requerido')
    }
    
    if (!this.props.agenciaCreativaId?.trim()) {
      throw new Error('El ID de la agencia es requerido')
    }
    
    if (this.props.presupuesto.montoTotal < 0) {
      throw new Error('El monto total no puede ser negativo')
    }
    
    if (!this.props.tenantId?.trim()) {
      throw new Error('El tenantId es requerido')
    }
  }
  
  /**
   * Crea una nueva instancia
   */
  static create(props: CostosProduccionProps): CostosProduccion {
    const id = crypto.randomUUID()
    
    // Valores por defecto
    const propsConDefaults: CostosProduccionProps = {
      ...props,
      estado: props.estado || 'BORRADOR',
      activo: props.activo !== undefined ? props.activo : true,
      desgloseCostos: props.desgloseCostos || [],
      fases: props.fases || [],
      recursosHumanos: props.recursosHumanos || [],
      recursosTecnicos: props.recursosTecnicos || [],
      gastosAdicionales: props.gastosAdicionales || [],
      controlCambios: props.controlCambios || [],
      rentabilidad: {
        margenBruto: 0,
        margenNeto: 0,
        utilidadEstimada: 0,
        roi: 0,
        puntoEquilibrio: 0,
        riesgoFinanciero: 'MEDIO',
        ...props.rentabilidad
      },
      facturacion: {
        modalidad: 'FINAL',
        cronogramaPagos: [],
        condicionesPago: '',
        montoFacturado: 0,
        montoPendiente: 0,
        ...props.facturacion
      },
      benchmarking: {
        costoPromedioCategoria: 0,
        posicionMercado: 'COMPETITIVO',
        factorCompetitividad: 50,
        proyectosSimilares: [],
        ...props.benchmarking
      }
    }
    
    return new CostosProduccion(id, propsConDefaults)
  }
  
  /**
   * Reconstruye desde persistencia
   */
  static fromPersistence(
    id: string,
    props: CostosProduccionProps,
    createdAt: Date,
    updatedAt: Date
  ): CostosProduccion {
    return new CostosProduccion(id, props, createdAt, updatedAt)
  }
}
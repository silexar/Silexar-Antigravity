/**
 * ENTIDAD CONTRATO - TIER 0 ENTERPRISE
 * 
 * @description Entidad principal del dominio de contratos con lógica de negocio
 * avanzada, validaciones automáticas y integración con Cortex-AI
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 */

import { NumeroContrato } from '../value-objects/NumeroContrato.js'
import { EstadoContrato } from '../value-objects/EstadoContrato.js'
import { TerminosPago } from '../value-objects/TerminosPago.js'
import { TasaComision } from '../value-objects/TasaComision.js'
import { TotalesContrato } from '../value-objects/TotalesContrato.js'
import { RiesgoCredito } from '../value-objects/RiesgoCredito.js'
import { MetricasRentabilidad } from '../value-objects/MetricasRentabilidad.js'

export interface ContratoProps {
    id: string
    numero: NumeroContrato
    anuncianteId: string
    anunciante: string
    rutAnunciante: string
    producto: string
    agenciaId?: string
    agencia?: string
    ejecutivoId: string
    ejecutivo: string

    // Valores financieros
    totales: TotalesContrato
    moneda: 'CLP' | 'USD' | 'UF'
    tasaComision?: TasaComision

    // Fechas
    fechaInicio: Date
    fechaFin: Date
    fechaCreacion: Date
    fechaActualizacion: Date

    // Estado y clasificación
    estado: EstadoContrato
    prioridad: 'baja' | 'media' | 'alta' | 'critica'
    tipoContrato: 'A' | 'B' | 'C'

    // Términos comerciales
    terminosPago: TerminosPago
    modalidadFacturacion: 'hitos' | 'cuotas'
    tipoFactura: 'posterior' | 'adelantado'
    esCanje: boolean
    facturarComisionAgencia: boolean

    // Métricas y análisis
    riesgoCredito: RiesgoCredito
    metricas: MetricasRentabilidad

    // Workflow
    etapaActual: string
    progreso: number
    proximaAccion: string
    responsableActual: string
    fechaLimiteAccion: Date

    // Alertas y seguimiento
    alertas: string[]
    tags: string[]

    // Auditoría
    creadoPor: string
    actualizadoPor: string
    version: number
}

export class Contrato {
    private constructor(private props: ContratoProps) {
        this.validate()
    }

    static create(props: Omit<ContratoProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): Contrato {
        const now = new Date()
        return new Contrato({
            ...props,
            id: this.generateId(),
            fechaCreacion: now,
            fechaActualizacion: now,
            version: 1
        })
    }

    static fromPersistence(props: ContratoProps): Contrato {
        return new Contrato(props)
    }

    private static generateId(): string {
        return `cont_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    }

    private validate(): void {
        if (!this.props.anunciante?.trim()) {
            throw new Error('Anunciante es requerido')
        }

        if (!this.props.producto?.trim()) {
            throw new Error('Producto es requerido')
        }

        if (this.props.fechaFin <= this.props.fechaInicio) {
            throw new Error('Fecha fin debe ser posterior a fecha inicio')
        }

        if (this.props.totales.valorNeto <= 0) {
            throw new Error('Valor neto debe ser mayor a cero')
        }

        // Validaciones de negocio específicas
        this.validateBusinessRules()
    }

    private validateBusinessRules(): void {
        // Validar límites por tipo de contrato
        const limites = {
            'A': 1000000000, // $1B CLP
            'B': 100000000,  // $100M CLP
            'C': 10000000    // $10M CLP
        }

        if (this.props.totales.valorNeto > limites[this.props.tipoContrato]) {
            throw new Error(`Valor excede límite para contrato tipo ${this.props.tipoContrato}`)
        }

        // Validar términos de pago según riesgo
        if (this.props.riesgoCredito.nivel === 'alto' && this.props.terminosPago.dias > 15) {
            throw new Error('Clientes de alto riesgo no pueden tener términos superiores a 15 días')
        }

        // Validar comisiones
        if (this.props.facturarComisionAgencia && !this.props.agenciaId) {
            throw new Error('No se puede facturar comisión sin agencia asignada')
        }
    }

    // Getters
    get id(): string { return this.props.id }
    get numero(): NumeroContrato { return this.props.numero }
    get anunciante(): string { return this.props.anunciante }
    get producto(): string { return this.props.producto }
    get estado(): EstadoContrato { return this.props.estado }
    get totales(): TotalesContrato { return this.props.totales }
    get riesgoCredito(): RiesgoCredito { return this.props.riesgoCredito }
    get metricas(): MetricasRentabilidad { return this.props.metricas }
    get progreso(): number { return this.props.progreso }
    get alertas(): string[] { return [...this.props.alertas] }

    // Métodos de negocio
    actualizarEstado(nuevoEstado: EstadoContrato, responsable: string): void {
        const transicionesValidas = this.getTransicionesValidas()

        if (!transicionesValidas.includes(nuevoEstado.valor)) {
            throw new Error(`Transición de ${this.props.estado.valor} a ${nuevoEstado.valor} no permitida`)
        }

        this.props.estado = nuevoEstado
        this.props.actualizadoPor = responsable
        this.props.fechaActualizacion = new Date()
        this.props.version++

        // Actualizar progreso automáticamente
        this.actualizarProgreso()

        // Generar alertas automáticas
        this.generarAlertasAutomaticas()
    }

    private getTransicionesValidas(): string[] {
        const transiciones: Record<string, string[]> = {
            'borrador': ['revision', 'cancelado'],
            'revision': ['aprobacion', 'borrador', 'cancelado'],
            'aprobacion': ['firmado', 'revision', 'cancelado'],
            'firmado': ['activo', 'cancelado'],
            'activo': ['pausado', 'finalizado', 'cancelado'],
            'pausado': ['activo', 'cancelado'],
            'finalizado': [],
            'cancelado': []
        }

        return transiciones[this.props.estado.valor] || []
    }

    private actualizarProgreso(): void {
        const progresosPorEstado: Record<string, number> = {
            'borrador': 10,
            'revision': 25,
            'aprobacion': 50,
            'firmado': 75,
            'activo': 90,
            'pausado': 85,
            'finalizado': 100,
            'cancelado': 0
        }

        this.props.progreso = progresosPorEstado[this.props.estado.valor] || 0
    }

    actualizarTotales(nuevosTotales: TotalesContrato, responsable: string): void {
        // Validar que el cambio no exceda límites
        if (nuevosTotales.valorNeto > this.props.totales.valorNeto * 1.5) {
            throw new Error('Incremento de valor superior al 50% requiere aprobación especial')
        }

        this.props.totales = nuevosTotales
        this.props.actualizadoPor = responsable
        this.props.fechaActualizacion = new Date()
        this.props.version++

        // Recalcular métricas
        this.recalcularMetricas()
    }

    actualizarRiesgoCredito(nuevoRiesgo: RiesgoCredito): void {
        const riesgoAnterior = this.props.riesgoCredito.nivel
        this.props.riesgoCredito = nuevoRiesgo

        // Si el riesgo empeoró, generar alerta
        if (this.esRiesgoMayor(nuevoRiesgo.nivel, riesgoAnterior)) {
            this.agregarAlerta(`Riesgo crediticio incrementado a ${nuevoRiesgo.nivel}`)
        }

        // Validar términos de pago contra nuevo riesgo
        this.validarTerminosContraRiesgo()
    }

    private esRiesgoMayor(nuevo: string, anterior: string): boolean {
        const niveles = { 'bajo': 1, 'medio': 2, 'alto': 3 }
        return niveles[nuevo as keyof typeof niveles] > niveles[anterior as keyof typeof niveles]
    }

    private validarTerminosContraRiesgo(): void {
        if (this.props.riesgoCredito.nivel === 'alto' && this.props.terminosPago.dias > 15) {
            this.agregarAlerta('Términos de pago incompatibles con riesgo alto - Requiere revisión')
        }
    }

    agregarAlerta(mensaje: string): void {
        if (!this.props.alertas.includes(mensaje)) {
            this.props.alertas.push(mensaje)
        }
    }

    removerAlerta(mensaje: string): void {
        this.props.alertas = this.props.alertas.filter(alerta => alerta !== mensaje)
    }

    private generarAlertasAutomaticas(): void {
        // Limpiar alertas de estado anterior
        this.props.alertas = this.props.alertas.filter(alerta =>
            !alerta.includes('Estado:') && !alerta.includes('Progreso:')
        )

        // Generar nuevas alertas según estado
        switch (this.props.estado.valor) {
            case 'aprobacion':
                this.agregarAlerta('Estado: Pendiente aprobación - Requiere acción')
                break
            case 'firmado':
                this.agregarAlerta('Estado: Listo para activación')
                break
            case 'activo':
                this.agregarAlerta('Estado: Contrato activo - Monitorear cumplimiento')
                break
        }

        // Alertas por fechas
        const diasParaVencimiento = Math.ceil(
            (this.props.fechaFin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diasParaVencimiento <= 30 && diasParaVencimiento > 0) {
            this.agregarAlerta(`Vence en ${diasParaVencimiento} días - Considerar renovación`)
        }
    }

    private recalcularMetricas(): void {
        // Recalcular rentabilidad basada en nuevos totales
        const costoEstimado = this.props.totales.valorNeto * 0.3 // 30% costo estimado
        const margenBruto = this.props.totales.valorNeto - costoEstimado
        const rentabilidad = (margenBruto / this.props.totales.valorNeto) * 100

        this.props.metricas = MetricasRentabilidad.create({
            margenBruto: rentabilidad,
            roi: rentabilidad * 1.2, // ROI estimado
            valorVida: this.props.totales.valorNeto * 1.5, // LTV estimado
            costoAdquisicion: costoEstimado
        })
    }

    // Métodos de consulta
    estaVencido(): boolean {
        return new Date() > this.props.fechaFin
    }

    requiereAprobacion(): boolean {
        return this.props.estado.valor === 'aprobacion'
    }

    puedeSerEditado(): boolean {
        return ['borrador', 'revision'].includes(this.props.estado.valor)
    }

    calcularDiasRestantes(): number {
        return Math.ceil((this.props.fechaFin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }

    // Serialización
    toSnapshot(): ContratoProps {
        return { ...this.props }
    }

    // Métodos de workflow
    avanzarWorkflow(responsable: string, accion: string): void {
        this.props.proximaAccion = accion
        this.props.responsableActual = responsable
        this.props.fechaLimiteAccion = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días
        this.props.actualizadoPor = responsable
        this.props.fechaActualizacion = new Date()
    }

    // Validaciones de integridad
    validarIntegridad(): string[] {
        const errores: string[] = []

        if (this.props.fechaFin <= this.props.fechaInicio) {
            errores.push('Fecha fin debe ser posterior a fecha inicio')
        }

        if (this.props.totales.valorNeto <= 0) {
            errores.push('Valor neto debe ser mayor a cero')
        }

        if (this.props.facturarComisionAgencia && !this.props.agenciaId) {
            errores.push('Agencia requerida para facturar comisión')
        }

        return errores
    }
}
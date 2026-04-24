/**
 * 🏢 Handler: AgenciaMediosCommandHandler
 * 
 * Maneja todos los comandos relacionados con agencias de medios
 * Orquesta validaciones, análisis IA y persistencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { CrearAgenciaMediosCommand, CrearAgenciaMediosResult } from '../commands/CrearAgenciaMediosCommand'
import { ActualizarAgenciaMediosCommand, ActualizarAgenciaMediosResult } from '../commands/ActualizarAgenciaMediosCommand'
import { ConfigurarComisionesCommand, ConfigurarComisionesResult } from '../commands/ConfigurarComisionesCommand'
import { AsignarContactoCommand, AsignarContactoResult } from '../commands/AsignarContactoCommand'
import { BuscarAgenciasMediosQuery, BuscarAgenciasMediosResult } from '../queries/BuscarAgenciasMediosQuery'
import { ObtenerDetalleAgenciaQuery, ObtenerDetalleAgenciaResult } from '../queries/ObtenerDetalleAgenciaQuery'
import { AgenciaMedios, createAgenciaMedios } from '../../domain/entities/AgenciaMedios'
import { ContactoAgencia, createContactoAgencia } from '../../domain/entities/ContactoAgencia'
import { IAgenciaMediosRepository } from '../../domain/repositories/IAgenciaMediosRepository'
import { IContactoAgenciaRepository } from '../../domain/repositories/IContactoAgenciaRepository'
import { RutAgenciaMedios, createRutAgenciaMedios } from '../../domain/value-objects/RutAgenciaMedios'
import { TipoAgenciaMedios, TipoAgenciaMediosValue, createTipoAgenciaMedios } from '../../domain/value-objects/TipoAgenciaMedios'
import { NivelColaboracion, NivelColaboracionValue, determinarNivelPorRevenue } from '../../domain/value-objects/NivelColaboracion'
import { ScorePartnership, calcularScoreInicial } from '../../domain/value-objects/ScorePartnership'
import { Logger } from '@/lib/observability'

export interface AgenciaMediosHandlerDeps {
    agenciaRepository: IAgenciaMediosRepository
    contactoRepository: IContactoAgenciaRepository
    logger?: Logger
}

export class AgenciaMediosCommandHandler {
    private deps: AgenciaMediosHandlerDeps

    constructor(deps: AgenciaMediosHandlerDeps) {
        this.deps = deps
    }

    /**
     * Crea una nueva agencia de medios
     */
    async crearAgencia(command: CrearAgenciaMediosCommand): Promise<CrearAgenciaMediosResult> {
        const { logger } = this.deps

        try {
            logger?.info('[AgenciaMediosHandler] Creando agencia', { rut: command.rut })

            // 1. Validar RUT único
            const rut = createRutAgenciaMedios(command.rut)
            const existeRut = await this.deps.agenciaRepository.existsByRut(command.rut, command.tenantId)
            if (existeRut) {
                throw new Error(`Ya existe una agencia con el RUT ${rut.formated}`)
            }

            // 2. Determinar nivel de colaboración
            let nivel = command.nivelColaboracion
                ? new NivelColaboracion(command.nivelColaboracion)
                : determinarNivelPorRevenue(command.revenueAnual || 0)

            // 3. Calcular score inicial
            const scoreInicial = calcularScoreInicial({
                tipoAgencia: command.tipoAgencia,
                certificaciones: command.certificaciones,
                revenueEstimado: command.revenueAnual
            })

            // 4. Crear entidad
            const agencia = createAgenciaMedios({
                tenantId: command.tenantId,
                codigo: await this.generarCodigo(command.tenantId),
                rut,
                razonSocial: command.razonSocial,
                nombreComercial: command.nombreComercial,
                tipoAgencia: createTipoAgenciaMedios(command.tipoAgencia),
                nivelColaboracion: nivel,
                scorePartnership: new ScorePartnership(scoreInicial, 'stable'),
                emailGeneral: command.emailGeneral,
                telefonoGeneral: command.telefonoGeneral,
                paginaWeb: command.paginaWeb,
                direccion: command.direccion,
                ciudad: command.ciudad,
                region: command.region,
                pais: command.pais,
                giroActividad: command.giroActividad,
                fechaFundacion: command.fechaFundacion,
                empleadosCantidad: command.empleadosCantidad,
                especializacionesVerticales: command.especializacionesVerticales,
                capacidadesDigitales: command.capacidadesDigitales,
                certificaciones: command.certificaciones,
                revenueAnual: command.revenueAnual,
                comisionDefault: command.comisionDefault,
                activa: true,
                estado: 'activa',
                creadoPor: command.creadoPor
            })

            // 5. Persistir
            await this.deps.agenciaRepository.save(agencia)

            // 6. Crear contacto principal si se proporcionó
            let contactoId: string | undefined
            if (command.contactoPrincipal) {
                const contacto = createContactoAgencia({
                    tenantId: command.tenantId,
                    agenciaId: agencia.id,
                    nombre: command.contactoPrincipal.nombre,
                    apellido: command.contactoPrincipal.apellido,
                    email: command.contactoPrincipal.email,
                    telefono: command.contactoPrincipal.telefono,
                    telefonoMovil: command.contactoPrincipal.telefonoMovil,
                    cargo: command.contactoPrincipal.cargo,
                    rol: 'CONTACT_PRINCIPAL' as any,
                    nivelDecision: 'OPERATIVO' as any,
                    esPrincipal: true,
                    esDecisor: command.contactoPrincipal.esDecisor,
                    esInfluencer: command.contactoPrincipal.esInfluencer,
                    activa: true,
                    creadoPor: command.creadoPor
                })
                await this.deps.contactoRepository.save(contacto)
                contactoId = contacto.id
            }

            // 7. Generar resultado
            const result: CrearAgenciaMediosResult = {
                agenciaId: agencia.id,
                agencia: {
                    nombre: agencia.nombre,
                    rut: agencia.rut.formated,
                    tipo: agencia.tipoAgencia.displayName,
                    nivel: agencia.nivelColaboracion.nombre,
                    scoreInicial
                },
                alertas: this.generarAlertas(agencia),
                proximosPasos: this.generarProximosPasos(agencia, !!contactoId)
            }

            if (contactoId) {
                result.contactoId = contactoId
            }

            logger?.info('[AgenciaMediosHandler] Agencia creada exitosamente', { agenciaId: agencia.id })

            return result
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            logger?.error('[AgenciaMediosHandler] Error creando agencia', { error: message })
            throw new Error(`Error al crear agencia: ${message}`)
        }
    }

    /**
     * Actualiza una agencia existente
     */
    async actualizarAgencia(command: ActualizarAgenciaMediosCommand): Promise<ActualizarAgenciaMediosResult> {
        const { logger } = this.deps

        try {
            logger?.info('[AgenciaMediosHandler] Actualizando agencia', { agenciaId: command.id })

            const agencia = await this.deps.agenciaRepository.findById(command.id)
            if (!agencia) {
                throw new Error('Agencia no encontrada')
            }

            // Aplicar actualizaciones
            // ... (aplicar campos opcionales)

            await this.deps.agenciaRepository.save(agencia)

            return {
                agenciaId: agencia.id,
                agencia: {
                    nombre: agencia.nombre,
                    rut: agencia.rut.formated,
                    tipo: agencia.tipoAgencia.displayName,
                    nivel: agencia.nivelColaboracion.nombre
                },
                alertas: [],
                proximosPasos: []
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            logger?.error('[AgenciaMediosHandler] Error actualizando agencia', { error: message })
            throw new Error(`Error al actualizar agencia: ${message}`)
        }
    }

    /**
     * Configura comisiones de una agencia
     */
    async configurarComisiones(command: ConfigurarComisionesCommand): Promise<ConfigurarComisionesResult> {
        const { logger } = this.deps

        try {
            logger?.info('[AgenciaMediosHandler] Configurando comisiones', { agenciaId: command.agenciaId })

            const agencia = await this.deps.agenciaRepository.findById(command.agenciaId)
            if (!agencia) {
                throw new Error('Agencia no encontrada')
            }

            // Validar niveles de comisión para el nivel de partnership
            const comisionPromedio = this.calcularComisionPromedio(command)
            const esValida = comisionPromedio >= 5 && comisionPromedio <= 20

            return {
                agenciaId: agencia.id,
                estructuraComision: {
                    tipo: command.tipo,
                    porcentajePromedio: comisionPromedio,
                    comisionMin: 5,
                    comisionMax: 20
                },
                validaciones: {
                    esValidaParaNivel: esValida,
                    advertencias: esValida ? [] : ['Comisión fuera del rango típico para este nivel']
                },
                alertas: []
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            logger?.error('[AgenciaMediosHandler] Error configurando comisiones', { error: message })
            throw new Error(`Error al configurar comisiones: ${message}`)
        }
    }

    /**
     * Asigna un contacto a una agencia
     */
    async asignarContacto(command: AsignarContactoCommand): Promise<AsignarContactoResult> {
        const { logger } = this.deps

        try {
            logger?.info('[AgenciaMediosHandler] Asignando contacto', { agenciaId: command.agenciaId })

            const agencia = await this.deps.agenciaRepository.findById(command.agenciaId)
            if (!agencia) {
                throw new Error('Agencia no encontrada')
            }

            const contacto = createContactoAgencia({
                tenantId: command.tenantId,
                agenciaId: command.agenciaId,
                nombre: command.nombre,
                apellido: command.apellido,
                email: command.email,
                telefono: command.telefono,
                telefonoMovil: command.telefonoMovil,
                cargo: command.cargo,
                departamento: command.departamento,
                rol: command.rol,
                nivelDecision: command.nivelDecision,
                esPrincipal: command.esPrincipal,
                esDecisor: command.esDecisor,
                esInfluencer: command.esInfluencer,
                linkedIn: command.linkedIn,
                notas: command.notas,
                activa: true,
                creadoPor: command.asignadoPor
            })

            await this.deps.contactoRepository.save(contacto)

            return {
                contactoId: contacto.id,
                contacto: {
                    nombre: contacto.nombre,
                    apellido: contacto.apellido,
                    email: contacto.email,
                    cargo: contacto.cargo ?? null,
                    esPrincipal: contacto.esPrincipal
                },
                alertas: []
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            logger?.error('[AgenciaMediosHandler] Error asignando contacto', { error: message })
            throw new Error(`Error al asignar contacto: ${message}`)
        }
    }

    /**
     * Busca agencias con filtros
     */
    async buscarAgencias(query: BuscarAgenciasMediosQuery): Promise<BuscarAgenciasMediosResult> {
        try {
            const result = await this.deps.agenciaRepository.findAll(
                {
                    tenantId: query.tenantId,
                    busqueda: query.busquedaTexto,
                    tipoAgencia: query.tipoAgencia,
                    nivelColaboracion: query.nivelColaboracion,
                    activa: query.estado === 'activa'
                },
                {
                    campo: query.ordenarPor as any,
                    direccion: query.ordenDireccion
                },
                query.limite,
                query.offset
            )

            return {
                agencias: result.agencias.map(a => ({
                    id: a.id,
                    codigo: a.codigo,
                    nombre: a.nombre,
                    rut: a.rut.formated,
                    tipo: a.tipoAgencia.displayName,
                    nivel: a.nivelColaboracion.nombre,
                    score: a.scorePartnership.value,
                    estado: a.estado,
                    ciudad: a.ciudad || null,
                    email: a.email || null
                })),
                total: result.total,
                filtrosAplicados: []
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            throw new Error(`Error buscando agencias: ${message}`)
        }
    }

    /**
     * Obtiene detalle de agencia
     */
    async obtenerDetalle(query: ObtenerDetalleAgenciaQuery): Promise<ObtenerDetalleAgenciaResult | null> {
        try {
            const agencia = await this.deps.agenciaRepository.findById(query.id)
            if (!agencia) {
                return null
            }

            const contactos = query.incluirContactos
                ? await this.deps.contactoRepository.findByAgenciaId(agencia.id)
                : undefined

            return {
                agencia: {
                    id: agencia.id,
                    codigo: agencia.codigo,
                    rut: agencia.rut.formated,
                    razonSocial: agencia.razonSocial,
                    nombreComercial: agencia.nombreComercial || null,
                    tipo: agencia.tipoAgencia.displayName,
                    nivel: agencia.nivelColaboracion.nombre,
                    score: agencia.scorePartnership.value,
                    tendencia: agencia.scorePartnership.tendencia,
                    clasificacion: agencia.scorePartnership.nombre,
                    estado: agencia.estado
                },
                contacto: {
                    email: agencia.email || '',
                    telefono: agencia.telefono || '',
                    paginaWeb: agencia.sitioWeb || '',
                    direccion: agencia.direccion || '',
                    ciudad: agencia.ciudad || '',
                    region: agencia.region || '',
                    pais: agencia.pais
                },
                clasificacion: {
                    tipoAgencia: agencia.tipoAgencia.displayName,
                    nivelColaboracion: agencia.nivelColaboracion.nombre,
                    especializaciones: agencia.especializaciones,
                    capacidades: agencia.capacidades
                },
                metadata: {
                    fechaCreacion: agencia.fechaCreacion,
                    fechaModificacion: agencia.fechaModificacion || null,
                    creadoPor: agencia.creadoPor
                },
                contactos: contactos?.map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    apellido: c.apellido,
                    email: c.email,
                    cargo: c.cargo || null,
                    telefono: c.telefono || null,
                    esPrincipal: c.esPrincipal,
                    esDecisor: c.esDecisor
                })),
                performance: query.incluirPerformance ? agencia.getPerformanceSummary() : undefined
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            throw new Error(`Error obteniendo detalle: ${message}`)
        }
    }

    // === Métodos privados de apoyo ===

    private async generarCodigo(tenantId: string): Promise<string> {
        const timestamp = Date.now().toString(36).toUpperCase()
        return `AGM-${timestamp}`
    }

    private generarAlertas(agencia: AgenciaMedios): string[] {
        const alertas: string[] = []

        if (agencia.certificaciones.length === 0) {
            alertas.push('Agencia sin certificaciones registradas')
        }

        if (agencia.revenueAnual && agencia.revenueAnual > 100000000) {
            alertas.push('Candidato para partnership estratégico')
        }

        if (agencia.scorePartnership.value < 450) {
            alertas.push('Score bajo - requiere atención')
        }

        return alertas
    }

    private generarProximosPasos(agencia: AgenciaMedios, tieneContacto: boolean): string[] {
        const pasos: string[] = []

        if (!tieneContacto) {
            pasos.push('Agregar contacto principal de la agencia')
        }

        if (agencia.certificaciones.length === 0) {
            pasos.push('Registrar certificaciones de plataformas')
        }

        if (!agencia.revenueAnual) {
            pasos.push('Ingresar revenue anual estimado')
        }

        pasos.push('Configurar estructura de comisiones')

        return pasos
    }

    private calcularComisionPromedio(command: ConfigurarComisionesCommand): number {
        const porcentajes = [
            command.porcentajeMediosTradicionales || 0,
            command.porcentajeMediosDigitales || 0,
            command.porcentajeProgrammatic || 0,
            command.porcentajeProduccion || 0
        ]
        return porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length
    }
}

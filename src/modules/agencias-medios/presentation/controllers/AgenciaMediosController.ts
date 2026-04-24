/**
 * 🏢 Controller: AgenciaMediosController
 * 
 * Controlador REST para el módulo de Agencias de Medios
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { logger } from '@/lib/observability'
import { AgenciaMediosCommandHandler } from '../../application/handlers/AgenciaMediosCommandHandler'
import { DrizzleAgenciaMediosRepository, DrizzleContactoAgenciaRepository } from '../../infrastructure/repositories/DrizzleAgenciaMediosRepository'
import { CrearAgenciaMediosCommandSchema } from '../../application/commands/CrearAgenciaMediosCommand'
import { ActualizarAgenciaMediosCommandSchema } from '../../application/commands/ActualizarAgenciaMediosCommand'
import { ConfigurarComisionesCommandSchema } from '../../application/commands/ConfigurarComisionesCommand'
import { AsignarContactoCommandSchema } from '../../application/commands/AsignarContactoCommand'
import { BuscarAgenciasMediosQuerySchema } from '../../application/queries/BuscarAgenciasMediosQuery'
import { ObtenerDetalleAgenciaQuerySchema } from '../../application/queries/ObtenerDetalleAgenciaQuery'

// Minimal request/response interfaces for Next.js API routes
interface Request {
    body: Record<string, unknown>
    query: Record<string, unknown>
    params: Record<string, string>
}

interface Response {
    status(code: number): Response
    json(data: unknown): void
}

const controllerLogger = logger

export class AgenciaMediosController {
    private handler: AgenciaMediosCommandHandler
    private agenciaRepo: DrizzleAgenciaMediosRepository

    constructor() {
        this.agenciaRepo = new DrizzleAgenciaMediosRepository({ logger: controllerLogger })
        const contactoRepo = new DrizzleContactoAgenciaRepository()

        this.handler = new AgenciaMediosCommandHandler({
            agenciaRepository: this.agenciaRepo,
            contactoRepository: contactoRepo,
            logger: controllerLogger
        })
    }

    /**
     * Crear nueva agencia de medios
     */
    async crearAgencia(req: Request, res: Response): Promise<void> {
        try {
            const validated = CrearAgenciaMediosCommandSchema.parse(req.body)
            const result = await this.handler.crearAgencia(validated)

            res.status(201).json({
                success: true,
                data: result,
                message: 'Agencia creada exitosamente'
            })
        } catch (error) {
            controllerLogger.error('Error creando agencia:', error instanceof Error ? error : new Error(String(error)))
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            })
        }
    }

    /**
     * Actualizar agencia existente
     */
    async actualizarAgencia(req: Request, res: Response): Promise<void> {
        try {
            const validated = ActualizarAgenciaMediosCommandSchema.parse({
                ...req.body,
                id: req.params.id
            })

            const result = await this.handler.actualizarAgencia(validated)

            res.json({
                success: true,
                data: result,
                message: 'Agencia actualizada exitosamente'
            })
        } catch (error) {
            controllerLogger.error('Error actualizando agencia:', error instanceof Error ? error : new Error(String(error)))
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            })
        }
    }

    /**
     * Configurar comisiones
     */
    async configurarComisiones(req: Request, res: Response): Promise<void> {
        try {
            const validated = ConfigurarComisionesCommandSchema.parse(req.body)
            const result = await this.handler.configurarComisiones(validated)

            res.json({
                success: true,
                data: result,
                message: 'Comisiones configuradas exitosamente'
            })
        } catch (error) {
            controllerLogger.error('Error configurando comisiones:', error instanceof Error ? error : new Error(String(error)))
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            })
        }
    }

    /**
     * Asignar contacto
     */
    async asignarContacto(req: Request, res: Response): Promise<void> {
        try {
            const validated = AsignarContactoCommandSchema.parse(req.body)
            const result = await this.handler.asignarContacto(validated)

            res.status(201).json({
                success: true,
                data: result,
                message: 'Contacto asignado exitosamente'
            })
        } catch (error) {
            controllerLogger.error('Error asignando contacto:', error instanceof Error ? error : new Error(String(error)))
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            })
        }
    }

    /**
     * Buscar agencias con filtros
     */
    async buscarAgencias(req: Request, res: Response): Promise<void> {
        try {
            const validated = BuscarAgenciasMediosQuerySchema.parse({
                ...req.query,
                tenantId: req.body.tenantId || req.query.tenantId
            })

            const result = await this.handler.buscarAgencias(validated)

            res.json({
                success: true,
                data: result
            })
        } catch (error) {
            controllerLogger.error('Error buscando agencias:', error instanceof Error ? error : new Error(String(error)))
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            })
        }
    }

    /**
     * Obtener detalle de agencia
     */
    async obtenerDetalle(req: Request, res: Response): Promise<void> {
        try {
            const validated = ObtenerDetalleAgenciaQuerySchema.parse({
                id: req.params.id,
                tenantId: req.body.tenantId || req.query.tenantId,
                ...req.query
            })

            const result = await this.handler.obtenerDetalle(validated)

            if (!result) {
                res.status(404).json({
                    success: false,
                    error: 'Agencia no encontrada'
                })
                return
            }

            res.json({
                success: true,
                data: result
            })
        } catch (error) {
            controllerLogger.error('Error obteniendo detalle:', error instanceof Error ? error : new Error(String(error)))
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            })
        }
    }

    /**
     * Eliminar agencia (soft delete)
     */
    async eliminarAgencia(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const { tenantId } = req.body

            await this.agenciaRepo.delete(id, tenantId as string)

            res.json({
                success: true,
                message: 'Agencia eliminada exitosamente'
            })
        } catch (error) {
            controllerLogger.error('Error eliminando agencia:', error instanceof Error ? error : new Error(String(error)))
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            })
        }
    }
}

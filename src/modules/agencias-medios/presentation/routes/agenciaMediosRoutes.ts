/**
 * 🏢 Routes: agenciaMediosRoutes
 * 
 * Define el mapa de rutas HTTP del módulo de Agencias de Medios
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { AgenciaMediosController } from '../controllers/AgenciaMediosController'

// Minimal Router stub for Next.js (no express dependency)
class Router {
    private routes: { method: string; path: string; handler: (...args: any[]) => any }[] = []

    get(path: string, handler: (...args: any[]) => any) {
        this.routes.push({ method: 'GET', path, handler })
        return this
    }
    post(path: string, handler: (...args: any[]) => any) {
        this.routes.push({ method: 'POST', path, handler })
        return this
    }
    put(path: string, handler: (...args: any[]) => any) {
        this.routes.push({ method: 'PUT', path, handler })
        return this
    }
    delete(path: string, handler: (...args: any[]) => any) {
        this.routes.push({ method: 'DELETE', path, handler })
        return this
    }
}

const router = new Router()
const controller = new AgenciaMediosController()

/**
 * Rutas del módulo de Agencias de Medios
 * 
 * Base path: /api/v1/agencias-medios
 */

// === RUTAS DE AGENCIAS ===

// GET / - Lista agencias con filtros
router.get('/', controller.buscarAgencias.bind(controller))

// GET /:id - Obtener detalle de agencia
router.get('/:id', controller.obtenerDetalle.bind(controller))

// POST / - Crear nueva agencia
router.post('/', controller.crearAgencia.bind(controller))

// PUT /:id - Actualizar agencia
router.put('/:id', controller.actualizarAgencia.bind(controller))

// DELETE /:id - Eliminar agencia
router.delete('/:id', controller.eliminarAgencia.bind(controller))

// === RUTAS DE CONTACTOS ===

// POST /:agenciaId/contactos - Asignar contacto
router.post('/:agenciaId/contactos', controller.asignarContacto.bind(controller))

// === RUTAS DE COMISIONES ===

// POST /:agenciaId/comisiones - Configurar comisiones
router.post('/:agenciaId/comisiones', controller.configurarComisiones.bind(controller))

// === RUTAS DE ANALYTICS ===

// GET /:id/performance - Obtener performance
// GET /:id/opportunities - Detectar oportunidades
// GET /analytics/portfolio - Estadísticas del portfolio

export default router

/**
 * Mapa completo de rutas:
 * 
 * GET    /api/v1/agencias-medios                    → Lista agencias (filtros, paginación)
 * GET    /api/v1/agencias-medios/:id                → Detalle agencia
 * POST   /api/v1/agencias-medios                    → Crear agencia
 * PUT    /api/v1/agencias-medios/:id                → Actualizar agencia
 * DELETE /api/v1/agencias-medios/:id                → Eliminar agencia (soft delete)
 * 
 * POST   /api/v1/agencias-medios/:id/contactos      → Asignar contacto
 * GET    /api/v1/agencias-medios/:id/contactos       → Listar contactos
 * 
 * POST   /api/v1/agencias-medios/:id/comisiones     → Configurar comisiones
 * GET    /api/v1/agencias-medios/:id/comisiones     → Obtener estructura de comisiones
 * 
 * GET    /api/v1/agencias-medios/:id/performance    → Métricas de performance
 * GET    /api/v1/agencias-medios/:id/opportunities → Oportunidades detectadas
 * GET    /api/v1/agencias-medios/:id/renewal       → Predicción de renovación
 * 
 * GET    /api/v1/agencias-medios/analytics/portfolio → Estadísticas del portfolio
 * GET    /api/v1/agencias-medios/analytics/top      → Top agencias
 * GET    /api/v1/agencias-medios/analytics/alerts   → Alertas activas
 */

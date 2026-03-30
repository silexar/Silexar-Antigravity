/**
 * 🛣️ RUTAS AGENCIA CREATIVA - TIER 0 ENTERPRISE
 *
 * Define el mapa de rutas HTTP del módulo de agencias creativas.
 * En Next.js App Router estas rutas viven en src/app/api/agencias-creativas/.
 * Este archivo documenta el contrato de rutas para referencia del módulo DDD.
 */

import { AgenciaCreativaController } from '../controllers/AgenciaCreativaController';

// Stub de router compatible con Next.js App Router (sin dependencia de express)
interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string;
}

export function createAgenciaCreativaRoutes(controller: AgenciaCreativaController): RouteDefinition[] {
  void controller; // El controller se registra en las API Routes de Next.js

  return [
    // 🏗️ GESTIÓN BÁSICA DE AGENCIAS
    { method: 'POST', path: '/', handler: 'crearAgencia' },
    { method: 'GET', path: '/', handler: 'obtenerAgencias' },
    { method: 'GET', path: '/:id', handler: 'obtenerAgenciaPorId' },

    // 🎯 GESTIÓN DE PROYECTOS
    { method: 'POST', path: '/:agenciaId/proyectos', handler: 'asignarProyecto' },

    // 🤖 INTELIGENCIA ARTIFICIAL
    { method: 'POST', path: '/ai/recomendaciones', handler: 'obtenerRecomendacionesIA' },
    { method: 'POST', path: '/ai/busqueda', handler: 'busquedaInteligente' },

    // 📈 ANALYTICS Y REPORTING
    { method: 'GET', path: '/analytics', handler: 'obtenerAnalytics' },
    { method: 'GET', path: '/:id/analytics', handler: 'obtenerAnalytics' },

    // 🔄 SINCRONIZACIÓN Y PORTFOLIO
    { method: 'POST', path: '/:agenciaId/portfolio/sync', handler: 'sincronizarPortfolio' },
  ];
}

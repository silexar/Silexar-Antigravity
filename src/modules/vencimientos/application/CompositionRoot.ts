/**
 * COMPOSITION ROOT — Módulo Vencimientos
 *
 * @description Factory de instanciación de handlers y servicios del módulo
 * con inyección de dependencias de repositorios reales (Drizzle).
 *
 * @version 1.1.0
 */

import { ProgramaAuspicioDrizzleRepository } from '../infrastructure/repositories/ProgramaAuspicioDrizzleRepository'
import { VencimientosDrizzleRepository } from '../infrastructure/repositories/VencimientosDrizzleRepository'
import { CupoComercialDrizzleRepository } from '../infrastructure/repositories/CupoComercialDrizzleRepository'
import { TarifarioDrizzleRepository } from '../infrastructure/repositories/TarifarioDrizzleRepository'

import { VencimientosHandler } from './handlers/VencimientoHandler'
import { CupoManagementHandler } from './handlers/CupoManagementHandler'
import { ProgramaAuspicioHandler } from './handlers/ProgramaAuspicioHandler'
import { TarifarioHandler } from './handlers/TarifarioHandler'
import { ExclusividadHandler } from './handlers/ExclusividadHandler'
import { ActivarAuspicioHandler } from './handlers/ActivarAuspicioHandler'

// ═══════════════════════════════════════════════════════════════
// REPOSITORIES
// ═══════════════════════════════════════════════════════════════

function createRepositories() {
  return {
    programa: new ProgramaAuspicioDrizzleRepository(),
    vencimientos: new VencimientosDrizzleRepository(),
    cupo: new CupoComercialDrizzleRepository(),
    tarifario: new TarifarioDrizzleRepository(),
  }
}

// ═══════════════════════════════════════════════════════════════
// EMISORA REPOSITORY STUB
// TODO: Reemplazar con implementación real cuando esté disponible
//       src/modules/emisoras/infrastructure/repositories/DrizzleEmisoraRepository.ts
//       Debe implementar IEmisoraRepository del módulo vencimientos.
// ═══════════════════════════════════════════════════════════════

const emisoraRepoStub = {
  findById: async () => null,
  findAll: async () => [],
  findByEstado: async () => [],
  findByOperadorTrafico: async () => [],
  save: async () => {},
  delete: async () => {},
  getMetricasGlobales: async () => ({
    totalEmisoras: 0,
    totalProgramas: 0,
    ocupacionPromedio: 0,
    revenueTotal: 0,
    alertasCriticas: 0,
  }),
} as any

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

export function createVencimientosHandlers() {
  const repos = createRepositories()

  return {
    /** ✅ Completamente conectado a repos reales */
    vencimiento: new VencimientosHandler(
      repos.vencimientos,
      repos.cupo,
      emisoraRepoStub
    ),

    /** ✅ Conectado a repo real */
    programa: new ProgramaAuspicioHandler(repos.programa),

    /** ✅ Conectado a repos reales */
    tarifario: new TarifarioHandler(repos.tarifario, repos.programa),

    /** ✅ Conectado a repo real */
    exclusividad: new ExclusividadHandler(repos.programa),

    /** ✅ Conectado a repo real */
    activarAuspicio: new ActivarAuspicioHandler(repos.cupo),

    /** ✅ Conectado a repos reales */
    cupo: new CupoManagementHandler(repos.cupo, repos.vencimientos),

    /**
     * ⚠️ PENDIENTE: Requiere IDisponibilidadRepository
     * No existe implementación Drizzle para este repositorio.
     * Se debe crear en: src/modules/vencimientos/infrastructure/repositories/
     */
    disponibilidad: null as any,

    /**
     * ⚠️ PENDIENTE: Requiere IDisponibilidadRepository + IProgramaAuspicioRepository + ICupoComercialRepository
     */
    analytics: null as any,

    /**
     * ⚠️ PENDIENTE: Requiere IEmisoraRepository real + ContratoSyncService conectado
     */
    sincronizacion: null as any,
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

let handlersInstance: ReturnType<typeof createVencimientosHandlers> | null = null

export function getVencimientosHandlers() {
  if (!handlersInstance) {
    handlersInstance = createVencimientosHandlers()
  }
  return handlersInstance
}

export default {
  createVencimientosHandlers,
  getVencimientosHandlers,
}

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';

import { ConciliacionFacade } from '@/modules/conciliacion/application/api/ConciliacionFacade';
import { PrismaConciliacionRepository } from '@/modules/conciliacion/infrastructure/repositories/PrismaConciliacionRepository';
import { PrismaDiscrepanciaRepository } from '@/modules/conciliacion/infrastructure/repositories/PrismaDiscrepanciaRepository';
import { SalesBridgeCommandHandler } from '@/modules/conciliacion/application/handlers/SalesBridgeCommandHandler';

import { IRegistroEmisionRepository } from '@/modules/conciliacion/domain/repositories/IRegistroEmisionRepository';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Setup de instancias (Idealmente mediante DI Container)
const conciliacionRepo = new PrismaConciliacionRepository();
const discrepanciaRepo = new PrismaDiscrepanciaRepository();

// Mock seguro TIER 0
const mockRegistroRepo: IRegistroEmisionRepository = {
  saveProgramados: async () => {},
  saveReales: async () => {},
  findProgramadosByFechaAndEmisora: async () => [],
  findRealesByFechaAndEmisora: async () => [],
  clearProgramados: async () => {},
  clearReales: async () => {}
}; 

const salesBridgeHandler = new SalesBridgeCommandHandler(conciliacionRepo, discrepanciaRepo);
const facade = new ConciliacionFacade(conciliacionRepo, mockRegistroRepo, discrepanciaRepo, salesBridgeHandler);

export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('codigoSP');
    const action = searchParams.get('action');

    try {
       if (action === 'metricas') {
          const result = await facade.getMeticrasDashboardGlobal(new Date());
          return NextResponse.json(result.value);
       }

       if (action === 'verificar' && code) {
          const result = await facade.verificarEmisionSpot(code, 'em_radio_corazon', new Date());
          return NextResponse.json(result.value);
       }

       return NextResponse.json({ message: 'API Conciliación TIER 0 Activa', status: 'OK' });
    } catch (error) {
      logger.error('[API/Conciliacion] Error GET:', error instanceof Error ? error : undefined, { module: 'conciliacion', action: 'GET' });
      return apiServerError();
    }
  }
);

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'admin' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      const { action, spotId, ejecutivoId, mensaje, aprobado, instrucciones, spotIds, tipoAccion, mensajeComun } = body;

      let result;

      if (action === 'consultar-ventas') {
        result = await facade.enviarConsultaVentas(spotId, ejecutivoId, mensaje);
      } else if (action === 'registrar-decision') {
        result = await facade.registrarDecisionVentas(spotId, aprobado, instrucciones);
      } else if (action === 'accion-masiva') {
        result = await facade.ejecutarAccionMasiva(spotIds, tipoAccion, mensajeComun);
      } else {
        return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
      }

      if (result.isFailure) {
          return NextResponse.json({ 
              error: (result.error as { message?: string })?.message || String(result.error) || 'Operación Fallida',
              code: (result.error as { code?: string })?.code
          }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: result.value });

    } catch (error) {
      logger.error('[API/Conciliacion] Error POST:', error instanceof Error ? error : undefined, { module: 'conciliacion', action: 'POST' });
      return apiServerError();
    }
  }
);

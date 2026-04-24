/**
 * POST /api/cron/limpiar-expirados
 * Endpoint de cron para limpiar clips expirados, accesos vencidos y registros de aire antiguos.
 *
 * Protegido por CRON_SECRET para evitar ejecuciones no autorizadas.
 * Configurar en Vercel Cron o llamar desde GitHub Actions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';

import {
  DrizzleRegistroAireRepository,
  DrizzleClipEvidenciaRepository,
  DrizzleLinkTemporalRepository,
  LimpiarExpiradosUseCase,
} from '@/modules/registro-emision';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  try {
    // ── Auth por secret ──
    const authHeader = req.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── Ejecutar limpieza ──
    const useCase = new LimpiarExpiradosUseCase(
      new DrizzleRegistroAireRepository(),
      new DrizzleClipEvidenciaRepository(),
      new DrizzleLinkTemporalRepository(),
    );

    // Ejecutar para cada tenant conocido o procesar globalmente
    // Por simplicidad, este cron procesa TODOS los tenants usando queries sin filtro de tenant
    // En producción, iterar sobre tenants activos
    const result = await useCase.execute('00000000-0000-0000-0000-000000000000', new Date());

    logger.info('[CRON] Limpieza de expirados ejecutada', {
      clipsEliminados: result.clipsEliminados,
      accesosRevocados: result.accesosRevocados,
      registrosAireEliminados: result.registrosAireEliminados,
    });

    return NextResponse.json({
      success: true,
      data: result,
      ejecutadoEn: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('[CRON] Error en limpieza de expirados', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: 'Error ejecutando limpieza' },
      { status: 500 }
    );
  }
}

/**
 * Cron Job: Procesar publicaciones RRSS programadas
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/observability';

import { RrssPublicacionDrizzleRepository } from '@/modules/rrss/infrastructure/repositories/RrssPublicacionDrizzleRepository';
import { RrssConnectionDrizzleRepository } from '@/modules/rrss/infrastructure/repositories/RrssConnectionDrizzleRepository';
import { CryptoTokenService } from '@/modules/rrss/infrastructure/services/CryptoTokenService';
import { RrssPublisherService } from '@/modules/rrss/infrastructure/services/RrssPublisherService';
import { ProcesarPublicacionesProgramadasHandler } from '@/modules/rrss/application/handlers/ProcesarPublicacionesProgramadasHandler';

const pubRepo = new RrssPublicacionDrizzleRepository();
const connRepo = new RrssConnectionDrizzleRepository();
const cryptoService = new CryptoTokenService(
  process.env.RRSS_TOKEN_SECRET || 'silexar-rrss-default-secret-key-must-be-32-chars-long'
);
const publisher = new RrssPublisherService(cryptoService);
const handler = new ProcesarPublicacionesProgramadasHandler(pubRepo, connRepo, publisher);

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ahora = new Date();
    const pendientes = await pubRepo.findAllProgramadasPendientes(ahora);

    if (pendientes.length === 0) {
      return NextResponse.json({
        ok: true,
        procesadas: 0,
        fallidas: 0,
        message: 'No hay publicaciones programadas pendientes',
      });
    }

    const tenantIds = [...new Set(pendientes.map((p) => p.tenantId))];
    let totalProcesadas = 0;
    let totalFallidas = 0;

    for (const tenantId of tenantIds) {
      const res = await handler.execute(tenantId);
      totalProcesadas += res.procesadas;
      totalFallidas += res.fallidas;
    }

    return NextResponse.json({
      ok: true,
      procesadas: totalProcesadas,
      fallidas: totalFallidas,
    });
  } catch (error) {
    logger.error('Error en cron RRSS', error instanceof Error ? error : undefined, { module: 'rrss' });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

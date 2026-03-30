import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tandas, spotsTanda } from "@/lib/db/emision-schema";
import { eq, asc } from "drizzle-orm";
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!db) return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
  try {
    // 1. Obtener Tandas del día (Simulamos fecha actual o una específica)
    // En producción esto recibiría ?date=YYYY-MM-DD
    const tandasData = await db.query.tandas.findMany({
      with: {
        spots: {
          with: {
            cuna: true,
            campana: true
          },
          orderBy: [asc(spotsTanda.orden)]
        }
      },
      orderBy: [asc(tandas.horaInicio)],
      limit: 20 // Limitado para demo
    });

    // 2. Transformar para el frontend (Grilla UI)
    const gridData = tandasData.map(tanda => ({
      id: tanda.id,
      hora: tanda.horaInicio.toString().slice(0, 5),
      nombre: tanda.nombre || `Bloque ${tanda.codigo}`,
      estado: tanda.estado,
      ocupacion: Math.round((tanda.duracionProgramadaSegundos || 0) / (tanda.duracionMaximaSegundos || 180) * 100),
      items: tanda.spots.map(spot => ({
        id: spot.id,
        titulo: spot.cuna.nombre,
        cliente: spot.campana?.nombre || "Directo",
        duracion: spot.duracionSegundos,
        estado: spot.estado,
        tipo: 'spot' // Por ahora solo spots
      }))
    }));

    return NextResponse.json({
      success: true,
      data: gridData,
      meta: {
        totalBlocks: gridData.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: unknown) {
    logger.error('Error fetching grid data:', error instanceof Error ? error : undefined, { module: 'grilla' });
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal Server Error" 
      },
      { status: 500 }
    );
  }
}

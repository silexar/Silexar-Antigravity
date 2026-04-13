/**
 * 🌐 SILEXAR PULSE - API Routes Informes IA
 * 
 * @description API REST endpoints para generación de informes con IA
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { MotorInformesIA, type TipoInforme, type PeriodoInforme } from '@/lib/services/motor-informes-ia';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

export const GET = withApiRoute(
  { resource: 'reportes', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const tipo = (searchParams.get('tipo') || 'resumen_ejecutivo') as TipoInforme;
      const periodo = (searchParams.get('periodo') || 'mensual') as PeriodoInforme;
      
      // Calcular fechas según período
      const hoy = new Date();
      let fechaInicio = new Date();
      
      switch (periodo) {
        case 'diario':
          fechaInicio = new Date(hoy);
          break;
        case 'semanal':
          fechaInicio.setDate(hoy.getDate() - 7);
          break;
        case 'mensual':
          fechaInicio.setMonth(hoy.getMonth() - 1);
          break;
        case 'trimestral':
          fechaInicio.setMonth(hoy.getMonth() - 3);
          break;
        case 'anual':
          fechaInicio.setFullYear(hoy.getFullYear() - 1);
          break;
      }

      const informe = await MotorInformesIA.generarInforme({
        tipo,
        periodo,
        fechaInicio,
        fechaFin: hoy,
        incluirGraficos: true,
        incluirPredicciones: true
      });

      return NextResponse.json({
        success: true,
        data: informe
      });

    } catch (error) {
      logger.error('[API/Informes] Error GET:', error instanceof Error ? error : undefined, { module: 'informes', action: 'GET' });
      return apiServerError()
    }
  }
);

export const POST = withApiRoute(
  { resource: 'reportes', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      
      const { tipo, fechaInicio, fechaFin, emisoras, anunciantes, campanas } = body;

      if (!tipo || !fechaInicio || !fechaFin) {
        return NextResponse.json({ success: false, error: 'Tipo y fechas son requeridos' }, { status: 400 });
      }

      const informe = await MotorInformesIA.generarInforme({
        tipo,
        periodo: 'personalizado',
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        emisoras,
        anunciantes,
        campanas,
        incluirGraficos: true,
        incluirPredicciones: true
      });

      return NextResponse.json({
        success: true,
        data: informe,
        message: 'Informe generado exitosamente'
      }, { status: 201 });

    } catch (error) {
      logger.error('[API/Informes] Error POST:', error instanceof Error ? error : undefined, { module: 'informes', action: 'POST' });
      return apiServerError()
    }
  }
);

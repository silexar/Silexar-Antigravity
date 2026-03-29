/**
 * 🔮 SILEXAR PULSE - API Predicción de Demanda
 * 
 * @version 2025.1.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'forecast'; // forecast | tendencias | ocupacion | oportunidades
    const mes = parseInt(searchParams.get('mes') || String(new Date().getMonth() + 1));
    const anio = parseInt(searchParams.get('anio') || String(new Date().getFullYear()));
    
    if (tipo === 'forecast') {
      const isMesAlto = [12, 1, 2, 3].includes(mes);
      const isMesBajo = [6, 7, 8].includes(mes);
      
      const historicoPromedio = 85000000;
      let factorTemporada = 1;
      if (isMesAlto) factorTemporada = 1.35;
      if (isMesBajo) factorTemporada = 0.75;
      
      const ingresoBase = Math.round(historicoPromedio * factorTemporada);
      
      return NextResponse.json({
        success: true,
        data: {
          periodo: `${anio}-${mes.toString().padStart(2, '0')}`,
          ingresoBase,
          ingresoOptimista: Math.round(ingresoBase * 1.20),
          ingresoPesimista: Math.round(ingresoBase * 0.80),
          probabilidadCumplimiento: isMesAlto ? 85 : isMesBajo ? 65 : 75,
          factoresPositivos: isMesAlto ? ['Temporada alta', 'Campañas de fin de año'] : ['Pipeline estable'],
          factoresRiesgo: isMesBajo ? ['Temporada baja', 'Presupuestos reducidos'] : ['Competencia activa']
        }
      });
    }
    
    if (tipo === 'tendencias') {
      return NextResponse.json({
        success: true,
        data: [
          { categoria: 'Radio FM', tendencia: 'estable', variacion: 2, prediccion30dias: 3 },
          { categoria: 'Podcast', tendencia: 'subiendo', variacion: 15, prediccion30dias: 20 },
          { categoria: 'Programmatic Audio', tendencia: 'subiendo', variacion: 25, prediccion30dias: 30 },
          { categoria: 'Patrocinios', tendencia: 'estable', variacion: -1, prediccion30dias: 2 }
        ]
      });
    }
    
    if (tipo === 'ocupacion') {
      const proyeccion = [];
      const hoy = new Date();
      
      for (let i = 0; i < 7; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() + i);
        const factorFuturo = Math.max(0.3, 1 - (i * 0.05));
        
        proyeccion.push({
          fecha: fecha.toISOString().split('T')[0],
          ocupacionPrime: Math.round(90 * factorFuturo),
          ocupacionRotativo: Math.round(70 * factorFuturo),
          ingresoProyectado: Math.round(3500000 * factorFuturo)
        });
      }
      
      return NextResponse.json({ success: true, data: proyeccion });
    }
    
    if (tipo === 'oportunidades') {
      return NextResponse.json({
        success: true,
        data: [
          { tipo: 'renovacion', cliente: 'Empresa ABC', descripcion: 'Contrato vence en 15 días', valor: 24000000, urgencia: 'alta' },
          { tipo: 'expansion', cliente: 'Servicios XYZ', descripcion: 'Potencial de upsell', valor: 8000000, urgencia: 'media' },
          { tipo: 'reactivacion', cliente: 'Comercial DEF', descripcion: 'Sin actividad 6 meses', valor: 12000000, urgencia: 'media' },
          { tipo: 'cross_sell', cliente: 'Tech Solutions', descripcion: 'Solo usa radio, perfil digital', valor: 5000000, urgencia: 'baja' }
        ]
      });
    }
    
    return NextResponse.json({ success: false, error: 'Tipo no válido' }, { status: 400 });
    
  } catch (error) {
    logger.error('[API/PrediccionDemanda] Error GET:', error instanceof Error ? error : undefined, { module: 'prediccion-demanda', action: 'GET' });
    return apiServerError()
  }
}

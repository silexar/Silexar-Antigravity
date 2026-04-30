/**
 * 🧠 SILEXAR PULSE - Cortex Dashboard API
 * 
 * @description Dashboard unificado para el CEO con métricas de IA,
 * estado del sistema, decisiones automatizadas y ROI de IA
 * 
 * @version 2025.1.0
 * @tier TIER_FUNCTIONAL
 * @phase FASE 2: Intelligence & Automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════

interface MotorStatus {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'online' | 'offline' | 'degraded' | 'maintenance';
  uptime: number;
  requestsCount: number;
  avgResponseTime: number;
  successRate: number;
  lastError?: string;
}

interface DecisionData {
  total: number;
  aceptadas: number;
  rechazadas: number;
  pendientes: number;
  tasaAceptacion: number;
}

interface MetricData {
  label: string;
  valor: number;
  unidad: string;
  cambio: number;
  tendencia: 'up' | 'down' | 'stable';
}

interface AlertData {
  id: string;
  tipo: 'warning' | 'critical' | 'info';
  mensaje: string;
  timestamp: string;
  leida: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function generateId(): string {
  return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function uptimeToString(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

function getMockMotores(): MotorStatus[] {
  return [
    { id: 'cortex-guardian', nombre: 'Cortex Guardian', descripcion: 'Seguridad y detección de anomalías', estado: 'online', uptime: Date.now() - 172800000, requestsCount: 12847, avgResponseTime: 45, successRate: 99.8 },
    { id: 'cortex-prophet', nombre: 'Cortex Prophet', descripcion: 'Predicción de renovaciones y churn', estado: 'online', uptime: Date.now() - 259200000, requestsCount: 3241, avgResponseTime: 120, successRate: 97.2 },
    { id: 'cortex-flow', nombre: 'Cortex Flow', descripcion: 'Optimización de precios y scheduling', estado: 'online', uptime: Date.now() - 86400000, requestsCount: 892, avgResponseTime: 85, successRate: 98.9 },
    { id: 'cortex-judge', nombre: 'Cortex Judge', descripcion: 'Validación de reglas de negocio', estado: 'degraded', uptime: Date.now() - 43200000, requestsCount: 5621, avgResponseTime: 230, successRate: 89.5, lastError: 'High latency detected' },
    { id: 'cortex-nlp', nombre: 'Cortex NLP', descripcion: 'Procesamiento de lenguaje natural', estado: 'online', uptime: Date.now() - 172800000, requestsCount: 2156, avgResponseTime: 200, successRate: 95.1 },
  ];
}

function getMockDecisions(): DecisionData {
  return {
    total: 15847,
    aceptadas: 12453,
    rechazadas: 2876,
    pendientes: 518,
    tasaAceptacion: 78.6
  };
}

function getMockMetrics(): MetricData[] {
  return [
    { label: 'Ingresos Mensuales', valor: 485000000, unidad: 'CLP', cambio: 12.5, tendencia: 'up' },
    { label: 'Tasa de Renovación', valor: 87.3, unidad: '%', cambio: 3.2, tendencia: 'up' },
    { label: 'Churn Rate', valor: 4.2, unidad: '%', cambio: -0.8, tendencia: 'down' },
    { label: 'Clientes Activos', valor: 342, unidad: '', cambio: 8, tendencia: 'up' },
    { label: 'Ocupación Media', valor: 78.5, unidad: '%', cambio: 5.1, tendencia: 'up' },
    { label: 'Tiempo Medio de Ciclo', valor: 4.2, unidad: 'días', cambio: -1.3, tendencia: 'down' },
  ];
}

function getMockAlerts(): AlertData[] {
  return [
    { id: generateId(), tipo: 'critical', mensaje: 'Cortex Judge detectando alta latencia - investigando', timestamp: new Date(Date.now() - 300000).toISOString(), leida: false },
    { id: generateId(), tipo: 'warning', mensaje: '3 contratos próximos a vencer esta semana', timestamp: new Date(Date.now() - 3600000).toISOString(), leida: false },
    { id: generateId(), tipo: 'info', mensaje: 'Nuevo patrón de consumo detectado en Región Metropolitana', timestamp: new Date(Date.now() - 7200000).toISOString(), leida: true },
  ];
}

// ═══════════════════════════════════════════════════════════════════
// GET /api/cortex
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
    const tenantId = req.headers.get('x-silexar-tenant-id') || 'demo-tenant';
    const { searchParams } = new URL(req.url);

    // Endpoints específicos
    if (searchParams.get('motores') === 'true') {
      const motores = getMockMotores();
      const resumen = {
        total: motores.length,
        online: motores.filter(m => m.estado === 'online').length,
        degraded: motores.filter(m => m.estado === 'degraded').length,
        offline: motores.filter(m => m.estado === 'offline').length,
      };

      return NextResponse.json({
        success: true,
        data: {
          motores,
          resumen,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (searchParams.get('decisiones') === 'true') {
      return NextResponse.json({
        success: true,
        data: {
          decisiones: getMockDecisions(),
          timestamp: new Date().toISOString()
        }
      });
    }

    if (searchParams.get('metricas') === 'true') {
      return NextResponse.json({
        success: true,
        data: {
          metricas: getMockMetrics(),
          timestamp: new Date().toISOString()
        }
      });
    }

    if (searchParams.get('alertas') === 'true') {
      return NextResponse.json({
        success: true,
        data: {
          alertas: getMockAlerts(),
          noLeidas: getMockAlerts().filter(a => !a.leida).length,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Dashboard completo
    const dashboard = {
      motores: getMockMotores(),
      motoresResumen: {
        total: 5,
        online: 4,
        degraded: 1,
        offline: 0
      },
      decisiones: getMockDecisions(),
      metricas: getMockMetrics(),
      alertas: getMockAlerts(),
      alertasNoLeidas: getMockAlerts().filter(a => !a.leida).length,
      roi: {
        ahorrTiempo: 1240, // horas
        recuperacionInversion: 34000000, // CLP
        mejoraPrecision: 15.2, // %
        exactitudPredicciones: 89.7 // %
      },
      tendencias: {
        aceptacionIA: [72, 75, 78, 81, 85],
        eficienciaOperativa: [65, 68, 72, 76, 79],
        satisfaccionCliente: [88, 89, 91, 92, 94]
      },
      timestamp: new Date().toISOString()
    };

    console.log(`[AUDIT] Cortex dashboard accessed by ${userId} (tenant: ${tenantId})`);

    return NextResponse.json({
      success: true,
      data: dashboard
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al obtener dashboard' } }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════
// POST /api/cortex - Acciones específicas
// ═══════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
    const body = await req.json();

    const { accion, datos } = body;

    switch (accion) {
      case 'marcar_alerta_leida': {
        const { alertaId } = datos || {};
        console.log(`[AUDIT] User ${userId} marked alert ${alertaId} as read`);
        return NextResponse.json({
          success: true,
          data: { alertaId, leida: true }
        });
      }

      case 'reiniciar_motor': {
        const { motorId } = datos || {};
        console.log(`[AUDIT] User ${userId} requested restart for motor ${motorId}`);
        return NextResponse.json({
          success: true,
          data: {
            motorId,
            estado: 'restarting',
            mensaje: 'Motor reiniciado exitosamente'
          }
        });
      }

      case 'ajustar_sensibilidad': {
        const { motorId, nivel } = datos || {};
        console.log(`[AUDIT] User ${userId} adjusted sensitivity for ${motorId} to ${nivel}`);
        return NextResponse.json({
          success: true,
          data: {
            motorId,
            sensibilidad: nivel,
            mensaje: 'Sensibilidad ajustada'
          }
        });
      }

      case 'generar_reporte': {
        const { tipo, formato } = datos || {};
        console.log(`[AUDIT] User ${userId} requested ${tipo} report in ${formato} format`);
        return NextResponse.json({
          success: true,
          data: {
            reporteId: generateId(),
            tipo,
            formato: formato || 'pdf',
            estado: 'generating',
            estimatedTime: 30, // seconds
            downloadUrl: `/api/cortex/reportes/${generateId()}`
          }
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_ACTION', message: `Acción '${accion}' no reconocida` }
        }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error en acción de cortex' } }, { status: 500 });
  }
}

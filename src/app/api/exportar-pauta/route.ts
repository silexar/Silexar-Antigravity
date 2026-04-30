/**
 * 🌐 SILEXAR PULSE - API Routes Exportación de Pauta
 * 
 * @description API REST endpoints para generar y descargar archivos de pauta
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { GeneradorPauta, type FormatoExportacion, type TandaPauta } from '@/lib/services/generador-pauta';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Mock de datos para pruebas
const mockTandas: TandaPauta[] = [
  {
    codigo: 'TAN-001',
    emisora: 'Radio Cooperativa',
    emisoraCodigo: 'COOP',
    fecha: '2025-02-17',
    horaInicio: '08:00',
    horaFin: '08:03',
    duracionTotal: 150,
    spots: [
      { orden: 1, codigo: 'CUN-001', nombre: 'Spot Banco Chile 30s', anunciante: 'Banco de Chile', duracion: 30, archivo: 'banco_chile_30s.mp3' },
      { orden: 2, codigo: 'CUN-002', nombre: 'Jingle Falabella 20s', anunciante: 'Falabella', duracion: 20, archivo: 'falabella_jingle_20s.mp3' },
      { orden: 3, codigo: 'CUN-003', nombre: 'Spot Coca-Cola 30s', anunciante: 'Coca-Cola', duracion: 30, archivo: 'cocacola_verano_30s.mp3' },
      { orden: 4, codigo: 'CUN-004', nombre: 'Mención LATAM 15s', anunciante: 'LATAM Airlines', duracion: 15, archivo: 'latam_mencion_15s.mp3' },
      { orden: 5, codigo: 'CUN-005', nombre: 'Spot Entel 30s + tag', anunciante: 'Entel', duracion: 55, archivo: 'entel_completo_55s.mp3' }
    ]
  },
  {
    codigo: 'TAN-002',
    emisora: 'Radio Cooperativa',
    emisoraCodigo: 'COOP',
    fecha: '2025-02-17',
    horaInicio: '12:00',
    horaFin: '12:03',
    duracionTotal: 120,
    spots: [
      { orden: 1, codigo: 'CUN-006', nombre: 'Spot Ripley 30s', anunciante: 'Ripley', duracion: 30, archivo: 'ripley_30s.mp3' },
      { orden: 2, codigo: 'CUN-007', nombre: 'Spot Paris 30s', anunciante: 'Paris', duracion: 30, archivo: 'paris_30s.mp3' },
      { orden: 3, codigo: 'CUN-008', nombre: 'Jingle Líder 30s', anunciante: 'Líder', duracion: 30, archivo: 'lider_jingle_30s.mp3' },
      { orden: 4, codigo: 'CUN-009', nombre: 'Mención Movistar 30s', anunciante: 'Movistar', duracion: 30, archivo: 'movistar_mencion_30s.mp3' }
    ]
  },
  {
    codigo: 'TAN-003',
    emisora: 'Radio Cooperativa',
    emisoraCodigo: 'COOP',
    fecha: '2025-02-17',
    horaInicio: '18:00',
    horaFin: '18:03',
    duracionTotal: 165,
    spots: [
      { orden: 1, codigo: 'CUN-010', nombre: 'Spot BCI 30s', anunciante: 'BCI', duracion: 30, archivo: 'bci_30s.mp3' },
      { orden: 2, codigo: 'CUN-011', nombre: 'Spot Jumbo 45s', anunciante: 'Jumbo', duracion: 45, archivo: 'jumbo_45s.mp3' },
      { orden: 3, codigo: 'CUN-012', nombre: 'Spot Copec 30s', anunciante: 'Copec', duracion: 30, archivo: 'copec_30s.mp3' },
      { orden: 4, codigo: 'CUN-013', nombre: 'Jingle CCU 30s', anunciante: 'CCU', duracion: 30, archivo: 'ccu_jingle_30s.mp3' },
      { orden: 5, codigo: 'CUN-014', nombre: 'Spot VTR 30s', anunciante: 'VTR', duracion: 30, archivo: 'vtr_30s.mp3' }
    ]
  }
];

export const GET = withApiRoute(
  { resource: 'reportes', action: 'export', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const formato = (searchParams.get('formato') || 'csv') as FormatoExportacion;
      const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0];
      const emisora = searchParams.get('emisora') || 'COOP';
      const download = searchParams.get('download') === 'true';

      // Filtrar tandas por fecha (en producción vendría de la BD)
      const tandasFiltradas = mockTandas.filter(t => t.fecha === fecha);

      // Generar archivo
      const resultado = GeneradorPauta.generar({
        formato,
        emisora: 'Radio Cooperativa',
        emisoraCodigo: emisora,
        fecha,
        tandas: tandasFiltradas,
        incluirEncabezados: true
      });

      if (!resultado.success) {
        return NextResponse.json({ success: false, error: 'Error al generar archivo' }, { status: 500 });
      }

      // Si es descarga, devolver como archivo
      if (download) {
        return new NextResponse(resultado.contenido, {
          headers: {
            'Content-Type': resultado.mimeType,
            'Content-Disposition': `attachment; filename="${resultado.nombreArchivo}"`,
            'Content-Length': resultado.tamanioBytes.toString()
          }
        });
      }

      // Si no, devolver info del archivo generado
      return NextResponse.json({
        success: true,
        data: {
          formato: resultado.formato,
          nombreArchivo: resultado.nombreArchivo,
          mimeType: resultado.mimeType,
          tamanioBytes: resultado.tamanioBytes,
          tandasIncluidas: tandasFiltradas.length,
          spotsIncluidos: tandasFiltradas.reduce((sum, t) => sum + t.spots.length, 0),
          preview: resultado.contenido.substring(0, 500) + (resultado.contenido.length > 500 ? '...' : '')
        }
      });

    } catch (error) {
      logger.error('[API/Exportar] Error GET:', error instanceof Error ? error : undefined, { module: 'exportar-pauta', action: 'GET' });
      return apiServerError()
    }
  }
);

export const POST = withApiRoute(
  { resource: 'reportes', action: 'export' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();

      const { formato, fecha, emisora, emisoraCodigo, tandas } = body;

      if (!formato || !fecha || !tandas || !Array.isArray(tandas)) {
        return NextResponse.json({ success: false, error: 'Formato, fecha y tandas requeridos' }, { status: 400 });
      }

      // Generar archivo
      const resultado = GeneradorPauta.generar({
        formato: formato as FormatoExportacion,
        emisora: emisora || 'Sin especificar',
        emisoraCodigo: emisoraCodigo || 'XXX',
        fecha,
        tandas,
        incluirEncabezados: true
      });

      if (!resultado.success) {
        return NextResponse.json({ success: false, error: 'Error al generar archivo' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          formato: resultado.formato,
          nombreArchivo: resultado.nombreArchivo,
          contenido: resultado.contenido,
          mimeType: resultado.mimeType,
          tamanioBytes: resultado.tamanioBytes
        },
        message: 'Pauta generada exitosamente'
      });

    } catch (error) {
      logger.error('[API/Exportar] Error POST:', error instanceof Error ? error : undefined, { module: 'exportar-pauta', action: 'POST' });
      return apiServerError()
    }
  }
);

/**
 * 🌐 SILEXAR PULSE - API Cuña Individual TIER 0
 * 
 * Endpoints para operaciones sobre cuña específica
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Zod schemas for input validation
const updateCunaSchema = z.object({
  nombre: z.string().min(1).max(200).optional(),
  descripcion: z.string().max(1000).optional(),
  producto: z.string().max(200).optional(),
  notas: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  fechaInicioVigencia: z.string().date().optional(),
  fechaFinVigencia: z.string().date().optional(),
  urgencia: z.enum(['programada', 'urgente', 'critica']).optional(),
});

const patchCunaSchema = z.object({
  accion: z.enum([
    'aprobar', 'rechazar', 'poner_en_aire', 'pausar',
    'reactivar', 'finalizar', 'extender_vigencia', 'incrementar_emision'
  ]),
  nuevaFechaFin: z.string().date().optional(),
});

// Mock data reference (compartido con route.ts principal)
// eslint-disable-next-line prefer-const
let mockCunas = [
  {
    id: 'cun-001', spxCodigo: 'SPX000001', nombre: 'Spot Verano Banco Chile 30s',
    tipo: 'audio', anuncianteId: 'anc-001', anuncianteNombre: 'Banco de Chile',
    producto: 'Cuenta Corriente', duracionSegundos: 30, duracionFormateada: '0:30',
    estado: 'en_aire', urgencia: 'programada', diasRestantes: 15,
    scoreTecnico: 92, scoreBrandSafety: 88, totalEmisiones: 156,
    fechaCreacion: '2025-01-25T14:30:00Z', fechaInicioVigencia: '2025-02-01',
    fechaFinVigencia: '2025-02-28', esCritica: false,
    descripcion: 'Spot de 30 segundos para campaña de verano de Banco Chile',
    notas: 'Aprobado por cliente el 25/01',
    tags: ['verano', 'banco', 'comercial'],
    historial: [
      { accion: 'CREAR_CUNA', timestamp: '2025-01-25T14:30:00Z', usuario: 'María García' },
      { accion: 'SUBIR_AUDIO', timestamp: '2025-01-25T15:00:00Z', usuario: 'María García' },
      { accion: 'APROBAR', timestamp: '2025-01-26T10:00:00Z', usuario: 'Carlos López' },
      { accion: 'PONER_EN_AIRE', timestamp: '2025-02-01T08:00:00Z', usuario: 'Sistema' }
    ]
  }
];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ═══════════════════════════════════════════════════════════════
// GET - Obtener detalle de cuña
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'cunas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      // Extraer ID de la URL ya que params es async
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      
      const cuna = mockCunas.find(c => c.id === id || c.spxCodigo === id);
      
      if (!cuna) {
        return NextResponse.json(
          { success: false, error: 'Cuña no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: cuna
      });
      
    } catch (error) {
      logger.error('[API/Cuña] Error GET:', error instanceof Error ? error : undefined, { module: '[id]' });
      return NextResponse.json(
        { success: false, error: 'Error al obtener cuña' },
        { status: 500 }
      );
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// PUT - Actualizar cuña
// ═══════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
  { resource: 'cunas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      // Extraer ID de la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      
      const body = await req.json();

      // Validate input with Zod
      const parsed = updateCunaSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
          { status: 422 }
        );
      }

      const cunaIndex = mockCunas.findIndex(c => c.id === id);

      if (cunaIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Cuña no encontrada' },
          { status: 404 }
        );
      }

      const validatedBody = parsed.data;

      // Actualizar campos permitidos
      const camposActualizables = [
        'nombre', 'descripcion', 'producto', 'notas', 'tags',
        'fechaInicioVigencia', 'fechaFinVigencia', 'urgencia'
      ];

      for (const campo of camposActualizables) {
        if ((validatedBody as Record<string, unknown>)[campo] !== undefined) {
          (mockCunas[cunaIndex] as Record<string, unknown>)[campo] = (validatedBody as Record<string, unknown>)[campo];
        }
      }

      // Recalcular días restantes si cambió fecha fin
      if (validatedBody.fechaFinVigencia) {
        const fechaFin = new Date(validatedBody.fechaFinVigencia);
        mockCunas[cunaIndex].diasRestantes = Math.ceil(
          (fechaFin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Actualizar criticidad
      mockCunas[cunaIndex].esCritica = validatedBody.urgencia === 'critica' || mockCunas[cunaIndex].diasRestantes <= 1;

      return NextResponse.json({
        success: true,
        data: mockCunas[cunaIndex],
        message: 'Cuña actualizada exitosamente'
      });
      
    } catch (error) {
      logger.error('[API/Cuña] Error PUT:', error instanceof Error ? error : undefined, { module: '[id]' });
      return NextResponse.json(
        { success: false, error: 'Error al actualizar cuña' },
        { status: 500 }
      );
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// DELETE - Eliminar cuña (soft delete)
// ═══════════════════════════════════════════════════════════════

export const DELETE = withApiRoute(
  { resource: 'cunas', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      // Extraer ID de la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      
      const cunaIndex = mockCunas.findIndex(c => c.id === id);
      
      if (cunaIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Cuña no encontrada' },
          { status: 404 }
        );
      }

      // Validar que no esté en aire
      if (mockCunas[cunaIndex].estado === 'en_aire') {
        return NextResponse.json(
          { success: false, error: 'No se puede eliminar una cuña que está en aire' },
          { status: 400 }
        );
      }

      // Soft delete
      mockCunas.splice(cunaIndex, 1);

      return NextResponse.json({
        success: true,
        message: 'Cuña eliminada exitosamente'
      });
      
    } catch (error) {
      logger.error('[API/Cuña] Error DELETE:', error instanceof Error ? error : undefined, { module: '[id]' });
      return NextResponse.json(
        { success: false, error: 'Error al eliminar cuña' },
        { status: 500 }
      );
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// PATCH - Acciones específicas sobre cuña
// ═══════════════════════════════════════════════════════════════

export const PATCH = withApiRoute(
  { resource: 'cunas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      // Extraer ID de la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      
      const body = await req.json();

      // Validate input with Zod
      const parsed = patchCunaSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
          { status: 422 }
        );
      }

      const cunaIndex = mockCunas.findIndex(c => c.id === id);

      if (cunaIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Cuña no encontrada' },
          { status: 404 }
        );
      }

      const cuna = mockCunas[cunaIndex];
      const accion = parsed.data.accion;

      switch (accion) {
        case 'aprobar':
          cuna.estado = 'aprobada';
          break;
          
        case 'rechazar':
          cuna.estado = 'borrador';
          break;
          
        case 'poner_en_aire':
          if (cuna.estado !== 'aprobada') {
            return NextResponse.json(
              { success: false, error: 'Solo se pueden poner en aire cuñas aprobadas' },
              { status: 400 }
            );
          }
          cuna.estado = 'en_aire';
          break;
          
        case 'pausar':
          cuna.estado = 'pausada';
          break;
          
        case 'reactivar':
          cuna.estado = 'aprobada';
          break;
          
        case 'finalizar':
          cuna.estado = 'finalizada';
          break;
          
        case 'extender_vigencia': {
          if (!parsed.data.nuevaFechaFin) {
            return NextResponse.json(
              { success: false, error: 'Se requiere nueva fecha de fin' },
              { status: 400 }
            );
          }
          cuna.fechaFinVigencia = parsed.data.nuevaFechaFin;
          const fechaFin = new Date(parsed.data.nuevaFechaFin);
          cuna.diasRestantes = Math.ceil((fechaFin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (cuna.estado === 'vencida' && cuna.diasRestantes > 0) {
            cuna.estado = 'aprobada';
          }
          break;
        }
          
        case 'incrementar_emision':
          cuna.totalEmisiones += 1;
          break;
          
        default:
          return NextResponse.json(
            { success: false, error: `Acción no válida: ${accion}` },
            { status: 400 }
          );
      }

      mockCunas[cunaIndex] = cuna;

      return NextResponse.json({
        success: true,
        data: cuna,
        message: `Acción "${accion}" ejecutada exitosamente`
      });
      
    } catch (error) {
      logger.error('[API/Cuña] Error PATCH:', error instanceof Error ? error : undefined, { module: '[id]' });
      return NextResponse.json(
        { success: false, error: 'Error al ejecutar acción' },
        { status: 500 }
      );
    }
  }
);

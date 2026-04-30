/**
 * 🔐 API ROUTE: Secure Links Management
 * 
 * Endpoints para crear, validar y gestionar links temporales de entrega.
 * 
 * POST /api/registro-emision/secure-link - Crear nuevo link
 * GET /api/registro-emision/secure-link?uuid=xxx&code=yyy - Validar y obtener contenido
 * DELETE /api/registro-emision/secure-link?uuid=xxx - Revocar link
 * 
 * @tier TIER_0_PREMIUM
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { auditLogger, AuditEventType } from '@/lib/security/audit-logger';
import { db } from '@/lib/db';
import { linksTemporales, estadoLinkTemporalEnum } from '@/lib/db/emision-schema';
import { eq, and } from 'drizzle-orm';

// Types
interface CreateLinkRequest {
  tenantId: string;
  materialNombre: string;
  spxCode?: string;
  clipUrl?: string;
  imageUrl?: string;
  esDigital?: boolean;
  clienteNombre?: string;
  clienteEmail: string;
  campanaNombre?: string;
  creadoPorId?: string;
  creadoPorNombre?: string;
}

interface LinkData {
  id: string;
  linkUuid: string;
  codigoAcceso: string;
  materialNombre: string;
  spxCode?: string;
  clipUrl?: string;
  imageUrl?: string;
  esDigital: boolean;
  clienteNombre?: string;
  clienteEmail: string;
  campanaNombre?: string;
  estado: 'activo' | 'usado' | 'expirado' | 'revocado';
  fechaCreacion: string;
  fechaExpiracion: string;
}

// Mock database (en producción sería Drizzle + PostgreSQL)
// const linksStore = new Map<string, LinkData>();

// Utility: Generate UUID
function generateUUID(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

// Utility: Generate 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Utility: Check expiration
function isExpired(fechaExpiracion: Date): boolean {
  return new Date(fechaExpiracion) < new Date();
}

// ═══════════════════════════════════════════════════════════════
// POST: Crear nuevo link seguro
// Requiere: emisiones:create
// ═══════════════════════════════════════════════════════════════
export const POST = withApiRoute(
  { resource: 'emisiones', action: 'create' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body: CreateLinkRequest = await req.json();

        // Validación básica
        if (!body.clienteEmail || !body.materialNombre) {
          return NextResponse.json(
            { error: 'clienteEmail y materialNombre son requeridos' },
            { status: 400 }
          );
        }

        // Generar identificadores únicos
        const linkUuid = generateUUID();
        const codigoAcceso = generateCode();

        // Expiración en 24 horas
        const now = new Date();
        const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Insertar en base de datos
        const [newLink] = await db.insert(linksTemporales).values({
          id: crypto.randomUUID(),
          tenantId: ctx.tenantId,
          linkUuid,
          codigoAcceso,
          materialNombre: body.materialNombre,
          spxCode: body.spxCode,
          clipUrl: body.clipUrl,
          imageUrl: body.imageUrl,
          esDigital: body.esDigital || false,
          clienteNombre: body.clienteNombre,
          clienteEmail: body.clienteEmail,
          campanaNombre: body.campanaNombre,
          estado: 'activo',
          fechaCreacion: now,
          fechaExpiracion: expiration,
          creadoPorId: ctx.userId,
        }).returning();

        // Construir URL completa
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://silexar.pulse';
        const fullLink = `${baseUrl}/registro/${linkUuid}`;

        return NextResponse.json({
          success: true,
          data: {
            link: fullLink,
            linkUuid,
            codigoAcceso,
            fechaExpiracion: expiration.toISOString(),
            emailDestino: body.clienteEmail,
            creadoPor: ctx.userId
          },
        });
      });
    } catch (error) {
      logger.error('[API/RegistroEmision/SecureLink] Error POST:', error instanceof Error ? error : undefined, {
        module: 'registro-emision/secure-link',
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al crear link seguro',
        metadata: { module: 'registro-emision/secure-link', action: 'POST' }
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// GET: Validar link y obtener contenido
// Requiere: emisiones:read (autenticación requerida)
// ═══════════════════════════════════════════════════════════════
export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const uuid = searchParams.get('uuid');
      const code = searchParams.get('code');

      if (!uuid) {
        return NextResponse.json(
          { error: 'Parámetros inválidos' },
          { status: 400 }
        );
      }

      // Buscar link en la base de datos
      const [link] = await db.select().from(linksTemporales).where(eq(linksTemporales.linkUuid, uuid)).limit(1);

      // Siempre devolver respuesta genérica para evitar filtración de información
      // No revelamos si el link existe, expiró, fue revocado, etc.
      if (!link || isExpired(link.fechaExpiracion) || link.estado === 'revocado') {
        return NextResponse.json(
          { error: 'Link inválido o expirado' },
          { status: 404 }
        );
      }

      // Si se proporciona código, validar y devolver contenido completo
      if (code) {
        if (code !== link.codigoAcceso) {
          return NextResponse.json(
            { error: 'Código de acceso incorrecto' },
            { status: 401 }
          );
        }

        // Marcar como usado en la base de datos
        await db.update(linksTemporales).set({ estado: 'usado' }).where(eq(linksTemporales.id, link.id));

        return NextResponse.json({
          success: true,
          data: {
            materialNombre: link.materialNombre,
            spxCode: link.spxCode,
            clipUrl: link.clipUrl,
            imageUrl: link.imageUrl,
            esDigital: link.esDigital,
            campanaNombre: link.campanaNombre,
            fechaCreacion: link.fechaCreacion.toISOString(),
          },
        });
      }

      // Sin código, devolver error genérico (no revelar que el link existe)
      return NextResponse.json(
        { error: 'Código de acceso requerido' },
        { status: 400 }
      );
    } catch (error) {
      logger.error('[API/RegistroEmision/SecureLink] Error GET:', error instanceof Error ? error : undefined, {
        module: 'registro-emision/secure-link',
        action: 'GET',
        userId: ctx?.userId,
        tenantId: ctx?.tenantId
      });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al validar link seguro',
        metadata: { module: 'registro-emision/secure-link', action: 'GET' }
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// DELETE: Revocar link
// Requiere: emisiones:delete
// ═══════════════════════════════════════════════════════════════
export const DELETE = withApiRoute(
  { resource: 'emisiones', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const uuid = searchParams.get('uuid');

        if (!uuid) {
          return NextResponse.json(
            { error: 'UUID requerido' },
            { status: 400 }
          );
        }

        // Buscar link en la base de datos
        const [link] = await db.select().from(linksTemporales).where(eq(linksTemporales.linkUuid, uuid)).limit(1);

        if (!link) {
          return NextResponse.json(
            { error: 'Link no encontrado' },
            { status: 404 }
          );
        }

        // Actualizar estado a revocado en la base de datos
        await db.update(linksTemporales).set({ estado: 'revocado' }).where(eq(linksTemporales.id, link.id));

        return NextResponse.json({
          success: true,
          message: 'Link revocado exitosamente',
          revocadoPor: ctx.userId
        });
      });
    } catch (error) {
      logger.error('[API/RegistroEmision/SecureLink] Error DELETE:', error instanceof Error ? error : undefined, {
        module: 'registro-emision/secure-link',
        action: 'DELETE',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al revocar link seguro',
        metadata: { module: 'registro-emision/secure-link', action: 'DELETE' }
      });
      return apiServerError();
    }
  }
);

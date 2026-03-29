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
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

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
const linksStore = new Map<string, LinkData>();

// Utility: Generate UUID
function generateUUID(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

// Utility: Generate 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Utility: Check expiration
function isExpired(fechaExpiracion: string): boolean {
  return new Date(fechaExpiracion) < new Date();
}

// ═══════════════════════════════════════════════════════════════
// POST: Crear nuevo link seguro
// ═══════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body: CreateLinkRequest = await request.json();

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

    // Crear registro
    const newLink: LinkData = {
      id: crypto.randomUUID(),
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
      fechaCreacion: now.toISOString(),
      fechaExpiracion: expiration.toISOString(),
    };

    // Guardar (mock)
    linksStore.set(linkUuid, newLink);

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
      },
    });
  } catch (error) {
    logger.error('[API/RegistroEmision/SecureLink] Error POST:', error instanceof Error ? error : undefined, { module: 'registro-emision/secure-link', action: 'POST' });
    return apiServerError()
  }
}

// ═══════════════════════════════════════════════════════════════
// GET: Validar link y obtener contenido
// ═══════════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');
    const code = searchParams.get('code');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID requerido' },
        { status: 400 }
      );
    }

    // Buscar link
    const link = linksStore.get(uuid);

    if (!link) {
      return NextResponse.json(
        { error: 'Link no encontrado' },
        { status: 404 }
      );
    }

    // Verificar expiración
    if (isExpired(link.fechaExpiracion)) {
      link.estado = 'expirado';
      return NextResponse.json(
        { error: 'Link expirado', expiredAt: link.fechaExpiracion },
        { status: 410 }
      );
    }

    // Verificar estado
    if (link.estado === 'revocado') {
      return NextResponse.json(
        { error: 'Link revocado' },
        { status: 403 }
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

      // Marcar como usado y devolver contenido
      link.estado = 'usado';

      return NextResponse.json({
        success: true,
        data: {
          materialNombre: link.materialNombre,
          spxCode: link.spxCode,
          clipUrl: link.clipUrl,
          imageUrl: link.imageUrl,
          esDigital: link.esDigital,
          campanaNombre: link.campanaNombre,
          fechaCreacion: link.fechaCreacion,
        },
      });
    }

    // Sin código, solo confirmar que existe y está activo
    return NextResponse.json({
      success: true,
      requiresCode: true,
      message: 'Link válido. Se requiere código de acceso.',
    });
  } catch (error) {
    logger.error('[API/RegistroEmision/SecureLink] Error GET:', error instanceof Error ? error : undefined, { module: 'registro-emision/secure-link', action: 'GET' });
    return apiServerError()
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE: Revocar link
// ═══════════════════════════════════════════════════════════════
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID requerido' },
        { status: 400 }
      );
    }

    const link = linksStore.get(uuid);

    if (!link) {
      return NextResponse.json(
        { error: 'Link no encontrado' },
        { status: 404 }
      );
    }

    link.estado = 'revocado';

    return NextResponse.json({
      success: true,
      message: 'Link revocado exitosamente',
    });
  } catch (error) {
    logger.error('[API/RegistroEmision/SecureLink] Error DELETE:', error instanceof Error ? error : undefined, { module: 'registro-emision/secure-link', action: 'DELETE' });
    return apiServerError()
  }
}

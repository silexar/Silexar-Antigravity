/**
 * 🏢 SILEXAR PULSE - API Búsqueda de Anunciantes Enterprise TIER 0
 * 
 * Endpoint para búsqueda inteligente de anunciantes con datos enriquecidos
 * Prioriza clientes activos y muestra información operativa
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger, AuditEventType } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';
import { AnuncianteDrizzleRepository } from '@/modules/anunciantes/infrastructure/repositories/AnuncianteDrizzleRepository';
import type { AnuncianteEnriquecido } from '@/modules/anunciantes/domain/repositories/IAnuncianteRepository';

// ═══════════════════════════════════════════════════════════════
// TIPOS LOCALES (para respuesta enriquecida)
// ═══════════════════════════════════════════════════════════════

interface AnuncianteSearchResult extends AnuncianteEnriquecido {
  logo?: string;
  ultimaActividadRelativa: string;
  productosRecientes: string[];
  contactoPrincipal?: {
    nombre: string;
    email: string;
    telefono: string;
  };
  badges?: string[];
  searchRelevance?: number;
}

const repository = new AnuncianteDrizzleRepository();

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `Hace ${diffMins} minutos`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return `Hace ${diffDays} días`;
}

function generateBadges(anunciante: AnuncianteSearchResult): string[] {
  const badges: string[] = [];

  if (anunciante.contratosActivos > 0) {
    badges.push(`✅ ${anunciante.contratosActivos} contratos activos`);
  }

  if (anunciante.cunasActivas > 10) {
    badges.push('🔥 Cliente frecuente');
  }

  if (anunciante.riskLevel === 'bajo') {
    badges.push('💚 Riesgo bajo');
  } else if (anunciante.riskLevel === 'alto') {
    badges.push('⚠️ Riesgo alto');
  }

  const actividadReciente = new Date(anunciante.ultimaActividad);
  const haceHoras = (Date.now() - actividadReciente.getTime()) / (1000 * 60 * 60);

  if (haceHoras < 24) {
    badges.push('🟢 Activo hoy');
  }

  return badges;
}

function calculateRelevance(anunciante: AnuncianteSearchResult, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Match exacto en nombre: máximo puntaje
  if (anunciante.nombre.toLowerCase() === queryLower) {
    score += 100;
  } else if (anunciante.nombre.toLowerCase().startsWith(queryLower)) {
    score += 80;
  } else if (anunciante.nombre.toLowerCase().includes(queryLower)) {
    score += 60;
  }

  // Match en RUT
  if (anunciante.rut.includes(query)) {
    score += 50;
  }

  // Bonus por actividad reciente
  const haceHoras = (Date.now() - new Date(anunciante.ultimaActividad).getTime()) / (1000 * 60 * 60);
  if (haceHoras < 24) {
    score += 20;
  } else if (haceHoras < 72) {
    score += 10;
  }

  // Bonus por cuñas activas
  score += Math.min(anunciante.cunasActivas * 2, 20);

  return score;
}

function mapToSearchResult(item: AnuncianteEnriquecido): AnuncianteSearchResult {
  return {
    ...item,
    logo: undefined,
    ultimaActividadRelativa: formatRelativeTime(item.ultimaActividad),
    productosRecientes: [],
    contactoPrincipal: undefined,
  };
}

// ═══════════════════════════════════════════════════════════════
// GET - Buscar anunciantes con datos enriquecidos (desde BD real)
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'anunciantes', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);

      const query = searchParams.get('q') || searchParams.get('query') || '';
      const includeInactive = searchParams.get('includeInactive') === 'true';
      const orderBy = searchParams.get('orderBy') || 'recent_activity';
      const limit = parseInt(searchParams.get('limit') || '8', 10);
      const industria = searchParams.get('industria') || '';

      // Obtener tenantId del contexto de seguridad
      const tenantId = ctx.tenantId;
      if (!tenantId) {
        auditLogger.log({
          type: AuditEventType.ACCESS_DENIED,
          userId: ctx.userId,
          metadata: {
            module: 'anunciantes',
            accion: 'buscar',
            error: 'No se proporcionó tenantId'
          }
        });
        return apiUnauthorized('Tenant no identificado');
      }

      // Consulta a base de datos real con multi-tenancy
      let results = await repository.findEnriched(tenantId, query || undefined, limit * 2);

      // Filtrar por estado si no se incluyen inactivos
      if (!includeInactive) {
        results = results.filter(a => a.estado === 'activo');
      }

      // Filtrar por industria
      if (industria) {
        const industriaLower = industria.toLowerCase();
        results = results.filter(a =>
          a.industria.toLowerCase().includes(industriaLower)
        );
      }

      // Ordenar
      results.sort((a, b) => {
        switch (orderBy) {
          case 'recent_activity':
            return new Date(b.ultimaActividad).getTime() - new Date(a.ultimaActividad).getTime();
          case 'name':
            return a.nombre.localeCompare(b.nombre);
          case 'cunas_count':
            return b.cunasActivas - a.cunasActivas;
          case 'contracts':
            return b.contratosActivos - a.contratosActivos;
          case 'risk':
            return b.riskScore - a.riskScore;
          default:
            return 0;
        }
      });

      // Limitar resultados
      results = results.slice(0, limit);

      // Enriquecer con datos adicionales para UI
      const enrichedResults: AnuncianteSearchResult[] = results.map(item => {
        const result = mapToSearchResult(item);
        result.badges = generateBadges(result);
        result.searchRelevance = query ? calculateRelevance(result, query) : 1;
        return result;
      });

      // Log de acceso a datos
      auditLogger.log({
        type: AuditEventType.DATA_ACCESS,
        userId: ctx.userId,
        metadata: {
          module: 'anunciantes',
          accion: 'buscar_enriquecido',
          tenantId,
          resultados: enrichedResults.length,
          filtros: { query, includeInactive, orderBy, limit, industria }
        }
      });

      return NextResponse.json({
        success: true,
        data: enrichedResults,
        meta: {
          total: enrichedResults.length,
          query,
          orderBy,
          tenantId
        }
      });

    } catch (error) {
      logger.error('[API/Anunciantes/Search] Error GET:', error instanceof Error ? error : undefined, {
        module: 'anunciantes',
        action: 'buscar_enriquecido',
        tenantId: 'unknown'
      });

      // Audit logging para errores
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId: ctx.userId,
        metadata: {
          module: 'anunciantes',
          accion: 'buscar_enriquecido',
          tenantId: ctx.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return NextResponse.json(
        { success: false, error: 'Error al buscar anunciantes' },
        { status: 500 }
      );
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// POST - Crear nuevo anunciante (Quick Create)
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'anunciantes', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();

      // Validaciones básicas
      if (!body.nombre?.trim()) {
        return NextResponse.json(
          { success: false, error: 'El nombre es requerido' },
          { status: 400 }
        );
      }

      // Validar RUT si se proporciona
      if (body.rut) {
        const rutClean = body.rut.replace(/[.\-]/g, '');
        // Aquí se podría agregar validación de RUT chileno
      }

      // Obtener tenantId
      const tenantId = ctx.tenantId;
      if (!tenantId) {
        auditLogger.log({
          type: AuditEventType.ACCESS_DENIED,
          userId: ctx.userId,
          metadata: {
            module: 'anunciantes',
            accion: 'crear',
            error: 'No se proporcionó tenantId'
          }
        });
        return apiUnauthorized('Tenant no identificado');
      }

      // Generar código secuencial
      const codigo = await repository.generateCode(tenantId);

      // Importar y usar el entity
      const { Anunciante } = await import('@/modules/anunciantes/domain/entities/Anunciante');

      const nuevoAnunciante = Anunciante.create({
        tenantId,
        codigo,
        rut: body.rut || '',
        nombreRazonSocial: body.nombre.trim(),
        giroActividad: body.industria || body.giroActividad || '',
        direccion: body.direccion || '',
        ciudad: body.ciudad || '',
        comunaProvincia: body.comunaProvincia || '',
        pais: body.pais || 'Chile',
        emailContacto: body.email || body.emailContacto || '',
        telefonoContacto: body.telefono || body.telefonoContacto || '',
        paginaWeb: body.paginaWeb || '',
        nombreContactoPrincipal: body.contacto?.nombre || '',
        cargoContactoPrincipal: body.contacto?.cargo || '',
        tieneFacturacionElectronica: body.tieneFacturacionElectronica || false,
        direccionFacturacion: body.direccionFacturacion || '',
        emailFacturacion: body.emailFacturacion || '',
        notas: body.notas || '',
        estado: 'activo',
        activo: true,
        creadoPorId: ctx.userId
      });

      // Guardar en base de datos
      await repository.save(nuevoAnunciante);

      // Mapear a respuesta
      const savedData = nuevoAnunciante.toJSON();
      const responseData: AnuncianteSearchResult = {
        id: savedData.id,
        nombre: savedData.nombreRazonSocial,
        razonSocial: savedData.nombreRazonSocial,
        rut: savedData.rut || '',
        industria: savedData.giroActividad || 'General',
        estado: 'activo' as const,
        contratosActivos: 0,
        cunasActivas: 0,
        ultimaActividad: new Date().toISOString(),
        riskLevel: 'medio' as const,
        riskScore: 500,
        creditScore: 50,
        ultimaActividadRelativa: 'Ahora',
        productosRecientes: [],
        logo: undefined,
        contactoPrincipal: body.contacto ? {
          nombre: body.contacto.nombre || '',
          email: body.contacto.email || '',
          telefono: body.contacto.telefono || ''
        } : undefined
      };

      // Log de creación exitosa
      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        userId: ctx.userId,
        metadata: {
          module: 'anunciantes',
          accion: 'crear',
          tenantId,
          nuevoId: savedData.id,
          nombre: savedData.nombreRazonSocial
        }
      });

      return NextResponse.json({
        success: true,
        data: responseData,
        message: 'Anunciante creado exitosamente'
      }, { status: 201 });

    } catch (error) {
      logger.error('[API/Anunciantes/Search] Error POST:', error instanceof Error ? error : undefined, {
        module: 'anunciantes',
        action: 'crear',
        tenantId: ctx.tenantId
      });

      // Audit logging para errores
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId: ctx.userId,
        metadata: {
          module: 'anunciantes',
          accion: 'crear',
          tenantId: ctx.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return NextResponse.json(
        { success: false, error: 'Error al crear anunciante' },
        { status: 500 }
      );
    }
  }
);

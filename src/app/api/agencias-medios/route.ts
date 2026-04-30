/**
 * 🌐 SILEXAR PULSE - API Routes Agencias de Medios
 * 
 * @description API REST endpoints para el módulo de Agencias de Medios
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';
import { DrizzleAgenciaMediosRepository } from '@/modules/agencias-medios/infrastructure/repositories/DrizzleAgenciaMediosRepository';
import type { CreateAgenciaMediosDTO } from '@/lib/db/agencias-medios-schema';

// Repository instance
const repository = new DrizzleAgenciaMediosRepository();

export const GET = withApiRoute(
  { resource: 'agencias-medios', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const tenantId = ctx.tenantId;
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || '';
      const estado = searchParams.get('estado') || '';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      const filters = { search, estado };
      const pagination = { page, limit };

      const [agencias, total] = await Promise.all([
        repository.findAll(tenantId, filters, pagination),
        repository.count(tenantId, filters)
      ]);

      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      return NextResponse.json({
        success: true,
        data: agencias,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          offset
        }
      });
    } catch (error) {
      logger.error('[API/AgenciasMedios] Error:', error instanceof Error ? error : undefined, { module: 'agencias-medios' });

      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al obtener agencias',
        userId: ctx.userId,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          module: 'agencias-medios',
          resource: 'agencias-medios',
          action: 'read',
          success: false
        }
      });

      return NextResponse.json({ success: false, error: 'Error al obtener agencias' }, { status: 500 });
    }
  }
);

export const POST = withApiRoute(
  { resource: 'agencias-medios', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const tenantId = ctx.tenantId;
      const userId = ctx.userId;
      const body = await req.json();

      if (!body.nombreRazonSocial?.trim()) {
        return NextResponse.json({ success: false, error: 'La razón social es requerida' }, { status: 400 });
      }

      const agenciaData: CreateAgenciaMediosDTO = {
        rut: body.rut,
        nombreRazonSocial: body.nombreRazonSocial,
        nombreComercial: body.nombreComercial,
        tipoAgencia: body.tipoAgencia,
        giroActividad: body.giroActividad,
        direccion: body.direccion,
        ciudad: body.ciudad,
        comunaProvincia: body.comunaProvincia,
        pais: body.pais,
        emailContacto: body.emailContacto,
        telefonoContacto: body.telefonoContacto,
        paginaWeb: body.paginaWeb,
        nombreEjecutivo: body.nombreEjecutivo,
        emailEjecutivo: body.emailEjecutivo,
        telefonoEjecutivo: body.telefonoEjecutivo,
        comisionPorcentaje: body.comisionPorcentaje,
        diasCredito: body.diasCredito,
        tieneFacturacionElectronica: body.tieneFacturacionElectronica,
        emailFacturacion: body.emailFacturacion,
        notas: body.notas
      };

      const newAgencia = await repository.create(agenciaData, tenantId, userId);

      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        message: 'Agencia creada exitosamente',
        userId: ctx.userId,
        metadata: {
          agenciaId: newAgencia.id,
          codigo: newAgencia.codigo,
          module: 'agencias-medios',
          resource: 'agencias-medios',
          action: 'create',
          success: true
        }
      });

      return NextResponse.json({
        success: true,
        data: newAgencia,
        message: 'Agencia creada exitosamente'
      }, { status: 201 });
    } catch (error) {
      logger.error('[API/AgenciasMedios] Error:', error instanceof Error ? error : undefined, { module: 'agencias-medios' });

      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al crear agencia',
        userId: ctx.userId,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          module: 'agencias-medios',
          resource: 'agencias-medios',
          action: 'create',
          success: false
        }
      });

      return NextResponse.json({ success: false, error: 'Error al crear agencia' }, { status: 500 });
    }
  }
);

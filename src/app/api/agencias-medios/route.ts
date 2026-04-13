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
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Mock de datos
const mockAgencias = [
  {
    id: 'agm-001',
    codigo: 'AGM-0001',
    rut: '76.543.210-1',
    nombreRazonSocial: 'OMD Chile',
    nombreComercial: 'OMD',
    tipoAgencia: 'medios',
    ciudad: 'Santiago',
    emailContacto: 'contacto@omd.cl',
    telefonoContacto: '+56 2 2345 6789',
    comisionPorcentaje: 15.00,
    estado: 'activa',
    activa: true,
    fechaCreacion: '2025-01-01T10:00:00Z'
  },
  {
    id: 'agm-002',
    codigo: 'AGM-0002',
    rut: '77.654.321-K',
    nombreRazonSocial: 'Havas Media Chile',
    nombreComercial: 'Havas Media',
    tipoAgencia: 'integral',
    ciudad: 'Santiago',
    emailContacto: 'info@havasmedia.cl',
    telefonoContacto: '+56 2 2987 6543',
    comisionPorcentaje: 12.50,
    estado: 'activa',
    activa: true,
    fechaCreacion: '2025-01-05T11:30:00Z'
  },
  {
    id: 'agm-003',
    codigo: 'AGM-0003',
    rut: '78.765.432-9',
    nombreRazonSocial: 'Mindshare Chile',
    nombreComercial: 'Mindshare',
    tipoAgencia: 'medios',
    ciudad: 'Santiago',
    emailContacto: 'contacto@mindshare.cl',
    telefonoContacto: '+56 2 2456 7890',
    comisionPorcentaje: 14.00,
    estado: 'activa',
    activa: true,
    fechaCreacion: '2024-12-15T09:00:00Z'
  }
];

export const GET = withApiRoute(
  { resource: 'anunciantes', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || '';
      const estado = searchParams.get('estado') || '';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      let filtered = [...mockAgencias];

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(a => 
          a.nombreRazonSocial.toLowerCase().includes(searchLower) ||
          a.codigo.toLowerCase().includes(searchLower) ||
          a.rut?.toLowerCase().includes(searchLower)
        );
      }

      if (estado) {
        filtered = filtered.filter(a => a.estado === estado);
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const data = filtered.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        data,
        pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 }
      });
    } catch (error) {
      logger.error('[API/AgenciasMedios] Error:', error instanceof Error ? error : undefined, { module: 'agencias-medios' });
      return NextResponse.json({ success: false, error: 'Error al obtener agencias' }, { status: 500 });
    }
  }
);

export const POST = withApiRoute(
  { resource: 'anunciantes', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      
      if (!body.nombreRazonSocial?.trim()) {
        return NextResponse.json({ success: false, error: 'La razón social es requerida' }, { status: 400 });
      }

      const newAgencia = {
        id: `agm-${Date.now()}`,
        codigo: `AGM-${(mockAgencias.length + 1).toString().padStart(4, '0')}`,
        ...body,
        estado: 'activa',
        activa: true,
        fechaCreacion: new Date().toISOString()
      };

      mockAgencias.push(newAgencia);

      return NextResponse.json({ success: true, data: newAgencia, message: 'Agencia creada exitosamente' }, { status: 201 });
    } catch (error) {
      logger.error('[API/AgenciasMedios] Error:', error instanceof Error ? error : undefined, { module: 'agencias-medios' });
      return NextResponse.json({ success: false, error: 'Error al crear agencia' }, { status: 500 });
    }
  }
);

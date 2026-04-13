/**
 * 🎨 SILEXAR PULSE - API Routes Agencias Creativas
 * 
 * @description API REST completa para gestión de agencias creativas/publicidad
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockAgencias = [
  { 
    id: 'agc-001', 
    codigo: 'AGC-001', 
    rut: '76.111.222-3',
    razonSocial: 'Creativos Asociados Ltda', 
    nombreFantasia: 'BlueWave Creative', 
    tipoAgencia: 'digital', 
    porcentajeComision: 15, 
    emailGeneral: 'contacto@bluewave.cl', 
    telefonoGeneral: '+56 2 2345 6789', 
    paginaWeb: 'www.bluewave.cl',
    direccion: 'Av. Providencia 1234',
    ciudad: 'Santiago',
    nombreContacto: 'Claudia Vera',
    cargoContacto: 'Directora de Cuentas',
    emailContacto: 'cvera@bluewave.cl',
    estado: 'activa', 
    activa: true,
    campañasActivas: 12,
    facturacionMensual: 45000000,
    scoreRendimiento: 92,
    clientesGestionados: 8,
    fechaCreacion: '2023-03-15',
    tenantId: 'tenant-001'
  },
  { 
    id: 'agc-002', 
    codigo: 'AGC-002', 
    rut: '76.222.333-4',
    razonSocial: 'MediaPlan SpA', 
    nombreFantasia: 'MediaPlan', 
    tipoAgencia: 'medios', 
    porcentajeComision: 12, 
    emailGeneral: 'info@mediaplan.cl', 
    telefonoGeneral: '+56 2 3456 7890', 
    paginaWeb: 'www.mediaplan.cl',
    direccion: 'Las Condes 5678',
    ciudad: 'Santiago',
    nombreContacto: 'Roberto Miranda',
    cargoContacto: 'Gerente General',
    emailContacto: 'rmiranda@mediaplan.cl',
    estado: 'activa', 
    activa: true,
    campañasActivas: 8,
    facturacionMensual: 32000000,
    scoreRendimiento: 78,
    clientesGestionados: 5,
    fechaCreacion: '2022-08-20',
    tenantId: 'tenant-001'
  },
  { 
    id: 'agc-003', 
    codigo: 'AGC-003', 
    rut: '76.333.444-5',
    razonSocial: 'Impacto BTL Ltda', 
    nombreFantasia: 'Impacto', 
    tipoAgencia: 'btl', 
    porcentajeComision: 18, 
    emailGeneral: 'ventas@impacto.cl', 
    telefonoGeneral: '+56 2 4567 8901', 
    paginaWeb: null,
    direccion: 'Vitacura 9012',
    ciudad: 'Santiago',
    nombreContacto: 'Fernanda Lagos',
    cargoContacto: 'Directora Creativa',
    emailContacto: 'flagos@impacto.cl',
    estado: 'activa', 
    activa: true,
    campañasActivas: 5,
    facturacionMensual: 18500000,
    scoreRendimiento: 65,
    clientesGestionados: 3,
    fechaCreacion: '2024-01-10',
    tenantId: 'tenant-001'
  }
];

// ═══════════════════════════════════════════════════════════════
// GET - Listar agencias
// Requiere: anunciantes:read
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'anunciantes', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const tipo = searchParams.get('tipo') || '';
        const estado = searchParams.get('estado') || '';
        const search = searchParams.get('search') || '';

        let filtered = [...mockAgencias];

        if (tipo) {
          filtered = filtered.filter(a => a.tipoAgencia === tipo);
        }

        if (estado === 'activa') {
          filtered = filtered.filter(a => a.activa);
        } else if (estado === 'inactiva') {
          filtered = filtered.filter(a => !a.activa);
        }

        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(a => 
            a.razonSocial.toLowerCase().includes(searchLower) ||
            a.nombreFantasia?.toLowerCase().includes(searchLower) ||
            a.codigo.toLowerCase().includes(searchLower)
          );
        }

        // Calcular stats
        const stats = {
          total: mockAgencias.length,
          activas: mockAgencias.filter(a => a.activa).length,
          facturacionMes: mockAgencias.reduce((sum, a) => sum + a.facturacionMensual, 0),
          comisionPromedio: Math.round(mockAgencias.reduce((sum, a) => sum + a.porcentajeComision, 0) / mockAgencias.length),
          porTipo: {
            digital: mockAgencias.filter(a => a.tipoAgencia === 'digital').length,
            medios: mockAgencias.filter(a => a.tipoAgencia === 'medios').length,
            btl: mockAgencias.filter(a => a.tipoAgencia === 'btl').length,
            publicidad: mockAgencias.filter(a => a.tipoAgencia === 'publicidad').length,
            integral: mockAgencias.filter(a => a.tipoAgencia === 'integral').length
          }
        };

        return NextResponse.json({
          success: true,
          data: filtered,
          stats,
          total: filtered.length,
          consultadoPor: ctx.userId
        });
      });
    } catch (error) {
      logger.error('[API/AgenciasCreativas] Error:', error instanceof Error ? error : undefined, { 
        module: 'agencias-creativas',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// POST - Crear agencia
// Requiere: anunciantes:create
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
  { resource: 'anunciantes', action: 'create' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();

        const { razonSocial, tipoAgencia, porcentajeComision } = body;

        if (!razonSocial) {
          return NextResponse.json({ success: false, error: 'Razón social es requerida' }, { status: 400 });
        }

        const newAgencia = {
          id: `agc-${Date.now()}`,
          codigo: `AGC-${(mockAgencias.length + 1).toString().padStart(3, '0')}`,
          rut: body.rut || null,
          razonSocial,
          nombreFantasia: body.nombreFantasia || null,
          tipoAgencia: tipoAgencia || 'publicidad',
          porcentajeComision: porcentajeComision ?? 15,
          emailGeneral: body.emailGeneral || null,
          telefonoGeneral: body.telefonoGeneral || null,
          paginaWeb: body.paginaWeb || null,
          direccion: body.direccion || null,
          ciudad: body.ciudad || 'Santiago',
          nombreContacto: body.nombreContacto || null,
          cargoContacto: body.cargoContacto || null,
          emailContacto: body.emailContacto || null,
          estado: 'activa',
          activa: true,
          campañasActivas: 0,
          facturacionMensual: 0,
          scoreRendimiento: 50,
          clientesGestionados: 0,
          fechaCreacion: new Date().toISOString().split('T')[0],
          tenantId: ctx.tenantId,
          creadoPor: ctx.userId
        };

        mockAgencias.push(newAgencia);

        return NextResponse.json({ 
          success: true, 
          data: newAgencia,
          message: 'Agencia creada exitosamente' 
        }, { status: 201 });
      });
    } catch (error) {
      logger.error('[API/AgenciasCreativas] Error:', error instanceof Error ? error : undefined, { 
        module: 'agencias-creativas',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// PUT - Actualizar agencia
// Requiere: anunciantes:update
// ═══════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
  { resource: 'anunciantes', action: 'update' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();

        if (!body.id) {
          return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
        }

        const index = mockAgencias.findIndex(a => a.id === body.id);
        if (index === -1) {
          return NextResponse.json({ success: false, error: 'Agencia no encontrada' }, { status: 404 });
        }

        // Actualizar campos
        const agencia = mockAgencias[index];
        if (body.razonSocial) agencia.razonSocial = body.razonSocial;
        if (body.nombreFantasia !== undefined) agencia.nombreFantasia = body.nombreFantasia;
        if (body.tipoAgencia) agencia.tipoAgencia = body.tipoAgencia;
        if (body.porcentajeComision !== undefined) agencia.porcentajeComision = body.porcentajeComision;
        if (body.emailGeneral !== undefined) agencia.emailGeneral = body.emailGeneral;
        if (body.telefonoGeneral !== undefined) agencia.telefonoGeneral = body.telefonoGeneral;
        if (body.paginaWeb !== undefined) agencia.paginaWeb = body.paginaWeb;
        if (body.nombreContacto !== undefined) agencia.nombreContacto = body.nombreContacto;
        if (body.emailContacto !== undefined) agencia.emailContacto = body.emailContacto;
        if (typeof body.activa === 'boolean') {
          agencia.activa = body.activa;
          agencia.estado = body.activa ? 'activa' : 'inactiva';
        }

        return NextResponse.json({ 
          success: true, 
          data: agencia,
          message: 'Agencia actualizada',
          actualizadoPor: ctx.userId
        });
      });
    } catch (error) {
      logger.error('[API/AgenciasCreativas] Error:', error instanceof Error ? error : undefined, { 
        module: 'agencias-creativas',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// DELETE - Eliminar agencia
// Requiere: anunciantes:delete
// ═══════════════════════════════════════════════════════════════

export const DELETE = withApiRoute(
  { resource: 'anunciantes', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
          return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
        }

        const index = mockAgencias.findIndex(a => a.id === id);
        if (index === -1) {
          return NextResponse.json({ success: false, error: 'Agencia no encontrada' }, { status: 404 });
        }

        mockAgencias.splice(index, 1);

        return NextResponse.json({ 
          success: true, 
          message: 'Agencia eliminada',
          eliminadoPor: ctx.userId
        });
      });
    } catch (error) {
      logger.error('[API/AgenciasCreativas] Error:', error instanceof Error ? error : undefined, { 
        module: 'agencias-creativas',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

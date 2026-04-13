/**
 * 🌐 SILEXAR PULSE - API Routes Facturación
 * 
 * @description API REST endpoints para el módulo de Facturación
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, apiServerError, getUserContext, apiForbidden} from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Mock de datos
const mockFacturas = [
  {
    id: 'fac-001',
    numeroFactura: 1001,
    folio: 1001,
    tipoDocumento: 'factura_electronica',
    codigoSii: 33,
    clienteNombre: 'Banco de Chile S.A.',
    clienteRut: '97.004.000-5',
    fechaEmision: '2025-02-01',
    fechaVencimiento: '2025-03-03',
    montoNeto: 5000000,
    montoIva: 950000,
    montoTotal: 5950000,
    estado: 'pagada',
    saldoPendiente: 0,
    diasVencida: 0
  },
  {
    id: 'fac-002',
    numeroFactura: 1002,
    folio: 1002,
    tipoDocumento: 'factura_electronica',
    codigoSii: 33,
    clienteNombre: 'Falabella Retail S.A.',
    clienteRut: '77.261.280-0',
    fechaEmision: '2025-02-05',
    fechaVencimiento: '2025-03-07',
    montoNeto: 8500000,
    montoIva: 1615000,
    montoTotal: 10115000,
    estado: 'emitida',
    saldoPendiente: 10115000,
    diasVencida: 0
  },
  {
    id: 'fac-003',
    numeroFactura: 1003,
    folio: 1003,
    tipoDocumento: 'factura_electronica',
    codigoSii: 33,
    clienteNombre: 'Coca-Cola Chile',
    clienteRut: '96.753.000-1',
    fechaEmision: '2025-01-15',
    fechaVencimiento: '2025-02-14',
    montoNeto: 12000000,
    montoIva: 2280000,
    montoTotal: 14280000,
    estado: 'vencida',
    saldoPendiente: 14280000,
    diasVencida: 2
  },
  {
    id: 'fac-004',
    numeroFactura: 1004,
    folio: null,
    tipoDocumento: 'factura_electronica',
    codigoSii: 33,
    clienteNombre: 'LATAM Airlines',
    clienteRut: '89.862.200-2',
    fechaEmision: '2025-02-10',
    fechaVencimiento: '2025-03-12',
    montoNeto: 3500000,
    montoIva: 665000,
    montoTotal: 4165000,
    estado: 'borrador',
    saldoPendiente: 4165000,
    diasVencida: 0
  },
  {
    id: 'fac-005',
    numeroFactura: 1005,
    folio: 1004,
    tipoDocumento: 'nota_credito',
    codigoSii: 61,
    clienteNombre: 'Banco de Chile S.A.',
    clienteRut: '97.004.000-5',
    fechaEmision: '2025-02-08',
    fechaVencimiento: null,
    montoNeto: -500000,
    montoIva: -95000,
    montoTotal: -595000,
    estado: 'emitida',
    saldoPendiente: 0,
    diasVencida: 0
  }
];

export const GET = withApiRoute(
  { resource: 'facturacion', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || '';
      const estado = searchParams.get('estado') || '';
      const tipoDocumento = searchParams.get('tipo') || '';

      let filtered = [...mockFacturas];

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(f => 
          f.clienteNombre.toLowerCase().includes(searchLower) ||
          f.numeroFactura.toString().includes(search) ||
          f.clienteRut.includes(search)
        );
      }

      if (estado) {
        filtered = filtered.filter(f => f.estado === estado);
      }

      if (tipoDocumento) {
        filtered = filtered.filter(f => f.tipoDocumento === tipoDocumento);
      }

      // Ordenar por fecha emisión descendente
      filtered.sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime());

      // Estadísticas
      const facturasActivas = mockFacturas.filter(f => f.tipoDocumento === 'factura_electronica' && f.montoTotal > 0);
      const stats = {
        totalFacturas: facturasActivas.length,
        montoEmitido: facturasActivas.reduce((sum, f) => sum + f.montoTotal, 0),
        montoPendiente: facturasActivas.filter(f => f.estado !== 'pagada').reduce((sum, f) => sum + (f.saldoPendiente || 0), 0),
        vencidas: facturasActivas.filter(f => f.estado === 'vencida').length,
        notasCredito: mockFacturas.filter(f => f.tipoDocumento === 'nota_credito').length
      };

      auditLogger.log({ type: AuditEventType.DATA_READ, userId: ctx.userId, metadata: { module: 'facturacion' } });

      return apiSuccess(filtered, 200, {
        stats,
        pagination: {
          total: filtered.length,
          page: 1,
          pageSize: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    } catch (error) {
      logger.error('[API/Facturacion] Error:', error instanceof Error ? error : undefined, { module: 'facturacion' });
      return apiServerError();
    }
  }
);

export const POST = withApiRoute(
  { resource: 'facturacion', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();

      if (!body.receptorRut?.trim()) {
        return apiError('VALIDATION_ERROR', 'El RUT del receptor es requerido', 400);
      }

      if (!body.montoNeto || body.montoNeto <= 0) {
        return apiError('VALIDATION_ERROR', 'El monto neto debe ser mayor a 0', 400);
      }

      const montoIva = body.montoNeto * 0.19;
      const montoTotal = body.montoNeto + montoIva;

      const newFactura = {
        id: `fac-${Date.now()}`,
        numeroFactura: Math.max(...mockFacturas.map(f => f.numeroFactura)) + 1,
        folio: null,
        tipoDocumento: body.tipoDocumento || 'factura_electronica',
        codigoSii: 33,
        clienteNombre: body.receptorRazonSocial || 'Cliente',
        clienteRut: body.receptorRut,
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        montoNeto: body.montoNeto,
        montoIva: Math.round(montoIva),
        montoTotal: Math.round(montoTotal),
        estado: 'borrador',
        saldoPendiente: Math.round(montoTotal),
        diasVencida: 0
      };

      mockFacturas.push(newFactura);

      auditLogger.log({ type: AuditEventType.DATA_CREATE, userId: ctx.userId, metadata: { module: 'facturacion', resourceId: newFactura.id } });

      return apiSuccess(newFactura, 201, { message: 'Factura creada exitosamente' });
    } catch (error) {
      logger.error('[API/Facturacion] Error:', error instanceof Error ? error : undefined, { module: 'facturacion' });
      return apiServerError();
    }
  }
);

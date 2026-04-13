/**
 * 💡 SILEXAR PULSE - API Cotizador TIER 0
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// Tarifas
const productos = [
  { id: 'spot-30', nombre: 'Spot 30 segundos', precioBase: 45000, temporadaAlta: 67500, temporadaBaja: 36000 },
  { id: 'spot-15', nombre: 'Spot 15 segundos', precioBase: 28000, temporadaAlta: 42000, temporadaBaja: 22400 },
  { id: 'mencion', nombre: 'Mención en vivo', precioBase: 35000, temporadaAlta: 52500, temporadaBaja: 28000 },
  { id: 'patrocinio', nombre: 'Patrocinio programa', precioBase: 500000, temporadaAlta: 750000, temporadaBaja: 400000 }
];

const horarios = [
  { id: 'prime', nombre: 'Prime (18-21h)', factor: 1.5 },
  { id: 'rotativo', nombre: 'Rotativo', factor: 1.0 },
  { id: 'madrugada', nombre: 'Madrugada', factor: 0.5 }
];

const clientes: Record<string, { nombre: string; descuentos: { tipo: string; pct: number }[] }> = {
  'cli-001': { nombre: 'Empresa ABC Ltda', descuentos: [{ tipo: 'Antigüedad', pct: 10 }] },
  'cli-002': { nombre: 'Servicios XYZ SpA', descuentos: [] },
  'cli-003': { nombre: 'Comercial DEF', descuentos: [{ tipo: 'Volumen', pct: 5 }] }
};

/**
 * GET - Listar productos y horarios
 * Requiere: contratos:read
 */
export const GET = withApiRoute(
  { resource: 'contratos', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        return NextResponse.json({
          success: true,
          data: { 
            productos, 
            horarios, 
            clientes: Object.entries(clientes).map(([id, c]) => ({ id, ...c })) 
          },
          consultadoPor: ctx.userId
        });
      });
    } catch (error) {
      logger.error('[API/Cotizador] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'cotizador', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST - Generar cotización
 * Requiere: contratos:create
 */
export const POST = withApiRoute(
  { resource: 'contratos', action: 'create' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();
        const { clienteId, lineas, diasValidez = 15 } = body;

        if (!clienteId || !lineas?.length) {
          return NextResponse.json({ success: false, error: 'Cliente y líneas requeridos' }, { status: 400 });
        }

        const cliente = clientes[clienteId];
        if (!cliente) {
          return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });
        }

        // Calcular
        let subtotal = 0;
        const lineasCalculadas = lineas.map((linea: { productoId: string; cantidad: number; horario: string }) => {
          const prod = productos.find(p => p.id === linea.productoId);
          const hor = horarios.find(h => h.id === linea.horario);
          
          if (!prod) return null;
          
          const precioUnitario = Math.round(prod.precioBase * (hor?.factor || 1));
          const lineaSubtotal = precioUnitario * linea.cantidad;
          subtotal += lineaSubtotal;
          
          return {
            productoId: linea.productoId,
            productoNombre: prod.nombre,
            cantidad: linea.cantidad,
            horario: linea.horario,
            precioUnitario,
            subtotal: lineaSubtotal
          };
        }).filter(Boolean);

        // Descuentos
        const descuentos = cliente.descuentos.map(d => ({
          tipo: d.tipo,
          porcentaje: d.pct,
          monto: Math.round(subtotal * (d.pct / 100))
        }));

        // Descuento volumen
        if (subtotal >= 20000000) {
          const pct = subtotal >= 100000000 ? 15 : subtotal >= 50000000 ? 10 : 5;
          descuentos.push({ tipo: 'Volumen', porcentaje: pct, monto: Math.round(subtotal * (pct / 100)) });
        }

        const totalDescuentos = descuentos.reduce((sum, d) => sum + d.monto, 0);
        const neto = subtotal - totalDescuentos;
        const iva = Math.round(neto * 0.19);
        const total = neto + iva;

        // IA
        let probabilidad = 50;
        if (cliente.descuentos.length) probabilidad += 15;
        if (lineas.length >= 2) probabilidad += 10;
        if (total < 30000000) probabilidad += 10;

        const recomendaciones = [];
        if (lineas.length === 1) recomendaciones.push('💡 Agregar más productos activa descuento por volumen');
        if (!descuentos.length) recomendaciones.push('🎯 Ofrecer pago anticipado para 3% adicional');
        recomendaciones.push('⏰ Enviar antes de las 11 AM tiene 23% más conversión');

        const fechaEmision = new Date();
        const fechaValidez = new Date();
        fechaValidez.setDate(fechaValidez.getDate() + diasValidez);

        return NextResponse.json({
          success: true,
          data: {
            id: `cot-${Date.now()}`,
            numero: Math.floor(Math.random() * 10000) + 1000,
            clienteId,
            clienteNombre: cliente.nombre,
            fechaEmision: fechaEmision.toISOString(),
            fechaValidez: fechaValidez.toISOString(),
            lineas: lineasCalculadas,
            subtotal,
            descuentos,
            totalDescuentos,
            neto,
            iva,
            total,
            probabilidadAceptacion: Math.min(85, probabilidad),
            recomendaciones,
            estado: 'borrador',
            creadoPor: ctx.userId
          }
        });
      });
    } catch (error) {
      logger.error('[API/Cotizador] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'cotizador', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

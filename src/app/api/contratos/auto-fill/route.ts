/**
 * ⚡ SILEXAR PULSE - Auto-fill Contratos API TIER 0
 * 
 * @description API para clonar contratos anteriores y generar
 * pre-llenado inteligente desde plantillas de producto.
 * Endpoints:
 *   GET ?clienteId=X     → líneas del último contrato del cliente
 *   GET ?plantillaId=X   → plantilla de producto
 *   GET ?contratos=true  → lista de contratos clonables
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface LineaClonable {
  medioId: string;
  medioNombre: string;
  categoria: 'Radio' | 'Televisión' | 'Digital' | 'Prensa';
  producto: string;
  cantidad: number;
  tarifaUnitaria: number;
  horarioInicio?: string;
  horarioFin?: string;
  descuento: number;
}

interface ContratoAnterior {
  id: string;
  numero: string;
  cliente: string;
  clienteId: string;
  fecha: string;
  valor: number;
  lineas: LineaClonable[];
  terminosPago: number;
  modalidadFacturacion: string;
}

interface Plantilla {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  lineas: LineaClonable[];
  descuentoSugerido: number;
  terminosPago: number;
}

// ═══════════════════════════════════════════════════════════════
// BASE DE DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const CONTRATOS_ANTERIORES: ContratoAnterior[] = [
  {
    id: 'ctr-prev-001', numero: 'SP-2024-0142', cliente: 'Banco Chile', clienteId: 'cli-001',
    fecha: '2024-09-01', valor: 85000000,
    lineas: [
      { medioId: 'med-001', medioNombre: 'Radio Corazón', categoria: 'Radio', producto: 'Radio FM', cantidad: 30, tarifaUnitaria: 675000, horarioInicio: '06:00', horarioFin: '10:00', descuento: 15 },
      { medioId: 'med-002', medioNombre: 'FM Dos', categoria: 'Radio', producto: 'Radio FM', cantidad: 20, tarifaUnitaria: 266000, horarioInicio: '19:00', horarioFin: '00:00', descuento: 15 },
      { medioId: 'med-005', medioNombre: 'Canal 13', categoria: 'Televisión', producto: 'TV Abierta', cantidad: 5, tarifaUnitaria: 5000000, horarioInicio: '20:00', horarioFin: '00:00', descuento: 15 },
    ],
    terminosPago: 45, modalidadFacturacion: 'mensual',
  },
  {
    id: 'ctr-prev-002', numero: 'SP-2024-0189', cliente: 'Falabella', clienteId: 'cli-002',
    fecha: '2024-10-01', valor: 120000000,
    lineas: [
      { medioId: 'med-005', medioNombre: 'Canal 13', categoria: 'Televisión', producto: 'TV Abierta', cantidad: 10, tarifaUnitaria: 5000000, horarioInicio: '20:00', horarioFin: '00:00', descuento: 18 },
      { medioId: 'med-008', medioNombre: 'Google Ads', categoria: 'Digital', producto: 'Digital SEM', cantidad: 1, tarifaUnitaria: 15000000, descuento: 18 },
      { medioId: 'med-009', medioNombre: 'Meta Ads', categoria: 'Digital', producto: 'Digital Social', cantidad: 1, tarifaUnitaria: 12000000, descuento: 18 },
    ],
    terminosPago: 45, modalidadFacturacion: 'mensual',
  },
  {
    id: 'ctr-prev-003', numero: 'SP-2024-0201', cliente: 'Cencosud', clienteId: 'cli-003',
    fecha: '2024-11-01', valor: 45000000,
    lineas: [
      { medioId: 'med-001', medioNombre: 'Radio Corazón', categoria: 'Radio', producto: 'Radio FM', cantidad: 25, tarifaUnitaria: 540000, horarioInicio: '10:00', horarioFin: '14:00', descuento: 10 },
      { medioId: 'med-003', medioNombre: 'Radio Futuro', categoria: 'Radio', producto: 'Radio FM', cantidad: 15, tarifaUnitaria: 455000, horarioInicio: '06:00', horarioFin: '10:00', descuento: 10 },
    ],
    terminosPago: 30, modalidadFacturacion: 'quincenal',
  },
  {
    id: 'ctr-prev-007', numero: 'SP-2024-0088', cliente: 'LATAM', clienteId: 'cli-007',
    fecha: '2024-08-01', valor: 200000000,
    lineas: [
      { medioId: 'med-005', medioNombre: 'Canal 13', categoria: 'Televisión', producto: 'TV Abierta', cantidad: 15, tarifaUnitaria: 5000000, horarioInicio: '20:00', horarioFin: '00:00', descuento: 20 },
      { medioId: 'med-001', medioNombre: 'Radio Corazón', categoria: 'Radio', producto: 'Radio FM', cantidad: 40, tarifaUnitaria: 675000, horarioInicio: '06:00', horarioFin: '10:00', descuento: 20 },
      { medioId: 'med-004', medioNombre: 'ADN Radio', categoria: 'Radio', producto: 'Radio FM', cantidad: 30, tarifaUnitaria: 676000, horarioInicio: '10:00', horarioFin: '14:00', descuento: 20 },
      { medioId: 'med-008', medioNombre: 'Google Ads', categoria: 'Digital', producto: 'Digital SEM', cantidad: 1, tarifaUnitaria: 20000000, descuento: 20 },
      { medioId: 'med-010', medioNombre: 'El Mercurio', categoria: 'Prensa', producto: 'Prensa Escrita', cantidad: 4, tarifaUnitaria: 800000, descuento: 20 },
    ],
    terminosPago: 45, modalidadFacturacion: 'por_cuotas',
  },
];

const PLANTILLAS: Plantilla[] = [
  {
    id: 'tpl-001', nombre: 'Campaña Radio Estándar', descripcion: '3 emisoras, horario prime, 2 meses',
    categoria: 'Radio',
    lineas: [
      { medioId: 'med-001', medioNombre: 'Radio Corazón', categoria: 'Radio', producto: 'Radio FM', cantidad: 20, tarifaUnitaria: 675000, horarioInicio: '06:00', horarioFin: '10:00', descuento: 0 },
      { medioId: 'med-002', medioNombre: 'FM Dos', categoria: 'Radio', producto: 'Radio FM', cantidad: 15, tarifaUnitaria: 532000, horarioInicio: '06:00', horarioFin: '10:00', descuento: 0 },
      { medioId: 'med-004', medioNombre: 'ADN Radio', categoria: 'Radio', producto: 'Radio FM', cantidad: 10, tarifaUnitaria: 832000, horarioInicio: '06:00', horarioFin: '10:00', descuento: 0 },
    ],
    descuentoSugerido: 12, terminosPago: 30,
  },
  {
    id: 'tpl-002', nombre: 'Multimedia Premium', descripcion: 'TV + Radio + Digital, cobertura completa',
    categoria: 'Multimedia',
    lineas: [
      { medioId: 'med-005', medioNombre: 'Canal 13', categoria: 'Televisión', producto: 'TV Abierta', cantidad: 8, tarifaUnitaria: 5000000, horarioInicio: '20:00', horarioFin: '00:00', descuento: 0 },
      { medioId: 'med-001', medioNombre: 'Radio Corazón', categoria: 'Radio', producto: 'Radio FM', cantidad: 25, tarifaUnitaria: 675000, horarioInicio: '06:00', horarioFin: '10:00', descuento: 0 },
      { medioId: 'med-008', medioNombre: 'Google Ads', categoria: 'Digital', producto: 'Digital SEM', cantidad: 1, tarifaUnitaria: 10000000, descuento: 0 },
      { medioId: 'med-009', medioNombre: 'Meta Ads', categoria: 'Digital', producto: 'Digital Social', cantidad: 1, tarifaUnitaria: 8000000, descuento: 0 },
    ],
    descuentoSugerido: 15, terminosPago: 45,
  },
  {
    id: 'tpl-003', nombre: 'Digital Performance', descripcion: 'SEM + Social Ads, enfoque conversión',
    categoria: 'Digital',
    lineas: [
      { medioId: 'med-008', medioNombre: 'Google Ads', categoria: 'Digital', producto: 'Digital SEM', cantidad: 1, tarifaUnitaria: 15000000, descuento: 0 },
      { medioId: 'med-009', medioNombre: 'Meta Ads', categoria: 'Digital', producto: 'Digital Social', cantidad: 1, tarifaUnitaria: 12000000, descuento: 0 },
    ],
    descuentoSugerido: 10, terminosPago: 30,
  },
];

// ═══════════════════════════════════════════════════════════════
// GET: Obtener datos de auto-fill
// Requiere: contratos:read
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
  { resource: 'contratos', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const clienteId = searchParams.get('clienteId');
        const plantillaId = searchParams.get('plantillaId');
        const listarContratos = searchParams.get('contratos');
        const listarPlantillas = searchParams.get('plantillas');

        // Listar contratos clonables
        if (listarContratos) {
          return NextResponse.json({
            success: true,
            data: CONTRATOS_ANTERIORES.map(c => ({
              id: c.id, numero: c.numero, cliente: c.cliente,
              fecha: c.fecha, valor: c.valor,
              lineasCount: c.lineas.length,
            })),
            consultadoPor: ctx.userId
          });
        }

        // Listar plantillas
        if (listarPlantillas) {
          return NextResponse.json({
            success: true,
            data: PLANTILLAS.map(p => ({
              id: p.id, nombre: p.nombre, descripcion: p.descripcion,
              categoria: p.categoria, lineasCount: p.lineas.length,
              descuentoSugerido: p.descuentoSugerido,
            })),
            consultadoPor: ctx.userId
          });
        }

        // Auto-fill desde contrato anterior del cliente
        if (clienteId) {
          const contrato = CONTRATOS_ANTERIORES.find(c => c.clienteId === clienteId);
          if (!contrato) {
            return NextResponse.json({
              success: false,
              error: 'No se encontró contrato anterior para este cliente',
            }, { status: 404 });
          }

          return NextResponse.json({
            success: true,
            fuente: 'contrato_anterior',
            contratoRef: { id: contrato.id, numero: contrato.numero, fecha: contrato.fecha },
            lineas: contrato.lineas,
            terminosPago: contrato.terminosPago,
            modalidadFacturacion: contrato.modalidadFacturacion,
            descuento: contrato.lineas[0]?.descuento || 0,
            consultadoPor: ctx.userId
          });
        }

        // Auto-fill desde plantilla
        if (plantillaId) {
          const plantilla = PLANTILLAS.find(p => p.id === plantillaId);
          if (!plantilla) {
            return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
          }

          return NextResponse.json({
            success: true,
            fuente: 'plantilla',
            plantillaRef: { id: plantilla.id, nombre: plantilla.nombre },
            lineas: plantilla.lineas,
            terminosPago: plantilla.terminosPago,
            descuentoSugerido: plantilla.descuentoSugerido,
            consultadoPor: ctx.userId
          });
        }

        return NextResponse.json({ success: false, error: 'Parámetro requerido: clienteId, plantillaId, contratos o plantillas' }, { status: 400 });
      });
    } catch (error) {
      logger.error('[API/Contratos/AutoFill] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'contratos/auto-fill', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

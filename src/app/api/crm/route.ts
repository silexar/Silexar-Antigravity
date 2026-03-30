/**
 * 🤝 SILEXAR PULSE - API CRM
 * 
 * @version 2025.1.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// Mock leads
const leads = [
  { id: 'lead-001', nombre: 'Roberto Sánchez', empresa: 'Nueva Corp', email: 'rsanchez@nueva.cl', telefono: '+56 9 1234 5678', scoreIA: 85, etapa: 'nuevo', origen: 'web', presupuestoEstimado: 25000000, proximaAccion: 'Llamar para calificar', fechaCreacion: new Date() },
  { id: 'lead-002', nombre: 'Ana Fernández', empresa: 'Digital SpA', email: 'afernandez@digital.cl', telefono: '+56 9 2345 6789', scoreIA: 72, etapa: 'contactado', origen: 'referido', presupuestoEstimado: 15000000, proximaAccion: 'Enviar propuesta', fechaCreacion: new Date() },
  { id: 'lead-003', nombre: 'Pedro López', empresa: 'Media Group', email: 'plopez@media.cl', telefono: '+56 9 3456 7890', scoreIA: 45, etapa: 'nuevo', origen: 'evento', presupuestoEstimado: 8000000, proximaAccion: 'Primer contacto', fechaCreacion: new Date() }
];

// Mock oportunidades
const oportunidades = [
  { id: 'op-001', nombre: 'Campaña Navidad ABC', leadId: 'lead-001', valor: 24000000, probabilidad: 75, etapa: 'propuesta', vendedor: 'Carlos M.', fechaCierreEstimada: '2025-12-28' },
  { id: 'op-002', nombre: 'Contrato Anual XYZ', leadId: 'lead-002', valor: 12000000, probabilidad: 60, etapa: 'calificado', vendedor: 'María L.', fechaCierreEstimada: '2026-01-15' },
  { id: 'op-003', nombre: 'Patrocinio Tech', leadId: 'lead-001', valor: 35000000, probabilidad: 45, etapa: 'negociacion', vendedor: 'Carlos M.', fechaCierreEstimada: '2025-12-22' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'leads'; // leads | oportunidades | pipeline
    const etapa = searchParams.get('etapa');
    
    if (tipo === 'leads') {
      let resultado = leads;
      if (etapa) resultado = resultado.filter(l => l.etapa === etapa);
      
      return NextResponse.json({
        success: true,
        data: {
          leads: resultado,
          stats: {
            total: resultado.length,
            nuevos: resultado.filter(l => l.etapa === 'nuevo').length,
            contactados: resultado.filter(l => l.etapa === 'contactado').length,
            scorePromedio: Math.round(resultado.reduce((sum, l) => sum + l.scoreIA, 0) / resultado.length)
          }
        }
      });
    }
    
    if (tipo === 'oportunidades') {
      let resultado = oportunidades;
      if (etapa) resultado = resultado.filter(o => o.etapa === etapa);
      
      const valorTotal = resultado.reduce((sum, o) => sum + o.valor, 0);
      const valorPonderado = resultado.reduce((sum, o) => sum + (o.valor * o.probabilidad / 100), 0);
      
      return NextResponse.json({
        success: true,
        data: {
          oportunidades: resultado,
          stats: {
            total: resultado.length,
            valorTotal,
            valorPonderado
          }
        }
      });
    }
    
    if (tipo === 'pipeline') {
      const etapas = ['nuevo', 'contactado', 'calificado', 'propuesta', 'negociacion'];
      const pipeline = etapas.map(e => {
        const ops = oportunidades.filter(o => o.etapa === e);
        return {
          etapa: e,
          cantidad: ops.length,
          valor: ops.reduce((sum, o) => sum + o.valor, 0)
        };
      });
      
      return NextResponse.json({
        success: true,
        data: { pipeline }
      });
    }
    
    return NextResponse.json({ success: false, error: 'Tipo no válido' }, { status: 400 });
    
  } catch (error) {
    logger.error('[API/CRM] Error GET:', error instanceof Error ? error : undefined, { module: 'crm', action: 'GET' });
    return apiServerError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accion } = body;
    
    if (accion === 'crear_lead') {
      const nuevoLead = {
        id: `lead-${Date.now()}`,
        ...body.data,
        scoreIA: calcularScore(body.data),
        etapa: 'nuevo',
        fechaCreacion: new Date()
      };
      
      return NextResponse.json({
        success: true,
        data: nuevoLead,
        mensaje: 'Lead creado exitosamente'
      });
    }
    
    if (accion === 'actualizar_etapa') {
      const { leadId, nuevaEtapa } = body;
      return NextResponse.json({
        success: true,
        mensaje: `Lead ${leadId} movido a ${nuevaEtapa}`
      });
    }
    
    if (accion === 'convertir_a_oportunidad') {
      const { leadId, valor, fechaCierre } = body;
      const nuevaOportunidad = {
        id: `op-${Date.now()}`,
        leadId,
        valor,
        fechaCierreEstimada: fechaCierre,
        probabilidad: 50,
        etapa: 'calificado'
      };
      
      return NextResponse.json({
        success: true,
        data: nuevaOportunidad,
        mensaje: 'Oportunidad creada desde lead'
      });
    }
    
    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
    
  } catch (error) {
    logger.error('[API/CRM] Error POST:', error instanceof Error ? error : undefined, { module: 'crm', action: 'POST' });
    return apiServerError()
  }
}

function calcularScore(lead: { presupuestoEstimado?: number; origen?: string; cargo?: string }): number {
  let score = 50;
  
  if (lead.presupuestoEstimado) {
    if (lead.presupuestoEstimado >= 50000000) score += 25;
    else if (lead.presupuestoEstimado >= 20000000) score += 15;
    else if (lead.presupuestoEstimado >= 10000000) score += 10;
  }
  
  if (lead.origen === 'referido') score += 15;
  else if (lead.origen === 'evento') score += 10;
  
  if (lead.cargo?.toLowerCase().includes('gerente')) score += 10;
  
  return Math.min(100, score);
}

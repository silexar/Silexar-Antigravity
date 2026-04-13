/**
 * 📊 SILEXAR PULSE - API Validación de Inventario TIER 0
 * 
 * @description Endpoint para validación en tiempo real de
 * disponibilidad de inventario publicitario.
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

interface LineaEspecificacion {
  id: string;
  medioId: string;
  medioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  cantidad: number;
}

interface ValidacionInventario {
  medioId: string;
  medioNombre: string;
  estado: 'disponible' | 'limitado' | 'saturado' | 'no_disponible';
  disponibilidadPorcentaje: number;
  conflictos?: {
    tipo: 'exclusividad' | 'saturacion' | 'bloqueo';
    descripcion: string;
    anuncianteBloqueante?: string;
  }[];
  horariosSugeridos?: {
    inicio: string;
    fin: string;
    disponibilidad: number;
  }[];
  alternativas?: {
    medioId: string;
    medioNombre: string;
    disponibilidad: number;
  }[];
}

// Simulación de inventario
const inventarioSimulado: Record<string, {
  disponibilidad: number;
  conflictos: string[];
  alternativas: string[];
}> = {
  'med-001': { disponibilidad: 85, conflictos: [], alternativas: ['med-002'] },
  'med-002': { disponibilidad: 60, conflictos: ['Saturación horario prime'], alternativas: ['med-001'] },
  'med-003': { disponibilidad: 15, conflictos: ['Exclusividad Banco XYZ hasta marzo'], alternativas: ['med-004'] },
  'med-004': { disponibilidad: 72, conflictos: [], alternativas: ['med-003'] },
  'med-005': { disponibilidad: 95, conflictos: [], alternativas: [] },
  'med-006': { disponibilidad: 40, conflictos: ['Edición limitada disponible'], alternativas: [] }
};

function determinarEstado(disponibilidad: number): ValidacionInventario['estado'] {
  if (disponibilidad >= 70) return 'disponible';
  if (disponibilidad >= 40) return 'limitado';
  if (disponibilidad >= 10) return 'saturado';
  return 'no_disponible';
}

/**
 * POST - Validar inventario
 * Requiere: contratos:read
 */
export const POST = withApiRoute(
  { resource: 'contratos', action: 'read' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json();
        const lineas: LineaEspecificacion[] = body.lineas || [];
        
        if (lineas.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No hay líneas para validar' },
            { status: 400 }
          );
        }
        
        // Simular delay de validación
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const validaciones: ValidacionInventario[] = lineas.map(linea => {
          const inventario = inventarioSimulado[linea.medioId] || {
            disponibilidad: Math.floor(Math.random() * 100),
            conflictos: [],
            alternativas: []
          };
          
          const estado = determinarEstado(inventario.disponibilidad);
          
          const validacion: ValidacionInventario = {
            medioId: linea.medioId,
            medioNombre: linea.medioNombre,
            estado,
            disponibilidadPorcentaje: inventario.disponibilidad
          };
          
          // Agregar conflictos si existen
          if (inventario.conflictos.length > 0) {
            validacion.conflictos = inventario.conflictos.map(c => ({
              tipo: c.includes('Exclusividad') ? 'exclusividad' as const : 
                    c.includes('Saturación') ? 'saturacion' as const : 'bloqueo' as const,
              descripcion: c,
              anuncianteBloqueante: c.includes('Banco') ? 'Banco XYZ' : undefined
            }));
          }
          
          // Sugerir horarios alternativos si está saturado
          if (estado === 'saturado' || estado === 'limitado') {
            validacion.horariosSugeridos = [
              { inicio: '10:00', fin: '12:00', disponibilidad: 75 },
              { inicio: '14:00', fin: '16:00', disponibilidad: 80 },
              { inicio: '20:00', fin: '22:00', disponibilidad: 65 }
            ];
          }
          
          // Sugerir alternativas si hay problemas
          if (inventario.alternativas.length > 0 && (estado === 'saturado' || estado === 'no_disponible')) {
            validacion.alternativas = inventario.alternativas.map(altId => {
              const altInv = inventarioSimulado[altId];
              return {
                medioId: altId,
                medioNombre: `Alternativa ${altId}`,
                disponibilidad: altInv?.disponibilidad || 70
              };
            });
          }
          
          return validacion;
        });
        
        // Calcular resumen
        const resumen = {
          total: validaciones.length,
          disponibles: validaciones.filter(v => v.estado === 'disponible').length,
          limitados: validaciones.filter(v => v.estado === 'limitado').length,
          saturados: validaciones.filter(v => v.estado === 'saturado').length,
          noDisponibles: validaciones.filter(v => v.estado === 'no_disponible').length,
          disponibilidadPromedio: Math.round(
            validaciones.reduce((sum, v) => sum + v.disponibilidadPorcentaje, 0) / validaciones.length
          )
        };
        
        return NextResponse.json({
          success: true,
          data: validaciones,
          resumen,
          validadoPor: ctx.userId,
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      logger.error('[API/Contratos/ValidarInventario] Error:', error instanceof Error ? error : undefined, { 
        module: 'validar-inventario',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

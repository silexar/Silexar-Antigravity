/**
 * 🌐 SILEXAR PULSE - API Routes Anunciante por ID
 * 
 * @description API REST endpoints para operaciones sobre un anunciante específico
 * Implementa GET (detalle), PUT (actualizar) y DELETE (eliminar)
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// Zod schemas for input validation
const updateAnuncianteSchema = z.object({
  nombreRazonSocial: z.string().min(1, 'La razón social no puede estar vacía').max(300).optional(),
  rut: z.string().max(20).optional().nullable(),
  giroActividad: z.string().max(200).optional().nullable(),
  direccion: z.string().max(500).optional().nullable(),
  ciudad: z.string().max(100).optional().nullable(),
  comunaProvincia: z.string().max(100).optional().nullable(),
  pais: z.string().max(100).optional(),
  emailContacto: z.string().email('Email de contacto inválido').optional().nullable(),
  telefonoContacto: z.string().max(30).optional().nullable(),
  paginaWeb: z.string().url('URL de página web inválida').or(z.literal('')).optional().nullable(),
  nombreContactoPrincipal: z.string().max(200).optional().nullable(),
  cargoContactoPrincipal: z.string().max(200).optional().nullable(),
  tieneFacturacionElectronica: z.boolean().optional(),
  direccionFacturacion: z.string().max(500).optional().nullable(),
  emailFacturacion: z.string().email('Email de facturación inválido').optional().nullable(),
  estado: z.enum(['activo', 'inactivo', 'suspendido']).optional(),
  activo: z.boolean().optional(),
  notas: z.string().max(2000).optional().nullable(),
});

const patchAnuncianteSchema = z.object({
  action: z.enum(['toggle_activo', 'suspender']),
  motivo: z.string().max(500).optional(),
});

// Tipos para la API
interface AnuncianteDTO {
  id: string;
  codigo: string;
  rut: string | null;
  nombreRazonSocial: string;
  giroActividad: string | null;
  direccion: string | null;
  ciudad: string | null;
  comunaProvincia: string | null;
  pais: string;
  emailContacto: string | null;
  telefonoContacto: string | null;
  paginaWeb: string | null;
  nombreContactoPrincipal: string | null;
  cargoContactoPrincipal: string | null;
  tieneFacturacionElectronica: boolean;
  direccionFacturacion: string | null;
  emailFacturacion: string | null;
  estado: string;
  activo: boolean;
  notas: string | null;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

// Mock de datos (compartido con route.ts principal en producción)
const mockAnunciantes: AnuncianteDTO[] = [
  {
    id: 'anu-001',
    codigo: 'ANU-0001',
    rut: '76.123.456-7',
    nombreRazonSocial: 'Banco de Chile S.A.',
    giroActividad: 'Servicios Financieros',
    direccion: 'Av. Providencia 1234, Piso 15',
    ciudad: 'Santiago',
    comunaProvincia: 'Providencia',
    pais: 'Chile',
    emailContacto: 'marketing@bancochile.cl',
    telefonoContacto: '+56 2 2345 6789',
    paginaWeb: 'https://www.bancochile.cl',
    nombreContactoPrincipal: 'María González',
    cargoContactoPrincipal: 'Gerente de Marketing',
    tieneFacturacionElectronica: true,
    direccionFacturacion: 'Av. Providencia 1234',
    emailFacturacion: 'facturas@bancochile.cl',
    estado: 'activo',
    activo: true,
    notas: 'Cliente preferencial desde 2020',
    fechaCreacion: '2025-01-15T10:00:00Z',
    fechaModificacion: '2025-02-01T14:30:00Z'
  }
];

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/anunciantes/[id]
 * Obtiene el detalle de un anunciante
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const anunciante = mockAnunciantes.find(a => a.id === id);

    if (!anunciante) {
      return NextResponse.json(
        { success: false, error: `No se encontró el anunciante con ID ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: anunciante
    });
  } catch (error) {
    logger.error('[API/Anunciantes/:id] Error en GET:', error instanceof Error ? error : undefined, { module: '[id]' });
    return NextResponse.json(
      { success: false, error: 'Error al obtener anunciante' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/anunciantes/[id]
 * Actualiza un anunciante existente
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    // Validate input with Zod
    const parsed = updateAnuncianteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const index = mockAnunciantes.findIndex(a => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: `No se encontró el anunciante con ID ${id}` },
        { status: 404 }
      );
    }

    // Validar RUT único (excluyendo el actual)
    if (parsed.data.rut) {
      const rutLimpio = parsed.data.rut.replace(/[.-]/g, '');
      const rutExists = mockAnunciantes.some(
        a => a.id !== id && a.rut?.replace(/[.-]/g, '') === rutLimpio
      );
      if (rutExists) {
        return NextResponse.json(
          { success: false, error: `Ya existe un anunciante con el RUT ${parsed.data.rut}` },
          { status: 400 }
        );
      }
    }

    // Actualizar anunciante
    const updated: AnuncianteDTO = {
      ...mockAnunciantes[index],
      ...parsed.data,
      fechaModificacion: new Date().toISOString()
    };

    mockAnunciantes[index] = updated;

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Anunciante actualizado exitosamente'
    });
  } catch (error) {
    logger.error('[API/Anunciantes/:id] Error en PUT:', error instanceof Error ? error : undefined, { module: '[id]' });
    return NextResponse.json(
      { success: false, error: 'Error al actualizar anunciante' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/anunciantes/[id]
 * Elimina un anunciante (soft delete)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const index = mockAnunciantes.findIndex(a => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: `No se encontró el anunciante con ID ${id}` },
        { status: 404 }
      );
    }

    // En producción: soft delete con fecha y usuario
    // Aquí simplemente removemos del array mock
    mockAnunciantes.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Anunciante eliminado exitosamente'
    });
  } catch (error) {
    logger.error('[API/Anunciantes/:id] Error en DELETE:', error instanceof Error ? error : undefined, { module: '[id]' });
    return NextResponse.json(
      { success: false, error: 'Error al eliminar anunciante' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/anunciantes/[id]
 * Actualización parcial (toggle activo/inactivo)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    // Validate input with Zod
    const parsed = patchAnuncianteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const index = mockAnunciantes.findIndex(a => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: `No se encontró el anunciante con ID ${id}` },
        { status: 404 }
      );
    }

    // Toggle de estado
    if (parsed.data.action === 'toggle_activo') {
      mockAnunciantes[index] = {
        ...mockAnunciantes[index],
        activo: !mockAnunciantes[index].activo,
        estado: mockAnunciantes[index].activo ? 'inactivo' : 'activo',
        fechaModificacion: new Date().toISOString()
      };
    }

    // Suspender
    if (parsed.data.action === 'suspender') {
      mockAnunciantes[index] = {
        ...mockAnunciantes[index],
        activo: false,
        estado: 'suspendido',
        notas: parsed.data.motivo
          ? `SUSPENDIDO: ${parsed.data.motivo}\n\n${mockAnunciantes[index].notas || ''}`
          : mockAnunciantes[index].notas,
        fechaModificacion: new Date().toISOString()
      };
    }

    return NextResponse.json({
      success: true,
      data: mockAnunciantes[index],
      message: 'Anunciante actualizado exitosamente'
    });
  } catch (error) {
    logger.error('[API/Anunciantes/:id] Error en PATCH:', error instanceof Error ? error : undefined, { module: '[id]' });
    return NextResponse.json(
      { success: false, error: 'Error al actualizar anunciante' },
      { status: 500 }
    );
  }
}

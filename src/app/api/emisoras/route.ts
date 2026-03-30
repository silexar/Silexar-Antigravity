/**
 * 🌐 SILEXAR PULSE - API Routes Emisoras
 * 
 * @description API REST endpoints para el módulo de Emisoras
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiValidationError, apiServerError, getUserContext, apiForbidden} from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// Zod schema for input validation
const createEmisoraSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  nombreComercial: z.string().max(200).optional(),
  tipoFrecuencia: z.enum(['fm', 'am', 'digital', 'online']).optional(),
  frecuencia: z.string().max(20).optional(),
  ciudad: z.string().max(100).optional(),
  streamUrl: z.string().url('URL de stream inválida').or(z.literal('')).optional(),
  formatoExportacion: z.enum(['csv', 'dalet', 'json', 'xml']).optional(),
});

// Mock de datos
const mockEmisoras = [
  {
    id: 'emi-001',
    codigo: 'EMI-001',
    nombre: 'Radio Cooperativa',
    nombreComercial: 'Cooperativa',
    tipoFrecuencia: 'fm',
    frecuencia: '93.3',
    ciudad: 'Santiago',
    streamUrl: 'https://stream.cooperativa.cl',
    formatoExportacion: 'csv',
    estado: 'activa',
    activa: true,
    programasCount: 12,
    fechaCreacion: '2024-06-01T10:00:00Z'
  },
  {
    id: 'emi-002',
    codigo: 'EMI-002',
    nombre: 'Radio Biobío',
    nombreComercial: 'Biobío',
    tipoFrecuencia: 'fm',
    frecuencia: '99.7',
    ciudad: 'Santiago',
    streamUrl: 'https://stream.biobio.cl',
    formatoExportacion: 'dalet',
    estado: 'activa',
    activa: true,
    programasCount: 8,
    fechaCreacion: '2024-05-15T09:30:00Z'
  },
  {
    id: 'emi-003',
    codigo: 'EMI-003',
    nombre: 'Radio ADN',
    nombreComercial: 'ADN Radio',
    tipoFrecuencia: 'fm',
    frecuencia: '91.7',
    ciudad: 'Santiago',
    streamUrl: 'https://stream.adnradio.cl',
    formatoExportacion: 'csv',
    estado: 'activa',
    activa: true,
    programasCount: 10,
    fechaCreacion: '2024-04-20T11:00:00Z'
  },
  {
    id: 'emi-004',
    codigo: 'EMI-004',
    nombre: 'Radio Pudahuel',
    nombreComercial: 'Pudahuel',
    tipoFrecuencia: 'fm',
    frecuencia: '90.5',
    ciudad: 'Santiago',
    streamUrl: 'https://stream.pudahuel.cl',
    formatoExportacion: 'csv',
    estado: 'activa',
    activa: true,
    programasCount: 6,
    fechaCreacion: '2024-03-10T08:45:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const ciudad = searchParams.get('ciudad') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let filtered = [...mockEmisoras];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(e => 
        e.nombre.toLowerCase().includes(searchLower) ||
        e.codigo.toLowerCase().includes(searchLower) ||
        e.frecuencia?.includes(search)
      );
    }

    if (ciudad) {
      filtered = filtered.filter(e => e.ciudad?.toLowerCase() === ciudad.toLowerCase());
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);

    return apiSuccess(data, 200, {
      pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 }
    });
  } catch (error) {
    logger.error('[API/Emisoras] Error:', error instanceof Error ? error : undefined, { module: 'emisoras' });
    return apiServerError(error instanceof Error ? error.message : 'Error al obtener emisoras');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const parsed = createEmisoraSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error.flatten().fieldErrors);
    }

    const newEmisora = {
      id: `emi-${Date.now()}`,
      codigo: `EMI-${(mockEmisoras.length + 1).toString().padStart(3, '0')}`,
      nombre: parsed.data.nombre,
      nombreComercial: parsed.data.nombreComercial ?? '',
      tipoFrecuencia: parsed.data.tipoFrecuencia ?? 'fm',
      frecuencia: parsed.data.frecuencia ?? '',
      ciudad: parsed.data.ciudad ?? '',
      streamUrl: parsed.data.streamUrl ?? '',
      formatoExportacion: parsed.data.formatoExportacion ?? 'json',
      estado: 'activa',
      activa: true,
      programasCount: 0,
      fechaCreacion: new Date().toISOString()
    };

    mockEmisoras.push(newEmisora as typeof mockEmisoras[0]);

    return apiSuccess(newEmisora, 201, { message: 'Emisora creada exitosamente' });
  } catch (error) {
    logger.error('[API/Emisoras] Error:', error instanceof Error ? error : undefined, { module: 'emisoras' });
    return apiServerError(error instanceof Error ? error.message : 'Error al crear emisora');
  }
}

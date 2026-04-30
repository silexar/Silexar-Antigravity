/**
 * API ROUTE: /api/paquetes/informes/exportar
 * 
 * @description Endpoint para exportar reportes de paquetes a Excel/PDF.
 * FASE 6: Reportes e Informes - Exportación
 * 
 * @version 1.0.0
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'

// ═══════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════

const ExportarSchema = z.object({
    tipoReporte: z.enum(['ocupacion', 'rentabilidad', 'completo']),
    formato: z.enum(['excel', 'pdf', 'csv']),
    filtros: z.object({
        fechaDesde: z.string().optional(),
        fechaHasta: z.string().optional(),
        tipo: z.string().optional(),
        editoraId: z.string().optional()
    }).optional()
})

// ═══════════════════════════════════════════════════════════════
// POST /api/paquetes/informes/exportar - Exportar reporte
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'paquetes', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const body = await req.json();
            const validation = ExportarSchema.safeParse(body)
            if (!validation.success) {
                return apiError('VALIDATION_ERROR', 'Datos inválidos', 400, validation.error.flatten().fieldErrors)
            }

            const { tipoReporte, formato, filtros } = validation.data

            // Generar datos simulados para exportación
            // En producción, esto consultaría la base de datos real
            const exportData = generarDatosExportacion(tipoReporte)

            // En un entorno real, aquí se generaría el archivo
            // y se retornaría la URL de descarga
            const fileName = `paquetes_${tipoReporte}_${new Date().toISOString().split('T')[0]}`

            const downloadUrl = `/api/paquetes/informes/descargar?archivo=${fileName}.${formato}`

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.MEDIUM,
                userId,
                resource: 'paquetes',
                action: 'export_report',
                success: true,
                details: {
                    tenantId,
                    tipoReporte,
                    formato,
                    registros: exportData.length
                }
            })

            return apiSuccess({
                success: true,
                message: `Reporte ${tipoReporte} exportado exitosamente`,
                fileName: `${fileName}.${formato}`,
                formato,
                totalRegistros: exportData.length,
                downloadUrl,
                fechaExportacion: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
            }, 201)

        } catch (error) {
            console.error('[Paquetes-Export] POST error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'export_report',
                success: false,
                details: { error: String(error), tenantId }
            })
            return apiServerError('Error al exportar reporte')
        }
    }
)

// ═══════════════════════════════════════════════════════════════
// GET /api/paquetes/informes/exportar - Preview columnas
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'paquetes', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const { searchParams } = new URL(req.url)
            const formato = searchParams.get('formato') || 'excel'

            // Retornar estructura de columnas disponibles para预览
            const columnas = {
                ocupacion: [
                    { key: 'codigo', label: 'Código', width: 15 },
                    { key: 'nombre', label: 'Nombre Paquete', width: 30 },
                    { key: 'tipo', label: 'Tipo', width: 12 },
                    { key: 'editora', label: 'Editora', width: 20 },
                    { key: 'cuposTotales', label: 'Cupos Totales', width: 15 },
                    { key: 'cuposOcupados', label: 'Cupos Ocupados', width: 15 },
                    { key: 'disponibles', label: 'Disponibles', width: 15 },
                    { key: 'ocupacionPct', label: 'Ocupación %', width: 12 },
                    { key: 'revenueEstimado', label: 'Revenue Est.', width: 18 }
                ],
                rentabilidad: [
                    { key: 'codigo', label: 'Código', width: 15 },
                    { key: 'nombre', label: 'Nombre Paquete', width: 30 },
                    { key: 'tipo', label: 'Tipo', width: 12 },
                    { key: 'precioBase', label: 'Precio Base', width: 15 },
                    { key: 'precioActual', label: 'Precio Actual', width: 15 },
                    { key: 'margen', label: 'Margen %', width: 12 },
                    { key: 'estadoMargen', label: 'Estado', width: 12 },
                    { key: 'revenue', label: 'Revenue Total', width: 18 },
                    { key: 'conversiones', label: 'Conversiones', width: 15 }
                ],
                completo: [
                    { key: 'codigo', label: 'Código', width: 15 },
                    { key: 'nombre', label: 'Nombre', width: 30 },
                    { key: 'tipo', label: 'Tipo', width: 12 },
                    { key: 'estado', label: 'Estado', width: 12 },
                    { key: 'editora', label: 'Editora', width: 20 },
                    { key: 'programa', label: 'Programa', width: 20 },
                    { key: 'horario', label: 'Horario', width: 15 },
                    { key: 'precioBase', label: 'Precio Base', width: 15 },
                    { key: 'precioActual', label: 'Precio', width: 15 },
                    { key: 'ocupacion', label: 'Ocupación', width: 12 },
                    { key: 'margen', label: 'Margen', width: 12 }
                ]
            }

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                userId,
                resource: 'paquetes',
                action: 'export_preview',
                success: true,
                details: { formato, tenantId }
            })

            return apiSuccess({
                formatosDisponibles: ['excel', 'pdf', 'csv'],
                columnas,
                ejemplo: columnas.ocupacion
            })

        } catch (error) {
            console.error('[Paquetes-Export] GET error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'export_preview',
                success: false,
                details: { error: String(error), tenantId }
            })
            return apiServerError('Error al obtener preview de exportación')
        }
    }
)

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generarDatosExportacion(tipo: string): Record<string, unknown>[] {
    // Datos de ejemplo para exportación
    // En producción, estos venirían de la base de datos
    return [
        {
            codigo: 'PAQ-2025-00001',
            nombre: 'Prime Matinal Premium',
            tipo: 'PRIME',
            estado: 'ACTIVO',
            editora: 'Radio Corazón',
            programa: 'Buenos Días Chile',
            horario: '06:00 - 10:00',
            precioBase: 15000,
            precioActual: 16500,
            ocupacionPct: 85,
            margen: 10,
            disponible: true
        },
        {
            codigo: 'PAQ-2025-00002',
            nombre: 'Repartido Vespertino',
            tipo: 'REPARTIDO',
            estado: 'ACTIVO',
            editora: 'Bio-Bio Radio',
            programa: 'La Segunda Mañana',
            horario: '10:00 - 15:00',
            precioBase: 12000,
            precioActual: 12000,
            ocupacionPct: 62,
            margen: 0,
            disponible: true
        },
        {
            codigo: 'PAQ-2025-00003',
            nombre: 'Nocturno Económico',
            tipo: 'NOCTURNO',
            estado: 'ACTIVO',
            editora: 'Radio Paula',
            programa: 'Noche de Noticias',
            horario: '20:00 - 23:00',
            precioBase: 8000,
            precioActual: 7200,
            ocupacionPct: 45,
            margen: -10,
            disponible: true
        }
    ]
}
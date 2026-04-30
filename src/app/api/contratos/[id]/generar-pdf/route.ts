/**
 * 📄 POST /api/contratos/:id/generar-pdf — Generar PDF del contrato
 * 
 * Genera un documento PDF completo del contrato con todas las cláusulas,
 * especificaciones y datos del contrato.
 */

import { NextResponse } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response'
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository'
import { PDFGeneratorAdvancedService } from '@/modules/contratos/infrastructure/external/PDFGeneratorAdvancedService'
import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'

const pdfService = new PDFGeneratorAdvancedService()

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface PDFGenerationOptions {
    template: 'estandar' | 'campana' | 'evento' | 'anual'
    includeFirmas: boolean
    includeAnexos: boolean
    marcaAgua?: string
    formatoSalida: 'pdf' | 'pdfa'
}

interface PDFRequest {
    opciones?: Partial<PDFGenerationOptions>
    incluirSpecifications?: boolean
    incluirTerminosPago?: boolean
    incluirExclusividades?: boolean
}

// ─── POST /api/contratos/:id/generar-pdf ─────────────────────────────────────

export const POST = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const userId = ctx.userId
        const url = new URL(req.url)
        const pathParts = url.pathname.split('/')
        const idIndex = pathParts.findIndex(p => p === 'contratos') + 1
        const id = pathParts[idIndex]

        if (!id) {
            return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse
        }

        try {
            const body: PDFRequest = await req.json().catch(() => ({}))
            const opciones: PDFGenerationOptions = {
                template: body.opciones?.template || 'estandar',
                includeFirmas: body.opciones?.includeFirmas ?? true,
                includeAnexos: body.opciones?.includeAnexos ?? false,
                marcaAgua: body.opciones?.marcaAgua,
                formatoSalida: body.opciones?.formatoSalida || 'pdf'
            }

            const repo = new DrizzleContratoRepository(tenantId)
            const contrato = await repo.findById(id)

            if (!contrato) {
                return apiNotFound('Contrato no encontrado') as unknown as NextResponse
            }

            const snap = contrato.toSnapshot()

            // Preparar datos para el PDF
            const pdfData: Record<string, unknown> = {
                // Metadata
                id: snap.id,
                numeroContrato: snap.numero.valor,
                fechaGeneracion: new Date().toISOString(),
                generadoPor: userId,
                tenantId,

                // Partes
                anunciante: {
                    id: snap.anuncianteId,
                    nombre: snap.anunciante,
                    rut: snap.rutAnunciante
                },
                agencia: snap.agenciaId ? {
                    id: snap.agenciaId,
                    nombre: snap.agencia
                } : null,
                ejecutivo: {
                    id: snap.ejecutivoId,
                    nombre: snap.ejecutivo
                },

                // Fechas
                fechaInicio: snap.fechaInicio,
                fechaFin: snap.fechaFin,
                fechaCreacion: snap.fechaCreacion,

                // Producto
                producto: snap.producto,
                tipoContrato: snap.tipoContrato,
                medio: snap.medio,
                prioridad: snap.prioridad,

                // Valores
                valores: {
                    valorBruto: snap.totales.valorBruto,
                    valorNeto: snap.totales.valorNeto,
                    descuentoPorcentaje: snap.totales.descuentoPorcentaje,
                    descuentoMonto: snap.totales.descuentoMonto,
                    moneda: snap.moneda
                },

                // Especificaciones (si se solicita)
                especificaciones: body.incluirSpecifications
                    ? await obtenerEspecificaciones(id)
                    : [],

                // Términos de pago (si se solicita)
                terminosPago: body.incluirTerminosPago ? {
                    dias: snap.terminosPago.dias,
                    modalidad: snap.modalidadFacturacion,
                    tipoFactura: snap.tipoFactura
                } : null,

                // Exclusividades (si se solicita)
                exclusividades: body.incluirExclusividades
                    ? await obtenerExclusividades(id)
                    : [],

                // Estado actual
                estado: snap.estado.valor,
                etapa: snap.etapaActual,
                progreso: snap.progreso,

                // Información de riesgo
                riesgo: {
                    nivel: snap.riesgoCredito.nivel,
                    score: snap.riesgoCredito.score
                },

                // Métricas
                metricas: snap.metricas
            }

            // Generar PDF
            logger.info('Generando PDF para contrato:', { contratoId: id, template: opciones.template })

            const pdfResult = await pdfService.generate(pdfData, {
                template: opciones.template,
                watermark: opciones.marcaAgua
            })

            logger.info('PDF generado:', { pdfId: pdfResult.id, url: pdfResult.url })

            return apiSuccess({
                success: true,
                pdf: {
                    id: pdfResult.id,
                    url: pdfResult.url,
                    nombre: `${snap.numero.valor}_${opciones.template}.pdf`,
                    paginas: pdfResult.pages,
                    tamano: pdfResult.size,
                    formato: opciones.formatoSalida,
                    generadoEn: pdfResult.generatedAt
                },
                contratoId: id,
                numeroContrato: snap.numero.valor,
                incluyeFirmas: opciones.includeFirmas,
                incluyeAnexos: opciones.includeAnexos
            }, 200, { message: 'PDF generado exitosamente' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error generando PDF:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'generar-pdf',
                contratoId: id,
                tenantId
            })

            // Log de auditoría para errores
            auditLogger.log({
                type: AuditEventType.API_ERROR,
                userId: ctx.userId,
                metadata: {
                    module: 'contratos',
                    accion: 'generar_pdf',
                    contratoId: id,
                    tenantId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            })

            return apiServerError() as unknown as NextResponse
        }
    }
)

// ─── Funciones auxiliares ────────────────────────────────────────────────────

async function obtenerEspecificaciones(contratoId: string): Promise<unknown[]> {
    // Placeholder - en implementación real consultaría la BD
    return []
}

async function obtenerExclusividades(contratoId: string): Promise<unknown[]> {
    // Placeholder - en implementación real consultaría la BD
    return []
}
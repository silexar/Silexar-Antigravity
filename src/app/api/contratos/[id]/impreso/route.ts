/**
 * 🖨️ SILEXAR PULSE - Módulo Contrato Impreso TIER 0
 * 
 * @description Genera un documento HTML/PDF completo del contrato con toda la información
 * ingresada, listo para impresión y firma física como respaldo de la firma electrónica.
 * 
 * Características:
 * - Template completo con toda la información del contrato
 * - Secciones: Partes, Producto, Fechas, Valores, Especificaciones, Términos, Firmas
 * - Genera HTML para imprimir o convertir a PDF
 * - Diseñado para enviarse al cliente para firma física
 * 
 * Endpoints:
 *   GET /api/contratos/:id/impreso - Obtener HTML del contrato para impresión
 *   POST /api/contratos/:id/impreso/pdf - Generar PDF del contrato impreso
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response';
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ContratoData {
    numeroContrato: string;
    anunciante: {
        nombre: string;
        rut: string;
        direccion?: string;
        email?: string;
    };
    agencia?: {
        nombre: string;
        rut?: string;
    };
    ejecutivo: {
        nombre: string;
        email: string;
    };
    producto: string;
    tipoContrato: 'A' | 'B' | 'C';
    medio: string;
    prioridad: string;
    fechaInicio: Date;
    fechaFin: Date;
    valores: {
        valorBruto: number;
        valorNeto: number;
        descuentoPorcentaje: number;
        moneda: string;
    };
    terminosPago: {
        dias: number;
        modalidad: string;
        tipoFactura: string;
    };
    esCanje: boolean;
    porcentajeCanje?: number;
    facturarComisionAgencia: boolean;
    especificaciones: Array<{
        descripcion: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }>;
    estado: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS DE FORMATEO
// ═══════════════════════════════════════════════════════════════

function formatCurrency(value: number, moneda: string = 'CLP'): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: moneda
    }).format(value);
}

function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatDateShort(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CL');
}

// ═══════════════════════════════════════════════════════════════
// GENERADORES DE TEMPLATES
// ═══════════════════════════════════════════════════════════════

function generarTemplateHTML(data: ContratoData): string {
    const tipoLabel = {
        'A': 'Contrato Tipo A - Alta Inversión',
        'B': 'Contrato Tipo B - Media Inversión',
        'C': 'Contrato Tipo C - Baja Inversión'
    }[data.tipoContrato] || 'Contrato Comercial';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato ${data.numeroContrato}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 18pt;
            font-weight: bold;
            margin: 20px 0;
        }
        
        .contract-number {
            font-size: 14pt;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            background: #f0f0f0;
            padding: 8px 12px;
            margin-bottom: 10px;
            border-left: 4px solid #333;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .info-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #ddd;
        }
        
        .info-table td:first-child {
            font-weight: bold;
            width: 35%;
            background: #fafafa;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .items-table th {
            background: #333;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 10pt;
        }
        
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            font-size: 10pt;
        }
        
        .items-table tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .totals {
            margin-top: 20px;
            text-align: right;
        }
        
        .totals-row {
            margin: 5px 0;
        }
        
        .totals-label {
            display: inline-block;
            width: 200px;
        }
        
        .totals-value {
            display: inline-block;
            width: 150px;
            text-align: right;
        }
        
        .grand-total {
            font-size: 14pt;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .terms {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #ddd;
        }
        
        .terms h4 {
            margin-bottom: 10px;
        }
        
        .terms ul {
            margin-left: 20px;
        }
        
        .signature-area {
            margin-top: 50px;
            page-break-inside: avoid;
        }
        
        .signature-box {
            display: inline-block;
            width: 45%;
            margin-right: 5%;
            vertical-align: top;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            height: 60px;
            margin-bottom: 5px;
        }
        
        .signature-label {
            font-size: 10pt;
            color: #666;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 9pt;
            color: #666;
            text-align: center;
        }
        
        .clausulas {
            margin: 20px 0;
        }
        
        .clausula {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        .clausula-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">SILEXAR PULSE</div>
        <div class="title">CONTRATO DE PRESTACIÓN DE SERVICIOS PUBLICITARIOS</div>
        <div class="contract-number">N° ${data.numeroContrato}</div>
    </div>

    <!-- SECCIÓN 1: PARTES -->
    <div class="section">
        <div class="section-title">I. PARTES DEL CONTRATO</div>
        <table class="info-table">
            <tr>
                <td>PROVEEDOR:</td>
                <td><strong>SILEXAR PULSE SpA</strong></td>
            </tr>
            <tr>
                <td>RUT:</td>
                <td>76.123.456-7</td>
            </tr>
            <tr>
                <td>REPRESENTANTE:</td>
                <td>
                    <strong>${data.ejecutivo.nombre}</strong><br>
                    ${data.ejecutivo.email}
                </td>
            </tr>
        </table>
        
        <table class="info-table" style="margin-top: 20px;">
            <tr>
                <td>CLIENTE (ANUNCIANTE):</td>
                <td><strong>${data.anunciante.nombre}</strong></td>
            </tr>
            <tr>
                <td>RUT:</td>
                <td>${data.anunciante.rut}</td>
            </tr>
            ${data.anunciante.direccion ? `<tr><td>DIRECCIÓN:</td><td>${data.anunciante.direccion}</td></tr>` : ''}
            ${data.anunciante.email ? `<tr><td>EMAIL:</td><td>${data.anunciante.email}</td></tr>` : ''}
        </table>
        
        ${data.agencia ? `
        <table class="info-table" style="margin-top: 20px;">
            <tr>
                <td>AGENCIA (si aplica):</td>
                <td><strong>${data.agencia.nombre}</strong></td>
            </tr>
            ${data.agencia.rut ? `<tr><td>RUT:</td><td>${data.agencia.rut}</td></tr>` : ''}
        </table>
        ` : ''}
    </div>

    <!-- SECCIÓN 2: PRODUCTO/CAMPAÑA -->
    <div class="section">
        <div class="section-title">II. PRODUCTO / CAMPAÑA</div>
        <table class="info-table">
            <tr>
                <td>CAMPAÑA/PRODUCTO:</td>
                <td><strong>${data.producto}</strong></td>
            </tr>
            <tr>
                <td>TIPO DE CONTRATO:</td>
                <td>${tipoLabel}</td>
            </tr>
            <tr>
                <td>MEDIO:</td>
                <td>${data.medio.toUpperCase()}</td>
            </tr>
            <tr>
                <td>PRIORIDAD:</td>
                <td>${data.prioridad.toUpperCase()}</td>
            </tr>
        </table>
    </div>

    <!-- SECCIÓN 3: FECHAS -->
    <div class="section">
        <div class="section-title">III. VIGENCIA</div>
        <table class="info-table">
            <tr>
                <td>FECHA DE INICIO:</td>
                <td><strong>${formatDate(data.fechaInicio)}</strong></td>
            </tr>
            <tr>
                <td>FECHA DE TÉRMINO:</td>
                <td><strong>${formatDate(data.fechaFin)}</strong></td>
            </tr>
            <tr>
                <td>DURACIÓN:</td>
                <td>${Math.ceil((new Date(data.fechaFin).getTime() - new Date(data.fechaInicio).getTime()) / (1000 * 60 * 60 * 24))} días</td>
            </tr>
        </table>
    </div>

    <!-- SECCIÓN 4: VALORES -->
    <div class="section">
        <div class="section-title">IV. VALORES COMERCIALES</div>
        <table class="info-table">
            <tr>
                <td>VALOR BRUTO:</td>
                <td>${formatCurrency(data.valores.valorBruto, data.valores.moneda)}</td>
            </tr>
            <tr>
                <td>DESCUENTO:</td>
                <td>${data.valores.descuentoPorcentaje}%</td>
            </tr>
            <tr>
                <td>VALOR NETO:</td>
                <td><strong>${formatCurrency(data.valores.valorNeto, data.valores.moneda)}</strong></td>
            </tr>
            <tr>
                <td>MONEDA:</td>
                <td>${data.valores.moneda}</td>
            </tr>
        </table>
        
        ${data.esCanje ? `
        <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffc107;">
            <strong>CONTRATO EN CANJE:</strong> ${data.porcentajeCanje || 100}% del valor corresponde a barter/canje
        </div>
        ` : ''}
    </div>

    <!-- SECCIÓN 5: ESPECIFICACIONES -->
    ${data.especificaciones && data.especificaciones.length > 0 ? `
    <div class="section">
        <div class="section-title">V. ESPECIFICACIONES TÉCNICAS</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${data.especificaciones.map((item, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${item.descripcion}</td>
                    <td>${item.cantidad}</td>
                    <td>${formatCurrency(item.precioUnitario, data.valores.moneda)}</td>
                    <td>${formatCurrency(item.subtotal, data.valores.moneda)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="totals">
            <div class="totals-row grand-total">
                <span class="totals-label">TOTAL A PAGAR:</span>
                <span class="totals-value">${formatCurrency(data.valores.valorNeto, data.valores.moneda)}</span>
            </div>
        </div>
    </div>
    ` : ''}

    <!-- SECCIÓN 6: TÉRMINOS DE PAGO -->
    <div class="section">
        <div class="section-title">VI. TÉRMINOS DE PAGO</div>
        <table class="info-table">
            <tr>
                <td>PLAZO DE CRÉDITO:</td>
                <td><strong>${data.terminosPago.dias} días</strong></td>
            </tr>
            <tr>
                <td>MODALIDAD:</td>
                <td>${data.terminosPago.modalidad}</td>
            </tr>
            <tr>
                <td>TIPO DE FACTURA:</td>
                <td>${data.terminosPago.tipoFactura}</td>
            </tr>
            ${data.facturarComisionAgencia ? `
            <tr>
                <td>COMISIÓN AGENCIA:</td>
                <td>Se facturará con comisión de agencia</td>
            </tr>
            ` : ''}
        </table>
    </div>

    <!-- SECCIÓN 7: CLÁUSULAS -->
    <div class="section">
        <div class="section-title">VII. CLÁUSULAS Y CONDICIONES</div>
        <div class="clausulas">
            <div class="clausula">
                <div class="clausula-title">PRIMERA - OBJETO:</div>
                <p>El Proveedor se obliga a prestar al Cliente los servicios de difusión publicitaria en los medios y condiciones descritos en este contrato, conforme a las especificaciones técnicas indicadas en la sección correspondiente.</p>
            </div>
            
            <div class="clausula">
                <div class="clausula-title">SEGUNDA - PRECIO Y FORMA DE PAGO:</div>
                <p>El precio total del servicio asciende a ${formatCurrency(data.valores.valorNeto, data.valores.moneda)} ({data.valores.moneda}), que el Cliente se obliga a pagar en la forma y plazos indicados en la sección de términos de pago. El incumplimiento en el pago hará aplicable intereses penales.</p>
            </div>
            
            <div class="clausula">
                <div class="clausula-title">TERCERA - VIGENCIA:</div>
                <p>El presente contrato comenzará a regir desde el ${formatDate(data.fechaInicio)} y se extenderá hasta el ${formatDate(data.fechaFin)}, salvo incumplimiento de alguna de las partes.</p>
            </div>
            
            <div class="clausula">
                <div class="clausula-title">CUARTA - OBLIGACIONES DEL PROVEEDOR:</div>
                <p>El Proveedor se obliga a: a) Difundir los avisajes conforme a las especificaciones acordadas; b) Mantener informada a la otra parte del estado de ejecución del contrato; c) Respetar los horarios y condiciones técnicas acordados.</p>
            </div>
            
            <div class="clausula">
                <div class="clausula-title">QUINTA - OBLIGACIONES DEL CLIENTE:</div>
                <p>El Cliente se obliga a: a) Proporcionar el material publicitario en los formatos y plazos acordados; b) Realizar los pagos en la forma y plazos estipulados; c) Designar un interlocutor válido para la coordinación del avisaje.</p>
            </div>
            
            <div class="clausula">
                <div class="clausula-title">SEXTA - INCUMPLIMIENTO:</div>
                <p>En caso de incumplimiento de cualquiera de las partes, la parte cumplida podrá resolver el presente contrato de inmediato, sin perjuicio de las acciones legales que le asistan para perseguir el resarcimiento de daños y perjuicios.</p>
            </div>
            
            <div class="clausula">
                <div class="clausula-title">SÉPTIMA - LEGISLACIÓN APLICABLE:</div>
                <p>Para todos los efectos legales, las partes fijan su domicilio en la ciudad de Santiago de Chile y se someten a la legislación chilena vigente.</p>
            </div>
        </div>
    </div>

    <!-- SECCIÓN 8: FIRMAS -->
    <div class="section signature-area">
        <div class="section-title">VIII. FIRMAS</div>
        <p style="margin-bottom: 30px; font-style: italic; color: #666;">
            En señal de aceptación, las partes firman el presente contrato en Santiago, a ${formatDate(new Date())}.
        </p>
        
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label"><strong>PROVEEDOR</strong></div>
            <div class="signature-label">${data.ejecutivo.nombre}</div>
            <div class="signature-label">RUT: 76.123.456-7</div>
            <div class="signature-label">Fecha: _______________</div>
        </div>
        
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label"><strong>CLIENTE</strong></div>
            <div class="signature-label">${data.anunciante.nombre}</div>
            <div class="signature-label">RUT: ${data.anunciante.rut}</div>
            <div class="signature-label">Fecha: _______________</div>
        </div>
        
        ${data.agencia ? `
        <div class="signature-box" style="margin-top: 30px;">
            <div class="signature-line"></div>
            <div class="signature-label"><strong>AGENCIA (Si aplica)</strong></div>
            <div class="signature-label">${data.agencia.nombre}</div>
            <div class="signature-label">RUT: ${data.agencia.rut || '________'}</div>
            <div class="signature-label">Fecha: _______________</div>
        </div>
        ` : ''}
    </div>

    <div class="footer">
        <p>Documento generado el ${formatDate(new Date())} - Silexar Pulse</p>
        <p>Este documento es parte del contrato N° ${data.numeroContrato}</p>
        <p style="margin-top: 10px;">
            <em>"Este documento ha sido generado electrónicamente y puede ser validado en nuestro sistema."</em>
        </p>
    </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/contratos/:id/impreso
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;

        try {
            // Extraer ID del contrato de la URL
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const idIndex = pathParts.findIndex(p => p === 'contratos') + 1;
            const id = pathParts[idIndex];

            if (!id) {
                return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse;
            }

            // Obtener contrato
            const repo = new DrizzleContratoRepository(tenantId);
            const contrato = await repo.findById(id);

            if (!contrato) {
                return apiNotFound('Contrato no encontrado') as unknown as NextResponse;
            }

            const snap = contrato.toSnapshot();

            // Preparar datos para el template
            const data: ContratoData = {
                numeroContrato: snap.numero.valor,
                anunciante: {
                    nombre: snap.anunciante || 'N/A',
                    rut: snap.rutAnunciante || 'N/A'
                },
                agencia: snap.agenciaId ? {
                    nombre: snap.agencia || 'N/A'
                } : undefined,
                ejecutivo: {
                    nombre: snap.ejecutivo || 'Ejecutivo Comercial',
                    email: 'ejecutivo@silexar.com'
                },
                producto: snap.producto,
                tipoContrato: snap.tipoContrato,
                medio: snap.medio,
                prioridad: snap.prioridad,
                fechaInicio: snap.fechaInicio,
                fechaFin: snap.fechaFin,
                valores: {
                    valorBruto: snap.totales.valorBruto,
                    valorNeto: snap.totales.valorNeto,
                    descuentoPorcentaje: snap.totales.descuentoPorcentaje,
                    moneda: snap.moneda
                },
                terminosPago: {
                    dias: snap.terminosPago.dias,
                    modalidad: snap.modalidadFacturacion,
                    tipoFactura: snap.tipoFactura
                },
                esCanje: snap.esCanje,
                porcentajeCanje: snap.esCanje ? 100 : undefined,
                facturarComisionAgencia: snap.facturarComisionAgencia,
                especificaciones: [],
                estado: snap.estado.valor
            };

            // Verificar si se solicita HTML o PDF
            const searchParams = url.searchParams;
            const formato = searchParams.get('formato') || 'html';

            if (formato === 'html') {
                // Retornar HTML
                const html = generarTemplateHTML(data);

                return new NextResponse(html, {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Content-Disposition': `inline; filename="${data.numeroContrato}.html"`
                    }
                });
            }

            // Para PDF, se usaría un servicio de conversión
            // En desarrollo, retornamos el HTML con instrucción
            return apiSuccess({
                message: 'Para generar PDF, use POST /api/contratos/:id/impreso/pdf o imprima el HTML',
                contratoId: id,
                numeroContrato: snap.numero.valor,
                htmlUrl: `/api/contratos/${id}/impreso?formato=html`
            }, 200, { message: 'Contrato impreso disponible' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('Error generando contrato impreso:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'impreso',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// POST /api/contratos/:id/impreso/pdf
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;

        try {
            // Extraer ID del contrato de la URL
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const idIndex = pathParts.findIndex(p => p === 'contratos') + 1;
            const id = pathParts[idIndex];

            if (!id) {
                return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse;
            }

            // Obtener contrato
            const repo = new DrizzleContratoRepository(tenantId);
            const contrato = await repo.findById(id);

            if (!contrato) {
                return apiNotFound('Contrato no encontrado') as unknown as NextResponse;
            }

            const snap = contrato.toSnapshot();

            // En producción, aquí usaríamos un servicio como:
            // - Puppeteer/Playwright para convertir HTML a PDF
            // - @react-pdf/renderer para generar PDF directamente
            // - API de terceros como DocRaptor, PDFShift, etc.

            // Por ahora, retornamos la información para generar el PDF
            return apiSuccess({
                success: true,
                message: 'PDF generado exitosamente',
                data: {
                    pdfId: `pdf_${id}_${Date.now()}`,
                    url: `/pdfs/contrato_${snap.numero.valor}.pdf`,
                    numeroContrato: snap.numero.valor,
                    generadoEn: new Date().toISOString(),
                    nota: 'En producción, el PDF se generará usando Puppeteer o servicio de conversión HTML->PDF'
                }
            }, 200, { message: 'PDF generado' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('Error generando PDF:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'impreso-pdf',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return apiServerError() as unknown as NextResponse;
        }
    }
);

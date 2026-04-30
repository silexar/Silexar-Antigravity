/**
 * POST /api/cunas/[id]/validar - Valida una cuña antes de exportación/distribución
 * GET /api/cunas/[id]/validar - Obtiene resultado de validación
 * 
 * Validaciones realizadas:
 * - Estado válido para operación
 * - Audio presente y válido
 * - Duración dentro de rangos permitidos
 * - Vencimientos de contrato activo
 * - Cumplimiento técnico (LUFS, peak, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { cunas, contratos } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withApiRoute } from '@/lib/api/with-api-route';
import { VencimientosValidationService } from '@/modules/cunas/infrastructure/external/VencimientosValidationService';
import { audioProcessingService } from '@/modules/cunas/infrastructure/external/AudioProcessingService';

export interface ValidacionResultado {
    valida: boolean;
    cunaId: string;
    codigo: string;
    validaciones: {
        estado: { passed: boolean; mensaje: string };
        audio: { passed: boolean; mensaje: string };
        duracion: { passed: boolean; mensaje: string };
        vencimientos: { passed: boolean; mensaje: string };
        technicalCompliance: { passed: boolean; mensaje: string };
    };
    errores: string[];
    advertencias: string[];
}

export const POST = withApiRoute(
    { resource: 'cunas', action: 'update' },
    async ({ ctx, req }: { ctx: { tenantId: string; userId: string }; req: NextRequest }) => {
        try {
            const db = getDB();
            const tenantId = ctx.tenantId;

            // Extraer ID de la cuña de la URL
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const cunaId = pathParts[pathParts.indexOf('cunas') + 1];

            // Obtener la cuña
            const [cuna] = await db
                .select()
                .from(cunas)
                .where(and(eq(cunas.id, cunaId), eq(cunas.tenantId, tenantId)))
                .limit(1);

            if (!cuna) {
                return NextResponse.json(
                    { success: false, error: 'Cuña no encontrada' },
                    { status: 404 }
                );
            }

            // Obtener parámetros de validación (opcionales)
            const body = await req.json().catch(() => ({}));
            const validarTechnical = body.validarTechnical ?? true;
            const skipVencimientos = body.skipVencimientos ?? false;

            const errores: string[] = [];
            const advertencias: string[] = [];
            const validaciones = {
                estado: { passed: false, mensaje: '' },
                audio: { passed: false, mensaje: '' },
                duracion: { passed: false, mensaje: '' },
                vencimientos: { passed: true, mensaje: 'No requerido' },
                technicalCompliance: { passed: true, mensaje: 'No requerido' },
            };

            // 1. Validar estado
            const estadosValidos = ['aprobada', 'en_aire'];
            if (estadosValidos.includes(cuna.estado)) {
                validaciones.estado = {
                    passed: true,
                    mensaje: `Estado válido: ${cuna.estado}`,
                };
            } else if (cuna.estado === 'borrador' || cuna.estado === 'pendiente_aprobacion') {
                validaciones.estado = {
                    passed: false,
                    mensaje: `La cuña debe estar aprobada para exportar. Estado actual: ${cuna.estado}`,
                };
                errores.push('Estado no válido para exportación');
            } else {
                validaciones.estado = {
                    passed: false,
                    mensaje: `Estado no permite exportación: ${cuna.estado}`,
                };
                errores.push(`Estado ${cuna.estado} no permite exportación`);
            }

            // 2. Validar audio presente
            if (cuna.pathAudio) {
                validaciones.audio = {
                    passed: true,
                    mensaje: 'Audio presente',
                };
            } else {
                validaciones.audio = {
                    passed: false,
                    mensaje: 'La cuña no tiene audio asociado',
                };
                errores.push('Audio no encontrado');
            }

            // 3. Validar duración
            const duracionSegundos = cuna.duracionSegundos ?? 0;
            const DURACION_MIN = 5;
            const DURACION_MAX = 180;

            if (duracionSegundos >= DURACION_MIN && duracionSegundos <= DURACION_MAX) {
                validaciones.duracion = {
                    passed: true,
                    mensaje: `Duración válida: ${duracionSegundos}s`,
                };
            } else if (duracionSegundos < DURACION_MIN) {
                validaciones.duracion = {
                    passed: false,
                    mensaje: `Duración demasiado corta: ${duracionSegundos}s (mínimo: ${DURACION_MIN}s)`,
                };
                errores.push('Duración por debajo del mínimo');
            } else {
                validaciones.duracion = {
                    passed: false,
                    mensaje: `Duración demasiado larga: ${duracionSegundos}s (máximo: ${DURACION_MAX}s)`,
                };
                errores.push('Duración excede el máximo');
            }

            // 4. Validar vencimientos de contrato (si tiene contrato)
            if (!skipVencimientos && cuna.contratoId) {
                const vencimientoservice = new VencimientosValidationService();
                const validacionVencimientos = await vencimientoservice.validarCuna(
                    cunaId,
                    cuna.contratoId,
                    tenantId
                );

                if (validacionVencimientos.tieneVencimientosActivo) {
                    validaciones.vencimientos = {
                        passed: true,
                        mensaje: validacionVencimientos.observaciones || 'Vencimientos activo',
                    };
                } else {
                    validaciones.vencimientos = {
                        passed: false,
                        mensaje: validacionVencimientos.observaciones || 'Contrato sin vencimientos activo',
                    };
                    errores.push('Vencimientos de contrato inactivo');
                }

                // Verificar si está por vencer
                if (validacionVencimientos.diasRestantes != null) {
                    if (validacionVencimientos.diasRestantes <= 7) {
                        advertencias.push(`Contrato vence en ${validacionVencimientos.diasRestantes} días`);
                    }
                    if (validacionVencimientos.diasRestantes <= 0) {
                        errores.push('Contrato ya vencido');
                    }
                }
            }

            // 5. Validación técnica de audio (si está habilitada y hay audio)
            if (validarTechnical && cuna.pathAudio) {
                try {
                    const audioAnalysis = await audioProcessingService.processAudio(cuna.pathAudio);

                    if (audioAnalysis.success && audioAnalysis.data) {
                        const analysis = audioAnalysis.data;

                        // Verificar LUFS (estándar: -14 LUFS para streaming, -24 para broadcast)
                        if (analysis.lufsLevel > -10 || analysis.lufsLevel < -24) {
                            advertencias.push(
                                `Nivel LUFS fuera de rango óptimo: ${analysis.lufsLevel} dB (ideal: -14 a -24)`
                            );
                        }

                        // Verificar peak
                        if (analysis.peakLevel > -1) {
                            errores.push(`Peak demasiado alto: ${analysis.peakLevel} dB (máximo: -1 dB)`);
                        }

                        // Verificar silencio al inicio/fin
                        if (analysis.waveformData) {
                            const waveform = analysis.waveformData;
                            if (waveform[0] > 0.1 || waveform[waveform.length - 1] > 0.1) {
                                advertencias.push('Audio puede tener silencio al inicio o fin');
                            }
                        }

                        if (errores.length === 0 && advertencias.length === 0) {
                            validaciones.technicalCompliance = {
                                passed: true,
                                mensaje: 'Cumplimiento técnico OK',
                            };
                        } else {
                            validaciones.technicalCompliance = {
                                passed: errores.length === 0,
                                mensaje: errores.length > 0
                                    ? 'Errores técnicos encontrados'
                                    : 'Advertencias técnicas (no bloqueante)',
                            };
                        }
                    }
                } catch (techError) {
                    // No bloquear por error en análisis técnico
                    advertencias.push('No se pudo completar análisis técnico del audio');
                }
            }

            // Resultado final
            const resultado: ValidacionResultado = {
                valida: errores.length === 0,
                cunaId: cuna.id,
                codigo: cuna.codigo || cuna.id,
                validaciones,
                errores,
                advertencias,
            };

            // Actualizar última validación en la cuña
            await db
                .update(cunas)
                .set({
                    updatedAt: new Date(),
                })
                .where(and(eq(cunas.id, cunaId), eq(cunas.tenantId, tenantId)));

            return NextResponse.json({
                success: true,
                data: resultado,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error('[API/Cunas/Validar] Error:', error);
            return NextResponse.json(
                { success: false, error: 'Error al validar cuña' },
                { status: 500 }
            );
        }
    }
);

export const GET = withApiRoute(
    { resource: 'cunas', action: 'read', skipCsrf: true },
    async ({ ctx, req }: { ctx: { tenantId: string; userId: string }; req: NextRequest }) => {
        try {
            const db = getDB();
            const tenantId = ctx.tenantId;

            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const cunaId = pathParts[pathParts.indexOf('cunas') + 1];

            // Obtener la cuña
            const [cuna] = await db
                .select()
                .from(cunas)
                .where(and(eq(cunas.id, cunaId), eq(cunas.tenantId, tenantId)))
                .limit(1);

            if (!cuna) {
                return NextResponse.json(
                    { success: false, error: 'Cuña no encontrada' },
                    { status: 404 }
                );
            }

            // Retornar último resultado de validación si existe
            return NextResponse.json({
                success: true,
                data: {
                    cunaId: cuna.id,
                    codigo: cuna.codigo,
                    estado: cuna.estado,
                    tieneAudio: !!cuna.pathAudio,
                    duracionSegundos: cuna.duracionSegundos,
                },
            });
        } catch (error) {
            console.error('[API/Cunas/Validar] Error GET:', error);
            return NextResponse.json(
                { success: false, error: 'Error al obtener validación' },
                { status: 500 }
            );
        }
    }
);

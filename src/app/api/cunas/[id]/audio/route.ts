/**
 * POST /api/cunas/[id]/audio - Upload y procesamiento de audio
 * GET /api/cunas/[id]/audio - Obtener información del audio
 * DELETE /api/cunas/[id]/audio - Eliminar audio
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { cunas, digitalAssets } from '@/lib/db/schema';
import type { FormatoAudio } from '@/lib/db/cunas-schema';
import { eq, and } from 'drizzle-orm';
import { withApiRoute } from '@/lib/api/with-api-route';
import { audioProcessingService } from '@/modules/cunas/infrastructure/external/AudioProcessingService';

export const POST = withApiRoute(
    { resource: 'cunas', action: 'update' },
    async ({ ctx, req }: { ctx: { tenantId: string; userId: string }; req: NextRequest }) => {
        try {
            const db = getDB();
            const tenantId = ctx.tenantId;
            const userId = ctx.userId;

            // Extraer ID de la cuña de la URL
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const cunaId = pathParts[pathParts.indexOf('cunas') + 1];

            // Verificar que la cuña existe
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

            // Obtener el archivo del FormData
            const formData = await req.formData();
            const file = formData.get('file') as File | null;

            if (!file) {
                return NextResponse.json(
                    { success: false, error: 'No se proporcionó archivo de audio' },
                    { status: 400 }
                );
            }

            // Validaciones básicas
            const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/aac', 'audio/m4a', 'audio/flac', 'audio/ogg'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { success: false, error: `Tipo de archivo no soportado: ${file.type}` },
                    { status: 400 }
                );
            }

            const maxSizeMB = 100;
            if (file.size > maxSizeMB * 1024 * 1024) {
                return NextResponse.json(
                    { success: false, error: `Archivo demasiado grande. Máximo: ${maxSizeMB}MB` },
                    { status: 400 }
                );
            }

            // Simular upload a GCS (en producción sería real)
            const audioUrl = `https://storage.example.com/cunas/${cunaId}/${file.name}`;

            // Procesar el audio
            const processingResult = await audioProcessingService.processAudio(audioUrl);

            if (processingResult.success) {
                // Guardar activo digital
                await audioProcessingService.saveDigitalAsset({
                    tenantId,
                    cunaId,
                    anuncianteId: cuna.anuncianteId,
                    tipo: 'audio_procesado',
                    url: audioUrl,
                    duracion: processingResult.data!.duration,
                    formato: processingResult.data!.format,
                    tamanoBytes: processingResult.data!.fileSize,
                    metadatos: {
                        bitrate: processingResult.data!.bitrate,
                        sampleRate: processingResult.data!.sampleRate,
                        channels: processingResult.data!.channels,
                        qualityScore: processingResult.data!.qualityScore,
                        waveformData: processingResult.data!.waveformData,
                        peakLevel: processingResult.data!.peakLevel,
                        rmsLevel: processingResult.data!.rmsLevel,
                        lufsLevel: processingResult.data!.lufsLevel,
                    },
                });

                // Actualizar cuña con info del audio
                await db
                    .update(cunas)
                    .set({
                        pathAudio: audioUrl,
                        duracionSegundos: processingResult.data!.duration,
                        formatoAudio: processingResult.data!.format.toLowerCase() as FormatoAudio,
                        bitrate: processingResult.data!.bitrate,
                        sampleRate: processingResult.data!.sampleRate,
                        tamanoBytes: processingResult.data!.fileSize,
                        updatedAt: new Date(),
                    })
                    .where(and(eq(cunas.id, cunaId), eq(cunas.tenantId, tenantId)));

                return NextResponse.json({
                    success: true,
                    data: {
                        audioId: `audio-${Date.now()}`,
                        url: audioUrl,
                        duration: processingResult.data!.duration,
                        format: processingResult.data!.format,
                        fileSize: processingResult.data!.fileSize,
                        qualityScore: processingResult.data!.qualityScore,
                        technicalAnalysis: {
                            bitrate: processingResult.data!.bitrate,
                            sampleRate: processingResult.data!.sampleRate,
                            channels: processingResult.data!.channels,
                            peakLevel: processingResult.data!.peakLevel,
                            rmsLevel: processingResult.data!.rmsLevel,
                            lufsLevel: processingResult.data!.lufsLevel,
                        },
                        broadcastCompliance: processingResult.data!.analysisDetails.compliant,
                    },
                });
            } else {
                return NextResponse.json(
                    { success: false, error: processingResult.error },
                    { status: 500 }
                );
            }
        } catch (error) {
            console.error('[API/Cunas/Audio] Error:', error);
            return NextResponse.json(
                { success: false, error: 'Error al procesar audio' },
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

            // Obtener información de la cuña
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

            // Obtener activos digitales asociados (audios)
            const audios = await db
                .select()
                .from(digitalAssets)
                .where(
                    and(
                        eq(digitalAssets.cunaId, cunaId),
                        eq(digitalAssets.tipoAsset, 'AUDIO_STREAMING')
                    )
                );

            return NextResponse.json({
                success: true,
                data: {
                    cunaId: cuna.id,
                    codigo: cuna.codigo,
                    audioActual: cuna.pathAudio ? {
                        url: cuna.pathAudio,
                        duracion: cuna.duracionSegundos,
                        formato: cuna.formatoAudio,
                        bitrate: cuna.bitrate,
                    } : null,
                    historialAudios: audios.map(a => ({
                        id: a.id,
                        url: a.urlOriginal,
                        duracion: a.duracionSegundos,
                        formato: a.formato,
                        createdAt: a.fechaSubida,
                    })),
                },
            });
        } catch (error) {
            console.error('[API/Cunas/Audio] Error GET:', error);
            return NextResponse.json(
                { success: false, error: 'Error al obtener audio' },
                { status: 500 }
            );
        }
    }
);

export const DELETE = withApiRoute(
    { resource: 'cunas', action: 'delete' },
    async ({ ctx, req }: { ctx: { tenantId: string; userId: string }; req: NextRequest }) => {
        try {
            const db = getDB();
            const tenantId = ctx.tenantId;

            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const cunaId = pathParts[pathParts.indexOf('cunas') + 1];

            // Eliminar el path de audio de la cuña (soft delete del archivo)
            await db
                .update(cunas)
                .set({
                    pathAudio: '',
                    duracionSegundos: 0,
                    formatoAudio: 'mp3',
                    bitrate: null,
                    sampleRate: null,
                    tamanoBytes: null,
                    updatedAt: new Date(),
                })
                .where(and(eq(cunas.id, cunaId), eq(cunas.tenantId, tenantId)));

            // En producción, también marcar activos digitales como eliminados

            return NextResponse.json({
                success: true,
                message: 'Audio eliminado correctamente',
            });
        } catch (error) {
            console.error('[API/Cunas/Audio] Error DELETE:', error);
            return NextResponse.json(
                { success: false, error: 'Error al eliminar audio' },
                { status: 500 }
            );
        }
    }
);

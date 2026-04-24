/**
 * POST /api/cunas/[id]/distribuir - Distribuye una cuña por email/WhatsApp
 * GET /api/cunas/[id]/distribuir - Historial de distribución
 * 
 * Canales de distribución:
 * - email: Envío por email a operadores/programadores
 * - whatsapp: Envío por WhatsApp
 * - ftp: Subida a servidor FTP del cliente
 * - api: Integración API con sistemas del cliente
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { cunas } from '@/lib/db/schema';
import { gruposDistribucion, enviosDistribucion } from '@/lib/db/cunas-extended-schema';
import { eq, and, desc } from 'drizzle-orm';
import { withApiRoute } from '@/lib/api/with-api-route';
import { emailDistributionService, EmailRecipient, DistributionEmailContent } from '@/modules/cunas/infrastructure/external/EmailDistributionService';
import { whatsAppDistributionService, WhatsAppRecipient, WhatsAppContent } from '@/modules/cunas/infrastructure/external/WhatsAppDistributionService';

export interface DistribuirRequest {
    canal: 'email' | 'whatsapp' | 'ftp' | 'api';
    grupoId?: string;
    destinatarios?: EmailRecipient[];
    templateId?: string;
    mensaje?: string;
    incluirAudio?: boolean;
    incluirInfo?: boolean;
}

export interface DistribucionResultado {
    success: boolean;
    cunaId: string;
    canal: string;
    destinatarios: {
        email?: string;
        telefono?: string;
        status: 'enviado' | 'fallido' | 'pendiente';
        error?: string;
    }[];
    messageId?: string;
    timestamp: Date;
}

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

            // Obtener cuerpo de la solicitud
            const body: DistribuirRequest = await req.json();
            const { canal, grupoId, destinatarios, templateId, mensaje, incluirAudio = true, incluirInfo = true } = body;

            if (!canal) {
                return NextResponse.json(
                    { success: false, error: 'Canal de distribución requerido' },
                    { status: 400 }
                );
            }

            // Preparar contenido del mensaje
            const contenido: DistributionEmailContent = {
                cunaId: cuna.id,
                cunaCodigo: cuna.codigo || cuna.id,
                cunaNombre: cuna.nombre,
                anuncianteNombre: (cuna as Record<string, unknown>).anuncianteNombre as string || 'N/A',
                duracion: cuna.duracionSegundos || 0,
                formato: cuna.formatoAudio || 'N/A',
                tipo: cuna.tipoCuna as 'spot' | 'mencion' | 'presentacion' | 'cierre' | 'promo_ida',
                fechaInicioVigencia: cuna.fechaInicioVigencia?.toISOString().split('T')[0] || 'N/A',
                fechaFinVigencia: cuna.fechaFinVigencia?.toISOString().split('T')[0] || 'N/A',
                audioUrl: incluirAudio ? cuna.pathAudio || undefined : undefined,
                observaciones: cuna.descripcion || undefined,
                instrucciones: mensaje || undefined,
            };

            let resultado: DistribucionResultado;

            switch (canal) {
                case 'email':
                    resultado = await distribuirPorEmail(db, tenantId, userId, cuna, contenido, grupoId, destinatarios, templateId);
                    break;

                case 'whatsapp':
                    resultado = await distribuirPorWhatsApp(db, tenantId, userId, cuna, contenido, grupoId, destinatarios, mensaje);
                    break;

                case 'ftp':
                    resultado = await distribuirPorFTP(db, tenantId, userId, cuna, grupoId);
                    break;

                case 'api':
                    resultado = await distribuirPorAPI(db, tenantId, userId, cuna, grupoId);
                    break;

                default:
                    return NextResponse.json(
                        { success: false, error: `Canal no soportado: ${canal}` },
                        { status: 400 }
                    );
            }

            return NextResponse.json({
                success: true,
                data: resultado,
            });
        } catch (error) {
            console.error('[API/Cunas/Distribuir] Error:', error);
            return NextResponse.json(
                { success: false, error: 'Error al distribuir cuña' },
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

            // Obtener historial de envíos
            const envios = await db
                .select()
                .from(enviosDistribucion)
                .where(and(
                    eq(enviosDistribucion.cunaId, cunaId),
                    eq(enviosDistribucion.tenantId, tenantId)
                ))
                .orderBy(desc(enviosDistribucion.fechaCreacion));

            // Obtener grupos de distribución disponibles
            const grupos = await db
                .select()
                .from(gruposDistribucion)
                .where(and(
                    eq(gruposDistribucion.tenantId, tenantId),
                    eq(gruposDistribucion.activo, true)
                ));

            return NextResponse.json({
                success: true,
                data: {
                    historialEnvios: envios.map(e => ({
                        id: e.id,
                        gruposIds: e.gruposIds,
                        estado: e.estado,
                        fechaCreacion: e.fechaCreacion,
                    })),
                    gruposDisponibles: grupos.map(g => ({
                        id: g.id,
                        nombre: g.nombre,
                        descripcion: g.descripcion,
                        tipo: g.tipo,
                    })),
                },
            });
        } catch (error) {
            console.error('[API/Cunas/Distribuir] Error GET:', error);
            return NextResponse.json(
                { success: false, error: 'Error al obtener historial' },
                { status: 500 }
            );
        }
    }
);

// Funciones auxiliares de distribución

async function distribuirPorEmail(
    db: ReturnType<typeof getDB>,
    tenantId: string,
    userId: string,
    cuna: typeof cunas.$inferSelect,
    contenido: DistributionEmailContent,
    grupoId?: string,
    destinatarios?: EmailRecipient[],
    templateId?: string
): Promise<DistribucionResultado> {
    // Si hay grupo, obtener destinatarios del grupo
    let recipients = destinatarios || [];

    if (grupoId && recipients.length === 0) {
        const [grupo] = await db
            .select()
            .from(gruposDistribucion)
            .where(and(
                eq(gruposDistribucion.id, grupoId),
                eq(gruposDistribucion.tenantId, tenantId)
            ))
            .limit(1);

        if (grupo && grupo.destinatarios) {
            recipients = grupo.destinatarios.map((d: Record<string, unknown>) => ({
                email: d.email as string,
                name: d.nombre as string | undefined,
                role: d.role as 'operator' | 'sales_rep' | 'supervisor' | 'programmer' | 'other' | undefined,
            }));
        }
    }

    if (recipients.length === 0) {
        return {
            success: false,
            cunaId: cuna.id,
            canal: 'email',
            destinatarios: [],
            timestamp: new Date(),
        };
    }

    const result = await emailDistributionService.sendDistributionEmail(
        recipients,
        contenido,
        templateId || 'standard_commercial'
    );

    // Registrar envío
    await db.insert(enviosDistribucion).values({
        tenantId,
        cunaId: cuna.id,
        cunaCodigo: cuna.codigo,
        cunaNombre: cuna.nombre,
        gruposIds: grupoId ? [grupoId] : [],
        registrosEnvio: recipients.map((r, idx) => ({
            id: `reg-${Date.now()}-${idx}`,
            destinatarioId: r.id || `dest-${idx}`,
            destinatarioNombre: r.name || r.email,
            metodoUsado: 'email',
            estado: result.success ? 'enviado' : 'fallido',
            fechaEnvio: new Date().toISOString(),
            intentos: 1,
        })),
        contenido: {
            incluyeAudio: !!contenido.audioUrl,
            incluyeInfo: true,
            incluyeInstrucciones: !!contenido.instrucciones,
            incluyeTranscripcion: false,
            notasEspeciales: JSON.stringify({ templateId, canal: 'email' }),
        },
        plantillaEmail: templateId || 'standard_commercial',
        estado: result.success ? 'enviado' : 'fallido',
        totalDestinatarios: recipients.length,
        enviados: result.success ? recipients.length : 0,
        fallidos: result.success ? 0 : recipients.length,
        creadoPorId: userId,
        fechaInicio: new Date(),
    });

    return {
        success: result.success,
        cunaId: cuna.id,
        canal: 'email',
        destinatarios: recipients.map(r => ({
            email: r.email,
            status: result.success ? 'enviado' : 'fallido' as const,
            error: result.success ? undefined : (result.error as any)?.message ?? 'Error desconocido',
        })),
        messageId: result.success ? result.data.messageId : undefined,
        timestamp: new Date(),
    };
}

async function distribuirPorWhatsApp(
    db: ReturnType<typeof getDB>,
    tenantId: string,
    userId: string,
    cuna: typeof cunas.$inferSelect,
    contenido: DistributionEmailContent,
    grupoId?: string,
    destinatarios?: EmailRecipient[],
    mensaje?: string
): Promise<DistribucionResultado> {
    let phones = destinatarios?.map(r => r.phone || '').filter(Boolean) || [];

    if (grupoId && phones.length === 0) {
        const [grupo] = await db
            .select()
            .from(gruposDistribucion)
            .where(and(
                eq(gruposDistribucion.id, grupoId),
                eq(gruposDistribucion.tenantId, tenantId)
            ))
            .limit(1);

        if (grupo && grupo.destinatarios) {
            phones = grupo.destinatarios
                .map((d: Record<string, unknown>) => d.telefono as string)
                .filter(Boolean);
        }
    }

    if (phones.length === 0) {
        return {
            success: false,
            cunaId: cuna.id,
            canal: 'whatsapp',
            destinatarios: [],
            timestamp: new Date(),
        };
    }

    const waRecipients: WhatsAppRecipient[] = phones.map(phone => ({ phone }));
    const waContent: WhatsAppContent = {
        cunaId: contenido.cunaId,
        cunaCodigo: contenido.cunaCodigo,
        cunaNombre: contenido.cunaNombre,
        anuncianteNombre: contenido.anuncianteNombre,
        duracion: contenido.duracion,
        tipo: contenido.tipo,
        fechaInicioVigencia: contenido.fechaInicioVigencia,
        fechaFinVigencia: contenido.fechaFinVigencia,
        instrucciones: mensaje || contenido.instrucciones,
    };

    const result = await whatsAppDistributionService.sendWhatsAppMessage(
        waRecipients,
        waContent,
        'standard_delivery'
    );

    // Registrar envío
    await db.insert(enviosDistribucion).values({
        tenantId,
        cunaId: cuna.id,
        cunaCodigo: cuna.codigo,
        cunaNombre: cuna.nombre,
        gruposIds: grupoId ? [grupoId] : [],
        registrosEnvio: phones.map((phone, idx) => ({
            id: `reg-${Date.now()}-${idx}`,
            destinatarioId: `wa-${idx}`,
            destinatarioNombre: phone,
            metodoUsado: 'whatsapp',
            estado: result.success ? 'enviado' : 'fallido',
            fechaEnvio: new Date().toISOString(),
            intentos: 1,
        })),
        contenido: {
            incluyeAudio: false,
            incluyeInfo: true,
            incluyeInstrucciones: !!mensaje,
            incluyeTranscripcion: false,
            notasEspeciales: JSON.stringify({ mensaje, canal: 'whatsapp' }),
        },
        estado: result.success ? 'enviado' : 'fallido',
        totalDestinatarios: phones.length,
        enviados: result.success ? phones.length : 0,
        fallidos: result.success ? 0 : phones.length,
        creadoPorId: userId,
        fechaInicio: new Date(),
    });

    return {
        success: result.success,
        cunaId: cuna.id,
        canal: 'whatsapp',
        destinatarios: phones.map(p => ({
            telefono: p,
            status: result.success ? 'enviado' : 'fallido' as const,
        })),
        timestamp: new Date(),
    };
}

async function distribuirPorFTP(
    db: ReturnType<typeof getDB>,
    tenantId: string,
    userId: string,
    cuna: typeof cunas.$inferSelect,
    grupoId?: string
): Promise<DistribucionResultado> {
    // En producción, implementar integración FTP real
    console.log(`[FTP Distribution] Simulando upload para cuña ${cuna.id}`);

    await db.insert(enviosDistribucion).values({
        tenantId,
        cunaId: cuna.id,
        cunaCodigo: cuna.codigo,
        cunaNombre: cuna.nombre,
        gruposIds: grupoId ? [grupoId] : ['ftp'],
        registrosEnvio: [],
        contenido: {
            incluyeAudio: true,
            incluyeInfo: true,
            incluyeInstrucciones: false,
            incluyeTranscripcion: false,
            notasEspeciales: JSON.stringify({ path: `/ftp/uploads/${cuna.codigo || cuna.id}`, canal: 'ftp' }),
        },
        estado: 'pendiente',
        totalDestinatarios: 0,
        creadoPorId: userId,
        fechaInicio: new Date(),
    });

    return {
        success: true,
        cunaId: cuna.id,
        canal: 'ftp',
        destinatarios: [],
        timestamp: new Date(),
    };
}

async function distribuirPorAPI(
    db: ReturnType<typeof getDB>,
    tenantId: string,
    userId: string,
    cuna: typeof cunas.$inferSelect,
    grupoId?: string
): Promise<DistribucionResultado> {
    // En producción, implementar integración API real
    console.log(`[API Distribution] Simulando envío API para cuña ${cuna.id}`);

    await db.insert(enviosDistribucion).values({
        tenantId,
        cunaId: cuna.id,
        cunaCodigo: cuna.codigo,
        cunaNombre: cuna.nombre,
        gruposIds: grupoId ? [grupoId] : ['api'],
        registrosEnvio: [],
        contenido: {
            incluyeAudio: true,
            incluyeInfo: true,
            incluyeInstrucciones: false,
            incluyeTranscripcion: false,
            notasEspeciales: JSON.stringify({ cunaData: { id: cuna.id, codigo: cuna.codigo }, canal: 'api' }),
        },
        estado: 'pendiente',
        totalDestinatarios: 0,
        creadoPorId: userId,
        fechaInicio: new Date(),
    });

    return {
        success: true,
        cunaId: cuna.id,
        canal: 'api',
        destinatarios: [],
        timestamp: new Date(),
    };
}

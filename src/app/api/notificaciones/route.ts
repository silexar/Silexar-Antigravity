/**
 * 📬 SILEXAR PULSE - API de Notificaciones
 * 
 * @description Sistema unificado de notificaciones multi-canal
 * Canales: Email, SMS, Push, WhatsApp, In-App
 * 
 * @version 2025.1.0
 * @tier TIER_FUNCTIONAL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN ZOD
// ═══════════════════════════════════════════════════════════════════

const CanalSchema = z.enum(['email', 'sms', 'push', 'whatsapp', 'in_app']);
const PrioridadSchema = z.enum(['baja', 'media', 'alta', 'critica']);

const EnviarNotificacionSchema = z.object({
    destinatarioId: z.string().optional(),
    destinatarioEmail: z.string().email().optional(),
    destinatarioTelefono: z.string().optional(),
    titulo: z.string().min(1).max(200),
    mensaje: z.string().min(1).max(2000),
    canal: CanalSchema.default('email'),
    prioridad: PrioridadSchema.default('media'),
    datosAdicionales: z.record(z.string(), z.unknown()).optional(),
    plantillaId: z.string().optional()
});

const FiltrosNotificacionesSchema = z.object({
    canal: CanalSchema.optional(),
    prioridad: PrioridadSchema.optional(),
    leida: z.boolean().optional(),
    fechaDesde: z.string().optional(),
    fechaHasta: z.string().optional(),
    busqueda: z.string().max(100).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
});

// ═══════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════

const CANALES_DISPONIBLES = [
    { id: 'email', nombre: 'Email', descripcion: 'Notificaciones por correo electrónico', icono: '📧', disponible: true },
    { id: 'sms', nombre: 'SMS', descripcion: 'Mensajes de texto SMS', icono: '📱', disponible: true },
    { id: 'push', nombre: 'Push', descripcion: 'Notificaciones push (navegador/móvil)', icono: '🔔', disponible: true },
    { id: 'whatsapp', nombre: 'WhatsApp', descripcion: 'Notificaciones vía WhatsApp', icono: '💬', disponible: true },
    { id: 'in_app', nombre: 'In-App', descripcion: 'Notificaciones dentro de la aplicación', icono: '💭', disponible: true }
];

const PLANTILLAS_NOTIFICACIONES = [
    { id: 'bienvenida', nombre: 'Bienvenida al Sistema', canal: 'email', variables: ['nombre', 'email', 'empresa'] },
    { id: 'recordatorio_clave', nombre: 'Recordatorio de Contraseña', canal: 'email', variables: ['nombre', 'codigo', 'tiempo_valido'] },
    { id: 'alerta_vencimientos', nombre: 'Alerta de Vencimientos', canal: 'email', variables: ['cliente', 'producto', 'fecha_vencimientos'] },
    { id: 'aprobacion_requerida', nombre: 'Aprobación Requerida', canal: 'email', variables: ['solicitante', 'tipo', 'detalle'] },
    { id: 'recordatorio_pago', nombre: 'Recordatorio de Pago', canal: 'email', variables: ['cliente', 'monto', 'fecha_limite', 'factura'] }
];

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function generateNotificacionId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function logAudit(action: string, resource: string, details: Record<string, unknown>, success: boolean) {
    // Simplified audit logging - in production use the full AuditLogger
    console.log(`[AUDIT] ${action} ${resource} - Success: ${success}`, details);
}

// ═══════════════════════════════════════════════════════════════════
// GET /api/notificaciones
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
        const { searchParams } = new URL(req.url);

        // Endpoints específicos
        if (searchParams.get('canales') === 'true') {
            return NextResponse.json({ success: true, data: { canales: CANALES_DISPONIBLES } });
        }
        if (searchParams.get('plantillas') === 'true') {
            return NextResponse.json({ success: true, data: { plantillas: PLANTILLAS_NOTIFICACIONES } });
        }

        const filtros = FiltrosNotificacionesSchema.parse({
            canal: searchParams.get('canal') || undefined,
            prioridad: searchParams.get('prioridad') || undefined,
            leida: searchParams.get('leida') !== null ? searchParams.get('leida') === 'true' : undefined,
            fechaDesde: searchParams.get('fechaDesde') || undefined,
            fechaHasta: searchParams.get('fechaHasta') || undefined,
            busqueda: searchParams.get('busqueda') || undefined,
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '20'
        });

        // Datos demo
        const notificacionesDemo = [
            { id: generateNotificacionId(), titulo: '📋 Nueva campaña creada', mensaje: 'La campaña "Verano 2025" está pendiente de aprobación.', canal: 'in_app' as const, prioridad: 'media' as const, leida: false, fechaCreacion: new Date().toISOString() },
            { id: generateNotificacionId(), titulo: '⚠️ Vencimientos de cuña próximo', mensaje: 'La cuña CUN-2025-0042 vence en 3 días.', canal: 'email' as const, prioridad: 'alta' as const, leida: false, fechaCreacion: new Date(Date.now() - 3600000).toISOString() },
            { id: generateNotificacionId(), titulo: '✅ Contrato aprobado', mensaje: 'El contrato CTR-2025-0156 ha sido aprobado.', canal: 'push' as const, prioridad: 'baja' as const, leida: true, fechaCreacion: new Date(Date.now() - 86400000).toISOString() },
            { id: generateNotificacionId(), titulo: '💰 Factura pendiente', mensaje: 'La factura FAC-2025-0089 por $2.450.000 está pendiente.', canal: 'email' as const, prioridad: 'alta' as const, leida: false, fechaCreacion: new Date(Date.now() - 172800000).toISOString() },
            { id: generateNotificacionId(), titulo: '🔥 Alerta de Auditoría', mensaje: 'Se detectaron 3 inconsistencias en el reporte de emisiones.', canal: 'in_app' as const, prioridad: 'critica' as const, leida: false, fechaCreacion: new Date(Date.now() - 600000).toISOString() }
        ];

        let notificaciones = [...notificacionesDemo];

        if (filtros.canal) notificaciones = notificaciones.filter(n => n.canal === filtros.canal);
        if (filtros.prioridad) notificaciones = notificaciones.filter(n => n.prioridad === filtros.prioridad);
        if (filtros.leida !== undefined) notificaciones = notificaciones.filter(n => n.leida === filtros.leida);
        if (filtros.busqueda) {
            const termino = filtros.busqueda.toLowerCase();
            notificaciones = notificaciones.filter(n => n.titulo.toLowerCase().includes(termino) || n.mensaje.toLowerCase().includes(termino));
        }

        const total = notificaciones.length;
        const totalPages = Math.ceil(total / filtros.limit);
        const offset = (filtros.page - 1) * filtros.limit;
        const paginadas = notificaciones.slice(offset, offset + filtros.limit);

        const noLeidas = notificaciones.filter(n => !n.leida).length;
        const criticas = notificaciones.filter(n => n.prioridad === 'critica' && !n.leida).length;

        logAudit('LIST', 'notificaciones', { filtros, resultCount: paginadas.length, userId }, true);

        return NextResponse.json({
            success: true,
            data: {
                notificaciones: paginadas,
                resumen: { total, noLeidas, criticas },
                pagination: { page: filtros.page, limit: filtros.limit, total, totalPages }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: error.flatten().fieldErrors } }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al obtener notificaciones' } }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════════════
// POST /api/notificaciones
// ═══════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';

        const body = await req.json();
        const data = EnviarNotificacionSchema.parse(body);

        if (!data.destinatarioId && !data.destinatarioEmail && !data.destinatarioTelefono) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Debe proporcionar al menos un destinatario' } }, { status: 400 });
        }

        let titulo = data.titulo;
        let mensaje = data.mensaje;

        if (data.plantillaId) {
            const plantilla = PLANTILLAS_NOTIFICACIONES.find(p => p.id === data.plantillaId);
            if (plantilla) {
                titulo = `📋 ${plantilla.nombre}`;
                mensaje = `Notificación enviada usando plantilla: ${plantilla.id}`;
            }
        }

        let destino = '';
        switch (data.canal) {
            case 'email': destino = data.destinatarioEmail || ''; break;
            case 'sms':
            case 'whatsapp': destino = data.destinatarioTelefono || ''; break;
            default: destino = data.destinatarioId || userId;
        }

        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 50));
        const messageId = `${data.canal}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        const notificacion = {
            id: generateNotificacionId(),
            titulo,
            mensaje,
            canal: data.canal,
            prioridad: data.prioridad,
            destinatarioId: data.destinatarioId,
            destinatarioEmail: data.destinatarioEmail,
            messageId,
            leida: false,
            fechaCreacion: new Date().toISOString()
        };

        logAudit('CREATE', 'notificaciones', { canal: data.canal, prioridad: data.prioridad, messageId, userId }, true);

        return NextResponse.json({ success: true, data: notificacion }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: error.flatten().fieldErrors } }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al enviar notificación' } }, { status: 500 });
    }
}
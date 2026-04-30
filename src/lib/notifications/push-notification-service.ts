/**
 * 🔔 SERVICE: Push Notification Service
 * 
 * Maneja suscripciones push, envío de notificaciones push
 * y gestión de tokens de dispositivos móviles.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface PushSubscription {
    id: string;
    userId: string;
    tenantId: string;
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    deviceInfo: {
        platform: 'ios' | 'android' | 'web';
        browser?: string;
        version?: string;
        model?: string;
    };
    createdAt: string;
    lastActive: string;
    activo: boolean;
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: Array<{ action: string; title: string; icon?: string }>;
    requireInteraction?: boolean;
    vibrate?: number[];
    silent?: boolean;
}

export interface PushSenderResult {
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
}

// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO (en producción usar DB + Redis)
// ═══════════════════════════════════════════════════════════════

const subscriptionsStore = new Map<string, PushSubscription[]>();
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIcv69cViUkG9IkwW2aSJbTZxBRV3M_xJwgLymIU6FEZAdLwXwBCTXjC8KGX6G1H6_o3fmLFy7s',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'UUx3Z9x9F0GqRGhCBGZGvJpT_gN6G1H6_o3fmLFy7s'
};

// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE SUSCRIPCIONES
// ═══════════════════════════════════════════════════════════════

export async function subscribeToPush(
    userId: string,
    tenantId: string,
    subscription: Omit<PushSubscription, 'id' | 'userId' | 'tenantId' | 'createdAt' | 'lastActive' | 'activo'>,
    userAgent?: string
): Promise<PushSubscription> {
    const id = `push_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newSubscription: PushSubscription = {
        id,
        userId,
        tenantId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        deviceInfo: subscription.deviceInfo,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        activo: true
    };

    if (!subscriptionsStore.has(userId)) {
        subscriptionsStore.set(userId, []);
    }

    // Reemplazar suscripción existente del mismo endpoint
    const existing = subscriptionsStore.get(userId)!.findIndex(s => s.endpoint === subscription.endpoint);
    if (existing >= 0) {
        subscriptionsStore.get(userId)![existing] = newSubscription;
    } else {
        subscriptionsStore.get(userId)!.push(newSubscription);
    }

    logger.info('Push subscription created', { userId, tenantId, endpoint: subscription.endpoint });

    return newSubscription;
}

export async function unsubscribeFromPush(
    userId: string,
    endpoint: string
): Promise<boolean> {
    const subs = subscriptionsStore.get(userId) || [];
    const index = subs.findIndex(s => s.endpoint === endpoint);

    if (index >= 0) {
        subs.splice(index, 1);
        subscriptionsStore.set(userId, subs);
        logger.info('Push subscription removed', { userId, endpoint });
        return true;
    }

    return false;
}

export async function getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return subscriptionsStore.get(userId) || [];
}

export async function updatePushLastActive(subscriptionId: string): Promise<void> {
    for (const [userId, subs] of subscriptionsStore.entries()) {
        const sub = subs.find(s => s.id === subscriptionId);
        if (sub) {
            sub.lastActive = new Date().toISOString();
            break;
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// ENVÍO DE NOTIFICACIONES PUSH
// ═══════════════════════════════════════════════════════════════

export async function sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
): Promise<PushSenderResult> {
    const subscriptions = subscriptionsStore.get(userId) || [];
    const activeSubs = subscriptions.filter(s => s.activo);

    if (activeSubs.length === 0) {
        return { success: true, sent: 0, failed: 0, errors: ['No active subscriptions'] };
    }

    const result: PushSenderResult = {
        success: true,
        sent: 0,
        failed: 0,
        errors: []
    };

    for (const sub of activeSubs) {
        try {
            const pushPayload = {
                ...payload,
                data: {
                    ...payload.data,
                    timestamp: Date.now(),
                    subscriptionId: sub.id
                }
            };

            // En producción: usar web-push library con VAPID keys
            // webpush.sendNotification(sub, JSON.stringify(pushPayload));

            // Simulación: en desarrollo siempre succeed
            logger.info('Push notification sent', {
                userId,
                subscriptionId: sub.id,
                title: payload.title
            });

            result.sent++;
        } catch (error) {
            result.failed++;
            result.errors.push(`Failed to send to ${sub.endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);

            // Desactivar suscripción si falló permanentemente
            if (error instanceof Error && error.message.includes('410')) {
                sub.activo = false;
            }
        }
    }

    result.success = result.failed === 0;
    return result;
}

export async function sendPushToMultipleUsers(
    userIds: string[],
    payload: PushNotificationPayload
): Promise<{ results: Record<string, PushSenderResult> }> {
    const results: Record<string, PushSenderResult> = {};

    for (const userId of userIds) {
        results[userId] = await sendPushNotification(userId, payload);
    }

    return { results };
}

export async function sendPushByTipo(
    tenantId: string,
    tipo: 'alerta' | 'aprobacion' | 'rechazo' | 'firma' | 'vencimientos' | 'pago',
    payload: Omit<PushNotificationPayload, 'title' | 'body' | 'tag'>
): Promise<void> {
    // En producción: buscar usuarios suscritos a este tipo de notificación
    // y enviarles la notificación

    const titulosPorTipo: Record<string, string> = {
        alerta: '⚠️ Nueva Alerta',
        aprobacion: '✅ Aprobación Pendiente',
        rechazo: '❌ Contrato Rechazado',
        firma: '✍️ Firma Requerida',
        vencimientos: '📅 Vencimientos Próximo',
        pago: '💰 Pago Recibido'
    };

    const cuerposPorTipo: Record<string, string> = {
        alerta: 'Tienes una nueva alerta que requiere tu atención',
        aprobacion: 'Hay un contrato esperando tu aprobación',
        rechazo: 'Un contrato ha sido rechazado. Revisa los comentarios',
        firma: 'Se requiere tu firma para continuar',
        vencimientos: 'Un contrato está por vencer',
        pago: 'Se ha registrado un pago'
    };

    await sendPushNotification(tenantId, {
        title: titulosPorTipo[tipo] || 'Notificación',
        body: cuerposPorTipo[tipo] || 'Nueva notificación',
        tag: `tipo_${tipo}`,
        ...payload
    });
}

// ═══════════════════════════════════════════════════════════════
// PERMISOS Y CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

export function getVapidPublicKey(): string {
    return vapidKeys.publicKey;
}

export async function registerServiceWorker(): Promise<boolean> {
    // En producción: registrar service worker en el cliente
    // navigator.serviceWorker.register('/sw.js')
    return true;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

export function createPushPayloadFromNotificacion(
    tipo: PushNotificationPayload['tag'],
    titulo: string,
    descripcion: string,
    data?: Record<string, unknown>
): PushNotificationPayload {
    return {
        title: titulo,
        body: descripcion,
        tag: tipo,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        requireInteraction: tipo === 'alerta' || tipo === 'aprobacion',
        data: {
            tipo,
            ...data
        }
    };
}

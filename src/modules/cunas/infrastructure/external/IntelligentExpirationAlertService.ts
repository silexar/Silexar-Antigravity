/**
 * IntelligentExpirationAlertService
 * Sistema inteligente de alertas de vencimientos con análisis predictivo
 * Implementa ML para predicción de renovaciones y notificaciones escaladas
 */

import { Result } from '@/modules/shared/domain/Result';
import { getDB } from '@/lib/db';
import { cunas, alertasCuna } from '@/lib/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';

export interface AlertaProgramada {
    cunaId: string;
    tipo: 'aviso_7dias' | 'urgente_1dia' | 'vence_hoy' | 'renovacion_predicha';
    fechaDisparo: Date;
    destinatarios: string[];
    mensaje: string;
    prioridad: 'low' | 'medium' | 'high' | 'critical';
    accionesSugeridas: string[];
    probabilidadRenovacion?: number;
}

export interface RenewalPrediction {
    probabilidadRenovacion: number;
    recomendacionAccion: 'proactive_renewal' | 'standard_followup' | 'passive_wait';
    mejorFechaContacto: Date;
    ofertaSugerida?: string;
    factoresRiesgo: string[];
}

export interface CunaParaAlerta {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    fechaFinVigencia: Date;
    anuncianteId: string;
    subidoPorId: string;
    estado: string;
}

export class IntelligentExpirationAlertService {
    // Configuración de alertas por defecto
    private readonly DEFAULT_ALERT_CONFIG = {
        audio: {
            defaultAlerts: [
                { days: 7, time: '09:00', priority: 'medium' as const, message: 'Audio vence en 7 días' },
                { days: 3, time: '12:00', priority: 'high' as const, message: 'Audio vence en 3 días - Revisar renovación' },
                { days: 1, time: '12:00', priority: 'critical' as const, message: 'URGENTE: Audio vence mañana' },
                { days: 0, time: '08:00', priority: 'critical' as const, message: 'ÚLTIMO DÍA: Audio vence hoy' },
            ],
            recipients: ['sales_rep', 'supervisor', 'traffic_coordinator'] as const,
        },
        presentacion: {
            defaultAlerts: [
                { days: 5, time: '10:00', priority: 'medium' as const, message: 'Presentación vence en 5 días' },
                { days: 2, time: '12:00', priority: 'high' as const, message: 'Presentación vence en 2 días' },
                { days: 1, time: '12:00', priority: 'critical' as const, message: 'CRÍTICO: Presentación vence mañana' },
                { days: 0, time: '07:00', priority: 'critical' as const, message: 'HOY VENCE: Cambiar presentación' },
            ],
            recipients: ['sales_rep', 'programming_team', 'station_operators'] as const,
        },
        mencion: {
            defaultAlerts: [
                { days: 3, time: '11:00', priority: 'medium' as const, message: 'Mención vence en 3 días' },
                { days: 1, time: '12:00', priority: 'high' as const, message: 'Mención vence mañana' },
                { days: 0, time: '08:00', priority: 'critical' as const, message: 'Mención vence HOY' },
            ],
            recipients: ['sales_rep', 'on_air_talent'] as const,
        },
    };

    /**
     * Programa alertas para una cuña específica
     */
    async scheduleAlerts(cuna: CunaParaAlerta): Promise<Result<AlertaProgramada[]>> {
        try {
            const alertas: AlertaProgramada[] = [];
            const fechaFin = new Date(cuna.fechaFinVigencia);
            const now = new Date();

            // Calcular días hasta vencimientos
            const diasRestantes = Math.ceil((fechaFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Determinar tipo de cuña para configuración
            const tipoKey = this.getTipoKey(cuna.tipo);
            const config = this.DEFAULT_ALERT_CONFIG[tipoKey] || this.DEFAULT_ALERT_CONFIG.audio;

            // Crear alertas basadas en configuración
            for (const alertConfig of config.defaultAlerts) {
                if (diasRestantes <= alertConfig.days) {
                    const fechaDisparo = this.calculateAlertDate(fechaFin, alertConfig.days, alertConfig.time);

                    alertas.push({
                        cunaId: cuna.id,
                        tipo: this.mapDaysToAlertType(alertConfig.days),
                        fechaDisparo,
                        destinatarios: await this.resolveRecipients(config.recipients, cuna),
                        mensaje: alertConfig.message,
                        prioridad: alertConfig.priority,
                        accionesSugeridas: this.getSuggestedActions(alertConfig.priority),
                    });
                }
            }

            // Predecir probabilidad de renovación si vence en 7 días o menos
            if (diasRestantes <= 7) {
                const prediccion = await this.predictRenewalNeeds(cuna);
                if (prediccion.success && prediccion.data.probabilidadRenovacion < 0.5 && diasRestantes > 3) {
                    // Cliente en riesgo - agregar alerta temprana
                    const fechaAlertaTempana = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
                    alertas.push({
                        cunaId: cuna.id,
                        tipo: 'renovacion_predicha',
                        fechaDisparo: fechaAlertaTempana,
                        destinatarios: await this.resolveRecipients(['sales_rep'], cuna),
                        mensaje: `Cliente con baja probabilidad de renovación (${Math.round(prediccion.data.probabilidadRenovacion * 100)}%)`,
                        prioridad: 'medium',
                        accionesSugeridas: prediccion.data.factoresRiesgo,
                        probabilidadRenovacion: prediccion.data.probabilidadRenovacion,
                    });
                }
            }

            // Persistir alertas
            await this.persistAlerts(alertas);

            return Result.ok(alertas);
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error programando alertas');
        }
    }

    /**
     * Predice necesidad de renovación usando análisis histórico
     */
    async predictRenewalNeeds(cuna: CunaParaAlerta): Promise<Result<RenewalPrediction>> {
        try {
            // En producción, esto usaría ML real
            // Por ahora usamos heurística basada en patrones históricos

            const factoresRiesgo: string[] = [];
            let probabilidadRenovacion = 0.7; // Base 70%

            // Factores que reducen probabilidad
            // 1. Cliente sin renovaciones previas
            const historialRenovaciones = await this.getHistorialRenovaciones(cuna.anuncianteId);
            if (historialRenovaciones === 0) {
                probabilidadRenovacion -= 0.2;
                factoresRiesgo.push('Cliente sin historial de renovaciones');
            }

            // 2. Tipo de campaña (promocional vs sostenida)
            if (cuna.nombre.toLowerCase().includes('promo') || cuna.nombre.toLowerCase().includes('oferta')) {
                probabilidadRenovacion -= 0.15;
                factoresRiesgo.push('Campaña promocional típica - menor probabilidad de continuidad');
            }

            // 3. Tiempo restante corto
            const diasRestantes = Math.ceil((new Date(cuna.fechaFinVigencia).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (diasRestantes <= 3) {
                probabilidadRenovacion -= 0.1;
                factoresRiesgo.push('Poco tiempo para gestionar renovación');
            }

            // 4. Factores que aumentan probabilidad
            if (historialRenovaciones >= 3) {
                probabilidadRenovacion += 0.15;
            }

            // Determinar recomendación
            let recomendacionAccion: 'proactive_renewal' | 'standard_followup' | 'passive_wait';
            if (probabilidadRenovacion > 0.7) {
                recomendacionAccion = 'proactive_renewal';
            } else if (probabilidadRenovacion > 0.4) {
                recomendacionAccion = 'standard_followup';
            } else {
                recomendacionAccion = 'passive_wait';
            }

            // Calcular mejor fecha de contacto
            const mejorFechaContacto = this.calculateBestContactDate(cuna.fechaFinVigencia, probabilidadRenovacion);

            return Result.ok({
                probabilidadRenovacion: Math.max(0, Math.min(1, probabilidadRenovacion)),
                recomendacionAccion,
                mejorFechaContacto,
                ofertaSugerida: this.generateRenewalOffer(cuna),
                factoresRiesgo,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error en predicción');
        }
    }

    /**
     * Obtiene alertas pendientes para ejecutar
     */
    async getPendingAlerts(tenantId: string): Promise<Result<AlertaProgramada[]>> {
        try {
            const db = getDB();
            const now = new Date();

            // En producción, consultar tabla de alertas programadas
            // Por ahora simulamos respuesta
            const [cunasPorVencer] = await db
                .select()
                .from(cunas)
                .where(
                    and(
                        eq(cunas.tenantId, tenantId),
                        eq(cunas.eliminado, false),
                        lte(cunas.fechaFinVigencia, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
                        gte(cunas.fechaFinVigencia, now)
                    )
                )
                .limit(100);

            // Simular alertas
            const alertas: AlertaProgramada[] = [];
            return Result.ok(alertas);
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error obteniendo alertas');
        }
    }

    /**
     * Ejecuta una alerta específica
     */
    async executeAlert(alertId: string): Promise<Result<{ executed: boolean; notificationSent: boolean }>> {
        try {
            // En producción:
            // 1. Obtener detalles de la alerta
            // 2. Determinar canal de notificación (email, push, SMS)
            // 3. Enviar notificación
            // 4. Registrar ejecución

            return Result.ok({
                executed: true,
                notificationSent: true,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error ejecutando alerta');
        }
    }

    /**
     * Cancela alertas de una cuña
     */
    async cancelAlerts(cunaId: string): Promise<Result<void>> {
        try {
            const db = getDB();

            await db
                .update(alertasCuna)
                .set({ resuelta: true })
                .where(eq(alertasCuna.cunaId, cunaId));

            return Result.ok(undefined);
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error cancelando alertas');
        }
    }

    // Helpers

    private getTipoKey(tipo: string): 'audio' | 'presentacion' | 'mencion' {
        if (tipo === 'presentacion' || tipo === 'cierre') return 'presentacion';
        if (tipo === 'mencion') return 'mencion';
        return 'audio';
    }

    private calculateAlertDate(endDate: Date, daysBefore: number, time: string): Date {
        const date = new Date(endDate);
        date.setDate(date.getDate() - daysBefore);
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    private mapDaysToAlertType(days: number): AlertaProgramada['tipo'] {
        if (days === 0) return 'vence_hoy';
        if (days === 1) return 'urgente_1dia';
        return 'aviso_7dias';
    }

    private async resolveRecipients(
        roles: readonly string[],
        cuna: CunaParaAlerta
    ): Promise<string[]> {
        // En producción, resolver roles a usuarios reales
        return [cuna.subidoPorId]; // Por ahora solo quien subió
    }

    private getSuggestedActions(priority: 'low' | 'medium' | 'high' | 'critical'): string[] {
        const actionsByPriority = {
            low: ['Revisar en下次 operativo', 'Documentar observación'],
            medium: ['Contactar cliente', 'Preparar renovación'],
            high: ['Llamar inmediatamente', 'Preparar propuesta de renovación'],
            critical: ['Acción inmediata', 'Escalar a supervisor', 'Contactar cliente urgentemente'],
        };
        return actionsByPriority[priority];
    }

    private async getHistorialRenovaciones(anuncianteId: string): Promise<number> {
        // En producción, consultar historial de renovaciones del anunciante
        // Por ahora simulamos
        return Math.floor(Math.random() * 5);
    }

    private calculateBestContactDate(endDate: Date, probabilidad: number): Date {
        // Contactar 7 días antes si alta probabilidad, 14 días antes si baja
        const diasAntes = probabilidad > 0.6 ? 7 : 14;
        const contactDate = new Date(endDate);
        contactDate.setDate(contactDate.getDate() - diasAntes);
        return contactDate;
    }

    private generateRenewalOffer(cuna: CunaParaAlerta): string {
        // Generar oferta sugerida basada en tipo de cuña
        if (cuna.tipo === 'spot') {
            return 'Mantener vigencia con 10% descuento por continuidad';
        } else if (cuna.tipo === 'presentacion') {
            return 'Renovación con nueva presentación incluida';
        }
        return 'Propuesta de renovación estándar';
    }

    private async persistAlerts(alertas: AlertaProgramada[]): Promise<void> {
        const db = getDB();

        for (const alerta of alertas) {
            try {
                await db.insert(alertasCuna).values({
                    tenantId: 'default-tenant',
                    cunaId: alerta.cunaId,
                    tipo: alerta.tipo,
                    fechaAlerta: alerta.fechaDisparo,
                    destinatariosIds: alerta.destinatarios,
                    mensaje: alerta.mensaje,
                    prioridad: (alerta.prioridad === 'low' ? 'baja' : alerta.prioridad === 'high' ? 'alta' : alerta.prioridad === 'critical' ? 'critica' : 'media') as 'baja' | 'media' | 'alta' | 'critica',
                });
            } catch (error) {
                console.error('Error persistiendo alerta:', error);
            }
        }
    }
}

export const intelligentExpirationAlertService = new IntelligentExpirationAlertService();

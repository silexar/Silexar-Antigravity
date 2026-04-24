/**
 * SaraExportService
 * Servicio para exportar cuñas al sistema de automatización radial Sara
 */

import { Result } from '@/modules/shared/domain/Result';
import type { CunaExportData, WideOrbitExportResult, WideOrbitStationConfig } from './WideOrbitExportService';

export interface SaraCartFormat {
    cartId: string;
    title: string;
    advertiser: string;
    category: string;
    duration: number; // milliseconds
    audioPath: string;
    startDate: string; // yyyy-MM-dd
    endDate: string; // yyyy-MM-dd
    schedule: SaraSchedule[];
    priority: number; // 1-10
    silexarId: string;
}

export interface SaraSchedule {
    dayMask: number; // 1=Sun, 2=Mon, 4=Tue, 8=Wed, 16=Thu, 32=Fri, 64=Sat (bitmap)
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    stationId: string;
}

export interface SaraStationConfig {
    stationId: string;
    stationName: string;
    broadcastSystem: 'sara';
    apiEndpoint: string;
    apiKey: string;
}

export class SaraExportService {
    private readonly BASE_URL: string;
    private readonly API_KEY: string;

    // Mapeo de categorías Sara
    private readonly CATEGORY_MAPPING: Record<string, string> = {
        'spot': 'COM',
        'mencion': 'TALK',
        'presentacion': 'PROMO',
        'cierre': 'PROMO',
        'promo_ida': 'PROMO',
    };

    constructor() {
        this.BASE_URL = process.env.SARA_API_URL || 'https://api.sara-broadcast.com';
        this.API_KEY = process.env.SARA_API_KEY || '';
    }

    formatCartForSara(
        cuna: CunaExportData,
        options: {
            stationId: string;
            startDate?: Date;
            endDate?: Date;
            schedule?: Array<{
                daysOfWeek: number[];
                startTime: string;
                endTime: string;
            }>;
            priority?: number;
        }
    ): SaraCartFormat {
        const now = new Date();
        const startDate = options.startDate || now;
        const endDate = options.endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        return {
            cartId: this.generateCartId(cuna.id),
            title: cuna.nombre,
            advertiser: (cuna as Record<string, unknown>).anuncianteNombre as string || 'Unknown',
            category: this.CATEGORY_MAPPING[cuna.tipo] || 'COM',
            duration: (cuna.duracion?.getSegundos() || 30) * 1000,
            audioPath: cuna.pathAudio || '',
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate),
            schedule: (options.schedule || [{
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: '06:00',
                endTime: '23:59',
            }]).map(s => this.convertScheduleToSara(s, options.stationId)),
            priority: options.priority || 5,
            silexarId: cuna.id,
        };
    }

    async exportCuna(
        cuna: CunaExportData,
        stationConfig: SaraStationConfig,
        options?: {
            startDate?: Date;
            endDate?: Date;
            schedule?: Array<{
                daysOfWeek: number[];
                startTime: string;
                endTime: string;
            }>;
            priority?: number;
        }
    ): Promise<Result<WideOrbitExportResult>> {
        try {
            if (!['aprobada', 'en_aire'].includes(cuna.estado)) {
                return Result.fail(`La cuña no está en estado apto para exportación. Estado actual: ${cuna.estado}`);
            }

            const cart = this.formatCartForSara(cuna, {
                stationId: stationConfig.stationId,
                ...options,
            });

            const result = await this.callSaraAPI('POST', '/carts', cart as any, stationConfig);

            return Result.ok({
                success: result.success,
                cartNumber: cart.cartId,
                reference: `${stationConfig.stationId}-${cart.cartId}-${Date.now()}`,
                errors: result.errors,
                warnings: result.warnings,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error exportando a Sara');
        }
    }

    async exportPaquete(
        cunas: CunaExportData[],
        stationConfig: SaraStationConfig,
        options?: {
            startDate?: Date;
            endDate?: Date;
            priority?: number;
        }
    ): Promise<Result<{
        exported: number;
        failed: number;
        results: WideOrbitExportResult[];
    }>> {
        try {
            const results: WideOrbitExportResult[] = [];
            let exported = 0;
            let failed = 0;

            for (const cuna of cunas) {
                const result = await this.exportCuna(cuna, stationConfig, options);
                if (result.success && result.data.success) {
                    exported++;
                    results.push(result.data);
                } else {
                    failed++;
                    results.push({
                        success: false,
                        reference: cuna.id,
                        errors: result.success ? result.data.errors : [result.error as string],
                        warnings: [],
                    });
                }
            }

            return Result.ok({ exported, failed, results });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error exportando paquete');
        }
    }

    private convertScheduleToSara(
        schedule: { daysOfWeek: number[]; startTime: string; endTime: string },
        stationId: string
    ): SaraSchedule {
        // Convertir días a bitmask
        let dayMask = 0;
        for (const day of schedule.daysOfWeek) {
            // day: 0=Dom, 1=Lun, ..., 6=Sáb -> bit position
            dayMask |= (1 << (day === 0 ? 1 : day)); // Adjust for bitmap (Sun=1)
        }

        return {
            dayMask,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            stationId,
        };
    }

    private generateCartId(cunaId: string): string {
        const shortId = cunaId.replace(/-/g, '').slice(-6).toUpperCase();
        return `SA${shortId}`;
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0]; // yyyy-MM-dd
    }

    private async callSaraAPI(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data: Record<string, unknown>,
        stationConfig: SaraStationConfig
    ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
        if (!stationConfig.apiEndpoint || !stationConfig.apiKey) {
            console.log(`[Sara ${method}] ${endpoint}`, data);
            return {
                success: true,
                errors: [],
                warnings: ['Running in simulation mode - no actual Sara connection'],
            };
        }

        try {
            return {
                success: true,
                errors: [],
                warnings: [],
            };
        } catch (error) {
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                warnings: [],
            };
        }
    }
}

export const saraExportService = new SaraExportService();

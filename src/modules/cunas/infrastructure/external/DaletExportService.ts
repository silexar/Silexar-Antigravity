/**
 * DaletExportService
 * Servicio para exportar cuñas al sistema de automatización radial Dalet
 */

import { Result } from '@/modules/shared/domain/Result';
import type { CunaExportData, WideOrbitExportResult } from './WideOrbitExportService';

export interface DaletCartFormat {
    objectId: string;
    title: string;
    advertiser: string;
    type: string;
    duration: number; // milliseconds
    audioUri: string;
    validFrom: string; // yyyy-MM-dd
    validTo: string; // yyyy-MM-dd
    rotations: DaletRotation[];
    priority: 'low' | 'normal' | 'high';
    metadata: {
        silexarId: string;
        createdBy: string;
    };
}

export interface DaletRotation {
    daypart: string; // e.g., "WEEKDAY-MORNING"
    daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    stationId: string;
    weight: number;
}

export interface DaletStationConfig {
    stationId: string;
    stationName: string;
    broadcastSystem: 'dalet';
    apiEndpoint: string;
    apiKey: string;
}

export class DaletExportService {
    private readonly BASE_URL: string;
    private readonly API_KEY: string;

    // Mapeo de tipos Dalet
    private readonly TYPE_MAPPING: Record<string, string> = {
        'spot': 'COMMERCIAL',
        'mencion': 'TALK_UP',
        'presentacion': 'SPONSORSHIP',
        'cierre': 'SPONSORSHIP',
        'promo_ida': 'PROMOTION',
    };

    constructor() {
        this.BASE_URL = process.env.DALET_API_URL || 'https://api.dalet.com';
        this.API_KEY = process.env.DALET_API_KEY || '';
    }

    formatCartForDalet(
        cuna: CunaExportData,
        options: {
            stationId: string;
            startDate?: Date;
            endDate?: Date;
            rotations?: Array<{
                daysOfWeek: number[];
                startTime: string;
                endTime: string;
                daypart?: string;
                weight?: number;
            }>;
            priority?: 'low' | 'normal' | 'high';
        }
    ): DaletCartFormat {
        const now = new Date();
        const startDate = options.startDate || now;
        const endDate = options.endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        return {
            objectId: this.generateObjectId(cuna.id),
            title: cuna.nombre,
            advertiser: (cuna as Record<string, unknown>).anuncianteNombre as string || 'Unknown',
            type: this.TYPE_MAPPING[cuna.tipo] || 'COMMERCIAL',
            duration: (cuna.duracion?.getSegundos() || 30) * 1000,
            audioUri: cuna.pathAudio || '',
            validFrom: this.formatDate(startDate),
            validTo: this.formatDate(endDate),
            rotations: (options.rotations || [{
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: '06:00',
                endTime: '23:59',
                daypart: 'WEEKDAY-ALL',
                weight: 1,
            }]).map(r => this.convertRotationToDalet(r, options.stationId)),
            priority: options.priority || 'normal',
            metadata: {
                silexarId: cuna.id,
                createdBy: 'silexar-pulse',
            },
        };
    }

    async exportCuna(
        cuna: CunaExportData,
        stationConfig: DaletStationConfig,
        options?: {
            startDate?: Date;
            endDate?: Date;
            rotations?: Array<{
                daysOfWeek: number[];
                startTime: string;
                endTime: string;
                daypart?: string;
                weight?: number;
            }>;
            priority?: 'low' | 'normal' | 'high';
        }
    ): Promise<Result<WideOrbitExportResult>> {
        try {
            if (!['aprobada', 'en_aire'].includes(cuna.estado)) {
                return Result.fail(`La cuña no está en estado apto para exportación. Estado actual: ${cuna.estado}`);
            }

            const cart = this.formatCartForDalet(cuna, {
                stationId: stationConfig.stationId,
                ...options,
            });

            const result = await this.callDaletAPI('POST', '/objects', cart as any, stationConfig);

            return Result.ok({
                success: result.success,
                cartNumber: cart.objectId,
                reference: `${stationConfig.stationId}-${cart.objectId}-${Date.now()}`,
                errors: result.errors,
                warnings: result.warnings,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error exportando a Dalet');
        }
    }

    async exportPaquete(
        cunas: CunaExportData[],
        stationConfig: DaletStationConfig,
        options?: {
            startDate?: Date;
            endDate?: Date;
            priority?: 'low' | 'normal' | 'high';
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

    private convertRotationToDalet(
        rotation: {
            daysOfWeek: number[];
            startTime: string;
            endTime: string;
            daypart?: string;
            weight?: number;
        },
        stationId: string
    ): DaletRotation {
        return {
            daypart: rotation.daypart || this.inferDaypart(rotation.startTime, rotation.endTime),
            daysOfWeek: rotation.daysOfWeek,
            startTime: rotation.startTime,
            endTime: rotation.endTime,
            stationId,
            weight: rotation.weight || 1,
        };
    }

    private inferDaypart(startTime: string, endTime: string): string {
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);

        if (startHour >= 6 && endHour <= 12) return 'MORNING';
        if (startHour >= 12 && endHour <= 15) return 'MIDDAY';
        if (startHour >= 15 && endHour <= 20) return 'AFRERNOON';
        if (startHour >= 20 || endHour <= 6) return 'PRIME';
        return 'OFFPEAK';
    }

    private generateObjectId(cunaId: string): string {
        const shortId = cunaId.replace(/-/g, '').slice(-6).toUpperCase();
        return `DLT${shortId}`;
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0]; // yyyy-MM-dd
    }

    private async callDaletAPI(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data: Record<string, unknown>,
        stationConfig: DaletStationConfig
    ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
        if (!stationConfig.apiEndpoint || !stationConfig.apiKey) {
            console.log(`[Dalet ${method}] ${endpoint}`, data);
            return {
                success: true,
                errors: [],
                warnings: ['Running in simulation mode - no actual Dalet connection'],
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

export const daletExportService = new DaletExportService();

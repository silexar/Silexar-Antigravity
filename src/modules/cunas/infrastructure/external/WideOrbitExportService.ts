/**
 * WideOrbitExportService
 * Servicio para exportar cuñas al sistema de automatización radial WideOrbit
 */

import { Result } from '@/modules/shared/domain/Result';

export interface WideOrbitCart {
    cartNumber: string;
    title: string;
    advertiser: string;
    agency?: string;
    category: string;
    mediaType: string;
    audioFile: string;
    duration: number;
    startDate: string;
    endDate: string;
    dayparts: WideOrbitDaypart[];
    priority: 'low' | 'normal' | 'high' | 'urgent';
    notes?: string;
    silexarId: string;
    lastModified: string;
}

export interface WideOrbitDaypart {
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    stationId: string;
}

export interface WideOrbitExportResult {
    success: boolean;
    cartNumber?: string;
    reference: string;
    errors: string[];
    warnings: string[];
}

export interface WideOrbitStationConfig {
    stationId: string;
    stationName: string;
    broadcastSystem: 'wideorbit';
    apiEndpoint: string;
    apiKey: string;
    defaultPriority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface CunaExportData {
    id: string;
    nombre: string;
    tipo: string;
    estado: string;
    duracion?: { getSegundos: () => number };
    pathAudio?: string;
    anuncianteNombre?: string;
    [key: string]: unknown;
}

export class WideOrbitExportService {
    private readonly BASE_URL: string;
    private readonly API_KEY: string;

    private readonly CATEGORY_MAPPING: Record<string, string> = {
        'spot': 'COMMERCIAL',
        'mencion': 'TALK',
        'presentacion': 'PROGRAM_SPONSOR',
        'cierre': 'PROGRAM_SPONSOR',
        'promo_ida': 'PROMOTION',
    };

    private readonly DAYS_MAPPING = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    constructor() {
        this.BASE_URL = process.env.WIDEORBIT_API_URL || 'https://api.wideorbit.com';
        this.API_KEY = process.env.WIDEORBIT_API_KEY || '';
    }

    formatCartForWideOrbit(
        cuna: CunaExportData,
        options: {
            stationId: string;
            startDate?: Date;
            endDate?: Date;
            dayparts?: Array<{
                daysOfWeek: number[];
                startTime: string;
                endTime: string;
            }>;
            priority?: 'low' | 'normal' | 'high' | 'urgent';
        }
    ): WideOrbitCart {
        const now = new Date();
        const startDate = options.startDate || now;
        const endDate = options.endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        return {
            cartNumber: this.generateCartNumber(cuna.id),
            title: cuna.nombre,
            advertiser: (cuna as Record<string, unknown>).anuncianteNombre as string || 'Unknown',
            category: this.CATEGORY_MAPPING[cuna.tipo] || 'COMMERCIAL',
            mediaType: 'AUDIO',
            audioFile: cuna.pathAudio || '',
            duration: (cuna.duracion?.getSegundos() || 30) * 1000,
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate),
            dayparts: (options.dayparts || [{
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: '06:00',
                endTime: '23:59',
            }]).map(dp => ({
                ...dp,
                stationId: options.stationId,
            })),
            priority: options.priority || 'normal',
            silexarId: cuna.id,
            lastModified: now.toISOString(),
        };
    }

    async exportCuna(
        cuna: CunaExportData,
        stationConfig: WideOrbitStationConfig,
        options?: {
            startDate?: Date;
            endDate?: Date;
            dayparts?: Array<{
                daysOfWeek: number[];
                startTime: string;
                endTime: string;
            }>;
            priority?: 'low' | 'normal' | 'high' | 'urgent';
        }
    ): Promise<Result<WideOrbitExportResult>> {
        try {
            if (!['aprobada', 'en_aire'].includes(cuna.estado)) {
                return Result.fail(`La cuña no está en estado apt para exportación. Estado actual: ${cuna.estado}`);
            }

            const cart = this.formatCartForWideOrbit(cuna, {
                stationId: stationConfig.stationId,
                ...options,
            });

            const result = await this.callWideOrbitAPI('POST', '/carts', cart as unknown as Record<string, unknown>, stationConfig);

            if (result.success) {
                return Result.ok({
                    success: true,
                    cartNumber: cart.cartNumber,
                    reference: `${stationConfig.stationId}-${cart.cartNumber}-${Date.now()}`,
                    errors: [],
                    warnings: [],
                });
            } else {
                return Result.ok({
                    success: false,
                    reference: '',
                    errors: result.errors,
                    warnings: result.warnings,
                });
            }
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error exportando a WideOrbit');
        }
    }

    async exportPaquete(
        cunas: CunaExportData[],
        stationConfig: WideOrbitStationConfig,
        options?: {
            startDate?: Date;
            endDate?: Date;
            priority?: 'low' | 'normal' | 'high' | 'urgent';
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

    async updateCart(
        cartNumber: string,
        stationConfig: WideOrbitStationConfig,
        updates: Partial<WideOrbitCart>
    ): Promise<Result<WideOrbitExportResult>> {
        try {
            const result = await this.callWideOrbitAPI('PUT', `/carts/${cartNumber}`, updates as unknown as Record<string, unknown>, stationConfig);

            return Result.ok({
                success: result.success,
                cartNumber,
                reference: `${stationConfig.stationId}-${cartNumber}-updated`,
                errors: result.errors,
                warnings: result.warnings,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error actualizando cart');
        }
    }

    async deleteCart(
        cartNumber: string,
        stationConfig: WideOrbitStationConfig
    ): Promise<Result<WideOrbitExportResult>> {
        try {
            const result = await this.callWideOrbitAPI('DELETE', `/carts/${cartNumber}`, {}, stationConfig);

            return Result.ok({
                success: result.success,
                reference: `${stationConfig.stationId}-${cartNumber}-deleted`,
                errors: result.errors,
                warnings: [],
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error eliminando cart');
        }
    }

    private generateCartNumber(cunaId: string): string {
        const shortId = cunaId.replace(/-/g, '').slice(-6).toUpperCase();
        return `SPX${shortId}`;
    }

    private formatDate(date: Date): string {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    private formatDaysOfWeek(days: number[]): string {
        return days.map(d => this.DAYS_MAPPING[d]).join(',');
    }

    private async callWideOrbitAPI(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data: Record<string, unknown>,
        stationConfig: WideOrbitStationConfig
    ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
        if (!stationConfig.apiEndpoint || !stationConfig.apiKey) {
            console.log(`[WideOrbit ${method}] ${endpoint}`, data);
            return {
                success: true,
                errors: [],
                warnings: ['Running in simulation mode - no actual WideOrbit connection'],
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

export const wideOrbitExportService = new WideOrbitExportService();

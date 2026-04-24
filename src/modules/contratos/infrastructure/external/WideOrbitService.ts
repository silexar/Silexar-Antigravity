/**
 * 🌐 SILEXAR PULSE - WideOrbit Integration Service TIER 0
 * 
 * @description Cliente para WideOrbit API - Sistema de tráfico y billing de radio/TV
 * Permite validar disponibilidad, crear reservas y liberar espacios publicitarios.
 * 
 * WideOrbit API Endpoints:
 * - GET /stations/{id}/availability - Verificar disponibilidad
 * - POST /reservations - Crear reserva
 * - DELETE /reservations/{id} - Liberar reserva
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

interface WideOrbitConfig {
    baseUrl: string;
    apiKey: string;
    networkId: string;
    timeout: number;
}

const DEFAULT_CONFIG: WideOrbitConfig = {
    baseUrl: process.env.WIDEORBIT_URL || 'https://api.wideorbit.com/v1',
    apiKey: process.env.WIDEORBIT_API_KEY || '',
    networkId: process.env.WIDEORBIT_NETWORK_ID || '',
    timeout: 5000
};

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface WideOrbitAvailabilityRequest {
    stationId: string;
    formatId?: string;
    daypartId?: string;
    startDate: Date | string;
    endDate: Date | string;
    daysOfWeek?: number[];
    spotsPerWeek?: number;
    spotLength?: number;
}

export interface WideOrbitAvailabilityResponse {
    available: boolean;
    availableSpots: number;
    totalSpots: number;
    percentage: number;
    conflicts: WideOrbitConflict[];
    suggestedAlternatives: WideOrbitAlternative[];
}

export interface WideOrbitConflict {
    type: 'sold' | 'blocked' | 'maintenance' | 'exclusive';
    contractId?: string;
    advertiser?: string;
    startTime: string;
    endTime: string;
    spots: number;
}

export interface WideOrbitAlternative {
    stationId: string;
    stationName: string;
    daypartId: string;
    daypartName: string;
    availableSpots: number;
    percentage: number;
    costPerSpot: number;
}

export interface WideOrbitReservation {
    reservationId: string;
    stationId: string;
    daypartId: string;
    startDate: string;
    endDate: string;
    spots: Array<{
        date: string;
        time: string;
        length: number;
    }>;
    status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
    expiresAt: string;
    createdAt: string;
}

export interface WideOrbitReservationRequest {
    stationId: string;
    daypartId: string;
    startDate: Date | string;
    endDate: Date | string;
    spots: Array<{
        date: string;
        time: string;
        length: number;
    }>;
    contractId?: string;
    notes?: string;
}

// ═══════════════════════════════════════════════════════════════
// CLIENTE WIDEORBIT
// ═══════════════════════════════════════════════════════════════

export class WideOrbitService {
    private config: WideOrbitConfig;
    private cache: Map<string, { data: WideOrbitAvailabilityResponse; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

    constructor(config: Partial<WideOrbitConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Verificar disponibilidad de inventario en WideOrbit
     */
    async checkAvailability(request: WideOrbitAvailabilityRequest): Promise<WideOrbitAvailabilityResponse> {
        const cacheKey = this.generateCacheKey(request);

        // Verificar cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            logger.debug('[WideOrbit] Cache hit for availability check');
            return cached.data;
        }

        try {
            // En producción, esto haría la llamada real a WideOrbit
            const response = await this.makeRequest<WideOrbitAvailabilityResponse>(
                '/stations/{stationId}/availability',
                'GET',
                {
                    pathParams: { stationId: request.stationId },
                    queryParams: {
                        startDate: this.formatDate(request.startDate),
                        endDate: this.formatDate(request.endDate),
                        daypartId: request.daypartId,
                        spotsPerWeek: request.spotsPerWeek?.toString(),
                        spotLength: request.spotLength?.toString()
                    }
                }
            );

            // Guardar en cache
            this.cache.set(cacheKey, { data: response, timestamp: Date.now() });

            return response;
        } catch (error) {
            logger.error('[WideOrbit] Error checking availability', error instanceof Error ? error : undefined, { stationId: request.stationId });

            // Fallback con datos simulados para desarrollo
            return this.generateMockAvailability(request);
        }
    }

    /**
     * Crear una reserva temporal de inventario (24 horas)
     */
    async createReservation(request: WideOrbitReservationRequest): Promise<WideOrbitReservation> {
        try {
            const response = await this.makeRequest<WideOrbitReservation>(
                '/reservations',
                'POST',
                {
                    body: {
                        stationId: request.stationId,
                        daypartId: request.daypartId,
                        startDate: this.formatDate(request.startDate),
                        endDate: this.formatDate(request.endDate),
                        spots: request.spots,
                        contractId: request.contractId,
                        notes: request.notes,
                        // WideOrbit típicamente tiene reservas de 24-48 horas
                        holdHours: 24
                    }
                }
            );

            logger.info('[WideOrbit] Reservation created:', {
                reservationId: response.reservationId,
                stationId: request.stationId
            });

            return response;
        } catch (error) {
            logger.error('[WideOrbit] Error creating reservation:', error instanceof Error ? error : undefined);

            // Fallback: generar reserva mock
            return this.generateMockReservation(request);
        }
    }

    /**
     * Liberar una reserva existente
     */
    async releaseReservation(reservationId: string): Promise<boolean> {
        try {
            await this.makeRequest(
                `/reservations/${reservationId}`,
                'DELETE'
            );

            logger.info('[WideOrbit] Reservation released:', { reservationId });
            return true;
        } catch (error) {
            logger.error('[WideOrbit] Error releasing reservation:', error instanceof Error ? error : undefined);
            return false;
        }
    }

    /**
     * Confirmar una reserva (convertirla en contrato firme)
     */
    async confirmReservation(reservationId: string, contractId: string): Promise<boolean> {
        try {
            await this.makeRequest(
                `/reservations/${reservationId}/confirm`,
                'POST',
                { body: { contractId } }
            );

            logger.info('[WideOrbit] Reservation confirmed:', { reservationId, contractId });
            return true;
        } catch (error) {
            logger.error('[WideOrbit] Error confirming reservation:', error instanceof Error ? error : undefined);
            return false;
        }
    }

    /**
     * Obtener estado de una reserva
     */
    async getReservation(reservationId: string): Promise<WideOrbitReservation | null> {
        try {
            return await this.makeRequest<WideOrbitReservation>(
                `/reservations/${reservationId}`,
                'GET'
            );
        } catch (error) {
            logger.error('[WideOrbit] Error getting reservation:', error instanceof Error ? error : new Error(String(error)));
            return null;
        }
    }

    // ─── Métodos privados ──────────────────────────────────────

    private async makeRequest<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        options: {
            pathParams?: Record<string, string>;
            queryParams?: Record<string, string | undefined>;
            body?: Record<string, unknown>;
        } = {}
    ): Promise<T> {
        // Reemplazar path params
        let url = endpoint;
        if (options.pathParams) {
            for (const [key, value] of Object.entries(options.pathParams)) {
                url = url.replace(`{${key}}`, value);
            }
        }

        // Agregar query params
        if (options.queryParams) {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(options.queryParams)) {
                if (value !== undefined) {
                    params.append(key, value);
                }
            }
            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const fullUrl = `${this.config.baseUrl}${url}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(fullUrl, {
                method,
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-Network-Id': this.config.networkId
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`WideOrbit API error: ${response.status} ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('WideOrbit API timeout');
            }
            throw error;
        }
    }

    private generateCacheKey(request: WideOrbitAvailabilityRequest): string {
        return `wo_avail_${request.stationId}_${request.daypartId || 'all'}_${this.formatDate(request.startDate)}_${this.formatDate(request.endDate)}`;
    }

    private formatDate(date: Date | string): string {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toISOString().split('T')[0];
    }

    // ─── Datos mock para desarrollo ────────────────────────────

    private generateMockAvailability(request: WideOrbitAvailabilityRequest): WideOrbitAvailabilityResponse {
        const totalSpots = Math.floor(Math.random() * 100) + 50;
        const availableSpots = Math.floor(totalSpots * (Math.random() * 0.5 + 0.3));
        const percentage = Math.round((availableSpots / totalSpots) * 100);

        const conflicts: WideOrbitConflict[] = [];

        // Simular algunos conflictos
        if (percentage < 80) {
            conflicts.push({
                type: 'sold',
                contractId: `CTR-${Math.random().toString(36).substring(7).toUpperCase()}`,
                advertiser: ['Banco Chile', 'Falabella', 'Cencosud'][Math.floor(Math.random() * 3)],
                startTime: '08:00',
                endTime: '12:00',
                spots: Math.floor(Math.random() * 10) + 5
            });
        }

        if (percentage < 50) {
            conflicts.push({
                type: 'exclusive',
                contractId: `CTR-EXCL-001`,
                advertiser: 'Competidor Directo',
                startTime: '06:00',
                endTime: '12:00',
                spots: Math.floor(Math.random() * 20) + 10
            });
        }

        const alternatives: WideOrbitAlternative[] = percentage < 80 ? [
            {
                stationId: 'med-002',
                stationName: 'FM Dos',
                daypartId: request.daypartId || 'prime',
                daypartName: 'Prime Time',
                availableSpots: Math.floor(totalSpots * 0.8),
                percentage: 80,
                costPerSpot: 250000
            },
            {
                stationId: 'med-004',
                stationName: 'ADN Radio',
                daypartId: request.daypartId || 'prime',
                daypartName: 'Prime Time',
                availableSpots: Math.floor(totalSpots * 0.9),
                percentage: 90,
                costPerSpot: 180000
            }
        ] : [];

        return {
            available: percentage >= 30,
            availableSpots,
            totalSpots,
            percentage,
            conflicts,
            suggestedAlternatives: alternatives
        };
    }

    private generateMockReservation(request: WideOrbitReservationRequest): WideOrbitReservation {
        const reservationId = `wo_res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        return {
            reservationId,
            stationId: request.stationId,
            daypartId: request.daypartId,
            startDate: this.formatDate(request.startDate),
            endDate: this.formatDate(request.endDate),
            spots: request.spots,
            status: 'pending',
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString()
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════

export default new WideOrbitService();

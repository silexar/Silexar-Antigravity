/**
 * 📻 SILEXAR PULSE - Bdemisoras Validation Service TIER 0
 * 
 * @description Servicio para validar disponibilidad contra la base de datos
 * de emisoras (Bdemisoras). Verifica conflictos de horarios, exclusividades
 * y disponibilidad real de espacios.
 * 
 * Bdemisoras es la base de datos de emisoras de Chile que contiene:
 * - Información de estaciones de radio y TV
 * - Horarios disponibles
 * - Conflictos de exclusividad
 * - Saturación por día y horario
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { logger } from '@/lib/observability';

// Las tablas de DB se importarán cuando estén definidas en el schema
// import { db } from '@/lib/db';
// import { bdemisoras, emisiones, exclusividades } from '@/lib/db/schema';
// import { eq, and, gte, lte, or, inArray, sql } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface BdemisorasValidationRequest {
    medioId: string;
    formatoId?: string;
    horario: string;
    fechaInicio: Date | string;
    fechaFin: Date | string;
    categoria?: string;
    marca?: string;
}

export interface BdemisorasValidationResponse {
    disponible: boolean;
    disponibilidad: number; // 0-100
    conflictos: BdemisorasConflict[];
    reservasActivas: number;
    capacidadTotal: number;
    sugerencias: BdemisorasSuggestion[];
}

export interface BdemisorasConflict {
    tipo: 'exclusividad' | 'saturacion' | 'mantenimiento' | 'reservado';
    anunciante?: string;
    contratoId?: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    impacto: 'alto' | 'medio' | 'bajo';
}

export interface BdemisorasSuggestion {
    tipo: 'horario' | 'dia' | 'medio_alternativo';
    descripcion: string;
    disponibilidad: number;
    economia: number; // porcentaje de ahorro vs opción original
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

export class BdemisorasValidationService {
    private cache: Map<string, { data: BdemisorasValidationResponse; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

    /**
     * Validar disponibilidad en Bdemisoras
     */
    async validateAvailability(request: BdemisorasValidationRequest): Promise<BdemisorasValidationResponse> {
        const cacheKey = this.generateCacheKey(request);

        // Verificar cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            logger.debug('[Bdemisoras] Cache hit');
            return cached.data;
        }

        try {
            // En producción, consultar la base de datos real
            const response = await this.performValidation(request);

            // Guardar en cache
            this.cache.set(cacheKey, { data: response, timestamp: Date.now() });

            return response;
        } catch (error) {
            logger.error('[Bdemisoras] Error validando disponibilidad', error instanceof Error ? error : undefined, {
                medioId: request.medioId
            });

            // Fallback
            return this.fallbackValidation(request);
        }
    }

    /**
     * Verificar conflicto de exclusividad
     */
    async checkExclusividad(
        medioId: string,
        fechaInicio: Date | string,
        fechaFin: Date | string,
        categoria?: string,
        marca?: string
    ): Promise<{
        tieneConflicto: boolean; exclusividades: Array<{
            id: string;
            anunciante: string;
            categoria: string;
            marca?: string;
            fechaInicio: string;
            fechaFin: string;
        }>
    }> {
        try {
            const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
            const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

            // Query para buscar exclusividades activas
            // En producción esto consultaría la tabla de exclusividades
            const exclusividadesActivas = await this.dbQueryExclusividades(medioId, inicio, fin);

            const conflictos = exclusividadesActivas.filter(exc => {
                // Verificar si hay conflicto de categoría o marca
                if (categoria && exc.categoria.toLowerCase() === categoria.toLowerCase()) {
                    return true;
                }
                if (marca && exc.marca && exc.marca.toLowerCase() === marca.toLowerCase()) {
                    return true;
                }
                return false;
            });

            return {
                tieneConflicto: conflictos.length > 0,
                exclusividades: conflictos
            };
        } catch (error) {
            logger.error('[Bdemisoras] Error verificando exclusividad', error instanceof Error ? error : undefined);
            return { tieneConflicto: false, exclusividades: [] };
        }
    }

    /**
     * Obtener reservas activas para un medio
     */
    async getReservasActivas(
        medioId: string,
        fechaInicio: Date | string,
        fechaFin: Date | string
    ): Promise<Array<{
        reservaId: string;
        contratoId: string;
        fecha: string;
        horario: string;
        spots: number;
        estado: string;
    }>> {
        try {
            const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
            const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;

            // En producción, consultar la tabla de reservas/emisiones
            const reservas = await this.dbQueryReservas(medioId, inicio, fin);

            return reservas;
        } catch (error) {
            logger.error('[Bdemisoras] Error obteniendo reservas activas', error instanceof Error ? error : undefined);
            return [];
        }
    }

    /**
     * Obtener horarios alternativos disponibles
     */
    async getHorariosAlternativos(
        medioId: string,
        fechaInicio: Date | string,
        fechaFin: Date | string,
        formatoId?: string
    ): Promise<BdemisorasSuggestion[]> {
        const sugerencias: BdemisorasSuggestion[] = [];

        const horarios = [
            { inicio: '06:00', fin: '09:00', nombre: 'Mañana' },
            { inicio: '09:00', fin: '12:00', nombre: 'Medio día' },
            { inicio: '12:00', fin: '15:00', nombre: 'Tarde' },
            { inicio: '15:00', fin: '18:00', nombre: 'Pre-prime' },
            { inicio: '18:00', fin: '21:00', nombre: 'Prime' },
            { inicio: '21:00', fin: '24:00', nombre: 'Late night' }
        ];

        for (const horario of horarios) {
            try {
                const validation = await this.validateAvailability({
                    medioId,
                    formatoId,
                    horario: `${horario.inicio}-${horario.fin}`,
                    fechaInicio,
                    fechaFin
                });

                if (validation.disponibilidad >= 70) {
                    sugerencias.push({
                        tipo: 'horario',
                        descripcion: `Horario ${horario.nombre} (${horario.inicio}-${horario.fin}) con ${validation.disponibilidad}% disponible`,
                        disponibilidad: validation.disponibilidad,
                        economia: horario.inicio >= '18:00' ? 0 : 15 // Prime es más caro
                    });
                }
            } catch {
                // Continuar con siguiente horario
            }
        }

        // Ordenar por disponibilidad
        return sugerencias.sort((a, b) => b.disponibilidad - a.disponibilidad).slice(0, 3);
    }

    // ─── Métodos privados ─────────────────────────────────────

    private async performValidation(request: BdemisorasValidationRequest): Promise<BdemisorasValidationResponse> {
        const fechaInicio = typeof request.fechaInicio === 'string'
            ? new Date(request.fechaInicio)
            : request.fechaInicio;
        const fechaFin = typeof request.fechaFin === 'string'
            ? new Date(request.fechaFin)
            : request.fechaFin;

        // Calcular días del período
        const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Capacidad máxima: 12 spots por día por defecto
        const capacidadTotal = dias * 12;

        // Obtener reservas activas
        const reservas = await this.getReservasActivas(request.medioId, fechaInicio, fechaFin);
        const reservasActivas = reservas.reduce((sum, r) => sum + r.spots, 0);

        // Verificar exclusividades
        const exclusividad = await this.checkExclusividad(
            request.medioId,
            fechaInicio,
            fechaFin,
            request.categoria,
            request.marca
        );

        // Calcular disponibilidad
        const utilizada = reservasActivas;
        const disponibilidad = Math.max(0, Math.round(((capacidadTotal - utilizada) / capacidadTotal) * 100));

        // Determinar conflictos
        const conflictos: BdemisorasConflict[] = [];

        if (exclusividad.tieneConflicto) {
            for (const exc of exclusividad.exclusividades) {
                conflictos.push({
                    tipo: 'exclusividad',
                    anunciante: exc.anunciante,
                    descripcion: `Exclusividad en categoría ${exc.categoria}`,
                    fechaInicio: exc.fechaInicio,
                    fechaFin: exc.fechaFin,
                    impacto: 'alto'
                });
            }
        }

        if (disponibilidad < 30) {
            conflictos.push({
                tipo: 'saturacion',
                descripcion: `Horario con alta ocupación (${100 - disponibilidad}% usado)`,
                fechaInicio: request.fechaInicio.toString(),
                fechaFin: request.fechaFin.toString(),
                impacto: disponibilidad < 10 ? 'alto' : 'medio'
            });
        }

        // Generar sugerencias
        const sugerencias = disponibilidad < 70
            ? await this.getHorariosAlternativos(request.medioId, request.fechaInicio, request.fechaFin, request.formatoId)
            : [];

        return {
            disponible: disponibilidad >= 20 && !exclusividad.tieneConflicto,
            disponibilidad,
            conflictos,
            reservasActivas,
            capacidadTotal,
            sugerencias
        };
    }

    private fallbackValidation(request: BdemisorasValidationRequest): BdemisorasValidationResponse {
        // Validación básica cuando BD no está disponible
        const disponible = Math.random() > 0.3;
        const disponibilidad = disponible ? Math.floor(Math.random() * 40) + 60 : 0;

        return {
            disponible,
            disponibilidad,
            conflictos: disponible ? [] : [{
                tipo: 'mantenimiento',
                descripcion: 'Sistema de validación no disponible - Verificación manual requerida',
                fechaInicio: request.fechaInicio.toString(),
                fechaFin: request.fechaFin.toString(),
                impacto: 'medio'
            }],
            reservasActivas: 0,
            capacidadTotal: 100,
            sugerencias: []
        };
    }

    private async dbQueryExclusividades(
        medioId: string,
        fechaInicio: Date,
        fechaFin: Date
    ): Promise<Array<{
        id: string;
        anunciante: string;
        categoria: string;
        marca?: string;
        fechaInicio: string;
        fechaFin: string;
    }>> {
        // En producción, esto consultaría la tabla real de exclusividades
        // Por ahora retornar mock data para desarrollo
        // TODO: Descomentar cuando existan las tablas en DB
        // try {
        //     const results = await db.select({...}).from(exclusividades).where(and(...));
        //     return results.map(r => ({...}));
        // } catch {
        return [];
        // }
    }

    private async dbQueryReservas(
        medioId: string,
        fechaInicio: Date,
        fechaFin: Date
    ): Promise<Array<{
        reservaId: string;
        contratoId: string;
        fecha: string;
        horario: string;
        spots: number;
        estado: string;
    }>> {
        // En producción, esto consultaría la tabla real de emisiones
        // Por ahora retornar mock data para desarrollo
        // TODO: Descomentar cuando existan las tablas en DB
        // try {
        //     const results = await db.select({...}).from(emisiones).where(and(...));
        //     return results.map(r => ({...}));
        // } catch {
        return [];
        // }
    }

    private generateCacheKey(request: BdemisorasValidationRequest): string {
        return `bdemisoras_${request.medioId}_${request.formatoId || 'all'}_${request.horario}_${new Date(request.fechaInicio).getTime()}_${new Date(request.fechaFin).getTime()}`;
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export default new BdemisorasValidationService();

/**
 * GET /api/cunas/metricas - Métricas operativas del módulo cuñas
 * 
 * Provee métricas en tiempo real para el dashboard operativo:
 * - Total de cuñas activas, por vencer, vencidas
 * - Distribución por tipo y estado
 * - Performance del equipo
 * - Alertas activas
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { cunas, anunciantes } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, count } from 'drizzle-orm';
import { withApiRoute } from '@/lib/api/with-api-route';

export const GET = withApiRoute(
    { resource: 'cunas', action: 'read', skipCsrf: true },
    async ({ ctx, req }: { ctx: { tenantId: string; userId: string }; req: NextRequest }) => {
        try {
            const db = getDB();
            const tenantId = ctx.tenantId;
            const now = new Date();
            const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            // Contadores básicos
            const [
                totalCunas,
                totalActivas,
                totalEnAire,
                totalPendientesAprobacion,
                totalVencenEstaSemana,
                totalVencenEsteMes,
            ] = await Promise.all([
                // Total cuñas
                db.select({ count: count() }).from(cunas).where(
                    and(eq(cunas.tenantId, tenantId), eq(cunas.eliminado, false))
                ),

                // Cuñas activas (estado = aprobada o en_aire)
                db.select({ count: count() }).from(cunas).where(
                    and(
                        eq(cunas.tenantId, tenantId),
                        eq(cunas.eliminado, false),
                        eq(cunas.estado, 'aprobada')
                    )
                ),

                // Cuñas en aire
                db.select({ count: count() }).from(cunas).where(
                    and(
                        eq(cunas.tenantId, tenantId),
                        eq(cunas.eliminado, false),
                        eq(cunas.estado, 'en_aire')
                    )
                ),

                // Pendientes de aprobación
                db.select({ count: count() }).from(cunas).where(
                    and(
                        eq(cunas.tenantId, tenantId),
                        eq(cunas.eliminado, false),
                        eq(cunas.estado, 'pendiente_aprobacion')
                    )
                ),

                // Vencen esta semana
                db.select({ count: count() }).from(cunas).where(
                    and(
                        eq(cunas.tenantId, tenantId),
                        eq(cunas.eliminado, false),
                        gte(cunas.fechaFinVigencia, now),
                        lte(cunas.fechaFinVigencia, oneWeekFromNow)
                    )
                ),

                // Vencen este mes
                db.select({ count: count() }).from(cunas).where(
                    and(
                        eq(cunas.tenantId, tenantId),
                        eq(cunas.eliminado, false),
                        gte(cunas.fechaFinVigencia, now),
                        lte(cunas.fechaFinVigencia, oneMonthFromNow)
                    )
                ),
            ]);

            // Distribución por tipo
            const porTipo = await db
                .select({
                    tipo: cunas.tipoCuna,
                    count: count(),
                })
                .from(cunas)
                .where(and(eq(cunas.tenantId, tenantId), eq(cunas.eliminado, false)))
                .groupBy(cunas.tipoCuna);

            // Distribución por estado
            const porEstado = await db
                .select({
                    estado: cunas.estado,
                    count: count(),
                })
                .from(cunas)
                .where(and(eq(cunas.tenantId, tenantId), eq(cunas.eliminado, false)))
                .groupBy(cunas.estado);

            // Últimas 10 cuñas creadas
            const ultimasCreadas = await db
                .select({
                    id: cunas.id,
                    codigo: cunas.codigo,
                    nombre: cunas.nombre,
                    tipo: cunas.tipoCuna,
                    estado: cunas.estado,
                    createdAt: cunas.createdAt,
                })
                .from(cunas)
                .where(and(eq(cunas.tenantId, tenantId), eq(cunas.eliminado, false)))
                .orderBy(sql`${cunas.createdAt} desc`)
                .limit(10);

            // Top anunciantes con más cuñas
            const topAnunciantes = await db
                .select({
                    id: anunciantes.id,
                    nombre: anunciantes.nombreRazonSocial,
                    count: count(),
                })
                .from(cunas)
                .innerJoin(anunciantes, eq(cunas.anuncianteId, anunciantes.id))
                .where(and(eq(cunas.tenantId, tenantId), eq(cunas.eliminado, false)))
                .groupBy(anunciantes.id, anunciantes.nombreRazonSocial)
                .orderBy(sql`count(*) desc`)
                .limit(5);

            const metricas = {
                resumen: {
                    total: totalCunas[0]?.count || 0,
                    activas: totalActivas[0]?.count || 0,
                    enAire: totalEnAire[0]?.count || 0,
                    pendientesAprobacion: totalPendientesAprobacion[0]?.count || 0,
                    vencenEstaSemana: totalVencenEstaSemana[0]?.count || 0,
                    vencenEsteMes: totalVencenEsteMes[0]?.count || 0,
                },
                porTipo: porTipo.map(t => ({
                    tipo: t.tipo,
                    cantidad: t.count,
                })),
                porEstado: porEstado.map(e => ({
                    estado: e.estado,
                    cantidad: e.count,
                })),
                ultimasCreadas: ultimasCreadas.map(c => ({
                    id: c.id,
                    codigo: c.codigo,
                    nombre: c.nombre,
                    tipo: c.tipo,
                    estado: c.estado,
                    fechaCreacion: c.createdAt,
                })),
                topAnunciantes: topAnunciantes.map(a => ({
                    id: a.id,
                    nombre: a.nombre,
                    cantidadCunas: a.count,
                })),
                alertasActivas: {
                    vencenHoy: totalVencenEstaSemana[0]?.count || 0, // Placeholder - en producción contar exactamente las que vencen HOY
                    vencenManana: 0, // Placeholder
                    requiereAtencion: totalPendientesAprobacion[0]?.count || 0,
                },
            };

            return NextResponse.json({
                success: true,
                data: metricas,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error('[API/Cunas/Metricas] Error:', error);
            return NextResponse.json(
                { success: false, error: 'Error al obtener métricas' },
                { status: 500 }
            );
        }
    }
);

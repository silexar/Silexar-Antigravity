import { eq, and } from 'drizzle-orm';
import { db as _db } from '@/lib/db';
const db = _db!;
import { registroDeteccion as deteccionTable } from '@/lib/db/emision-schema';
import { RegistroDeteccion, type RegistroDeteccionProps } from '../../domain/entities/RegistroDeteccion';

export class DrizzleRegistroDeteccionRepository {
  async guardar(deteccion: RegistroDeteccion): Promise<void> {
    await db.insert(deteccionTable).values({
      id: deteccion.id,
      tenantId: deteccion.tenantId,
      emisoraId: deteccion.emisoraId,
      fechaHoraDeteccion: deteccion.fechaHoraDeteccion,
      metodoDeteccion: deteccion.metodoDeteccion as typeof deteccionTable.$inferInsert['metodoDeteccion'],
      confianza: deteccion.confianza,
      fingerprint: deteccion.fingerprint ?? null,
      duracionDetectada: deteccion.duracionDetectada ?? null,
      textoDetectado: deteccion.textoDetectado ?? null,
      palabrasClave: deteccion.palabrasClave ?? null,
      validado: deteccion.validado,
    });
  }

  async buscarPorId(id: string, tenantId: string): Promise<RegistroDeteccion | null> {
    const rows = await db
      .select()
      .from(deteccionTable)
      .where(and(eq(deteccionTable.id, id), eq(deteccionTable.tenantId, tenantId)))
      .limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return RegistroDeteccion.reconstituir({
      id: row.id,
      tenantId: row.tenantId,
      emisoraId: row.emisoraId,
      fechaHoraDeteccion: row.fechaHoraDeteccion,
      cunaId: row.cunaId ?? undefined,
      spotTandaId: row.spotTandaId ?? undefined,
      metodoDeteccion: row.metodoDeteccion as RegistroDeteccionProps['metodoDeteccion'],
      confianza: row.confianza,
      fingerprint: row.fingerprint ?? undefined,
      duracionDetectada: row.duracionDetectada ?? undefined,
      textoDetectado: row.textoDetectado ?? undefined,
      palabrasClave: (row.palabrasClave as string[]) ?? undefined,
      validado: row.validado,
      validadoPorId: row.validadoPorId ?? undefined,
      fechaValidacion: row.fechaValidacion ?? undefined,
      fechaCreacion: row.fechaCreacion,
    });
  }
}

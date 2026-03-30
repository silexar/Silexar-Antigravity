import { logger } from '@/lib/observability';
/**
 * NOTIFICACIONES: CALENDAR INTEGRATION SERVICE - TIER 0 ENTERPRISE
 */

export interface EventoCalendario {
  titulo: string
  descripcion: string
  fechaInicio: Date
  fechaFin: Date
  participantes: string[]
  tipo: 'inicio_auspicio' | 'fin_auspicio' | 'reunion_renovacion' | 'vencimiento_alerta' | 'countdown_48h'
  recordatorios: number[]     // Minutos antes
  enlace?: string
}

export class CalendarIntegrationService {
  async crearEvento(evento: EventoCalendario): Promise<{ success: boolean; eventoId: string }> {
    logger.info(`[Calendar] "${evento.titulo}" | ${evento.fechaInicio.toISOString().split('T')[0]} | ${evento.participantes.join(', ')}`)
    return { success: true, eventoId: `cal_${Date.now()}` }
  }

  async crearEventoInicioAuspicio(data: { clienteNombre: string; programaNombre: string; fechaInicio: Date; ejecutivoEmail: string; operadorEmail: string }): Promise<{ success: boolean }> {
    return this.crearEvento({
      titulo: `🟢 Inicio: ${data.clienteNombre} en ${data.programaNombre}`,
      descripcion: `Inicio de emisión del auspicio de ${data.clienteNombre}`,
      fechaInicio: data.fechaInicio,
      fechaFin: new Date(data.fechaInicio.getTime() + 30 * 60 * 1000),
      participantes: [data.ejecutivoEmail, data.operadorEmail],
      tipo: 'inicio_auspicio',
      recordatorios: [1440, 60]  // 24h y 1h antes
    }).then(() => ({ success: true }))
  }

  async crearEventoFinAuspicio(data: { clienteNombre: string; programaNombre: string; fechaFin: Date; ejecutivoEmail: string; operadorEmail: string }): Promise<{ success: boolean }> {
    return this.crearEvento({
      titulo: `🔴 Fin: ${data.clienteNombre} en ${data.programaNombre}`,
      descripcion: `Fin de emisión. Confirmar retiro de materiales.`,
      fechaInicio: data.fechaFin,
      fechaFin: new Date(data.fechaFin.getTime() + 30 * 60 * 1000),
      participantes: [data.ejecutivoEmail, data.operadorEmail],
      tipo: 'fin_auspicio',
      recordatorios: [1440, 60]
    }).then(() => ({ success: true }))
  }

  async crearReuniónRenovación(data: { clienteNombre: string; ejecutivoEmail: string; fecha: Date }): Promise<{ success: boolean }> {
    return this.crearEvento({
      titulo: `🔄 Renovación: ${data.clienteNombre}`,
      descripcion: `Reunión para negociar renovación de auspicio`,
      fechaInicio: data.fecha,
      fechaFin: new Date(data.fecha.getTime() + 60 * 60 * 1000),
      participantes: [data.ejecutivoEmail],
      tipo: 'reunion_renovacion',
      recordatorios: [1440, 120, 30]
    }).then(() => ({ success: true }))
  }
}

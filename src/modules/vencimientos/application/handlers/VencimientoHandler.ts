/**
 * HANDLER: VENCIMIENTOS - TIER 0 ENTERPRISE
 *
 * @description Tracking de vencimientos, R1 (48h + extensiones),
 * R2 (alertas tráfico), gestión de renovaciones.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */


import { AlertaProgramador } from '../../domain/entities/AlertaProgramador.js'
import type { IVencimientosRepository } from '../../domain/repositories/IVencimientosRepository.js'
import type { ICupoComercialRepository } from '../../domain/repositories/ICupoComercialRepository.js'
import type { IEmisoraRepository } from '../../domain/repositories/IEmisoraRepository.js'
import type {
  ObtenerVencimientosProximosQuery,
  VencimientosProximoResult,
  ObtenerAuspiciosNoIniciadosQuery,
  AuspicioNoIniciadoResult
} from '../queries/index.js'

export class VencimientosHandler {
  constructor(
    private readonly vencimientosRepo: IVencimientosRepository,
    private readonly cupoRepo: ICupoComercialRepository,
    private readonly emisoraRepo: IEmisoraRepository
  ) {}

  /** Obtener vencimientos próximos con evaluación automática */
  async obtenerVencimientosProximos(query: ObtenerVencimientosProximosQuery): Promise<VencimientosProximoResult[]> {
    const vencimientos = await this.vencimientosRepo.findVencimientosProximos(query.payload.diasAnticipacion)
    const filtrados = vencimientos
      .filter(v => !query.payload.emisoraId || v.emisoraId === query.payload.emisoraId)
      .filter(v => !query.payload.programaId || v.programaId === query.payload.programaId)

    return filtrados.map(v => {
      v.evaluar() // Re-evaluar estado actual
      return {
        id: v.id,
        clienteNombre: v.clienteNombre,
        programaNombre: '', // Se resolvería con join
        emisoraNombre: '',
        ejecutivoNombre: v.ejecutivoNombre,
        diasRestantes: v.diasRestantes,
        nivelAlerta: v.nivelAlerta,
        accionSugerida: v.accionSugerida,
        countdown48h: v.countdown48hIniciado ? {
          activo: true,
          horasRestantes: v.horasCountdownRestantes
        } : undefined
      }
    })
  }

  /** R1: Obtener auspicios que no han iniciado */
  async obtenerAuspiciosNoIniciados(query: ObtenerAuspiciosNoIniciadosQuery): Promise<AuspicioNoIniciadoResult[]> {
    const vencimientos = await this.vencimientosRepo.findVencimientosNoIniciados()
    const filtrados = vencimientos
      .filter(v => !query.payload.emisoraId || v.emisoraId === query.payload.emisoraId)

    return filtrados.map(v => {
      v.evaluar()
      return {
        cupoComercialId: v.cupoComercialId,
        clienteNombre: v.clienteNombre,
        programaNombre: '',
        ejecutivoNombre: v.ejecutivoNombre,
        fechaInicioEsperada: v.periodoVigencia.fechaInicio,
        diasSinIniciar: v.periodoVigencia.diasSinIniciar,
        countdown48h: {
          activo: v.countdown48hIniciado,
          horasRestantes: v.horasCountdownRestantes,
          expira: v.countdown48hExpira
        },
        extensionesPrevias: 0, // Se resolvería con query a extensiones
        accionSugerida: v.accionSugerida
      }
    })
  }

  /** R2: Proceso automático diario de alertas de tráfico */
  async procesarAlertasTrafico(): Promise<{ alertasCreadas: number }> {
    let alertasCreadas = 0

    // Obtener auspicios que terminan mañana
    const terminanManana = await this.vencimientosRepo.findVencimientosTerminanManana()
    for (const v of terminanManana) {
      const emisora = await this.emisoraRepo.findById(v.emisoraId)
      if (!emisora) continue

      const alerta = AlertaProgramador.crearAlertaFinManana({
        emisoraId: v.emisoraId,
        programaId: v.programaId,
        programaNombre: '',
        cupoComercialId: v.cupoComercialId,
        clienteNombre: v.clienteNombre,
        operadorTraficoId: emisora.operadorTraficoId,
        operadorTraficoNombre: emisora.operadorTraficoNombre
      })
      await this.vencimientosRepo.saveAlerta(alerta)
      v.marcarAlertaTraficoEnviada()
      await this.vencimientosRepo.saveVencimientos(v)
      alertasCreadas++
    }

    // Obtener auspicios que terminan hoy
    const terminanHoy = await this.vencimientosRepo.findVencimientosTerminanHoy()
    for (const v of terminanHoy) {
      const emisora = await this.emisoraRepo.findById(v.emisoraId)
      if (!emisora) continue

      const alerta = AlertaProgramador.crearAlertaFinHoy({
        emisoraId: v.emisoraId,
        programaId: v.programaId,
        programaNombre: '',
        cupoComercialId: v.cupoComercialId,
        clienteNombre: v.clienteNombre,
        operadorTraficoId: emisora.operadorTraficoId,
        operadorTraficoNombre: emisora.operadorTraficoNombre
      })
      await this.vencimientosRepo.saveAlerta(alerta)
      v.marcarAlertaTraficoFinalEnviada()
      await this.vencimientosRepo.saveVencimientos(v)
      alertasCreadas++
    }

    return { alertasCreadas }
  }

  /** R1: Proceso automático diario de vigilancia no-inicio */
  async procesarNoIniciados(): Promise<{ eliminados: number; alertas: number }> {
    let eliminados = 0
    let alertas = 0

    const noIniciados = await this.vencimientosRepo.findVencimientosNoIniciados()
    for (const v of noIniciados) {
      v.evaluar()

      // Si expiró el countdown de 48h → eliminar
      if (v.haExpiradoCountdown()) {
        const cupo = await this.cupoRepo.findById(v.cupoComercialId)
        if (cupo) {
          cupo.eliminarPorNoInicio('SISTEMA_AUTOMATICO')
          await this.cupoRepo.save(cupo)
          eliminados++
        }
      }

      await this.vencimientosRepo.saveVencimientos(v)
      alertas++
    }

    return { eliminados, alertas }
  }
}

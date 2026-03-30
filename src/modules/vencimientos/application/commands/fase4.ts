/**
 * COMMAND: RESERVAR CUPO TEMPORAL - TIER 0 FASE 4
 */

export interface ReservarCupoTemporalCommand {
  type: 'ReservarCupoTemporal'
  payload: {
    cupoComercialId: string
    ejecutivoId: string
    clienteNombre: string
    horasBloqueo: number // Máximo 4 horas por R1
  }
}

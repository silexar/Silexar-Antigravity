/**
 * Servicio de Tarifas (Frontend)
 * Provee utilidades y datos históricos simulados para la UI
 */

export class TarifaService {
  async obtenerTarifasHistoricas(_opts: { cliente: string; incluirPromedio?: boolean; ultimosMeses?: number }) {
    const ahora = new Date()
    return [
      { cliente: _opts.cliente, valorPromedio: 25000, fechaUltimaUso: new Date(ahora.getTime() - 15*86400000), frecuenciaUso: 8 },
      { cliente: _opts.cliente, valorPromedio: 28000, fechaUltimaUso: new Date(ahora.getTime() - 35*86400000), frecuenciaUso: 5 },
    ]
  }
}

export default TarifaService


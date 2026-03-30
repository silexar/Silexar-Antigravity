import { ObtenerDisponibilidadCuposDTO } from '../../../modules/vencimientos/application/queries/ObtenerDisponibilidadCuposQuery';
import { OptimizarPricingDTO } from '../../../modules/vencimientos/application/commands/OptimizarPricingCommand';

export class VencimientosApiClient {
  // Simula latencia de red contra Controladores
  private static async fakeLatency<T>(data: T, ms = 600): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), ms));
  }

  static async getDisponibilidad(dto: ObtenerDisponibilidadCuposDTO) {
    // Aquí iría el fetch() real a /api/vencimientos/disponibilidad
    return this.fakeLatency({
      disponible: true,
      cuposRestantes: Math.floor(Math.random() * 10) + 1,
      franja: dto.franjaHoraria
    });
  }

  static async autoOptimizarPricing(dto: OptimizarPricingDTO) {
    // Aquí iría el fetch() real a /api/vencimientos/pricing
    const baseDemand = dto.demandaDetectada;
    const factor = baseDemand > 80 ? 1.35 : baseDemand > 50 ? 1.15 : 1.0;
    return this.fakeLatency({
      success: true,
      nuevoFactorTarifa: factor,
      programaId: dto.programaId
    }, 1200); // Simulando el pensar de Cortex
  }
}

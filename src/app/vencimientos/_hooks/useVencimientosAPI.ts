import { useState } from 'react';
import { VencimientosApiClient } from '../_lib/VencimientosApiClient';
import { ObtenerDisponibilidadCuposDTO } from '../../../modules/vencimientos/application/queries/ObtenerDisponibilidadCuposQuery';
import { OptimizarPricingDTO } from '../../../modules/vencimientos/application/commands/OptimizarPricingCommand';

export function useVencimientosAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDisponibilidad = async (programaId: string, franja: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const dto: ObtenerDisponibilidadCuposDTO = { programaId, franjaHoraria: franja };
      const data = await VencimientosApiClient.getDisponibilidad(dto);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error de conexión');
      } else {
        setError('Error de conexión desconocido');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const optimizarPrecio = async (programaId: string, franja: string, demanda: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const dto: OptimizarPricingDTO = { programaId, franjaHoraria: franja, demandaDetectada: demanda };
      const data = await VencimientosApiClient.autoOptimizarPricing(dto);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error Cortex Pricing');
      } else {
        setError('Error desconocido en Cortex Pricing');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, testDisponibilidad, optimizarPrecio };
}

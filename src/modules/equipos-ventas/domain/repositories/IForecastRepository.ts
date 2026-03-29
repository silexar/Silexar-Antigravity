/**
 * REPOSITORY INTERFACE: FORECAST
 */

import { ForecastColaborativo } from '../entities/ForecastColaborativo';

export interface IForecastRepository {
  findById(id: string): Promise<ForecastColaborativo | null>;
  findByEquipoAndPeriodo(equipoId: string, periodo: string): Promise<ForecastColaborativo | null>;
  save(forecast: ForecastColaborativo): Promise<void>;
}

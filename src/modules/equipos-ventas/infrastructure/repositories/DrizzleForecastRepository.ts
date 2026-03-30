/**
 * REPOSITORY IMPLEMENTATION: FORECAST (DRIZZLE)
 */

import { IForecastRepository } from '../../domain/repositories/IForecastRepository';
import { ForecastColaborativo } from '../../domain/entities/ForecastColaborativo';

export class DrizzleForecastRepository implements IForecastRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(_id: string): Promise<ForecastColaborativo | null> { return null; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByEquipoAndPeriodo(_equipoId: string, _periodo: string): Promise<ForecastColaborativo | null> { return null; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async save(_forecast: ForecastColaborativo): Promise<void> {}
}

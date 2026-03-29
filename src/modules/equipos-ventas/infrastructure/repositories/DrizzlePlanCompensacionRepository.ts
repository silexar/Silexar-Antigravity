/**
 * REPOSITORY IMPLEMENTATION: PLAN COMPENSACION (DRIZZLE)
 */

import { IPlanCompensacionRepository } from '../../domain/repositories/IPlanCompensacionRepository';
import { PlanCompensacion } from '../../domain/entities/PlanCompensacion';

export class DrizzlePlanCompensacionRepository implements IPlanCompensacionRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(_id: string): Promise<PlanCompensacion | null> { return null; }
  async findAll(): Promise<PlanCompensacion[]> { return []; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async save(_plan: PlanCompensacion): Promise<void> {}
}

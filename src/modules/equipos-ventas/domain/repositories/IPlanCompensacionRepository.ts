/**
 * REPOSITORY INTERFACE: PLAN COMPENSACION
 */

import { PlanCompensacion } from '../entities/PlanCompensacion';

export interface IPlanCompensacionRepository {
  findById(id: string): Promise<PlanCompensacion | null>;
  findAll(): Promise<PlanCompensacion[]>;
  save(plan: PlanCompensacion): Promise<void>;
}

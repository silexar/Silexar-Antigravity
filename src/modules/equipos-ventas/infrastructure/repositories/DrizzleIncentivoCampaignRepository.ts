/**
 * REPOSITORY IMPLEMENTATION: INCENTIVO CAMPAIGN (DRIZZLE)
 */

import { IIncentivoCampaignRepository } from '../../domain/repositories/IIncentivoCampaignRepository';
import { IncentivoCampaign } from '../../domain/entities/IncentivoCampaign';

export class DrizzleIncentivoCampaignRepository implements IIncentivoCampaignRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(_id: string): Promise<IncentivoCampaign | null> { return null; }
  async findActive(): Promise<IncentivoCampaign[]> { return []; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async save(_campaign: IncentivoCampaign): Promise<void> {}
}

/**
 * REPOSITORY INTERFACE: INCENTIVO CAMPAIGN
 */

import { IncentivoCampaign } from '../entities/IncentivoCampaign';

export interface IIncentivoCampaignRepository {
  findById(id: string): Promise<IncentivoCampaign | null>;
  findActive(): Promise<IncentivoCampaign[]>;
  save(campaign: IncentivoCampaign): Promise<void>;
}

/**
 * REPOSITORY INTERFACE: LEADERBOARD
 */

import { LeaderboardGamification } from '../entities/LeaderboardGamification';

export interface ILeaderboardRepository {
  findById(id: string): Promise<LeaderboardGamification | null>;
  findActive(): Promise<LeaderboardGamification | null>;
  save(leaderboard: LeaderboardGamification): Promise<void>;
}

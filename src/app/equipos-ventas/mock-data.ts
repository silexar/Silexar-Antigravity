/**
 * MOCK DATA: SALES TEAMS
 */

import { SalesMember, SalesTeam, Deal } from './types';

export const MOCK_USER: SalesMember = {
  id: 'u-1',
  name: 'Ana García',
  role: 'SALES_REP',
  email: 'ana.garcia@silexar.com',
  quota: 100000,
  currentSales: 75000,
  commissionRate: 0.08,
  status: 'ACTIVE'
};

export const MOCK_TEAM: SalesTeam = {
  id: 't-1',
  name: 'Alpha Squad',
  managerId: 'm-1',
  members: [MOCK_USER, {
    id: 'u-2',
    name: 'Carlos Ruiz',
    role: 'SALES_REP',
    email: 'carlos.ruiz@silexar.com',
    quota: 120000,
    currentSales: 45000,
    commissionRate: 0.07,
    status: 'ACTIVE'
  }],
  totalQuota: 500000,
  totalSales: 320000,
  region: 'LATAM'
};

export const MOCK_DEALS: Deal[] = [
  { id: 'd-1', clientId: 'c-1', clientName: 'TechCorp SA', amount: 50000, stage: 'PROPOSAL', probability: 60, expectedCloseDate: '2025-03-15', ownerId: 'u-1' },
  { id: 'd-2', clientId: 'c-2', clientName: 'Retail Giant', amount: 120000, stage: 'NEGOTIATION', probability: 80, expectedCloseDate: '2025-02-28', ownerId: 'u-1' },
  { id: 'd-3', clientId: 'c-3', clientName: 'Startup Inc', amount: 15000, stage: 'CLOSED_WON', probability: 100, expectedCloseDate: '2025-01-20', ownerId: 'u-2' }
];

export const getMockData = (role: string) => {
    // Simulate fetching different data based on role
    return {
        user: { ...MOCK_USER, role },
        team: MOCK_TEAM,
        deals: MOCK_DEALS
    };
};

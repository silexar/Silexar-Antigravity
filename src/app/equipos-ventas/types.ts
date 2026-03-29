/**
 * TYPES: SALES TEAMS FRONTEND
 */

export interface SalesMember {
  id: string;
  name: string;
  role: 'SALES_REP' | 'TEAM_LEAD' | 'MANAGER' | 'VP_SALES';
  avatar?: string;
  email: string;
  phone?: string;
  quota: number;
  currentSales: number;
  commissionRate: number;
  teamId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SalesTeam {
  id: string;
  name: string;
  managerId: string;
  members: SalesMember[];
  totalQuota: number;
  totalSales: number;
  region: string;
}

export interface Deal {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  stage: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
}

export type TimeWindow = 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'YTD';

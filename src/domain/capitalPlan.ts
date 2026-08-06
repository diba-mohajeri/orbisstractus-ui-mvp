import type { DeficiencySeverity } from './portfolioAssets';

export type FundingSource = 'Reserve Fund' | 'Special Assessment' | 'Operating Budget' | 'Unfunded';
export type CapitalPlanStatus = 'funded' | 'unfunded' | 'inProgress' | 'complete';

export interface CapitalPlanItem {
  id: string;
  buildingId: string;
  systemName: string;
  year: number;
  recommendedWork: string;
  priority: DeficiencySeverity;
  forecastCost: number;
  fundingSource: FundingSource;
  status: CapitalPlanStatus;
  sourceDeficiencyId?: string;
  quantity?: number;
  quantityUnit?: string;
  unitRate?: number;
  softCostsPct?: number;
  escalationPct?: number;
  contingencyPct?: number;
  phasingLabel?: string;
  reserveFundEligible?: boolean;
  rateSource?: string;
  costNotes?: string;
}

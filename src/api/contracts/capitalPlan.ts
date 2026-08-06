import type { CapitalPlanStatus, FundingSource } from '../../domain/capitalPlan';
import type { DeficiencySeverity } from '../../domain/portfolioAssets';

export interface CapitalPlanRow {
  id: string;
  buildingId: string;
  buildingName: string;
  systemName: string;
  year: number;
  recommendedWork: string;
  priority: DeficiencySeverity;
  forecastCost: number;
  forecastCostFormatted: string;
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

export interface CapitalPlanStatsResponse {
  fundedCount: number;
  unfundedCount: number;
  highPriorityCount: number;
  reserveFundingGapFormatted: string;
}

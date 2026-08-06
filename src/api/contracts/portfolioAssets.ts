import type {
  AssetRecord,
  Building,
  BuildingSystem,
  Deficiency,
  HealthTier,
  LifecycleExpenditureEntry,
  RiskLevel,
} from '../../domain/portfolioAssets';

export interface RegionSummaryResponse {
  id: string;
  name: string;
  buildingCount: number;
  assetClass: string;
  riskRating: RiskLevel;
  capitalExposure: string;
  status: string;
  healthScore: number;
}

export interface HealthTierCountResponse {
  tier: HealthTier;
  label: string;
  description: string;
  count: number;
}

export interface BuildingSummaryResponse extends Building {
  regionName: string;
  capitalExposureFormatted: string;
}

export interface AssetListResponse {
  rows: AssetRecord[];
  totalCount: number;
}

export type BuildingSystemsResponse = BuildingSystem[];
export type DeficienciesResponse = Deficiency[];
export type RiskPriorityResponse = AssetRecord[];

export interface AssetStatsResponse {
  totalAssets: number;
  totalValue: string;
  highRiskAssets: number;
  avgRemainingUsefulLife: number;
  buildingsTracked: number;
  systemsTracked: number;
}

export interface UpdateAssetRecordRequest {
  expectedUsefulLifeYears?: number;
  effectiveAgeYears?: number;
  replacementCost?: number;
  futureReplacementYear?: number;
  inflationAssumptionPct?: number;
}

export type LifecycleExpenditureListResponse = LifecycleExpenditureEntry[];

export interface CreateLifecycleExpenditureRequest {
  date: string;
  description: string;
  cost: number;
}

export interface PortfolioAnalyticsResponse {
  topRegion: { name: string; count: number };
  topAssetClass: { name: string; count: number };
  atRiskCount: number;
  topExposure: { name: string; value: string };
  activeCount: number;
  upcomingAssessments: number;
}

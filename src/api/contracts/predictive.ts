import type { RiskLevel } from '../../domain/portfolioAssets';

export interface BenchmarkScoreResponse {
  id: string;
  name: string;
  regionName: string;
  score: number;
  riskLevel: RiskLevel;
  capitalExposureFormatted: string;
}

export interface RiskForecastRow {
  id: string;
  buildingName: string;
  component: string;
  systemName: string;
  failureProbabilityPct: number;
  trajectory: 'Worsening' | 'Stable';
  inspectionUrgency: 'Immediate' | 'Near-term' | 'Scheduled';
  timeToCapitalNeedYears: number;
}

export interface CapitalForecastHorizon {
  key: string;
  label: string;
  assetCount: number;
  totalCostFormatted: string;
}

export interface ReserveForecastRegionRow {
  regionName: string;
  capitalExposureFormatted: string;
  reserveRequirementFormatted: string;
  fundingGapFormatted: string;
}

export interface BenchmarkMatrixRow {
  rank: number;
  id: string;
  name: string;
  regionName: string;
  healthPct: number;
  riskLevel: RiskLevel;
  capitalExposureFormatted: string;
  reserveRequirementFormatted: string;
}

export interface ExecutivePriorityResponse {
  buildingName: string;
  regionName: string;
  healthPct: number;
  capitalExposureFormatted: string;
  description: string;
}

export interface SeverityMatrixRegionRow {
  regionName: string;
  counts: { tier: string; label: string; count: number }[];
}

export interface ScenarioResponse {
  id: string;
  label: string;
  description: string;
  reserveRequirementFormatted: string;
  projectedHealthPct: number;
  projectedExposureFormatted: string;
  projectedExposureRaw: number;
  outcomeTone: 'success' | 'warning' | 'error' | 'neutral';
}

export interface ActionCommandItem {
  id: string;
  buildingId: string;
  buildingName: string;
  systemName: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimatedCostFormatted: string;
  approvalStatus: 'Approve Now' | 'Board Review';
}

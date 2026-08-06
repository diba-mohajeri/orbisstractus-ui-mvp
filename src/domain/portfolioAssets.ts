export type RiskLevel = 'low' | 'medium' | 'high';
export type BuildingStatus = 'active' | 'monitor' | 'stable';
export type HealthTier = 'healthy' | 'monitor' | 'atRisk' | 'critical';
export type SystemStatus = 'good' | 'fair' | 'poor';
export type Condition = 'good' | 'fair' | 'poor' | 'critical';
export type DeficiencySeverity = 'critical' | 'high' | 'medium' | 'low';

export const CANONICAL_SYSTEM_NAMES = [
  'Structure',
  'Building Envelope',
  'Roofing',
  'Mechanical (HVAC)',
  'Electrical',
  'Plumbing',
  'Fire & Life Safety',
  'Interior Finishes',
  'Site & Civil',
] as const;

export type SystemName = (typeof CANONICAL_SYSTEM_NAMES)[number];

export interface Region {
  id: string;
  name: string;
  companyId: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  regionId: string;
  companyId: string;
  assetClass: string;
  riskLevel: RiskLevel;
  capitalExposure: number;
  status: BuildingStatus;
  healthPct: number;
  healthTier: HealthTier;
  clientOrganization: string;
  clientContactName: string;
  clientContactEmail: string;
  engagementPurpose: string;
  portfolioName?: string;
  portfolioType?: string;
  portfolioAssetCountLabel?: string;
  yearBuilt: number;
  grossFloorAreaSqm: number;
  storeys: number;
  occupancyType: string;
  structureType: string;
  envelopeType: string;
  siteSuperintendentName: string;
  siteSuperintendentPhone: string;
  roofAccessNotes: string;
  parkingAccessNotes: string;
}

export interface BuildingSystem {
  id: string;
  buildingId: string;
  systemName: SystemName;
  status: SystemStatus;
  completenessPct: number;
}

export interface AssetRecord {
  id: string;
  buildingId: string;
  systemName: SystemName;
  component: string;
  condition: Condition;
  riskLevel: RiskLevel;
  // Reserve Fund data — Partially Active (Phase 1). Shared asset/component fields surfaced in
  // BCA/Envelope asset records; not a standalone Reserve Fund Study.
  remainingUsefulLifeYears: number; // RUL — auto-calculated as expectedUsefulLifeYears - effectiveAgeYears, read-only
  replacementCost: number; // Current Replacement Cost
  expectedUsefulLifeYears: number; // EUL
  effectiveAgeYears: number; // Effective Age
  futureReplacementYear: number; // Future Replacement Timing (target year)
  inflationAssumptionPct: number; // Inflation / Escalation Assumption
}

// Lifecycle Expenditure Records — Partially Active (Phase 1). A simple dated log of spend
// against a component, attached to the shared AssetRecord (not a Reserve Fund Study record type).
export interface LifecycleExpenditureEntry {
  id: string;
  assetRecordId: string;
  date: string; // ISO date
  description: string;
  cost: number;
}

export interface Deficiency {
  id: string;
  buildingId: string;
  systemName: SystemName;
  description: string;
  severity: DeficiencySeverity;
  estimatedCost: number;
  sourceObservationId?: string;
  deficiencyType?: string;
  subcategory?: string;
  riskType?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  codeComplianceFlag?: string;
  priorityTimeframe?: string;
  rulBasis?: string;
  rulStatus?: string;
  failureMechanism?: string;
  recommendationType?: string;
  recommendationScope?: string;
  deficiencyStatement?: string;
  clientNarrative?: string;
  recommendedAction?: string;
  deviationReason?: string;
}

export interface BoardKpisResponse {
  portfolioRiskScore: number;
  deferredMaintenanceExposureFormatted: string;
  reserveFundHealthPct: number;
  capitalRequirementFormatted: string;
  buildingHealthIndex: number;
  esgScore: number;
  criticalDeficiencies: number;
  upcomingMajorExpenditures: number;
}

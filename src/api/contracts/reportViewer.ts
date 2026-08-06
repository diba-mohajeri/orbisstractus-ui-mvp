import type { DeficiencySeverity } from '../../domain/portfolioAssets';
import type { ReportRow } from './operations';
import type { BuildingSummaryResponse } from './portfolioAssets';

export interface ReportViewerFinding {
  id: string;
  title: string;
  severity: DeficiencySeverity;
  problem: string;
  effect: string;
  recommendation: string;
  costFormatted: string;
}

export interface ReportViewerCapitalRow {
  id: string;
  year: number;
  systemName: string;
  recommendedWork: string;
  costFormatted: string;
}

export interface ReportViewerContentResponse {
  report: ReportRow;
  building: BuildingSummaryResponse | null;
  findings: ReportViewerFinding[];
  capitalSummary: ReportViewerCapitalRow[];
  totalDeficiencyCostFormatted: string;
  portfolioHealthPct: number;
}

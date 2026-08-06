import type { AssetRecord } from '../../domain/portfolioAssets';
import type { Report } from '../../domain/reports';
import type { BuildingSummaryResponse } from './portfolioAssets';

export interface AssetRegistryDetailResponse {
  building: BuildingSummaryResponse;
  latestReport: Report | null;
  topAssets: AssetRecord[];
}

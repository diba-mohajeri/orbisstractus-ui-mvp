import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '../../api/client';
import type { PortfolioSummaryResponse } from '../../api/contracts/portfolio';
import type {
  AssetListResponse,
  AssetStatsResponse,
  BuildingSummaryResponse,
  BuildingSystemsResponse,
  DeficienciesResponse,
  HealthTierCountResponse,
  RegionSummaryResponse,
} from '../../api/contracts/portfolioAssets';
import type { BenchmarkMatrixRow, CapitalForecastHorizon } from '../../api/contracts/predictive';
import type { CreateAssessmentRequest, CreateAssessmentResponse, ProjectRow, ReportRow } from '../../api/contracts/operations';
import type { CapitalPlanRow } from '../../api/contracts/capitalPlan';

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: () => apiGet<PortfolioSummaryResponse>('/portfolio/summary'),
  });
}

export function useRegionSummaries() {
  return useQuery({
    queryKey: ['portfolio-regions'],
    queryFn: () => apiGet<RegionSummaryResponse[]>('/portfolio/regions'),
  });
}

export function useBuildingSummaries() {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: () => apiGet<BuildingSummaryResponse[]>('/buildings'),
  });
}

export function useBuildingSystems(buildingId: string | null) {
  return useQuery({
    queryKey: ['building-systems', buildingId],
    queryFn: () => apiGet<BuildingSystemsResponse>(`/buildings/${buildingId}/systems`),
    enabled: Boolean(buildingId),
  });
}

export function useAssetStats() {
  return useQuery({
    queryKey: ['asset-stats'],
    queryFn: () => apiGet<AssetStatsResponse>('/portfolio/asset-stats'),
  });
}

export function useDeficienciesForBuilding(buildingId: string | null) {
  return useQuery({
    queryKey: ['building-deficiencies', buildingId],
    queryFn: () => apiGet<DeficienciesResponse>(`/buildings/${buildingId}/deficiencies`),
    enabled: Boolean(buildingId),
  });
}

export function useHealthTierCounts() {
  return useQuery({
    queryKey: ['portfolio-health-tiers'],
    queryFn: () => apiGet<HealthTierCountResponse[]>('/portfolio/health-tiers'),
  });
}

export function useCapitalForecastHorizons() {
  return useQuery({
    queryKey: ['capital-forecast-horizons'],
    queryFn: () => apiGet<CapitalForecastHorizon[]>('/predictive/capital-forecast-horizons'),
  });
}

export function useBenchmarkMatrix() {
  return useQuery({
    queryKey: ['benchmark-matrix'],
    queryFn: () => apiGet<BenchmarkMatrixRow[]>('/predictive/benchmark-matrix'),
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiGet<ProjectRow[]>('/projects'),
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssessmentRequest) =>
      apiPost<CreateAssessmentResponse, CreateAssessmentRequest>('/projects', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useCapitalPlanRows() {
  return useQuery({
    queryKey: ['capital-plan'],
    queryFn: () => apiGet<CapitalPlanRow[]>('/capital-plan'),
  });
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => apiGet<ReportRow[]>('/reports'),
  });
}

export interface AssetQuery {
  buildingId?: string;
  regionId?: string;
  healthTier?: string;
  systemName?: string;
  search?: string;
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

function buildAssetQueryString(query: AssetQuery): string {
  const params = new URLSearchParams();
  if (query.buildingId) params.set('buildingId', query.buildingId);
  if (query.regionId) params.set('regionId', query.regionId);
  if (query.healthTier) params.set('healthTier', query.healthTier);
  if (query.systemName) params.set('systemName', query.systemName);
  if (query.search) params.set('search', query.search);
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  if (query.sortField) params.set('sortField', query.sortField);
  if (query.sortDirection) params.set('sortDirection', query.sortDirection);
  return params.toString();
}

export function useAssetRecords(query: AssetQuery) {
  return useQuery({
    queryKey: ['assets', query],
    queryFn: () => apiGet<AssetListResponse>(`/assets?${buildAssetQueryString(query)}`),
    placeholderData: (prev) => prev,
  });
}

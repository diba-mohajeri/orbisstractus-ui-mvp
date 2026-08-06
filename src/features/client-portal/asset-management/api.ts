import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../../api/client';
import type {
  CreateLifecycleExpenditureRequest,
  LifecycleExpenditureListResponse,
  RiskPriorityResponse,
  UpdateAssetRecordRequest,
} from '../../../api/contracts/portfolioAssets';
import type { AssetRecord, LifecycleExpenditureEntry } from '../../../domain/portfolioAssets';

export function useRiskPriority(limit = 8) {
  return useQuery({
    queryKey: ['risk-priority', limit],
    queryFn: () => apiGet<RiskPriorityResponse>(`/portfolio/risk-priority?limit=${limit}`),
  });
}

export function useUpdateAssetRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateAssetRecordRequest }) =>
      apiPost<AssetRecord, UpdateAssetRecordRequest>(`/assets/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useLifecycleExpenditures(assetRecordId: string | undefined) {
  return useQuery({
    queryKey: ['assets', assetRecordId, 'expenditures'],
    queryFn: () => apiGet<LifecycleExpenditureListResponse>(`/assets/${assetRecordId}/expenditures`),
    enabled: Boolean(assetRecordId),
  });
}

export function useAddLifecycleExpenditure(assetRecordId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: CreateLifecycleExpenditureRequest) =>
      apiPost<LifecycleExpenditureEntry, CreateLifecycleExpenditureRequest>(`/assets/${assetRecordId}/expenditures`, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', assetRecordId, 'expenditures'] });
    },
  });
}

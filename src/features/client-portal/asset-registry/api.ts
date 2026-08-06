import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { AssetRegistryDetailResponse } from '../../../api/contracts/assetRegistry';

export function useAssetRegistryDetail(buildingId: string | null) {
  return useQuery({
    queryKey: ['asset-registry-detail', buildingId],
    queryFn: () => apiGet<AssetRegistryDetailResponse>(`/asset-registry/${buildingId}`),
    enabled: Boolean(buildingId),
  });
}

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { DeficiencyRow, DeficiencyStatsResponse } from '../../../api/contracts/operations';

export function useDeficiencies() {
  return useQuery({
    queryKey: ['deficiencies'],
    queryFn: () => apiGet<DeficiencyRow[]>('/deficiencies'),
  });
}

export function useDeficiencyStats() {
  return useQuery({
    queryKey: ['deficiency-stats'],
    queryFn: () => apiGet<DeficiencyStatsResponse>('/deficiencies/stats'),
  });
}

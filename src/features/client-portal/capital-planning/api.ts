import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { CapitalPlanStatsResponse } from '../../../api/contracts/capitalPlan';

export { useCapitalPlanRows } from '../api';

export function useCapitalPlanStats() {
  return useQuery({
    queryKey: ['capital-plan-stats'],
    queryFn: () => apiGet<CapitalPlanStatsResponse>('/capital-plan/stats'),
  });
}

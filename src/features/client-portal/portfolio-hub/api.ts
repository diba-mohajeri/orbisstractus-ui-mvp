import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { PortfolioAnalyticsResponse } from '../../../api/contracts/portfolioAssets';

export function usePortfolioAnalytics() {
  return useQuery({
    queryKey: ['portfolio-analytics'],
    queryFn: () => apiGet<PortfolioAnalyticsResponse>('/portfolio/analytics'),
  });
}

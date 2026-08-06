import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { BenchmarkScoreResponse, ReserveForecastRegionRow, RiskForecastRow } from '../../../api/contracts/predictive';

export function useBenchmarkScores() {
  return useQuery({
    queryKey: ['benchmark-scores'],
    queryFn: () => apiGet<BenchmarkScoreResponse[]>('/predictive/benchmark-scores'),
  });
}

export function useRiskForecast(limit = 10) {
  return useQuery({
    queryKey: ['risk-forecast', limit],
    queryFn: () => apiGet<RiskForecastRow[]>(`/predictive/risk-forecast?limit=${limit}`),
  });
}

export function useReserveForecastByRegion() {
  return useQuery({
    queryKey: ['reserve-forecast-by-region'],
    queryFn: () => apiGet<ReserveForecastRegionRow[]>('/predictive/reserve-forecast-by-region'),
  });
}

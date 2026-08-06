import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type {
  ActionCommandItem,
  ExecutivePriorityResponse,
  ScenarioResponse,
  SeverityMatrixRegionRow,
} from '../../../api/contracts/predictive';

export function useExecutivePriority() {
  return useQuery({
    queryKey: ['executive-priority'],
    queryFn: () => apiGet<ExecutivePriorityResponse>('/enterprise/executive-priority'),
  });
}

export function useSeverityMatrixByRegion() {
  return useQuery({
    queryKey: ['severity-matrix-region'],
    queryFn: () => apiGet<SeverityMatrixRegionRow[]>('/enterprise/severity-matrix'),
  });
}

export function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: () => apiGet<ScenarioResponse[]>('/enterprise/scenarios'),
  });
}

export function useActionCommandItems(limit = 8) {
  return useQuery({
    queryKey: ['action-command', limit],
    queryFn: () => apiGet<ActionCommandItem[]>(`/enterprise/action-command?limit=${limit}`),
  });
}

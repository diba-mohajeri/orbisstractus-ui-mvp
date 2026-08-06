import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { ActionRow, ActionStatsResponse } from '../../../api/contracts/operations';

export function useActions() {
  return useQuery({
    queryKey: ['actions'],
    queryFn: () => apiGet<ActionRow[]>('/actions'),
  });
}

export function useActionStats() {
  return useQuery({
    queryKey: ['action-stats'],
    queryFn: () => apiGet<ActionStatsResponse>('/actions/stats'),
  });
}

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { UndergoingProjectDetailResponse, UndergoingProjectRow } from '../../../api/contracts/undergoing';

export function useUndergoingProjects() {
  return useQuery({
    queryKey: ['undergoing-projects'],
    queryFn: () => apiGet<UndergoingProjectRow[]>('/undergoing-projects'),
  });
}

export function useUndergoingProjectDetail(projectId: string | null) {
  return useQuery({
    queryKey: ['undergoing-project-detail', projectId],
    queryFn: () => apiGet<UndergoingProjectDetailResponse>(`/undergoing-projects/${projectId}`),
    enabled: Boolean(projectId),
  });
}

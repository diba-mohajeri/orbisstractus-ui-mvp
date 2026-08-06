import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { MyProjectAccessResponse } from '../../../api/contracts/projectAccess';
import type { AccessLevel, ProjectStepKey } from '../../../domain/projectAccess';

export function useMyProjectAccess(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId, 'my-access'],
    queryFn: () => apiGet<MyProjectAccessResponse>(`/projects/${projectId}/my-access`),
    enabled: Boolean(projectId),
  });
}

export function useStepAccess(projectId: string | undefined, step: ProjectStepKey) {
  const { data, isLoading } = useMyProjectAccess(projectId);
  const level: AccessLevel = data?.[step] ?? 'none';
  return { level, isLoading: Boolean(projectId) && isLoading, canEdit: level === 'edit' };
}

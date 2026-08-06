import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../../../../api/client';
import type {
  ProjectAccessOverviewResponse,
  UpdateProjectStepAccessRequest,
  UpdateProjectTeamRequest,
} from '../../../../../api/contracts/projectAccess';

export function useProjectAccessOverview(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projectAccess', projectId],
    queryFn: () => apiGet<ProjectAccessOverviewResponse>(`/projects/${projectId}/access`),
    enabled: Boolean(projectId),
  });
}

export function useUpdateProjectTeam(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProjectTeamRequest) =>
      apiPost<ProjectAccessOverviewResponse, UpdateProjectTeamRequest>(`/projects/${projectId}/access/team`, body),
    onSuccess: (data) => queryClient.setQueryData(['projectAccess', projectId], data),
  });
}

export function useUpdateProjectStepAccess(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProjectStepAccessRequest) =>
      apiPost<ProjectAccessOverviewResponse, UpdateProjectStepAccessRequest>(`/projects/${projectId}/access/grant`, body),
    onSuccess: (data) => queryClient.setQueryData(['projectAccess', projectId], data),
  });
}

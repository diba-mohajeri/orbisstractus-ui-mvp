import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../../../../api/client';
import type { RolePermissionsResponse, UpdateRolePermissionRequest } from '../../../../../api/contracts/permissions';
import type { EmployeeRole } from '../../../../../domain/auth';
import type { Permission } from '../../../../../domain/permissions';

export function useRolePermissions() {
  return useQuery({
    queryKey: ['rolePermissions'],
    queryFn: () => apiGet<RolePermissionsResponse>('/roles/permissions'),
  });
}

export function useUpdateRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, permission, granted }: { role: EmployeeRole; permission: Permission; granted: boolean }) =>
      apiPost<Permission[], UpdateRolePermissionRequest>(`/roles/${role}/permissions`, { permission, granted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
    },
  });
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '../../../../../api/client';
import type {
  EmployeeActivityResponse,
  EmployeeDetailResponse,
  EmployeeRow,
  EmployeeWorkloadResponse,
  InviteEmployeeRequest,
  InviteEmployeeResponse,
  UpdateEmployeePermissionsRequest,
  UpdateEmployeeProfileRequest,
  UpdateEmployeeRoleRequest,
} from '../../../../../api/contracts/employees';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => apiGet<EmployeeRow[]>('/employees'),
  });
}

export function useEmployeeDetail(id: string | null) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => apiGet<EmployeeDetailResponse>(`/employees/${id}`),
    enabled: Boolean(id),
  });
}

export function useEmployeeActivity(id: string | null) {
  return useQuery({
    queryKey: ['employees', id, 'activity'],
    queryFn: () => apiGet<EmployeeActivityResponse>(`/employees/${id}/activity`),
    enabled: Boolean(id),
  });
}

export function useEmployeeWorkload(id: string | null) {
  return useQuery({
    queryKey: ['employees', id, 'workload'],
    queryFn: () => apiGet<EmployeeWorkloadResponse>(`/employees/${id}/workload`),
    enabled: Boolean(id),
  });
}

export function useUpdateEmployeeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string } & UpdateEmployeeRoleRequest) =>
      apiPost<EmployeeDetailResponse, UpdateEmployeeRoleRequest>(`/employees/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & UpdateEmployeeProfileRequest) =>
      apiPost<EmployeeDetailResponse, UpdateEmployeeProfileRequest>(`/employees/${id}/profile`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployeePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & UpdateEmployeePermissionsRequest) =>
      apiPost<EmployeeDetailResponse, UpdateEmployeePermissionsRequest>(`/employees/${id}/permissions`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useInviteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteEmployeeRequest) =>
      apiPost<InviteEmployeeResponse, InviteEmployeeRequest>('/employees', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
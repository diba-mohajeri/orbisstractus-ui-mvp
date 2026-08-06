import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '../../api/client';
import type {
  CompanyDetailResponse,
  CompanyRow,
  CreateCompanyRequest,
  CreateCompanyResponse,
  UpdateCompanyRequest,
} from '../../api/contracts/companies';
import type { Company } from '../../domain/companies';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => apiGet<CompanyRow[]>('/companies'),
  });
}

export function useCompanyDetail(id: string | null) {
  return useQuery({
    queryKey: ['companies', id, 'detail'],
    queryFn: () => apiGet<CompanyDetailResponse>(`/companies/${id}/detail`),
    enabled: Boolean(id),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCompanyRequest) => apiPost<CreateCompanyResponse, CreateCompanyRequest>('/companies', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & UpdateCompanyRequest) =>
      apiPost<Company, UpdateCompanyRequest>(`/companies/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

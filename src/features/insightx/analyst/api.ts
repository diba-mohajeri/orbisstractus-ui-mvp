import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../../../api/client';
import type {
  CreateCapitalPlanItemRequest,
  CreateCapitalPlanItemResponse,
  CreateDeficiencyRequest,
  CreateDeficiencyResponse,
} from '../../../api/contracts/operations';

export function useCreateDeficiency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDeficiencyRequest) =>
      apiPost<CreateDeficiencyResponse, CreateDeficiencyRequest>('/deficiencies', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deficiencies'] });
      queryClient.invalidateQueries({ queryKey: ['deficiency-stats'] });
      queryClient.invalidateQueries({ queryKey: ['building-deficiencies'] });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['action-stats'] });
    },
  });
}

export function useCreateCapitalPlanItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCapitalPlanItemRequest) =>
      apiPost<CreateCapitalPlanItemResponse, CreateCapitalPlanItemRequest>('/capital-plan', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capital-plan'] });
      queryClient.invalidateQueries({ queryKey: ['capital-plan-stats'] });
    },
  });
}

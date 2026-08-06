import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../../api/client';
import type { CreateMessageRequest, MessageRow } from '../../../api/contracts/messages';
import type { ClientMessage } from '../../../domain/messages';

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: () => apiGet<MessageRow[]>('/messages'),
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMessageRequest) => apiPost<ClientMessage, CreateMessageRequest>('/messages', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

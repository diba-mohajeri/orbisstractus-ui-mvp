import { useMutation } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { AdvisorAnswerResponse } from '../../../api/contracts/advisor';

export function useAskAdvisor() {
  return useMutation({
    mutationFn: (question: string) =>
      apiGet<AdvisorAnswerResponse>(`/advisor/answer?question=${encodeURIComponent(question)}`),
  });
}

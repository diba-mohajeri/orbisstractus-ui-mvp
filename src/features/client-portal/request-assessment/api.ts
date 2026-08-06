import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../../api/client';
import type { AssessmentRequestPayload, AssessmentRequestResponse } from '../../../api/contracts/assessmentRequest';

export function useSubmitAssessmentRequest() {
  return useMutation({
    mutationFn: (payload: AssessmentRequestPayload) =>
      apiPost<AssessmentRequestResponse, AssessmentRequestPayload>('/assessment-requests', payload),
  });
}

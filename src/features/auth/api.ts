import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../api/client';
import type { SignInRequest, SignInSuccessResponse } from '../../api/contracts/auth';

export function useSignIn() {
  return useMutation({
    mutationFn: (body: SignInRequest) =>
      apiPost<SignInSuccessResponse, SignInRequest>('/auth/login', body),
  });
}

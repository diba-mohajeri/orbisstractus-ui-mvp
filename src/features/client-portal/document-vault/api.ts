import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { DocumentRow } from '../../../api/contracts/documents';

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => apiGet<DocumentRow[]>('/documents'),
  });
}

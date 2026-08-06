import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../api/client';
import type { BoardKpisResponse } from '../../../api/contracts/board';

export function useBoardKpis() {
  return useQuery({
    queryKey: ['board-kpis'],
    queryFn: () => apiGet<BoardKpisResponse>('/board/kpis'),
  });
}

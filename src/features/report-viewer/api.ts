import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import type { ReportViewerContentResponse } from '../../api/contracts/reportViewer';

export function useReportViewerContent(reportId: string | undefined) {
  return useQuery({
    queryKey: ['report-viewer', reportId],
    queryFn: () => apiGet<ReportViewerContentResponse>(`/reports/${reportId}/viewer`),
    enabled: Boolean(reportId),
  });
}

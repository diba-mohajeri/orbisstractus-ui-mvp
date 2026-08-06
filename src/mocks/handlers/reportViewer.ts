import { delay, http, HttpResponse } from 'msw';
import { getReportViewerContent } from '../data/portfolioQueries';

export const reportViewerHandlers = [
  http.get('/api/reports/:id/viewer', async ({ params }) => {
    await delay(350);
    const content = getReportViewerContent(String(params.id));
    if (!content) {
      return HttpResponse.json({ message: 'Report not found' }, { status: 404 });
    }
    return HttpResponse.json(content);
  }),
];
